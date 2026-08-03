// Copyright 2025 Kconfig VSCode Extension Contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ChildProcess } from "child_process";
import { EventEmitter } from "events";
import * as path from "path";
import * as vscode from "vscode";
import * as fs from "fs";
import { Menu, menuType } from "./Menu";
import {
    areMenuValuesEqual,
    normalizeConfigStringValue,
    normalizeHexValue,
    normalizeIntValue,
    normalizeTristateValue
} from "./MenuValueUtils";
import { KconfigMenuLoader } from "./KconfigMenuLoader";
import { createMenuDetailPayload, MenuDetailPayload } from "./MenuTransferSerializer";
import { Logger } from "../logger/logger";
import { VisibilityManager } from "./VisibilityManager";
import { FileWatcher } from "./fileWatcher";
import { KconfigWriter, SymbolAssignment } from "./KconfigWriter";

interface KconfigServerOptions {
    workspaceFolder: vscode.Uri;
    kconfigFile: string;
    configFile?: string;
}

export interface KconfigValue {
    name: string;
    value: string | number | boolean;
    type: menuType;
}

interface MenuStateSnapshot {
    type: menuType;
    value: any;
    isVisible?: boolean;
    isContainerVisible?: boolean;
    isReadonly?: boolean;
    readonlyReason?: string;
    selectedBy?: string[];
    autoSelectedValue?: boolean;
    autoImpliedValue?: 'y' | 'm' | boolean;
}

interface MenuDeltaChange {
    id: string;
    isVisible?: boolean;
    isContainerVisible?: boolean;
    isReadonly?: boolean;
    readonlyReason?: string;
    selectedBy?: string[];
    autoSelectedValue?: boolean;
    autoImpliedValue?: 'y' | 'm' | boolean;
    value?: any;
}

export class KconfigServer extends EventEmitter {
    private static instance: KconfigServer | null = null;
    
    private serverProcess: ChildProcess | null = null;
    private receivedDataBuffer: string = "";
    private kconfigMenus: Menu[] = [];
    private defaultValues: Map<string, any> = new Map();
    private workspaceFolder: vscode.Uri;
    private kconfigFile: string;
    private configFile: string;
    private isRunning: boolean = false;
    private unsavedChanges: boolean = false;
    private visibilityManager: VisibilityManager;
    private kconfigWriter: KconfigWriter;
    private menuIndex: Map<string, Menu> = new Map();
    private menuNameIndex: Map<string, Menu[]> = new Map();
    private choiceParentByChildId: Map<string, Menu> = new Map();
    private menuParentByChildId: Map<string, string | null> = new Map();
    private menuStateCache: Map<string, MenuStateSnapshot> = new Map();
    private defaultSnapshot: Menu[] = [];
    
    constructor(options: KconfigServerOptions) {
        super();
        this.workspaceFolder = options.workspaceFolder;
        this.kconfigFile = options.kconfigFile;

        // If no configFile specified, default to .config in the same directory as the Kconfig file
        if (options.configFile) {
            this.configFile = options.configFile;
        } else {
            const kconfigDir = path.dirname(options.kconfigFile);
            this.configFile = path.join(kconfigDir, ".config");
        }

        this.visibilityManager = new VisibilityManager();
        // Pass the visibility manager's evaluator to the writer so it uses the same context
        this.kconfigWriter = new KconfigWriter(this.defaultValues, this.visibilityManager.getEvaluator());
    }
    
    public static async init(options: KconfigServerOptions): Promise<KconfigServer> {
        if (KconfigServer.instance) {
            KconfigServer.instance.dispose();
        }
        
        KconfigServer.instance = new KconfigServer(options);
        await KconfigServer.instance.start();
        return KconfigServer.instance;
    }
    
    public static getInstance(): KconfigServer | null {
        return KconfigServer.instance;
    }
    
    public async start(): Promise<void> {
        // For now, use a simple implementation that reads Kconfig files directly
        // In the future, this could be replaced with a Python-based Kconfig server
        // using kconfiglib or similar tools
        
        this.isRunning = true;
        
        // Load Kconfig structure using the specific file
        const targetFile = vscode.Uri.file(this.kconfigFile);
        const loader = new KconfigMenuLoader(this.workspaceFolder, targetFile);
        this.kconfigMenus = await loader.loadKconfigMenus();

        // Initialize once without user values so conditional defaults and choice defaults
        // are captured before .config is applied.
        Logger.info(() => `[KCONFIG_SERVER] Initializing visibility manager with ${this.kconfigMenus.length} menus`);
        this.visibilityManager.initialize(this.kconfigMenus);
        this.forceTopLevelMenusVisible(this.kconfigMenus);
        this.captureDefaultSnapshot(this.kconfigMenus);
        this.saveDefaultValues(this.kconfigMenus);
        this.rebuildMenuCaches();

        // Load existing config values if available
        if (fs.existsSync(this.configFile)) {
            await this.loadConfigValues();
            this.visibilityManager.initialize(this.kconfigMenus);
            this.forceTopLevelMenusVisible(this.kconfigMenus);
        }

        this.rebuildMenuCaches();
        Logger.info(() => `[KCONFIG_SERVER] Initialized with ${this.kconfigMenus.length} menus and visibility manager`);
        this.emit("ready", this.kconfigMenus);
    }
    
    public getMenus(): Menu[] {
        return this.kconfigMenus;
    }

    public async reloadFromDisk(): Promise<Menu[]> {
        const loader = new KconfigMenuLoader(this.workspaceFolder, vscode.Uri.file(this.kconfigFile));
        this.kconfigMenus = await loader.loadKconfigMenus();
        this.visibilityManager.initialize(this.kconfigMenus);
        this.forceTopLevelMenusVisible(this.kconfigMenus);
        this.captureDefaultSnapshot(this.kconfigMenus);
        this.saveDefaultValues(this.kconfigMenus);
        this.rebuildMenuCaches();
        if (fs.existsSync(this.configFile)) {
            await this.loadConfigValues();
            this.visibilityManager.initialize(this.kconfigMenus);
            this.forceTopLevelMenusVisible(this.kconfigMenus);
        }
        this.rebuildMenuCaches();
        Logger.info(() => "[KCONFIG_SERVER] Reloaded from disk: " + this.kconfigMenus.length + " menus");
        return this.kconfigMenus;
    }
    
    public getVisibilityManager(): VisibilityManager {
        return this.visibilityManager;
    }
    
    public hasUnsavedChanges(): boolean {
        return this.unsavedChanges;
    }

    public getMenuDetailById(id: string): MenuDetailPayload | null {
        const menu = this.menuIndex.get(id);
        if (!menu) {
            return null;
        }
        const detail = createMenuDetailPayload(menu);
        if (!detail.prompt) {
            detail.prompt = menu.title || menu.name || "";
        }
        if (!detail.effectiveDepExpr && menu.dependsOn && menu.dependsOn.trim() !== "" && menu.dependsOn.trim() !== "y") {
            detail.effectiveDepExpr = menu.dependsOn;
        }
        if (detail.directDepExpr) {
            detail.directDepValue = this.visibilityManager.getEvaluator().evaluate(detail.directDepExpr) ? "met" : "not met";
        }
        if (detail.effectiveDepExpr) {
            detail.effectiveDepValue = this.visibilityManager.getEvaluator().evaluate(detail.effectiveDepExpr) ? "visible" : "hidden";
        }
        if (!detail.menuPath) {
            detail.menuPath = this.buildMenuPath(id);
        }
        detail.selectInfo = detail.selectInfo || this.describeTargets(menu.select, menu.selectConditions);
        detail.selectedByInfo = detail.selectedByInfo || this.describeList(menu.selectedBy);
        detail.implyInfo = detail.implyInfo || this.describeTargets(menu.implies, menu.implyConditions);
        return detail;
    }
    
    public updateValue(updatedMenu: Menu): void {
        this.unsavedChanges = true;

        const targetMenu = this.menuIndex.get(updatedMenu.id);
        if (!targetMenu) {
            return;
        }

        // Validate and clamp numeric-like values against range constraints.
        let newValue = updatedMenu.value;
        if (targetMenu.type === menuType.int) {
            newValue = normalizeIntValue(newValue, targetMenu.range);
        } else if (targetMenu.type === menuType.hex) {
            newValue = normalizeHexValue(newValue, targetMenu.range);
        }

        targetMenu.value = newValue;
        this.kconfigMenus = this.visibilityManager.updateValue(targetMenu.id, newValue);

        const affectedIds = this.visibilityManager.consumeLastAffectedMenuIds();
        const visibilityChanges = this.collectChangesForAffectedMenus(affectedIds);
        if (visibilityChanges.length > 0) {
            this.emit("visibilityChanged", visibilityChanges);
        }
    }
    
    public async saveConfig(): Promise<void> {

        try {
            const assignments: SymbolAssignment[] = this.kconfigWriter.collectAssignments(this.kconfigMenus);

            const headerPath = await this.resolveHeaderPath();

            // 通知 FileWatcher 忽略内部写入导致的变更
            FileWatcher.getInstance()?.ignoreNextChange();

            await this.kconfigWriter.write({
                menus: this.kconfigMenus,
                assignments,
                configOut: this.configFile,
                headerOut: headerPath || undefined,
                configHeader: undefined,
                headerHeader: headerPath ? this.getAutoHeader() : undefined,
                saveOld: true,
            });

            this.unsavedChanges = false;
            this.emit("configSaved");
        } catch (error) {
            Logger.error("Failed to save configuration", error as Error);
            vscode.window.showErrorMessage(`Failed to save configuration: ${error}`);
        }
    }
    
    public async saveDefconfig(filepath?: string): Promise<void> {
        try {
            const assignments = this.kconfigWriter.collectAssignments(this.kconfigMenus);
            const defaultPath = path.join(path.dirname(this.configFile), "defconfig");
            const defconfigPath = filepath || defaultPath;
            await this.kconfigWriter.write({
                menus: this.kconfigMenus,
                assignments,
                defconfigOut: defconfigPath,
                configHeader: undefined,
                saveOld: false,
            });
            vscode.window.showInformationMessage("Default configuration saved to " + defconfigPath);
        } catch (error) {
            Logger.error("Failed to save defconfig", error as Error);
            vscode.window.showErrorMessage("Failed to save defconfig: " + error);
        }
    }

    public exportConfigText(): string {
        const lines: string[] = [];
        const header = this.getConfigHeader();
        if (header) lines.push(header);
        lines.push(...this.kconfigWriter.generateConfigLines(this.kconfigMenus));
        return lines.join("\n") + (lines.length > 0 ? "\n" : "");
    }
    
    public async resetToDefaults(): Promise<void> {
        FileWatcher.getInstance()?.ignoreNextChange();

        if (fs.existsSync(this.configFile)) {
            try {
                await fs.promises.unlink(this.configFile);
            } catch (error) {
                // deletion is best-effort
            }
        }
        
        this.resetMenuValuesToDefaults();

        // After resetting values, recompute visibility/read-only states
        // so that the menu tree reflects the freshly restored defaults.
        this.visibilityManager.initialize(this.kconfigMenus);
        this.forceTopLevelMenusVisible(this.kconfigMenus);
        this.rebuildMenuCaches();

        this.unsavedChanges = true;
        
        // Logger.info("[RESET] Reset to defaults completed");
        this.emit("configReset", this.kconfigMenus);
    }
    
    public async discardChanges(): Promise<void> {
        FileWatcher.getInstance()?.ignoreNextChange();

        // Reset all values to Kconfig defaults (without deleting .config)
        this.resetMenuValuesToDefaults();

        // Then re-apply .config values on top
        if (fs.existsSync(this.configFile)) {
            await this.loadConfigValues();
        }

        this.rebuildMenuCaches();
        this.visibilityManager.initialize(this.kconfigMenus);
        this.forceTopLevelMenusVisible(this.kconfigMenus);
        this.unsavedChanges = false;
        this.emit("changesDiscarded", this.kconfigMenus);
    }

    private resetMenuValuesToDefaults(): void {
        this.kconfigMenus = this.cloneMenus(this.defaultSnapshot);
        this.rebuildMenuCaches();
    }
    
    private async loadConfigValues(): Promise<void> {
        try {
            const configContent = await fs.promises.readFile(this.configFile, "utf8");
            const configLines = configContent.split("\n");

            Logger.info(() => `[LOAD_CONFIG] Reading config file: ${this.configFile}`);
            Logger.info(() => `[LOAD_CONFIG] Total lines in config: ${configLines.length}`);

            let _processedLines = 0;
            let _skippedLines = 0;

            for (const line of configLines) {
                const trimmedLine = line.trim();

                if (!trimmedLine) {
                    _skippedLines++;
                    continue;
                }

                // First handle commented out CONFIG lines: "# CONFIG_NAME is not set"
                if (trimmedLine.startsWith("#")) {
                    const commentMatch = trimmedLine.match(/^#\s*CONFIG_([A-Z0-9_]+)\s+is\s+not\s+set$/);
                    if (commentMatch) {
                        const _configName = commentMatch[1];
                        const updateResult = this.updateIndexedMenuValues(_configName, "n");
                        if (updateResult) {
                            _processedLines++;
                        }
                        continue;
                    }
                    _skippedLines++;
                    continue;
                }

                // Parse CONFIG_NAME=value lines
                const configMatch = trimmedLine.match(/^CONFIG_([A-Z0-9_]+)=(.+)$/);
                if (configMatch) {
                    const _configName = configMatch[1];
                    const configValue = configMatch[2];

                    const updateResult = this.updateIndexedMenuValues(_configName, configValue);
                    if (updateResult) {
                        _processedLines++;
                    }
                    continue;
                }

                _skippedLines++;
            }

            Logger.info(() => `[LOAD_CONFIG] Processed ${_processedLines} config lines, skipped ${_skippedLines} lines`);

        } catch (error) {
            Logger.error("Failed to load config values", error as Error);
        }
    }
    
    private updateMenuValueByName(name: string, value: string): boolean {
        return this.updateIndexedMenuValues(name, value);
    }
    
    private async resolveHeaderPath(): Promise<string | null> {
        const config = vscode.workspace.getConfiguration("imde.guiConfig");
        let headerPath = config.get<string>("autoHeaderPath", "")?.trim() || "";

        if (!headerPath) {
            return null;
        }

        if (!path.isAbsolute(headerPath)) {
            const configDir = path.dirname(this.configFile);
            headerPath = path.join(configDir, headerPath);
        }

        await fs.promises.mkdir(path.dirname(headerPath), { recursive: true });
        return headerPath;
    }

    private getConfigHeader(): string {
        return "#\n# Automatically generated file; DO NOT EDIT.\n#\n\n";
    }

    private getAutoHeader(): string {
        return "/*\n * Automatically generated file; DO NOT EDIT.\n */\n\n";
    }
    
    private saveDefaultValues(menus: Menu[]): void {
        this.defaultValues.clear();
        const saveValues = (menus: Menu[], depth = 0) => {
            for (const menu of menus) {
                if (menu.type !== menuType.menu && menu.name) {
                    this.defaultValues.set(menu.name, menu.value);
                }
                if (menu.children) {
                    saveValues(menu.children, depth + 1);
                }
            }
        };

        saveValues(menus);
    }

    private captureDefaultSnapshot(menus: Menu[]): void {
        this.defaultSnapshot = this.cloneMenus(menus);
    }

    private cloneMenus(menus: Menu[]): Menu[] {
        return JSON.parse(JSON.stringify(menus)) as Menu[];
    }

    /**
     * Find a menu by its symbol name in the current menu tree
     */
    private findMenuByName(name: string): Menu | null {
        const dfs = (menus: Menu[]): Menu | null => {
            for (const m of menus) {
                if (m.name === name) return m;
                if (m.children && m.children.length > 0) {
                    const found = dfs(m.children);
                    if (found) return found;
                }
            }
            return null;
        };
        return dfs(this.kconfigMenus);
    }
    
    /**
     * Format a single config as a C #define statement
     * (deprecated: retained for backward compatibility)
     */

    /**
     * Escapes string for .config file output, matching Kconfiglib behavior
     * Backslashes must be escaped before quotes to avoid double escaping
     */
    private findParentChoice(childName: string): Menu | null {
        const byName = this.menuNameIndex.get(childName) || [];
        for (const target of byName) {
            const parentChoice = this.choiceParentByChildId.get(target.id);
            if (parentChoice) {
                return parentChoice;
            }
        }
        return null;
    }
    
    private rebuildMenuCaches(): void {
        const nextIndex = new Map<string, Menu>();
        const nextNameIndex = new Map<string, Menu[]>();
        const nextChoiceParent = new Map<string, Menu>();
        const nextParentByChildId = new Map<string, string | null>();
        const nextState = new Map<string, MenuStateSnapshot>();
        const stack: Array<{ menu: Menu; parentId: string | null }> =
            this.kconfigMenus.map((menu) => ({ menu, parentId: null }));

        while (stack.length > 0) {
            const current = stack.pop();
            if (!current || !current.menu) {
                continue;
            }
            const menu = current.menu;

            nextIndex.set(menu.id, menu);
            nextParentByChildId.set(menu.id, current.parentId);
            nextState.set(menu.id, this.snapshotMenuState(menu));
            if (menu.name) {
                const siblings = nextNameIndex.get(menu.name) || [];
                siblings.push(menu);
                nextNameIndex.set(menu.name, siblings);
            }
            if (menu.type === menuType.choice && menu.children && menu.children.length > 0) {
                for (const child of menu.children) {
                    nextChoiceParent.set(child.id, menu);
                }
            }

            if (menu.children && menu.children.length > 0) {
                for (let i = 0; i < menu.children.length; i++) {
                    stack.push({
                        menu: menu.children[i],
                        parentId: menu.id,
                    });
                }
            }
        }

        this.menuIndex = nextIndex;
        this.menuNameIndex = nextNameIndex;
        this.choiceParentByChildId = nextChoiceParent;
        this.menuParentByChildId = nextParentByChildId;
        this.menuStateCache = nextState;
    }

    private buildMenuPath(menuId: string): string {
        const segments: string[] = [];
        let parentId = this.menuParentByChildId.get(menuId) ?? null;

        while (parentId) {
            const parent = this.menuIndex.get(parentId);
            if (!parent) {
                break;
            }
            const label = (parent.title || parent.prompt || parent.name || "").trim();
            if (label) {
                segments.unshift(label);
            }
            parentId = this.menuParentByChildId.get(parentId) ?? null;
        }

        if (segments.length === 0) {
            return "(Top)";
        }
        return `(Top) -> ${segments.join(" -> ")}`;
    }

    private describeList(values: string[] | undefined): string | undefined {
        if (!values || values.length === 0) {
            return undefined;
        }
        return values.join(", ");
    }

    private describeTargets(
        values: string[] | undefined,
        conditions?: { [target: string]: string }
    ): string | undefined {
        if (!values || values.length === 0) {
            return undefined;
        }
        return values
            .map((target) => {
                const condition = conditions?.[target];
                return condition ? `${target} if ${condition}` : target;
            })
            .join(", ");
    }

    private updateIndexedMenuValues(name: string, rawValue: string): boolean {
        const targets = this.menuNameIndex.get(name);
        if (!targets || targets.length === 0) {
            return false;
        }

        for (const menu of targets) {
            this.applyConfigValueToMenu(menu, rawValue);
        }
        return true;
    }

    private applyConfigValueToMenu(menu: Menu, rawValue: string): void {
        switch (menu.type) {
            case menuType.bool: {
                menu.value = rawValue === "y";
                menu.isDefaultValue = false;
                const parentChoice = this.choiceParentByChildId.get(menu.id);
                if (parentChoice) {
                    if (menu.value === true) {
                        parentChoice.value = menu.name;
                        parentChoice.isDefaultValue = false;
                        for (const sibling of parentChoice.children || []) {
                            if (sibling.name !== menu.name && sibling.type === menuType.bool) {
                                sibling.value = false;
                                sibling.isDefaultValue = false;
                            }
                        }
                        Logger.info(() => `[LOAD_CONFIG] Set parent choice "${parentChoice.title || parentChoice.name}" <- ${menu.name}`);
                    } else if (parentChoice.value === menu.name) {
                        parentChoice.value = null as any;
                        parentChoice.isDefaultValue = false;
                    }
                }
                return;
            }
            case menuType.tristate: {
                menu.value = normalizeTristateValue(rawValue);
                menu.isDefaultValue = false;
                return;
            }
            case menuType.int:
                menu.value = normalizeIntValue(rawValue, menu.range);
                menu.isDefaultValue = false;
                return;
            case menuType.hex:
                menu.value = normalizeHexValue(rawValue, menu.range);
                menu.isDefaultValue = false;
                return;
            case menuType.string:
                menu.value = normalizeConfigStringValue(rawValue);
                menu.isDefaultValue = false;
                return;
            case menuType.choice:
                menu.value = rawValue === "y" ? menu.name : null;
                menu.isDefaultValue = false;
                return;
            default:
                menu.value = rawValue;
                menu.isDefaultValue = false;
                return;
        }
    }

    private forceTopLevelMenusVisible(menus: Menu[]): void {
        menus.forEach((menu) => {
            if (menu.type === menuType.menu && menu.hasPrompt && (!menu.dependsOn || menu.dependsOn.trim() === "")) {
                menu.isVisible = true;
                (menu as any).isContainerVisible = true;
            }
            if (menu.children && menu.children.length > 0) {
                this.forceTopLevelMenusVisible(menu.children);
            }
        });
    }

    private snapshotMenuState(menu: Menu): MenuStateSnapshot {
        return {
            type: menu.type,
            value: menu.value,
            isVisible: menu.isVisible,
            isContainerVisible: (menu as any).isContainerVisible,
            isReadonly: menu.isReadonly,
            readonlyReason: menu.readonlyReason,
            selectedBy: menu.selectedBy ? [...menu.selectedBy] : undefined,
            autoSelectedValue: menu.autoSelectedValue,
            autoImpliedValue: menu.autoImpliedValue,
        };
    }

    private collectChangesForAffectedMenus(affectedIds: Iterable<string>): MenuDeltaChange[] {
        const visibilityChanges: MenuDeltaChange[] = [];

        for (const id of affectedIds) {
            const menu = this.menuIndex.get(id);
            if (!menu) {
                continue;
            }

            const before = this.menuStateCache.get(id);
            const current = this.snapshotMenuState(menu);

            const valueDiff = !before || !this.areMenuValuesEqual(before.value, current.value, current.type);
            const visibilityDiff = !before || (
                before.isVisible !== current.isVisible ||
                before.isContainerVisible !== current.isContainerVisible ||
                before.isReadonly !== current.isReadonly ||
                before.readonlyReason !== current.readonlyReason ||
                this.arrayChanged(before.selectedBy, current.selectedBy) ||
                before.autoSelectedValue !== current.autoSelectedValue ||
                before.autoImpliedValue !== current.autoImpliedValue
            );

            if (!before || visibilityDiff || valueDiff) {
                visibilityChanges.push({
                    id: menu.id,
                    isVisible: current.isVisible,
                    isContainerVisible: current.isContainerVisible,
                    isReadonly: current.isReadonly,
                    readonlyReason: current.readonlyReason,
                    selectedBy: current.selectedBy ? [...current.selectedBy] : undefined,
                    autoSelectedValue: current.autoSelectedValue,
                    autoImpliedValue: current.autoImpliedValue,
                    value: valueDiff || !before ? menu.value : undefined
                });
            }

            this.menuStateCache.set(id, current);
        }

        return visibilityChanges;
    }

    private areMenuValuesEqual(previous: any, current: any, type: menuType): boolean {
        return areMenuValuesEqual(previous, current, type);
    }

    private arrayChanged(a?: string[], b?: string[]): boolean {
        if (!a && !b) {
            return false;
        }
        if (!a || !b) {
            return true;
        }
        if (a.length !== b.length) {
            return true;
        }
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return true;
            }
        }
        return false;
    }

    public dispose(): void {
        if (this.serverProcess) {
            this.serverProcess.kill();
            this.serverProcess = null;
        }
        this.isRunning = false;
        this.removeAllListeners();
        
        if (KconfigServer.instance === this) {
            KconfigServer.instance = null;
        }
    }
}
