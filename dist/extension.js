/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/artifactsTree.ts"
/*!******************************!*\
  !*** ./src/artifactsTree.ts ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ArtifactTreeItem: () => (/* binding */ ArtifactTreeItem),
/* harmony export */   ArtifactsTreeProvider: () => (/* binding */ ArtifactsTreeProvider)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);

class ArtifactTreeItem extends vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItem {
    artifactPath;
    constructor(label, artifactPath, exists, size) {
        super(label);
        this.artifactPath = artifactPath;
        this.description = exists ? size : "not built";
        this.iconPath = new vscode__WEBPACK_IMPORTED_MODULE_0__.ThemeIcon(exists ? "file" : "circle-slash");
        this.tooltip = artifactPath;
        if (exists) {
            this.command = { command: "vscode.open", title: "Open", arguments: [vscode__WEBPACK_IMPORTED_MODULE_0__.Uri.file(artifactPath)] };
            this.contextValue = label.endsWith(".map") ? "imdeMapArtifact" : "imdeArtifact";
        }
    }
}
class ArtifactsTreeProvider {
    runner;
    _onDidChange = new vscode__WEBPACK_IMPORTED_MODULE_0__.EventEmitter();
    onDidChangeTreeData = this._onDidChange.event;
    cached = [];
    constructor(runner) {
        this.runner = runner;
        this.refresh();
    }
    refresh() {
        this._fetch().then(items => {
            this.cached = items;
            this._onDidChange.fire();
        });
    }
    getTreeItem(element) { return element; }
    getChildren() { return this.cached; }
    async _fetch() {
        const data = await this.runner.captureJson("artifacts");
        if (!data?.artifacts) {
            const ti = new vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItem("No artifacts available");
            ti.iconPath = new vscode__WEBPACK_IMPORTED_MODULE_0__.ThemeIcon("warning");
            ti.description = "build first";
            return [ti];
        }
        return Object.entries(data.artifacts).map(([key, meta]) => {
            const exists = meta.exists;
            const size = meta.size ? `${(meta.size / 1024).toFixed(1)} KB` : "";
            return new ArtifactTreeItem(key, meta.path, exists, size);
        });
    }
}


/***/ },

/***/ "./src/buildTree.ts"
/*!**************************!*\
  !*** ./src/buildTree.ts ***!
  \**************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BuildTreeProvider: () => (/* binding */ BuildTreeProvider)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);

class BuildTreeProvider {
    runner;
    _onDidChange = new vscode__WEBPACK_IMPORTED_MODULE_0__.EventEmitter();
    onDidChangeTreeData = this._onDidChange.event;
    loading = false;
    constructor(runner) {
        this.runner = runner;
    }
    refresh() { this._onDidChange.fire(); }
    getTreeItem(element) { return element; }
    async getChildren() {
        const items = [];
        this.loading = true;
        // Status line — loaded once from captureJson
        const data = await this.runner.captureJson("status");
        this.loading = false;
        if (data) {
            const state = data.state || "unknown";
            const ok = state.startsWith("matched") && data.buildConfigured;
            const statusItem = new vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItem(`Status: ${state}`, vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItemCollapsibleState.None);
            statusItem.iconPath = new vscode__WEBPACK_IMPORTED_MODULE_0__.ThemeIcon(ok ? "pass" : "warning");
            statusItem.description = data.buildConfigured ? "configured" : "not configured";
            items.push(statusItem);
            if (data.defconfig) {
                const defconfig = new vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItem(`Defconfig: ${data.defconfig}`, vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItemCollapsibleState.None);
                defconfig.iconPath = new vscode__WEBPACK_IMPORTED_MODULE_0__.ThemeIcon("symbol-file");
                items.push(defconfig);
            }
        }
        else {
            const failed = new vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItem("Status unavailable", vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItemCollapsibleState.None);
            failed.iconPath = new vscode__WEBPACK_IMPORTED_MODULE_0__.ThemeIcon(this.loading ? "loading~spin" : "warning");
            failed.description = "run doctor";
            failed.command = { command: "imde.doctor", title: "Run Doctor" };
            items.push(failed);
        }
        // ---- Action buttons (command-linked tree items) ----
        const mkBtn = (label, cmd, icon, desc) => {
            const ti = new vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItem(label, vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItemCollapsibleState.None);
            ti.command = { command: cmd, title: label };
            ti.iconPath = new vscode__WEBPACK_IMPORTED_MODULE_0__.ThemeIcon(icon);
            ti.description = desc;
            return ti;
        };
        items.push(mkBtn("Build", "imde.build", "play"));
        items.push(mkBtn("Configure", "imde.configure", "settings-gear"));
        items.push(mkBtn("Select Defconfig", "imde.selectDefconfig", "list-selection"));
        items.push(mkBtn("GUI Config", "imde.guiConfig", "settings"));
        items.push(mkBtn("Save Config", "imde.saveDefconfig", "save"));
        items.push(mkBtn("Clean", "imde.clean", "trash"));
        items.push(mkBtn("Full Clean", "imde.fullclean", "warning"));
        return items;
    }
}


/***/ },

/***/ "./src/defconfig.ts"
/*!**************************!*\
  !*** ./src/defconfig.ts ***!
  \**************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   saveDefconfig: () => (/* binding */ saveDefconfig),
/* harmony export */   selectDefconfig: () => (/* binding */ selectDefconfig)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);

const RECENT_DEFCONFIGS_KEY = "imde.recentDefconfigs";
const MAX_RECENT = 5;
async function selectDefconfig(runner, context, after) {
    const output = await runner.captureJson("list-defconfigs");
    if (!output?.defconfigs?.length) {
        vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage("No defconfigs found");
        return;
    }
    const recent = context?.workspaceState.get(RECENT_DEFCONFIGS_KEY) || [];
    const recentSet = new Set(recent);
    const allItems = output.defconfigs.map((d) => ({
        label: d.token, token: d.token,
        description: d.relativePath,
        detail: d.boardFamily ? `Board: ${d.boardFamily}` : undefined,
    }));
    allItems.sort((a, b) => {
        const aR = recentSet.has(a.token), bR = recentSet.has(b.token);
        if (aR && !bR)
            return -1;
        if (!aR && bR)
            return 1;
        return a.label.localeCompare(b.label);
    });
    for (const item of allItems) {
        if (recentSet.has(item.token)) {
            item.description = `$(history) ${item.description || ""}`.trim();
        }
    }
    const picked = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showQuickPick(allItems, {
        placeHolder: "Select a defconfig...",
    });
    if (!picked)
        return;
    const result = await runner.runCommand("use-defconfig", ["--reconfigure", picked.token], {
        progressTitle: `Using ${picked.token}`, streamOutput: true,
    });
    if (result.code === 0 && !result.timedOut) {
        if (context) {
            const updated = [picked.token, ...recent.filter((r) => r !== picked.token)].slice(0, MAX_RECENT);
            await context.workspaceState.update(RECENT_DEFCONFIGS_KEY, updated);
        }
        after?.();
    }
}
async function saveDefconfig(runner) {
    // Show existing defconfigs as reference with autocomplete through QuickPick search
    const existing = await runner.captureJson("list-defconfigs");
    const items = (existing?.defconfigs || []).map(d => ({
        label: d.token,
        description: d.relativePath || "config/" + d.token + "_defconfig",
        detail: "$(history) Click to reuse name",
    }));
    items.unshift({
        label: "$(add) New defconfig…",
        description: "Type a new defconfig name",
        detail: "Will be saved as config/<name>_defconfig",
    });
    const picked = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showQuickPick(items, {
        placeHolder: "Save current config as defconfig…",
        matchOnDescription: true,
    });
    if (!picked)
        return;
    let name;
    if (picked.label.startsWith("$(add)")) {
        name = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showInputBox({
            prompt: "Defconfig name (without _defconfig suffix) — saved to config/",
            placeHolder: "myboard → config/myboard_defconfig",
            validateInput: (v) => {
                if (!v.trim())
                    return "Name is required";
                if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(v.trim()))
                    return "Use letters, numbers, underscores, or dashes";
                return undefined;
            },
        });
    }
    else {
        name = picked.label;
    }
    if (!name?.trim())
        return;
    await runner.runCommand("save-defconfig", [name.trim()], {
        progressTitle: `Saving ${name.trim()}_defconfig`, streamOutput: true,
    });
}


/***/ },

/***/ "./src/diagnostics.ts"
/*!****************************!*\
  !*** ./src/diagnostics.ts ***!
  \****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BuildErrorParser: () => (/* binding */ BuildErrorParser),
/* harmony export */   ImdeDiagnostics: () => (/* binding */ ImdeDiagnostics)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);

/**
 * Parses GCC/Ninja/CMake build output into structured diagnostics.
 */
class BuildErrorParser {
    // GCC/Clang: file:line:col: error/warning/fatal error: message
    static GCC_ERROR = /^(.+?):(\d+):(\d+):\s+(fatal |)(error|warning):\s+(.+)$/;
    // GCC note (follows error): file:line:col: note: message
    static GCC_NOTE = /^(.+?):(\d+):(\d+):\s+note:\s+(.+)$/;
    // CMake: CMake Error/Warning at file:line
    static CMAKE_ERROR = /^\s*CMake (Error|Warning) at (.+?):(\d+)/;
    // Ninja: FAILED: target
    static NINJA_ERROR = /^FAILED:\s+(.+)$/;
    // Linker/file.o:line: error: message
    static LD_ERROR = /^(.+?):(\d+):\s+(error|warning):\s+(.+)$/;
    // Python traceback: File "path", line N, in ...
    static PYTHON_ERROR = /^\s*File\s+"(.+?)",\s+line\s+(\d+)/;
    // Python Exception/Error (last line of traceback)
    static PYTHON_EXC = /^(\w+(?:Error|Exception|Warning)):\s*(.+)$/;
    // Generic: [ERROR] or ERROR: at start
    static GENERIC_ERROR = /^\s*(?:\[ERROR\]|ERROR:)\s+(.+)$/;
    // Compiler driver: cc1.exe / cc1: fatal error: message
    static CC1_ERROR = /^(cc1(?:\.exe)?):\s+(fatal error|error):\s+(.+)$/i;
    // Tool: fatal error: file: message
    static TOOL_FATAL = /^(.+?):\s+fatal error:\s*(.+)$/i;
    // Shell: command not found, permission denied, etc.
    static SHELL_ERROR = /^(.+?):\s+(command not found|No such file|Permission denied|EACCES|ENOENT)/i;
    // Make-style: *** [target] Error N
    static MAKE_ERROR = /^\*\*\*\s+\[(.+?)\]\s+Error\s+\d+/;
    // Generic colon error: file:line: error
    static COLON_ERROR = /^(.+?):(\d+):\s+(error|fatal):\s*(.+)$/i;
    // Ninja build stop
    static NINJA_STOP = /^ninja:\s+build\s+stopped/;
    static LINE_LIMIT = 500;
    static stripAnsi(text) {
        // eslint-disable-next-line no-control-regex
        return text.replace(/\x1b\[[0-9;]*m/g, "");
    }
    // Strip unicode symbols (✗ ⚠ ✘ ✔ ● etc.) that IMDE prefixes error lines with
    static SYMBOL_PREFIX = /^[\s\u{2700}-\u{27BF}\u{2600}-\u{26FF}\u{2000}-\u{206F}\u{0080}-\u{00FF}●◆★▪▸-]+/u;
    static parse(output, workspaceRoot) {
        const clean = BuildErrorParser.stripAnsi(output);
        const lines = clean.split("\n").slice(0, BuildErrorParser.LINE_LIMIT);
        const errors = [];
        for (const line of lines) {
            let trimmed = line.trim();
            if (!trimmed)
                continue;
            // Strip leading symbols that IMDE prefixes (✗ error, ⚠ warning, etc.)
            trimmed = trimmed.replace(BuildErrorParser.SYMBOL_PREFIX, "").trim();
            if (!trimmed)
                continue;
            // GCC/Clang: file:line:col: error/warning/fatal error: msg
            let m = BuildErrorParser.GCC_ERROR.exec(trimmed);
            if (m) {
                errors.push({
                    file: BuildErrorParser.resolvePath(m[1], workspaceRoot),
                    line: parseInt(m[2], 10) - 1,
                    col: parseInt(m[3], 10) - 1,
                    severity: m[5] === "error" || m[4].includes("fatal")
                        ? vscode__WEBPACK_IMPORTED_MODULE_0__.DiagnosticSeverity.Error : vscode__WEBPACK_IMPORTED_MODULE_0__.DiagnosticSeverity.Warning,
                    message: m[6].trim(), raw: trimmed,
                });
                continue;
            }
            // cc1.exe: fatal error: D:/path/to/file.c: message
            m = BuildErrorParser.CC1_ERROR.exec(trimmed);
            if (m) {
                const msg = m[3];
                // Try to extract a file path from the message
                const fileMatch = msg.match(/^([A-Za-z]:[^\s:]+|\/[^\s:]+)/);
                errors.push({
                    file: fileMatch ? BuildErrorParser.resolvePath(fileMatch[1], workspaceRoot) : "",
                    line: 0, col: 0,
                    severity: vscode__WEBPACK_IMPORTED_MODULE_0__.DiagnosticSeverity.Error,
                    message: msg, raw: trimmed,
                });
                continue;
            }
            // tool: fatal error: message  (e.g. riscv-gcc.exe: fatal error: ...)
            m = BuildErrorParser.TOOL_FATAL.exec(trimmed);
            if (m && m[1] !== "ninja") {
                errors.push({
                    file: "", line: 0, col: 0,
                    severity: vscode__WEBPACK_IMPORTED_MODULE_0__.DiagnosticSeverity.Error,
                    message: m[2].trim(), raw: trimmed,
                });
                continue;
            }
            // Python: File "x.py", line N
            m = BuildErrorParser.PYTHON_ERROR.exec(trimmed);
            if (m) {
                errors.push({
                    file: BuildErrorParser.resolvePath(m[1], workspaceRoot),
                    line: parseInt(m[2], 10) - 1, col: 0,
                    severity: vscode__WEBPACK_IMPORTED_MODULE_0__.DiagnosticSeverity.Error,
                    message: trimmed, raw: trimmed,
                });
                continue;
            }
            // CMake: CMake Error/Warning at file:line
            m = BuildErrorParser.CMAKE_ERROR.exec(trimmed);
            if (m) {
                errors.push({
                    file: BuildErrorParser.resolvePath(m[2], workspaceRoot),
                    line: parseInt(m[3], 10) - 1, col: 0,
                    severity: m[1] === "Error" ? vscode__WEBPACK_IMPORTED_MODULE_0__.DiagnosticSeverity.Error : vscode__WEBPACK_IMPORTED_MODULE_0__.DiagnosticSeverity.Warning,
                    message: trimmed, raw: trimmed,
                });
                continue;
            }
            // Colon error: file:line: error: msg (generic)
            m = BuildErrorParser.COLON_ERROR.exec(trimmed);
            if (m && !trimmed.match(/\.o:\d+:/) /* skip linker .o refs */) {
                errors.push({
                    file: BuildErrorParser.resolvePath(m[1], workspaceRoot),
                    line: parseInt(m[2], 10) - 1, col: 0,
                    severity: vscode__WEBPACK_IMPORTED_MODULE_0__.DiagnosticSeverity.Error,
                    message: m[4].trim(), raw: trimmed,
                });
                continue;
            }
            // Make: *** [target] Error N
            if (BuildErrorParser.MAKE_ERROR.test(trimmed)) {
                errors.push({
                    file: "", line: 0, col: 0,
                    severity: vscode__WEBPACK_IMPORTED_MODULE_0__.DiagnosticSeverity.Error,
                    message: trimmed, raw: trimmed,
                });
                continue;
            }
            // Ninja: build stopped
            if (BuildErrorParser.NINJA_STOP.test(trimmed)) {
                errors.push({
                    file: "", line: 0, col: 0,
                    severity: vscode__WEBPACK_IMPORTED_MODULE_0__.DiagnosticSeverity.Error,
                    message: trimmed, raw: trimmed,
                });
                continue;
            }
            // Ninja: FAILED: target
            if (BuildErrorParser.NINJA_ERROR.test(trimmed)) {
                errors.push({
                    file: "", line: 0, col: 0,
                    severity: vscode__WEBPACK_IMPORTED_MODULE_0__.DiagnosticSeverity.Error,
                    message: trimmed, raw: trimmed,
                });
                continue;
            }
            // Python exception (last traceback line)
            m = BuildErrorParser.PYTHON_EXC.exec(trimmed);
            if (m && !trimmed.includes("build succeeded") && !trimmed.includes("removed")) {
                errors.push({
                    file: "", line: 0, col: 0,
                    severity: m[1].includes("Warning") ? vscode__WEBPACK_IMPORTED_MODULE_0__.DiagnosticSeverity.Warning : vscode__WEBPACK_IMPORTED_MODULE_0__.DiagnosticSeverity.Error,
                    message: `${m[1]}: ${m[2]}`, raw: trimmed,
                });
                continue;
            }
            // Shell/system errors
            m = BuildErrorParser.SHELL_ERROR.exec(trimmed);
            if (m) {
                errors.push({
                    file: "", line: 0, col: 0,
                    severity: vscode__WEBPACK_IMPORTED_MODULE_0__.DiagnosticSeverity.Error,
                    message: trimmed, raw: trimmed,
                });
                continue;
            }
            // Generic ERROR tag
            m = BuildErrorParser.GENERIC_ERROR.exec(trimmed);
            if (m) {
                errors.push({
                    file: "", line: 0, col: 0,
                    severity: vscode__WEBPACK_IMPORTED_MODULE_0__.DiagnosticSeverity.Error,
                    message: m[1], raw: trimmed,
                });
            }
        }
        return errors;
    }
    static resolvePath(filePath, root) {
        if (filePath.startsWith("/") || /^[A-Za-z]:[\\/]/.test(filePath)) {
            return filePath;
        }
        // Resolve relative to workspace root
        const { resolve } = __webpack_require__(/*! path */ "path");
        return resolve(root, filePath);
    }
}
/**
 * Manages a DiagnosticCollection for IMDE build errors,
 * feeding the VS Code Problems panel.
 */
class ImdeDiagnostics {
    collection;
    workspaceRoot;
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this.collection = vscode__WEBPACK_IMPORTED_MODULE_0__.languages.createDiagnosticCollection("imde-build");
    }
    dispose() {
        this.collection.dispose();
    }
    /** Clear all previous diagnostics. */
    clear() {
        this.collection.clear();
    }
    /** Parse output and populate Problems panel. Returns error count. */
    report(output) {
        const errors = BuildErrorParser.parse(output, this.workspaceRoot);
        const byFile = new Map();
        for (const e of errors) {
            const diag = new vscode__WEBPACK_IMPORTED_MODULE_0__.Diagnostic(new vscode__WEBPACK_IMPORTED_MODULE_0__.Range(e.line, e.col, e.line, e.col + 1), e.message, e.severity);
            diag.source = "IMDE Build";
            const list = byFile.get(e.file) || [];
            list.push(diag);
            byFile.set(e.file, list);
        }
        this.collection.clear();
        for (const [file, diags] of byFile) {
            this.collection.set(vscode__WEBPACK_IMPORTED_MODULE_0__.Uri.file(file), diags);
        }
        return errors.length;
    }
}


/***/ },

/***/ "./src/doctorTree.ts"
/*!***************************!*\
  !*** ./src/doctorTree.ts ***!
  \***************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DoctorTreeProvider: () => (/* binding */ DoctorTreeProvider)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);

class DoctorTreeProvider {
    runner;
    _onDidChange = new vscode__WEBPACK_IMPORTED_MODULE_0__.EventEmitter();
    onDidChangeTreeData = this._onDidChange.event;
    cached = [];
    lastRefresh = 0;
    refreshTimer;
    loading = false;
    constructor(runner) {
        this.runner = runner;
        this.refresh();
    }
    refresh(force = false) {
        const now = Date.now();
        if (!force && now - this.lastRefresh < 10000) {
            // Throttled: show loading immediately, defer actual refresh
            if (!this.refreshTimer) {
                this.loading = true;
                this._onDidChange.fire();
                this.refreshTimer = setTimeout(() => {
                    this.refreshTimer = undefined;
                    this._doRefresh();
                }, 10000 - (now - this.lastRefresh));
            }
            return;
        }
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = undefined;
        }
        this._doRefresh();
    }
    _doRefresh() {
        this.loading = true;
        this._onDidChange.fire();
        this.lastRefresh = Date.now();
        this._fetch().then(items => {
            this.cached = items;
            this.loading = false;
            this._onDidChange.fire();
        });
    }
    getTreeItem(element) { return element; }
    getChildren() {
        if (this.loading) {
            const ti = new vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItem("Refreshing environment...");
            ti.iconPath = new vscode__WEBPACK_IMPORTED_MODULE_0__.ThemeIcon("loading~spin");
            return [ti];
        }
        return this.cached;
    }
    async _fetch() {
        const data = await this.runner.captureJson("doctor");
        if (!data?.checks)
            return [this._error("Failed to run doctor")];
        const c = data.checks;
        const items = [];
        // Python
        items.push(this._check("Python", true, c.python?.version, c.python?.path));
        // CMake
        items.push(this._check("CMake", c.cmake?.ok || false, this._ver(c.cmake?.version), c.cmake?.path));
        // Ninja
        items.push(this._check("Ninja", c.ninja?.ok || false, "", c.ninja?.path));
        // Toolchain
        items.push(this._check("Toolchain", c.toolchain?.ok || false, c.toolchain?.installedVersion, c.toolchain?.root));
        // Menuconfig
        items.push(this._check("Menuconfig", c.menuconfig?.ok || false, "", c.menuconfig?.path));
        return items;
    }
    _check(label, ok, detail, tooltip) {
        const ti = new vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItem(label);
        ti.iconPath = new vscode__WEBPACK_IMPORTED_MODULE_0__.ThemeIcon(ok ? "pass" : "error");
        ti.description = detail || (ok ? "OK" : "FAIL");
        ti.tooltip = tooltip || label;
        return ti;
    }
    _ver(raw) {
        if (!raw)
            return "";
        const parts = raw.split(" ");
        return parts[parts.length - 1] || raw;
    }
    _error(msg) {
        const ti = new vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItem(msg);
        ti.iconPath = new vscode__WEBPACK_IMPORTED_MODULE_0__.ThemeIcon("warning");
        return ti;
    }
}


/***/ },

/***/ "./src/i18n/index.ts"
/*!***************************!*\
  !*** ./src/i18n/index.ts ***!
  \***************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Language: () => (/* binding */ Language),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   getCurrentLanguage: () => (/* binding */ getCurrentLanguage),
/* harmony export */   t: () => (/* binding */ t)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// i18n 国际化支持

// 支持的语言
var Language;
(function (Language) {
    Language["ZH_CN"] = "zh-cn";
    Language["EN_US"] = "en-us"; // eslint-disable-line no-unused-vars
})(Language || (Language = {}));
// 中文文本
const zhCN = {
    'common.confirm': '确定',
    'common.cancel': '取消',
    'reset.confirmTitle': '确认重置配置',
    'reset.confirmMessage': '您确定要将所有配置重置为 Kconfig 默认值吗？这将删除当前的 .config 文件并恢复所有配置项到默认状态。此操作无法撤销。',
    'reset.confirmButton': '确认重置',
    'reset.cancelButton': '取消',
    'reset.progress.title': '正在重置配置',
    'reset.progress.clearing': '删除配置文件并恢复默认值',
    'reset.progress.loading': '重新加载配置',
    'reset.progress.complete': '重置完成',
    'reset.success': '配置已成功重置为默认值',
    'reset.failed': '重置失败',
    'discard.confirmTitle': '确认丢弃更改',
    'discard.confirmMessage': '您确定要丢弃所有未保存的更改吗？此操作无法撤销。',
    'discard.success': '已成功丢弃所有未保存的更改',
    'discard.failed': '丢弃更改失败',
    'save.success': '配置已成功保存',
    'save.failed': '保存配置失败',
    'close.unsavedTitle': '未保存的更改',
    'close.unsavedMessage': '配置编辑器中有未保存的更改，是否要在关闭前保存？',
    'close.saveButton': '是',
    'close.noSaveButton': '否',
    'close.saveSuccess': '配置已保存',
    'close.saveFailed': '保存失败，将继续关闭'
};
// 英文文本
const enUS = {
    'common.confirm': 'Confirm',
    'common.cancel': 'Cancel',
    'reset.confirmTitle': 'Confirm Reset Configuration',
    'reset.confirmMessage': 'Are you sure you want to reset all configurations to Kconfig default values? This will delete the current .config file and restore all configuration items to their default state. This action cannot be undone.',
    'reset.confirmButton': 'Confirm Reset',
    'reset.cancelButton': 'Cancel',
    'reset.progress.title': 'Resetting Configuration',
    'reset.progress.clearing': 'Deleting configuration file and restoring defaults',
    'reset.progress.loading': 'Reloading configuration',
    'reset.progress.complete': 'Reset Complete',
    'reset.success': 'Configuration successfully reset to default values',
    'reset.failed': 'Reset Failed',
    'discard.confirmTitle': 'Confirm Discard Changes',
    'discard.confirmMessage': 'Are you sure you want to discard all unsaved changes? This action cannot be undone.',
    'discard.success': 'Successfully discarded all unsaved changes',
    'discard.failed': 'Failed to discard changes',
    'save.success': 'Configuration saved successfully',
    'save.failed': 'Failed to save configuration',
    'close.unsavedTitle': 'Unsaved Changes',
    'close.unsavedMessage': 'There are unsaved changes in the configuration editor. Do you want to save before closing?',
    'close.saveButton': 'Yes',
    'close.noSaveButton': 'No',
    'close.saveSuccess': 'Configuration saved',
    'close.saveFailed': 'Save failed, will continue closing'
};
// 语言包映射
const languagePacks = {
    [Language.ZH_CN]: zhCN,
    [Language.EN_US]: enUS
};
// 获取当前语言
function getCurrentLanguage() {
    const locale = vscode__WEBPACK_IMPORTED_MODULE_0__.env.language.toLowerCase();
    if (locale.startsWith('zh')) {
        return Language.ZH_CN;
    }
    return Language.EN_US;
}
// 获取文本
function t(key) {
    const currentLanguage = getCurrentLanguage();
    const languagePack = languagePacks[currentLanguage];
    return languagePack[key] || key;
}
// 导出默认翻译函数
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (t);


/***/ },

/***/ "./src/imdeRunner.ts"
/*!***************************!*\
  !*** ./src/imdeRunner.ts ***!
  \***************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ImdeRunner: () => (/* binding */ ImdeRunner)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var child_process__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! child_process */ "child_process");
/* harmony import */ var child_process__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(child_process__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_3__);




class ImdeRunner {
    terminal;
    output = vscode__WEBPACK_IMPORTED_MODULE_0__.window.createOutputChannel("IMDE");
    static loginEnvCache = null;
    dispose() {
        this.output.dispose();
    }
    static warmupEnv() { ImdeRunner.resolveLoginEnv(true); }
    static resolveLoginEnv(force = false) {
        if (ImdeRunner.loginEnvCache && !force) {
            return ImdeRunner.loginEnvCache;
        }
        if (process.platform === "win32") {
            ImdeRunner.loginEnvCache = { ...process.env };
            return ImdeRunner.loginEnvCache;
        }
        return ImdeRunner.captureShellEnv();
    }
    static captureShellEnv() {
        const merged = { ...process.env };
        if (process.platform === "win32") {
            return merged;
        }
        const shell = process.env.SHELL || "/bin/bash";
        const login = child_process__WEBPACK_IMPORTED_MODULE_1__.spawnSync(shell, ["-l", "-c", "echo __PATH__:$PATH"], {
            encoding: "utf8", timeout: 3000,
        });
        if (login.status === 0 && login.stdout) {
            const m = login.stdout.match(/__PATH__:(.+)/);
            if (m) {
                merged.PATH = m[1];
            }
        }
        const interactive = child_process__WEBPACK_IMPORTED_MODULE_1__.spawnSync(shell, ["-i", "-c", "echo __PATH__:$PATH"], {
            encoding: "utf8", timeout: 5000, stdio: ["ignore", "pipe", "pipe"],
        });
        if (interactive.status === 0 && interactive.stdout) {
            const m = interactive.stdout.match(/__PATH__:(.+)/);
            if (m) {
                merged.PATH = m[1];
            }
        }
        ImdeRunner.loginEnvCache = merged;
        return merged;
    }
    getProjectDir() {
        const cfg = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration("imde");
        const configured = cfg.get("projectDir")?.trim();
        if (configured) {
            return path__WEBPACK_IMPORTED_MODULE_2__.resolve(configured);
        }
        const ws = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders;
        if (!ws?.length) {
            return process.cwd();
        }
        let dir = ws[0].uri.fsPath;
        while (dir !== path__WEBPACK_IMPORTED_MODULE_2__.dirname(dir)) {
            if (fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(path__WEBPACK_IMPORTED_MODULE_2__.join(dir, "imde.json"))) {
                return dir;
            }
            dir = path__WEBPACK_IMPORTED_MODULE_2__.dirname(dir);
        }
        return ws[0].uri.fsPath;
    }
    showOutput() {
        this.output.show(true);
    }
    log(message) {
        this.output.appendLine(`[${new Date().toLocaleTimeString()}] ${message}`);
    }
    /** Find the Python executable to use (bundled or system). */
    python() {
        const proj = this.getProjectDir();
        const platformDir = process.platform === "win32" ? "windows" :
            process.platform === "linux" ? "linux" : "macos";
        const bundled = path__WEBPACK_IMPORTED_MODULE_2__.join(proj, "tools", "python", platformDir, platformDir === "windows" ? "python.exe" : "bin/python3");
        if (fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(bundled)) {
            return bundled;
        }
        // Use login env for PATH — critical for WSL / custom Python installs
        const env = ImdeRunner.resolveLoginEnv();
        for (const name of platformDir === "windows" ? ["python", "python3"] : ["python3", "python"]) {
            const result = child_process__WEBPACK_IMPORTED_MODULE_1__.spawnSync(name, ["--version"], { env });
            if (result.status === 0)
                return name;
        }
        return null;
    }
    imdePy() {
        return path__WEBPACK_IMPORTED_MODULE_2__.join(this.getProjectDir(), "tools", "imde", "imde.py");
    }
    imdeBin() {
        const proj = this.getProjectDir();
        const candidates = process.platform === "win32"
            ? ["tools/imde/bin/imde.cmd", "tools/imde/bin/imde.bat"]
            : ["tools/imde/bin/imde"];
        for (const rel of candidates) {
            const bin = path__WEBPACK_IMPORTED_MODULE_2__.join(proj, rel);
            if (fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(bin)) {
                return bin;
            }
        }
        return null;
    }
    spawnImdeBin(bin, args) {
        if (process.platform === "win32") {
            return { exe: bin, args };
        }
        try {
            if ((fs__WEBPACK_IMPORTED_MODULE_3__.statSync(bin).mode & 0o111) === 0) {
                return { exe: "/bin/sh", args: [bin, ...args] };
            }
        }
        catch { /* fall through */ }
        return { exe: bin, args };
    }
    /** Run IMDE in the shared terminal. Use this for interactive commands. */
    runTerminal(cmd, args = [], opts) {
        const proj = this.getProjectDir();
        const imdeBin = this.imdeBin();
        const cfg = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration("imde");
        const termName = cfg.get("terminalName") || "IMDE";
        if (!this.terminal || this.terminal.exitStatus !== undefined) {
            const existing = vscode__WEBPACK_IMPORTED_MODULE_0__.window.terminals.find(t => t.name === termName);
            if (existing) {
                this.terminal = existing;
            }
            else {
                this.terminal = vscode__WEBPACK_IMPORTED_MODULE_0__.window.createTerminal({
                    name: termName,
                    cwd: proj,
                });
            }
        }
        let tokens;
        if (imdeBin) {
            let hasX = false;
            try {
                hasX = (fs__WEBPACK_IMPORTED_MODULE_3__.statSync(imdeBin).mode & 0o111) !== 0;
            }
            catch { }
            if (process.platform !== "win32" && !hasX) {
                tokens = ["sh", imdeBin, cmd, ...args];
            }
            else {
                tokens = [imdeBin, cmd, ...args];
            }
        }
        else {
            const py = this.python();
            if (!py) {
                vscode__WEBPACK_IMPORTED_MODULE_0__.window.showErrorMessage("Python not found");
                return;
            }
            const imde = this.imdePy();
            if (!fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(imde)) {
                vscode__WEBPACK_IMPORTED_MODULE_0__.window.showErrorMessage(`IMDE CLI not found: ${imde}`);
                return;
            }
            tokens = [py, imde, "--project-dir", proj, cmd, ...args];
        }
        this.terminal.sendText(this.formatTerminalCommand(tokens));
        if (opts?.show) {
            this.terminal.show(true);
        }
    }
    run(cmd, args = [], opts) {
        this.runTerminal(cmd, args, opts);
    }
    async runCommand(cmd, args = [], opts = {}) {
        const run = () => this.execute(cmd, args, {
            json: false,
            streamOutput: opts.streamOutput ?? true,
            timeoutMs: opts.timeoutMs ?? this.commandTimeoutMs(),
            onProgress: opts.onProgress,
        });
        if (!opts.progressTitle) {
            return run();
        }
        return vscode__WEBPACK_IMPORTED_MODULE_0__.window.withProgress({ location: vscode__WEBPACK_IMPORTED_MODULE_0__.ProgressLocation.Notification, title: opts.progressTitle, cancellable: false }, async (progress) => {
            const started = Date.now();
            progress.report({ message: opts.progressDetail ?? "Starting..." });
            const timer = setInterval(() => {
                const elapsed = Math.max(1, Math.floor((Date.now() - started) / 1000));
                progress.report({ message: `${opts.progressDetail ?? "Running"} (${elapsed}s)` });
            }, 1000);
            try {
                const result = await run();
                const elapsed = Math.max(0, Math.floor((Date.now() - started) / 1000));
                progress.report({
                    message: result.code === 0 && !result.timedOut
                        ? `Completed in ${elapsed}s`
                        : result.timedOut
                            ? `Timed out after ${elapsed}s`
                            : `Failed after ${elapsed}s`,
                });
                return result;
            }
            finally {
                clearInterval(timer);
            }
        });
    }
    jsonCache = new Map();
    static CACHE_TTL = 10000;
    async captureJson(cmd, args = []) {
        const cacheKey = cmd + "|" + args.join(",");
        const cached = this.jsonCache.get(cacheKey);
        if (cached && Date.now() - cached.ts < ImdeRunner.CACHE_TTL) {
            return cached.data;
        }
        const result = await this.execute(cmd, args, {
            json: true,
            streamOutput: false,
            timeoutMs: this.captureTimeoutMs(),
        });
        if (result.code !== 0) {
            const brief = result.stderr
                ? result.stderr.split('\n').filter(l => !l.startsWith('  File ') && !l.startsWith('    ')).slice(-3).join('\n').trim()
                : '';
            this.output.appendLine(`IMDE captureJson(${cmd}) failed: exit ${result.code}${brief ? ' — ' + brief : ''}`);
            return null;
        }
        try {
            const data = JSON.parse(result.stdout);
            this.jsonCache.set(cacheKey, { data, ts: Date.now() });
            return data;
        }
        catch {
            this.output.appendLine(`IMDE captureJson(${cmd}) returned invalid JSON.`);
            this.output.appendLine(result.stdout.slice(0, 500));
            return null;
        }
    }
    execute(cmd, args, opts) {
        const proj = this.getProjectDir();
        const imdeBin = this.imdeBin();
        let spawnArgs;
        let spawnExe;
        if (imdeBin) {
            const s = this.spawnImdeBin(imdeBin, [
                "--project-dir", proj,
                ...(opts.json ? ["--json"] : []),
                cmd,
                ...args,
            ]);
            spawnExe = s.exe;
            spawnArgs = s.args;
        }
        else {
            const py = this.python();
            const imde = this.imdePy();
            if (!py) {
                vscode__WEBPACK_IMPORTED_MODULE_0__.window.showErrorMessage("Python not found");
                return Promise.resolve({ code: null, stdout: "", stderr: "Python not found", timedOut: false, commandLine: "" });
            }
            if (!fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(imde)) {
                const message = `IMDE CLI not found: ${imde}`;
                vscode__WEBPACK_IMPORTED_MODULE_0__.window.showErrorMessage(message);
                return Promise.resolve({ code: null, stdout: "", stderr: message, timedOut: false, commandLine: "" });
            }
            spawnExe = py;
            spawnArgs = [imde, "--project-dir", proj, ...(opts.json ? ["--json"] : []), cmd, ...args];
        }
        const commandLine = this.formatForLog([spawnExe, ...spawnArgs]);
        if (opts.streamOutput) {
            this.output.appendLine(`> ${commandLine}`);
        }
        return new Promise((resolve) => {
            let stdout = "";
            let stderr = "";
            let timedOut = false;
            let settled = false;
            const loginEnv = ImdeRunner.resolveLoginEnv();
            const proc = child_process__WEBPACK_IMPORTED_MODULE_1__.spawn(spawnExe, spawnArgs, {
                cwd: proj,
                env: {
                    ...loginEnv,
                    PYTHONIOENCODING: process.env.PYTHONIOENCODING || "utf-8",
                },
            });
            const finish = (result) => {
                if (settled) {
                    return;
                }
                settled = true;
                resolve(result);
            };
            const timer = opts.timeoutMs > 0
                ? setTimeout(() => { timedOut = true; proc.kill(); }, opts.timeoutMs)
                : undefined;
            proc.stdout.on("data", (d) => {
                const text = d.toString();
                stdout += text;
                if (opts.streamOutput) {
                    this.output.append(text);
                }
                parseProgress(text);
            });
            const parseProgress = (text) => {
                if (!opts.onProgress)
                    return;
                const m = text.match(/\[(\d+)\/(\d+)\]\s+(.+)/);
                if (m) {
                    opts.onProgress(parseInt(m[1], 10), parseInt(m[2], 10), m[3].trim());
                }
            };
            proc.stderr.on("data", (d) => {
                const text = d.toString();
                stderr += text;
                if (opts.streamOutput) {
                    this.output.append(text);
                }
                parseProgress(text);
            });
            proc.on("error", (err) => {
                if (timer) {
                    clearTimeout(timer);
                }
                finish({ code: null, stdout, stderr: stderr + err.message, timedOut, commandLine });
            });
            proc.on("close", (code) => {
                if (timer) {
                    clearTimeout(timer);
                }
                if (opts.streamOutput) {
                    this.output.appendLine("");
                    this.output.appendLine(timedOut ? `Timed out: ${commandLine}` : `Exit code: ${code ?? "unknown"}`);
                }
                finish({ code, stdout, stderr, timedOut, commandLine });
            });
        });
    }
    captureTimeoutMs() {
        return vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration("imde").get("captureTimeoutMs") ?? 15000;
    }
    commandTimeoutMs() {
        return vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration("imde").get("commandTimeoutMs") ?? 0;
    }
    formatForLog(tokens) {
        return tokens.map((token) => token.includes(" ") ? `"${token}"` : token).join(" ");
    }
    formatTerminalCommand(tokens) {
        const shell = (vscode__WEBPACK_IMPORTED_MODULE_0__.env.shell || "").toLowerCase();
        const isPowerShell = shell.includes("powershell") || shell.includes("pwsh");
        const quoted = tokens.map((token) => this.quoteTerminalArg(token, shell));
        return isPowerShell ? `& ${quoted.join(" ")}` : quoted.join(" ");
    }
    quoteTerminalArg(token, shell) {
        if (!token) {
            return "''";
        }
        if (shell.includes("powershell") || shell.includes("pwsh")) {
            return `'${token.replace(/'/g, "''")}'`;
        }
        if (process.platform === "win32" && shell.includes("cmd")) {
            return `"${token.replace(/"/g, '\\"')}"`;
        }
        return `'${token.replace(/'/g, "'\\''")}'`;
    }
}


/***/ },

/***/ "./src/logger/logger.ts"
/*!******************************!*\
  !*** ./src/logger/logger.ts ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Logger: () => (/* binding */ Logger)
/* harmony export */ });
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
// Try to import vscode, but make it optional for testing
let vscode;
try {
    vscode = __webpack_require__(/*! vscode */ "vscode");
}
catch (e) {
    // Running outside of VSCode environment (e.g., in tests)
    vscode = null;
}
class Logger {
    static resolveMessage(message) {
        if (typeof message === "function") {
            try {
                return message();
            }
            catch (error) {
                return `[LOGGER_MESSAGE_FACTORY_ERROR] ${error instanceof Error ? error.message : String(error)}`;
            }
        }
        return message;
    }
    static outputChannel = null;
    static CONFIG_CACHE_TTL_MS = 1000;
    static logConfigCache = null;
    static debugConfigCache = null;
    static getOutputChannel() {
        if (!Logger.outputChannel && vscode) {
            Logger.outputChannel = vscode.window.createOutputChannel("IMDE");
        }
        return Logger.outputChannel;
    }
    /**
     * 获取日志配置
     */
    static getLogConfig() {
        const now = Date.now();
        if (Logger.logConfigCache && (now - Logger.logConfigCache.timestamp) < Logger.CONFIG_CACHE_TTL_MS) {
            return Logger.logConfigCache.value;
        }
        let configValue;
        if (!vscode) {
            configValue = {
                enabled: false,
                levels: {
                    info: false,
                    warn: false,
                    error: false,
                    debug: false
                }
            };
        }
        else {
            const logConfig = vscode.workspace.getConfiguration('imde.guiConfig.log');
            configValue = {
                enabled: logConfig.get('enabled', false),
                levels: {
                    info: logConfig.get('level.info', false),
                    warn: logConfig.get('level.warn', false),
                    error: logConfig.get('level.error', false),
                    debug: logConfig.get('level.debug', false)
                }
            };
        }
        Logger.logConfigCache = { value: configValue, timestamp: now };
        return configValue;
    }
    /**
     * 获取调试配置
     */
    static getDebugConfig() {
        const now = Date.now();
        if (Logger.debugConfigCache && (now - Logger.debugConfigCache.timestamp) < Logger.CONFIG_CACHE_TTL_MS) {
            return Logger.debugConfigCache.value;
        }
        let configValue;
        if (!vscode) {
            configValue = {
                enabled: false,
                parser: false,
                visibility: false,
                menu: false,
                select: false,
                source: false
            };
        }
        else {
            const config = vscode.workspace.getConfiguration('imde.guiConfig.debug');
            configValue = {
                enabled: config.get('enabled', false),
                parser: config.get('parser', false),
                visibility: config.get('visibility', false),
                menu: config.get('menu', false),
                select: config.get('select', false),
                source: config.get('source', false)
            };
        }
        Logger.debugConfigCache = { value: configValue, timestamp: now };
        return configValue;
    }
    /**
     * 通用调试日志方法
     */
    static debugLog(category, message, categoryEnabled) {
        const debugConfig = Logger.getDebugConfig();
        // 总开关未开启时直接返回
        if (!debugConfig.enabled) {
            return;
        }
        // 分类开关未开启时直接返回
        if (!categoryEnabled) {
            return;
        }
        const timestamp = new Date().toISOString();
        const resolvedMessage = Logger.resolveMessage(message);
        const logMessage = `[${timestamp}] [DEBUG:${category}] ${resolvedMessage}`;
        const channel = Logger.getOutputChannel();
        if (channel) {
            channel.appendLine(logMessage);
        }
        // console.debug(logMessage);
    }
    static info(message) {
        const logConfig = Logger.getLogConfig();
        if (!logConfig.enabled || !logConfig.levels.info) {
            return;
        }
        const timestamp = new Date().toISOString();
        const resolvedMessage = Logger.resolveMessage(message);
        const logMessage = `[${timestamp}] [INFO] ${resolvedMessage}`;
        const channel = Logger.getOutputChannel();
        if (channel) {
            channel.appendLine(logMessage);
        }
    }
    static warn(message) {
        const logConfig = Logger.getLogConfig();
        if (!logConfig.enabled || !logConfig.levels.warn) {
            return;
        }
        const timestamp = new Date().toISOString();
        const resolvedMessage = Logger.resolveMessage(message);
        const logMessage = `[${timestamp}] [WARN] ${resolvedMessage}`;
        const channel = Logger.getOutputChannel();
        if (channel) {
            channel.appendLine(logMessage);
        }
        // console.warn(logMessage);
    }
    static error(message, error, context) {
        // Error logs are treated as important and are always emitted.
        const timestamp = new Date().toISOString();
        let errorMessage = `[${timestamp}] [ERROR] ${message}`;
        if (context) {
            errorMessage += ` (Context: ${context})`;
        }
        const channel = Logger.getOutputChannel();
        if (channel) {
            channel.appendLine(errorMessage);
        }
        // console.error(errorMessage);
        if (error) {
            const stackTrace = `[${timestamp}] [ERROR] Stack trace: ${error.stack || error.message}`;
            if (channel) {
                channel.appendLine(stackTrace);
            }
            // console.error(stackTrace);
        }
    }
    static debug(message) {
        const logConfig = Logger.getLogConfig();
        if (!logConfig.enabled || !logConfig.levels.debug) {
            return;
        }
        const timestamp = new Date().toISOString();
        const resolvedMessage = Logger.resolveMessage(message);
        const logMessage = `[${timestamp}] [DEBUG] ${resolvedMessage}`;
        const channel = Logger.getOutputChannel();
        if (channel) {
            channel.appendLine(logMessage);
        }
        // console.debug(logMessage);
    }
    /**
     * 解析器调试日志 (CONFIG_PARSER, IF_PARSER)
     */
    static debugParser(message) {
        const debugConfig = Logger.getDebugConfig();
        Logger.debugLog('PARSER', message, debugConfig.parser);
    }
    /**
     * 可见性调试日志 (VISIBILITY_DEBUG)
     */
    static debugVisibility(message) {
        const debugConfig = Logger.getDebugConfig();
        Logger.debugLog('VISIBILITY', message, debugConfig.visibility);
    }
    /**
     * 菜单渲染调试日志 (MENU_RENDER_DEBUG, INDENT_DEBUG)
     */
    static debugMenu(message) {
        const debugConfig = Logger.getDebugConfig();
        Logger.debugLog('MENU', message, debugConfig.menu);
    }
    /**
     * select语句调试日志 (SELECT_INIT)
     */
    static debugSelect(message) {
        const debugConfig = Logger.getDebugConfig();
        Logger.debugLog('SELECT', message, debugConfig.select);
    }
    /**
     * 源文件处理调试日志 (SOURCE_DEBUG)
     */
    static debugSource(message) {
        const debugConfig = Logger.getDebugConfig();
        Logger.debugLog('SOURCE', message, debugConfig.source);
    }
    /**
     * 配置写入调试日志 (WRITER_DEBUG)
     */
    static debugWriter(message) {
        const debugConfig = Logger.getDebugConfig();
        // For now, use the debug config enabled flag
        // In the future, we could add a separate writer debug flag
        Logger.debugLog('WRITER', message, debugConfig.enabled);
    }
    static show() {
        const channel = Logger.getOutputChannel();
        if (channel) {
            channel.show();
        }
    }
    static dispose() {
        if (Logger.outputChannel) {
            Logger.outputChannel.dispose();
            Logger.outputChannel = null;
        }
        Logger.logConfigCache = null;
        Logger.debugConfigCache = null;
    }
}


/***/ },

/***/ "./src/mapview/panel.ts"
/*!******************************!*\
  !*** ./src/mapview/panel.ts ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MapViewPanel: () => (/* binding */ MapViewPanel)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _style__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./style */ "./src/mapview/style.ts");


class MapViewPanel {
    static currentPanel;
    panel;
    _disposed = false;
    static createOrShow(extensionUri, mapPath, data, projDir) {
        const column = vscode__WEBPACK_IMPORTED_MODULE_0__.window.activeTextEditor
            ? vscode__WEBPACK_IMPORTED_MODULE_0__.window.activeTextEditor.viewColumn
            : undefined;
        const title = mapPath.split(/[\\/]/).pop() || "Map View";
        if (MapViewPanel.currentPanel && !MapViewPanel.currentPanel._disposed) {
            MapViewPanel.currentPanel.panel.reveal(column);
            MapViewPanel.currentPanel.update(mapPath, data, projDir);
            return;
        }
        MapViewPanel.currentPanel = new MapViewPanel(extensionUri, column || vscode__WEBPACK_IMPORTED_MODULE_0__.ViewColumn.One, title, mapPath, data, projDir);
    }
    constructor(extensionUri, column, title, mapPath, data, projDir) {
        this.panel = vscode__WEBPACK_IMPORTED_MODULE_0__.window.createWebviewPanel("imdeMapView", title, column, {
            enableScripts: true, retainContextWhenHidden: true,
        });
        this.panel.webview.html = this.getHtml(mapPath, data, projDir);
        this.panel.onDidDispose(() => { this._disposed = true; MapViewPanel.currentPanel = undefined; });
    }
    update(mapPath, data, projDir) {
        this.panel.webview.html = this.getHtml(mapPath, data, projDir);
    }
    toPanelData(data, projDir) {
        const mt = data.moduleTree || [];
        const secs = (data.sections || []).map(s => ({ name: s.name, size: s.size, addressRange: s.addressRange }));
        if (!Array.isArray(mt) || secs.length === 0) {
            console.warn("[MapView] Empty or invalid moduleTree/sections from parseMapFile");
        }
        return {
            sections: secs,
            moduleTree: mt,
            romUsed: data.romUsed || 0, ramUsed: data.ramUsed || 0,
            objectCount: data.objects?.length || 0,
            projDir,
        };
    }
    getHtml(mapPath, data, projDir) {
        const panelData = this.toPanelData(data, projDir || "");
        const json = JSON.stringify(panelData).replace(/</g, "\\x3c");
        const d = vscode__WEBPACK_IMPORTED_MODULE_0__.window.activeColorTheme.kind === vscode__WEBPACK_IMPORTED_MODULE_0__.ColorThemeKind.Dark;
        const bg = d ? "#1e1e1e" : "#ffffff";
        const fg = d ? "#cccccc" : "#333333";
        const border = d ? "#3c3c3c" : "#e0e0e0";
        const accent = d ? "#4ec9b0" : "#007acc";
        const cardBg = d ? "#252526" : "#f8f8f8";
        const muted = d ? "#808080" : "#888888";
        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Map View</title>
<style>${(0,_style__WEBPACK_IMPORTED_MODULE_1__.getMapViewCss)({ bg, fg, border, accent, cardBg, muted }, !!d)}</style>
</head>
<body>
<div class="header">
  <h1>Memory Map</h1>
  <div class="path">${this.escapeHtml(mapPath)}</div>
  <div class="summary" id="summary"></div>
</div>
<div class="controls">
  <div class="breadcrumb" id="breadcrumb"></div>
  <button class="btn secondary" id="topBtn" disabled title="Back to top level">↻</button>
  <button class="btn secondary" id="backBtn" disabled>Back</button>
  <input class="search-box" id="searchBox" type="text" placeholder="Search modules...">
  <div class="view-toggle">
    <button class="active" data-view="treemap">Treemap</button>
    <button data-view="sections">Sections</button>
  </div>
</div>
<div class="treemap-wrap" id="treemap"></div>
<div class="section-list" id="sectionList"></div>
<div class="legend" id="legend"></div>
<div class="tooltip" id="tooltip"></div>
<div class="ctx-menu" id="ctxMenu" style="display:none"><div class="ctx-item" onclick="ctxCopyName()">📋 Copy Name</div><div class="ctx-item" onclick="ctxCopyPath()">📁 Copy Path</div><div class="ctx-item" onclick="ctxRevealSource()">📄 Reveal Source</div></div>
<div class="error-msg" id="errmsg"></div>

<script>
(function() {
  // --- Data ---
  var DATA = ${json};
  var PAL = ["#5B9DA5","#E88462","#7BA64E","#C978A5","#D4A74A","#6B97CE","#8EAF6B","#CC768A","#5EA391","#C58A4E","#7990C4","#AA7A5E","#63A87C","#B87594","#8E8CC4","#D49253","#5F9DBF","#9E7DBF","#BFA560","#698DA8"];

  // --- State ---
  var viewStack = [{ name: "root", children: DATA.moduleTree || [] }];
  var currentView = "treemap";
  var searchQuery = "";

  // --- Helpers ---
  function colorFor(s, idx) {
    var h = 0;
    for (var j = 0; j < s.length; j++) { h = s.charCodeAt(j) + ((h << 5) - h); }
    return PAL[Math.abs(h + idx) % PAL.length];
  }
  function fmt(b) {
    if (b >= 1048576) return (b / 1048576).toFixed(2) + " MB";
    if (b >= 1024) return (b / 1024).toFixed(1) + " KB";
    return b + " B";
  }
  function pct(v, t) { return t <= 0 ? "0%" : ((v / t) * 100).toFixed(1) + "%"; }
  function esc(t) { var d = document.createElement("div"); d.textContent = "" + t; return d.innerHTML; }

  // --- Render summary (always global) ---
  function renderSummary() {
    var r = DATA.romUsed || 0;
    var m = DATA.ramUsed || 0;
    var t = r + m;
    var html = "";
    html += '<div class="summary-card"><div class="label">Total</div><div class="value">' + fmt(t) + '</div></div>';
    html += '<div class="summary-card"><div class="label">ROM (Flash)</div><div class="value">' + fmt(r) + '</div></div>';
    html += '<div class="summary-card"><div class="label">RAM</div><div class="value">' + fmt(m) + '</div></div>';
    html += '<div class="summary-card"><div class="label">Modules</div><div class="value">' + (DATA.objectCount || 0) + '</div></div>';
    document.getElementById("summary").innerHTML = html;
  }

  // --- Breadcrumb ---
  function renderBreadcrumb() {
    var el = document.getElementById("breadcrumb");
    var parts = [];
    for (var i = 0; i < viewStack.length; i++) {
      var label = viewStack[i].name === "root" ? "All Modules" : viewStack[i].name;
      parts.push('<span onclick="window._navTo(' + i + ')">' + esc(label) + '</span>');
    }
    el.innerHTML = parts.join('<span class="sep">/</span>');
    document.getElementById("backBtn").disabled = viewStack.length <= 1;
    document.getElementById("topBtn").disabled = viewStack.length <= 1;
  }

  window._navTo = function(idx) {
    viewStack = viewStack.slice(0, idx + 1);
    searchQuery = "";
    document.getElementById("searchBox").value = "";
    renderSummary();
    renderBreadcrumb();
    renderTreemap();
  };

  document.getElementById("backBtn").onclick = function() {
    if (viewStack.length > 1) { viewStack.pop(); renderBreadcrumb(); renderTreemap(); }
  };
  document.getElementById("topBtn").onclick = function() {
    viewStack = [{ name: "root", children: DATA.moduleTree || [] }];
    searchQuery = ""; document.getElementById("searchBox").value = "";
    renderSummary(); renderBreadcrumb(); renderTreemap();
  };

  // --- Search ---
  document.getElementById("searchBox").addEventListener("input", function(e) {
    searchQuery = e.target.value.trim().toLowerCase();
    renderBreadcrumb();
    renderTreemap();
  });

  // --- Get nodes at current tree depth ---
  function getCurrentNodes() {
    var nodes = DATA.moduleTree || [];
    for (var i = 1; i < viewStack.length; i++) {
      var target = viewStack[i];
      var found = null;
      for (var j = 0; j < nodes.length; j++) {
        var n = nodes[j];
        if (n.fullPath === target.fullPath || n.name === target.name) {
          found = n.children || [];
          break;
        }
      }
      if (found === null) { return []; }
      nodes = found;
    }
    // Global search: walk the ENTIRE subtree, collect matching nodes with path labels
    if (searchQuery) {
      var results = [];
      function walk(list, prefix) {
        for (var i = 0; i < list.length; i++) {
          var n = list[i];
          var curPath = prefix ? prefix + "/" + n.name : n.name;
          if (n.name.toLowerCase().indexOf(searchQuery) >= 0) {
            results.push({ name: curPath, size: n.size, romSize: n.romSize, ramSize: n.ramSize, children: n.children, fullPath: n.fullPath });
          }
          if (n.children && n.children.length > 0) {
            walk(n.children, curPath);
          }
        }
      }
      walk(nodes, "");
      return results;
    }
    return nodes;
  }

  // --- Squarified Treemap ---
  function layoutTreemap(list, x, y, w, h) {
    if (!list.length || w <= 0 || h <= 0) return [];
    var total = 0;
    for (var i = 0; i < list.length; i++) { total += list[i].size || 0; }
    if (total <= 0) return [];

    var res = [];
    var row = [], rowSum = 0;

    function worstRatio(l, s, area) {
      var mn = Infinity, mx = 0, n = 0;
      for (var k = 0; k < l.length; k++) {
        var sz = l[k].size || 0;
        if (sz > 0) { if (sz < mn) mn = sz; if (sz > mx) mx = sz; n++; }
      }
      if (n === 0 || area <= 0) return Infinity;
      return Math.max((s * s * mx) / (n * n * area), (n * n * area) / (s * s * mn));
    }

    function flush(aw, ah, aa) {
      if (!row.length) return;
      var rowDim = aa <= 0 ? 0 : (rowSum / total) * aa / (aw >= ah ? aw : ah);
      var off = 0;
      for (var k = 0; k < row.length; k++) {
        var ratio = (row[k].size || 0) / rowSum;
        if (aw >= ah) {
          res.push({ node: row[k], rect: { x: x + off, y: y, w: ratio * aw, h: rowDim } });
          off += ratio * aw;
        } else {
          res.push({ node: row[k], rect: { x: x, y: y + off, w: rowDim, h: ratio * ah } });
          off += ratio * ah;
        }
      }
      if (aw >= ah) { y += rowDim; h -= rowDim; } else { x += rowDim; w -= rowDim; }
      row = []; rowSum = 0;
    }

    for (var i = 0; i < list.length; i++) {
      var sz = list[i].size || 0;
      if (sz <= 0) continue;
      var area = w * h;
      if (row.length === 0) {
        row.push(list[i]); rowSum += sz;
      } else {
        var pv = worstRatio(row, rowSum, area);
        var nx = worstRatio(row.concat([list[i]]), rowSum + sz, area);
        if (nx <= pv) {
          row.push(list[i]); rowSum += sz;
        } else {
          flush(w, h, area);
          row.push(list[i]); rowSum += sz;
        }
      }
    }
    flush(w, h, w * h);
    return res;
  }

  // --- Treemap render ---
  function renderTreemap() {
    var wrap = document.getElementById("treemap");
    wrap.innerHTML = "";
    if (currentView !== "treemap") return;

    var nodes = getCurrentNodes();
    // Sort by size desc
    nodes.sort(function(a, b) { return (b.size || 0) - (a.size || 0); });

    var total = 0;
    for (var i = 0; i < nodes.length; i++) { total += nodes[i].size || 0; }

    // Filter out tiny nodes only if there are many
    if (nodes.length > 10) {
      nodes = nodes.filter(function(n) { return (n.size || 0) / total > 0.003; });
    }

    if (!nodes.length || total <= 0) {
      wrap.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:' + "${muted}" + ';font-size:14px;">' +
        (searchQuery ? "No matching modules" : "No data") + '</div>';
      document.getElementById("legend").innerHTML = "";
      return;
    }

    var cw = wrap.clientWidth;
    var ch = wrap.clientHeight;
    var pad = 3;
    var layout = layoutTreemap(nodes, pad, pad, cw - pad * 2, ch - pad * 2);

    var frag = document.createDocumentFragment();
    for (var i = 0; i < layout.length; i++) {
      var item = layout[i], node = item.node, rect = item.rect;
      var el = document.createElement("div");
      el.className = "treemap-node";
      el.style.animationDelay = (i * 0.02) + "s";

      var color = colorFor(node.name || "", i);
      el.style.left = Math.round(rect.x) + "px";
      el.style.top = Math.round(rect.y) + "px";
      el.style.width = Math.max(1, Math.round(rect.w)) + "px";
      el.style.height = Math.max(1, Math.round(rect.h)) + "px";
      el.style.background = color;
      el.style.borderColor = "rgba(255,255,255,.08)";

      var sz = node.size || 0;
      var perc = total > 0 ? ((sz / total) * 100).toFixed(1) : "0";
      var showLabel = rect.w > 40 && rect.h > 22;
      var showSize = rect.w > 48 && rect.h > 36;
      var showPct = rect.w > 48 && rect.h > 50;

      if (showLabel) {
        var inner = '<div class="treemap-label">' + esc(node.name) + '</div>';
        if (showSize) inner += '<div class="treemap-size">' + fmt(sz) + '</div>';
        if (showPct) inner += '<div class="treemap-pct">' + perc + '%</div>';
        el.innerHTML = inner;
      }

      // Click to drill down
      if (node.children && node.children.length > 0) {
        (function(n) {
          el.addEventListener("click", function() {
            if (searchQuery) {
              // Search active: go to root, clear search
              viewStack = [{ name: "root", children: DATA.moduleTree || [] }];
              searchQuery = "";
              document.getElementById("searchBox").value = "";
            } else {
              viewStack.push(n);
            }
            renderSummary();
            renderBreadcrumb();
            renderTreemap();
          });
        })(node);
      }

      // Right-click context menu
      (function(n) {
        el.addEventListener("contextmenu", function(e) {
          e.preventDefault();
          hideTooltip();
          var menu = document.getElementById("ctxMenu");
          menu.style.display = "block";
          menu.style.left = e.clientX + "px";
          menu.style.top = e.clientY + "px";
          menu._node = n;
        });
      })(node);

      // Tooltip
      (function(n, c) {
        el.addEventListener("mouseenter", function(e) { showTooltip(e, n, c); });
      })(node, color);
      el.addEventListener("mouseleave", hideTooltip);
      el.addEventListener("mousemove", moveTooltip);

      frag.appendChild(el);
    }
    wrap.appendChild(frag);

    // Legend
    renderLegend(nodes, total);
  }

  function renderLegend(nodes, total) {
    var top = nodes.slice(0, 10);
    var html = "";
    for (var i = 0; i < top.length; i++) {
      var c = colorFor(top[i].name || "", i);
      html += '<div class="legend-item"><div class="legend-color" style="background:' + c + '"></div><span>' +
        esc(top[i].name) + ' <b>' + pct(top[i].size || 0, total) + '</b></span></div>';
    }
    document.getElementById("legend").innerHTML = html;
  }

  // --- Section list ---
  function renderSectionList() {
    var el = document.getElementById("sectionList");
    var secs = (DATA.sections || []).slice().sort(function(a, b) { return (b.size || 0) - (a.size || 0); });
    var maxSz = 1;
    for (var i = 0; i < secs.length; i++) { if (secs[i].size > maxSz) maxSz = secs[i].size; }
    var html = "";
    for (var i = 0; i < secs.length; i++) {
      var s = secs[i];
      var barPct = ((s.size / maxSz) * 100).toFixed(1);
      var color = PAL[i % PAL.length];
      html += '<div class="section-row"><span class="sec-name" title="' + esc(s.addressRange||'') + '">' + esc(s.name) +
        '</span><span class="sec-size" style="color:' + color + '">' + fmt(s.size) +
        (s.addressRange ? ' <span style="font-size:10px;color:' + color + '">' + s.addressRange + '</span>' : '') +
        '</span></div>' +
        '<div class="section-bar-bg"><div class="section-bar" style="width:' + barPct + '%;background:' + color + '"></div></div>';
    }
    el.innerHTML = html;
  }

  // --- Tooltip ---
  var tooltip = document.getElementById("tooltip");
  function showTooltip(e, node, color) {
    var rom = node.romSize || 0, ram = node.ramSize || 0;
    var html = '<div class="tt-title" style="color:' + color + '">' + esc(node.name) + '</div>' +
      '<div class="tt-row"><span class="tt-key">Total</span><span class="tt-val">' + fmt(node.size || 0) + '</span></div>';
    if (rom > 0) html += '<div class="tt-row"><span class="tt-key">ROM</span><span class="tt-val">' + fmt(rom) + '</span></div>';
    if (ram > 0) html += '<div class="tt-row"><span class="tt-key">RAM</span><span class="tt-val">' + fmt(ram) + '</span></div>';
    if (node.children && node.children.length) {
      html += '<div class="tt-row"><span class="tt-key">Children</span><span class="tt-val">' + node.children.length + '</span></div>';
    }
    if (node.sourceFiles && node.sourceFiles.length > 0) {
      html += '<div style="margin-top:6px;border-top:1px solid ' + (node.sourceFiles.length > 3 ? ';max-height:80px;overflow-y:auto"' : '"') + '>';
      for (var si = 0; si < node.sourceFiles.length && si < 5; si++) {
        var sf = node.sourceFiles[si];
        var full = (DATA.projDir ? DATA.projDir.replace(/\\\\/g, '/') + '/' : '') + sf;
        html += '<div class="tt-src" style="margin:2px 0"><a href="command:imde.openFile?' + encodeURIComponent(JSON.stringify([full, sf])) + '">📄 ' + esc(sf) + '</a></div>';
      }
      if (node.sourceFiles.length > 5) html += '<div style="font-size:10px;color:${muted}">+ ' + (node.sourceFiles.length - 5) + ' more</div>';
      html += '</div>';
    }
    tooltip.innerHTML = html;
    tooltip.style.display = "block";
    moveTooltip(e);
  }
  function hideTooltip() { tooltip.style.display = "none"; }
  function moveTooltip(e) {
    var rect = tooltip.getBoundingClientRect();
    var left = e.clientX + 14, top = e.clientY + 14;
    if (left + rect.width > window.innerWidth) left = e.clientX - rect.width - 8;
    if (top + rect.height > window.innerHeight) top = e.clientY - rect.height - 8;
    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
  }

  // --- View toggle ---
  var toggleBtns = document.querySelectorAll(".view-toggle button");
  for (var i = 0; i < toggleBtns.length; i++) {
    toggleBtns[i].addEventListener("click", function() {
      for (var j = 0; j < toggleBtns.length; j++) { toggleBtns[j].classList.remove("active"); }
      this.classList.add("active");
      currentView = this.dataset.view;
      document.getElementById("treemap").style.display = currentView === "treemap" ? "block" : "none";
      var sl = document.getElementById("sectionList");
      if (currentView === "sections") { sl.classList.add("active"); } else { sl.classList.remove("active"); }
      if (currentView === "treemap") renderTreemap();
      if (currentView === "sections") renderSectionList();
    });
  }

  // --- Context menu handlers ---
  window.ctxCopyName = function() { var n = document.getElementById("ctxMenu")._node; if (n) { navigator.clipboard.writeText(n.name || n.fullPath || ""); } hideCtxMenu(); };
  window.ctxCopyPath = function() { var n = document.getElementById("ctxMenu")._node; if (n) { navigator.clipboard.writeText(n.fullPath || n.name || ""); } hideCtxMenu(); };
  window.ctxRevealSource = function() {
    var n = document.getElementById("ctxMenu")._node;
    if (n && n.sourceFiles && n.sourceFiles.length > 0) {
      var sf = n.sourceFiles[0];
      var full = (DATA.projDir ? DATA.projDir.replace(/\\\\/g, '/') + '/' : '') + sf;
      window.location.href = "command:imde.openFile?" + encodeURIComponent(JSON.stringify([full, sf]));
    }
    hideCtxMenu();
  };
  function hideCtxMenu() { var m = document.getElementById("ctxMenu"); m.style.display = "none"; m._node = undefined; }
  document.addEventListener("click", function(e) { if (!e.target.closest(".ctx-menu") && !e.target.closest(".treemap-node")) hideCtxMenu(); });
  document.addEventListener("scroll", hideCtxMenu);

  // --- Initial render ---
  renderSummary();
  renderBreadcrumb();
  renderTreemap();

  // --- Resize ---
  var resizeTimer;
  window.addEventListener("resize", function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() { if (currentView === "treemap") renderTreemap(); }, 100);
  });
})();
</script>
</body>
</html>`;
    }
    escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
}


/***/ },

/***/ "./src/mapview/parser.ts"
/*!*******************************!*\
  !*** ./src/mapview/parser.ts ***!
  \*******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parseMapFile: () => (/* binding */ parseMapFile)
/* harmony export */ });
const ROM_SECTIONS = new Set([
    ".vectors", ".start", ".text", ".rodata", ".srodata", ".init", ".fini",
    ".preinit_array", ".init_array", ".fini_array", ".eh_frame", ".ARM.exidx",
]);
const RAM_SECTIONS = new Set([
    ".data", ".sdata", ".bss", ".sbss", ".noinit", ".heap", ".stack",
]);
const SKIP_SECTIONS = new Set([
    ".comment", ".note", ".debug_info", ".debug_abbrev", ".debug_loclists",
    ".debug_aranges", ".debug_rnglists", ".debug_line", ".debug_str",
    ".debug_line_str", ".debug_frame", ".riscv.attributes", ".stab", ".stabstr",
]);
const RESERVED_SECTIONS = new Set([
    ".user_heap", ".user_stack", ".irq_stack", ".got", ".rela.dyn",
]);
function isDebugOrMetaSection(name) {
    return SKIP_SECTIONS.has(name) || name.startsWith(".debug_");
}
function isReservedSection(name) { return RESERVED_SECTIONS.has(name); }
function hexToNum(s) { return parseInt(s.replace(/^0x/i, ""), 16); }
function fmtAddr(addr) {
    return "0x" + addr.toString(16);
}
function looksLikeObjFile(path) {
    return path.includes(".obj") || path.includes(".o") || path.endsWith(")");
}
function getModuleName(path) {
    const m = path.match(/[\\/]([^\\/]+)\.c\.obj$/i);
    if (m) {
        const parts = path.split(/[\\/]/);
        const idx = parts.findIndex(p => p === "code");
        if (idx >= 0 && idx + 2 < parts.length) {
            return `${parts[idx + 1]}/${parts[parts.length - 1].replace(/\.c\.obj$/i, "")}`;
        }
        const file = parts[parts.length - 1].replace(/\.c\.obj$/i, "");
        const dir = parts.length > 1 ? parts[parts.length - 2] : "";
        return dir ? `${dir}/${file}` : file;
    }
    const sM = path.match(/[\\/]([^\\/]+)\.[Ss]\.obj$/i);
    if (sM) {
        const parts = path.split(/[\\/]/);
        const idx = parts.findIndex(p => p === "code");
        if (idx >= 0 && idx + 2 < parts.length) {
            return `${parts[idx + 1]}/${sM[1]}`;
        }
        const file = sM[1];
        const dir = parts.length > 1 ? parts[parts.length - 2] : "";
        return dir ? `${dir}/${file}` : file;
    }
    const libM = path.match(/([^\\/]+)\.a\([^)]*[-_]([^\\/]+)\.o\)$/i);
    if (libM) {
        return `${libM[1].replace(/^lib/, "")}/${libM[2]}`;
    }
    const oM = path.match(/[\\/]([^\\/]+)\.o$/i);
    if (oM) {
        return oM[1];
    }
    const parts = path.split(/[\\/]/);
    return parts[parts.length - 1].replace(/\.(o|obj|a)$/i, "");
}
/** Recover source file path from obj path, e.g. "code/common/src/im_log.c" */
function getSourceFile(path) {
    // CMake: CMakeFiles/xxx.dir/code/common/src/im_log.c.obj
    const m = path.match(/CMakeFiles[\\/][^\\/]+\.dir[\\/](.+)\.(?:c|s|S|cpp|cc)\.obj$/i);
    if (m) {
        return m[1].replace(/\\/g, "/") + ".c";
    }
    // Assembly
    const sm = path.match(/CMakeFiles[\\/][^\\/]+\.dir[\\/](.+)\.(s|S)\.obj$/i);
    if (sm) {
        return sm[1].replace(/\\/g, "/") + "." + sm[2];
    }
    // Library object — no source file
    if (path.includes(".a(")) {
        return "";
    }
    return "";
}
function getDirectoryPath(path) {
    const parts = path.split(/[\\/]/);
    const codeIdx = parts.findIndex(p => p === "code");
    if (codeIdx >= 0) {
        const underCode = parts.slice(codeIdx);
        if (underCode.length > 1) {
            underCode.pop();
            return underCode.join("/");
        }
        return underCode.join("/");
    }
    const genIdx = parts.findIndex(p => p === "generated" || p === "third_party");
    if (genIdx >= 0) {
        const sub = parts.slice(genIdx);
        if (sub.length > 1) {
            sub.pop();
            return sub.join("/");
        }
        return sub.join("/");
    }
    const libM = path.match(/lib([^\\/]+)\.a\(/);
    if (libM) {
        return `lib/${libM[1]}`;
    }
    if (parts.length > 1) {
        return parts[parts.length - 2];
    }
    return "";
}
function parseMapFile(content) {
    const lines = content.replace(/\r/g, "").split("\n");
    let sectionStartLine = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("LOAD "))
            sectionStartLine = i;
    }
    const sections = [];
    const objMap = new Map();
    let currentSection = null;
    // Track __ro_start / __ro_end for pure ROM size
    let roStart = 0, roEnd = 0;
    const sectionPattern = /^(\S+)\s+0x([0-9a-fA-F]+)\s+0x([0-9a-fA-F]+)(?:\s|$)/;
    const subSectionPattern = /^(\s+)(\S+)\s+0x([0-9a-fA-F]+)\s+0x([0-9a-fA-F]+)\s+(.*)$/;
    const anonPattern = /^(\s+)0x([0-9a-fA-F]+)\s+0x([0-9a-fA-F]+)\s+(.*)$/;
    const subNamePattern = /^(\s+)(\.\S+)\s*$/;
    for (let i = sectionStartLine; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim())
            continue;
        // Detect __ro_start / __ro_end markers (for .rodata estimation)
        if (line.includes("__ro_start = .")) {
            const m = line.match(/0x([0-9a-fA-F]+)/);
            if (m)
                roStart = hexToNum(m[0]);
            continue;
        }
        if (line.includes("__ro_end = .")) {
            const m = line.match(/0x([0-9a-fA-F]+)/);
            if (m)
                roEnd = hexToNum(m[0]);
            continue;
        }
        const secMatch = line.match(sectionPattern);
        if (secMatch && !line.startsWith(" ") && !line.startsWith("\t")) {
            const name = secMatch[1];
            const addr = hexToNum(secMatch[2]);
            const size = hexToNum(secMatch[3]);
            if (!isDebugOrMetaSection(name) && !isReservedSection(name) && size > 0) {
                currentSection = { name, address: addr, size, addressRange: fmtAddr(addr) + "–" + fmtAddr(addr + size) };
                sections.push(currentSection);
            }
            else {
                currentSection = null;
            }
            continue;
        }
        if (!currentSection)
            continue;
        if (line.includes("fill=0x"))
            continue;
        if (line.includes(" *fill* "))
            continue;
        if (line.match(subNamePattern))
            continue;
        const subMatch = line.match(subSectionPattern);
        if (subMatch) {
            const objPath = subMatch[5].trim();
            if (looksLikeObjFile(objPath)) {
                const sz = hexToNum(subMatch[4]);
                if (sz > 0)
                    recordContribution(objMap, currentSection.name, objPath, sz);
            }
            continue;
        }
        const anonMatch = line.match(anonPattern);
        if (anonMatch) {
            const objPath = anonMatch[4].trim();
            if (looksLikeObjFile(objPath)) {
                const sz = hexToNum(anonMatch[3]);
                if (sz > 0)
                    recordContribution(objMap, currentSection.name, objPath, sz);
            }
            continue;
        }
        if (line.match(/^(\s+)0x([0-9a-fA-F]+)\s+(\S+)\s*$/))
            continue;
    }
    // Estimate .rodata size from __ro_end - __ro_start minus vectors and start
    if (roStart > 0 && roEnd > 0 && roEnd > roStart) {
        const roTotal = roEnd - roStart;
        const vectorsSize = sections.find(s => s.name === ".vectors")?.size || 0;
        const startSize = sections.find(s => s.name === ".start")?.size || 0;
        const textSize = (sections.find(s => s.name === ".text")?.size || 0);
        const rodataSize = roTotal - vectorsSize - startSize - textSize;
        if (rodataSize > 0) {
            const textSec = sections.find(s => s.name === ".text");
            const rodataStart = textSec.address + textSec.size;
            sections.push({
                name: ".rodata",
                address: rodataStart,
                size: rodataSize,
                addressRange: fmtAddr(rodataStart) + "–" + fmtAddr(rodataStart + rodataSize),
            });
        }
    }
    const objects = Array.from(objMap.values()).sort((a, b) => b.totalSize - a.totalSize);
    const moduleTree = buildModuleTree(objects);
    let romUsed = 0, ramUsed = 0;
    for (const sec of sections) {
        if (ROM_SECTIONS.has(sec.name))
            romUsed += sec.size;
        if (RAM_SECTIONS.has(sec.name))
            ramUsed += sec.size;
    }
    return { sections, objects, romSize: 0, ramSize: 0, romUsed, ramUsed, moduleTree };
}
function recordContribution(objMap, sectionName, objPath, size) {
    let obj = objMap.get(objPath);
    if (!obj) {
        obj = {
            path: objPath,
            name: getModuleName(objPath),
            module: getDirectoryPath(objPath),
            sections: {}, totalSize: 0,
            sourceFile: getSourceFile(objPath),
        };
        objMap.set(objPath, obj);
    }
    obj.sections[sectionName] = (obj.sections[sectionName] || 0) + size;
    obj.totalSize += size;
}
function buildModuleTree(objects) {
    const root = [];
    const findOrCreate = (parent, name, fullPath) => {
        let node = parent.find(c => c.name === name);
        if (!node) {
            node = { name, fullPath, size: 0, romSize: 0, ramSize: 0, children: [] };
            parent.push(node);
        }
        return node;
    };
    for (const obj of objects) {
        const parts = obj.module.split("/").filter(Boolean);
        let current = root;
        let fullPath = "";
        for (let i = 0; i < parts.length; i++) {
            fullPath = fullPath ? `${fullPath}/${parts[i]}` : parts[i];
            current = findOrCreate(current, parts[i], fullPath).children;
        }
    }
    for (const obj of objects) {
        const parts = obj.module.split("/").filter(Boolean);
        let current = root;
        for (let i = 0; i < parts.length; i++) {
            const node = current.find(c => c.name === parts[i]);
            if (i === parts.length - 1) {
                node.size += obj.totalSize;
                for (const [secName, secSize] of Object.entries(obj.sections)) {
                    if (ROM_SECTIONS.has(secName))
                        node.romSize += secSize;
                    if (RAM_SECTIONS.has(secName))
                        node.ramSize += secSize;
                }
                if (obj.sourceFile) {
                    if (!node.sourceFiles)
                        node.sourceFiles = [];
                    if (!node.sourceFiles.includes(obj.sourceFile))
                        node.sourceFiles.push(obj.sourceFile);
                }
            }
            current = node.children;
        }
    }
    function rollup(nodes) {
        let total = 0;
        for (const node of nodes) {
            const childSize = rollup(node.children);
            if (node.size === 0 && childSize > 0)
                node.size = childSize;
            total += node.size;
        }
        return total;
    }
    rollup(root);
    return root;
}


/***/ },

/***/ "./src/mapview/style.ts"
/*!******************************!*\
  !*** ./src/mapview/style.ts ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getMapViewCss: () => (/* binding */ getMapViewCss)
/* harmony export */ });
function getMapViewCss(c, isDark) {
    return `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',sans-serif;background:${c.bg};color:${c.fg};padding:20px;overflow:hidden;height:100vh;display:flex;flex-direction:column}
.header{margin-bottom:16px;flex-shrink:0}
.header h1{font-size:20px;font-weight:600;margin-bottom:4px;color:${c.accent};letter-spacing:-.3px}
.header .path{font-size:11px;color:${c.muted};margin-bottom:12px;word-break:break-all;font-family:monospace}
.summary{display:flex;gap:12px;flex-wrap:wrap}
.summary-card{background:${c.cardBg};border:1px solid ${c.border};border-radius:8px;padding:10px 16px;min-width:100px}
.summary-card .label{font-size:10px;color:${c.muted};text-transform:uppercase;letter-spacing:.8px;font-weight:500}
.summary-card .value{font-size:20px;font-weight:700;margin-top:2px;color:${c.fg}}
.controls{display:flex;gap:10px;margin-bottom:12px;flex-shrink:0;align-items:center;flex-wrap:wrap}
.btn{background:${c.accent};color:${isDark ? "#1e1e1e" : "#fff"};border:none;padding:5px 14px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:500;transition:opacity .15s}
.btn:hover{opacity:.85}
.btn:disabled{opacity:.3;cursor:default}
.btn.secondary{background:${isDark ? "#3c3c3c" : "#e8e8e8"};color:${c.fg}}
.breadcrumb{font-size:13px;color:${c.accent};cursor:pointer;flex:1;font-weight:500;user-select:none}
.breadcrumb span{padding:2px 4px;border-radius:4px;transition:background .15s}
.breadcrumb span:hover{background:${isDark ? "#2a2d2e" : "#eaeaea"};text-decoration:none}
.breadcrumb .sep{color:${c.muted};margin:0 4px;font-weight:400}
.view-toggle{display:flex;gap:0;border-radius:6px;overflow:hidden;border:1px solid ${c.border}}
.view-toggle button{background:${c.cardBg};color:${c.fg};border:none;padding:5px 12px;font-size:12px;cursor:pointer;font-weight:500;transition:all .15s}
.view-toggle button.active{background:${c.accent};color:${isDark ? "#1e1e1e" : "#fff"}}
.search-box{background:${c.cardBg};border:1px solid ${c.border};border-radius:6px;padding:5px 10px;font-size:12px;color:${c.fg};width:160px;outline:none}
.search-box:focus{border-color:${c.accent}}
.search-box::placeholder{color:${c.muted}}
.treemap-wrap{flex:1;border:1px solid ${c.border};border-radius:10px;overflow:hidden;position:relative;min-height:200px;background:${c.cardBg}}
.treemap-node{position:absolute;overflow:hidden;cursor:pointer;display:flex;flex-direction:column;justify-content:center;align-items:center;border-radius:4px;padding:4px 6px;opacity:0;animation:nodeIn .25s ease forwards;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 -1px 0 rgba(0,0,0,.08)}
@keyframes nodeIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
.treemap-node:hover{filter:brightness(1.12);z-index:10;transform:scale(1.02);box-shadow:inset 0 1px 0 rgba(255,255,255,.18),inset 0 -1px 0 rgba(0,0,0,.1),0 2px 8px rgba(0,0,0,.15)}
.treemap-label{font-size:13px;font-weight:700;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.45)}
.treemap-size{font-size:12px;font-weight:600;margin-top:2px;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.45)}
.treemap-pct{font-size:11px;font-weight:500;margin-top:2px;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.45)}
.tooltip{position:fixed;background:${isDark ? "#252526" : "#fff"};border:1px solid ${c.border};border-radius:8px;padding:10px 14px;font-size:12px;pointer-events:none;z-index:1000;box-shadow:0 6px 20px rgba(0,0,0,.35);max-width:340px;display:none;line-height:1.5}
.tooltip .tt-title{font-weight:700;margin-bottom:6px;font-size:13px}
.tooltip .tt-row{display:flex;justify-content:space-between;gap:24px}
.tooltip .tt-key{color:${c.muted}}
.tooltip .tt-val{font-weight:600}
.tooltip .tt-src{font-size:10px;margin:2px 0}
.tooltip .tt-src a{text-decoration:none}
.legend{display:flex;gap:14px;margin-top:10px;font-size:11px;flex-shrink:0;flex-wrap:wrap}
.legend-item{display:flex;align-items:center;gap:5px}
.legend-color{width:10px;height:10px;border-radius:3px}
.section-list{display:none;flex:1;overflow:auto;padding:8px}
.section-list.active{display:block}
.section-row{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-radius:6px;font-size:14px;transition:background .1s}
.section-row:hover{background:${isDark ? "#2a2d2e" : "#f0f0f0"}}
.section-row .sec-name{font-weight:500;font-family:monospace;font-size:14px}
.section-row .sec-size{font-weight:600;font-size:14px}
.section-bar-bg{height:6px;background:${isDark ? "#3c3c3c" : "#e0e0e0"};border-radius:3px;margin:2px 14px 10px;overflow:hidden}
.section-bar{height:100%;border-radius:3px;transition:width .4s ease}
.error-msg{color:#d16969;font-size:13px;padding:12px;display:none}
.ctx-menu{position:fixed;background:${isDark ? "#252526" : "#fff"};border:1px solid ${isDark ? "#3c3c3c" : "#e0e0e0"};border-radius:6px;padding:4px 0;z-index:2000;box-shadow:0 4px 12px rgba(0,0,0,.3);min-width:140px}
.ctx-item{padding:6px 12px;font-size:12px;cursor:pointer;color:${isDark ? "#cccccc" : "#333333"}}
.ctx-item:hover{background:${isDark ? "#094771" : "#0066b8"};color:#fff}
`;
}


/***/ },

/***/ "./src/menuconfig/ConcurrentFileProcessor.ts"
/*!***************************************************!*\
  !*** ./src/menuconfig/ConcurrentFileProcessor.ts ***!
  \***************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ConcurrentFileProcessor: () => (/* binding */ ConcurrentFileProcessor)
/* harmony export */ });
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var glob__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! glob */ "./node_modules/glob/dist/esm/index.js");
/* harmony import */ var _logger_logger__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../logger/logger */ "./src/logger/logger.ts");
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



/**
 * 并发文件处理器 - 解决 880+ packages 文件串行读取性能问题
 * 这是性能优化的核心组件，将同步串行处理改为异步并发处理
 */
class ConcurrentFileProcessor {
    static DEFAULT_CONCURRENCY_LIMIT = 100; // 增加并发限制以提高性能
    static MAX_RETRIES = 3;
    static OPTIMAL_BATCH_SIZE = 200; // 优化的批次大小
    concurrencyLimit;
    fileContentCache = new Map();
    constructor(concurrencyLimit = ConcurrentFileProcessor.DEFAULT_CONCURRENCY_LIMIT) {
        this.concurrencyLimit = concurrencyLimit;
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.info(`[CONCURRENT_PROCESSOR] Initialized with concurrency limit: ${concurrencyLimit}`);
    }
    /**
     * 异步并发读取多个文件
     * @param filePaths 要读取的文件路径数组
     * @returns Promise<Map<string, string>> 文件路径到内容的映射
     */
    async readFilesAsync(filePaths) {
        const _startTime = Date.now();
        const results = new Map();
        // 创建分块处理，避免过多并发导致系统资源耗尽
        const chunks = this.chunkArray(filePaths, this.concurrencyLimit);
        for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
            const chunk = chunks[chunkIndex];
            const chunkPromises = chunk.map(filePath => this.readSingleFileWithRetry(filePath));
            const chunkResults = await Promise.allSettled(chunkPromises);
            // 处理结果
            chunkResults.forEach((result, index) => {
                const filePath = chunk[index];
                if (result.status === 'fulfilled' && result.value !== null) {
                    results.set(filePath, result.value);
                }
                else if (result.status === 'rejected') {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.warn(`[CONCURRENT_PROCESSOR] 无法读取文件: ${filePath}`);
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.error(`[CONCURRENT_PROCESSOR] 读取错误: ${result.reason}`);
                }
            });
        }
        const totalTime = Date.now() - _startTime;
        const successCount = results.size;
        const _avgTime = successCount > 0 ? (totalTime / successCount).toFixed(1) : 0;
        return results;
    }
    /**
     * 异步解析 glob 模式并读取文件
     * @param globPattern glob 匹配模式
     * @returns Promise<Map<string, string>> 文件路径到内容的映射
     */
    async processGlobPattern(globPattern) {
        const _startTime = Date.now();
        try {
            const matchedFiles = (await (0,glob__WEBPACK_IMPORTED_MODULE_1__.glob)(globPattern, { nodir: true })).sort();
            const _globTime = Date.now() - _startTime;
            if (matchedFiles.length === 0) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.warn(`[CONCURRENT_PROCESSOR] Glob 模式未匹配到任何文件: ${globPattern}`);
                return new Map();
            }
            return await this.readFilesAsync(matchedFiles);
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.error(`[CONCURRENT_PROCESSOR] Glob 解析失败: ${globPattern}`, error);
            return new Map();
        }
    }
    /**
     * 带重试的单文件读取
     */
    async readSingleFileWithRetry(filePath, retryCount = 0) {
        // 检查缓存
        if (this.fileContentCache.has(filePath)) {
            return this.fileContentCache.get(filePath);
        }
        try {
            const content = await fs__WEBPACK_IMPORTED_MODULE_0__.promises.readFile(filePath, 'utf8');
            // 缓存内容
            this.fileContentCache.set(filePath, content);
            return content;
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return null;
            }
            if (retryCount < ConcurrentFileProcessor.MAX_RETRIES) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.warn(`[CONCURRENT_PROCESSOR] 重试读取文件 ${filePath} (第 ${retryCount + 1} 次)`);
                await this.sleep(100 * (retryCount + 1)); // 递增延迟
                return this.readSingleFileWithRetry(filePath, retryCount + 1);
            }
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.error(`[CONCURRENT_PROCESSOR] 读取文件失败，已达最大重试次数: ${filePath}`, error);
            return null;
        }
    }
    /**
     * 数组分块
     */
    chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }
    /**
     * 估算性能提升倍数
     */
    estimateSpeedImprovement(fileCount, actualTime) {
        // 假设串行读取每个文件需要 50ms (保守估计)
        const estimatedSerialTime = fileCount * 50;
        return Math.round((estimatedSerialTime / actualTime) * 10) / 10;
    }
    /**
     * 延迟工具函数
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * 清理缓存
     */
    clearCache() {
        this.fileContentCache.clear();
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.info(`[CONCURRENT_PROCESSOR] 缓存已清理`);
    }
    /**
     * 获取缓存统计
     */
    getCacheStats() {
        const cacheSize = Array.from(this.fileContentCache.values())
            .reduce((total, content) => total + content.length, 0);
        return {
            cachedFiles: this.fileContentCache.size,
            cacheSize: `${(cacheSize / 1024 / 1024).toFixed(2)} MB`
        };
    }
}


/***/ },

/***/ "./src/menuconfig/ConditionEvaluator.ts"
/*!**********************************************!*\
  !*** ./src/menuconfig/ConditionEvaluator.ts ***!
  \**********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ConditionEvaluator: () => (/* binding */ ConditionEvaluator)
/* harmony export */ });
/* harmony import */ var _logger_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../logger/logger */ "./src/logger/logger.ts");
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

/**
 * Condition expression evaluator for Kconfig
 * Supports:
 * - Boolean operations: &&, ||, !
 * - Comparisons: =, !=, >, <, >=, <=
 * - Variable references
 * - Literal values (strings, numbers, booleans)
 */
class ConditionEvaluator {
    static MAX_RESULT_CACHE_SIZE = 20000;
    context;
    astCache = new Map();
    expressionVariableDeps = new Map();
    evaluationCache = new Map();
    contextVersion = 0;
    symbolVersions = new Map();
    constructor(context = {}) {
        this.context = context;
    }
    /**
     * Update the configuration context
     */
    updateContext(newContext) {
        let hasChanges = false;
        for (const [key, value] of Object.entries(newContext)) {
            if (!this.areValuesEqual(this.context[key], value)) {
                this.context[key] = value;
                hasChanges = true;
                this.bumpSymbolVersion(key);
            }
        }
        if (hasChanges) {
            this.contextVersion += 1;
        }
    }
    /**
     * Set a single configuration value
     */
    setValue(configName, value) {
        if (this.areValuesEqual(this.context[configName], value)) {
            return;
        }
        this.context[configName] = value;
        this.contextVersion += 1;
        this.bumpSymbolVersion(configName);
    }
    /**
     * Get a configuration value
     */
    getValue(configName) {
        return this.context[configName];
    }
    /**
     * Parse and evaluate a condition expression
     */
    evaluate(expression) {
        if (!expression || expression.trim() === '') {
            return true; // Empty condition is always true
        }
        try {
            const normalized = this.normalizeExpression(expression.trim());
            const ast = this.parseExpression(normalized);
            const deps = this.expressionVariableDeps.get(normalized) || [];
            const signature = this.buildExpressionSignature(deps);
            const cached = this.evaluationCache.get(normalized);
            if (cached && cached.signature === signature) {
                return cached.result;
            }
            const result = this.evaluateNode(ast);
            if (this.evaluationCache.size >= ConditionEvaluator.MAX_RESULT_CACHE_SIZE) {
                this.evaluationCache.clear();
            }
            this.evaluationCache.set(normalized, { signature, result });
            return result;
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_0__.Logger.warn(`Failed to evaluate condition: ${expression}. Error: ${error}`);
            return true; // Default to visible if evaluation fails
        }
    }
    /**
     * Parse condition expression into AST
     */
    parseExpression(expression) {
        const normalized = this.normalizeExpression(expression);
        if (normalized === '') {
            const literalTrue = {
                type: 'LITERAL',
                value: true,
                literalKind: 'boolean',
                rawValue: 'true'
            };
            this.astCache.set(normalized, literalTrue);
            this.expressionVariableDeps.set(normalized, []);
            return literalTrue;
        }
        const cached = this.astCache.get(normalized);
        if (cached) {
            return cached;
        }
        // Parse OR expressions (lowest precedence)
        const orMatch = this.findOperator(normalized, '||');
        if (orMatch) {
            const result = {
                type: 'OR',
                left: this.parseExpression(orMatch.left),
                right: this.parseExpression(orMatch.right)
            };
            this.astCache.set(normalized, result);
            this.expressionVariableDeps.set(normalized, this.collectVariableDeps(result));
            return result;
        }
        // Parse AND expressions
        const andMatch = this.findOperator(normalized, '&&');
        if (andMatch) {
            const result = {
                type: 'AND',
                left: this.parseExpression(andMatch.left),
                right: this.parseExpression(andMatch.right)
            };
            this.astCache.set(normalized, result);
            this.expressionVariableDeps.set(normalized, this.collectVariableDeps(result));
            return result;
        }
        // Parse NOT expressions
        if (normalized.startsWith('!')) {
            const result = {
                type: 'NOT',
                left: this.parseExpression(normalized.substring(1).trim())
            };
            this.astCache.set(normalized, result);
            this.expressionVariableDeps.set(normalized, this.collectVariableDeps(result));
            return result;
        }
        // Parse comparison expressions
        const comparisonMatch = this.findComparison(normalized);
        if (comparisonMatch) {
            const result = {
                type: 'COMPARISON',
                left: this.parseExpression(comparisonMatch.left),
                right: this.parseExpression(comparisonMatch.right),
                operator: comparisonMatch.operator
            };
            this.astCache.set(normalized, result);
            this.expressionVariableDeps.set(normalized, this.collectVariableDeps(result));
            return result;
        }
        // Parse literals and variables
        const literalNode = this.parseLiteral(normalized);
        this.astCache.set(normalized, literalNode);
        this.expressionVariableDeps.set(normalized, this.collectVariableDeps(literalNode));
        return literalNode;
    }
    collectVariableDeps(root) {
        const deps = new Set();
        const stack = [root];
        while (stack.length > 0) {
            const node = stack.pop();
            if (!node) {
                continue;
            }
            if (node.type === 'VARIABLE' && node.variable) {
                deps.add(node.variable);
            }
            if (node.left) {
                stack.push(node.left);
            }
            if (node.right) {
                stack.push(node.right);
            }
        }
        return Array.from(deps).sort();
    }
    buildExpressionSignature(variableNames) {
        if (!variableNames || variableNames.length === 0) {
            return 'const';
        }
        const parts = new Array(variableNames.length + 1);
        parts[0] = `v${this.contextVersion}`;
        for (let i = 0; i < variableNames.length; i++) {
            const name = variableNames[i];
            const version = this.symbolVersions.get(name) || 0;
            parts[i + 1] = `${name}:${version}`;
        }
        return parts.join('|');
    }
    bumpSymbolVersion(symbol) {
        const prev = this.symbolVersions.get(symbol) || 0;
        this.symbolVersions.set(symbol, prev + 1);
    }
    areValuesEqual(a, b) {
        return a === b;
    }
    normalizeExpression(expression) {
        if (!expression) {
            return '';
        }
        let normalized = expression.trim();
        normalized = this.removeOuterParentheses(normalized);
        return normalized;
    }
    /**
     * Remove outer parentheses if they wrap the entire expression
     */
    removeOuterParentheses(expression) {
        let trimmed = expression.trim();
        while (trimmed.startsWith('(') && trimmed.endsWith(')')) {
            let depth = 0;
            let canStrip = true;
            for (let i = 0; i < trimmed.length; i++) {
                const ch = trimmed[i];
                if (ch === '(') {
                    depth++;
                }
                else if (ch === ')') {
                    depth--;
                    if (depth === 0 && i < trimmed.length - 1) {
                        canStrip = false;
                        break;
                    }
                }
            }
            if (!canStrip) {
                break;
            }
            trimmed = trimmed.substring(1, trimmed.length - 1).trim();
        }
        return trimmed;
    }
    /**
     * Find operator at the top level (not inside parentheses)
     */
    findOperator(expression, operator) {
        // Logger.debug(`[FIND_OP] Looking for "${operator}" in "${expression}"`);
        let depth = 0;
        let lastFoundIndex = -1;
        // 从左向右扫描，正确处理括号嵌套
        for (let i = 0; i < expression.length - operator.length + 1; i++) {
            if (expression[i] === '(') {
                depth++;
                // Logger.debug(`[FIND_OP] At index ${i}, char='(', depth=${depth}`);
            }
            else if (expression[i] === ')') {
                depth--;
                // Logger.debug(`[FIND_OP] At index ${i}, char=')', depth=${depth}`);
            }
            else if (depth === 0 && expression.substring(i, i + operator.length) === operator) {
                // Logger.debug(`[FIND_OP] Found "${operator}" at index ${i}, depth=${depth}`);
                lastFoundIndex = i;
                // 继续寻找最后一个操作符（优先右结合）
            }
        }
        if (lastFoundIndex !== -1) {
            const result = {
                left: expression.substring(0, lastFoundIndex).trim(),
                right: expression.substring(lastFoundIndex + operator.length).trim()
            };
            // Logger.debug(`[FIND_OP] Split: left="${result.left}", right="${result.right}"`);
            return result;
        }
        // Logger.debug(`[FIND_OP] Operator "${operator}" not found`);
        return null;
    }
    /**
     * Find comparison operator at the top level
     */
    findComparison(expression) {
        const operators = ['!=', '>=', '<=', '=', '>', '<'];
        for (const op of operators) {
            let depth = 0;
            let lastFoundIndex = -1;
            for (let i = expression.length - op.length; i >= 0; i--) {
                if (expression[i] === ')') {
                    depth++;
                }
                else if (expression[i] === '(') {
                    depth--;
                }
                else if (depth === 0 && expression.substring(i, i + op.length) === op) {
                    lastFoundIndex = i;
                    break;
                }
            }
            if (lastFoundIndex !== -1) {
                return {
                    left: expression.substring(0, lastFoundIndex).trim(),
                    right: expression.substring(lastFoundIndex + op.length).trim(),
                    operator: op
                };
            }
        }
        return null;
    }
    /**
     * Parse literal values and variables
     */
    parseLiteral(expression) {
        expression = expression.trim();
        // String literal
        if (expression.startsWith('"') && expression.endsWith('"')) {
            return {
                type: 'LITERAL',
                value: expression.substring(1, expression.length - 1),
                literalKind: 'string',
                rawValue: expression
            };
        }
        // Number literal
        if (/^-?\d+$/.test(expression)) {
            return {
                type: 'LITERAL',
                value: parseInt(expression),
                literalKind: 'number',
                rawValue: expression
            };
        }
        // Hex literal
        if (/^0x[0-9a-fA-F]+$/.test(expression)) {
            return {
                type: 'LITERAL',
                value: parseInt(expression, 16),
                literalKind: 'hex',
                rawValue: expression
            };
        }
        // Boolean literals
        if (expression === 'm' || expression === 'M') {
            return {
                type: 'LITERAL',
                value: 'm',
                literalKind: 'tristate',
                rawValue: expression
            };
        }
        if (expression === 'y' || expression === 'true') {
            return {
                type: 'LITERAL',
                value: true,
                literalKind: expression === 'y' ? 'tristate' : 'boolean',
                rawValue: expression
            };
        }
        if (expression === 'n' || expression === 'false') {
            return {
                type: 'LITERAL',
                value: false,
                literalKind: expression === 'n' ? 'tristate' : 'boolean',
                rawValue: expression
            };
        }
        // Variable reference
        return {
            type: 'VARIABLE',
            variable: expression
        };
    }
    /**
     * Evaluate AST node
     */
    evaluateNode(node) {
        switch (node.type) {
            case 'AND':
                return this.evaluateNode(node.left) && this.evaluateNode(node.right);
            case 'OR':
                return this.evaluateNode(node.left) || this.evaluateNode(node.right);
            case 'NOT':
                return !this.evaluateNode(node.left);
            case 'COMPARISON':
                return this.evaluateComparison(node);
            case 'VARIABLE':
                return this.evaluateVariable(node.variable);
            case 'LITERAL':
                return this.toLiteral(node.value);
            default:
                _logger_logger__WEBPACK_IMPORTED_MODULE_0__.Logger.warn(`Unknown node type: ${node.type}`);
                return true;
        }
    }
    /**
     * Evaluate comparison node
     */
    evaluateComparison(node) {
        const leftValue = this.getNodeValue(node.left);
        const rightValue = this.getNodeValue(node.right);
        const { left: leftNormalized, right: rightNormalized } = this.normalizeComparisonOperands(leftValue, rightValue, node.left, node.right);
        switch (node.operator) {
            case '=':
                return leftNormalized === rightNormalized;
            case '!=':
                return leftNormalized !== rightNormalized;
            case '>':
                return this.toNumber(leftNormalized) > this.toNumber(rightNormalized);
            case '<':
                return this.toNumber(leftNormalized) < this.toNumber(rightNormalized);
            case '>=':
                return this.toNumber(leftNormalized) >= this.toNumber(rightNormalized);
            case '<=':
                return this.toNumber(leftNormalized) <= this.toNumber(rightNormalized);
            default:
                _logger_logger__WEBPACK_IMPORTED_MODULE_0__.Logger.warn(`Unknown comparison operator: ${node.operator}`);
                return true;
        }
    }
    /**
     * Get the actual value from a node
     */
    getNodeValue(node) {
        switch (node.type) {
            case 'VARIABLE':
                return this.context[node.variable];
            case 'LITERAL':
                return node.value;
            default:
                return this.evaluateNode(node);
        }
    }
    /**
     * Evaluate variable reference
     */
    evaluateVariable(variable) {
        const value = this.context[variable];
        // Logger.debug(`[EVALUATOR] Variable ${variable} = ${value} (type: ${typeof value})`);
        const result = this.toBoolean(value);
        // Logger.debug(`[EVALUATOR] toBoolean(${value}) = ${result}`);
        return result;
    }
    /**
     * Convert value to boolean
     */
    toBoolean(value) {
        if (value === undefined || value === null) {
            return false;
        }
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'number') {
            return value !== 0;
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed === '') {
                return false;
            }
            const lower = trimmed.toLowerCase();
            if (lower === 'y' || lower === 'yes' || lower === 'true' || lower === 'on') {
                return true;
            }
            if (lower === 'm') {
                return true;
            }
            if (lower === 'n' || lower === 'no' || lower === 'false' || lower === 'off') {
                return false;
            }
            if (/^0x[0-9a-f]+$/i.test(trimmed)) {
                return parseInt(trimmed, 16) !== 0;
            }
            if (/^-?\d+$/.test(trimmed)) {
                return parseInt(trimmed, 10) !== 0;
            }
            return true;
        }
        return Boolean(value);
    }
    /**
     * Convert value to literal boolean
     */
    toLiteral(value) {
        if (typeof value === 'boolean') {
            return value;
        }
        return this.toBoolean(value);
    }
    /**
     * Convert value to number
     */
    toNumber(value) {
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string') {
            const lower = value.toLowerCase();
            if (lower === 'y') {
                return 2;
            }
            if (lower === 'm') {
                return 1;
            }
            if (lower === 'n') {
                return 0;
            }
            if (value.startsWith('0x')) {
                return parseInt(value, 16);
            }
            return parseInt(value) || 0;
        }
        if (typeof value === 'boolean') {
            return value ? 1 : 0;
        }
        return 0;
    }
    normalizeComparisonValue(value, options) {
        if (value === undefined || value === null) {
            return value;
        }
        if (typeof value === 'boolean') {
            return value ? 'y' : 'n';
        }
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (options?.forceString) {
                return trimmed;
            }
            const lower = trimmed.toLowerCase();
            if (lower === 'y' || lower === 'm' || lower === 'n') {
                return lower;
            }
            if (lower === 'true') {
                return 'y';
            }
            if (lower === 'false') {
                return 'n';
            }
            const numericCandidate = this.tryConvertStringToNumber(trimmed);
            if (numericCandidate !== null) {
                return numericCandidate;
            }
            return trimmed;
        }
        return value;
    }
    normalizeComparisonOperands(left, right, leftNode, rightNode) {
        const leftIsPlainString = this.isPlainStringValue(left);
        const rightIsPlainString = this.isPlainStringValue(right);
        const treatAsString = this.isStringLiteral(leftNode) || this.isStringLiteral(rightNode);
        const forceString = treatAsString || leftIsPlainString || rightIsPlainString;
        let leftNormalized = this.normalizeComparisonValue(left, { forceString });
        let rightNormalized = this.normalizeComparisonValue(right, { forceString });
        if (leftIsPlainString && typeof rightNormalized === 'number') {
            rightNormalized = this.numericLiteralToString(rightNode, rightNormalized);
        }
        if (rightIsPlainString && typeof leftNormalized === 'number') {
            leftNormalized = this.numericLiteralToString(leftNode, leftNormalized);
        }
        if (typeof leftNormalized === 'number' && this.isTristateString(rightNormalized)) {
            rightNormalized = this.tristateToNumber(rightNormalized);
        }
        else if (typeof rightNormalized === 'number' && this.isTristateString(leftNormalized)) {
            leftNormalized = this.tristateToNumber(leftNormalized);
        }
        return { left: leftNormalized, right: rightNormalized };
    }
    isPlainStringValue(value) {
        if (typeof value !== 'string') {
            return false;
        }
        const trimmed = value.trim();
        const lower = trimmed.toLowerCase();
        if (lower === 'y' || lower === 'm' || lower === 'n') {
            return false;
        }
        if (lower === 'true' || lower === 'false' || lower === 'on' || lower === 'off') {
            return false;
        }
        if (this.tryConvertStringToNumber(trimmed) !== null) {
            return false;
        }
        return true;
    }
    isTristateString(value) {
        if (typeof value !== 'string') {
            return false;
        }
        const lower = value.toLowerCase();
        return lower === 'y' || lower === 'm' || lower === 'n';
    }
    isStringLiteral(node) {
        if (!node) {
            return false;
        }
        return node.type === 'LITERAL' && node.literalKind === 'string';
    }
    numericLiteralToString(node, value) {
        if (node && node.type === 'LITERAL') {
            if (node.literalKind === 'hex' && node.rawValue) {
                return node.rawValue;
            }
            if (node.literalKind === 'number' && node.rawValue) {
                return node.rawValue;
            }
        }
        return String(value);
    }
    tryConvertStringToNumber(value) {
        if (value === '') {
            return null;
        }
        const sign = value.startsWith('-') ? -1 : 1;
        const unsigned = (value[0] === '+' || value[0] === '-') ? value.substring(1) : value;
        if (unsigned === '') {
            return null;
        }
        if (/^0[xX][0-9a-fA-F]+$/.test(unsigned)) {
            return sign * parseInt(unsigned.substring(2), 16);
        }
        if (/^0[bB][01]+$/.test(unsigned)) {
            return sign * parseInt(unsigned.substring(2), 2);
        }
        if (/^0[oO][0-7]+$/.test(unsigned)) {
            return sign * parseInt(unsigned.substring(2), 8);
        }
        if (/^0+$/.test(unsigned)) {
            return 0;
        }
        if (/^[1-9][0-9]*$/.test(unsigned)) {
            return sign * parseInt(unsigned, 10);
        }
        return null;
    }
    tristateToNumber(value) {
        const lower = value.toLowerCase();
        if (lower === 'y') {
            return 2;
        }
        if (lower === 'm') {
            return 1;
        }
        return 0;
    }
}


/***/ },

/***/ "./src/menuconfig/ExpressionParser.ts"
/*!********************************************!*\
  !*** ./src/menuconfig/ExpressionParser.ts ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ExprType: () => (/* binding */ ExprType),
/* harmony export */   ExpressionParser: () => (/* binding */ ExpressionParser)
/* harmony export */ });
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
/**
 * Expression types in Kconfig
 */
/* eslint-disable no-unused-vars */
var ExprType;
(function (ExprType) {
    ExprType["SYMBOL"] = "SYMBOL";
    ExprType["STRING"] = "STRING";
    ExprType["NUMBER"] = "NUMBER";
    ExprType["AND"] = "AND";
    ExprType["OR"] = "OR";
    ExprType["NOT"] = "NOT";
    ExprType["EQUAL"] = "EQUAL";
    ExprType["UNEQUAL"] = "UNEQUAL";
    ExprType["LESS"] = "LESS";
    ExprType["LESS_EQUAL"] = "LESS_EQUAL";
    ExprType["GREATER"] = "GREATER";
    ExprType["GREATER_EQUAL"] = "GREATER_EQUAL";
})(ExprType || (ExprType = {}));
/**
 * Parser for Kconfig expressions.
 * Converts string expressions to AST and provides dependency analysis.
 *
 * This implementation matches Kconfiglib's expression handling,
 * particularly the _expr_depends_on function behavior.
 */
class ExpressionParser {
    pos = 0;
    expr = '';
    /**
     * Parse a Kconfig expression into an AST.
     *
     * Grammar:
     * expression   := or_expr
     * or_expr      := and_expr ('||' and_expr)*
     * and_expr     := not_expr ('&&' not_expr)*
     * not_expr     := '!' not_expr | comparison
     * comparison   := primary (('=' | '!=' | '<' | '<=' | '>' | '>=') primary)?
     * primary      := '(' expression ')' | SYMBOL | STRING | NUMBER
     */
    parse(expr) {
        this.expr = expr.trim();
        this.pos = 0;
        if (!this.expr) {
            // Empty expression defaults to 'y' (always true)
            return { type: ExprType.SYMBOL, value: 'y' };
        }
        const result = this.parseOr();
        // Ensure we've consumed the entire expression
        this.skipWhitespace();
        if (this.pos < this.expr.length) {
            throw new Error(`Unexpected token at position ${this.pos}: ${this.expr.substring(this.pos)}`);
        }
        return result;
    }
    parseOr() {
        let left = this.parseAnd();
        while (this.consumeToken('||')) {
            const right = this.parseAnd();
            left = { type: ExprType.OR, left, right };
        }
        return left;
    }
    parseAnd() {
        let left = this.parseNot();
        while (this.consumeToken('&&')) {
            const right = this.parseNot();
            left = { type: ExprType.AND, left, right };
        }
        return left;
    }
    parseNot() {
        if (this.consumeToken('!')) {
            return {
                type: ExprType.NOT,
                left: this.parseNot() // Support nested NOT
            };
        }
        return this.parseComparison();
    }
    parseComparison() {
        const left = this.parsePrimary();
        // Check for comparison operators
        if (this.consumeToken('>=')) {
            return { type: ExprType.GREATER_EQUAL, left, right: this.parsePrimary() };
        }
        if (this.consumeToken('<=')) {
            return { type: ExprType.LESS_EQUAL, left, right: this.parsePrimary() };
        }
        if (this.consumeToken('!=')) {
            return { type: ExprType.UNEQUAL, left, right: this.parsePrimary() };
        }
        if (this.consumeToken('=')) {
            return { type: ExprType.EQUAL, left, right: this.parsePrimary() };
        }
        if (this.consumeToken('>')) {
            return { type: ExprType.GREATER, left, right: this.parsePrimary() };
        }
        if (this.consumeToken('<')) {
            return { type: ExprType.LESS, left, right: this.parsePrimary() };
        }
        return left;
    }
    parsePrimary() {
        this.skipWhitespace();
        // Parenthesized expression
        if (this.expr[this.pos] === '(') {
            this.pos++;
            const node = this.parseOr();
            this.skipWhitespace();
            if (this.expr[this.pos] !== ')') {
                throw new Error(`Expected ')' at position ${this.pos}`);
            }
            this.pos++;
            return node;
        }
        // String literal
        if (this.expr[this.pos] === '"') {
            return this.parseString();
        }
        // Number or symbol
        return this.parseSymbolOrNumber();
    }
    parseString() {
        this.pos++; // Skip opening quote
        const start = this.pos;
        while (this.pos < this.expr.length && this.expr[this.pos] !== '"') {
            if (this.expr[this.pos] === '\\') {
                this.pos++; // Skip escape character
            }
            this.pos++;
        }
        if (this.pos >= this.expr.length) {
            throw new Error('Unterminated string');
        }
        const value = this.expr.substring(start, this.pos);
        this.pos++; // Skip closing quote
        return { type: ExprType.STRING, value };
    }
    parseSymbolOrNumber() {
        this.skipWhitespace();
        const start = this.pos;
        // Match symbol names (alphanumeric, underscore)
        // Kconfig symbols typically use uppercase, but we support all cases
        while (this.pos < this.expr.length &&
            /[A-Za-z0-9_]/.test(this.expr[this.pos])) {
            this.pos++;
        }
        if (this.pos === start) {
            throw new Error(`Expected symbol or number at position ${this.pos}`);
        }
        const value = this.expr.substring(start, this.pos);
        // Check if it's a number
        if (/^\d+$/.test(value)) {
            return { type: ExprType.NUMBER, value: parseInt(value, 10) };
        }
        // It's a symbol
        return { type: ExprType.SYMBOL, value };
    }
    /**
     * Check if an expression depends on a symbol.
     *
     * CRITICAL: This matches Kconfiglib's _expr_depends_on behavior:
     * - NOT operations return false (do not create dependency)
     * - This is key to proper indentation behavior
     */
    exprDependsOn(expr, symbol) {
        // Helpers for constant detection
        const isConstY = (n) => !!n && (n.type === ExprType.SYMBOL && n.value === 'y');
        const isConstM = (n) => !!n && (n.type === ExprType.SYMBOL && n.value === 'm');
        const isConstN = (n) => !!n && (n.type === ExprType.SYMBOL && n.value === 'n');
        const isSym = (n, name) => !!n && n.type === ExprType.SYMBOL && n.value === name;
        switch (expr.type) {
            case ExprType.SYMBOL:
                return expr.value === symbol;
            case ExprType.AND:
                // Only AND chain contributes dependency
                return (expr.left ? this.exprDependsOn(expr.left, symbol) : false) ||
                    (expr.right ? this.exprDependsOn(expr.right, symbol) : false);
            case ExprType.OR:
                // OR never creates dependency in Kconfiglib semantics
                return false;
            case ExprType.NOT:
                // NOT never creates dependency
                return false;
            case ExprType.EQUAL: {
                // A = y/m or y/m = A
                const L = expr.left, R = expr.right;
                if (isSym(L, symbol) && (isConstY(R) || isConstM(R)))
                    return true;
                if (isSym(R, symbol) && (isConstY(L) || isConstM(L)))
                    return true;
                return false;
            }
            case ExprType.UNEQUAL: {
                // A != n or n != A
                const L = expr.left, R = expr.right;
                if (isSym(L, symbol) && isConstN(R))
                    return true;
                if (isSym(R, symbol) && isConstN(L))
                    return true;
                return false;
            }
            case ExprType.LESS:
            case ExprType.LESS_EQUAL:
            case ExprType.GREATER:
            case ExprType.GREATER_EQUAL:
            case ExprType.STRING:
            case ExprType.NUMBER:
                return false;
            default:
                return false;
        }
    }
    /**
     * Check if an expression is a pure negation (e.g., !A or !A && !B).
     * Used to determine if an if block should be flattened.
     */
    isPureNegation(expr) {
        switch (expr.type) {
            case ExprType.NOT:
                return true;
            case ExprType.AND:
                // All operands must be negations
                return (expr.left ? this.isPureNegation(expr.left) : true) &&
                    (expr.right ? this.isPureNegation(expr.right) : true);
            default:
                return false;
        }
    }
    /**
     * Convert an expression node back to string (for debugging).
     */
    toString(expr) {
        switch (expr.type) {
            case ExprType.SYMBOL:
                return expr.value;
            case ExprType.STRING:
                return `"${expr.value}"`;
            case ExprType.NUMBER:
                return expr.value.toString();
            case ExprType.NOT:
                return `!${expr.left ? this.toString(expr.left) : ''}`;
            case ExprType.AND:
                return `(${expr.left ? this.toString(expr.left) : ''} && ${expr.right ? this.toString(expr.right) : ''})`;
            case ExprType.OR:
                return `(${expr.left ? this.toString(expr.left) : ''} || ${expr.right ? this.toString(expr.right) : ''})`;
            case ExprType.EQUAL:
                return `${expr.left ? this.toString(expr.left) : ''} = ${expr.right ? this.toString(expr.right) : ''}`;
            case ExprType.UNEQUAL:
                return `${expr.left ? this.toString(expr.left) : ''} != ${expr.right ? this.toString(expr.right) : ''}`;
            case ExprType.LESS:
                return `${expr.left ? this.toString(expr.left) : ''} < ${expr.right ? this.toString(expr.right) : ''}`;
            case ExprType.LESS_EQUAL:
                return `${expr.left ? this.toString(expr.left) : ''} <= ${expr.right ? this.toString(expr.right) : ''}`;
            case ExprType.GREATER:
                return `${expr.left ? this.toString(expr.left) : ''} > ${expr.right ? this.toString(expr.right) : ''}`;
            case ExprType.GREATER_EQUAL:
                return `${expr.left ? this.toString(expr.left) : ''} >= ${expr.right ? this.toString(expr.right) : ''}`;
            default:
                return '';
        }
    }
    consumeToken(token) {
        this.skipWhitespace();
        if (this.pos + token.length > this.expr.length) {
            return false;
        }
        // Check if the token matches at current position
        for (let i = 0; i < token.length; i++) {
            if (this.expr[this.pos + i] !== token[i]) {
                return false;
            }
        }
        // Make sure it's not part of a longer token (e.g., "=" vs "==")
        // This is especially important for operators
        if (token === '=' || token === '!' || token === '<' || token === '>') {
            const nextChar = this.expr[this.pos + token.length];
            if (nextChar === '=' || (token === '<' && nextChar === '=') || (token === '>' && nextChar === '=')) {
                return false;
            }
        }
        this.pos += token.length;
        return true;
    }
    skipWhitespace() {
        while (this.pos < this.expr.length && /\s/.test(this.expr[this.pos])) {
            this.pos++;
        }
    }
}


/***/ },

/***/ "./src/menuconfig/KconfigMenuLoader.ts"
/*!*********************************************!*\
  !*** ./src/menuconfig/KconfigMenuLoader.ts ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   KconfigMenuLoader: () => (/* binding */ KconfigMenuLoader)
/* harmony export */ });
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _Menu__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Menu */ "./src/menuconfig/Menu.ts");
/* harmony import */ var _helpTextFormatter__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./helpTextFormatter */ "./src/menuconfig/helpTextFormatter.ts");
/* harmony import */ var _logger_logger__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../logger/logger */ "./src/logger/logger.ts");
/* harmony import */ var _KconfigParser__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./KconfigParser */ "./src/menuconfig/KconfigParser.ts");
/* harmony import */ var _KconfigSessionCache__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./KconfigSessionCache */ "./src/menuconfig/KconfigSessionCache.ts");
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







class KconfigMenuLoader {
    static updateValues(config, values) {
        const newConfig = config;
        if (Object.prototype.hasOwnProperty.call(values.values, newConfig.name) &&
            newConfig.type !== _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.choice) {
            newConfig.value =
                newConfig.type === _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.hex
                    ? values.values[newConfig.name].toString(16)
                    : values.values[newConfig.name];
        }
        if (Object.prototype.hasOwnProperty.call(values.visible, newConfig.id)) {
            newConfig.isVisible = values.visible[newConfig.id];
        }
        if (Object.prototype.hasOwnProperty.call(values.ranges, newConfig.name)) {
            newConfig.range = values.ranges[newConfig.name];
        }
        for (let i = 0; i < newConfig.children.length; i++) {
            newConfig.children[i] = this.updateValues(newConfig.children[i], values);
            if (newConfig.type === _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.choice) {
                values.values[newConfig.children[i].name]
                    ? (newConfig.value = newConfig.children[i].name)
                    : (newConfig.children[i].value = false);
            }
        }
        return newConfig;
    }
    workspaceFolder;
    targetFile;
    constructor(workspaceFolder, targetFile) {
        this.workspaceFolder = workspaceFolder;
        this.targetFile = targetFile;
    }
    async loadKconfigMenus() {
        // If a specific target file was provided, use it
        if (this.targetFile) {
            const targetPath = this.targetFile.fsPath;
            if (fs__WEBPACK_IMPORTED_MODULE_0__.existsSync(targetPath)) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_4__.Logger.info(`Parsing specific Kconfig file: ${targetPath}`);
                try {
                    const parsedMenus = await this.parseMenusWithCache(targetPath);
                    if (parsedMenus.length === 0) {
                        _logger_logger__WEBPACK_IMPORTED_MODULE_4__.Logger.warn("No menus parsed from target Kconfig file, using demo menus");
                        return this.createDemoMenus();
                    }
                    _logger_logger__WEBPACK_IMPORTED_MODULE_4__.Logger.info(`Successfully parsed ${parsedMenus.length} menus from target Kconfig file`);
                    return parsedMenus;
                }
                catch (error) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_4__.Logger.error("Failed to parse target Kconfig file", error);
                    return this.createDemoMenus();
                }
            }
            else {
                _logger_logger__WEBPACK_IMPORTED_MODULE_4__.Logger.warn(`Target Kconfig file not found: ${targetPath}`);
            }
        }
        // Fallback to finding Kconfig files in the workspace
        const kconfigFiles = this.findKconfigFiles();
        if (kconfigFiles.length === 0) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_4__.Logger.warn("No Kconfig files found, using demo menus");
            return this.createDemoMenus();
        }
        // Use the main Kconfig file (usually just "Kconfig")
        const mainKconfigFile = kconfigFiles.find(f => path__WEBPACK_IMPORTED_MODULE_1__.basename(f) === "Kconfig") || kconfigFiles[0];
        try {
            const parsedMenus = await this.parseMenusWithCache(mainKconfigFile);
            if (parsedMenus.length === 0) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_4__.Logger.warn("No menus parsed from Kconfig files, using demo menus");
                return this.createDemoMenus();
            }
            _logger_logger__WEBPACK_IMPORTED_MODULE_4__.Logger.info(`Successfully parsed ${parsedMenus.length} menus from Kconfig files`);
            return parsedMenus;
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_4__.Logger.error("Failed to parse Kconfig files", error);
            return this.createDemoMenus();
        }
    }
    async parseMenusWithCache(mainKconfigFile) {
        const cache = new _KconfigSessionCache__WEBPACK_IMPORTED_MODULE_6__.KconfigSessionCache(this.workspaceFolder.fsPath);
        const cacheKey = _KconfigSessionCache__WEBPACK_IMPORTED_MODULE_6__.KconfigSessionCache.buildCacheKey(mainKconfigFile);
        const cachedMenus = await cache.load(cacheKey);
        if (cachedMenus && cachedMenus.length > 0) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_4__.Logger.info(() => `[SESSION_CACHE] Loaded ${cachedMenus.length} menus from cache: ${mainKconfigFile}`);
            return cachedMenus;
        }
        const parser = new _KconfigParser__WEBPACK_IMPORTED_MODULE_5__.KconfigParser({
            workspaceFolder: this.workspaceFolder.fsPath,
            mainKconfigFile: mainKconfigFile
        });
        const parsedMenus = await parser.parse();
        if (parsedMenus.length > 0) {
            await cache.save(cacheKey, parsedMenus, parser.getParsedFiles());
        }
        return parsedMenus;
    }
    mapJsonToMenuObject(config) {
        const menu = {
            id: config.id,
            name: config.name,
            help: (0,_helpTextFormatter__WEBPACK_IMPORTED_MODULE_3__.formatHelpText)(config.help),
            range: config.range,
            title: config.title,
            type: config.type,
            isCollapsed: false,
            isMenuconfig: config.is_menuconfig,
            isVisible: false,
            dependsOn: config.depends_on,
            children: [],
            value: null,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        for (const child of config.children) {
            const childMenu = this.mapJsonToMenuObject(child);
            menu.children.push(childMenu);
        }
        return menu;
    }
    findKconfigFiles() {
        const kconfigFiles = [];
        // Common Kconfig file names to look for
        const commonKconfigNames = [
            "Kconfig",
            "kconfig",
            "Config.in",
            "Kconfig.projbuild",
            "Kconfig.in"
        ];
        for (const filename of commonKconfigNames) {
            const filepath = path__WEBPACK_IMPORTED_MODULE_1__.join(this.workspaceFolder.fsPath, filename);
            if (fs__WEBPACK_IMPORTED_MODULE_0__.existsSync(filepath)) {
                kconfigFiles.push(filepath);
            }
        }
        // Also look for Kconfig files in common subdirectories
        const commonSubdirs = ["components", "main", "src"];
        for (const subdir of commonSubdirs) {
            const subdirPath = path__WEBPACK_IMPORTED_MODULE_1__.join(this.workspaceFolder.fsPath, subdir);
            if (fs__WEBPACK_IMPORTED_MODULE_0__.existsSync(subdirPath)) {
                for (const filename of commonKconfigNames) {
                    const filepath = path__WEBPACK_IMPORTED_MODULE_1__.join(subdirPath, filename);
                    if (fs__WEBPACK_IMPORTED_MODULE_0__.existsSync(filepath)) {
                        kconfigFiles.push(filepath);
                    }
                }
            }
        }
        return kconfigFiles;
    }
    createDemoMenus() {
        const demoMenus = [];
        const mainMenu = {
            id: "main",
            name: "MAIN_MENU",
            title: "Main Menu",
            type: _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.menu,
            isVisible: true,
            children: this.createDemoConfigItems(),
            help: "",
            range: [],
            isCollapsed: false,
            value: null,
            dependsOn: "",
            isMenuconfig: false,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        demoMenus.push(mainMenu);
        return demoMenus;
    }
    createDemoConfigItems() {
        const items = [];
        // Bool config example
        const boolConfig = {
            id: "bool-example",
            name: "CONFIG_EXAMPLE_BOOL",
            title: "Enable Example Feature",
            type: _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.bool,
            value: true,
            help: "This is a demo boolean configuration option.",
            isVisible: true,
            children: [],
            range: [],
            isCollapsed: false,
            dependsOn: "",
            isMenuconfig: false,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        items.push(boolConfig);
        // String config example
        const stringConfig = {
            id: "string-example",
            name: "CONFIG_EXAMPLE_STRING",
            title: "Example String Value",
            type: _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.string,
            value: "default",
            help: "This is a demo string configuration option.",
            isVisible: true,
            children: [],
            range: [],
            isCollapsed: false,
            dependsOn: "",
            isMenuconfig: false,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        items.push(stringConfig);
        // Int config example
        const intConfig = {
            id: "int-example",
            name: "CONFIG_EXAMPLE_INT",
            title: "Example Integer Value",
            type: _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.int,
            value: 100,
            range: [1, 1000],
            help: "This is a demo integer configuration option.",
            isVisible: true,
            children: [],
            isCollapsed: false,
            dependsOn: "",
            isMenuconfig: false,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        items.push(intConfig);
        // Hex config example
        const hexConfig = {
            id: "hex-example",
            name: "CONFIG_EXAMPLE_HEX",
            title: "Example Hex Value",
            type: _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.hex,
            value: "0x1000",
            help: "This is a demo hex configuration option.",
            isVisible: true,
            children: [],
            range: [],
            isCollapsed: false,
            dependsOn: "",
            isMenuconfig: false,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        items.push(hexConfig);
        // Choice config example
        const choiceConfig = {
            id: "choice-example",
            name: "CONFIG_EXAMPLE_CHOICE",
            title: "Example Choice",
            type: _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.choice,
            value: "option1",
            help: "This is a demo choice configuration option.",
            isVisible: true,
            children: [],
            range: [],
            isCollapsed: false,
            dependsOn: "",
            isMenuconfig: false,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        // Add choice options as children
        const option1 = {
            id: "choice-option1",
            name: "CONFIG_EXAMPLE_CHOICE_OPTION1",
            title: "Option 1",
            type: _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.bool,
            value: true,
            isVisible: true,
            children: [],
            help: "",
            range: [],
            isCollapsed: false,
            dependsOn: "",
            isMenuconfig: false,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        const option2 = {
            id: "choice-option2",
            name: "CONFIG_EXAMPLE_CHOICE_OPTION2",
            title: "Option 2",
            type: _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.bool,
            value: false,
            isVisible: true,
            children: [],
            help: "",
            range: [],
            isCollapsed: false,
            dependsOn: "",
            isMenuconfig: false,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        choiceConfig.children = [option1, option2];
        items.push(choiceConfig);
        // Submenu example
        const submenu = {
            id: "submenu-example",
            name: "SUBMENU_EXAMPLE",
            title: "Example Submenu",
            type: _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.menu,
            isVisible: true,
            children: this.createSubMenuItems(),
            help: "",
            range: [],
            isCollapsed: false,
            value: null,
            dependsOn: "",
            isMenuconfig: false,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        items.push(submenu);
        return items;
    }
    createSubMenuItems() {
        const items = [];
        const subBoolConfig = {
            id: "sub-bool-example",
            name: "CONFIG_SUB_EXAMPLE_BOOL",
            title: "Sub Example Bool",
            type: _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.bool,
            value: false,
            help: "This is a demo boolean configuration in a submenu.",
            isVisible: true,
            children: [],
            range: [],
            isCollapsed: false,
            dependsOn: "",
            isMenuconfig: false,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        items.push(subBoolConfig);
        const subStringConfig = {
            id: "sub-string-example",
            name: "CONFIG_SUB_EXAMPLE_STRING",
            title: "Sub Example String",
            type: _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.string,
            value: "submenu-default",
            help: "This is a demo string configuration in a submenu.",
            isVisible: true,
            children: [],
            range: [],
            isCollapsed: false,
            dependsOn: "",
            isMenuconfig: false,
            select: [],
            selectedBy: [],
            hasPrompt: true
        };
        items.push(subStringConfig);
        return items;
    }
}


/***/ },

/***/ "./src/menuconfig/KconfigParser.ts"
/*!*****************************************!*\
  !*** ./src/menuconfig/KconfigParser.ts ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   KconfigParser: () => (/* binding */ KconfigParser)
/* harmony export */ });
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var glob__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! glob */ "./node_modules/glob/dist/esm/index.js");
/* harmony import */ var _Menu__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Menu */ "./src/menuconfig/Menu.ts");
/* harmony import */ var _MenuNode__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./MenuNode */ "./src/menuconfig/MenuNode.ts");
/* harmony import */ var _ExpressionParser__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ExpressionParser */ "./src/menuconfig/ExpressionParser.ts");
/* harmony import */ var _logger_logger__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../logger/logger */ "./src/logger/logger.ts");
/* harmony import */ var _VisibilityManager__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./VisibilityManager */ "./src/menuconfig/VisibilityManager.ts");
/* harmony import */ var _helpTextFormatter__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./helpTextFormatter */ "./src/menuconfig/helpTextFormatter.ts");
/* harmony import */ var _ConcurrentFileProcessor__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./ConcurrentFileProcessor */ "./src/menuconfig/ConcurrentFileProcessor.ts");
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










/**
 * KconfigParser - Refactored version using MenuNode tree structure.
 *
 * This implementation matches Kconfiglib's behavior:
 * 1. Builds a complete node tree including if nodes
 * 2. Flattens nodes without prompts (structural flattening)
 * 3. Removes if nodes after flattening
 * 4. Creates implicit submenus based on dependencies
 * 5. Calculates indentation dynamically through parent chain
 */
class KconfigParser {
    static SOURCE_PREFETCH_BATCH_SIZE = 16;
    static SOURCE_PREFETCH_MAX_DEPTH = 2;
    workspaceFolder;
    mainKconfigFile;
    currentId = 0;
    visibilityManager;
    exprParser;
    variables = new Map();
    srctreeRoot;
    // Performance optimization: File caching
    fileContentCache = new Map();
    expandedVariableCache = new Map();
    allParsedFiles = new Set();
    dependencyExprCache = new Map();
    scheduledPrefetchFiles = new Set();
    prefetchTasks = new Set();
    sourcePrefetchQueue = [];
    sourcePrefetchWorkerRunning = false;
    allowBackgroundPrefetch = false;
    // Performance optimization: Concurrent file processor
    concurrentProcessor;
    // File opening tracking
    fileOpenCounter = 0;
    openedFilesList = [];
    activeParsingFiles = new Set();
    /**
     * Static factory method to create a fully initialized parser
     */
    static async create(options) {
        const parser = new KconfigParser(options);
        return parser;
    }
    constructor(options) {
        this.workspaceFolder = options.workspaceFolder;
        this.mainKconfigFile = options.mainKconfigFile;
        this.visibilityManager = new _VisibilityManager__WEBPACK_IMPORTED_MODULE_7__.VisibilityManager();
        this.exprParser = new _ExpressionParser__WEBPACK_IMPORTED_MODULE_5__.ExpressionParser();
        // Initialize concurrent file processor
        this.concurrentProcessor = new _ConcurrentFileProcessor__WEBPACK_IMPORTED_MODULE_9__.ConcurrentFileProcessor(32);
        const srctreeEnv = process.env.srctree || process.env.SRCTREE;
        if (srctreeEnv) {
            this.srctreeRoot = path__WEBPACK_IMPORTED_MODULE_1__.isAbsolute(srctreeEnv)
                ? srctreeEnv
                : path__WEBPACK_IMPORTED_MODULE_1__.resolve(this.workspaceFolder, srctreeEnv);
        }
        else {
            this.srctreeRoot = path__WEBPACK_IMPORTED_MODULE_1__.dirname(this.mainKconfigFile);
        }
    }
    /**
     * Get the visibility manager instance
     */
    getVisibilityManager() {
        return this.visibilityManager;
    }
    getParsedFiles() {
        return Array.from(this.allParsedFiles);
    }
    /**
     * Main parse method - builds tree and converts to Menu array
     */
    async parse() {
        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.info(() => `Starting Kconfig parsing from: ${this.mainKconfigFile}`);
        const _startTime = Date.now();
        const normalizedMain = path__WEBPACK_IMPORTED_MODULE_1__.normalize(this.mainKconfigFile);
        this.activeParsingFiles.clear();
        this.activeParsingFiles.add(normalizedMain);
        this.allParsedFiles.clear();
        this.allParsedFiles.add(normalizedMain);
        this.dependencyExprCache.clear();
        this.scheduledPrefetchFiles.clear();
        this.prefetchTasks.clear();
        this.sourcePrefetchQueue = [];
        this.sourcePrefetchWorkerRunning = false;
        this.allowBackgroundPrefetch = true;
        try {
            // Step 1: Build complete node tree (including if nodes)
            const root = await this.buildNodeTree(this.mainKconfigFile);
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser('After buildNodeTree - structure built');
            // Step 2: Build select relationships to identify which configs are selected
            // This must be done before flattening to preserve the select information
            this.buildSelectRelationshipsInTree(root);
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser('After buildSelectRelationshipsInTree - relationships built');
            // Step 3: Flatten nodes without prompts (structural operation)
            // But preserve nodes that are selected even if they have no prompt
            this.flatten(root);
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser('After flatten - structure flattened');
            // Step 4: Remove if nodes (already flattened)
            this.removeIfs(root);
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser('After removeIfs - conditional nodes processed');
            // Step 5: Propagate menu 'visible if' and 'depends on'
            this.propagateMenuConditions(root);
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser('After propagateMenuConditions - menu conditions propagated');
            // Step 6: Create implicit submenus based on dependencies
            this.createImplicitMenus(root);
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser('After createImplicitMenus - implicit menus created');
            // Step 7: Convert to Menu array with dynamic indent calculation
            const menus = this.convertToMenuArray(root);
            // Step 8: Build reverse select relationships in Menu array
            this.buildSelectRelationships(menus);
            const _endTime = Date.now();
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.info(() => `Parsing completed in ${_endTime - _startTime}ms`);
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.info(() => `Total menus parsed: ${menus.length}`);
            return menus;
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.error(`Error parsing Kconfig: ${error}`);
            throw error;
        }
        finally {
            this.allowBackgroundPrefetch = false;
            this.sourcePrefetchQueue = [];
            this.activeParsingFiles.clear();
        }
    }
    /**
     * Build a complete node tree from Kconfig files.
     * This creates MenuNode objects including if nodes.
     */
    async buildNodeTree(filepath) {
        const root = new _MenuNode__WEBPACK_IMPORTED_MODULE_4__.MenuNode();
        root.is_menuconfig = true; // Root is treated as menuconfig
        root.node_type = 'menuconfig';
        // Read and parse the main file
        const lines = await this.readFile(filepath);
        await this.parseLines(lines, root, filepath);
        return root;
    }
    /**
     * Parse lines and build node tree
     */
    async parseLines(lines, parent, currentFile, startIndex = 0, endToken = null) {
        let i = startIndex;
        while (i < lines.length) {
            const line = lines[i].trim();
            // Skip empty lines and comments
            if (!line || line.startsWith('#')) {
                i++;
                continue;
            }
            // Check for end token
            // Note: endmenu/endif/endchoice might have comments after them
            if (endToken && (line === endToken || line.startsWith(endToken + ' ') || line.startsWith(endToken + '\t'))) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`Found endToken '${endToken}' at line ${i} (current file: ${currentFile}), returning ${i + 1}`);
                return i + 1;
            }
            // Handle variable assignments (e.g., RTT_DIR := ../../..)
            const assignmentMatch = line.match(/^([A-Za-z0-9_]+)\s*(?::=|\+=|=)\s*(.*)$/);
            if (assignmentMatch) {
                const [, varName, rawValue] = assignmentMatch;
                const operator = line.includes(':=') ? ':='
                    : line.includes('+=') ? '+='
                        : '=';
                let value = rawValue.trim();
                if (operator === '+=') {
                    const existing = this.variables.get(varName);
                    const separator = existing && existing.value && !existing.value.endsWith(' ') ? ' ' : '';
                    const appended = existing ? `${existing.value}${separator}${value}` : value;
                    this.variables.set(varName, {
                        value: appended,
                        isRecursive: existing ? existing.isRecursive : true,
                    });
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`Append variable: ${varName} += ${value} -> ${appended}`);
                }
                else {
                    if (operator === ':=') {
                        value = this.expandKconfigString(value);
                    }
                    this.variables.set(varName, {
                        value,
                        isRecursive: operator === '=',
                    });
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`Set variable: ${varName} ${operator} ${value}`);
                }
                i++;
                continue;
            }
            // Handle menu-level properties: 'visible if' and 'depends on'
            // Only valid when we're inside a 'menu' block
            if (parent.node_type === 'menu') {
                if (line.startsWith('visible if ')) {
                    const cond = line.substring('visible if '.length).trim();
                    if (parent.visibility) {
                        // add parentheses if needed for OR precedence
                        parent.visibility = this.andExpr(parent.visibility, cond);
                    }
                    else {
                        parent.visibility = cond;
                    }
                    i++;
                    continue;
                }
                if (line.startsWith('depends on ')) {
                    const dep = line.substring('depends on '.length).trim();
                    if (parent.dep) {
                        parent.dep = this.andExpr(parent.dep, dep);
                    }
                    else {
                        parent.dep = dep;
                    }
                    // 同步写入 Menu（容器）自身的 dependsOn，便于可见性评估
                    if (parent.item) {
                        const combined = this.andExpr(parent.dep, parent.visibility || undefined) || parent.dep || '';
                        parent.item.dependsOn = combined;
                    }
                    i++;
                    continue;
                }
            }
            // Handle mainmenu statement
            if (line.startsWith('mainmenu ')) {
                const title = this.extractQuotedString(line.substring(9));
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`Found mainmenu: "${title}"`);
                // Set the root node's title
                if (!parent.prompt) {
                    parent.prompt = [title, 'y'];
                    parent.item = this.createMenu({
                        name: '',
                        title: title,
                        type: _Menu__WEBPACK_IMPORTED_MODULE_3__.menuType.menu,
                        isMenuconfig: false, // FIX: mainmenu is NOT a menuconfig, just a title container
                        isVisible: true,
                        hasPrompt: true,
                        isMainMenu: true,
                    });
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`Created mainmenu item: title="${title}", type=menu, isMenuconfig=false, isVisible=true`);
                }
                i++;
                continue;
            }
            // Handle if blocks
            if (line.startsWith('if ')) {
                const condition = line.substring(3).trim();
                // Create if node
                const ifNode = new _MenuNode__WEBPACK_IMPORTED_MODULE_4__.MenuNode();
                ifNode.node_type = 'if';
                ifNode.item = null; // if nodes have no item
                ifNode.prompt = null; // if nodes have no prompt
                ifNode.dep = condition;
                ifNode.parent = parent;
                ifNode.filename = currentFile;
                ifNode.linenr = i + 1;
                parent.addChild(ifNode);
                // Parse if block contents recursively
                const nextIndex = await this.parseLines(lines, ifNode, currentFile, i + 1, 'endif');
                i = nextIndex;
                continue;
            }
            // Handle menu blocks
            if (line.startsWith('menu ')) {
                const title = this.extractQuotedString(line.substring(5));
                const menuNode = new _MenuNode__WEBPACK_IMPORTED_MODULE_4__.MenuNode();
                menuNode.node_type = 'menu';
                menuNode.is_menuconfig = false; // FIX: menu is NOT menuconfig!
                menuNode.prompt = [title, 'y'];
                menuNode.filename = currentFile;
                menuNode.linenr = i + 1;
                // Create associated Menu object
                menuNode.item = this.createMenu({
                    name: '',
                    title: title,
                    type: _Menu__WEBPACK_IMPORTED_MODULE_3__.menuType.menu,
                    isMenuconfig: false, // FIX: menu should have isMenuconfig = false
                    isVisible: true, // Menu nodes should always be visible
                    hasPrompt: true, // Menu nodes have a title, so they have a prompt
                });
                parent.addChild(menuNode);
                // Parse menu contents
                i = await this.parseLines(lines, menuNode, currentFile, i + 1, 'endmenu');
                continue;
            }
            // Handle comment entries
            if (line.startsWith('comment ')) {
                const commentNode = await this.parseComment(lines, i, currentFile);
                if (commentNode) {
                    parent.addChild(commentNode);
                    i = commentNode.nextIndex || i + 1;
                }
                else {
                    i++;
                }
                continue;
            }
            // Handle choice blocks
            if (line.startsWith('choice')) {
                // Extract choice name if present (e.g., "choice BSP_ROOTFS_TYPE" vs just "choice")
                const choiceName = line.trim() === 'choice' ? null : line.substring(6).trim();
                const choiceNode = await this.parseChoice(lines, i, currentFile, choiceName);
                if (choiceNode) {
                    parent.addChild(choiceNode);
                    i = choiceNode.nextIndex || i + 1;
                }
                else {
                    i++;
                }
                continue;
            }
            // Handle config/menuconfig
            if (line.startsWith('config ') || line.startsWith('menuconfig ')) {
                const configNode = await this.parseConfig(lines, i, currentFile);
                if (configNode) {
                    parent.addChild(configNode);
                    i = configNode.nextIndex || i + 1;
                }
                else {
                    i++;
                }
                continue;
            }
            // Handle source/rsource/osource/orsource directives
            if (line.startsWith('source ') || line.startsWith('rsource ') ||
                line.startsWith('osource ') || line.startsWith('orsource ')) {
                const sourceResult = await this.parseSource(line, currentFile);
                if (sourceResult) {
                    const sourceFiles = this.deduplicateSourceFiles(sourceResult.files);
                    await this.preloadSourceFiles(sourceFiles, line);
                    for (const sourceFile of sourceFiles) {
                        const normalizedSource = path__WEBPACK_IMPORTED_MODULE_1__.normalize(sourceFile);
                        if (this.activeParsingFiles.has(normalizedSource)) {
                            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.warn(`Detected recursive source include, skipping: ${normalizedSource}`);
                            continue;
                        }
                        this.fileOpenCounter++;
                        this.openedFilesList.push({
                            index: this.fileOpenCounter,
                            file: normalizedSource,
                            directive: line,
                            time: new Date(),
                        });
                        this.allParsedFiles.add(normalizedSource);
                        const sourceLines = await this.readFile(normalizedSource);
                        if (sourceLines.length === 0) {
                            if (!sourceResult.optional) {
                                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.warn(`Source file not found or empty: ${normalizedSource}`);
                            }
                            continue;
                        }
                        this.activeParsingFiles.add(normalizedSource);
                        try {
                            await this.parseLines(sourceLines, parent, normalizedSource);
                        }
                        finally {
                            this.activeParsingFiles.delete(normalizedSource);
                        }
                    }
                }
                else {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.warn(`Source directive failed: ${line}`);
                }
                i++;
                continue;
            }
            i++;
        }
        return i;
    }
    /**
     * Parse a config or menuconfig item
     */
    async parseConfig(lines, startIndex, currentFile) {
        const firstLine = lines[startIndex].trim();
        const isMenuconfig = firstLine.startsWith('menuconfig ');
        const match = firstLine.match(/^(?:menu)?config\s+([A-Z0-9_]+)/);
        if (!match) {
            return null;
        }
        const _configName = match[1];
        // Debug log for config/menuconfig parsing
        if (isMenuconfig) {
        }
        const node = new _MenuNode__WEBPACK_IMPORTED_MODULE_4__.MenuNode();
        node.node_type = isMenuconfig ? 'menuconfig' : 'config';
        node.is_menuconfig = isMenuconfig;
        node.filename = currentFile;
        node.linenr = startIndex + 1;
        // Create associated Menu object
        const menu = this.createMenu({
            name: _configName,
            title: '',
            type: _Menu__WEBPACK_IMPORTED_MODULE_3__.menuType.bool, // Default, will be updated
            isMenuconfig: isMenuconfig,
            linenr: startIndex + 1,
        });
        node.item = menu;
        // Parse config properties
        let i = startIndex + 1;
        let hasPrompt = false;
        while (i < lines.length) {
            const line = lines[i].trim();
            if (!line || line.startsWith('#')) {
                i++;
                continue;
            }
            // Check for new top-level statement
            // We break on new config/menu/choice/if statements
            // and also on source directives. This is critical because
            // rsource/source/osource/orsource must be handled by the
            // outer parseLines() loop instead of being consumed inside
            // a config block. Otherwise files like components/libc/Kconfig
            // that contain rsource "posix/Kconfig" within a menu would be
            // swallowed by the preceding config parser and never loaded,
            // causing select relationships (e.g. RT_USING_POSIX_FS ->
            // DFS_USING_POSIX) to be missing.
            // Note: choice can be standalone (anonymous) or have a name.
            if (line.match(/^(config|menuconfig|menu|if|comment)\s/) ||
                line === 'choice' ||
                line.startsWith('choice ') ||
                line.startsWith('source ') ||
                line.startsWith('rsource ') ||
                line.startsWith('osource ') ||
                line.startsWith('orsource ')) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[CONFIG_PARSER] Breaking at top-level directive within config ${_configName}: '${line}'`);
                break;
            }
            // Break on end tokens that belong to parent scopes
            // We need to leave these for the parent parseLines to handle
            // Note: end tokens might have comments after them
            if (line === 'endif' || line === 'endmenu' || line === 'endchoice' ||
                line.startsWith('endif ') || line.startsWith('endmenu ') || line.startsWith('endchoice ')) {
                break;
            }
            // Parse type and prompt
            const typeMatch = line.match(/^(bool|tristate|string|int|hex)(?:\s+(.*))?$/);
            if (typeMatch) {
                const [, typeKeyword, rest] = typeMatch;
                menu.type = typeKeyword;
                if (rest) {
                    const promptMatch = rest.match(/"([^"]+)"/);
                    if (promptMatch) {
                        menu.title = promptMatch[1];
                        const firstQuote = rest.indexOf('"');
                        const secondQuote = rest.indexOf('"', firstQuote + 1);
                        let cond = 'y';
                        if (secondQuote !== -1) {
                            const after = rest.substring(secondQuote + 1).trim();
                            if (after.startsWith('if ')) {
                                cond = after.substring(3).trim();
                            }
                        }
                        node.prompt = [promptMatch[1], cond];
                        hasPrompt = true;
                    }
                }
                i++;
                continue;
            }
            // Parse depends on
            if (line.startsWith('depends on ')) {
                const dep = line.substring(11).trim();
                // Store explicit depends on separately
                if (node.explicit_dep) {
                    node.explicit_dep = `(${node.explicit_dep}) && (${dep})`;
                }
                else {
                    node.explicit_dep = dep;
                }
                // Also add to general dependencies
                if (node.dep) {
                    node.dep = `(${node.dep}) && (${dep})`;
                }
                else {
                    node.dep = dep;
                }
                menu.dependsOn = node.dep;
            }
            const defBoolMatch = line.match(/^def_bool\s+(.+)$/);
            if (defBoolMatch) {
                const defLine = defBoolMatch[1].trim();
                const ifIndex = defLine.indexOf(' if ');
                let defaultValue;
                let condition;
                if (ifIndex > -1) {
                    defaultValue = defLine.substring(0, ifIndex).trim();
                    condition = defLine.substring(ifIndex + 4).trim();
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[DEFAULT_PARSER] ${_configName} -> def_bool "${defaultValue}" if ${condition}`);
                }
                else {
                    defaultValue = defLine.trim();
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[DEFAULT_PARSER] ${_configName} -> def_bool "${defaultValue}"`);
                }
                defaultValue = this.expandDefaultValue(defaultValue);
                menu.type = _Menu__WEBPACK_IMPORTED_MODULE_3__.menuType.bool;
                if (!menu.defaults) {
                    menu.defaults = [];
                }
                menu.defaults.push({ value: defaultValue, condition });
                i++;
                continue;
            }
            // Parse default value (support: default VALUE [if CONDITION])
            if (line.startsWith('default ')) {
                const defaultLine = line.substring(8).trim();
                const ifIndex = defaultLine.indexOf(' if ');
                let defaultValue;
                let condition;
                if (ifIndex > -1) {
                    defaultValue = defaultLine.substring(0, ifIndex).trim();
                    condition = defaultLine.substring(ifIndex + 4).trim();
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[DEFAULT_PARSER] ${_configName} -> default "${defaultValue}" if ${condition}`);
                }
                else {
                    defaultValue = defaultLine.trim();
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[DEFAULT_PARSER] ${_configName} -> default "${defaultValue}"`);
                }
                defaultValue = this.expandDefaultValue(defaultValue);
                // 收集到 defaults 列表，按照出现顺序保存（Kconfig 语义为最后一个命中的 default 生效）
                if (!menu.defaults) {
                    menu.defaults = [];
                }
                menu.defaults.push({ value: defaultValue, condition });
            }
            if (line.startsWith('option ')) {
                const optionContent = line.substring(7).trim();
                if (optionContent.startsWith('env')) {
                    const envMatch = optionContent.match(/env\s*=\s*"?([A-Za-z0-9_]+)"?/);
                    if (envMatch) {
                        menu.optionEnvVar = envMatch[1];
                        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[OPTION_PARSER] ${_configName} -> option env="${menu.optionEnvVar}"`);
                    }
                }
                else if (optionContent === 'defconfig_list') {
                    menu.optionDefconfigList = true;
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[OPTION_PARSER] ${_configName} marked as defconfig_list`);
                }
                else if (optionContent === 'modules') {
                    menu.optionModules = true;
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[OPTION_PARSER] ${_configName} marked as modules symbol`);
                }
                i++;
                continue;
            }
            // Parse select statements
            if (line.startsWith('select ')) {
                // 支持：select TARGET [if COND]
                const raw = line.substring(7).trim();
                let selectTarget = raw;
                let cond;
                const ifIdx = raw.indexOf(' if ');
                if (ifIdx > -1) {
                    selectTarget = raw.substring(0, ifIdx).trim();
                    cond = raw.substring(ifIdx + 4).trim();
                }
                if (!menu.select) {
                    menu.select = [];
                }
                menu.select.push(selectTarget);
                if (cond) {
                    if (!menu.selectConditions)
                        menu.selectConditions = {};
                    menu.selectConditions[selectTarget] = cond;
                }
                if (!node.item) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.error(`[SELECT_PARSE] ERROR: node.item is null for ${_configName}`);
                }
            }
            if (line.startsWith('imply ')) {
                const raw = line.substring(6).trim();
                let target = raw;
                let cond;
                const ifIdx = raw.indexOf(' if ');
                if (ifIdx > -1) {
                    target = raw.substring(0, ifIdx).trim();
                    cond = raw.substring(ifIdx + 4).trim();
                }
                if (!menu.implies) {
                    menu.implies = [];
                }
                menu.implies.push(target);
                if (cond) {
                    if (!menu.implyConditions) {
                        menu.implyConditions = {};
                    }
                    menu.implyConditions[target] = cond;
                }
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[IMPLY_PARSER] ${_configName} implies ${target}${cond ? ` if ${cond}` : ''}`);
                i++;
                continue;
            }
            // Parse range
            if (line.startsWith('range ')) {
                const rangeMatch = line.match(/range\s+(\d+)\s+(\d+)/);
                if (rangeMatch) {
                    menu.range = [parseInt(rangeMatch[1]), parseInt(rangeMatch[2])];
                }
            }
            // Parse help text
            if (line.startsWith('help') || line.startsWith('---help---')) {
                const helpLines = [];
                i++;
                // Find the first non-blank line to determine base indentation
                let baseIndent = -1;
                while (i < lines.length) {
                    const helpLine = lines[i];
                    if (helpLine.trim()) {
                        // Found non-blank line, measure its indentation
                        baseIndent = helpLine.length - helpLine.trimStart().length;
                        helpLines.push(helpLine);
                        i++;
                        break;
                    }
                    // Skip blank lines at the start of help
                    i++;
                }
                // If we found a base indentation, continue reading help text
                if (baseIndent >= 0) {
                    while (i < lines.length) {
                        const helpLine = lines[i];
                        // Empty lines are part of help text
                        if (!helpLine.trim()) {
                            helpLines.push(helpLine);
                            i++;
                            continue;
                        }
                        // Check indentation level
                        const currentIndent = helpLine.length - helpLine.trimStart().length;
                        if (currentIndent < baseIndent) {
                            // Less indented line found - end of help text
                            break;
                        }
                        helpLines.push(helpLine);
                        i++;
                    }
                }
                menu.help = (0,_helpTextFormatter__WEBPACK_IMPORTED_MODULE_8__.formatHelpText)(helpLines.join('\n').trim());
                // Don't increment i here - we want to process the less-indented line next
                continue;
            }
            i++;
        }
        // Set visibility
        menu.hasPrompt = hasPrompt;
        if (node.dep && !menu.dependsOn) {
            menu.dependsOn = node.dep;
        }
        // For menuconfig nodes, they should always be visible as they are menu items
        // For regular config nodes, visibility depends on having a prompt
        menu.isVisible = isMenuconfig ? true : hasPrompt;
        node.nextIndex = i;
        return node;
    }
    /**
     * Parse a comment entry.
     * Supports:
     *   comment "text" [if CONDITION]
     *   depends on CONDITION
     */
    async parseComment(lines, startIndex, currentFile) {
        const firstLine = lines[startIndex].trim();
        if (!firstLine.startsWith("comment ")) {
            return null;
        }
        const title = this.extractQuotedString(firstLine.substring("comment ".length));
        const node = new _MenuNode__WEBPACK_IMPORTED_MODULE_4__.MenuNode();
        node.node_type = "comment";
        node.is_menuconfig = false;
        node.filename = currentFile;
        node.linenr = startIndex + 1;
        const menu = this.createMenu({
            name: "",
            title,
            prompt: title,
            type: _Menu__WEBPACK_IMPORTED_MODULE_3__.menuType.comment,
            isMenuconfig: false,
            hasPrompt: true,
            isVisible: true,
            linenr: startIndex + 1,
        });
        node.item = menu;
        const firstQuote = firstLine.indexOf('"');
        const secondQuote = firstLine.indexOf('"', firstQuote + 1);
        let promptCond = "y";
        if (secondQuote !== -1) {
            const after = firstLine.substring(secondQuote + 1).trim();
            if (after.startsWith("if ")) {
                promptCond = after.substring(3).trim();
            }
        }
        node.prompt = [title, promptCond];
        if (promptCond !== "y") {
            node.dep = promptCond;
            menu.dependsOn = promptCond;
        }
        let i = startIndex + 1;
        while (i < lines.length) {
            const line = lines[i].trim();
            if (!line || line.startsWith("#")) {
                i++;
                continue;
            }
            if (line.match(/^(config|menuconfig|menu|if|comment)\s/) ||
                line === "choice" ||
                line.startsWith("choice ") ||
                line.startsWith("source ") ||
                line.startsWith("rsource ") ||
                line.startsWith("osource ") ||
                line.startsWith("orsource ")) {
                break;
            }
            if (line === "endif" ||
                line === "endmenu" ||
                line === "endchoice" ||
                line.startsWith("endif ") ||
                line.startsWith("endmenu ") ||
                line.startsWith("endchoice ")) {
                break;
            }
            if (line.startsWith("depends on ")) {
                const dep = line.substring("depends on ".length).trim();
                node.dep = this.andExpr(node.dep, dep) ?? dep;
                menu.dependsOn = node.dep || "";
                i++;
                continue;
            }
            i++;
        }
        node.nextIndex = i;
        return node;
    }
    /**
     * Parse a choice block
     */
    async parseChoice(lines, startIndex, currentFile, choiceName) {
        const node = new _MenuNode__WEBPACK_IMPORTED_MODULE_4__.MenuNode();
        node.node_type = 'choice';
        node.is_menuconfig = true; // Choices act like menuconfigs
        node.filename = currentFile;
        node.linenr = startIndex + 1;
        // Create associated Menu object
        // Use the provided choice name if available, otherwise generate one
        const menu = this.createMenu({
            name: choiceName || `choice_${this.currentId++}`,
            title: 'Choice', // Default title, will be updated if prompt is found
            type: _Menu__WEBPACK_IMPORTED_MODULE_3__.menuType.choice,
            isMenuconfig: true,
        });
        // Debug logging for choice parsing
        node.item = menu;
        // Parse choice block
        let i = startIndex + 1;
        let hasPrompt = false;
        while (i < lines.length) {
            const line = lines[i].trim();
            if (line === 'endchoice') {
                node.nextIndex = i + 1;
                break;
            }
            if (!line || line.startsWith('#')) {
                i++;
                continue;
            }
            // Parse prompt
            if (line.startsWith('prompt ')) {
                const promptMatch = line.match(/prompt\s+"([^"]+)"/);
                if (promptMatch) {
                    menu.title = promptMatch[1];
                    // 解析 prompt 行上的 if 条件
                    const firstQuote = line.indexOf('"');
                    const secondQuote = line.indexOf('"', firstQuote + 1);
                    let cond = 'y';
                    if (secondQuote !== -1) {
                        const after = line.substring(secondQuote + 1).trim();
                        if (after.startsWith('if ')) {
                            cond = after.substring(3).trim();
                        }
                    }
                    node.prompt = [promptMatch[1], cond];
                    hasPrompt = true;
                }
                i++;
                continue;
            }
            // Parse depends on
            if (line.startsWith('depends on ')) {
                const dep = line.substring('depends on '.length).trim();
                node.dep = this.andExpr(node.dep, dep) ?? dep;
                menu.dependsOn = node.dep || '';
                i++;
                continue;
            }
            // Parse default (support "default VALUE [if CONDITION]")
            if (line.startsWith('default ')) {
                const defaultLine = line.substring(8).trim();
                const ifIndex = defaultLine.indexOf(' if ');
                let defaultValue;
                let condition;
                if (ifIndex > -1) {
                    defaultValue = defaultLine.substring(0, ifIndex).trim();
                    condition = defaultLine.substring(ifIndex + 4).trim();
                }
                else {
                    defaultValue = defaultLine.trim();
                }
                // 收集 choice 的默认值列表，保留顺序（与 Kconfig 语义一致，后匹配覆盖先匹配）
                if (!menu.defaults) {
                    menu.defaults = [];
                }
                menu.defaults.push({ value: defaultValue, condition });
                // 不在解析阶段确定最终默认值，交由可见性管理器按语义（最后一个命中的 default 生效）评估
                i++;
                continue;
            }
            // Parse choice options (config items within choice)
            if (line.startsWith('config ')) {
                const optionNode = await this.parseConfig(lines, i, currentFile);
                if (optionNode) {
                    node.addChild(optionNode);
                    i = optionNode.nextIndex || i + 1;
                }
                else {
                    i++;
                }
                continue;
            }
            if (line.startsWith('comment ')) {
                const commentNode = await this.parseComment(lines, i, currentFile);
                if (commentNode) {
                    node.addChild(commentNode);
                    i = commentNode.nextIndex || i + 1;
                }
                else {
                    i++;
                }
                continue;
            }
            i++;
        }
        if (node.dep) {
            menu.dependsOn = node.dep;
        }
        menu.hasPrompt = hasPrompt;
        // Choice blocks should always be visible as they are selection elements
        menu.isVisible = true;
        // Final debug logging
        return node;
    }
    // 注意：if 节点仅用于依赖传播，不应引入额外缩进层级。
    /**
     * Flatten nodes without prompts (structural flattening).
     * This matches Kconfiglib's _flatten function.
     */
    flatten(node) {
        // Use two-pass approach to avoid modifying the list while traversing
        const nodesToFlatten = [];
        // First pass: Recursively process all children and collect nodes to flatten
        let current = node.list;
        while (current) {
            // Recursively flatten children first
            if (current.list) {
                this.flatten(current);
            }
            // Collect nodes that need flattening
            if (current.shouldFlatten()) {
                nodesToFlatten.push(current);
            }
            current = current.next;
        }
        // Second pass: Flatten the collected nodes
        for (const nodeToFlatten of nodesToFlatten) {
            this.flattenNode(nodeToFlatten);
        }
    }
    /**
     * Flatten a single node by promoting its children to the parent level.
     * Updates dependencies and reconnects the node chain.
     * IMPORTANT: Preserves if block indentation levels for correct display.
     */
    flattenNode(nodeToFlatten) {
        if (!nodeToFlatten.list || !nodeToFlatten.parent) {
            return;
        }
        const parent = nodeToFlatten.parent;
        const firstChild = nodeToFlatten.list;
        // Update all children
        let child = firstChild;
        let lastChild = firstChild;
        while (child) {
            // Update parent pointer
            child.parent = parent;
            // Handle dependency merging based on the type of node being flattened
            if (nodeToFlatten.dep) {
                if (nodeToFlatten.isIfNode()) {
                    // If 节点：仅传播依赖，不产生额外缩进
                    // Store if dependency separately
                    if (child.if_dep) {
                        // Merge with existing if_dep
                        if (child.if_dep.includes('||') || nodeToFlatten.dep.includes('||')) {
                            child.if_dep = `(${child.if_dep}) && (${nodeToFlatten.dep})`;
                        }
                        else {
                            child.if_dep = `${child.if_dep} && ${nodeToFlatten.dep}`;
                        }
                    }
                    else {
                        child.if_dep = nodeToFlatten.dep;
                    }
                    // Also update general dep for visibility calculations
                    if (child.dep) {
                        if (child.dep.includes('||') || nodeToFlatten.dep.includes('||')) {
                            child.dep = `(${child.dep}) && (${nodeToFlatten.dep})`;
                        }
                        else {
                            child.dep = `${child.dep} && ${nodeToFlatten.dep}`;
                        }
                    }
                    else {
                        child.dep = nodeToFlatten.dep;
                    }
                    // 不递归增加任何 if 缩进层级
                }
                else {
                    // Non-if node flattening (rare case)
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[FLATTEN_NON_IF] Flattening non-if node, merging dep: ${nodeToFlatten.dep}`);
                    // Merge dependency conditions normally
                    if (child.dep) {
                        // Only add parentheses when necessary (e.g., when there are OR operations)
                        if (child.dep.includes('||') || nodeToFlatten.dep.includes('||')) {
                            child.dep = `(${child.dep}) && (${nodeToFlatten.dep})`;
                        }
                        else {
                            child.dep = `${child.dep} && ${nodeToFlatten.dep}`;
                        }
                    }
                    else {
                        child.dep = nodeToFlatten.dep;
                    }
                }
                // Update Menu object's dependsOn
                if (child.item) {
                    child.item.dependsOn = child.dep;
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[FLATTEN] Updated menu "${child.item.title || child.item.name}" dependsOn to: ${child.dep}`);
                }
            }
            lastChild = child;
            child = child.next;
        }
        // Reconnect the node chain
        if (parent.list === nodeToFlatten) {
            // nodeToFlatten is the first child of parent
            parent.list = firstChild;
        }
        else {
            // Find the previous sibling
            let prev = parent.list;
            while (prev && prev.next !== nodeToFlatten) {
                prev = prev.next;
            }
            if (prev) {
                prev.next = firstChild;
            }
        }
        // Connect the last child to nodeToFlatten's next sibling
        lastChild.next = nodeToFlatten.next;
        // Clear the flattened node
        nodeToFlatten.list = null;
        nodeToFlatten.next = null;
    }
    /**
     * Remove if nodes after flattening.
     * This matches Kconfiglib's _remove_ifs function.
     */
    removeIfs(node) {
        // First, recursively process children
        let current = node.list;
        while (current) {
            if (current.list) {
                this.removeIfs(current);
            }
            current = current.next;
        }
        // Now remove if nodes from this level
        let prev = null;
        current = node.list;
        while (current) {
            const next = current.next;
            if (current.isIfNode()) {
                // Remove this if node from the chain
                if (prev) {
                    prev.next = next;
                }
                else {
                    node.list = next;
                }
            }
            else {
                prev = current;
            }
            current = next;
        }
    }
    /**
     * Propagate menu-level 'visible if' and 'depends on' to children.
     * - 'visible if' only influences prompts of symbols/choices (AND in)
     * - 'depends on' is propagated to child.dep and also AND into child prompts
     * This mirrors Kconfiglib's _propagate_deps + visible_if propagation.
     */
    propagateMenuConditions(root) {
        const rec = (node, inheritedVisible) => {
            // Accumulate visible-if from parent menus
            const curVisible = this.andExpr(inheritedVisible || undefined, node.node_type === 'menu' ? node.visibility || undefined : undefined);
            let child = node.list;
            while (child) {
                // Propagate 'depends on' from parent menu to child dep
                if (node.node_type === 'menu' && node.dep) {
                    child.dep = this.andExpr(child.dep || undefined, node.dep) || child.dep || node.dep;
                }
                const promptCond = child.prompt ? (child.prompt[1] || 'y') : 'y';
                const menuVisible = child.node_type === 'menu' ? child.visibility || undefined : undefined;
                const inheritedVisible = curVisible || undefined;
                let combinedCondition = this.andExpr(promptCond, inheritedVisible);
                combinedCondition = this.andExpr(combinedCondition || undefined, menuVisible);
                combinedCondition = this.andExpr(combinedCondition || undefined, child.dep || undefined);
                if (child.item && child.prompt) {
                    child.prompt = [child.prompt[0], combinedCondition || 'y'];
                }
                if (child.item) {
                    if (combinedCondition) {
                        child.item.dependsOn = combinedCondition;
                    }
                    else if (!child.item.dependsOn) {
                        child.item.dependsOn = '';
                    }
                }
                const nextInherited = combinedCondition || curVisible || null;
                if (child.list)
                    rec(child, nextInherited);
                child = child.next;
            }
        };
        rec(root, null);
    }
    /**
     * Helper: AND two expressions with safe parentheses when needed.
     */
    andExpr(a, b) {
        const norm = (s) => (s && s.trim().length > 0 ? s.trim() : null);
        const A = norm(a);
        const B = norm(b);
        if (!A)
            return B;
        if (!B)
            return A;
        const wrap = (s) => (s.includes('||') ? `(${s})` : s);
        return `${wrap(A)} && ${wrap(B)}`;
    }
    /**
     * Create implicit submenus based on dependencies.
     * This matches Kconfiglib's implicit menu creation logic.
     * IMPORTANT: Only processes CONSECUTIVE nodes that depend on the current node.
     * This preserves the original file order (matching kconfiglib.py:_finalize_node).
     *
     * ENHANCED: Special handling for menuconfig nodes to ensure proper indentation
     * of dependent config items (e.g., items from "if MENUCONFIG" blocks).
     */
    createImplicitMenus(node) {
        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[IMPLICIT_MENU] Processing node: ${node.toString()}`);
        // Process each child of this node
        let child = node.list;
        while (child) {
            // For each child, check if consecutive following siblings should become its children
            // This matches kconfiglib.py line 3587-3600
            if (child.item && child.item.name) {
                let cur = child;
                const dependencyOwners = new Set();
                if (child.item && child.item.name) {
                    dependencyOwners.add(child.item.name);
                }
                // Check consecutive nodes that immediately follow
                while (cur.next) {
                    const nextNode = cur.next;
                    // Get the dependency to check
                    // Priority: prompt condition > general dep > explicit dep
                    let dependency = null;
                    if (nextNode.prompt) {
                        const promptCond = nextNode.prompt[1];
                        if (promptCond && promptCond !== 'y') {
                            dependency = promptCond;
                        }
                    }
                    if (!dependency) {
                        dependency = nextNode.dep || nextNode.explicit_dep || null;
                    }
                    let shouldBecomeChild = false;
                    if (dependency && dependencyOwners.size > 0) {
                        try {
                            const cacheKey = dependency.trim();
                            let expr = this.dependencyExprCache.get(cacheKey);
                            if (!expr) {
                                expr = this.exprParser.parse(cacheKey);
                                this.dependencyExprCache.set(cacheKey, expr);
                            }
                            for (const owner of dependencyOwners) {
                                if (this.exprParser.exprDependsOn(expr, owner)) {
                                    shouldBecomeChild = true;
                                    break;
                                }
                            }
                        }
                        catch (error) {
                            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.warn(`[IMPLICIT_MENU] Failed to parse dependency expression "${dependency}": ${error}`);
                        }
                    }
                    if (shouldBecomeChild) {
                        if (nextNode.item && nextNode.item.name) {
                            dependencyOwners.add(nextNode.item.name);
                        }
                        cur = nextNode; // Move to next to continue checking
                    }
                    else {
                        // Not dependent on current block, stop checking
                        break;
                    }
                }
                // If we found consecutive dependent nodes, move them under child
                if (cur !== child) {
                    // Move nodes from child.next to cur (inclusive) under child
                    const firstDependent = child.next;
                    const lastDependent = cur;
                    const afterLast = cur.next;
                    // Update parent pointers
                    let temp = firstDependent;
                    while (temp) {
                        temp.parent = child;
                        if (temp === lastDependent)
                            break;
                        temp = temp.next;
                    }
                    // Reconnect the sibling chain
                    child.next = afterLast;
                    // Set up child's children
                    child.list = firstDependent;
                    lastDependent.next = null;
                }
            }
            // Recursively process this child's children (including newly created implicit children)
            if (child.list) {
                this.createImplicitMenus(child);
            }
            child = child.next;
        }
    }
    /**
     * Convert node tree to Menu array with proper indentation.
     * Indentation is calculated dynamically based on parent chain.
     */
    convertToMenuArray(root) {
        const menus = [];
        // Debug: Log root node status
        if (root.item) {
        }
        // If root has a mainmenu (item), handle it specially
        if (root.item && root.prompt) {
            const mainMenu = root.item;
            mainMenu.indentLevel = 0;
            mainMenu.children = [];
            mainMenu.isCollapsed = false; // Mainmenu should always be expanded
            // Process all children of the root as children of mainmenu
            let child = root.list;
            let _childCount = 0;
            while (child) {
                if (child.item) {
                    // Special handling for top-level menu items like RT-Thread Kernel
                    // These should be collapsible menu containers, not normal config items
                    if (child.item.type === 'menu' || child.item.isMenuconfig) {
                        child.item.isCollapsed = child.item.isCollapsed ?? true; // Default to collapsed
                    }
                    this.convertChildNode(child, mainMenu.children);
                    _childCount++;
                }
                child = child.next;
            }
            // Push the mainmenu itself as the top-level container with all its children
            // This will show the mainmenu title at the top of the UI
            menus.push(mainMenu);
            if (mainMenu.children.length > 0) {
            }
        }
        else {
            // No mainmenu, process children as top-level items
            this.convertNode(root, menus, true);
        }
        if (menus.length > 0) {
            if (menus[0].children) {
            }
        }
        return menus;
    }
    /**
     * Recursively convert nodes to Menu array
     */
    convertNode(node, menus, isRoot = false) {
        // Skip the root node itself
        if (!isRoot && node.item) {
            this.convertChildNode(node, menus);
        }
        else if (isRoot) {
            // For root, just process its children
            let child = node.list;
            while (child) {
                this.convertNode(child, menus, false);
                child = child.next;
            }
        }
    }
    /**
     * Convert child nodes recursively without adding to flat array
     */
    convertChildNode(node, parentChildren) {
        if (node.item) {
            const menu = node.item;
            // Calculate indentation dynamically
            menu.indentLevel = node.calculateIndent();
            // CRITICAL FIX: Set shouldIndentChildren for nodes with children
            // This is required for proper indentation in the frontend
            if (node.list) {
                // For menuconfig and config nodes with children, enable child indentation
                menu.shouldIndentChildren = true;
            }
            else {
                menu.shouldIndentChildren = false;
            }
            // Ensure isCollapsed is properly set for menuconfig items
            if (menu.isMenuconfig) {
                menu.isCollapsed = menu.isCollapsed ?? false;
            }
            // Add to parent's children array
            parentChildren.push(menu);
            // Process children as nested items
            if (node.list) {
                menu.children = [];
                let child = node.list;
                while (child) {
                    if (child.item) {
                        // Recursively process child
                        this.convertChildNode(child, menu.children);
                    }
                    child = child.next;
                }
            }
        }
    }
    // ========== Helper Methods ==========
    /**
     * Create a Menu object with default values
     */
    createMenu(options) {
        return {
            id: `menu-${this.currentId++}`,
            name: options.name || '',
            title: options.title || '',
            type: options.type || _Menu__WEBPACK_IMPORTED_MODULE_3__.menuType.bool,
            value: options.value ?? null,
            help: options.help || '',
            range: options.range || [],
            isVisible: options.isVisible ?? true,
            isCollapsed: options.isCollapsed ?? false,
            isMenuconfig: options.isMenuconfig ?? false,
            hasPrompt: options.hasPrompt ?? false,
            dependsOn: options.dependsOn || '',
            select: options.select || [],
            selectedBy: options.selectedBy || [],
            children: options.children || [],
            indentLevel: options.indentLevel ?? 0,
            isMainMenu: options.isMainMenu ?? false,
            optionEnvVar: options.optionEnvVar ?? null,
            optionDefconfigList: options.optionDefconfigList ?? false,
            optionModules: options.optionModules ?? false,
            implies: options.implies ? [...options.implies] : [],
            implyConditions: options.implyConditions ? { ...options.implyConditions } : undefined,
            autoImpliedValue: options.autoImpliedValue,
            allowedTristateValues: options.allowedTristateValues ? [...options.allowedTristateValues] : undefined,
            // Enhanced help information
            linenr: options.linenr,
            menuPath: options.menuPath,
            directDepValue: options.directDepValue,
            directDepExpr: options.directDepExpr,
            prompt: options.prompt || options.title || '',
            selectInfo: options.selectInfo,
            selectedByInfo: options.selectedByInfo,
            implyInfo: options.implyInfo,
        };
    }
    /**
     * Read a file and return its lines
     */
    async readFile(filepath) {
        // Check cache first
        if (this.fileContentCache.has(filepath)) {
            return this.fileContentCache.get(filepath);
        }
        try {
            const content = await fs__WEBPACK_IMPORTED_MODULE_0__.promises.readFile(filepath, 'utf-8');
            const lines = content.split('\n');
            // Cache the content
            this.fileContentCache.set(filepath, lines);
            this.scheduleSourcePrefetch(lines, filepath, 0);
            return lines;
        }
        catch (error) {
            const err = error;
            if (err && err.code === "ENOENT") {
                return [];
            }
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.warn(`Failed to read file ${filepath}: ${error}`);
            return [];
        }
    }
    /**
     * Parse source directive and return resolved file paths
     */
    async parseSource(line, currentFile, options) {
        const match = line.match(/^(source|rsource|osource|orsource)\s+"?([^"]+)"?/);
        if (!match) {
            return null;
        }
        const directive = match[1];
        let sourcePath = match[2];
        const optional = directive.startsWith('o');
        const isRelativeDirective = directive === 'rsource' || directive === 'orsource';
        const srctreeRoot = this.srctreeRoot;
        // Expand variables in the path
        sourcePath = this.expandVariables(sourcePath);
        // 计算解析基准路径
        const baseDir = path__WEBPACK_IMPORTED_MODULE_1__.isAbsolute(sourcePath)
            ? ''
            : (isRelativeDirective ? path__WEBPACK_IMPORTED_MODULE_1__.dirname(currentFile) : srctreeRoot);
        const resolvedPattern = path__WEBPACK_IMPORTED_MODULE_1__.join(baseDir, sourcePath);
        // 判断是否包含通配符
        if ((0,glob__WEBPACK_IMPORTED_MODULE_2__.hasMagic)(sourcePath)) {
            try {
                const files = this.deduplicateSourceFiles((await (0,glob__WEBPACK_IMPORTED_MODULE_2__.glob)(resolvedPattern, { nodir: true }))
                    .map(file => path__WEBPACK_IMPORTED_MODULE_1__.normalize(file))
                    .sort((a, b) => a.localeCompare(b)));
                if (files.length === 0 && !optional && !options?.suppressWarnings) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.warn(`Source directive matched zero files: ${resolvedPattern}`);
                    return null;
                }
                return { files, optional };
            }
            catch (error) {
                if (!optional && !options?.suppressWarnings) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.warn(`Failed to glob ${resolvedPattern}: ${error}`);
                }
                return null;
            }
        }
        else {
            // Single file
            const normalizedPath = path__WEBPACK_IMPORTED_MODULE_1__.normalize(resolvedPattern);
            return { files: this.deduplicateSourceFiles([normalizedPath]), optional };
        }
    }
    collectSourceDirectives(lines) {
        if (!lines || lines.length === 0) {
            return [];
        }
        const directives = [];
        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (line &&
                (line.startsWith("source ") || line.startsWith("rsource ") || line.startsWith("osource ") || line.startsWith("orsource ")) &&
                !line.includes("$(")) {
                directives.push(line);
            }
        }
        return directives;
    }
    scheduleSourcePrefetch(lines, currentFile, depth) {
        if (!this.allowBackgroundPrefetch) {
            return;
        }
        if (!lines || lines.length === 0 || depth >= KconfigParser.SOURCE_PREFETCH_MAX_DEPTH) {
            return;
        }
        const directives = this.collectSourceDirectives(lines);
        if (directives.length === 0) {
            return;
        }
        const task = (async () => {
            const nextDepth = depth + 1;
            for (const directive of directives) {
                const sourceResult = await this.parseSource(directive, currentFile, { suppressWarnings: true });
                if (!sourceResult || !sourceResult.files || sourceResult.files.length === 0) {
                    continue;
                }
                for (const sourceFile of sourceResult.files) {
                    const normalized = path__WEBPACK_IMPORTED_MODULE_1__.normalize(sourceFile);
                    if (this.fileContentCache.has(normalized)) {
                        continue;
                    }
                    if (this.scheduledPrefetchFiles.has(normalized)) {
                        continue;
                    }
                    this.scheduledPrefetchFiles.add(normalized);
                    this.sourcePrefetchQueue.push({ filePath: normalized, depth: nextDepth });
                }
            }
            this.ensureSourcePrefetchWorker();
        })().catch((error) => {
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugSource(() => `[SOURCE_PREFETCH] Failed to schedule prefetch for ${currentFile}: ${error}`);
        });
        this.prefetchTasks.add(task);
        task.finally(() => {
            this.prefetchTasks.delete(task);
        }).catch(() => undefined);
    }
    ensureSourcePrefetchWorker() {
        if (this.sourcePrefetchWorkerRunning || !this.allowBackgroundPrefetch) {
            return;
        }
        const task = (async () => {
            this.sourcePrefetchWorkerRunning = true;
            try {
                while (this.allowBackgroundPrefetch && this.sourcePrefetchQueue.length > 0) {
                    const batch = this.sourcePrefetchQueue.splice(0, KconfigParser.SOURCE_PREFETCH_BATCH_SIZE);
                    const filePaths = batch.map((entry) => entry.filePath);
                    const depthByFile = new Map();
                    for (const entry of batch) {
                        const previousDepth = depthByFile.get(entry.filePath);
                        if (previousDepth === undefined || entry.depth < previousDepth) {
                            depthByFile.set(entry.filePath, entry.depth);
                        }
                    }
                    const preloaded = await this.concurrentProcessor.readFilesAsync(filePaths);
                    if (!this.allowBackgroundPrefetch) {
                        break;
                    }
                    for (const [filePath, content] of preloaded.entries()) {
                        if (this.fileContentCache.has(filePath)) {
                            continue;
                        }
                        const lines = content.split("\n");
                        this.fileContentCache.set(filePath, lines);
                        const currentDepth = depthByFile.get(filePath) ?? KconfigParser.SOURCE_PREFETCH_MAX_DEPTH;
                        if (currentDepth < KconfigParser.SOURCE_PREFETCH_MAX_DEPTH) {
                            this.scheduleSourcePrefetch(lines, filePath, currentDepth);
                        }
                    }
                }
            }
            finally {
                this.sourcePrefetchWorkerRunning = false;
                if (this.allowBackgroundPrefetch && this.sourcePrefetchQueue.length > 0) {
                    this.ensureSourcePrefetchWorker();
                }
            }
        })();
        this.prefetchTasks.add(task);
        task.finally(() => {
            this.prefetchTasks.delete(task);
        }).catch(() => undefined);
    }
    deduplicateSourceFiles(files) {
        if (!files || files.length <= 1) {
            return files;
        }
        const seen = new Set();
        const deduped = [];
        for (const file of files) {
            const normalized = path__WEBPACK_IMPORTED_MODULE_1__.normalize(file);
            if (seen.has(normalized)) {
                continue;
            }
            seen.add(normalized);
            deduped.push(normalized);
        }
        return deduped;
    }
    async preloadSourceFiles(files, directive) {
        if (!files || files.length <= 1) {
            return;
        }
        const uncachedFiles = files.filter(file => !this.fileContentCache.has(file));
        if (uncachedFiles.length <= 1) {
            return;
        }
        try {
            const preloaded = await this.concurrentProcessor.readFilesAsync(uncachedFiles);
            preloaded.forEach((content, filePath) => {
                if (!this.fileContentCache.has(filePath)) {
                    const lines = content.split('\n');
                    this.fileContentCache.set(filePath, lines);
                    this.scheduleSourcePrefetch(lines, filePath, 1);
                }
            });
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[SOURCE_PRELOAD] Preloaded ${preloaded.size}/${uncachedFiles.length} files for directive: ${directive}`);
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.warn(`Failed to preload source files for directive "${directive}": ${error}`);
        }
    }
    /**
     * Extract quoted string from a line
     */
    extractQuotedString(line) {
        const match = line.match(/"([^"]+)"/);
        return match ? match[1] : line.trim();
    }
    /**
     * Parse default value based on type
     */
    parseDefaultValue(value, type) {
        value = value.replace(/"/g, '').trim();
        switch (type) {
            case _Menu__WEBPACK_IMPORTED_MODULE_3__.menuType.bool: {
                const lower = value.toLowerCase();
                return lower === 'y' || lower === 'true' || lower === '1';
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_3__.menuType.tristate: {
                const lower = value.toLowerCase();
                if (lower === 'y' || lower === 'm' || lower === 'n') {
                    return lower;
                }
                if (lower === 'true') {
                    return 'y';
                }
                if (lower === 'false') {
                    return 'n';
                }
                if (lower === '2') {
                    return 'y';
                }
                if (lower === '1') {
                    return 'm';
                }
                if (lower === '0') {
                    return 'n';
                }
                return lower || 'n';
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_3__.menuType.int:
                return parseInt(value) || 0;
            case _Menu__WEBPACK_IMPORTED_MODULE_3__.menuType.hex:
                return value;
            case _Menu__WEBPACK_IMPORTED_MODULE_3__.menuType.string:
            default:
                return value;
        }
    }
    /**
     * Expand variables in a string (e.g., $(RTT_DIR)/Kconfig -> ../../.../Kconfig)
     */
    expandVariables(str) {
        return this.expandKconfigString(str);
    }
    expandDefaultValue(value) {
        if (!value) {
            return value;
        }
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            const inner = value.substring(1, value.length - 1);
            const expanded = this.expandKconfigString(inner);
            return `${value[0]}${expanded}${value[value.length - 1]}`;
        }
        return this.expandKconfigString(value);
    }
    expandKconfigString(value, visited = new Set()) {
        if (!value) {
            return value;
        }
        const replace = (match, p1, p2) => {
            const varName = (p1 || p2 || '').trim();
            if (!varName) {
                return '';
            }
            if (visited.has(varName)) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.warn(`Detected recursive variable expansion for ${varName}`);
                return '';
            }
            visited.add(varName);
            let resolved = this.resolveVariable(varName, visited);
            visited.delete(varName);
            if (resolved === undefined) {
                resolved = '';
            }
            return resolved;
        };
        return value.replace(/\$\(([^)]+)\)|\$([A-Za-z_][A-Za-z0-9_]*)/g, replace);
    }
    resolveVariable(varName, visited) {
        if (varName === "PKGS_DIR") {
            const envValue = (process.env.PKGS_DIR || "").trim();
            if (envValue) {
                return envValue;
            }
        }
        const variable = this.variables.get(varName);
        if (variable) {
            if (variable.isRecursive) {
                return this.expandKconfigString(variable.value, visited);
            }
            return variable.value;
        }
        if (varName === 'srctree' || varName === 'SRCTREE') {
            return this.srctreeRoot;
        }
        const envValue = process.env[varName];
        if (envValue !== undefined) {
            return envValue;
        }
        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`Variable ${varName} not found during expansion, defaulting to empty string`);
        return '';
    }
    /**
     * Build select relationships in the node tree.
     * This identifies which configs are selected and marks them accordingly.
     * Must be called before flattening to preserve selected configs.
     */
    buildSelectRelationshipsInTree(root) {
        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser('[SELECT_RELATIONSHIPS] Building select relationships in tree...');
        // First pass: collect all nodes with their names
        const nodeMap = new Map();
        const collectNodes = (node) => {
            if (node.item && node.item.name) {
                nodeMap.set(node.item.name, node);
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[SELECT_RELATIONSHIPS] Collected node: ${node.item.name}`);
            }
            let child = node.list;
            while (child) {
                collectNodes(child);
                child = child.next;
            }
        };
        collectNodes(root);
        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[SELECT_RELATIONSHIPS] Collected ${nodeMap.size} nodes with names`);
        // Second pass: mark nodes that are selected
        const markSelectedNodes = (node) => {
            if (node.item && node.item.select) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[SELECT_RELATIONSHIPS] Processing select statements for ${node.item.name}: [${node.item.select.join(', ')}]`);
                for (const selectTarget of node.item.select) {
                    const targetNode = nodeMap.get(selectTarget);
                    if (targetNode && targetNode.item) {
                        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[SELECT_RELATIONSHIPS] Found target node ${selectTarget}, marking as selected by ${node.item.name}`);
                        // Mark the target as being selected
                        if (!targetNode.item.selectedBy) {
                            targetNode.item.selectedBy = [];
                        }
                        if (!targetNode.item.selectedBy.includes(node.item.name)) {
                            targetNode.item.selectedBy.push(node.item.name);
                            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[SELECT_RELATIONSHIPS] Added selectedBy relationship: ${selectTarget} is selected by ${node.item.name}`);
                        }
                        // If the target has no prompt but is selected, mark it for special handling
                        if (!targetNode.prompt && targetNode.item.selectedBy.length > 0) {
                            // This node should not have its children flattened
                            // because it needs to maintain its if block structure
                            targetNode.item.isImplicitContainer = true;
                            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[SELECT_RELATIONSHIPS] Marked ${selectTarget} as implicit container (no prompt but selected)`);
                        }
                    }
                    else {
                        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[SELECT_RELATIONSHIPS] WARNING: Select target ${selectTarget} not found in node map for selector ${node.item.name}`);
                    }
                }
            }
            let child = node.list;
            while (child) {
                markSelectedNodes(child);
                child = child.next;
            }
        };
        markSelectedNodes(root);
        // Log final select relationships
        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser('[SELECT_RELATIONSHIPS] Final select relationships:');
        for (const [name, node] of nodeMap) {
            if (node.item && node.item.selectedBy && node.item.selectedBy.length > 0) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[SELECT_RELATIONSHIPS]   ${name} is selected by: [${node.item.selectedBy.join(', ')}]`);
            }
        }
        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser('[SELECT_RELATIONSHIPS] Select relationships building completed');
    }
    /**
     * Build reverse select relationships (selectedBy) in Menu array.
     * This is called after converting to Menu array for compatibility.
     */
    buildSelectRelationships(menus) {
        const allMenus = this.flattenMenus(menus);
        // Build menu map for quick lookup
        const menuMap = new Map();
        for (const menu of allMenus) {
            if (menu.name) {
                menuMap.set(menu.name, menu);
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[MENU_SELECT_RELATIONSHIPS] Mapped menu: ${menu.name} (has select: ${menu.select.length > 0})`);
            }
        }
        // Build selectedBy relationships
        let selectRelationshipsFound = 0;
        for (const menu of allMenus) {
            if (menu.select.length > 0) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[MENU_SELECT_RELATIONSHIPS] Processing ${menu.name} select targets: [${menu.select.join(', ')}]`);
                for (const selectTarget of menu.select) {
                    const targetMenu = menuMap.get(selectTarget);
                    if (targetMenu) {
                        if (!targetMenu.selectedBy.includes(menu.name)) {
                            targetMenu.selectedBy.push(menu.name);
                            selectRelationshipsFound++;
                            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[MENU_SELECT_RELATIONSHIPS] Added relation: ${selectTarget} selected by ${menu.name}`);
                        }
                    }
                    else {
                        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.warn(`[MENU_SELECT_RELATIONSHIPS] WARNING: Select target ${selectTarget} not found for selector ${menu.name}`);
                        // Special warning for DFS_USING_POSIX
                        if (selectTarget === 'DFS_USING_POSIX') {
                            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.error(`[MENU_SELECT_RELATIONSHIPS] *** ERROR: DFS_USING_POSIX not found in menu map! ***`);
                        }
                    }
                }
            }
        }
        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debugParser(`[MENU_SELECT_RELATIONSHIPS] Built ${selectRelationshipsFound} select relationships`);
    }
    /**
     * Flatten menu hierarchy to get all menus.
     */
    flattenMenus(menus) {
        const result = [];
        for (const menu of menus) {
            result.push(menu);
            if (menu.children && menu.children.length > 0) {
                result.push(...this.flattenMenus(menu.children));
            }
        }
        return result;
    }
}


/***/ },

/***/ "./src/menuconfig/KconfigServer.ts"
/*!*****************************************!*\
  !*** ./src/menuconfig/KconfigServer.ts ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   KconfigServer: () => (/* binding */ KconfigServer)
/* harmony export */ });
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! events */ "events");
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(events__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _Menu__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Menu */ "./src/menuconfig/Menu.ts");
/* harmony import */ var _KconfigMenuLoader__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./KconfigMenuLoader */ "./src/menuconfig/KconfigMenuLoader.ts");
/* harmony import */ var _MenuTransferSerializer__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./MenuTransferSerializer */ "./src/menuconfig/MenuTransferSerializer.ts");
/* harmony import */ var _logger_logger__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../logger/logger */ "./src/logger/logger.ts");
/* harmony import */ var _VisibilityManager__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./VisibilityManager */ "./src/menuconfig/VisibilityManager.ts");
/* harmony import */ var _fileWatcher__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./fileWatcher */ "./src/menuconfig/fileWatcher.ts");
/* harmony import */ var _KconfigWriter__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./KconfigWriter */ "./src/menuconfig/KconfigWriter.ts");
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











class KconfigServer extends events__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
    static instance = null;
    serverProcess = null;
    receivedDataBuffer = "";
    kconfigMenus = [];
    defaultValues = new Map();
    workspaceFolder;
    kconfigFile;
    configFile;
    isRunning = false;
    unsavedChanges = false;
    visibilityManager;
    kconfigWriter;
    menuIndex = new Map();
    menuNameIndex = new Map();
    choiceParentByChildId = new Map();
    menuParentByChildId = new Map();
    menuStateCache = new Map();
    constructor(options) {
        super();
        this.workspaceFolder = options.workspaceFolder;
        this.kconfigFile = options.kconfigFile;
        // If no configFile specified, default to .config in the same directory as the Kconfig file
        if (options.configFile) {
            this.configFile = options.configFile;
        }
        else {
            const kconfigDir = path__WEBPACK_IMPORTED_MODULE_1__.dirname(options.kconfigFile);
            this.configFile = path__WEBPACK_IMPORTED_MODULE_1__.join(kconfigDir, ".config");
        }
        this.visibilityManager = new _VisibilityManager__WEBPACK_IMPORTED_MODULE_8__.VisibilityManager();
        // Pass the visibility manager's evaluator to the writer so it uses the same context
        this.kconfigWriter = new _KconfigWriter__WEBPACK_IMPORTED_MODULE_10__.KconfigWriter(this.defaultValues, this.visibilityManager.getEvaluator());
    }
    static async init(options) {
        if (KconfigServer.instance) {
            KconfigServer.instance.dispose();
        }
        KconfigServer.instance = new KconfigServer(options);
        await KconfigServer.instance.start();
        return KconfigServer.instance;
    }
    static getInstance() {
        return KconfigServer.instance;
    }
    async start() {
        // For now, use a simple implementation that reads Kconfig files directly
        // In the future, this could be replaced with a Python-based Kconfig server
        // using kconfiglib or similar tools
        this.isRunning = true;
        // Load Kconfig structure using the specific file
        const targetFile = vscode__WEBPACK_IMPORTED_MODULE_2__.Uri.file(this.kconfigFile);
        const loader = new _KconfigMenuLoader__WEBPACK_IMPORTED_MODULE_5__.KconfigMenuLoader(this.workspaceFolder, targetFile);
        this.kconfigMenus = await loader.loadKconfigMenus();
        // Save default values from Kconfig
        this.saveDefaultValues(this.kconfigMenus);
        this.rebuildMenuCaches();
        // Load existing config values if available
        if (fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(this.configFile)) {
            await this.loadConfigValues();
        }
        this.reconcileChoicesFromChildren();
        // Initialize visibility manager with loaded menus
        _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.info(() => `[KCONFIG_SERVER] Initializing visibility manager with ${this.kconfigMenus.length} menus`);
        this.visibilityManager.initialize(this.kconfigMenus);
        this.forceTopLevelMenusVisible(this.kconfigMenus);
        this.rebuildMenuCaches();
        _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.info(() => `[KCONFIG_SERVER] Initialized with ${this.kconfigMenus.length} menus and visibility manager`);
        this.emit("ready", this.kconfigMenus);
    }
    getMenus() {
        return this.kconfigMenus;
    }
    async reloadFromDisk() {
        const loader = new _KconfigMenuLoader__WEBPACK_IMPORTED_MODULE_5__.KconfigMenuLoader(this.workspaceFolder, vscode__WEBPACK_IMPORTED_MODULE_2__.Uri.file(this.kconfigFile));
        this.kconfigMenus = await loader.loadKconfigMenus();
        this.saveDefaultValues(this.kconfigMenus);
        this.rebuildMenuCaches();
        if (fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(this.configFile)) {
            await this.loadConfigValues();
        }
        this.visibilityManager.initialize(this.kconfigMenus);
        this.forceTopLevelMenusVisible(this.kconfigMenus);
        this.rebuildMenuCaches();
        _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.info(() => "[KCONFIG_SERVER] Reloaded from disk: " + this.kconfigMenus.length + " menus");
        return this.kconfigMenus;
    }
    getVisibilityManager() {
        return this.visibilityManager;
    }
    hasUnsavedChanges() {
        return this.unsavedChanges;
    }
    getMenuDetailById(id) {
        const menu = this.menuIndex.get(id);
        if (!menu) {
            return null;
        }
        const detail = (0,_MenuTransferSerializer__WEBPACK_IMPORTED_MODULE_6__.createMenuDetailPayload)(menu);
        if (!detail.prompt) {
            detail.prompt = menu.title || menu.name || "";
        }
        if (!detail.directDepExpr && menu.dependsOn && menu.dependsOn.trim() !== "" && menu.dependsOn.trim() !== "y") {
            detail.directDepExpr = menu.dependsOn;
        }
        if (!detail.menuPath) {
            detail.menuPath = this.buildMenuPath(id);
        }
        return detail;
    }
    updateValue(updatedMenu) {
        this.unsavedChanges = true;
        const targetMenu = this.menuIndex.get(updatedMenu.id);
        if (!targetMenu) {
            return;
        }
        // Validate and clamp numeric-like values against range constraints.
        let newValue = updatedMenu.value;
        if ((targetMenu.type === _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.int || targetMenu.type === _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.hex) && targetMenu.range && targetMenu.range.length >= 2) {
            const min = targetMenu.range[0];
            const max = targetMenu.range[1];
            const numValue = typeof newValue === 'number' ? newValue : parseInt(newValue.toString(), 10);
            if (!isNaN(numValue)) {
                if (numValue < min) {
                    newValue = min;
                }
                else if (numValue > max) {
                    newValue = max;
                }
            }
        }
        targetMenu.value = newValue;
        this.kconfigMenus = this.visibilityManager.updateValue(targetMenu.id, newValue);
        const affectedIds = this.visibilityManager.consumeLastAffectedMenuIds();
        const visibilityChanges = this.collectChangesForAffectedMenus(affectedIds);
        if (visibilityChanges.length > 0) {
            this.emit("visibilityChanged", visibilityChanges);
        }
    }
    async saveConfig() {
        this.logCurrentValues("[SAVE] Values before save");
        try {
            const assignments = this.kconfigWriter.collectAssignments(this.kconfigMenus);
            const headerPath = await this.resolveHeaderPath();
            // 通知 FileWatcher 忽略内部写入导致的变更
            _fileWatcher__WEBPACK_IMPORTED_MODULE_9__.FileWatcher.getInstance()?.ignoreNextChange();
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
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.error("Failed to save configuration", error);
            vscode__WEBPACK_IMPORTED_MODULE_2__.window.showErrorMessage(`Failed to save configuration: ${error}`);
        }
    }
    async saveDefconfig(filepath) {
        try {
            const assignments = this.kconfigWriter.collectAssignments(this.kconfigMenus);
            const defaultPath = path__WEBPACK_IMPORTED_MODULE_1__.join(path__WEBPACK_IMPORTED_MODULE_1__.dirname(this.configFile), "defconfig");
            const defconfigPath = filepath || defaultPath;
            await this.kconfigWriter.write({
                menus: this.kconfigMenus,
                assignments,
                defconfigOut: defconfigPath,
                configHeader: undefined,
                saveOld: false,
            });
            vscode__WEBPACK_IMPORTED_MODULE_2__.window.showInformationMessage("Default configuration saved to " + defconfigPath);
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.error("Failed to save defconfig", error);
            vscode__WEBPACK_IMPORTED_MODULE_2__.window.showErrorMessage("Failed to save defconfig: " + error);
        }
    }
    exportConfigText() {
        const lines = [];
        const header = this.getConfigHeader();
        if (header)
            lines.push(header);
        lines.push(...this.kconfigWriter.generateConfigLines(this.kconfigMenus));
        return lines.join("\n") + (lines.length > 0 ? "\n" : "");
    }
    async resetToDefaults() {
        // Logger.info("[RESET] Starting reset to defaults operation");
        // Logger.info(`[RESET] Default values stored: ${this.defaultValues.size}`);
        // Logger.info(`[RESET] Config file path: ${this.configFile}`);
        // 通知 FileWatcher 忽略接下来的文件变化（删除操作触发的）
        _fileWatcher__WEBPACK_IMPORTED_MODULE_9__.FileWatcher.getInstance()?.ignoreNextChange();
        // Delete .config file if it exists
        if (fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(this.configFile)) {
            try {
                await fs__WEBPACK_IMPORTED_MODULE_3__.promises.unlink(this.configFile);
                // Logger.info("[RESET] Successfully deleted .config file");
            }
            catch (error) {
                // Logger.warn(`[RESET] Failed to delete .config file: ${error}`);
            }
        }
        else {
            // Logger.info("[RESET] .config file does not exist, nothing to delete");
        }
        // Log all stored default values
        // for (const [name, value] of this.defaultValues.entries()) {
        //     Logger.info(`[RESET] Default value: ${name} = ${value}`);
        // }
        // Reset all values to their default values from Kconfig
        const resetMenuValues = (menus, depth = 0) => {
            const _indent = "  ".repeat(depth);
            for (const menu of menus) {
                if (menu.type !== _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.menu && menu.name) {
                    const _oldValue = menu.value;
                    // Restore the default value from saved defaults
                    const defaultValue = this.defaultValues.get(menu.name);
                    menu.value = defaultValue !== undefined ? defaultValue : null;
                    // Logger.info(`[RESET] ${indent}${menu.name} (${menu.type}): ${oldValue} -> ${menu.value} (default: ${defaultValue})`);
                }
                if (menu.children) {
                    resetMenuValues(menu.children, depth + 1);
                }
            }
        };
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
    async discardChanges() {
        _fileWatcher__WEBPACK_IMPORTED_MODULE_9__.FileWatcher.getInstance()?.ignoreNextChange();
        // Reset all values to Kconfig defaults (without deleting .config)
        this.resetMenuValuesToDefaults();
        // Then re-apply .config values on top
        if (fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(this.configFile)) {
            await this.loadConfigValues();
        }
        this.rebuildMenuCaches();
        this.visibilityManager.initialize(this.kconfigMenus);
        this.forceTopLevelMenusVisible(this.kconfigMenus);
        this.unsavedChanges = false;
        this.emit("changesDiscarded", this.kconfigMenus);
    }
    resetMenuValuesToDefaults() {
        const resetMenuValues = (menus) => {
            for (const menu of menus) {
                if (menu.type !== _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.menu && menu.name && menu.type !== _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.choice) {
                    const defaultValue = this.defaultValues.get(menu.name);
                    menu.value = defaultValue !== undefined ? defaultValue : null;
                }
                if (menu.children) {
                    resetMenuValues(menu.children);
                }
            }
        };
        resetMenuValues(this.kconfigMenus);
        // Restore choice selections from child defaults
        this.reconcileChoicesFromChildren();
    }
    async loadConfigValues() {
        try {
            const configContent = await fs__WEBPACK_IMPORTED_MODULE_3__.promises.readFile(this.configFile, "utf8");
            const configLines = configContent.split("\n");
            _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.info(() => `[LOAD_CONFIG] Reading config file: ${this.configFile}`);
            _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.info(() => `[LOAD_CONFIG] Total lines in config: ${configLines.length}`);
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
            _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.info(() => `[LOAD_CONFIG] Processed ${_processedLines} config lines, skipped ${_skippedLines} lines`);
            // After loading raw values, reconcile choice containers from children values
            this.reconcileChoicesFromChildren();
            // Extra debug for memory allocator related symbols
            const logVal = (name) => {
                const menu = this.findMenuByName(name);
                return menu ? `name=${name}, value=${menu.value}` : `name=${name} not found`;
            };
            _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.info("[LOAD_CONFIG] Memory allocator status after load:");
            _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.info("[LOAD_CONFIG]   " + logVal("RT_USING_SMALL_MEM"));
            _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.info("[LOAD_CONFIG]   " + logVal("RT_USING_SLAB"));
            _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.info("[LOAD_CONFIG]   " + logVal("RT_USING_SMALL_MEM_AS_HEAP"));
            _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.info("[LOAD_CONFIG]   " + logVal("RT_USING_SLAB_AS_HEAP"));
            const heapChoice = this.findParentChoice("RT_USING_SMALL_MEM_AS_HEAP") || this.findParentChoice("RT_USING_SLAB_AS_HEAP");
            if (heapChoice) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.info(() => `[LOAD_CONFIG]   choice(System Heap) selected: ${heapChoice.value}`);
            }
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.error("Failed to load config values", error);
        }
    }
    /**
     * Reconcile choice container values based on their children's boolean values.
     * Kconfiglib semantics: if a child bool within a choice is 'y', that child is the selection.
     * When multiple children are 'y' (shouldn't happen), prefer the last 'y' encountered.
     */
    reconcileChoicesFromChildren() {
        const process = (menus) => {
            for (const menu of menus) {
                if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.choice && menu.children && menu.children.length > 0) {
                    let selected = null;
                    for (const child of menu.children) {
                        if (child.type === _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.bool && child.value === true) {
                            selected = child.name;
                        }
                    }
                    // Fallback: use the first unconditional default from the choice definition
                    if (!selected && menu.defaults && menu.defaults.length > 0) {
                        for (const def of menu.defaults) {
                            if (!def.condition || def.condition.trim() === "y") {
                                selected = def.value;
                                break;
                            }
                        }
                    }
                    if (selected) {
                        menu.value = selected;
                        for (const child of menu.children) {
                            child.value = child.name === selected;
                        }
                    }
                }
                if (menu.children && menu.children.length > 0) {
                    process(menu.children);
                }
            }
        };
        process(this.kconfigMenus);
    }
    updateMenuValueByName(name, value) {
        return this.updateIndexedMenuValues(name, value);
    }
    async resolveHeaderPath() {
        const config = vscode__WEBPACK_IMPORTED_MODULE_2__.workspace.getConfiguration("imde.guiConfig");
        let headerPath = config.get("autoHeaderPath", "")?.trim() || "";
        if (!headerPath) {
            return null;
        }
        if (!path__WEBPACK_IMPORTED_MODULE_1__.isAbsolute(headerPath)) {
            const configDir = path__WEBPACK_IMPORTED_MODULE_1__.dirname(this.configFile);
            headerPath = path__WEBPACK_IMPORTED_MODULE_1__.join(configDir, headerPath);
        }
        await fs__WEBPACK_IMPORTED_MODULE_3__.promises.mkdir(path__WEBPACK_IMPORTED_MODULE_1__.dirname(headerPath), { recursive: true });
        return headerPath;
    }
    getConfigHeader() {
        return "#\n# Automatically generated file; DO NOT EDIT.\n#\n\n";
    }
    getAutoHeader() {
        return "/*\n * Automatically generated file; DO NOT EDIT.\n */\n\n";
    }
    saveDefaultValues(menus) {
        // Logger.info("[SAVE_DEFAULTS] Starting to save default values");
        const saveValues = (menus, depth = 0) => {
            const _indent = "  ".repeat(depth);
            for (const menu of menus) {
                if (menu.type !== _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.menu && menu.name) {
                    // 保存所有有name的菜单项的默认值，包括值为null或undefined的
                    this.defaultValues.set(menu.name, menu.value);
                    // Logger.info(`[SAVE_DEFAULTS] ${indent}Saved default: ${menu.name} (${menu.type}) = ${menu.value}`);
                }
                if (menu.children) {
                    saveValues(menu.children, depth + 1);
                }
            }
        };
        saveValues(menus);
        // Logger.info(`[SAVE_DEFAULTS] Saved ${this.defaultValues.size} default values`);
    }
    /**
     * Find a menu by its symbol name in the current menu tree
     */
    findMenuByName(name) {
        const dfs = (menus) => {
            for (const m of menus) {
                if (m.name === name)
                    return m;
                if (m.children && m.children.length > 0) {
                    const found = dfs(m.children);
                    if (found)
                        return found;
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
    formatHeaderLine(_, __) {
        return "";
    }
    /**
     * Escapes string for .config file output, matching Kconfiglib behavior
     * Backslashes must be escaped before quotes to avoid double escaping
     */
    findParentChoice(childName) {
        const byName = this.menuNameIndex.get(childName) || [];
        for (const target of byName) {
            const parentChoice = this.choiceParentByChildId.get(target.id);
            if (parentChoice) {
                return parentChoice;
            }
        }
        return null;
    }
    rebuildMenuCaches() {
        const nextIndex = new Map();
        const nextNameIndex = new Map();
        const nextChoiceParent = new Map();
        const nextParentByChildId = new Map();
        const nextState = new Map();
        const stack = this.kconfigMenus.map((menu) => ({ menu, parentId: null }));
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
            if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.choice && menu.children && menu.children.length > 0) {
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
    buildMenuPath(menuId) {
        const segments = [];
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
    updateIndexedMenuValues(name, rawValue) {
        const targets = this.menuNameIndex.get(name);
        if (!targets || targets.length === 0) {
            return false;
        }
        for (const menu of targets) {
            this.applyConfigValueToMenu(menu, rawValue);
        }
        return true;
    }
    applyConfigValueToMenu(menu, rawValue) {
        switch (menu.type) {
            case _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.bool: {
                menu.value = rawValue === "y";
                const parentChoice = this.choiceParentByChildId.get(menu.id);
                if (parentChoice) {
                    if (menu.value === true) {
                        parentChoice.value = menu.name;
                        for (const sibling of parentChoice.children || []) {
                            if (sibling.name !== menu.name && sibling.type === _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.bool) {
                                sibling.value = false;
                            }
                        }
                        _logger_logger__WEBPACK_IMPORTED_MODULE_7__.Logger.info(() => `[LOAD_CONFIG] Set parent choice "${parentChoice.title || parentChoice.name}" <- ${menu.name}`);
                    }
                    else if (parentChoice.value === menu.name) {
                        parentChoice.value = null;
                    }
                }
                return;
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.tristate: {
                let normalized = "n";
                const lower = rawValue.toLowerCase();
                if (lower === "y" || lower === "2") {
                    normalized = "y";
                }
                else if (lower === "m" || lower === "1") {
                    normalized = "m";
                }
                menu.value = normalized;
                return;
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.int:
                menu.value = parseInt(rawValue, 10);
                return;
            case _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.hex:
                menu.value = rawValue;
                return;
            case _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.string:
                menu.value = rawValue.replace(/^"(.*)"$/, "$1");
                return;
            case _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.choice:
                menu.value = rawValue === "y" ? menu.name : null;
                return;
            default:
                menu.value = rawValue;
                return;
        }
    }
    forceTopLevelMenusVisible(menus) {
        menus.forEach((menu) => {
            if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.menu && menu.hasPrompt && (!menu.dependsOn || menu.dependsOn.trim() === "")) {
                menu.isVisible = true;
                menu.isContainerVisible = true;
            }
            if (menu.children && menu.children.length > 0) {
                this.forceTopLevelMenusVisible(menu.children);
            }
        });
    }
    snapshotMenuState(menu) {
        return {
            type: menu.type,
            value: menu.value,
            isVisible: menu.isVisible,
            isContainerVisible: menu.isContainerVisible,
            isReadonly: menu.isReadonly,
            readonlyReason: menu.readonlyReason,
            selectedBy: menu.selectedBy ? [...menu.selectedBy] : undefined,
            autoSelectedValue: menu.autoSelectedValue,
            autoImpliedValue: menu.autoImpliedValue,
        };
    }
    collectChangesForAffectedMenus(affectedIds) {
        const visibilityChanges = [];
        for (const id of affectedIds) {
            const menu = this.menuIndex.get(id);
            if (!menu) {
                continue;
            }
            const before = this.menuStateCache.get(id);
            const current = this.snapshotMenuState(menu);
            const valueDiff = !before || !this.areMenuValuesEqual(before.value, current.value, current.type);
            const visibilityDiff = !before || (before.isVisible !== current.isVisible ||
                before.isContainerVisible !== current.isContainerVisible ||
                before.isReadonly !== current.isReadonly ||
                before.readonlyReason !== current.readonlyReason ||
                this.arrayChanged(before.selectedBy, current.selectedBy) ||
                before.autoSelectedValue !== current.autoSelectedValue ||
                before.autoImpliedValue !== current.autoImpliedValue);
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
    areMenuValuesEqual(previous, current, type) {
        switch (type) {
            case _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.int:
                return Number(previous) === Number(current);
            case _Menu__WEBPACK_IMPORTED_MODULE_4__.menuType.hex:
                if (previous === undefined && current === undefined)
                    return true;
                return String(previous || '').toLowerCase() === String(current || '').toLowerCase();
            default:
                return previous === current;
        }
    }
    arrayChanged(a, b) {
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
    logCurrentValues(_prefix) {
        const logMenuValues = (menus, depth = 0) => {
            const _indent = "  ".repeat(depth);
            for (const menu of menus) {
                if (menu.name && menu.value !== null && menu.value !== undefined) {
                    // Logger.info(`${prefix} ${indent}${menu.name} (${menu.type}): ${menu.value}`);
                }
                if (menu.children && menu.children.length > 0) {
                    logMenuValues(menu.children, depth + 1);
                }
            }
        };
        // Logger.info(`${prefix} - Current configuration values:`);
        logMenuValues(this.kconfigMenus);
    }
    dispose() {
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


/***/ },

/***/ "./src/menuconfig/KconfigSessionCache.ts"
/*!***********************************************!*\
  !*** ./src/menuconfig/KconfigSessionCache.ts ***!
  \***********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   KconfigSessionCache: () => (/* binding */ KconfigSessionCache)
/* harmony export */ });
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! crypto */ "crypto");
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(crypto__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _logger_logger__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../logger/logger */ "./src/logger/logger.ts");




class KconfigSessionCache {
    static CACHE_VERSION = 3;
    static CACHE_KEY_VERSION = "v3";
    static MAX_STAT_CONCURRENCY = 64;
    static HOT_CACHE_TTL_MS = 10000;
    static HOT_CACHE_MAX_ENTRIES = 4;
    static HOT_CACHE_SAMPLE_SIZE = 12;
    static hotCache = new Map();
    cacheDir;
    constructor(workspaceFolder) {
        this.cacheDir = path__WEBPACK_IMPORTED_MODULE_2__.join(workspaceFolder, ".kconfig-cache");
    }
    static buildCacheKey(mainKconfigFile) {
        return crypto__WEBPACK_IMPORTED_MODULE_0__.createHash("sha1")
            .update(`${path__WEBPACK_IMPORTED_MODULE_2__.normalize(mainKconfigFile)}|${KconfigSessionCache.CACHE_KEY_VERSION}`)
            .digest("hex");
    }
    async load(cacheKey) {
        const hotCached = await this.tryLoadFromHotCache(cacheKey);
        if (hotCached) {
            return hotCached;
        }
        const cacheFilePath = this.getCacheFilePath(cacheKey);
        try {
            const content = await fs__WEBPACK_IMPORTED_MODULE_1__.promises.readFile(cacheFilePath, "utf8");
            const payload = JSON.parse(content);
            if (!payload ||
                payload.version !== KconfigSessionCache.CACHE_VERSION ||
                payload.cacheKey !== cacheKey ||
                !Array.isArray(payload.files) ||
                !Array.isArray(payload.menus)) {
                return null;
            }
            const valid = await this.validateFileSignatures(payload.files);
            if (!valid) {
                KconfigSessionCache.hotCache.delete(cacheKey);
                return null;
            }
            this.updateHotCache(cacheKey, payload.files, payload.menus);
            return this.cloneMenus(payload.menus);
        }
        catch (error) {
            const err = error;
            if (err && err.code === "ENOENT") {
                KconfigSessionCache.hotCache.delete(cacheKey);
                return null;
            }
            _logger_logger__WEBPACK_IMPORTED_MODULE_3__.Logger.debug(() => `[SESSION_CACHE] Load failed: ${err?.message || String(error)}`);
            return null;
        }
    }
    async save(cacheKey, menus, parsedFiles) {
        if (!Array.isArray(menus) || menus.length === 0 || !Array.isArray(parsedFiles) || parsedFiles.length === 0) {
            return;
        }
        const normalizedFiles = Array.from(new Set(parsedFiles.map((filePath) => path__WEBPACK_IMPORTED_MODULE_2__.normalize(filePath)))).sort((a, b) => a.localeCompare(b));
        const signatures = await this.collectFileSignatures(normalizedFiles);
        if (signatures.length === 0) {
            return;
        }
        const payload = {
            version: KconfigSessionCache.CACHE_VERSION,
            cacheKey,
            createdAt: Date.now(),
            files: signatures,
            menus,
        };
        const cacheFilePath = this.getCacheFilePath(cacheKey);
        const tempFilePath = `${cacheFilePath}.tmp`;
        try {
            await fs__WEBPACK_IMPORTED_MODULE_1__.promises.mkdir(this.cacheDir, { recursive: true });
            await fs__WEBPACK_IMPORTED_MODULE_1__.promises.writeFile(tempFilePath, JSON.stringify(payload), "utf8");
            await fs__WEBPACK_IMPORTED_MODULE_1__.promises.rename(tempFilePath, cacheFilePath);
            this.updateHotCache(cacheKey, signatures, menus);
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_3__.Logger.debug(() => `[SESSION_CACHE] Save failed: ${error instanceof Error ? error.message : String(error)}`);
            try {
                await fs__WEBPACK_IMPORTED_MODULE_1__.promises.unlink(tempFilePath);
            }
            catch {
                // noop
            }
        }
    }
    getCacheFilePath(cacheKey) {
        return path__WEBPACK_IMPORTED_MODULE_2__.join(this.cacheDir, `${cacheKey}.json`);
    }
    async tryLoadFromHotCache(cacheKey) {
        const entry = KconfigSessionCache.hotCache.get(cacheKey);
        if (!entry) {
            return null;
        }
        if (Date.now() - entry.loadedAt > KconfigSessionCache.HOT_CACHE_TTL_MS) {
            KconfigSessionCache.hotCache.delete(cacheKey);
            return null;
        }
        const sampleValid = await this.validateSampledSignatures(entry.files, KconfigSessionCache.HOT_CACHE_SAMPLE_SIZE);
        if (!sampleValid) {
            KconfigSessionCache.hotCache.delete(cacheKey);
            return null;
        }
        return this.cloneMenus(entry.menus);
    }
    updateHotCache(cacheKey, files, menus) {
        KconfigSessionCache.hotCache.set(cacheKey, {
            loadedAt: Date.now(),
            files,
            menus: this.cloneMenus(menus),
        });
        if (KconfigSessionCache.hotCache.size <= KconfigSessionCache.HOT_CACHE_MAX_ENTRIES) {
            return;
        }
        let oldestKey = null;
        let oldestTs = Number.MAX_SAFE_INTEGER;
        for (const [key, value] of KconfigSessionCache.hotCache.entries()) {
            if (value.loadedAt < oldestTs) {
                oldestTs = value.loadedAt;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            KconfigSessionCache.hotCache.delete(oldestKey);
        }
    }
    async validateSampledSignatures(signatures, sampleSize) {
        if (!Array.isArray(signatures) || signatures.length === 0) {
            return false;
        }
        if (signatures.length <= sampleSize) {
            return this.validateFileSignatures(signatures);
        }
        const sampled = [];
        const seen = new Set();
        const normalizedSampleSize = Math.max(2, sampleSize);
        const step = Math.max(1, Math.floor((signatures.length - 1) / (normalizedSampleSize - 1)));
        for (let i = 0; i < normalizedSampleSize; i++) {
            const index = i === normalizedSampleSize - 1
                ? signatures.length - 1
                : Math.min(i * step, signatures.length - 1);
            if (!seen.has(index)) {
                seen.add(index);
                sampled.push(signatures[index]);
            }
        }
        return this.validateFileSignatures(sampled);
    }
    cloneMenus(menus) {
        return JSON.parse(JSON.stringify(menus));
    }
    async validateFileSignatures(signatures) {
        if (!Array.isArray(signatures) || signatures.length === 0) {
            return false;
        }
        const [rootFile, ...rest] = signatures;
        if (!(await this.isSignatureMatched(rootFile))) {
            return false;
        }
        const results = await this.mapWithConcurrency(rest, KconfigSessionCache.MAX_STAT_CONCURRENCY, async (entry) => {
            return this.isSignatureMatched(entry);
        });
        return results.every((matched) => matched === true);
    }
    async collectFileSignatures(files) {
        const collected = await this.mapWithConcurrency(files, KconfigSessionCache.MAX_STAT_CONCURRENCY, async (filePath) => {
            try {
                const stat = await fs__WEBPACK_IMPORTED_MODULE_1__.promises.stat(filePath);
                if (!stat.isFile()) {
                    return null;
                }
                return {
                    path: filePath,
                    size: stat.size,
                    mtimeMs: stat.mtimeMs,
                };
            }
            catch {
                return null;
            }
        });
        return collected.filter((entry) => !!entry);
    }
    async isSignatureMatched(entry) {
        try {
            const stat = await fs__WEBPACK_IMPORTED_MODULE_1__.promises.stat(entry.path);
            return stat.isFile() && stat.size === entry.size && stat.mtimeMs === entry.mtimeMs;
        }
        catch {
            return false;
        }
    }
    async mapWithConcurrency(items, concurrency, worker) {
        if (items.length === 0) {
            return [];
        }
        const limit = Math.max(1, Math.min(concurrency, items.length));
        const results = new Array(items.length);
        let cursor = 0;
        const run = async () => {
            let current = cursor;
            cursor += 1;
            while (current < items.length) {
                results[current] = await worker(items[current]);
                current = cursor;
                cursor += 1;
            }
        };
        await Promise.all(Array.from({ length: limit }, () => run()));
        return results;
    }
}


/***/ },

/***/ "./src/menuconfig/KconfigWriter.ts"
/*!*****************************************!*\
  !*** ./src/menuconfig/KconfigWriter.ts ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   KconfigWriter: () => (/* binding */ KconfigWriter)
/* harmony export */ });
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Menu__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Menu */ "./src/menuconfig/Menu.ts");
/* harmony import */ var _ConditionEvaluator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ConditionEvaluator */ "./src/menuconfig/ConditionEvaluator.ts");
/* harmony import */ var _logger_logger__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../logger/logger */ "./src/logger/logger.ts");




class KconfigWriter {
    evaluator;
    defaultValues;
    constructor(defaultValues, evaluator) {
        this.defaultValues = defaultValues;
        this.evaluator = evaluator || new _ConditionEvaluator__WEBPACK_IMPORTED_MODULE_2__.ConditionEvaluator();
    }
    /**
     * Update the configuration context for dependency evaluation
     */
    updateContext(context) {
        this.evaluator.updateContext(context);
    }
    collectAssignments(menus) {
        const assignments = [];
        const visited = new Set();
        const traverse = (items) => {
            for (const item of items) {
                if (item.name && !visited.has(item.name) && item.type !== _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.menu && item.type !== _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.choice) {
                    visited.add(item.name);
                    if (this.shouldSkipSymbol(item)) {
                        continue;
                    }
                    const assignment = this.serializeMenuValue(item);
                    if (assignment) {
                        assignments.push(assignment);
                    }
                }
                if (item.children && item.children.length > 0) {
                    traverse(item.children);
                }
            }
        };
        traverse(menus);
        return assignments;
    }
    async write(options) {
        const assignments = options.assignments ?? this.collectAssignments(options.menus);
        if (options.configOut) {
            await this.writeConfigFile(options.configOut, options.menus, options.configHeader, options.saveOld !== false);
        }
        if (options.headerOut) {
            await this.writeHeaderFile(options.headerOut, options.menus, options.headerHeader);
        }
        if (options.defconfigOut) {
            await this.writeDefconfigFile(options.defconfigOut, assignments, options.configHeader);
        }
    }
    async writeConfigFile(filename, menus, header, saveOld = true) {
        const lines = this.generateConfigLines(menus);
        let content = header ? header : "";
        if (lines.length > 0) {
            if (content && !content.endsWith("\n")) {
                content += "\n";
            }
            content += lines.join("\n");
            if (!content.endsWith("\n")) {
                content += "\n";
            }
        }
        await this.writeFileIfChanged(filename, content, saveOld);
    }
    async writeHeaderFile(filename, menus, header) {
        const lines = this.generateHeaderLines(menus);
        let content = header ? header : "";
        if (lines.length > 0) {
            if (content && !content.endsWith("\n")) {
                content += "\n";
            }
            content += lines.join("\n");
            if (!content.endsWith("\n")) {
                content += "\n";
            }
        }
        await this.writeFileIfChanged(filename, content, false);
    }
    async writeDefconfigFile(filename, assignments, header) {
        const lines = assignments.map((assignment) => this.formatDefconfigLine(assignment)).filter((line) => line.length > 0);
        let content = header ? header : "";
        if (lines.length > 0) {
            if (content && !content.endsWith("\n")) {
                content += "\n";
            }
            content += lines.join("\n");
            if (!content.endsWith("\n")) {
                content += "\n";
            }
        }
        await this.writeFileIfChanged(filename, content, false);
    }
    generateConfigLines(menus) {
        const lines = [];
        const visited = new Set();
        const stack = [{
                items: menus,
                index: 0,
                printedHeader: false,
                contentStartIndex: lines.length,
                hasChildNodes: menus.length > 0
            }];
        let afterEndComment = false;
        while (stack.length > 0) {
            const frame = stack[stack.length - 1];
            if (frame.index >= frame.items.length) {
                stack.pop();
                if (frame.parentMenu &&
                    frame.printedHeader &&
                    frame.parentTitle &&
                    (lines.length > frame.contentStartIndex ||
                        frame.hasChildNodes)) {
                    lines.push(`# end of ${frame.parentTitle}`);
                    afterEndComment = true;
                }
                continue;
            }
            const item = frame.items[frame.index++];
            if (item.type === _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.menu) {
                const title = this.getMenuTitle(item);
                const shouldPrintMenu = this.shouldPrintMenuHeader(item) && !!title;
                if (shouldPrintMenu && title) {
                    if (lines.length === 0 || lines[lines.length - 1] !== "") {
                        lines.push("");
                    }
                    lines.push("#");
                    lines.push(`# ${title}`);
                    lines.push("#");
                    afterEndComment = false;
                }
                const children = item.children && item.children.length > 0 ? item.children : [];
                stack.push({
                    items: children,
                    index: 0,
                    parentMenu: item,
                    parentTitle: title,
                    printedHeader: shouldPrintMenu && !!title,
                    contentStartIndex: lines.length,
                    hasChildNodes: children.length > 0
                });
                continue;
            }
            if (item.type === _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.choice) {
                const children = item.children && item.children.length > 0 ? item.children : [];
                if (children.length > 0) {
                    stack.push({
                        items: children,
                        index: 0,
                        printedHeader: false,
                        contentStartIndex: lines.length,
                        hasChildNodes: children.length > 0
                    });
                }
                continue;
            }
            if (item.name && !visited.has(item.name)) {
                visited.add(item.name);
                if (this.shouldSkipSymbol(item)) {
                    if (item.children && item.children.length > 0) {
                        stack.push({
                            items: item.children,
                            index: 0,
                            printedHeader: false,
                            contentStartIndex: lines.length,
                            hasChildNodes: item.children.length > 0
                        });
                    }
                    continue;
                }
                if (!this.shouldWriteToConfig(item)) {
                    if (item.children && item.children.length > 0) {
                        stack.push({
                            items: item.children,
                            index: 0,
                            printedHeader: false,
                            contentStartIndex: lines.length,
                            hasChildNodes: item.children.length > 0
                        });
                    }
                    continue;
                }
                if (afterEndComment) {
                    if (lines.length === 0 || lines[lines.length - 1] !== "") {
                        lines.push("");
                    }
                    afterEndComment = false;
                }
                const line = this.formatConfigLine(item);
                if (line) {
                    lines.push(line);
                }
            }
            if (item.children && item.children.length > 0) {
                stack.push({
                    items: item.children,
                    index: 0,
                    printedHeader: false,
                    contentStartIndex: lines.length,
                    hasChildNodes: item.children.length > 0
                });
            }
        }
        return lines;
    }
    getMenuTitle(menu) {
        if (!menu) {
            return "";
        }
        const title = menu.title && menu.title.trim().length > 0 ? menu.title.trim() : undefined;
        if (title) {
            return title;
        }
        const prompt = menu.prompt && menu.prompt.trim().length > 0 ? menu.prompt.trim() : undefined;
        if (prompt) {
            return prompt;
        }
        return menu.name ? menu.name.trim() : "";
    }
    shouldPrintMenuHeader(menu) {
        if (!menu) {
            return false;
        }
        if (menu.isMainMenu) {
            return false;
        }
        if (!this.isDependencySatisfied(menu.dependsOn)) {
            return false;
        }
        const title = this.getMenuTitle(menu);
        return title.length > 0;
    }
    isDependencySatisfied(dependsOn) {
        if (!dependsOn) {
            return true;
        }
        const trimmed = dependsOn.trim();
        if (trimmed === "" || trimmed === "y") {
            return true;
        }
        return this.evaluator.evaluate(trimmed);
    }
    /**
     * Check if a configuration item should be written to the config file.
     * Matches Kconfiglib's _write_to_conf behavior: only write if dependencies are satisfied.
     *
     * From Kconfiglib:
     * - _write_to_conf is set to (vis != 0) where vis is the visibility
     * - visibility is determined by evaluating the dependency expression
     * - If visibility is 0 (n), the config is not written
     */
    shouldWriteToConfig(menu) {
        if (menu.hasPrompt === false) {
            return this.shouldWritePromptless(menu);
        }
        const depsSatisfied = this.isDependencySatisfied(menu.dependsOn);
        if (!depsSatisfied) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_3__.Logger.debugWriter(`Skipping ${menu.name} due to unsatisfied dependencies: ${menu.dependsOn || 'none'}`);
        }
        return depsSatisfied;
    }
    shouldWritePromptless(menu) {
        switch (menu.type) {
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.bool:
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.tristate:
                return this.toTristate(menu.value) !== "n";
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.int:
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.hex:
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.string:
                return this.hasActiveDefault(menu);
            default:
                return false;
        }
    }
    hasActiveDefault(menu) {
        if (!menu.defaults || menu.defaults.length === 0) {
            return false;
        }
        for (const def of menu.defaults) {
            if (!def.condition || def.condition.trim().length === 0) {
                return true;
            }
            try {
                if (this.evaluator.evaluate(def.condition)) {
                    return true;
                }
            }
            catch (_) {
                continue;
            }
        }
        return false;
    }
    shouldSkipSymbol(menu) {
        if (!menu) {
            return false;
        }
        if (menu.optionDefconfigList) {
            return true;
        }
        if (menu.optionEnvVar) {
            return true;
        }
        return false;
    }
    generateHeaderLines(menus) {
        const lines = [];
        const visited = new Set();
        const traverse = (items) => {
            for (const item of items) {
                if (item.name && !visited.has(item.name) && item.type !== _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.menu && item.type !== _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.choice) {
                    visited.add(item.name);
                    if (this.shouldSkipSymbol(item)) {
                        continue;
                    }
                    const entry = this.formatHeaderLines(item);
                    lines.push(...entry);
                }
                if (item.children && item.children.length > 0) {
                    traverse(item.children);
                }
            }
        };
        traverse(menus);
        return lines;
    }
    formatConfigLine(menu) {
        const prefix = "CONFIG_" + menu.name;
        switch (menu.type) {
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.bool:
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.tristate: {
                const value = this.toTristate(menu.value);
                if (value === "n") {
                    return `# ${prefix} is not set`;
                }
                return `${prefix}=${value}`;
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.int: {
                const value = this.normalizeIntValue(menu);
                return value === null ? "" : `${prefix}=${value}`;
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.hex: {
                const value = this.normalizeHexValue(menu);
                return value ? `${prefix}=${value}` : "";
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.string: {
                const value = this.normalizeStringValue(menu);
                return value === null ? "" : `${prefix}="${this.escapeString(value)}"`;
            }
            default:
                return "";
        }
    }
    formatHeaderLines(menu) {
        const prefix = "CONFIG_" + menu.name;
        switch (menu.type) {
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.bool:
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.tristate: {
                const value = this.toTristate(menu.value);
                if (value === "y") {
                    return [`#define ${prefix} 1`];
                }
                if (value === "m") {
                    return [`#define ${prefix}_MODULE 1`];
                }
                return [];
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.int: {
                const value = this.normalizeIntValue(menu);
                return value === null ? [] : [`#define ${prefix} ${value}`];
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.hex: {
                const value = this.normalizeHexValue(menu);
                return value ? [`#define ${prefix} ${value}`] : [];
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.string: {
                const value = this.normalizeStringValue(menu);
                return value === null ? [] : [`#define ${prefix} "${this.escapeString(value)}"`];
            }
            default:
                return [];
        }
    }
    formatDefconfigLine(assignment) {
        const prefix = "CONFIG_" + assignment.name;
        switch (assignment.type) {
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.bool:
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.tristate: {
                const value = assignment.value;
                if (value === "n") {
                    return `# ${prefix} is not set`;
                }
                return `${prefix}=${value}`;
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.int:
                return `${prefix}=${assignment.value}`;
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.hex:
                return `${prefix}=${assignment.value}`;
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.string:
                return `${prefix}="${this.escapeString(String(assignment.value))}"`;
            default:
                return "";
        }
    }
    serializeMenuValue(menu) {
        if (!menu.name) {
            return null;
        }
        if (this.shouldSkipSymbol(menu)) {
            return null;
        }
        switch (menu.type) {
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.bool:
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.tristate: {
                const value = this.toTristate(menu.value);
                const defaultRaw = this.defaultValues.get(menu.name);
                const defaultValue = this.toTristate(defaultRaw);
                if (value === defaultValue) {
                    return null;
                }
                return { name: menu.name, type: menu.type, value };
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.int: {
                const value = this.normalizeIntValue(menu);
                const defaultValue = this.normalizeDefaultInt(this.defaultValues.get(menu.name));
                if (value === null && defaultValue === null) {
                    return null;
                }
                if (value !== null && defaultValue !== null && value === defaultValue) {
                    return null;
                }
                if (value === null) {
                    return null;
                }
                return { name: menu.name, type: menu.type, value };
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.hex: {
                const value = this.normalizeHexValue(menu);
                const defaultValue = this.normalizeDefaultHex(this.defaultValues.get(menu.name));
                if (!value && !defaultValue) {
                    return null;
                }
                if (value && defaultValue && value.toLowerCase() === defaultValue.toLowerCase()) {
                    return null;
                }
                if (!value) {
                    return null;
                }
                return { name: menu.name, type: menu.type, value };
            }
            case _Menu__WEBPACK_IMPORTED_MODULE_1__.menuType.string: {
                const value = this.normalizeStringValue(menu);
                const defaultValue = this.normalizeDefaultString(this.defaultValues.get(menu.name));
                if (value === null && defaultValue === null) {
                    return null;
                }
                if (value !== null && defaultValue !== null && value === defaultValue) {
                    return null;
                }
                if (value === null) {
                    return null;
                }
                return { name: menu.name, type: menu.type, value };
            }
            default:
                return null;
        }
    }
    expandStringValue(value) {
        if (!value) {
            return value;
        }
        return value.replace(/\$\(([^)]+)\)|\$([A-Za-z_][A-Za-z0-9_]*)/g, (_match, p1, p2) => {
            const varName = p1 || p2;
            if (!varName) {
                return '';
            }
            const envValue = process.env[varName];
            return envValue !== undefined ? envValue : '';
        });
    }
    normalizeIntValue(menu) {
        const raw = menu.value;
        if (raw === null || raw === undefined || raw === "") {
            return null;
        }
        const parsed = typeof raw === "number" ? raw : parseInt(raw.toString(), 10);
        if (Number.isNaN(parsed)) {
            return null;
        }
        if (menu.range && menu.range.length >= 2) {
            const [min, max] = menu.range;
            let value = parsed;
            if (Number.isFinite(min) && value < min) {
                value = min;
            }
            if (Number.isFinite(max) && value > max) {
                value = max;
            }
            return value;
        }
        return parsed;
    }
    normalizeHexValue(menu) {
        const raw = menu.value;
        if (raw === null || raw === undefined || raw === "") {
            return "";
        }
        let numeric = null;
        if (typeof raw === "number") {
            numeric = raw;
        }
        else if (typeof raw === "string") {
            const normalized = raw.startsWith("0x") || raw.startsWith("0X") ? raw.slice(2) : raw;
            const parsed = parseInt(normalized, 16);
            if (!Number.isNaN(parsed)) {
                numeric = parsed;
            }
        }
        if (numeric !== null) {
            if (menu.range && menu.range.length >= 2) {
                const [min, max] = menu.range;
                if (Number.isFinite(min) && numeric < min) {
                    numeric = min;
                }
                else if (Number.isFinite(max) && numeric > max) {
                    numeric = max;
                }
            }
            return "0x" + numeric.toString(16).toUpperCase();
        }
        const strValue = raw.toString();
        if (strValue.startsWith("0x") || strValue.startsWith("0X")) {
            return "0x" + strValue.slice(2).toUpperCase();
        }
        return "0x" + strValue.toUpperCase();
    }
    normalizeStringValue(menu) {
        const raw = menu.value;
        if (raw === null || raw === undefined) {
            return null;
        }
        return this.expandStringValue(raw.toString());
    }
    normalizeDefaultInt(value) {
        if (value === null || value === undefined || value === "") {
            return null;
        }
        const parsed = typeof value === "number" ? value : parseInt(value.toString(), 10);
        return Number.isNaN(parsed) ? null : parsed;
    }
    normalizeDefaultHex(value) {
        if (value === null || value === undefined || value === "") {
            return null;
        }
        if (typeof value === "string") {
            if (value.startsWith("0x") || value.startsWith("0X")) {
                return value;
            }
        }
        const parsed = typeof value === "number" ? value : parseInt(value.toString(), 16);
        if (Number.isNaN(parsed)) {
            return null;
        }
        return "0x" + parsed.toString(16).toUpperCase();
    }
    normalizeDefaultString(value) {
        if (value === null || value === undefined) {
            return null;
        }
        return this.expandStringValue(value.toString());
    }
    toTristate(value) {
        if (value === true || value === "y" || value === "Y" || value === 2) {
            return "y";
        }
        if (value === "m" || value === "M" || value === 1) {
            return "m";
        }
        return "n";
    }
    escapeString(value) {
        return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    }
    async writeFileIfChanged(filename, content, saveOld) {
        let existing = null;
        try {
            existing = await fs__WEBPACK_IMPORTED_MODULE_0__.promises.readFile(filename, "utf8");
        }
        catch (_) {
            existing = null;
        }
        if (existing === content) {
            return;
        }
        if (saveOld && existing !== null) {
            await this.saveOldFile(filename, existing);
        }
        await fs__WEBPACK_IMPORTED_MODULE_0__.promises.writeFile(filename, content, "utf8");
    }
    async saveOldFile(filename, content) {
        const backupPath = `${filename}.old`;
        try {
            await fs__WEBPACK_IMPORTED_MODULE_0__.promises.writeFile(backupPath, content, "utf8");
        }
        catch (_) {
            // Ignore backup errors to match kconfiglib behavior
        }
    }
}


/***/ },

/***/ "./src/menuconfig/Menu.ts"
/*!********************************!*\
  !*** ./src/menuconfig/Menu.ts ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   menuType: () => (/* binding */ menuType)
/* harmony export */ });
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
var menuType;
(function (menuType) {
    menuType["string"] = "string";
    menuType["bool"] = "bool";
    menuType["tristate"] = "tristate";
    menuType["int"] = "int";
    menuType["choice"] = "choice";
    menuType["hex"] = "hex";
    menuType["menu"] = "menu";
    menuType["comment"] = "comment";
})(menuType || (menuType = {}));


/***/ },

/***/ "./src/menuconfig/MenuNode.ts"
/*!************************************!*\
  !*** ./src/menuconfig/MenuNode.ts ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MenuNode: () => (/* binding */ MenuNode)
/* harmony export */ });
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
/**
 * MenuNode represents a node in the Kconfig tree structure.
 * This is modeled after Kconfiglib's MenuNode class for compatibility.
 */
class MenuNode {
    // Core properties matching Kconfiglib
    item = null; // Associated menu item (config/menuconfig/choice)
    prompt = null; // [prompt text, condition]
    parent = null; // Parent node in the tree
    list = null; // First child node (linked list head)
    next = null; // Next sibling node
    dep = null; // Dependency condition expression (combined from all sources)
    explicit_dep = null; // Explicit "depends on" from config definition (not from if blocks)
    if_dep = null; // Dependency from if blocks (only affects visibility, not menu structure)
    if_indent_level = 0; // Number of if blocks this node was nested in (for indentation)
    // Menu-only: 'visible if' condition
    visibility = null; // Visibility condition for menu nodes (propagated to child prompts)
    // Node metadata
    is_menuconfig = false; // Whether this is a menuconfig node
    node_type = null;
    // Source tracking
    filename = null; // Source file where this node was defined
    linenr = 0; // Line number in source file
    // For tracking next index during parsing (temporary field)
    nextIndex;
    constructor() {
        // Initialize with null values, matching Kconfiglib's approach
    }
    /**
     * Add a child node to this node.
     * Maintains the linked list structure of children.
     */
    addChild(child) {
        child.parent = this;
        if (!this.list) {
            // First child
            this.list = child;
        }
        else {
            // Find the last child and append
            let last = this.list;
            while (last.next) {
                last = last.next;
            }
            last.next = child;
        }
    }
    /**
     * Get all children as an array.
     * Converts the linked list to an array for easier manipulation.
     */
    getChildren() {
        const children = [];
        let child = this.list;
        while (child) {
            children.push(child);
            child = child.next;
        }
        return children;
    }
    /**
     * Calculate indentation level dynamically by traversing parent chain.
     * This matches Kconfiglib's dynamic indentation calculation.
     *
     * Key rules:
     * - Start from this node and traverse up the parent chain
     * - Stop when reaching the root
     * - Count nodes that create visual hierarchy (menu, menuconfig, implicit submenus)
     * - Add extra indentation for if blocks (stored in if_indent_level)
     * - Implicit submenus are config nodes with children
     */
    calculateIndent() {
        let indent = 0;
        let parent = this.parent;
        // Traverse up the parent chain to calculate full indentation
        while (parent) {
            // Skip the root menuconfig node (mainmenu) - it doesn't contribute to indent
            if (parent.node_type === 'menuconfig' && !parent.parent) {
                parent = parent.parent;
                continue;
            }
            // Count nodes that contribute to visual hierarchy:
            // - menu nodes create one level of indentation
            // - menuconfig nodes create one level of indentation
            // - config/choice nodes with children (implicit submenus) create one level
            // Note: if nodes should already be flattened and removed at this point
            if (parent.node_type === 'menu' ||
                parent.node_type === 'menuconfig' ||
                parent.is_menuconfig ||
                parent.node_type === 'choice' ||
                (parent.node_type === 'config' && parent.list !== null)) {
                indent++;
            }
            parent = parent.parent;
        }
        // 与 Kconfiglib 一致：if 层级不产生缩进，仅作为依赖传播
        return indent;
    }
    /**
     * Check if this node should be flattened.
     * Nodes without prompts (like if nodes) should be flattened,
     * UNLESS they are selected by other configs (implicit containers).
     */
    shouldFlatten() {
        // Flatten nodes that:
        // 1. Have children (list is not null)
        // 2. Have no prompt (not visible in menu)
        // 3. Are not Choice nodes (special case in Kconfiglib)
        // 4. Are not implicit containers (configs selected by others that need to maintain structure)
        // Check if this is an implicit container (selected config without prompt)
        const isImplicitContainer = this.item &&
            this.item.isImplicitContainer === true;
        return this.list !== null &&
            this.prompt === null &&
            this.node_type !== 'choice' &&
            !isImplicitContainer;
    }
    /**
     * Check if this is an if node.
     * if nodes are recognized by having no item and node_type === 'if'.
     */
    isIfNode() {
        return this.item === null && this.node_type === 'if';
    }
    /**
     * Clone this node (shallow copy).
     * Used during tree transformations.
     */
    clone() {
        const cloned = new MenuNode();
        cloned.item = this.item;
        cloned.prompt = this.prompt;
        cloned.dep = this.dep;
        cloned.is_menuconfig = this.is_menuconfig;
        cloned.node_type = this.node_type;
        cloned.filename = this.filename;
        cloned.linenr = this.linenr;
        // Note: parent, list, next are not cloned (tree structure needs to be rebuilt)
        return cloned;
    }
    /**
     * Debug helper: Get a string representation of this node.
     */
    toString() {
        if (this.item) {
            return `MenuNode(${this.node_type}: ${this.item.name || this.item.title})`;
        }
        else if (this.node_type === 'if') {
            return `MenuNode(if: ${this.dep})`;
        }
        else {
            return `MenuNode(${this.node_type})`;
        }
    }
    /**
     * Debug helper: Print the tree structure.
     */
    printTree(indent = 0) {
        const _prefix = '  '.repeat(indent);
        // Logger.debugParser(`${prefix}${this.toString()}`);
        let child = this.list;
        while (child) {
            child.printTree(indent + 1);
            child = child.next;
        }
    }
}


/***/ },

/***/ "./src/menuconfig/MenuTransferSerializer.ts"
/*!**************************************************!*\
  !*** ./src/menuconfig/MenuTransferSerializer.ts ***!
  \**************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createInitialTransferMenus: () => (/* binding */ createInitialTransferMenus),
/* harmony export */   createMenuDetailPayload: () => (/* binding */ createMenuDetailPayload),
/* harmony export */   groupChunkTasksForBatches: () => (/* binding */ groupChunkTasksForBatches),
/* harmony export */   splitMenusForChunkedTransfer: () => (/* binding */ splitMenusForChunkedTransfer)
/* harmony export */ });
function groupChunkTasksForBatches(tasks, batchSize) {
    if (!Array.isArray(tasks) || tasks.length === 0) {
        return [];
    }
    const normalizedBatchSize = Number.isFinite(batchSize) && batchSize > 0 ? Math.floor(batchSize) : 16;
    const grouped = [];
    for (let i = 0; i < tasks.length; i += normalizedBatchSize) {
        grouped.push(tasks.slice(i, i + normalizedBatchSize));
    }
    return grouped;
}
function toInitialPayload(menu, children = []) {
    return {
        id: menu.id,
        name: menu.name,
        title: menu.title,
        type: menu.type,
        value: menu.value,
        children,
        isVisible: menu.isVisible,
        isCollapsed: menu.isCollapsed,
        isMenuconfig: menu.isMenuconfig,
        hasPrompt: menu.hasPrompt,
        range: menu.range ? [...menu.range] : undefined,
        select: menu.select ? [...menu.select] : undefined,
        selectedBy: menu.selectedBy ? [...menu.selectedBy] : undefined,
        isReadonly: menu.isReadonly,
        readonlyReason: menu.readonlyReason,
        isImplicitContainer: menu.isImplicitContainer,
        isContainerVisible: menu.isContainerVisible,
        allowedTristateValues: menu.allowedTristateValues ? [...menu.allowedTristateValues] : undefined,
        autoSelectedValue: menu.autoSelectedValue,
        autoImpliedValue: menu.autoImpliedValue,
        isMainMenu: menu.isMainMenu,
        indentLevel: menu.indentLevel,
        shouldIndentChildren: menu.shouldIndentChildren,
        help: menu.help,
    };
}
function createInitialTransferMenus(menus) {
    const convert = (menu) => {
        const children = (menu.children || []).map((child) => convert(child));
        return toInitialPayload(menu, children);
    };
    return menus.map((menu) => convert(menu));
}
function createMenuDetailPayload(menu) {
    return {
        help: menu.help,
        prompt: menu.prompt,
        directDepExpr: menu.directDepExpr,
        directDepValue: menu.directDepValue,
        sourceFile: menu.sourceFile,
        sourceFiles: menu.sourceFiles ? [...menu.sourceFiles] : undefined,
        linenr: menu.linenr,
        menuPath: menu.menuPath,
        dependsOn: menu.dependsOn,
        defaults: menu.defaults ? menu.defaults.map((entry) => ({ ...entry })) : undefined,
        selectInfo: menu.selectInfo,
        selectedByInfo: menu.selectedByInfo,
        implyInfo: menu.implyInfo,
    };
}
function splitMenusForChunkedTransfer(sourceMenus, chunkSize) {
    const normalizedChunkSize = Number.isFinite(chunkSize) && chunkSize > 0 ? Math.floor(chunkSize) : 20;
    const chunks = [];
    const skeletonMenus = sourceMenus.map((menu) => toInitialPayload(menu, []));
    const queue = [...sourceMenus];
    while (queue.length > 0) {
        const parentMenu = queue.shift();
        if (!parentMenu || !parentMenu.id) {
            continue;
        }
        const children = parentMenu.children || [];
        if (children.length === 0) {
            continue;
        }
        const shallowChildren = children.map((child) => toInitialPayload(child, []));
        for (let i = 0; i < shallowChildren.length; i += normalizedChunkSize) {
            const chunkChildren = shallowChildren.slice(i, i + normalizedChunkSize);
            if (chunkChildren.length > 0) {
                chunks.push({
                    parentId: parentMenu.id,
                    children: chunkChildren,
                });
            }
        }
        for (const child of children) {
            queue.push(child);
        }
    }
    return { skeletonMenus, chunks };
}


/***/ },

/***/ "./src/menuconfig/MenuconfigPanel.ts"
/*!*******************************************!*\
  !*** ./src/menuconfig/MenuconfigPanel.ts ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MenuconfigPanel: () => (/* binding */ MenuconfigPanel)
/* harmony export */ });
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _Menu__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Menu */ "./src/menuconfig/Menu.ts");
/* harmony import */ var _KconfigServer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./KconfigServer */ "./src/menuconfig/KconfigServer.ts");
/* harmony import */ var _MenuTransferSerializer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./MenuTransferSerializer */ "./src/menuconfig/MenuTransferSerializer.ts");
/* harmony import */ var _unsavedCloseFlow__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./unsavedCloseFlow */ "./src/menuconfig/unsavedCloseFlow.ts");
/* harmony import */ var _logger_logger__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../logger/logger */ "./src/logger/logger.ts");
/* harmony import */ var _i18n__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../i18n */ "./src/i18n/index.ts");
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








class MenuconfigPanel {
    extContext;
    static currentPanel;
    static panelSeq = 0;
    _disposed = false;
    static supportedThemes = ["modern", "default"];
    static initialPayloadChunkSize = 120;
    static initialPayloadTaskBatchSize = 32;
    static startupSlowThresholdMs = 1500;
    static createOrShow(extensionUri, curWorkspaceFolder, context, targetFile) {
        const column = vscode__WEBPACK_IMPORTED_MODULE_1__.window.activeTextEditor
            ? vscode__WEBPACK_IMPORTED_MODULE_1__.window.activeTextEditor.viewColumn
            : undefined;
        // 检查现有面板是否仍然有效
        if (MenuconfigPanel.currentPanel && !MenuconfigPanel.currentPanel.isDisposed()) {
            try {
                MenuconfigPanel.currentPanel.panel.reveal(column);
                return;
            }
            catch (error) {
                // 如果reveal失败，说明面板已经无效，需要清理引用
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.error('Failed to reveal existing panel, creating new one', error);
                MenuconfigPanel.currentPanel = undefined;
            }
        }
        // 创建新面板
        MenuconfigPanel.currentPanel = new MenuconfigPanel(extensionUri, column || vscode__WEBPACK_IMPORTED_MODULE_1__.ViewColumn.One, curWorkspaceFolder, targetFile, context);
    }
    isDisposed() {
        return this._disposed;
    }
    static viewType = "imdeGuiConfig";
    curWorkspaceFolder;
    panel;
    disposables = [];
    kconfigServer = null;
    targetFile;
    kconfigServerReady = false;
    pendingInitValuesRequest = false;
    initialPayloadTransferToken = 0;
    lastInitialValuesSentAt = 0;
    initializationToken = 0;
    panelId;
    panelCreatedAt = Date.now();
    kconfigServerInitDurationMs = 0;
    initialTransferSessionSeq = 0;
    disposeFlowStarted = false;
    constructor(extensionUri, column, curWorkspaceFolder, targetFile, extContext) {
        this.extContext = extContext;
        this.panelId = ++MenuconfigPanel.panelSeq;
        this.curWorkspaceFolder = curWorkspaceFolder;
        this.targetFile = targetFile;
        this.trace(`constructor start target=${targetFile?.fsPath || "(active)"}`);
        const menuconfigPanelTitle = targetFile
            ? `IMDE GUI Config - ${path__WEBPACK_IMPORTED_MODULE_0__.basename(targetFile.fsPath)}`
            : "IMDE GUI Config";
        this.panel = vscode__WEBPACK_IMPORTED_MODULE_1__.window.createWebviewPanel(MenuconfigPanel.viewType, menuconfigPanelTitle, column, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode__WEBPACK_IMPORTED_MODULE_1__.Uri.joinPath(extensionUri, "dist"),
                vscode__WEBPACK_IMPORTED_MODULE_1__.Uri.joinPath(extensionUri, "dist", "views"),
                vscode__WEBPACK_IMPORTED_MODULE_1__.Uri.joinPath(extensionUri, "node_modules", "@vscode", "codicons", "dist"),
            ],
        });
        const scriptPath = this.panel.webview.asWebviewUri(vscode__WEBPACK_IMPORTED_MODULE_1__.Uri.joinPath(extensionUri, "dist", "views", "webview-bundle.js"));
        const themeKey = this.resolveUiTheme();
        const colorThemeKind = this.mapColorThemeKind(vscode__WEBPACK_IMPORTED_MODULE_1__.window.activeColorTheme.kind);
        const savedGuiTheme = this.extContext.workspaceState.get("imde.guiThemeOverride", "");
        this.panel.webview.html = this.createMenuconfigHtml(scriptPath, themeKey, colorThemeKind, savedGuiTheme);
        this.trace("webview html assigned");
        this.registerColorThemeSync();
        const menuconfigViewDict = {
            apply: "Apply",
            discard: "Discard",
            reset: "Reset",
            save: "Save",
        };
        this.panel.webview.postMessage({
            command: "load_dictionary",
            text_dictionary: menuconfigViewDict,
        });
        this.panel.onDidDispose(() => {
            void this.handlePanelDisposed();
        }, null, this.disposables);
        this.panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case "updateValue": {
                    // Handle value update
                    const updatedMenu = JSON.parse(message.updated_value);
                    // Logger.info(`[PANEL] Received updateValue message: ${message.updated_value}`);
                    // Logger.info(`[PANEL] Parsed menu: id=${updatedMenu.id}, name=${updatedMenu.name}, type=${updatedMenu.type}, value=${updatedMenu.value}`);
                    if (this.kconfigServer) {
                        this.kconfigServer.updateValue(updatedMenu);
                        // Logger.info(`[PANEL] updateValue processed and delta events dispatched`);
                    }
                    else {
                        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.error(`[PANEL] KconfigServer not available for updateValue`);
                    }
                    break;
                }
                case "saveChanges":
                    // Logger.info(`[PANEL] Received saveChanges message`);
                    if (this.kconfigServer) {
                        const ans = await vscode__WEBPACK_IMPORTED_MODULE_1__.window.showInformationMessage("Apply changes to .config and reconfigure?", { modal: true }, "Apply");
                        if (ans !== "Apply")
                            break;
                        try {
                            await this.kconfigServer.saveConfig();
                            vscode__WEBPACK_IMPORTED_MODULE_1__.window.setStatusBarMessage(`$(check) ${(0,_i18n__WEBPACK_IMPORTED_MODULE_7__.t)('save.success')}`, 3000);
                            // Sync build system after config change
                            vscode__WEBPACK_IMPORTED_MODULE_1__.commands.executeCommand("imde.configure").then(() => { }, () => vscode__WEBPACK_IMPORTED_MODULE_1__.window.setStatusBarMessage("$(warning) Config saved but configure failed", 5000));
                        }
                        catch (error) {
                            const errorMessage = error instanceof Error ? error.message : String(error);
                            vscode__WEBPACK_IMPORTED_MODULE_1__.window.showErrorMessage(`${(0,_i18n__WEBPACK_IMPORTED_MODULE_7__.t)('save.failed')}: ${errorMessage}`);
                            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.error("Save configuration failed", error);
                        }
                    }
                    else {
                        // Logger.warn(`[PANEL] KconfigServer not available for saveChanges`);
                        vscode__WEBPACK_IMPORTED_MODULE_1__.window.setStatusBarMessage("$(check) Configuration saved!", 3000);
                    }
                    break;
                case "discardChanges":
                    // Logger.info(`[PANEL] Received discardChanges message`);
                    if (this.kconfigServer) {
                        try {
                            await this.kconfigServer.discardChanges();
                            // 使用状态栏消息，3秒后自动关闭
                            vscode__WEBPACK_IMPORTED_MODULE_1__.window.setStatusBarMessage(`$(discard) ${(0,_i18n__WEBPACK_IMPORTED_MODULE_7__.t)('discard.success')}`, 3000);
                        }
                        catch (error) {
                            const errorMessage = error instanceof Error ? error.message : String(error);
                            vscode__WEBPACK_IMPORTED_MODULE_1__.window.showErrorMessage(`${(0,_i18n__WEBPACK_IMPORTED_MODULE_7__.t)('discard.failed')}: ${errorMessage}`);
                            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.error("Discard changes failed", error);
                        }
                    }
                    else {
                        // Logger.warn(`[PANEL] KconfigServer not available for discardChanges`);
                        vscode__WEBPACK_IMPORTED_MODULE_1__.window.setStatusBarMessage("$(discard) Changes discarded!", 3000);
                    }
                    break;
                case "requestInitValues": {
                    this.trace(`requestInitValues received ready=${this.kconfigServerReady} hasServer=${!!this.kconfigServer}`);
                    if (!this.kconfigServerReady || !this.kconfigServer) {
                        this.pendingInitValuesRequest = true;
                        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.info("[PANEL] requestInitValues received before KconfigServer is ready; request queued.");
                        break;
                    }
                    this.sendInitialValues();
                    break;
                }
                case "refreshConfig": {
                    this.trace("refreshConfig received");
                    if (!this.kconfigServer) {
                        break;
                    }
                    try {
                        const refreshedMenus = await this.kconfigServer.reloadFromDisk();
                        this.safelySendMenuData("refresh_values", refreshedMenus);
                        vscode__WEBPACK_IMPORTED_MODULE_1__.window.setStatusBarMessage("$(refresh) Configuration refreshed", 2000);
                    }
                    catch (error) {
                        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.error("refreshConfig failed", error);
                        vscode__WEBPACK_IMPORTED_MODULE_1__.window.showErrorMessage("Failed to refresh configuration");
                    }
                    break;
                }
                case "setDefault":
                    if (this.kconfigServer) {
                        await vscode__WEBPACK_IMPORTED_MODULE_1__.window.withProgress({
                            location: vscode__WEBPACK_IMPORTED_MODULE_1__.ProgressLocation.Notification,
                            title: (0,_i18n__WEBPACK_IMPORTED_MODULE_7__.t)('reset.progress.title'),
                            cancellable: false
                        }, async (progress) => {
                            try {
                                progress.report({ increment: 30, message: (0,_i18n__WEBPACK_IMPORTED_MODULE_7__.t)('reset.progress.clearing') });
                                await this.kconfigServer.resetToDefaults();
                                progress.report({ increment: 60, message: (0,_i18n__WEBPACK_IMPORTED_MODULE_7__.t)('reset.progress.loading') });
                                const resetMenus = this.kconfigServer.getMenus();
                                this.safelySendMenuData("refresh_values", resetMenus);
                                progress.report({ increment: 100, message: (0,_i18n__WEBPACK_IMPORTED_MODULE_7__.t)('reset.progress.complete') });
                                // 使用状态栏消息，3秒后自动关闭
                                vscode__WEBPACK_IMPORTED_MODULE_1__.window.setStatusBarMessage(`$(refresh) ${(0,_i18n__WEBPACK_IMPORTED_MODULE_7__.t)('reset.success')}`, 3000);
                            }
                            catch (error) {
                                const errorMessage = error instanceof Error ? error.message : String(error);
                                vscode__WEBPACK_IMPORTED_MODULE_1__.window.showErrorMessage(`${(0,_i18n__WEBPACK_IMPORTED_MODULE_7__.t)('reset.failed')}: ${errorMessage}`);
                                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.error("Reset to defaults failed", error);
                            }
                        });
                    }
                    break;
                case "requestMenuDetail": {
                    if (!this.kconfigServer) {
                        break;
                    }
                    const requestedId = typeof message.id === "string" ? message.id : "";
                    if (!requestedId) {
                        break;
                    }
                    try {
                        const detail = this.kconfigServer.getMenuDetailById(requestedId);
                        this.panel.webview.postMessage({
                            command: "menu_detail",
                            id: requestedId,
                            detail,
                        });
                    }
                    catch (error) {
                        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.error("Failed to send menu detail", error);
                    }
                    break;
                }
                case "saveDefconfig": {
                    if (!this.kconfigServer)
                        break;
                    const input = await vscode__WEBPACK_IMPORTED_MODULE_1__.window.showInputBox({
                        prompt: "Save defconfig as...",
                        placeHolder: "config/g32s10/g32s10_v1_defconfig",
                        validateInput: (v) => v.trim() ? undefined : "Path is required",
                    });
                    if (input) {
                        const filepath = path__WEBPACK_IMPORTED_MODULE_0__.join(this.curWorkspaceFolder.fsPath, input.trim());
                        try {
                            const configContent = await this.kconfigServer.exportConfigText();
                            await (__webpack_require__(/*! fs */ "fs").promises).mkdir((__webpack_require__(/*! path */ "path").dirname)(filepath), { recursive: true });
                            await (__webpack_require__(/*! fs */ "fs").promises).writeFile(filepath, configContent, "utf8");
                            vscode__WEBPACK_IMPORTED_MODULE_1__.window.showInformationMessage("Config saved: " + input.trim());
                        }
                        catch (error) {
                            const errorMessage = error instanceof Error ? error.message : String(error);
                            vscode__WEBPACK_IMPORTED_MODULE_1__.window.showErrorMessage("Save failed: " + errorMessage);
                            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.error("Save defconfig failed", error);
                        }
                    }
                    break;
                }
                default:
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.error("Unrecognized command");
                    break;
            }
        });
        // Initialize KconfigServer if Kconfig file exists
        this.initializeKconfigServer();
    }
    dispose() {
        if (this._disposed) {
            return;
        }
        this.trace("dispose requested");
        try {
            this.panel.dispose();
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.error("Error disposing panel", error);
            this.disposeInternal(true);
        }
    }
    async handlePanelDisposed() {
        if (this.disposeFlowStarted) {
            return;
        }
        this.disposeFlowStarted = true;
        this.trace("onDidDispose fired");
        try {
            await (0,_unsavedCloseFlow__WEBPACK_IMPORTED_MODULE_5__.runUnsavedCloseFlow)({
                hasUnsavedChanges: this.kconfigServer?.hasUnsavedChanges() ?? false,
                saveConfig: async () => {
                    if (!this.kconfigServer) {
                        return;
                    }
                    await this.kconfigServer.saveConfig();
                },
                showWarningMessage: async (message, options, ...items) => vscode__WEBPACK_IMPORTED_MODULE_1__.window.showWarningMessage(message, options, ...items),
                showErrorMessage: (message) => {
                    vscode__WEBPACK_IMPORTED_MODULE_1__.window.showErrorMessage(message);
                },
                setStatusBarMessage: (message, hideAfterTimeout) => {
                    if (typeof hideAfterTimeout === "number") {
                        vscode__WEBPACK_IMPORTED_MODULE_1__.window.setStatusBarMessage(message, hideAfterTimeout);
                        return;
                    }
                    vscode__WEBPACK_IMPORTED_MODULE_1__.window.setStatusBarMessage(message);
                },
                text: {
                    unsavedMessage: (0,_i18n__WEBPACK_IMPORTED_MODULE_7__.t)("close.unsavedMessage"),
                    saveButton: (0,_i18n__WEBPACK_IMPORTED_MODULE_7__.t)("close.saveButton"),
                    noSaveButton: (0,_i18n__WEBPACK_IMPORTED_MODULE_7__.t)("close.noSaveButton"),
                    saveSuccess: (0,_i18n__WEBPACK_IMPORTED_MODULE_7__.t)("close.saveSuccess"),
                    saveFailed: (0,_i18n__WEBPACK_IMPORTED_MODULE_7__.t)("close.saveFailed"),
                },
            });
        }
        finally {
            this.disposeInternal(false);
        }
    }
    disposeInternal(disposePanel) {
        if (this._disposed) {
            return;
        }
        this.trace(`disposeInternal disposePanel=${disposePanel}`);
        this._disposed = true;
        this.initializationToken += 1;
        this.initialPayloadTransferToken += 1;
        MenuconfigPanel.currentPanel = undefined;
        if (this.kconfigServer) {
            this.kconfigServer.dispose();
            this.kconfigServer = null;
        }
        if (disposePanel) {
            try {
                this.panel.dispose();
            }
            catch (error) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.error('Error disposing panel', error);
            }
        }
        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                try {
                    disposable.dispose();
                }
                catch (error) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.error('Error disposing disposable', error);
                }
            }
        }
    }
    getExtensionPath() {
        // Get extension path from webview URI
        const scriptUri = this.panel.webview.asWebviewUri(vscode__WEBPACK_IMPORTED_MODULE_1__.Uri.file(path__WEBPACK_IMPORTED_MODULE_0__.join("dummy"))).toString();
        const match = scriptUri.match(/^.*\/([a-z0-9-]+)\/dummy$/);
        if (match) {
            return path__WEBPACK_IMPORTED_MODULE_0__.dirname(path__WEBPACK_IMPORTED_MODULE_0__.dirname(scriptUri.replace(/^.*\/\//, "")));
        }
        return "";
    }
    async initializeKconfigServer() {
        const initToken = ++this.initializationToken;
        const initStartedAt = Date.now();
        try {
            this.trace("initializeKconfigServer start");
            let kconfigFile;
            // If a specific target file was provided, use it
            if (this.targetFile) {
                kconfigFile = this.targetFile.fsPath;
            }
            else {
                // Look for Kconfig file in workspace
                const kconfigPath = path__WEBPACK_IMPORTED_MODULE_0__.join(this.curWorkspaceFolder.fsPath, "Kconfig");
                const kconfigAltPath = path__WEBPACK_IMPORTED_MODULE_0__.join(this.curWorkspaceFolder.fsPath, "imde.guiConfig");
                if ((__webpack_require__(/*! fs */ "fs").existsSync)(kconfigPath)) {
                    kconfigFile = kconfigPath;
                }
                else if ((__webpack_require__(/*! fs */ "fs").existsSync)(kconfigAltPath)) {
                    kconfigFile = kconfigAltPath;
                }
            }
            if (kconfigFile && (__webpack_require__(/*! fs */ "fs").existsSync)(kconfigFile)) {
                this.trace(`initializeKconfigServer init target=${kconfigFile}`);
                const server = await _KconfigServer__WEBPACK_IMPORTED_MODULE_3__.KconfigServer.init({
                    workspaceFolder: this.curWorkspaceFolder,
                    kconfigFile: kconfigFile,
                });
                if (this._disposed || initToken !== this.initializationToken) {
                    this.trace(`initializeKconfigServer stale result dropped token=${initToken}`);
                    server.dispose();
                    return;
                }
                this.kconfigServer = server;
                this.kconfigServerInitDurationMs = Date.now() - initStartedAt;
                this.trace("initializeKconfigServer init done");
                // configSaved event is now handled in the saveChanges message handler
                // No need to show duplicate notification here
                this.kconfigServer.on("configReset", (menus) => { this.safelySendMenuData("refresh_values", menus); });
                this.kconfigServer.on("changesDiscarded", (menus) => {
                    // Logger.info(`[PANEL] Received changesDiscarded event, sending ${menus.length} menus to UI`);
                    // Log a few sample menu values for debugging
                    for (let i = 0; i < Math.min(menus.length, 5); i++) {
                        const menu = menus[i];
                        if (menu.name) {
                            // Logger.info(`[PANEL] Menu sample ${i}: ${menu.name} (${menu.type}) = ${menu.value}`);
                        }
                    }
                    this.safelySendMenuData("refresh_values", menus);
                    // Notification is already shown in the discardChanges message handler
                });
                // Listen to visibility changes
                this.kconfigServer.on("visibilityChanged", (changes) => {
                    if (!changes || changes.length === 0) {
                        return;
                    }
                    this.sendVisibilityDelta(changes);
                });
                this.kconfigServerReady = true;
                this.trace(`kconfigServer ready pendingInit=${this.pendingInitValuesRequest}`);
                if (this.pendingInitValuesRequest) {
                    this.pendingInitValuesRequest = false;
                    this.sendInitialValues();
                }
            }
        }
        catch (error) {
            this.kconfigServerInitDurationMs = Date.now() - initStartedAt;
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.trace(`initializeKconfigServer failed: ${errorMsg}`);
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.error("Failed to initialize KconfigServer", error);
            this.panel.webview.postMessage({
                command: "load_initial_values_error",
                error: errorMsg,
            });
        }
    }
    sendInitialValues() {
        if (this._disposed || !this.kconfigServer) {
            this.trace("sendInitialValues skipped no server");
            return;
        }
        const now = Date.now();
        if (now - this.lastInitialValuesSentAt < 250) {
            this.trace("sendInitialValues throttled");
            return;
        }
        this.lastInitialValuesSentAt = now;
        this.trace("sendInitialValues dispatch");
        const getMenusStartedAt = Date.now();
        const loadedMenus = this.kconfigServer.getMenus();
        const getMenusDurationMs = Date.now() - getMenusStartedAt;
        this.setDefaultCollapsedState(loadedMenus);
        const debugConfigSection = vscode__WEBPACK_IMPORTED_MODULE_1__.workspace.getConfiguration('imde.guiConfig.debug');
        const debugConfig = {
            enabled: debugConfigSection.get('enabled', false),
            menu: debugConfigSection.get('menu', false),
            startup: debugConfigSection.get('startup', false),
            startupSlowThresholdMs: debugConfigSection.get('startupSlowThresholdMs', MenuconfigPanel.startupSlowThresholdMs)
        };
        this.safelySendMenuData("load_initial_values", loadedMenus, {
            debugConfig,
            startupMetrics: {
                sessionId: ++this.initialTransferSessionSeq,
                panelAgeMs: Date.now() - this.panelCreatedAt,
                serverInitMs: this.kconfigServerInitDurationMs,
                getMenusMs: getMenusDurationMs,
            },
        });
    }
    setDefaultCollapsedState(menus) {
        const setDefault = (menuList) => {
            menuList.forEach(menu => {
                if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_2__.menuType.menu) {
                    menu.isCollapsed = true;
                }
                if (menu.children && menu.children.length > 0) {
                    setDefault(menu.children);
                }
            });
        };
        setDefault(menus);
    }
    /**
     * Safely send menu data to webview with error handling and optimization
     */
    safelySendMenuData(command, menus, additionalData = {}) {
        if (this._disposed) {
            this.trace(`safelySendMenuData skipped disposed command=${command}`);
            return;
        }
        this.trace(`safelySendMenuData command=${command} menus=${menus?.length || 0}`);
        if (menus.length > 0 && command === "load_initial_values") {
        }
        try {
            if (command === "load_initial_values") {
                const serializeStartedAt = Date.now();
                const { skeletonMenus, chunks } = (0,_MenuTransferSerializer__WEBPACK_IMPORTED_MODULE_4__.splitMenusForChunkedTransfer)(menus, MenuconfigPanel.initialPayloadChunkSize);
                const serializeMs = Date.now() - serializeStartedAt;
                const chunkBatches = (0,_MenuTransferSerializer__WEBPACK_IMPORTED_MODULE_4__.groupChunkTasksForBatches)(chunks, MenuconfigPanel.initialPayloadTaskBatchSize);
                const startupMetrics = (additionalData?.startupMetrics || {});
                const startupMeta = {
                    sessionId: typeof startupMetrics.sessionId === "number" ? startupMetrics.sessionId : ++this.initialTransferSessionSeq,
                    panelAgeMs: typeof startupMetrics.panelAgeMs === "number" ? startupMetrics.panelAgeMs : Date.now() - this.panelCreatedAt,
                    serverInitMs: typeof startupMetrics.serverInitMs === "number" ? startupMetrics.serverInitMs : this.kconfigServerInitDurationMs,
                    getMenusMs: typeof startupMetrics.getMenusMs === "number" ? startupMetrics.getMenusMs : 0,
                    serializeMs,
                    totalChunks: chunks.length,
                    totalTaskBatches: chunkBatches.length,
                };
                const restAdditionalData = { ...(additionalData || {}) };
                delete restAdditionalData.startupMetrics;
                const transferToken = ++this.initialPayloadTransferToken;
                this.trace(`initial payload begin token=${transferToken} roots=${skeletonMenus.length} chunks=${chunks.length} taskBatches=${chunkBatches.length}`);
                this.panel.webview.postMessage({
                    command: "load_initial_values_begin",
                    menus: skeletonMenus,
                    meta: {
                        totalChunks: chunks.length,
                        chunkSize: MenuconfigPanel.initialPayloadChunkSize,
                        totalTaskBatches: chunkBatches.length,
                        taskBatchSize: MenuconfigPanel.initialPayloadTaskBatchSize,
                        startup: startupMeta,
                    },
                    ...restAdditionalData
                });
                const transferStartedAt = Date.now();
                this.streamInitialPayloadChunks(chunkBatches, transferToken, 0, 0, chunks.length, startupMeta, transferStartedAt);
                return;
            }
            const messageData = {
                command,
                menus,
                ...additionalData
            };
            this.panel.webview.postMessage(messageData);
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.error(`Failed to send ${command} data to webview`, error);
            vscode__WEBPACK_IMPORTED_MODULE_1__.window.showErrorMessage(`Failed to update configuration display. ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    streamInitialPayloadChunks(chunkBatches, transferToken, batchIndex, sentChunkCount, totalChunks, startupMeta, transferStartedAt) {
        if (this._disposed || transferToken !== this.initialPayloadTransferToken) {
            this.trace(`streamInitialPayloadChunks cancelled token=${transferToken} current=${this.initialPayloadTransferToken} disposed=${this._disposed}`);
            return;
        }
        if (batchIndex >= chunkBatches.length) {
            this.trace(`initial payload end token=${transferToken} chunks=${totalChunks}`);
            this.panel.webview.postMessage({
                command: "load_initial_values_end",
                totalChunks,
                startup: {
                    sessionId: startupMeta.sessionId,
                    streamMs: Date.now() - transferStartedAt,
                    panelToEndMs: Date.now() - this.panelCreatedAt,
                },
            });
            return;
        }
        const currentBatch = chunkBatches[batchIndex];
        const chunkPayload = currentBatch.map((chunk, localIndex) => ({
            parentId: chunk.parentId,
            menus: chunk.children,
            chunkIndex: sentChunkCount + localIndex + 1,
            totalChunks,
        }));
        this.panel.webview.postMessage({
            command: "load_initial_values_batch",
            chunks: chunkPayload,
            batchIndex: batchIndex + 1,
            totalBatches: chunkBatches.length,
        });
        if (batchIndex + 1 < chunkBatches.length) {
            setTimeout(() => {
                this.streamInitialPayloadChunks(chunkBatches, transferToken, batchIndex + 1, sentChunkCount + currentBatch.length, totalChunks, startupMeta, transferStartedAt);
            }, 0);
            return;
        }
        this.trace(`initial payload end token=${transferToken} chunks=${totalChunks}`);
        this.panel.webview.postMessage({
            command: "load_initial_values_end",
            totalChunks,
            startup: {
                sessionId: startupMeta.sessionId,
                streamMs: Date.now() - transferStartedAt,
                panelToEndMs: Date.now() - this.panelCreatedAt,
            },
        });
    }
    trace(message) {
        _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.debug(() => `[PANEL:${this.panelId}] ${message}`);
    }
    sendVisibilityDelta(changes) {
        if (this._disposed) {
            this.trace("sendVisibilityDelta skipped disposed");
            return;
        }
        try {
            this.panel.webview.postMessage({
                command: "visibility_delta",
                changes
            });
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.error("Failed to send visibility delta", error);
        }
    }
    resolveUiTheme() {
        const configured = vscode__WEBPACK_IMPORTED_MODULE_1__.workspace
            .getConfiguration("imde.guiConfig")
            .get("uiTheme", MenuconfigPanel.supportedThemes[0]);
        if (configured && MenuconfigPanel.supportedThemes.includes(configured)) {
            return configured;
        }
        return MenuconfigPanel.supportedThemes[0];
    }
    mapColorThemeKind(kind) {
        switch (kind) {
            case vscode__WEBPACK_IMPORTED_MODULE_1__.ColorThemeKind.Light:
            case vscode__WEBPACK_IMPORTED_MODULE_1__.ColorThemeKind.HighContrastLight:
                return "light";
            case vscode__WEBPACK_IMPORTED_MODULE_1__.ColorThemeKind.Dark:
            case vscode__WEBPACK_IMPORTED_MODULE_1__.ColorThemeKind.HighContrast:
            default:
                return "dark";
        }
    }
    registerColorThemeSync() {
        const disposable = vscode__WEBPACK_IMPORTED_MODULE_1__.window.onDidChangeActiveColorTheme((theme) => {
            const mapped = this.mapColorThemeKind(theme.kind);
            try {
                this.panel.webview.postMessage({
                    command: "color_theme_changed",
                    themeKind: mapped,
                });
            }
            catch (error) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_6__.Logger.error("Failed to notify webview about color theme change", error);
            }
        });
        this.disposables.push(disposable);
    }
    createMenuconfigHtml(scriptPath, themeKey, colorThemeKind, savedGuiTheme) {
        const nonce = this.getNonce();
        const sanitizedTheme = themeKey.replace(/"/g, "&quot;");
        const sanitizedColorKind = colorThemeKind.replace(/"/g, "&quot;");
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${this.panel.webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' 'unsafe-eval'; font-src ${this.panel.webview.cspSource}; img-src ${this.panel.webview.cspSource} https: data:; connect-src ${this.panel.webview.cspSource};">
            <title>IMDE GUI Config</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100vh;
                overflow: hidden;
              }
              #menuconfig {
                width: 100%;
                height: 100%;
              }
            </style>
            </head>
            <body>
              <div id="menuconfig">Loading...</div>
              <script nonce="${nonce}">window.__KCONFIG_THEME__ = "${sanitizedTheme}";window.__KCONFIG_VSCODE_COLOR_THEME__ = "${sanitizedColorKind}";</script>
              <script nonce="${nonce}" src="${scriptPath}"></script>
            </body>
        </html>`;
    }
    getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}


/***/ },

/***/ "./src/menuconfig/VisibilityManager.ts"
/*!*********************************************!*\
  !*** ./src/menuconfig/VisibilityManager.ts ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VisibilityManager: () => (/* binding */ VisibilityManager)
/* harmony export */ });
/* harmony import */ var _Menu__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Menu */ "./src/menuconfig/Menu.ts");
/* harmony import */ var _ConditionEvaluator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ConditionEvaluator */ "./src/menuconfig/ConditionEvaluator.ts");
/* harmony import */ var _logger_logger__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../logger/logger */ "./src/logger/logger.ts");
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



/**
 * Manages dynamic visibility of menu items based on condition evaluation
 */
class VisibilityManager {
    evaluator;
    dependencies = new Map();
    configValues = {};
    allMenus = [];
    menuById = new Map();
    menuParentByChildId = new Map();
    menuByName = new Map();
    menusByName = new Map();
    modulesSymbolName = null;
    dependencyClampCache = new Map();
    lastAffectedMenuIds = new Set();
    constructor() {
        this.evaluator = new _ConditionEvaluator__WEBPACK_IMPORTED_MODULE_1__.ConditionEvaluator();
    }
    tristateOrder = ['n', 'm', 'y'];
    /**
     * Initialize the visibility manager with menu data
     */
    initialize(menus) {
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`Initializing with ${menus.length} menus`);
        this.allMenus = menus;
        this.rebuildIndexes(menus);
        this.modulesSymbolName = this.detectModulesSymbolName(menus);
        this.buildDependencyGraph(menus);
        this.extractConfigValues(menus);
        this.dependencyClampCache.clear();
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`Config values before context update:`);
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`  BSP_USING_UART: ${this.configValues['BSP_USING_UART']}`);
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`  BSP_USING_UART0: ${this.configValues['BSP_USING_UART0']}`);
        this.evaluator.updateContext(this.configValues);
        // 在可见性计算前，先应用 config 的默认值（含条件）与 choice 的默认值
        // 这样可保证诸如 “default y if RT_USING_SMART” 按语义生效
        this.applyConfigDefaults();
        const choiceChanges = new Set();
        this.applyChoiceDefaults(choiceChanges);
        if (choiceChanges.size > 0) {
            choiceChanges.forEach((itemId) => {
                this.propagateDefaultsFrom(itemId);
            });
        }
        // 依赖约束会限制符号的最大取值，需在处理 select 之前先行收敛
        this.enforceDependencyBounds();
        // Process initial select statements for enabled configs
        this.processInitialSelectStatements();
        // Apply imply constraints based on current selections
        this.applyImplyConstraints();
        // Sync allowed tristate ranges with latest state
        this.updateTristateAllowedValues();
        // select 可能修改符号状态，需再次根据依赖进行收敛
        this.enforceDependencyBounds();
        this.updateAllVisibility();
        this.lastAffectedMenuIds = this.collectAllMenuIds();
        // Update readonly states after initialization
        this.updateReadonlyStates();
        // 特例调试：初始化后输出 FDT 相关状态
        const _fdt = this.findMenuByName('RT_USING_FDT');
        const _fdtlib = this.findMenuByName('RT_USING_FDTLIB');
        if (_fdt || _fdtlib) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(() => `[FDT_DEBUG] Initialize: RT_USING_FDT=${_fdt ? _fdt.value : 'N/A'}, RT_USING_FDTLIB=${_fdtlib ? _fdtlib.value : 'N/A'}`);
        }
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`Initialization complete:`);
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`  - Dependencies: ${this.dependencies.size}`);
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`  - Config values: ${Object.keys(this.configValues).length}`);
        this.logVisibilityState();
    }
    /**
     * 依赖约束收敛：当直接依赖为假时，将符号的实际值降为禁用状态。
     * 对 bool 设置为 false，对 tristate 设置为 'n'。
     */
    enforceDependencyBounds(changedMenus) {
        const changed = changedMenus ?? new Set();
        const clamp = (menu) => {
            if (menu.name && menu.dependsOn && (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool || menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate)) {
                let depSatisfied = true;
                try {
                    depSatisfied = this.evaluator.evaluate(menu.dependsOn);
                }
                catch (error) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.warn(`Failed to evaluate dependency bound for ${menu.name}: ${menu.dependsOn}. Error: ${error}`);
                    depSatisfied = true;
                }
                const cacheKey = menu.id || menu.name;
                if (!depSatisfied) {
                    if (cacheKey && !this.dependencyClampCache.has(cacheKey)) {
                        this.dependencyClampCache.set(cacheKey, {
                            value: menu.value,
                            isDefaultValue: menu.isDefaultValue,
                            autoSelectedValue: menu.autoSelectedValue,
                        });
                    }
                    if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool) {
                        const forcedValue = false;
                        if (!this.areMenuValuesEqual(menu.value, forcedValue, menu.type)) {
                            menu.value = forcedValue;
                            this.configValues[menu.name] = forcedValue;
                            this.evaluator.setValue(menu.name, forcedValue);
                            this.markMenuAndPeersChanged(menu, changed);
                        }
                        else {
                            this.configValues[menu.name] = forcedValue;
                        }
                    }
                    else if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate) {
                        const forcedValue = 'n';
                        if (!this.areMenuValuesEqual(menu.value, forcedValue, menu.type)) {
                            menu.value = forcedValue;
                            this.configValues[menu.name] = forcedValue;
                            this.evaluator.setValue(menu.name, forcedValue);
                            this.markMenuAndPeersChanged(menu, changed);
                        }
                        else {
                            this.configValues[menu.name] = forcedValue;
                        }
                    }
                }
                else if (cacheKey && this.dependencyClampCache.has(cacheKey)) {
                    const cached = this.dependencyClampCache.get(cacheKey);
                    this.dependencyClampCache.delete(cacheKey);
                    if (cached) {
                        const restoredValue = cached.value;
                        if (!this.areMenuValuesEqual(menu.value, restoredValue, menu.type)) {
                            menu.value = restoredValue;
                            if (menu.name) {
                                this.configValues[menu.name] = restoredValue;
                                this.evaluator.setValue(menu.name, restoredValue);
                                this.markMenuAndPeersChanged(menu, changed);
                            }
                        }
                        else if (menu.name) {
                            this.configValues[menu.name] = restoredValue;
                        }
                        if (cached.isDefaultValue !== undefined) {
                            menu.isDefaultValue = cached.isDefaultValue;
                        }
                        if (cached.autoSelectedValue !== undefined) {
                            menu.autoSelectedValue = cached.autoSelectedValue;
                        }
                        // When deps become satisfied again, re-evaluate defaults
                        // for symbols that actually define defaults.
                        if (menu.defaults && menu.defaults.length > 0) {
                            const defaultReapplied = this.reapplyDefaultsForMenu(menu);
                            if (defaultReapplied) {
                                this.markMenuAndPeersChanged(menu, changed);
                            }
                        }
                    }
                }
            }
            if (menu.children) {
                menu.children.forEach(clamp);
            }
        };
        this.allMenus.forEach(clamp);
        this.evaluator.updateContext(this.configValues);
        return changed;
    }
    /**
     * 应用 choice 默认值：
     * - 按顺序评估 "default X [if COND]" 列表
     * - 选中第一个条件满足的 X；若存在无条件默认值，优先采用
     * - 若无匹配，则回退到第一个子选项
     * - 同步更新被选中子项（bool）的值到 true，其它为 false
     */
    applyChoiceDefaults(changes) {
        const process = (menu) => {
            if (menu.type === 'choice' && menu.children && menu.children.length > 0) {
                // 如果当前值已经是合法的子项名称，保证子项布尔值与之同步即可
                const childNames = new Set(menu.children.map(c => c.name));
                let selectedName = null;
                let selectionSource = null;
                // 优先：从已有子项布尔值为 true 的项反推 choice 选择（对齐 Kconfiglib 行为）
                for (const child of menu.children) {
                    if (child.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool && child.value === true && childNames.has(child.name)) {
                        selectedName = child.name;
                        selectionSource = 'child';
                    }
                }
                if (selectedName) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[CHOICE_DEFAULT] 从子项值反推 choice 选择: ${selectedName}`);
                }
                if (!selectedName && menu.value && typeof menu.value === 'string' && childNames.has(menu.value)) {
                    selectedName = menu.value;
                    selectionSource = 'value';
                }
                else if (!selectedName) {
                    // 依据 defaults 列表评估，沿用 Kconfig 语义：首个命中的 default 生效
                    if (menu.defaults && menu.defaults.length > 0) {
                        const effectiveDefault = this.selectEffectiveDefault(menu);
                        if (effectiveDefault && typeof effectiveDefault.value === 'string' && childNames.has(effectiveDefault.value)) {
                            selectedName = effectiveDefault.value;
                            selectionSource = 'default';
                        }
                    }
                    // 若依然没有，则回退到第一个子项
                    if (!selectedName) {
                        selectedName = menu.children[0].name;
                        selectionSource = 'fallback';
                    }
                }
                if (selectedName) {
                    if (menu.value !== selectedName) {
                        menu.value = selectedName;
                        if (changes) {
                            changes.add(menu.id);
                        }
                    }
                    if (selectionSource === 'child') {
                        menu.isDefaultValue = false;
                    }
                    else if (selectionSource === 'default' || selectionSource === 'fallback') {
                        menu.isDefaultValue = true;
                    }
                    else if (selectionSource === 'value') {
                        // 保持现状
                        if (menu.isDefaultValue === undefined) {
                            menu.isDefaultValue = false;
                        }
                    }
                }
                // 同步子项布尔值
                if (selectedName) {
                    for (const child of menu.children) {
                        const isSelected = child.name === selectedName;
                        // 仅在子项为 bool 类型时同步
                        if (child.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool) {
                            if (this.configValues[child.name] !== isSelected || child.value !== isSelected) {
                                this.configValues[child.name] = isSelected;
                                child.value = isSelected;
                                this.evaluator.setValue(child.name, isSelected);
                                if (selectionSource === 'child') {
                                    child.isDefaultValue = false;
                                }
                                else if (selectionSource === 'default' || selectionSource === 'fallback') {
                                    child.isDefaultValue = isSelected;
                                }
                                if (changes) {
                                    changes.add(child.id);
                                }
                            }
                        }
                    }
                }
            }
            if (menu.children) {
                menu.children.forEach(process);
            }
        };
        this.allMenus.forEach(process);
        // 更新上下文（以便后续 select/可见性运算使用最新 choice 选择结果）
        this.evaluator.updateContext(this.configValues);
    }
    /**
     * 解析 default 值并转换为目标类型，同时处理符号引用
     */
    parseDefaultForType(value, type) {
        if (value === undefined || value === null) {
            return value;
        }
        const resolved = this.resolveDefaultReference(value);
        const v = typeof resolved === 'string' ? resolved.trim() : resolved;
        switch (type) {
            case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool:
                if (typeof resolved === 'boolean')
                    return resolved;
                if (typeof resolved === 'number')
                    return resolved !== 0;
                if (typeof v === 'string') {
                    const lower = v.toLowerCase();
                    if (lower === 'y' || lower === 'yes' || lower === 'true' || lower === '1')
                        return true;
                    if (lower === 'n' || lower === 'no' || lower === 'false' || lower === '0')
                        return false;
                }
                return Boolean(resolved);
            case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate:
                if (typeof resolved === 'string') {
                    const lower = resolved.toLowerCase();
                    if (lower === 'y' || lower === 'm' || lower === 'n')
                        return lower;
                    if (lower === 'true')
                        return 'y';
                    if (lower === 'false')
                        return 'n';
                }
                if (typeof resolved === 'boolean') {
                    return resolved ? 'y' : 'n';
                }
                if (typeof resolved === 'number') {
                    if (resolved >= 2)
                        return 'y';
                    if (resolved === 1)
                        return 'm';
                    return 'n';
                }
                return 'n';
            case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.int:
                if (typeof resolved === 'number')
                    return resolved;
                if (typeof v === 'string') {
                    const parsed = parseInt(v, 10);
                    return Number.isNaN(parsed) ? 0 : parsed;
                }
                return 0;
            case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.hex:
                if (typeof v === 'string') {
                    if (v.startsWith('0x') || v.startsWith('0X')) {
                        return v;
                    }
                    const parsed = parseInt(v, 10);
                    return Number.isNaN(parsed) ? '0x0' : `0x${parsed.toString(16)}`;
                }
                if (typeof resolved === 'number') {
                    return `0x${resolved.toString(16)}`;
                }
                return '0x0';
            case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.string:
                if (typeof resolved === 'string') {
                    return resolved.replace(/^"(.*)"$/, '$1');
                }
                if (resolved === null || resolved === undefined) {
                    return '';
                }
                return String(resolved);
            default:
                return resolved;
        }
    }
    /**
     * 解析 default 中的符号引用
     */
    resolveDefaultReference(rawValue) {
        if (typeof rawValue !== 'string') {
            return rawValue;
        }
        const trimmed = rawValue.trim();
        if (/^".*"$/.test(trimmed)) {
            return rawValue;
        }
        if (/^[A-Z][A-Z0-9_]*$/.test(trimmed)) {
            if (Object.prototype.hasOwnProperty.call(this.configValues, trimmed)) {
                return this.configValues[trimmed];
            }
        }
        return rawValue;
    }
    getFallbackValueForType(type) {
        switch (type) {
            case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool:
                return false;
            case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate:
                return 'n';
            case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.int:
                return 0;
            case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.hex:
                return '0x0';
            case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.string:
                return '';
            default:
                return null;
        }
    }
    /**
     * 返回顺序上第一条满足条件的 default 项
     */
    selectEffectiveDefault(menu) {
        if (!menu.defaults || menu.defaults.length === 0) {
            return null;
        }
        for (const def of menu.defaults) {
            let ok = true;
            if (def.condition && def.condition.trim().length > 0) {
                try {
                    ok = this.evaluator.evaluate(def.condition);
                }
                catch (e) {
                    ok = false;
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[DEFAULT_EVAL] 评估失败: ${menu.name} default if "${def.condition}" -> ${e}`);
                }
            }
            if (ok) {
                return def;
            }
        }
        return null;
    }
    areMenuValuesEqual(a, b, type) {
        if (type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.int) {
            return Number(a) === Number(b);
        }
        return a === b;
    }
    /**
     * 应用通用 config 默认值：
     * - 按出现顺序评估 default 列表，命中的第一条立即生效
     * - 记录默认来源，便于后续依赖变动重新计算
     */
    applyConfigDefaults() {
        let updatedCount = 0;
        const process = (menu) => {
            if (!menu.name || menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.menu) {
                if (menu.children) {
                    menu.children.forEach(process);
                }
                return;
            }
            const hasDefaults = !!(menu.defaults && menu.defaults.length > 0);
            const shouldInit = menu.value === undefined || menu.value === null;
            const effectiveDefault = hasDefaults ? this.selectEffectiveDefault(menu) : null;
            const resolvedValue = effectiveDefault
                ? this.parseDefaultForType(effectiveDefault.value, menu.type)
                : this.getFallbackValueForType(menu.type);
            if (shouldInit) {
                menu.value = resolvedValue;
                this.configValues[menu.name] = resolvedValue;
                this.evaluator.setValue(menu.name, resolvedValue);
                menu.isDefaultValue = true;
                updatedCount++;
                if (effectiveDefault) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[DEFAULT_APPLY] ${menu.name} <- ${JSON.stringify(resolvedValue)}${effectiveDefault.condition ? ` (if ${effectiveDefault.condition})` : ''}`);
                }
            }
            else if (menu.isDefaultValue === undefined) {
                menu.isDefaultValue = hasDefaults ? effectiveDefault !== null : false;
            }
            if (menu.children) {
                menu.children.forEach(process);
            }
        };
        this.allMenus.forEach(process);
        if (updatedCount > 0) {
            this.evaluator.updateContext(this.configValues);
        }
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[DEFAULT_APPLY] 已应用 ${updatedCount} 个配置项默认值`);
    }
    /**
     * 根据最新上下文尝试重新应用 default，当值发生变化时返回 true
     */
    reapplyDefaultsForMenu(menu) {
        if (!menu.name || menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.menu) {
            return false;
        }
        if (menu.autoSelectedValue) {
            return false;
        }
        if (menu.isDefaultValue === false) {
            return false;
        }
        const hasDefaults = !!(menu.defaults && menu.defaults.length > 0);
        const effectiveDefault = hasDefaults ? this.selectEffectiveDefault(menu) : null;
        const nextValue = effectiveDefault
            ? this.parseDefaultForType(effectiveDefault.value, menu.type)
            : this.getFallbackValueForType(menu.type);
        if (this.areMenuValuesEqual(menu.value, nextValue, menu.type)) {
            return false;
        }
        const prevValue = menu.value;
        menu.value = nextValue;
        this.configValues[menu.name] = nextValue;
        this.evaluator.setValue(menu.name, nextValue);
        menu.isDefaultValue = true;
        if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool) {
            this.processSelectStatements(menu, nextValue === true);
        }
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[DEFAULT_REAPPLY] ${menu.name}: ${JSON.stringify(prevValue)} -> ${JSON.stringify(nextValue)}${effectiveDefault?.condition ? ` (if ${effectiveDefault.condition})` : ''}`);
        return true;
    }
    propagateDefaultsFrom(configId) {
        const changed = new Set();
        const queue = [configId];
        const visited = new Set();
        let queueIndex = 0;
        while (queueIndex < queue.length) {
            const current = queue[queueIndex++];
            if (visited.has(current)) {
                continue;
            }
            visited.add(current);
            const depInfo = this.dependencies.get(current);
            if (!depInfo) {
                continue;
            }
            for (const dependentId of depInfo.dependents) {
                const dependentMenu = this.findMenuById(dependentId);
                if (!dependentMenu) {
                    continue;
                }
                const changedHere = this.reapplyDefaultsForMenu(dependentMenu);
                if (changedHere) {
                    this.markMenuAndPeersChanged(dependentMenu, changed);
                    queue.push(dependentId);
                }
            }
        }
        return changed;
    }
    /**
     * Update a configuration value and recalculate affected visibility
     */
    updateValue(configId, newValue) {
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`Updating value for ${configId} to ${newValue}`);
        const menu = this.findMenuById(configId);
        const valueChangeSeeds = new Set();
        const needsFullVisibilityRefresh = !configId || !menu;
        // Update the value in context
        let choiceSelectionChanges = new Set();
        if (menu) {
            const _oldValue = this.configValues[menu.name];
            menu.value = newValue;
            this.configValues[menu.name] = newValue;
            this.evaluator.setValue(menu.name, newValue);
            menu.isDefaultValue = false;
            this.markMenuAndPeersChanged(menu, valueChangeSeeds);
            // 如果用户手动修改了值，清除自动选择标记
            // 这样可以确保用户手动设置的值不会被自动取消选择逻辑影响
            if (menu.autoSelectedValue !== undefined) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`Clearing auto-selected flag for ${menu.name} due to user modification`);
                menu.autoSelectedValue = undefined;
                menu.autoSelectedPreviousValue = undefined;
                menu.autoSelectedPreviousWasDefault = undefined;
            }
            if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.choice) {
                choiceSelectionChanges = this.applyChoiceSelection(menu, newValue);
            }
            this.syncSymbolState(menu);
            // Process select statements (must be done before updating readonly states)
            if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool) {
                const isEnabled = newValue === true;
                this.processSelectStatements(menu, isEnabled, valueChangeSeeds);
            }
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`Updated ${menu.name} from ${_oldValue} to ${newValue}`);
            // 特例调试：当切换 RT_USING_FDT 时，打印其子项 RT_USING_FDTLIB 的状态
            if (menu.name === 'RT_USING_FDT') {
                const fdtlib = this.findMenuByName('RT_USING_FDTLIB');
                if (fdtlib) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(() => `[FDT_DEBUG] RT_USING_FDT -> ${newValue}; RT_USING_FDTLIB before visibility update: value=${fdtlib.value}, dependsOn=${fdtlib.dependsOn || 'y'}`);
                }
            }
        }
        const defaultChanges = this.propagateDefaultsFrom(configId);
        defaultChanges.forEach(itemId => valueChangeSeeds.add(itemId));
        choiceSelectionChanges.forEach((itemId) => {
            const choiceDefaultChanges = this.propagateDefaultsFrom(itemId);
            choiceDefaultChanges.forEach(changedId => valueChangeSeeds.add(changedId));
            valueChangeSeeds.add(itemId);
        });
        const choiceChanges = new Set();
        this.applyChoiceDefaults(choiceChanges);
        choiceChanges.forEach((itemId) => {
            const choiceDefaultChanges = this.propagateDefaultsFrom(itemId);
            choiceDefaultChanges.forEach(changedId => valueChangeSeeds.add(changedId));
        });
        choiceChanges.forEach(itemId => valueChangeSeeds.add(itemId));
        this.enforceDependencyBounds(valueChangeSeeds);
        const implyChanges = this.applyImplyConstraints();
        this.enforceDependencyBounds(valueChangeSeeds);
        implyChanges.forEach(itemId => valueChangeSeeds.add(itemId));
        const tristateChanges = this.updateTristateAllowedValues();
        tristateChanges.forEach(itemId => valueChangeSeeds.add(itemId));
        const visibilityTargets = needsFullVisibilityRefresh
            ? this.collectAllMenuIds()
            : this.collectAffectedItemsFromSeeds(valueChangeSeeds);
        // Recalculate visibility for affected items
        for (const itemId of visibilityTargets) {
            this.updateItemVisibility(itemId);
        }
        // Update readonly states (must be done after select processing)
        const readonlyCandidates = needsFullVisibilityRefresh
            ? this.collectAllMenuIds()
            : this.collectReadonlyCandidateIds(visibilityTargets);
        const readonlyChanges = this.updateReadonlyStates(readonlyCandidates);
        readonlyChanges.forEach((itemId) => visibilityTargets.add(itemId));
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`Visibility update completed`);
        this.lastAffectedMenuIds = new Set(visibilityTargets);
        // 特例调试：若涉及 FDT 相关配置，更新后再次输出状态
        const maybeFdt = this.findMenuByName('RT_USING_FDT');
        const maybeFdtLib = this.findMenuByName('RT_USING_FDTLIB');
        if (maybeFdt || maybeFdtLib) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(() => `[FDT_DEBUG] After updateValue(): RT_USING_FDT=${maybeFdt ? maybeFdt.value : 'N/A'}, RT_USING_FDTLIB=${maybeFdtLib ? maybeFdtLib.value : 'N/A'}`);
        }
        return this.allMenus;
    }
    consumeLastAffectedMenuIds() {
        const affected = this.lastAffectedMenuIds;
        this.lastAffectedMenuIds = new Set();
        return affected;
    }
    applyChoiceSelection(menu, newValue) {
        const changed = new Set();
        if (!menu.children || menu.children.length === 0) {
            return changed;
        }
        if (typeof newValue !== "string" || newValue.trim().length === 0) {
            return changed;
        }
        const selectedName = newValue.trim();
        const selectedChild = menu.children.find(child => child.name === selectedName);
        if (!selectedChild) {
            return changed;
        }
        menu.value = selectedName;
        menu.isDefaultValue = false;
        for (const child of menu.children) {
            if (child.type !== _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool && child.type !== _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate) {
                continue;
            }
            const isSelected = child.name === selectedName;
            const nextValue = isSelected;
            if (child.name) {
                const prevValue = child.value;
                if (prevValue !== nextValue || this.configValues[child.name] !== nextValue) {
                    child.value = nextValue;
                    this.configValues[child.name] = nextValue;
                    this.evaluator.setValue(child.name, nextValue);
                    this.markMenuAndPeersChanged(child, changed);
                }
            }
            child.isDefaultValue = false;
            child.autoSelectedValue = undefined;
            child.autoSelectedPreviousValue = undefined;
            child.autoSelectedPreviousWasDefault = undefined;
            this.syncSymbolState(child);
            if (child.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool) {
                this.processSelectStatements(child, isSelected, changed);
            }
        }
        return changed;
    }
    /**
     * Get current configuration context
     */
    getContext() {
        return { ...this.configValues };
    }
    /**
     * Get the condition evaluator instance
     */
    getEvaluator() {
        return this.evaluator;
    }
    /**
     * Build dependency graph from menu structure
     */
    buildDependencyGraph(menus) {
        this.dependencies.clear();
        const processMenu = (menu) => {
            // Register this menu in dependencies，保留已有的依赖者集合
            let depInfo = this.dependencies.get(menu.id);
            if (!depInfo) {
                depInfo = {
                    configId: menu.id,
                    dependsOn: menu.dependsOn || '',
                    dependents: new Set()
                };
                this.dependencies.set(menu.id, depInfo);
            }
            else {
                depInfo.dependsOn = menu.dependsOn || depInfo.dependsOn || '';
            }
            // If this menu has dependencies, register reverse dependencies
            if (menu.dependsOn) {
                const referencedConfigs = this.extractReferencedConfigs(menu.dependsOn);
                for (const refConfig of referencedConfigs) {
                    const referencedMenu = this.findMenuByName(refConfig);
                    if (referencedMenu) {
                        let refDepInfo = this.dependencies.get(referencedMenu.id);
                        if (!refDepInfo) {
                            refDepInfo = {
                                configId: referencedMenu.id,
                                dependsOn: referencedMenu.dependsOn || '',
                                dependents: new Set()
                            };
                            this.dependencies.set(referencedMenu.id, refDepInfo);
                        }
                        refDepInfo.dependents.add(menu.id);
                    }
                }
            }
            if (menu.defaults && menu.defaults.length > 0) {
                for (const def of menu.defaults) {
                    const refs = new Set();
                    if (def.condition && def.condition.trim().length > 0) {
                        this.extractReferencedConfigs(def.condition).forEach(name => refs.add(name));
                    }
                    if (typeof def.value === 'string' && def.value.trim().length > 0) {
                        const raw = def.value.trim().replace(/^"(.*)"$/, '$1');
                        this.extractReferencedConfigs(raw).forEach(name => refs.add(name));
                    }
                    refs.forEach(refConfig => {
                        const referencedMenu = this.findMenuByName(refConfig);
                        if (!referencedMenu) {
                            return;
                        }
                        let refDepInfo = this.dependencies.get(referencedMenu.id);
                        if (!refDepInfo) {
                            refDepInfo = {
                                configId: referencedMenu.id,
                                dependsOn: referencedMenu.dependsOn || '',
                                dependents: new Set()
                            };
                            this.dependencies.set(referencedMenu.id, refDepInfo);
                        }
                        refDepInfo.dependents.add(menu.id);
                    });
                }
            }
            // Process children recursively
            if (menu.children) {
                menu.children.forEach(processMenu);
            }
        };
        menus.forEach(processMenu);
    }
    /**
     * Extract configuration values from menu structure
     */
    extractConfigValues(menus) {
        const extractValues = (menu) => {
            // Extract all configuration values, including false and 0
            if (menu.name && menu.value !== undefined && menu.value !== null) {
                this.configValues[menu.name] = menu.value;
            }
            else if (menu.name && menu.type !== _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.menu) {
                // For config items without explicit values, only set defaults if truly needed
                // DO NOT override values that were set during parsing
                switch (menu.type) {
                    case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool:
                        // Only set default if value is truly not set
                        this.configValues[menu.name] = false; // Default bool to false for context
                        // DO NOT modify menu.value here - it may have been set during parsing
                        break;
                    case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate:
                        this.configValues[menu.name] = 'n';
                        break;
                    case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.int:
                        this.configValues[menu.name] = 0; // Default int to 0 for context
                        // DO NOT modify menu.value here
                        break;
                    case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.string:
                        this.configValues[menu.name] = ""; // Default string to empty for context
                        // DO NOT modify menu.value here
                        break;
                    case _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.hex:
                        this.configValues[menu.name] = "0x0"; // Default hex to 0x0 for context
                        // DO NOT modify menu.value here
                        break;
                    default:
                        this.configValues[menu.name] = null;
                }
            }
            if (menu.children) {
                menu.children.forEach(extractValues);
            }
        };
        menus.forEach(extractValues);
    }
    /**
     * Extract referenced configuration names from a condition expression
     */
    extractReferencedConfigs(expression) {
        const configs = new Set();
        // Match configuration variable names (letters, numbers, underscores)
        const matches = expression.match(/\b[A-Z][A-Z0-9_]*\b/g);
        if (matches) {
            matches.forEach(match => {
                // Filter out keywords and operators
                if (!this.isKeyword(match)) {
                    configs.add(match);
                }
            });
        }
        return Array.from(configs);
    }
    /**
     * Check if a string is a keyword or operator
     */
    isKeyword(str) {
        const keywords = new Set(['TRUE', 'FALSE', 'Y', 'N', 'M']);
        return keywords.has(str.toUpperCase());
    }
    rebuildIndexes(menus) {
        this.menuById.clear();
        this.menuParentByChildId.clear();
        this.menuByName.clear();
        this.menusByName.clear();
        const stack = menus.map((menu) => ({
            menu,
            parentId: null,
        }));
        while (stack.length > 0) {
            const current = stack.pop();
            if (!current || !current.menu) {
                continue;
            }
            const menu = current.menu;
            if (menu.id) {
                this.menuById.set(menu.id, menu);
                this.menuParentByChildId.set(menu.id, current.parentId);
            }
            if (menu.name) {
                if (!this.menuByName.has(menu.name)) {
                    this.menuByName.set(menu.name, menu);
                }
                const group = this.menusByName.get(menu.name) ?? [];
                group.push(menu);
                this.menusByName.set(menu.name, group);
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
    }
    /**
     * Find menu item by ID
     */
    findMenuById(id) {
        if (!id) {
            return null;
        }
        return this.menuById.get(id) ?? null;
    }
    detectModulesSymbolName(menus) {
        let detected = null;
        const traverse = (items) => {
            for (const item of items) {
                if (!item) {
                    continue;
                }
                if (!detected && item.name) {
                    if (item.optionModules) {
                        detected = item.name;
                        return;
                    }
                }
                if (item.children && item.children.length > 0) {
                    traverse(item.children);
                    if (detected) {
                        return;
                    }
                }
            }
        };
        traverse(menus);
        if (!detected) {
            const fallback = this.findMenuByName('MODULES');
            if (fallback && fallback.name) {
                detected = fallback.name;
            }
        }
        if (!detected) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility('[MODULES] No modules symbol detected; module support disabled by default');
        }
        else {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[MODULES] Using modules symbol: ${detected}`);
        }
        return detected;
    }
    /**
     * Find menu item by configuration name
     */
    findMenuByName(name) {
        if (!name) {
            return null;
        }
        return this.menuByName.get(name) ?? null;
    }
    getMenusByName(name) {
        if (!name) {
            return [];
        }
        return this.menusByName.get(name) ?? [];
    }
    mergeSelectedByForName(name) {
        const merged = new Set();
        for (const menu of this.getMenusByName(name)) {
            if (menu.selectedBy) {
                menu.selectedBy.forEach((selector) => merged.add(selector));
            }
        }
        return Array.from(merged);
    }
    syncSymbolState(source) {
        if (!source.name) {
            return;
        }
        const group = this.getMenusByName(source.name);
        if (group.length <= 1) {
            return;
        }
        const selectedBy = this.mergeSelectedByForName(source.name);
        for (const menu of group) {
            if (menu === source) {
                continue;
            }
            menu.value = source.value;
            menu.isDefaultValue = source.isDefaultValue;
            menu.autoSelectedValue = source.autoSelectedValue;
            menu.autoSelectedPreviousValue = source.autoSelectedPreviousValue;
            menu.autoSelectedPreviousWasDefault = source.autoSelectedPreviousWasDefault;
            menu.selectedBy = [...selectedBy];
        }
    }
    normalizeTristateValue(value) {
        if (typeof value === 'string') {
            const lower = value.toLowerCase();
            if (lower === 'y' || lower === 'm' || lower === 'n') {
                return lower;
            }
            if (lower === 'true' || lower === '2') {
                return 'y';
            }
            if (lower === '1') {
                return 'm';
            }
            return 'n';
        }
        if (typeof value === 'number') {
            if (value >= 2) {
                return 'y';
            }
            if (value === 1) {
                return 'm';
            }
            return 'n';
        }
        if (typeof value === 'boolean') {
            return value ? 'y' : 'n';
        }
        return 'n';
    }
    clampTristateValue(allowed, current) {
        const currentIndex = this.tristateOrder.indexOf(current);
        if (currentIndex === -1) {
            return allowed[0];
        }
        for (let i = currentIndex; i < this.tristateOrder.length; i++) {
            const candidate = this.tristateOrder[i];
            if (allowed.includes(candidate)) {
                return candidate;
            }
        }
        for (let i = currentIndex - 1; i >= 0; i--) {
            const candidate = this.tristateOrder[i];
            if (allowed.includes(candidate)) {
                return candidate;
            }
        }
        return allowed[0];
    }
    getMenuTriStrength(menu) {
        if (!menu) {
            return 0;
        }
        const value = menu.value;
        if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool) {
            if (value === true || value === 'y' || value === 2) {
                return 2;
            }
            return 0;
        }
        if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate) {
            if (value === 'y' || value === true || value === 2) {
                return 2;
            }
            if (value === 'm' || value === 1) {
                return 1;
            }
            return 0;
        }
        return 0;
    }
    setMenuStrength(menu, strength) {
        if (!menu || !menu.name) {
            return;
        }
        if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool) {
            const nextValue = strength > 0;
            if (menu.value !== nextValue) {
                menu.value = nextValue;
                this.configValues[menu.name] = nextValue;
                this.evaluator.setValue(menu.name, nextValue);
            }
            menu.autoImpliedValue = nextValue;
            return;
        }
        if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate) {
            const nextValue = strength >= 2 ? 'y' : strength === 1 ? 'm' : 'n';
            if (menu.value !== nextValue) {
                menu.value = nextValue;
                this.configValues[menu.name] = nextValue;
                this.evaluator.setValue(menu.name, nextValue);
            }
            if (strength > 0) {
                menu.autoImpliedValue = nextValue;
            }
            return;
        }
    }
    applyImplyConstraints() {
        const impliedStrength = new Map();
        const impliedTargets = new Set();
        const changedMenus = new Set();
        const traverse = (menu) => {
            if (menu.implies && menu.implies.length > 0) {
                const sourceStrength = this.getMenuTriStrength(menu);
                if (sourceStrength > 0) {
                    for (const targetName of menu.implies) {
                        const condition = menu.implyConditions?.[targetName];
                        if (condition && !this.safeEval(condition)) {
                            continue;
                        }
                        let effectiveStrength = sourceStrength;
                        if (menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool && effectiveStrength > 0) {
                            effectiveStrength = 2;
                        }
                        const existing = impliedStrength.get(targetName) ?? 0;
                        const nextStrength = Math.max(existing, effectiveStrength);
                        impliedStrength.set(targetName, nextStrength);
                        impliedTargets.add(targetName);
                    }
                }
            }
            if (menu.children) {
                menu.children.forEach(traverse);
            }
        };
        this.allMenus.forEach(traverse);
        impliedStrength.forEach((strength, targetName) => {
            const targetMenu = this.findMenuByName(targetName);
            if (!targetMenu) {
                return;
            }
            const currentStrength = this.getMenuTriStrength(targetMenu);
            if (strength > currentStrength) {
                this.setMenuStrength(targetMenu, strength);
                if (targetMenu.id) {
                    changedMenus.add(targetMenu.id);
                }
            }
        });
        // Clear auto implied marker for items no longer implied in this pass
        const clearMarker = (menu) => {
            if (menu.autoImpliedValue !== undefined && menu.name && !impliedTargets.has(menu.name)) {
                menu.autoImpliedValue = undefined;
            }
            if (menu.children) {
                menu.children.forEach(clearMarker);
            }
        };
        this.allMenus.forEach(clearMarker);
        if (changedMenus.size > 0) {
            this.evaluator.updateContext(this.configValues);
        }
        return changedMenus;
    }
    updateTristateAllowedValues() {
        const changed = new Set();
        const modulesEnabled = this.isModulesEnabled();
        const determineAllowed = (menu) => {
            if (menu.type !== _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.tristate) {
                return undefined;
            }
            const allowed = new Set(this.tristateOrder);
            if (!modulesEnabled) {
                allowed.delete('m');
            }
            const implied = menu.autoImpliedValue;
            let impliedState;
            if (typeof implied === 'string') {
                const lower = implied.toLowerCase();
                if (lower === 'y') {
                    impliedState = 'y';
                }
                else if (lower === 'm') {
                    impliedState = 'm';
                }
            }
            else if (implied === true) {
                impliedState = 'y';
            }
            if (impliedState === 'y') {
                allowed.delete('m');
            }
            else if (impliedState === 'm') {
                allowed.delete('n');
                allowed.add('m');
            }
            if (menu.isReadonly && menu.value === 'y') {
                allowed.delete('n');
                allowed.delete('m');
            }
            const sorted = this.tristateOrder.filter(v => allowed.has(v));
            return sorted.length > 0 ? sorted : undefined;
        };
        const apply = (menus) => {
            for (const menu of menus) {
                const allowed = determineAllowed(menu);
                if (allowed) {
                    menu.allowedTristateValues = allowed;
                    if (menu.name) {
                        const normalized = this.normalizeTristateValue(menu.value);
                        if (!allowed.includes(normalized)) {
                            const replacement = this.clampTristateValue(allowed, normalized);
                            if (menu.value !== replacement) {
                                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[MODULES] Adjusting ${menu.name} from ${menu.value} -> ${replacement} due to modules constraints`);
                                menu.value = replacement;
                                this.markMenuAndPeersChanged(menu, changed);
                            }
                            this.configValues[menu.name] = replacement;
                            this.evaluator.setValue(menu.name, replacement);
                            if (menu.isDefaultValue !== false) {
                                menu.isDefaultValue = true;
                            }
                        }
                    }
                }
                else if (menu.allowedTristateValues) {
                    delete menu.allowedTristateValues;
                }
                if (menu.children) {
                    apply(menu.children);
                }
            }
        };
        apply(this.allMenus);
        return changed;
    }
    isModulesEnabled() {
        if (!this.modulesSymbolName) {
            return false;
        }
        const value = this.configValues[this.modulesSymbolName];
        if (value === undefined || value === null) {
            return false;
        }
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'number') {
            return value >= 1;
        }
        if (typeof value === 'string') {
            const lower = value.toLowerCase();
            if (lower === 'y' || lower === 'yes' || lower === 'true' || lower === '1') {
                return true;
            }
            if (lower === 'm' || lower === '2') {
                return true;
            }
            return false;
        }
        return false;
    }
    /**
     * Utility helpers for incremental visibility propagation.
     */
    collectAllMenuIds() {
        return new Set(this.menuById.keys());
    }
    markMenuAndPeersChanged(menu, changed) {
        if (!menu) {
            return;
        }
        if (menu.id) {
            changed.add(menu.id);
        }
        if (!menu.name) {
            return;
        }
        const peers = this.getMenusByName(menu.name);
        for (const peer of peers) {
            if (peer.id) {
                changed.add(peer.id);
            }
        }
    }
    collectAffectedItemsFromSeeds(seedIds) {
        const affected = new Set();
        const queue = [];
        let queueIndex = 0;
        const enqueue = (itemId) => {
            if (!itemId || affected.has(itemId)) {
                return;
            }
            affected.add(itemId);
            queue.push(itemId);
        };
        for (const seedId of seedIds) {
            enqueue(seedId);
        }
        while (queueIndex < queue.length) {
            const currentId = queue[queueIndex++];
            if (!currentId) {
                continue;
            }
            const depInfo = this.dependencies.get(currentId);
            if (depInfo) {
                depInfo.dependents.forEach((dependentId) => enqueue(dependentId));
            }
            const currentMenu = this.findMenuById(currentId);
            if (currentMenu?.name) {
                const peers = this.getMenusByName(currentMenu.name);
                for (const peer of peers) {
                    enqueue(peer.id);
                }
            }
            let ancestorId = this.menuParentByChildId.get(currentId) ?? null;
            while (ancestorId) {
                enqueue(ancestorId);
                ancestorId = this.menuParentByChildId.get(ancestorId) ?? null;
            }
        }
        return affected;
    }
    collectReadonlyCandidateIds(baseIds) {
        const candidates = new Set();
        const queue = [];
        let queueIndex = 0;
        const enqueueById = (id) => {
            if (!id || candidates.has(id)) {
                return;
            }
            candidates.add(id);
            queue.push(id);
        };
        const enqueueMenuAndPeers = (menu) => {
            if (!menu) {
                return;
            }
            enqueueById(menu.id);
            if (menu.name) {
                const peers = this.getMenusByName(menu.name);
                for (const peer of peers) {
                    enqueueById(peer.id);
                }
            }
        };
        for (const id of baseIds) {
            enqueueById(id);
        }
        while (queueIndex < queue.length) {
            const currentId = queue[queueIndex++];
            if (!currentId) {
                continue;
            }
            const currentMenu = this.findMenuById(currentId);
            if (!currentMenu) {
                continue;
            }
            if (currentMenu.select && currentMenu.select.length > 0) {
                for (const targetName of currentMenu.select) {
                    const targets = this.getMenusByName(targetName);
                    for (const target of targets) {
                        enqueueMenuAndPeers(target);
                    }
                }
            }
            if (currentMenu.selectedBy && currentMenu.selectedBy.length > 0) {
                for (const selectorName of currentMenu.selectedBy) {
                    const selectors = this.getMenusByName(selectorName);
                    for (const selectorMenu of selectors) {
                        enqueueMenuAndPeers(selectorMenu);
                    }
                }
            }
        }
        return candidates;
    }
    /**
     * Process select statements for all initially enabled configs
     */
    processInitialSelectStatements() {
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect('[INITIAL_SELECT] Processing initial select statements...');
        let processedCount = 0;
        let enabledWithSelectCount = 0;
        const processMenu = (menu) => {
            processedCount++;
            // Process select statements for boolean configs that are effectively enabled
            if (menu.type === "bool" && this.isSelectorEffectivelyEnabled(menu) && menu.select && menu.select.length > 0) {
                enabledWithSelectCount++;
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[INITIAL_SELECT] Processing ${menu.name} (enabled with ${menu.select.length} select targets)`);
                this.processSelectStatements(menu, true);
            }
            else if (menu.type === "bool" && menu.select && menu.select.length > 0) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[INITIAL_SELECT] Skipping ${menu.name} (value=${menu.value}, deps=${menu.dependsOn || '(none)'}, has ${menu.select.length} select targets but not effectively enabled)`);
            }
            // 特别处理没有 prompt 但有默认值的配置项
            if (menu.type === "bool" && !menu.hasPrompt && menu.value === undefined && menu.defaults && menu.defaults.length > 0) {
                // 评估默认值条件
                for (const defaultDef of menu.defaults) {
                    if (!defaultDef.condition) {
                        // 无条件默认值
                        menu.value = defaultDef.value;
                        this.configValues[menu.name] = defaultDef.value;
                        break;
                    }
                    else {
                        // 有条件默认值
                        try {
                            const conditionResult = this.evaluator.evaluate(defaultDef.condition);
                            if (conditionResult) {
                                menu.value = defaultDef.value;
                                this.configValues[menu.name] = defaultDef.value;
                                break;
                            }
                        }
                        catch (error) {
                            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.warn(`Failed to evaluate default condition for ${menu.name}: ${defaultDef.condition}`);
                        }
                    }
                }
                // 如果设置了值且为true，处理select语句
                if (this.isSelectorEffectivelyEnabled(menu) && menu.select && menu.select.length > 0) {
                    this.processSelectStatements(menu, true);
                }
            }
            if (menu.children) {
                menu.children.forEach(processMenu);
            }
        };
        this.allMenus.forEach(processMenu);
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[INITIAL_SELECT] Initial select processing completed:`);
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[INITIAL_SELECT]   - Total menus processed: ${processedCount}`);
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[INITIAL_SELECT]   - Enabled menus with select statements: ${enabledWithSelectCount}`);
        // Update evaluator context after processing selects
        this.evaluator.updateContext(this.configValues);
    }
    /**
     * Update visibility for a specific item
     * Visibility = hasPrompt && dependency_condition
     * Non-prompt items are never visible according to Kconfig specification
     * BUT: Implicit containers (no prompt but with visible children) should allow their children to show
     */
    updateItemVisibility(itemId) {
        const menu = this.findMenuById(itemId);
        if (!menu) {
            return;
        }
        // Ensure menu and menuconfig blocks with a prompt are always treated as having a prompt
        // Some parsers or transformations may omit hasPrompt on menu nodes even
        // when they clearly have a title. Guard against that here so container
        // menus don't disappear from the UI.
        if ((menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.menu || menu.isMenuconfig === true) && !!menu.title && menu.hasPrompt !== true) {
            menu.hasPrompt = true;
        }
        // Debug: 专门追踪 RT_MAIN_THREAD 和 RT_USING_USER_MAIN 相关配置项
        // Special handling for implicit containers
        // Following Kconfiglib's behavior: invisible symbols with visible children are shown
        if (!menu.hasPrompt) {
            // Check if this is an implicit container (no prompt but has children that could be visible)
            if (menu.isImplicitContainer) {
                // For implicit containers, we need to check if they have visible children
                // The container itself isn't visible as a config item, but it acts as a container
                menu.isVisible = false; // The config itself is not visible
                menu.isContainerVisible = true; // But it acts as a visible container for its children
            }
            else {
                menu.isVisible = false;
                menu.isContainerVisible = false;
            }
            // Continue to evaluate dependencies for children
        }
        const depInfo = this.dependencies.get(itemId);
        if (!depInfo || !depInfo.dependsOn) {
            // If has prompt and no dependencies -> visible
            if (menu.hasPrompt) {
                menu.isVisible = true;
                menu.isContainerVisible = true;
            }
            return;
        }
        try {
            // Evaluate dependencies
            const dependencyResult = this.evaluator.evaluate(depInfo.dependsOn);
            // Visibility depends on both having a prompt and dependency evaluation
            if (menu.hasPrompt) {
                menu.isVisible = dependencyResult;
                menu.isContainerVisible = dependencyResult;
            }
            else if (menu.isImplicitContainer) {
                // No prompt but is an implicit container - check if dependencies are met
                // The config itself is not visible, but it can act as a container if dependencies are met
                menu.isVisible = false;
                menu.isContainerVisible = dependencyResult; // Container is visible if dependencies are met
            }
            else {
                // No prompt and not an implicit container
                menu.isVisible = false;
                menu.isContainerVisible = false;
            }
        }
        catch (error) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.warn(`Failed to evaluate visibility for ${menu.name}: ${depInfo.dependsOn}. Error: ${error}`);
            // Default to visible if evaluation fails, but only if hasPrompt is true
            menu.isVisible = menu.hasPrompt ? true : false;
            menu.isContainerVisible = menu.hasPrompt ? true : (menu.isImplicitContainer ? true : false);
        }
    }
    /**
     * Update visibility for all items
     */
    updateAllVisibility() {
        const updateVisibility = (menu) => {
            this.updateItemVisibility(menu.id);
            if (menu.children) {
                menu.children.forEach(updateVisibility);
            }
        };
        this.allMenus.forEach(updateVisibility);
    }
    /**
     * Get dependency information for debugging
     */
    getDependencyInfo() {
        return new Map(this.dependencies);
    }
    /**
     * Check if a configuration has dependents
     */
    hasDependents(configId) {
        const depInfo = this.dependencies.get(configId);
        return depInfo ? depInfo.dependents.size > 0 : false;
    }
    /**
     * Get all dependents of a configuration
     */
    getDependents(configId) {
        const depInfo = this.dependencies.get(configId);
        return depInfo ? Array.from(depInfo.dependents) : [];
    }
    /**
     * Process select statements when a config is enabled or disabled
     */
    processSelectStatements(menu, isEnabled, changed) {
        // 依据 Kconfiglib 语义：仅当选择器自身值为 true 且直接依赖满足时，select 才生效
        const depsOk = !menu.dependsOn || this.safeEval(menu.dependsOn);
        const effectivelyEnabled = isEnabled && depsOk && menu.value === true && menu.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool;
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`Processing select statements for ${menu.name}, enabled: ${isEnabled}, depsOk=${depsOk}, effective=${effectivelyEnabled}`);
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`Menu ${menu.name} has ${menu.select?.length || 0} select targets`);
        if (!menu.select || menu.select.length === 0) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`No select targets for ${menu.name}, returning`);
            return;
        }
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`Select targets for ${menu.name}: ${menu.select.join(', ')}`);
        for (const selectTarget of menu.select) {
            // Check if there's a condition for this select statement
            const selectCondition = menu.selectConditions?.[selectTarget];
            if (selectCondition) {
                // Evaluate the condition
                const conditionMet = this.evaluator.evaluate(selectCondition);
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`Select ${selectTarget} has condition "${selectCondition}", evaluated to: ${conditionMet}`);
                if (!conditionMet) {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`Skipping select ${selectTarget} as condition is not met`);
                    continue;
                }
            }
            const targetMenu = this.findMenuByName(selectTarget);
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`Processing select target ${selectTarget}, found: ${targetMenu ? 'yes' : 'no'}`);
            if (targetMenu) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`Target menu ${targetMenu.name} current selectedBy: ${targetMenu.selectedBy?.join(', ') || 'none'}`);
                if (effectivelyEnabled) {
                    // 启用选择器时的处理
                    this.addSelectRelationship(menu, targetMenu);
                    this.autoSelectTarget(targetMenu, menu, changed);
                }
                else {
                    // 禁用选择器时的处理
                    this.removeSelectRelationship(menu, targetMenu);
                    this.checkAutoDeselectTarget(targetMenu, menu, changed);
                }
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`Target menu ${targetMenu.name} updated selectedBy: ${targetMenu.selectedBy?.join(', ') || 'none'}`);
            }
            else {
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`Select target ${selectTarget} not found for ${menu.name}`);
            }
        }
    }
    // 安全求值布尔条件（失败返回 false，避免误选）
    safeEval(expr) {
        try {
            return this.evaluator.evaluate(expr);
        }
        catch (e) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[SELECT_EVAL] Failed to evaluate expression: ${expr}. Error: ${e}`);
            return false;
        }
    }
    /**
     * Add select relationship between selector and target
     */
    addSelectRelationship(selector, target) {
        if (!target.selectedBy) {
            target.selectedBy = [];
        }
        if (!target.selectedBy.includes(selector.name)) {
            target.selectedBy.push(selector.name);
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`Added ${selector.name} as selector for ${target.name}`);
            this.syncSymbolState(target);
        }
    }
    /**
     * Remove select relationship between selector and target
     */
    removeSelectRelationship(selector, target) {
        if (target.selectedBy) {
            const index = target.selectedBy.indexOf(selector.name);
            if (index > -1) {
                target.selectedBy.splice(index, 1);
                // Logger.info(`[SELECT_PROCESSOR] Removed ${selector.name} as selector for ${target.name}`);
                this.syncSymbolState(target);
            }
        }
    }
    /**
     * Auto-select target when selector is enabled
     */
    autoSelectTarget(target, selector, changed) {
        if (target.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[SELECT_PROCESSOR] Auto-selecting ${target.name} due to ${selector.name}`);
            if (target.autoSelectedValue === undefined) {
                target.autoSelectedPreviousValue = target.value;
                target.autoSelectedPreviousWasDefault = target.isDefaultValue;
            }
            const valueChanged = target.value !== true;
            // 无论当前值如何，都确保目标被选中并标记为自动选择
            target.value = true;
            target.autoSelectedValue = true; // 标记为自动选择的值
            target.isDefaultValue = false;
            this.configValues[target.name] = true;
            this.evaluator.setValue(target.name, true);
            if (valueChanged && changed) {
                this.markMenuAndPeersChanged(target, changed);
            }
            this.syncSymbolState(target);
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[SELECT_PROCESSOR] ${target.name} set to true and marked as auto-selected`);
            // 递归处理新选择项的 select 语句
            if (target.select && target.select.length > 0) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[SELECT_PROCESSOR] Processing ${target.name}'s select statements recursively`);
                this.processSelectStatements(target, true, changed);
            }
        }
        else {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[SELECT_PROCESSOR] Skipping auto-select for ${target.name} (not bool type, is ${target.type})`);
        }
    }
    /**
     * Check if target should be auto-deselected when selector is disabled
     */
    checkAutoDeselectTarget(target, selector, changed) {
        // 检查是否还有其他活跃的选择器
        const hasOtherActiveSelectors = target.selectedBy && target.selectedBy.some(selectorName => {
            if (selectorName === selector.name)
                return false;
            const selectorMenu = this.findMenuByName(selectorName);
            return selectorMenu && selectorMenu.value === true;
        });
        // 如果没有其他活跃的选择器，且当前值是自动选择的，则取消选择
        if (!hasOtherActiveSelectors && target.autoSelectedValue) {
            const previousValue = target.autoSelectedPreviousValue;
            const previousWasDefault = target.autoSelectedPreviousWasDefault;
            const fallbackValue = this.getFallbackValueForType(target.type);
            const restoredValue = previousValue !== undefined ? previousValue : fallbackValue;
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[SELECT_PROCESSOR] Restoring ${target.name} to ${JSON.stringify(restoredValue)} with fallback ${JSON.stringify(fallbackValue)}`);
            const valueChanged = !this.areMenuValuesEqual(target.value, restoredValue, target.type);
            target.value = restoredValue;
            target.autoSelectedValue = undefined; // 清除自动选择标记
            target.autoSelectedPreviousValue = undefined;
            target.autoSelectedPreviousWasDefault = undefined;
            if (previousWasDefault !== undefined) {
                target.isDefaultValue = previousWasDefault;
            }
            else if (restoredValue === fallbackValue) {
                target.isDefaultValue = true;
            }
            else {
                target.isDefaultValue = false;
            }
            this.configValues[target.name] = restoredValue;
            this.evaluator.setValue(target.name, restoredValue);
            if (valueChanged && changed) {
                this.markMenuAndPeersChanged(target, changed);
            }
            // 递归处理被取消选择项的 select 语句或恢复用户选择
            if (target.select && target.select.length > 0 && target.type === _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool) {
                const isEnabledAfterRestore = restoredValue === true;
                this.processSelectStatements(target, isEnabledAfterRestore, changed);
            }
            this.syncSymbolState(target);
        }
        else if (!hasOtherActiveSelectors && target.value === true) {
            // 如果值不是自动选择的（用户手动设置），则保留当前值但记录信息
            // Logger.info(`[SELECT_PROCESSOR] ${target.name} no longer has active selectors, but keeping user-set value`);
        }
    }
    /**
     * Update readonly states for all menu items based on selectedBy relationships
     */
    updateReadonlyStates(candidateIds) {
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility('[READONLY_PROCESSOR] Starting readonly states update...');
        const changed = new Set();
        let totalProcessed = 0;
        let readonlyCount = 0;
        let selectedByCount = 0;
        const processMenu = (menu) => {
            totalProcessed++;
            // Reset readonly state
            const wasReadonly = menu.isReadonly;
            const previousReadonlyReason = menu.readonlyReason;
            const previousValue = menu.value;
            menu.isReadonly = false;
            menu.readonlyReason = undefined;
            // Check if this menu has selectedBy relationships
            if (menu.selectedBy && menu.selectedBy.length > 0) {
                selectedByCount++;
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR] Processing ${menu.name} with selectedBy: [${menu.selectedBy.join(', ')}]`);
                // Find all active selectors
                const activeSelectors = menu.selectedBy.filter(selectorName => {
                    const selectorMenu = this.findMenuByName(selectorName);
                    const isActive = selectorMenu ? this.isSelectorEffectivelyEnabled(selectorMenu) : false;
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR] Checking selector ${selectorName} for ${menu.name}:`);
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - Found selector: ${!!selectorMenu}`);
                    if (selectorMenu) {
                        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - Selector type: ${selectorMenu.type}`);
                        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - Selector value: ${selectorMenu.value} (type: ${typeof selectorMenu.value})`);
                        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - Selector dependsOn: ${selectorMenu.dependsOn || '(none)'}`);
                        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - Is active (value && deps): ${isActive}`);
                    }
                    return isActive;
                });
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR] Active selectors for ${menu.name}: [${activeSelectors.join(', ')}]`);
                if (activeSelectors.length > 0) {
                    menu.isReadonly = true;
                    readonlyCount++;
                    // Provide detailed readonly reason
                    if (activeSelectors.length === 1) {
                        menu.readonlyReason = `此选项被 ${activeSelectors[0]} 自动选择`;
                    }
                    else {
                        menu.readonlyReason = `此选项被以下配置自动选择: ${activeSelectors.join(', ')}`;
                    }
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR] ✓ ${menu.name} is now READONLY due to active selectors: ${activeSelectors.join(', ')}`);
                    // Auto-select the item if it has active selectors
                    if (menu.type === 'bool' && menu.value !== true) {
                        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR] Auto-selecting ${menu.name} due to select relationship`);
                        if (menu.autoSelectedValue === undefined) {
                            menu.autoSelectedPreviousValue = menu.value;
                            menu.autoSelectedPreviousWasDefault = menu.isDefaultValue;
                        }
                        menu.value = true;
                        menu.autoSelectedValue = true;
                        menu.isDefaultValue = false;
                        this.configValues[menu.name] = true;
                        this.evaluator.setValue(menu.name, true);
                    }
                }
                else {
                    _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR] ${menu.name} has selectedBy but no active selectors`);
                }
            }
            // Log state changes
            if (wasReadonly !== menu.isReadonly ||
                previousReadonlyReason !== menu.readonlyReason ||
                !this.areMenuValuesEqual(previousValue, menu.value, menu.type)) {
                _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR] State changed for ${menu.name}: ${wasReadonly} → ${menu.isReadonly}`);
                this.markMenuAndPeersChanged(menu, changed);
            }
        };
        if (!candidateIds) {
            this.menuById.forEach((menu) => {
                processMenu(menu);
            });
        }
        else {
            candidateIds.forEach((id) => {
                const menu = this.findMenuById(id);
                if (menu) {
                    processMenu(menu);
                }
            });
        }
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR] Readonly states update completed:`);
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - Total menus processed: ${totalProcessed}`);
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - Menus with selectedBy: ${selectedByCount}`);
        _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - Menus now readonly: ${readonlyCount}`);
        // Log specific case we're looking for
        const dfsUsingPosix = this.findMenuByName('DFS_USING_POSIX');
        if (dfsUsingPosix) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR] DFS_USING_POSIX status:`);
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - selectedBy: [${dfsUsingPosix.selectedBy.join(', ')}]`);
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - isReadonly: ${dfsUsingPosix.isReadonly}`);
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - value: ${dfsUsingPosix.value}`);
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - readonlyReason: ${dfsUsingPosix.readonlyReason}`);
        }
        // 额外调试：关注 RT_USING_HOOKLIST 的只读与选择来源
        const hookList = this.findMenuByName('RT_USING_HOOKLIST');
        if (hookList) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR] RT_USING_HOOKLIST status:`);
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - selectedBy: [${hookList.selectedBy.join(', ')}]`);
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - isReadonly: ${hookList.isReadonly}`);
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - value: ${hookList.value}`);
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugVisibility(`[READONLY_PROCESSOR]   - readonlyReason: ${hookList.readonlyReason}`);
        }
        return changed;
    }
    /**
     * Find all configs that select the given menu item
     */
    findSelectorsForItem(targetMenu) {
        const searchForSelectors = (menu) => {
            // Check if this menu selects the target
            if (menu.select && menu.select.includes(targetMenu.name)) {
                if (!targetMenu.selectedBy.includes(menu.name)) {
                    targetMenu.selectedBy.push(menu.name);
                }
            }
            // Search in children
            if (menu.children) {
                menu.children.forEach(searchForSelectors);
            }
        };
        this.allMenus.forEach(searchForSelectors);
    }
    /**
     * Log current visibility state for debugging
     */
    logVisibilityState() {
        // Logger.info(`[VISIBILITY_STATE] Current visibility state:`);
        const logMenu = (menu, depth = 0) => {
            const _indent = "  ".repeat(depth);
            const _visIcon = menu.isVisible ? "👁️" : "🙈";
            const _depInfo = menu.dependsOn ? ` (depends: ${menu.dependsOn})` : " (no depends)";
            // Logger.info(`${indent}${visIcon} ${menu.name || menu.title}: ${menu.isVisible}${depInfo}`);
            // Debug dependency evaluation
            if (menu.dependsOn) {
                try {
                    const _evalResult = this.evaluator.evaluate(menu.dependsOn);
                    // Logger.info(`${indent}  -> Condition "${menu.dependsOn}" evaluates to: ${evalResult}`);
                }
                catch (error) {
                    // Logger.info(`${indent}  -> Condition evaluation failed: ${error}`);
                }
            }
            if (menu.children && menu.children.length > 0) {
                menu.children.forEach(child => logMenu(child, depth + 1));
            }
        };
        this.allMenus.forEach(menu => logMenu(menu));
        // Logger.info(`[CONFIG_VALUES] Current config values:`);
        // Object.entries(this.configValues).forEach(([key, value]) => {
        //     Logger.info(`  ${key}: ${value} (${typeof value})`);
        // });
        // Logger.info(`[DEPENDENCIES] Dependency graph:`);
        // this.dependencies.forEach((depInfo, configId) => {
        //     const menu = this.findMenuById(configId);
        //     const menuName = menu ? menu.name : 'unknown';
        //     Logger.info(`  ${configId} (${menuName}): depends on "${depInfo.dependsOn}", has ${depInfo.dependents.size} dependents`);
        // });
    }
    /**
     * Debug select relationships for troubleshooting
     */
    debugSelectRelationships() {
        // Logger.info(`[DEBUG] Select relationships:`);
        const logSelectInfo = (menu, depth = 0) => {
            const _indent = "  ".repeat(depth);
            if (menu.name) {
                const _selectInfo = menu.select && menu.select.length > 0 ? ` selects: [${menu.select.join(', ')}]` : '';
                const _selectedByInfo = menu.selectedBy && menu.selectedBy.length > 0 ? ` selected by: [${menu.selectedBy.join(', ')}]` : '';
                const _readonlyInfo = menu.isReadonly ? ' (READONLY)' : '';
                // Logger.info(`${indent}${menu.name} = ${menu.value}${selectInfo}${selectedByInfo}${readonlyInfo}`);
                if (menu.readonlyReason) {
                    // Logger.info(`${indent}  -> Readonly reason: ${menu.readonlyReason}`);
                }
            }
            if (menu.children) {
                menu.children.forEach(child => logSelectInfo(child, depth + 1));
            }
        };
        this.allMenus.forEach(menu => logSelectInfo(menu));
    }
    /**
     * 判断一个带有 select 的“选择器”是否有效启用（匹配 Kconfiglib tri_value 语义的关键部分）
     * 规则：
     * - 必须是布尔类型；
     * - 其值为 true；
     * - 直接依赖（depends on/if/menu/visible if 合并后）成立。
     */
    isSelectorEffectivelyEnabled(selector) {
        if (!selector || selector.type !== _Menu__WEBPACK_IMPORTED_MODULE_0__.menuType.bool) {
            return false;
        }
        if (selector.value !== true) {
            return false;
        }
        try {
            if (!selector.dependsOn || selector.dependsOn.trim() === '') {
                return true;
            }
            const depsOk = this.evaluator.evaluate(selector.dependsOn);
            return !!depsOk;
        }
        catch (e) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_2__.Logger.debugSelect(`[SELECT_EVAL] Failed to evaluate dependsOn for ${selector.name}: ${selector.dependsOn}. Error: ${e}`);
            // 谨慎起见，依赖计算失败时不视为有效，避免误选中
            return false;
        }
    }
}


/***/ },

/***/ "./src/menuconfig/fileWatcher.ts"
/*!***************************************!*\
  !*** ./src/menuconfig/fileWatcher.ts ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FileWatcher: () => (/* binding */ FileWatcher)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// import { Logger } from '../logger/logger';
class FileWatcher {
    static instance;
    fileWatcher;
    context;
    ignoreNextChangeTimestamp = 0;
    constructor(context) {
        this.context = context;
        FileWatcher.instance = this;
    }
    static getInstance() {
        return FileWatcher.instance;
    }
    /**
     * 忽略接下来一段时间内的文件变化通知（用于内部保存）
     * @param durationMs 忽略时长（毫秒），默认 1000ms
     */
    ignoreNextChange(durationMs = 1000) {
        this.ignoreNextChangeTimestamp = Date.now() + durationMs;
    }
    initialize() {
        const workspaceFolder = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return;
        }
        // Watch for kconfig and defconfig file changes
        const configPattern = new vscode__WEBPACK_IMPORTED_MODULE_0__.RelativePattern(workspaceFolder, '**/{sdkconfig,defconfig,.config}');
        this.fileWatcher = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.createFileSystemWatcher(configPattern);
        // Handle file creation
        this.fileWatcher.onDidCreate((uri) => {
            // Logger.info(`Configuration file created: ${uri.fsPath}`);
            // 检查是否应该忽略这次创建（内部保存操作触发的）
            if (Date.now() < this.ignoreNextChangeTimestamp) {
                // Logger.info(`Ignoring file creation notification for internal save: ${uri.fsPath}`);
                return;
            }
            this.handleConfigFileChange(uri);
        });
        // Handle file changes
        this.fileWatcher.onDidChange((uri) => {
            // Logger.info(`Configuration file changed: ${uri.fsPath}`);
            this.handleConfigFileChange(uri);
        });
        // Handle file deletion
        this.fileWatcher.onDidDelete((_uri) => {
            // Logger.info(`Configuration file deleted: ${_uri.fsPath}`);
            // 检查是否应该忽略这次删除（内部 reset 操作触发的）
            if (Date.now() < this.ignoreNextChangeTimestamp) {
                // Logger.info(`Ignoring file deletion notification for internal reset: ${_uri.fsPath}`);
                return;
            }
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage('Configuration file has been deleted.');
        });
        this.context.subscriptions.push(this.fileWatcher);
    }
    handleConfigFileChange(_uri) {
        // 检查是否应该忽略这次变化（内部保存触发的）
        if (Date.now() < this.ignoreNextChangeTimestamp) {
            // Logger.info(`Ignoring file change notification for internal save: ${_uri.fsPath}`);
            return;
        }
        // 只有外部修改时才通知
        const fileName = _uri.fsPath.split('/').pop() || 'Unknown';
        vscode__WEBPACK_IMPORTED_MODULE_0__.window.showInformationMessage(`Configuration file ${fileName} has been modified externally.`);
    }
    dispose() {
        if (this.fileWatcher) {
            this.fileWatcher.dispose();
        }
    }
}


/***/ },

/***/ "./src/menuconfig/helpTextFormatter.ts"
/*!*********************************************!*\
  !*** ./src/menuconfig/helpTextFormatter.ts ***!
  \*********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   formatBulletPoint: () => (/* binding */ formatBulletPoint),
/* harmony export */   formatEndBulletPoint: () => (/* binding */ formatEndBulletPoint),
/* harmony export */   formatHelpText: () => (/* binding */ formatHelpText),
/* harmony export */   formatLinkText: () => (/* binding */ formatLinkText),
/* harmony export */   formatNewLine: () => (/* binding */ formatNewLine),
/* harmony export */   formatRedText: () => (/* binding */ formatRedText)
/* harmony export */ });
/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const middleTextBulletRegex = /(\n\n-)[\s\S]*(\n)/g;
const middleRegex = /(\n\n-)[\s\S]*?(\n\n)/g;
const linkRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
const redTextRegex = /``(.*?)``/g;
const bulletPointStart = "\n\n-";
const bulletPointRegex = /\n-/g;
const newLineRegex = /\n\n/g;
function formatRedText(htmlString) {
    // Replaces ``function-name`` with <span>function-name</span>
    if (htmlString && htmlString.match(redTextRegex) !== null) {
        let newHtmlString = htmlString;
        const matches = htmlString.match(redTextRegex);
        matches.forEach((match) => {
            const newMatch = `<span>${match.substr(2, match.length - 4)}</span>`;
            newHtmlString = newHtmlString.replace(match, newMatch);
        });
        return newHtmlString;
    }
    return htmlString;
}
function formatLinkText(htmlString) {
    // Replace links with <a href="link">link</a>
    if (htmlString && htmlString.match(linkRegex) !== null) {
        let newHtmlString = htmlString;
        const linkMatches = htmlString.match(linkRegex);
        linkMatches.forEach((link) => {
            const newLink = `<a href="${link}">${link}</a>`;
            newHtmlString = newHtmlString.replace(link, newLink);
        });
        return newHtmlString;
    }
    return htmlString;
}
function formatBulletPoint(htmlString) {
    // Middle of text list of bullet points case
    if (htmlString) {
        let newHtmlString = htmlString;
        const middleMatch = htmlString.match(middleRegex);
        if (middleMatch &&
            middleRegex.test(htmlString) &&
            middleRegex.lastIndex !== htmlString.length &&
            htmlString.lastIndexOf("\n-") < middleRegex.lastIndex) {
            const bulletPointMatches = htmlString.match(middleRegex);
            bulletPointMatches.forEach((bulletPoint) => {
                const replacement = `${bulletPoint
                    .replace(bulletPointStart, "<ul><li>")
                    .replace(bulletPointRegex, "</li><li>")}</li></ul>`;
                newHtmlString = newHtmlString.replace(bulletPoint, replacement);
            });
            return newHtmlString;
        }
    }
    return htmlString;
}
function formatEndBulletPoint(htmlString) {
    // End of text list of bullet points case
    if (htmlString &&
        htmlString.indexOf(bulletPointStart) > 0 &&
        (htmlString.match(middleTextBulletRegex) === null ||
            (middleTextBulletRegex.test(htmlString) &&
                middleTextBulletRegex.lastIndex === htmlString.length))) {
        const newHtmlString = `${htmlString
            .replace(bulletPointStart, "<ul><li>")
            .replace(bulletPointRegex, "</li><li>")}</li></ul>`;
        return newHtmlString;
    }
    return htmlString;
}
function formatNewLine(htmlString) {
    if (htmlString) {
        return htmlString.replace(newLineRegex, "<br><br>");
    }
    return htmlString;
}
function formatHelpText(helpString) {
    let newHelp = formatBulletPoint(helpString);
    newHelp = formatEndBulletPoint(newHelp);
    newHelp = formatRedText(newHelp);
    newHelp = formatLinkText(newHelp);
    newHelp = formatNewLine(newHelp);
    return newHelp;
}


/***/ },

/***/ "./src/menuconfig/unsavedCloseFlow.ts"
/*!********************************************!*\
  !*** ./src/menuconfig/unsavedCloseFlow.ts ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   runUnsavedCloseFlow: () => (/* binding */ runUnsavedCloseFlow)
/* harmony export */ });
async function runUnsavedCloseFlow(options) {
    if (!options.hasUnsavedChanges) {
        return;
    }
    const saveItem = {
        title: options.text.saveButton,
        isCloseAffordance: false,
    };
    const noSaveItem = {
        title: options.text.noSaveButton,
        isCloseAffordance: true,
    };
    const decision = await options.showWarningMessage(options.text.unsavedMessage, { modal: true }, saveItem, noSaveItem);
    if (decision !== saveItem) {
        return;
    }
    try {
        await options.saveConfig();
        options.setStatusBarMessage(`$(check) ${options.text.saveSuccess}`, 3000);
    }
    catch {
        options.showErrorMessage(options.text.saveFailed);
    }
}


/***/ },

/***/ "vscode"
/*!*************************!*\
  !*** external "vscode" ***!
  \*************************/
(module) {

module.exports = require("vscode");

/***/ },

/***/ "child_process"
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
(module) {

module.exports = require("child_process");

/***/ },

/***/ "crypto"
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
(module) {

module.exports = require("crypto");

/***/ },

/***/ "events"
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
(module) {

module.exports = require("events");

/***/ },

/***/ "fs"
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
(module) {

module.exports = require("fs");

/***/ },

/***/ "node:diagnostics_channel"
/*!*******************************************!*\
  !*** external "node:diagnostics_channel" ***!
  \*******************************************/
(module) {

module.exports = require("node:diagnostics_channel");

/***/ },

/***/ "node:events"
/*!******************************!*\
  !*** external "node:events" ***!
  \******************************/
(module) {

module.exports = require("node:events");

/***/ },

/***/ "node:fs"
/*!**************************!*\
  !*** external "node:fs" ***!
  \**************************/
(module) {

module.exports = require("node:fs");

/***/ },

/***/ "node:fs/promises"
/*!***********************************!*\
  !*** external "node:fs/promises" ***!
  \***********************************/
(module) {

module.exports = require("node:fs/promises");

/***/ },

/***/ "node:path"
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
(module) {

module.exports = require("node:path");

/***/ },

/***/ "node:stream"
/*!******************************!*\
  !*** external "node:stream" ***!
  \******************************/
(module) {

module.exports = require("node:stream");

/***/ },

/***/ "node:string_decoder"
/*!**************************************!*\
  !*** external "node:string_decoder" ***!
  \**************************************/
(module) {

module.exports = require("node:string_decoder");

/***/ },

/***/ "node:url"
/*!***************************!*\
  !*** external "node:url" ***!
  \***************************/
(module) {

module.exports = require("node:url");

/***/ },

/***/ "path"
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
(module) {

module.exports = require("path");

/***/ },

/***/ "./node_modules/glob/dist/esm/glob.js"
/*!********************************************!*\
  !*** ./node_modules/glob/dist/esm/glob.js ***!
  \********************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Glob: () => (/* binding */ Glob)
/* harmony export */ });
/* harmony import */ var minimatch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! minimatch */ "./node_modules/glob/node_modules/minimatch/dist/esm/index.js");
/* harmony import */ var node_url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! node:url */ "node:url");
/* harmony import */ var path_scurry__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! path-scurry */ "./node_modules/path-scurry/dist/esm/index.js");
/* harmony import */ var _pattern_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pattern.js */ "./node_modules/glob/dist/esm/pattern.js");
/* harmony import */ var _walker_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./walker.js */ "./node_modules/glob/dist/esm/walker.js");





// if no process global, just call it linux.
// so we default to case-sensitive, / separators
const defaultPlatform = (typeof process === 'object' &&
    process &&
    typeof process.platform === 'string') ?
    process.platform
    : 'linux';
/**
 * An object that can perform glob pattern traversals.
 */
class Glob {
    absolute;
    cwd;
    root;
    dot;
    dotRelative;
    follow;
    ignore;
    magicalBraces;
    mark;
    matchBase;
    maxDepth;
    nobrace;
    nocase;
    nodir;
    noext;
    noglobstar;
    pattern;
    platform;
    realpath;
    scurry;
    stat;
    signal;
    windowsPathsNoEscape;
    withFileTypes;
    includeChildMatches;
    /**
     * The options provided to the constructor.
     */
    opts;
    /**
     * An array of parsed immutable {@link Pattern} objects.
     */
    patterns;
    /**
     * All options are stored as properties on the `Glob` object.
     *
     * See {@link GlobOptions} for full options descriptions.
     *
     * Note that a previous `Glob` object can be passed as the
     * `GlobOptions` to another `Glob` instantiation to re-use settings
     * and caches with a new pattern.
     *
     * Traversal functions can be called multiple times to run the walk
     * again.
     */
    constructor(pattern, opts) {
        /* c8 ignore start */
        if (!opts)
            throw new TypeError('glob options required');
        /* c8 ignore stop */
        this.withFileTypes = !!opts.withFileTypes;
        this.signal = opts.signal;
        this.follow = !!opts.follow;
        this.dot = !!opts.dot;
        this.dotRelative = !!opts.dotRelative;
        this.nodir = !!opts.nodir;
        this.mark = !!opts.mark;
        if (!opts.cwd) {
            this.cwd = '';
        }
        else if (opts.cwd instanceof URL || opts.cwd.startsWith('file://')) {
            opts.cwd = (0,node_url__WEBPACK_IMPORTED_MODULE_1__.fileURLToPath)(opts.cwd);
        }
        this.cwd = opts.cwd || '';
        this.root = opts.root;
        this.magicalBraces = !!opts.magicalBraces;
        this.nobrace = !!opts.nobrace;
        this.noext = !!opts.noext;
        this.realpath = !!opts.realpath;
        this.absolute = opts.absolute;
        this.includeChildMatches = opts.includeChildMatches !== false;
        this.noglobstar = !!opts.noglobstar;
        this.matchBase = !!opts.matchBase;
        this.maxDepth =
            typeof opts.maxDepth === 'number' ? opts.maxDepth : Infinity;
        this.stat = !!opts.stat;
        this.ignore = opts.ignore;
        if (this.withFileTypes && this.absolute !== undefined) {
            throw new Error('cannot set absolute and withFileTypes:true');
        }
        if (typeof pattern === 'string') {
            pattern = [pattern];
        }
        this.windowsPathsNoEscape =
            !!opts.windowsPathsNoEscape ||
                opts.allowWindowsEscape ===
                    false;
        if (this.windowsPathsNoEscape) {
            pattern = pattern.map(p => p.replace(/\\/g, '/'));
        }
        if (this.matchBase) {
            if (opts.noglobstar) {
                throw new TypeError('base matching requires globstar');
            }
            pattern = pattern.map(p => (p.includes('/') ? p : `./**/${p}`));
        }
        this.pattern = pattern;
        this.platform = opts.platform || defaultPlatform;
        this.opts = { ...opts, platform: this.platform };
        if (opts.scurry) {
            this.scurry = opts.scurry;
            if (opts.nocase !== undefined &&
                opts.nocase !== opts.scurry.nocase) {
                throw new Error('nocase option contradicts provided scurry option');
            }
        }
        else {
            const Scurry = opts.platform === 'win32' ? path_scurry__WEBPACK_IMPORTED_MODULE_2__.PathScurryWin32
                : opts.platform === 'darwin' ? path_scurry__WEBPACK_IMPORTED_MODULE_2__.PathScurryDarwin
                    : opts.platform ? path_scurry__WEBPACK_IMPORTED_MODULE_2__.PathScurryPosix
                        : path_scurry__WEBPACK_IMPORTED_MODULE_2__.PathScurry;
            this.scurry = new Scurry(this.cwd, {
                nocase: opts.nocase,
                fs: opts.fs,
            });
        }
        this.nocase = this.scurry.nocase;
        // If you do nocase:true on a case-sensitive file system, then
        // we need to use regexps instead of strings for non-magic
        // path portions, because statting `aBc` won't return results
        // for the file `AbC` for example.
        const nocaseMagicOnly = this.platform === 'darwin' || this.platform === 'win32';
        const mmo = {
            // default nocase based on platform
            ...opts,
            dot: this.dot,
            matchBase: this.matchBase,
            nobrace: this.nobrace,
            nocase: this.nocase,
            nocaseMagicOnly,
            nocomment: true,
            noext: this.noext,
            nonegate: true,
            optimizationLevel: 2,
            platform: this.platform,
            windowsPathsNoEscape: this.windowsPathsNoEscape,
            debug: !!this.opts.debug,
        };
        const mms = this.pattern.map(p => new minimatch__WEBPACK_IMPORTED_MODULE_0__.Minimatch(p, mmo));
        const [matchSet, globParts] = mms.reduce((set, m) => {
            set[0].push(...m.set);
            set[1].push(...m.globParts);
            return set;
        }, [[], []]);
        this.patterns = matchSet.map((set, i) => {
            const g = globParts[i];
            /* c8 ignore start */
            if (!g)
                throw new Error('invalid pattern object');
            /* c8 ignore stop */
            return new _pattern_js__WEBPACK_IMPORTED_MODULE_3__.Pattern(set, g, 0, this.platform);
        });
    }
    async walk() {
        // Walkers always return array of Path objects, so we just have to
        // coerce them into the right shape.  It will have already called
        // realpath() if the option was set to do so, so we know that's cached.
        // start out knowing the cwd, at least
        return [
            ...(await new _walker_js__WEBPACK_IMPORTED_MODULE_4__.GlobWalker(this.patterns, this.scurry.cwd, {
                ...this.opts,
                maxDepth: this.maxDepth !== Infinity ?
                    this.maxDepth + this.scurry.cwd.depth()
                    : Infinity,
                platform: this.platform,
                nocase: this.nocase,
                includeChildMatches: this.includeChildMatches,
            }).walk()),
        ];
    }
    walkSync() {
        return [
            ...new _walker_js__WEBPACK_IMPORTED_MODULE_4__.GlobWalker(this.patterns, this.scurry.cwd, {
                ...this.opts,
                maxDepth: this.maxDepth !== Infinity ?
                    this.maxDepth + this.scurry.cwd.depth()
                    : Infinity,
                platform: this.platform,
                nocase: this.nocase,
                includeChildMatches: this.includeChildMatches,
            }).walkSync(),
        ];
    }
    stream() {
        return new _walker_js__WEBPACK_IMPORTED_MODULE_4__.GlobStream(this.patterns, this.scurry.cwd, {
            ...this.opts,
            maxDepth: this.maxDepth !== Infinity ?
                this.maxDepth + this.scurry.cwd.depth()
                : Infinity,
            platform: this.platform,
            nocase: this.nocase,
            includeChildMatches: this.includeChildMatches,
        }).stream();
    }
    streamSync() {
        return new _walker_js__WEBPACK_IMPORTED_MODULE_4__.GlobStream(this.patterns, this.scurry.cwd, {
            ...this.opts,
            maxDepth: this.maxDepth !== Infinity ?
                this.maxDepth + this.scurry.cwd.depth()
                : Infinity,
            platform: this.platform,
            nocase: this.nocase,
            includeChildMatches: this.includeChildMatches,
        }).streamSync();
    }
    /**
     * Default sync iteration function. Returns a Generator that
     * iterates over the results.
     */
    iterateSync() {
        return this.streamSync()[Symbol.iterator]();
    }
    [Symbol.iterator]() {
        return this.iterateSync();
    }
    /**
     * Default async iteration function. Returns an AsyncGenerator that
     * iterates over the results.
     */
    iterate() {
        return this.stream()[Symbol.asyncIterator]();
    }
    [Symbol.asyncIterator]() {
        return this.iterate();
    }
}
//# sourceMappingURL=glob.js.map

/***/ },

/***/ "./node_modules/glob/dist/esm/has-magic.js"
/*!*************************************************!*\
  !*** ./node_modules/glob/dist/esm/has-magic.js ***!
  \*************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hasMagic: () => (/* binding */ hasMagic)
/* harmony export */ });
/* harmony import */ var minimatch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! minimatch */ "./node_modules/glob/node_modules/minimatch/dist/esm/index.js");

/**
 * Return true if the patterns provided contain any magic glob characters,
 * given the options provided.
 *
 * Brace expansion is not considered "magic" unless the `magicalBraces` option
 * is set, as brace expansion just turns one string into an array of strings.
 * So a pattern like `'x{a,b}y'` would return `false`, because `'xay'` and
 * `'xby'` both do not contain any magic glob characters, and it's treated the
 * same as if you had called it on `['xay', 'xby']`. When `magicalBraces:true`
 * is in the options, brace expansion _is_ treated as a pattern having magic.
 */
const hasMagic = (pattern, options = {}) => {
    if (!Array.isArray(pattern)) {
        pattern = [pattern];
    }
    for (const p of pattern) {
        if (new minimatch__WEBPACK_IMPORTED_MODULE_0__.Minimatch(p, options).hasMagic())
            return true;
    }
    return false;
};
//# sourceMappingURL=has-magic.js.map

/***/ },

/***/ "./node_modules/glob/dist/esm/ignore.js"
/*!**********************************************!*\
  !*** ./node_modules/glob/dist/esm/ignore.js ***!
  \**********************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Ignore: () => (/* binding */ Ignore)
/* harmony export */ });
/* harmony import */ var minimatch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! minimatch */ "./node_modules/glob/node_modules/minimatch/dist/esm/index.js");
/* harmony import */ var _pattern_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pattern.js */ "./node_modules/glob/dist/esm/pattern.js");
// give it a pattern, and it'll be able to tell you if
// a given path should be ignored.
// Ignoring a path ignores its children if the pattern ends in /**
// Ignores are always parsed in dot:true mode


const defaultPlatform = (typeof process === 'object' &&
    process &&
    typeof process.platform === 'string') ?
    process.platform
    : 'linux';
/**
 * Class used to process ignored patterns
 */
class Ignore {
    relative;
    relativeChildren;
    absolute;
    absoluteChildren;
    platform;
    mmopts;
    constructor(ignored, { nobrace, nocase, noext, noglobstar, platform = defaultPlatform, }) {
        this.relative = [];
        this.absolute = [];
        this.relativeChildren = [];
        this.absoluteChildren = [];
        this.platform = platform;
        this.mmopts = {
            dot: true,
            nobrace,
            nocase,
            noext,
            noglobstar,
            optimizationLevel: 2,
            platform,
            nocomment: true,
            nonegate: true,
        };
        for (const ign of ignored)
            this.add(ign);
    }
    add(ign) {
        // this is a little weird, but it gives us a clean set of optimized
        // minimatch matchers, without getting tripped up if one of them
        // ends in /** inside a brace section, and it's only inefficient at
        // the start of the walk, not along it.
        // It'd be nice if the Pattern class just had a .test() method, but
        // handling globstars is a bit of a pita, and that code already lives
        // in minimatch anyway.
        // Another way would be if maybe Minimatch could take its set/globParts
        // as an option, and then we could at least just use Pattern to test
        // for absolute-ness.
        // Yet another way, Minimatch could take an array of glob strings, and
        // a cwd option, and do the right thing.
        const mm = new minimatch__WEBPACK_IMPORTED_MODULE_0__.Minimatch(ign, this.mmopts);
        for (let i = 0; i < mm.set.length; i++) {
            const parsed = mm.set[i];
            const globParts = mm.globParts[i];
            /* c8 ignore start */
            if (!parsed || !globParts) {
                throw new Error('invalid pattern object');
            }
            // strip off leading ./ portions
            // https://github.com/isaacs/node-glob/issues/570
            while (parsed[0] === '.' && globParts[0] === '.') {
                parsed.shift();
                globParts.shift();
            }
            /* c8 ignore stop */
            const p = new _pattern_js__WEBPACK_IMPORTED_MODULE_1__.Pattern(parsed, globParts, 0, this.platform);
            const m = new minimatch__WEBPACK_IMPORTED_MODULE_0__.Minimatch(p.globString(), this.mmopts);
            const children = globParts[globParts.length - 1] === '**';
            const absolute = p.isAbsolute();
            if (absolute)
                this.absolute.push(m);
            else
                this.relative.push(m);
            if (children) {
                if (absolute)
                    this.absoluteChildren.push(m);
                else
                    this.relativeChildren.push(m);
            }
        }
    }
    ignored(p) {
        const fullpath = p.fullpath();
        const fullpaths = `${fullpath}/`;
        const relative = p.relative() || '.';
        const relatives = `${relative}/`;
        for (const m of this.relative) {
            if (m.match(relative) || m.match(relatives))
                return true;
        }
        for (const m of this.absolute) {
            if (m.match(fullpath) || m.match(fullpaths))
                return true;
        }
        return false;
    }
    childrenIgnored(p) {
        const fullpath = p.fullpath() + '/';
        const relative = (p.relative() || '.') + '/';
        for (const m of this.relativeChildren) {
            if (m.match(relative))
                return true;
        }
        for (const m of this.absoluteChildren) {
            if (m.match(fullpath))
                return true;
        }
        return false;
    }
}
//# sourceMappingURL=ignore.js.map

/***/ },

/***/ "./node_modules/glob/dist/esm/index.js"
/*!*********************************************!*\
  !*** ./node_modules/glob/dist/esm/index.js ***!
  \*********************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Glob: () => (/* reexport safe */ _glob_js__WEBPACK_IMPORTED_MODULE_1__.Glob),
/* harmony export */   Ignore: () => (/* reexport safe */ _ignore_js__WEBPACK_IMPORTED_MODULE_3__.Ignore),
/* harmony export */   escape: () => (/* reexport safe */ minimatch__WEBPACK_IMPORTED_MODULE_0__.escape),
/* harmony export */   glob: () => (/* binding */ glob),
/* harmony export */   globIterate: () => (/* binding */ globIterate),
/* harmony export */   globIterateSync: () => (/* binding */ globIterateSync),
/* harmony export */   globStream: () => (/* binding */ globStream),
/* harmony export */   globStreamSync: () => (/* binding */ globStreamSync),
/* harmony export */   globSync: () => (/* binding */ globSync),
/* harmony export */   hasMagic: () => (/* reexport safe */ _has_magic_js__WEBPACK_IMPORTED_MODULE_2__.hasMagic),
/* harmony export */   iterate: () => (/* binding */ iterate),
/* harmony export */   iterateSync: () => (/* binding */ iterateSync),
/* harmony export */   stream: () => (/* binding */ stream),
/* harmony export */   streamSync: () => (/* binding */ streamSync),
/* harmony export */   sync: () => (/* binding */ sync),
/* harmony export */   unescape: () => (/* reexport safe */ minimatch__WEBPACK_IMPORTED_MODULE_0__.unescape)
/* harmony export */ });
/* harmony import */ var minimatch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! minimatch */ "./node_modules/glob/node_modules/minimatch/dist/esm/index.js");
/* harmony import */ var _glob_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./glob.js */ "./node_modules/glob/dist/esm/glob.js");
/* harmony import */ var _has_magic_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./has-magic.js */ "./node_modules/glob/dist/esm/has-magic.js");
/* harmony import */ var _ignore_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ignore.js */ "./node_modules/glob/dist/esm/ignore.js");







function globStreamSync(pattern, options = {}) {
    return new _glob_js__WEBPACK_IMPORTED_MODULE_1__.Glob(pattern, options).streamSync();
}
function globStream(pattern, options = {}) {
    return new _glob_js__WEBPACK_IMPORTED_MODULE_1__.Glob(pattern, options).stream();
}
function globSync(pattern, options = {}) {
    return new _glob_js__WEBPACK_IMPORTED_MODULE_1__.Glob(pattern, options).walkSync();
}
async function glob_(pattern, options = {}) {
    return new _glob_js__WEBPACK_IMPORTED_MODULE_1__.Glob(pattern, options).walk();
}
function globIterateSync(pattern, options = {}) {
    return new _glob_js__WEBPACK_IMPORTED_MODULE_1__.Glob(pattern, options).iterateSync();
}
function globIterate(pattern, options = {}) {
    return new _glob_js__WEBPACK_IMPORTED_MODULE_1__.Glob(pattern, options).iterate();
}
// aliases: glob.sync.stream() glob.stream.sync() glob.sync() etc
const streamSync = globStreamSync;
const stream = Object.assign(globStream, { sync: globStreamSync });
const iterateSync = globIterateSync;
const iterate = Object.assign(globIterate, {
    sync: globIterateSync,
});
const sync = Object.assign(globSync, {
    stream: globStreamSync,
    iterate: globIterateSync,
});
const glob = Object.assign(glob_, {
    glob: glob_,
    globSync,
    sync,
    globStream,
    stream,
    globStreamSync,
    streamSync,
    globIterate,
    iterate,
    globIterateSync,
    iterateSync,
    Glob: _glob_js__WEBPACK_IMPORTED_MODULE_1__.Glob,
    hasMagic: _has_magic_js__WEBPACK_IMPORTED_MODULE_2__.hasMagic,
    escape: minimatch__WEBPACK_IMPORTED_MODULE_0__.escape,
    unescape: minimatch__WEBPACK_IMPORTED_MODULE_0__.unescape,
});
glob.glob = glob;
//# sourceMappingURL=index.js.map

/***/ },

/***/ "./node_modules/glob/dist/esm/pattern.js"
/*!***********************************************!*\
  !*** ./node_modules/glob/dist/esm/pattern.js ***!
  \***********************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Pattern: () => (/* binding */ Pattern)
/* harmony export */ });
/* harmony import */ var minimatch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! minimatch */ "./node_modules/glob/node_modules/minimatch/dist/esm/index.js");
// this is just a very light wrapper around 2 arrays with an offset index

const isPatternList = (pl) => pl.length >= 1;
const isGlobList = (gl) => gl.length >= 1;
/**
 * An immutable-ish view on an array of glob parts and their parsed
 * results
 */
class Pattern {
    #patternList;
    #globList;
    #index;
    length;
    #platform;
    #rest;
    #globString;
    #isDrive;
    #isUNC;
    #isAbsolute;
    #followGlobstar = true;
    constructor(patternList, globList, index, platform) {
        if (!isPatternList(patternList)) {
            throw new TypeError('empty pattern list');
        }
        if (!isGlobList(globList)) {
            throw new TypeError('empty glob list');
        }
        if (globList.length !== patternList.length) {
            throw new TypeError('mismatched pattern list and glob list lengths');
        }
        this.length = patternList.length;
        if (index < 0 || index >= this.length) {
            throw new TypeError('index out of range');
        }
        this.#patternList = patternList;
        this.#globList = globList;
        this.#index = index;
        this.#platform = platform;
        // normalize root entries of absolute patterns on initial creation.
        if (this.#index === 0) {
            // c: => ['c:/']
            // C:/ => ['C:/']
            // C:/x => ['C:/', 'x']
            // //host/share => ['//host/share/']
            // //host/share/ => ['//host/share/']
            // //host/share/x => ['//host/share/', 'x']
            // /etc => ['/', 'etc']
            // / => ['/']
            if (this.isUNC()) {
                // '' / '' / 'host' / 'share'
                const [p0, p1, p2, p3, ...prest] = this.#patternList;
                const [g0, g1, g2, g3, ...grest] = this.#globList;
                if (prest[0] === '') {
                    // ends in /
                    prest.shift();
                    grest.shift();
                }
                const p = [p0, p1, p2, p3, ''].join('/');
                const g = [g0, g1, g2, g3, ''].join('/');
                this.#patternList = [p, ...prest];
                this.#globList = [g, ...grest];
                this.length = this.#patternList.length;
            }
            else if (this.isDrive() || this.isAbsolute()) {
                const [p1, ...prest] = this.#patternList;
                const [g1, ...grest] = this.#globList;
                if (prest[0] === '') {
                    // ends in /
                    prest.shift();
                    grest.shift();
                }
                const p = p1 + '/';
                const g = g1 + '/';
                this.#patternList = [p, ...prest];
                this.#globList = [g, ...grest];
                this.length = this.#patternList.length;
            }
        }
    }
    /**
     * The first entry in the parsed list of patterns
     */
    pattern() {
        return this.#patternList[this.#index];
    }
    /**
     * true of if pattern() returns a string
     */
    isString() {
        return typeof this.#patternList[this.#index] === 'string';
    }
    /**
     * true of if pattern() returns GLOBSTAR
     */
    isGlobstar() {
        return this.#patternList[this.#index] === minimatch__WEBPACK_IMPORTED_MODULE_0__.GLOBSTAR;
    }
    /**
     * true if pattern() returns a regexp
     */
    isRegExp() {
        return this.#patternList[this.#index] instanceof RegExp;
    }
    /**
     * The /-joined set of glob parts that make up this pattern
     */
    globString() {
        return (this.#globString =
            this.#globString ||
                (this.#index === 0 ?
                    this.isAbsolute() ?
                        this.#globList[0] + this.#globList.slice(1).join('/')
                        : this.#globList.join('/')
                    : this.#globList.slice(this.#index).join('/')));
    }
    /**
     * true if there are more pattern parts after this one
     */
    hasMore() {
        return this.length > this.#index + 1;
    }
    /**
     * The rest of the pattern after this part, or null if this is the end
     */
    rest() {
        if (this.#rest !== undefined)
            return this.#rest;
        if (!this.hasMore())
            return (this.#rest = null);
        this.#rest = new Pattern(this.#patternList, this.#globList, this.#index + 1, this.#platform);
        this.#rest.#isAbsolute = this.#isAbsolute;
        this.#rest.#isUNC = this.#isUNC;
        this.#rest.#isDrive = this.#isDrive;
        return this.#rest;
    }
    /**
     * true if the pattern represents a //unc/path/ on windows
     */
    isUNC() {
        const pl = this.#patternList;
        return this.#isUNC !== undefined ?
            this.#isUNC
            : (this.#isUNC =
                this.#platform === 'win32' &&
                    this.#index === 0 &&
                    pl[0] === '' &&
                    pl[1] === '' &&
                    typeof pl[2] === 'string' &&
                    !!pl[2] &&
                    typeof pl[3] === 'string' &&
                    !!pl[3]);
    }
    // pattern like C:/...
    // split = ['C:', ...]
    // XXX: would be nice to handle patterns like `c:*` to test the cwd
    // in c: for *, but I don't know of a way to even figure out what that
    // cwd is without actually chdir'ing into it?
    /**
     * True if the pattern starts with a drive letter on Windows
     */
    isDrive() {
        const pl = this.#patternList;
        return this.#isDrive !== undefined ?
            this.#isDrive
            : (this.#isDrive =
                this.#platform === 'win32' &&
                    this.#index === 0 &&
                    this.length > 1 &&
                    typeof pl[0] === 'string' &&
                    /^[a-z]:$/i.test(pl[0]));
    }
    // pattern = '/' or '/...' or '/x/...'
    // split = ['', ''] or ['', ...] or ['', 'x', ...]
    // Drive and UNC both considered absolute on windows
    /**
     * True if the pattern is rooted on an absolute path
     */
    isAbsolute() {
        const pl = this.#patternList;
        return this.#isAbsolute !== undefined ?
            this.#isAbsolute
            : (this.#isAbsolute =
                (pl[0] === '' && pl.length > 1) ||
                    this.isDrive() ||
                    this.isUNC());
    }
    /**
     * consume the root of the pattern, and return it
     */
    root() {
        const p = this.#patternList[0];
        return (typeof p === 'string' && this.isAbsolute() && this.#index === 0) ?
            p
            : '';
    }
    /**
     * Check to see if the current globstar pattern is allowed to follow
     * a symbolic link.
     */
    checkFollowGlobstar() {
        return !(this.#index === 0 ||
            !this.isGlobstar() ||
            !this.#followGlobstar);
    }
    /**
     * Mark that the current globstar pattern is following a symbolic link
     */
    markFollowGlobstar() {
        if (this.#index === 0 || !this.isGlobstar() || !this.#followGlobstar)
            return false;
        this.#followGlobstar = false;
        return true;
    }
}
//# sourceMappingURL=pattern.js.map

/***/ },

/***/ "./node_modules/glob/dist/esm/processor.js"
/*!*************************************************!*\
  !*** ./node_modules/glob/dist/esm/processor.js ***!
  \*************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HasWalkedCache: () => (/* binding */ HasWalkedCache),
/* harmony export */   MatchRecord: () => (/* binding */ MatchRecord),
/* harmony export */   Processor: () => (/* binding */ Processor),
/* harmony export */   SubWalks: () => (/* binding */ SubWalks)
/* harmony export */ });
/* harmony import */ var minimatch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! minimatch */ "./node_modules/glob/node_modules/minimatch/dist/esm/index.js");
// synchronous utility for filtering entries and calculating subwalks

/**
 * A cache of which patterns have been processed for a given Path
 */
class HasWalkedCache {
    store;
    constructor(store = new Map()) {
        this.store = store;
    }
    copy() {
        return new HasWalkedCache(new Map(this.store));
    }
    hasWalked(target, pattern) {
        return this.store.get(target.fullpath())?.has(pattern.globString());
    }
    storeWalked(target, pattern) {
        const fullpath = target.fullpath();
        const cached = this.store.get(fullpath);
        if (cached)
            cached.add(pattern.globString());
        else
            this.store.set(fullpath, new Set([pattern.globString()]));
    }
}
/**
 * A record of which paths have been matched in a given walk step,
 * and whether they only are considered a match if they are a directory,
 * and whether their absolute or relative path should be returned.
 */
class MatchRecord {
    store = new Map();
    add(target, absolute, ifDir) {
        const n = (absolute ? 2 : 0) | (ifDir ? 1 : 0);
        const current = this.store.get(target);
        this.store.set(target, current === undefined ? n : n & current);
    }
    // match, absolute, ifdir
    entries() {
        return [...this.store.entries()].map(([path, n]) => [
            path,
            !!(n & 2),
            !!(n & 1),
        ]);
    }
}
/**
 * A collection of patterns that must be processed in a subsequent step
 * for a given path.
 */
class SubWalks {
    store = new Map();
    add(target, pattern) {
        if (!target.canReaddir()) {
            return;
        }
        const subs = this.store.get(target);
        if (subs) {
            if (!subs.find(p => p.globString() === pattern.globString())) {
                subs.push(pattern);
            }
        }
        else
            this.store.set(target, [pattern]);
    }
    get(target) {
        const subs = this.store.get(target);
        /* c8 ignore start */
        if (!subs) {
            throw new Error('attempting to walk unknown path');
        }
        /* c8 ignore stop */
        return subs;
    }
    entries() {
        return this.keys().map(k => [k, this.store.get(k)]);
    }
    keys() {
        return [...this.store.keys()].filter(t => t.canReaddir());
    }
}
/**
 * The class that processes patterns for a given path.
 *
 * Handles child entry filtering, and determining whether a path's
 * directory contents must be read.
 */
class Processor {
    hasWalkedCache;
    matches = new MatchRecord();
    subwalks = new SubWalks();
    patterns;
    follow;
    dot;
    opts;
    constructor(opts, hasWalkedCache) {
        this.opts = opts;
        this.follow = !!opts.follow;
        this.dot = !!opts.dot;
        this.hasWalkedCache =
            hasWalkedCache ? hasWalkedCache.copy() : new HasWalkedCache();
    }
    processPatterns(target, patterns) {
        this.patterns = patterns;
        const processingSet = patterns.map(p => [target, p]);
        // map of paths to the magic-starting subwalks they need to walk
        // first item in patterns is the filter
        for (let [t, pattern] of processingSet) {
            this.hasWalkedCache.storeWalked(t, pattern);
            const root = pattern.root();
            const absolute = pattern.isAbsolute() && this.opts.absolute !== false;
            // start absolute patterns at root
            if (root) {
                t = t.resolve(root === '/' && this.opts.root !== undefined ?
                    this.opts.root
                    : root);
                const rest = pattern.rest();
                if (!rest) {
                    this.matches.add(t, true, false);
                    continue;
                }
                else {
                    pattern = rest;
                }
            }
            if (t.isENOENT())
                continue;
            let p;
            let rest;
            let changed = false;
            while (typeof (p = pattern.pattern()) === 'string' &&
                (rest = pattern.rest())) {
                const c = t.resolve(p);
                t = c;
                pattern = rest;
                changed = true;
            }
            p = pattern.pattern();
            rest = pattern.rest();
            if (changed) {
                if (this.hasWalkedCache.hasWalked(t, pattern))
                    continue;
                this.hasWalkedCache.storeWalked(t, pattern);
            }
            // now we have either a final string for a known entry,
            // more strings for an unknown entry,
            // or a pattern starting with magic, mounted on t.
            if (typeof p === 'string') {
                // must not be final entry, otherwise we would have
                // concatenated it earlier.
                const ifDir = p === '..' || p === '' || p === '.';
                this.matches.add(t.resolve(p), absolute, ifDir);
                continue;
            }
            else if (p === minimatch__WEBPACK_IMPORTED_MODULE_0__.GLOBSTAR) {
                // if no rest, match and subwalk pattern
                // if rest, process rest and subwalk pattern
                // if it's a symlink, but we didn't get here by way of a
                // globstar match (meaning it's the first time THIS globstar
                // has traversed a symlink), then we follow it. Otherwise, stop.
                if (!t.isSymbolicLink() ||
                    this.follow ||
                    pattern.checkFollowGlobstar()) {
                    this.subwalks.add(t, pattern);
                }
                const rp = rest?.pattern();
                const rrest = rest?.rest();
                if (!rest || ((rp === '' || rp === '.') && !rrest)) {
                    // only HAS to be a dir if it ends in **/ or **/.
                    // but ending in ** will match files as well.
                    this.matches.add(t, absolute, rp === '' || rp === '.');
                }
                else {
                    if (rp === '..') {
                        // this would mean you're matching **/.. at the fs root,
                        // and no thanks, I'm not gonna test that specific case.
                        /* c8 ignore start */
                        const tp = t.parent || t;
                        /* c8 ignore stop */
                        if (!rrest)
                            this.matches.add(tp, absolute, true);
                        else if (!this.hasWalkedCache.hasWalked(tp, rrest)) {
                            this.subwalks.add(tp, rrest);
                        }
                    }
                }
            }
            else if (p instanceof RegExp) {
                this.subwalks.add(t, pattern);
            }
        }
        return this;
    }
    subwalkTargets() {
        return this.subwalks.keys();
    }
    child() {
        return new Processor(this.opts, this.hasWalkedCache);
    }
    // return a new Processor containing the subwalks for each
    // child entry, and a set of matches, and
    // a hasWalkedCache that's a copy of this one
    // then we're going to call
    filterEntries(parent, entries) {
        const patterns = this.subwalks.get(parent);
        // put matches and entry walks into the results processor
        const results = this.child();
        for (const e of entries) {
            for (const pattern of patterns) {
                const absolute = pattern.isAbsolute();
                const p = pattern.pattern();
                const rest = pattern.rest();
                if (p === minimatch__WEBPACK_IMPORTED_MODULE_0__.GLOBSTAR) {
                    results.testGlobstar(e, pattern, rest, absolute);
                }
                else if (p instanceof RegExp) {
                    results.testRegExp(e, p, rest, absolute);
                }
                else {
                    results.testString(e, p, rest, absolute);
                }
            }
        }
        return results;
    }
    testGlobstar(e, pattern, rest, absolute) {
        if (this.dot || !e.name.startsWith('.')) {
            if (!pattern.hasMore()) {
                this.matches.add(e, absolute, false);
            }
            if (e.canReaddir()) {
                // if we're in follow mode or it's not a symlink, just keep
                // testing the same pattern. If there's more after the globstar,
                // then this symlink consumes the globstar. If not, then we can
                // follow at most ONE symlink along the way, so we mark it, which
                // also checks to ensure that it wasn't already marked.
                if (this.follow || !e.isSymbolicLink()) {
                    this.subwalks.add(e, pattern);
                }
                else if (e.isSymbolicLink()) {
                    if (rest && pattern.checkFollowGlobstar()) {
                        this.subwalks.add(e, rest);
                    }
                    else if (pattern.markFollowGlobstar()) {
                        this.subwalks.add(e, pattern);
                    }
                }
            }
        }
        // if the NEXT thing matches this entry, then also add
        // the rest.
        if (rest) {
            const rp = rest.pattern();
            if (typeof rp === 'string' &&
                // dots and empty were handled already
                rp !== '..' &&
                rp !== '' &&
                rp !== '.') {
                this.testString(e, rp, rest.rest(), absolute);
            }
            else if (rp === '..') {
                /* c8 ignore start */
                const ep = e.parent || e;
                /* c8 ignore stop */
                this.subwalks.add(ep, rest);
            }
            else if (rp instanceof RegExp) {
                this.testRegExp(e, rp, rest.rest(), absolute);
            }
        }
    }
    testRegExp(e, p, rest, absolute) {
        if (!p.test(e.name))
            return;
        if (!rest) {
            this.matches.add(e, absolute, false);
        }
        else {
            this.subwalks.add(e, rest);
        }
    }
    testString(e, p, rest, absolute) {
        // should never happen?
        if (!e.isNamed(p))
            return;
        if (!rest) {
            this.matches.add(e, absolute, false);
        }
        else {
            this.subwalks.add(e, rest);
        }
    }
}
//# sourceMappingURL=processor.js.map

/***/ },

/***/ "./node_modules/glob/dist/esm/walker.js"
/*!**********************************************!*\
  !*** ./node_modules/glob/dist/esm/walker.js ***!
  \**********************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GlobStream: () => (/* binding */ GlobStream),
/* harmony export */   GlobUtil: () => (/* binding */ GlobUtil),
/* harmony export */   GlobWalker: () => (/* binding */ GlobWalker)
/* harmony export */ });
/* harmony import */ var minipass__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! minipass */ "./node_modules/minipass/dist/esm/index.js");
/* harmony import */ var _ignore_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ignore.js */ "./node_modules/glob/dist/esm/ignore.js");
/* harmony import */ var _processor_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./processor.js */ "./node_modules/glob/dist/esm/processor.js");
/**
 * Single-use utility classes to provide functionality to the {@link Glob}
 * methods.
 *
 * @module
 */



const makeIgnore = (ignore, opts) => typeof ignore === 'string' ? new _ignore_js__WEBPACK_IMPORTED_MODULE_1__.Ignore([ignore], opts)
    : Array.isArray(ignore) ? new _ignore_js__WEBPACK_IMPORTED_MODULE_1__.Ignore(ignore, opts)
        : ignore;
/**
 * basic walking utilities that all the glob walker types use
 */
class GlobUtil {
    path;
    patterns;
    opts;
    seen = new Set();
    paused = false;
    aborted = false;
    #onResume = [];
    #ignore;
    #sep;
    signal;
    maxDepth;
    includeChildMatches;
    constructor(patterns, path, opts) {
        this.patterns = patterns;
        this.path = path;
        this.opts = opts;
        this.#sep = !opts.posix && opts.platform === 'win32' ? '\\' : '/';
        this.includeChildMatches = opts.includeChildMatches !== false;
        if (opts.ignore || !this.includeChildMatches) {
            this.#ignore = makeIgnore(opts.ignore ?? [], opts);
            if (!this.includeChildMatches &&
                typeof this.#ignore.add !== 'function') {
                const m = 'cannot ignore child matches, ignore lacks add() method.';
                throw new Error(m);
            }
        }
        // ignore, always set with maxDepth, but it's optional on the
        // GlobOptions type
        /* c8 ignore start */
        this.maxDepth = opts.maxDepth || Infinity;
        /* c8 ignore stop */
        if (opts.signal) {
            this.signal = opts.signal;
            this.signal.addEventListener('abort', () => {
                this.#onResume.length = 0;
            });
        }
    }
    #ignored(path) {
        return this.seen.has(path) || !!this.#ignore?.ignored?.(path);
    }
    #childrenIgnored(path) {
        return !!this.#ignore?.childrenIgnored?.(path);
    }
    // backpressure mechanism
    pause() {
        this.paused = true;
    }
    resume() {
        /* c8 ignore start */
        if (this.signal?.aborted)
            return;
        /* c8 ignore stop */
        this.paused = false;
        let fn = undefined;
        while (!this.paused && (fn = this.#onResume.shift())) {
            fn();
        }
    }
    onResume(fn) {
        if (this.signal?.aborted)
            return;
        /* c8 ignore start */
        if (!this.paused) {
            fn();
        }
        else {
            /* c8 ignore stop */
            this.#onResume.push(fn);
        }
    }
    // do the requisite realpath/stat checking, and return the path
    // to add or undefined to filter it out.
    async matchCheck(e, ifDir) {
        if (ifDir && this.opts.nodir)
            return undefined;
        let rpc;
        if (this.opts.realpath) {
            rpc = e.realpathCached() || (await e.realpath());
            if (!rpc)
                return undefined;
            e = rpc;
        }
        const needStat = e.isUnknown() || this.opts.stat;
        const s = needStat ? await e.lstat() : e;
        if (this.opts.follow && this.opts.nodir && s?.isSymbolicLink()) {
            const target = await s.realpath();
            /* c8 ignore start */
            if (target && (target.isUnknown() || this.opts.stat)) {
                await target.lstat();
            }
            /* c8 ignore stop */
        }
        return this.matchCheckTest(s, ifDir);
    }
    matchCheckTest(e, ifDir) {
        return (e &&
            (this.maxDepth === Infinity || e.depth() <= this.maxDepth) &&
            (!ifDir || e.canReaddir()) &&
            (!this.opts.nodir || !e.isDirectory()) &&
            (!this.opts.nodir ||
                !this.opts.follow ||
                !e.isSymbolicLink() ||
                !e.realpathCached()?.isDirectory()) &&
            !this.#ignored(e)) ?
            e
            : undefined;
    }
    matchCheckSync(e, ifDir) {
        if (ifDir && this.opts.nodir)
            return undefined;
        let rpc;
        if (this.opts.realpath) {
            rpc = e.realpathCached() || e.realpathSync();
            if (!rpc)
                return undefined;
            e = rpc;
        }
        const needStat = e.isUnknown() || this.opts.stat;
        const s = needStat ? e.lstatSync() : e;
        if (this.opts.follow && this.opts.nodir && s?.isSymbolicLink()) {
            const target = s.realpathSync();
            if (target && (target?.isUnknown() || this.opts.stat)) {
                target.lstatSync();
            }
        }
        return this.matchCheckTest(s, ifDir);
    }
    matchFinish(e, absolute) {
        if (this.#ignored(e))
            return;
        // we know we have an ignore if this is false, but TS doesn't
        if (!this.includeChildMatches && this.#ignore?.add) {
            const ign = `${e.relativePosix()}/**`;
            this.#ignore.add(ign);
        }
        const abs = this.opts.absolute === undefined ? absolute : this.opts.absolute;
        this.seen.add(e);
        const mark = this.opts.mark && e.isDirectory() ? this.#sep : '';
        // ok, we have what we need!
        if (this.opts.withFileTypes) {
            this.matchEmit(e);
        }
        else if (abs) {
            const abs = this.opts.posix ? e.fullpathPosix() : e.fullpath();
            this.matchEmit(abs + mark);
        }
        else {
            const rel = this.opts.posix ? e.relativePosix() : e.relative();
            const pre = this.opts.dotRelative && !rel.startsWith('..' + this.#sep) ?
                '.' + this.#sep
                : '';
            this.matchEmit(!rel ? '.' + mark : pre + rel + mark);
        }
    }
    async match(e, absolute, ifDir) {
        const p = await this.matchCheck(e, ifDir);
        if (p)
            this.matchFinish(p, absolute);
    }
    matchSync(e, absolute, ifDir) {
        const p = this.matchCheckSync(e, ifDir);
        if (p)
            this.matchFinish(p, absolute);
    }
    walkCB(target, patterns, cb) {
        /* c8 ignore start */
        if (this.signal?.aborted)
            cb();
        /* c8 ignore stop */
        this.walkCB2(target, patterns, new _processor_js__WEBPACK_IMPORTED_MODULE_2__.Processor(this.opts), cb);
    }
    walkCB2(target, patterns, processor, cb) {
        if (this.#childrenIgnored(target))
            return cb();
        if (this.signal?.aborted)
            cb();
        if (this.paused) {
            this.onResume(() => this.walkCB2(target, patterns, processor, cb));
            return;
        }
        processor.processPatterns(target, patterns);
        // done processing.  all of the above is sync, can be abstracted out.
        // subwalks is a map of paths to the entry filters they need
        // matches is a map of paths to [absolute, ifDir] tuples.
        let tasks = 1;
        const next = () => {
            if (--tasks === 0)
                cb();
        };
        for (const [m, absolute, ifDir] of processor.matches.entries()) {
            if (this.#ignored(m))
                continue;
            tasks++;
            this.match(m, absolute, ifDir).then(() => next());
        }
        for (const t of processor.subwalkTargets()) {
            if (this.maxDepth !== Infinity && t.depth() >= this.maxDepth) {
                continue;
            }
            tasks++;
            const childrenCached = t.readdirCached();
            if (t.calledReaddir())
                this.walkCB3(t, childrenCached, processor, next);
            else {
                t.readdirCB((_, entries) => this.walkCB3(t, entries, processor, next), true);
            }
        }
        next();
    }
    walkCB3(target, entries, processor, cb) {
        processor = processor.filterEntries(target, entries);
        let tasks = 1;
        const next = () => {
            if (--tasks === 0)
                cb();
        };
        for (const [m, absolute, ifDir] of processor.matches.entries()) {
            if (this.#ignored(m))
                continue;
            tasks++;
            this.match(m, absolute, ifDir).then(() => next());
        }
        for (const [target, patterns] of processor.subwalks.entries()) {
            tasks++;
            this.walkCB2(target, patterns, processor.child(), next);
        }
        next();
    }
    walkCBSync(target, patterns, cb) {
        /* c8 ignore start */
        if (this.signal?.aborted)
            cb();
        /* c8 ignore stop */
        this.walkCB2Sync(target, patterns, new _processor_js__WEBPACK_IMPORTED_MODULE_2__.Processor(this.opts), cb);
    }
    walkCB2Sync(target, patterns, processor, cb) {
        if (this.#childrenIgnored(target))
            return cb();
        if (this.signal?.aborted)
            cb();
        if (this.paused) {
            this.onResume(() => this.walkCB2Sync(target, patterns, processor, cb));
            return;
        }
        processor.processPatterns(target, patterns);
        // done processing.  all of the above is sync, can be abstracted out.
        // subwalks is a map of paths to the entry filters they need
        // matches is a map of paths to [absolute, ifDir] tuples.
        let tasks = 1;
        const next = () => {
            if (--tasks === 0)
                cb();
        };
        for (const [m, absolute, ifDir] of processor.matches.entries()) {
            if (this.#ignored(m))
                continue;
            this.matchSync(m, absolute, ifDir);
        }
        for (const t of processor.subwalkTargets()) {
            if (this.maxDepth !== Infinity && t.depth() >= this.maxDepth) {
                continue;
            }
            tasks++;
            const children = t.readdirSync();
            this.walkCB3Sync(t, children, processor, next);
        }
        next();
    }
    walkCB3Sync(target, entries, processor, cb) {
        processor = processor.filterEntries(target, entries);
        let tasks = 1;
        const next = () => {
            if (--tasks === 0)
                cb();
        };
        for (const [m, absolute, ifDir] of processor.matches.entries()) {
            if (this.#ignored(m))
                continue;
            this.matchSync(m, absolute, ifDir);
        }
        for (const [target, patterns] of processor.subwalks.entries()) {
            tasks++;
            this.walkCB2Sync(target, patterns, processor.child(), next);
        }
        next();
    }
}
class GlobWalker extends GlobUtil {
    matches = new Set();
    constructor(patterns, path, opts) {
        super(patterns, path, opts);
    }
    matchEmit(e) {
        this.matches.add(e);
    }
    async walk() {
        if (this.signal?.aborted)
            throw this.signal.reason;
        if (this.path.isUnknown()) {
            await this.path.lstat();
        }
        await new Promise((res, rej) => {
            this.walkCB(this.path, this.patterns, () => {
                if (this.signal?.aborted) {
                    rej(this.signal.reason);
                }
                else {
                    res(this.matches);
                }
            });
        });
        return this.matches;
    }
    walkSync() {
        if (this.signal?.aborted)
            throw this.signal.reason;
        if (this.path.isUnknown()) {
            this.path.lstatSync();
        }
        // nothing for the callback to do, because this never pauses
        this.walkCBSync(this.path, this.patterns, () => {
            if (this.signal?.aborted)
                throw this.signal.reason;
        });
        return this.matches;
    }
}
class GlobStream extends GlobUtil {
    results;
    constructor(patterns, path, opts) {
        super(patterns, path, opts);
        this.results = new minipass__WEBPACK_IMPORTED_MODULE_0__.Minipass({
            signal: this.signal,
            objectMode: true,
        });
        this.results.on('drain', () => this.resume());
        this.results.on('resume', () => this.resume());
    }
    matchEmit(e) {
        this.results.write(e);
        if (!this.results.flowing)
            this.pause();
    }
    stream() {
        const target = this.path;
        if (target.isUnknown()) {
            target.lstat().then(() => {
                this.walkCB(target, this.patterns, () => this.results.end());
            });
        }
        else {
            this.walkCB(target, this.patterns, () => this.results.end());
        }
        return this.results;
    }
    streamSync() {
        if (this.path.isUnknown()) {
            this.path.lstatSync();
        }
        this.walkCBSync(this.path, this.patterns, () => this.results.end());
        return this.results;
    }
}
//# sourceMappingURL=walker.js.map

/***/ },

/***/ "./node_modules/glob/node_modules/balanced-match/dist/esm/index.js"
/*!*************************************************************************!*\
  !*** ./node_modules/glob/node_modules/balanced-match/dist/esm/index.js ***!
  \*************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   balanced: () => (/* binding */ balanced),
/* harmony export */   range: () => (/* binding */ range)
/* harmony export */ });
const balanced = (a, b, str) => {
    const ma = a instanceof RegExp ? maybeMatch(a, str) : a;
    const mb = b instanceof RegExp ? maybeMatch(b, str) : b;
    const r = ma !== null && mb != null && range(ma, mb, str);
    return (r && {
        start: r[0],
        end: r[1],
        pre: str.slice(0, r[0]),
        body: str.slice(r[0] + ma.length, r[1]),
        post: str.slice(r[1] + mb.length),
    });
};
const maybeMatch = (reg, str) => {
    const m = str.match(reg);
    return m ? m[0] : null;
};
const range = (a, b, str) => {
    let begs, beg, left, right = undefined, result;
    let ai = str.indexOf(a);
    let bi = str.indexOf(b, ai + 1);
    let i = ai;
    if (ai >= 0 && bi > 0) {
        if (a === b) {
            return [ai, bi];
        }
        begs = [];
        left = str.length;
        while (i >= 0 && !result) {
            if (i === ai) {
                begs.push(i);
                ai = str.indexOf(a, i + 1);
            }
            else if (begs.length === 1) {
                const r = begs.pop();
                if (r !== undefined)
                    result = [r, bi];
            }
            else {
                beg = begs.pop();
                if (beg !== undefined && beg < left) {
                    left = beg;
                    right = bi;
                }
                bi = str.indexOf(b, i + 1);
            }
            i = ai < bi && ai >= 0 ? ai : bi;
        }
        if (begs.length && right !== undefined) {
            result = [left, right];
        }
    }
    return result;
};
//# sourceMappingURL=index.js.map

/***/ },

/***/ "./node_modules/glob/node_modules/brace-expansion/dist/esm/index.js"
/*!**************************************************************************!*\
  !*** ./node_modules/glob/node_modules/brace-expansion/dist/esm/index.js ***!
  \**************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EXPANSION_MAX: () => (/* binding */ EXPANSION_MAX),
/* harmony export */   expand: () => (/* binding */ expand)
/* harmony export */ });
/* harmony import */ var balanced_match__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! balanced-match */ "./node_modules/glob/node_modules/balanced-match/dist/esm/index.js");

const escSlash = '\0SLASH' + Math.random() + '\0';
const escOpen = '\0OPEN' + Math.random() + '\0';
const escClose = '\0CLOSE' + Math.random() + '\0';
const escComma = '\0COMMA' + Math.random() + '\0';
const escPeriod = '\0PERIOD' + Math.random() + '\0';
const escSlashPattern = new RegExp(escSlash, 'g');
const escOpenPattern = new RegExp(escOpen, 'g');
const escClosePattern = new RegExp(escClose, 'g');
const escCommaPattern = new RegExp(escComma, 'g');
const escPeriodPattern = new RegExp(escPeriod, 'g');
const slashPattern = /\\\\/g;
const openPattern = /\\{/g;
const closePattern = /\\}/g;
const commaPattern = /\\,/g;
const periodPattern = /\\\./g;
const EXPANSION_MAX = 100_000;
function numeric(str) {
    return !isNaN(str) ? parseInt(str, 10) : str.charCodeAt(0);
}
function escapeBraces(str) {
    return str
        .replace(slashPattern, escSlash)
        .replace(openPattern, escOpen)
        .replace(closePattern, escClose)
        .replace(commaPattern, escComma)
        .replace(periodPattern, escPeriod);
}
function unescapeBraces(str) {
    return str
        .replace(escSlashPattern, '\\')
        .replace(escOpenPattern, '{')
        .replace(escClosePattern, '}')
        .replace(escCommaPattern, ',')
        .replace(escPeriodPattern, '.');
}
/**
 * Basically just str.split(","), but handling cases
 * where we have nested braced sections, which should be
 * treated as individual members, like {a,{b,c},d}
 */
function parseCommaParts(str) {
    if (!str) {
        return [''];
    }
    const parts = [];
    const m = (0,balanced_match__WEBPACK_IMPORTED_MODULE_0__.balanced)('{', '}', str);
    if (!m) {
        return str.split(',');
    }
    const { pre, body, post } = m;
    const p = pre.split(',');
    p[p.length - 1] += '{' + body + '}';
    const postParts = parseCommaParts(post);
    if (post.length) {
        ;
        p[p.length - 1] += postParts.shift();
        p.push.apply(p, postParts);
    }
    parts.push.apply(parts, p);
    return parts;
}
function expand(str, options = {}) {
    if (!str) {
        return [];
    }
    const { max = EXPANSION_MAX } = options;
    // I don't know why Bash 4.3 does this, but it does.
    // Anything starting with {} will have the first two bytes preserved
    // but *only* at the top level, so {},a}b will not expand to anything,
    // but a{},b}c will be expanded to [a}c,abc].
    // One could argue that this is a bug in Bash, but since the goal of
    // this module is to match Bash's rules, we escape a leading {}
    if (str.slice(0, 2) === '{}') {
        str = '\\{\\}' + str.slice(2);
    }
    return expand_(escapeBraces(str), max, true).map(unescapeBraces);
}
function embrace(str) {
    return '{' + str + '}';
}
function isPadded(el) {
    return /^-?0\d/.test(el);
}
function lte(i, y) {
    return i <= y;
}
function gte(i, y) {
    return i >= y;
}
function expand_(str, max, isTop) {
    /** @type {string[]} */
    const expansions = [];
    const m = (0,balanced_match__WEBPACK_IMPORTED_MODULE_0__.balanced)('{', '}', str);
    if (!m)
        return [str];
    // no need to expand pre, since it is guaranteed to be free of brace-sets
    const pre = m.pre;
    const post = m.post.length ? expand_(m.post, max, false) : [''];
    if (/\$$/.test(m.pre)) {
        for (let k = 0; k < post.length && k < max; k++) {
            const expansion = pre + '{' + m.body + '}' + post[k];
            expansions.push(expansion);
        }
    }
    else {
        const isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
        const isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
        const isSequence = isNumericSequence || isAlphaSequence;
        const isOptions = m.body.indexOf(',') >= 0;
        if (!isSequence && !isOptions) {
            // {a},b}
            if (m.post.match(/,(?!,).*\}/)) {
                str = m.pre + '{' + m.body + escClose + m.post;
                return expand_(str, max, true);
            }
            return [str];
        }
        let n;
        if (isSequence) {
            n = m.body.split(/\.\./);
        }
        else {
            n = parseCommaParts(m.body);
            if (n.length === 1 && n[0] !== undefined) {
                // x{{a,b}}y ==> x{a}y x{b}y
                n = expand_(n[0], max, false).map(embrace);
                //XXX is this necessary? Can't seem to hit it in tests.
                /* c8 ignore start */
                if (n.length === 1) {
                    return post.map(p => m.pre + n[0] + p);
                }
                /* c8 ignore stop */
            }
        }
        // at this point, n is the parts, and we know it's not a comma set
        // with a single entry.
        let N;
        if (isSequence && n[0] !== undefined && n[1] !== undefined) {
            const x = numeric(n[0]);
            const y = numeric(n[1]);
            const width = Math.max(n[0].length, n[1].length);
            let incr = n.length === 3 && n[2] !== undefined ?
                Math.max(Math.abs(numeric(n[2])), 1)
                : 1;
            let test = lte;
            const reverse = y < x;
            if (reverse) {
                incr *= -1;
                test = gte;
            }
            const pad = n.some(isPadded);
            N = [];
            for (let i = x; test(i, y) && N.length < max; i += incr) {
                let c;
                if (isAlphaSequence) {
                    c = String.fromCharCode(i);
                    if (c === '\\') {
                        c = '';
                    }
                }
                else {
                    c = String(i);
                    if (pad) {
                        const need = width - c.length;
                        if (need > 0) {
                            const z = new Array(need + 1).join('0');
                            if (i < 0) {
                                c = '-' + z + c.slice(1);
                            }
                            else {
                                c = z + c;
                            }
                        }
                    }
                }
                N.push(c);
            }
        }
        else {
            N = [];
            for (let j = 0; j < n.length; j++) {
                N.push.apply(N, expand_(n[j], max, false));
            }
        }
        for (let j = 0; j < N.length; j++) {
            for (let k = 0; k < post.length && expansions.length < max; k++) {
                const expansion = pre + N[j] + post[k];
                if (!isTop || isSequence || expansion) {
                    expansions.push(expansion);
                }
            }
        }
    }
    return expansions;
}
//# sourceMappingURL=index.js.map

/***/ },

/***/ "./node_modules/glob/node_modules/minimatch/dist/esm/assert-valid-pattern.js"
/*!***********************************************************************************!*\
  !*** ./node_modules/glob/node_modules/minimatch/dist/esm/assert-valid-pattern.js ***!
  \***********************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   assertValidPattern: () => (/* binding */ assertValidPattern)
/* harmony export */ });
const MAX_PATTERN_LENGTH = 1024 * 64;
const assertValidPattern = (pattern) => {
    if (typeof pattern !== 'string') {
        throw new TypeError('invalid pattern');
    }
    if (pattern.length > MAX_PATTERN_LENGTH) {
        throw new TypeError('pattern is too long');
    }
};
//# sourceMappingURL=assert-valid-pattern.js.map

/***/ },

/***/ "./node_modules/glob/node_modules/minimatch/dist/esm/ast.js"
/*!******************************************************************!*\
  !*** ./node_modules/glob/node_modules/minimatch/dist/esm/ast.js ***!
  \******************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AST: () => (/* binding */ AST)
/* harmony export */ });
/* harmony import */ var _brace_expressions_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./brace-expressions.js */ "./node_modules/glob/node_modules/minimatch/dist/esm/brace-expressions.js");
/* harmony import */ var _unescape_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./unescape.js */ "./node_modules/glob/node_modules/minimatch/dist/esm/unescape.js");
// parse a single path portion
var _a;


const types = new Set(['!', '?', '+', '*', '@']);
const isExtglobType = (c) => types.has(c);
const isExtglobAST = (c) => isExtglobType(c.type);
// Map of which extglob types can adopt the children of a nested extglob
//
// anything but ! can adopt a matching type:
// +(a|+(b|c)|d) => +(a|b|c|d)
// *(a|*(b|c)|d) => *(a|b|c|d)
// @(a|@(b|c)|d) => @(a|b|c|d)
// ?(a|?(b|c)|d) => ?(a|b|c|d)
//
// * can adopt anything, because 0 or repetition is allowed
// *(a|?(b|c)|d) => *(a|b|c|d)
// *(a|+(b|c)|d) => *(a|b|c|d)
// *(a|@(b|c)|d) => *(a|b|c|d)
//
// + can adopt @, because 1 or repetition is allowed
// +(a|@(b|c)|d) => +(a|b|c|d)
//
// + and @ CANNOT adopt *, because 0 would be allowed
// +(a|*(b|c)|d) => would match "", on *(b|c)
// @(a|*(b|c)|d) => would match "", on *(b|c)
//
// + and @ CANNOT adopt ?, because 0 would be allowed
// +(a|?(b|c)|d) => would match "", on ?(b|c)
// @(a|?(b|c)|d) => would match "", on ?(b|c)
//
// ? can adopt @, because 0 or 1 is allowed
// ?(a|@(b|c)|d) => ?(a|b|c|d)
//
// ? and @ CANNOT adopt * or +, because >1 would be allowed
// ?(a|*(b|c)|d) => would match bbb on *(b|c)
// @(a|*(b|c)|d) => would match bbb on *(b|c)
// ?(a|+(b|c)|d) => would match bbb on +(b|c)
// @(a|+(b|c)|d) => would match bbb on +(b|c)
//
// ! CANNOT adopt ! (nothing else can either)
// !(a|!(b|c)|d) => !(a|b|c|d) would fail to match on b (not not b|c)
//
// ! can adopt @
// !(a|@(b|c)|d) => !(a|b|c|d)
//
// ! CANNOT adopt *
// !(a|*(b|c)|d) => !(a|b|c|d) would match on bbb, not allowed
//
// ! CANNOT adopt +
// !(a|+(b|c)|d) => !(a|b|c|d) would match on bbb, not allowed
//
// ! CANNOT adopt ?
// x!(a|?(b|c)|d) => x!(a|b|c|d) would fail to match "x"
const adoptionMap = new Map([
    ['!', ['@']],
    ['?', ['?', '@']],
    ['@', ['@']],
    ['*', ['*', '+', '?', '@']],
    ['+', ['+', '@']],
]);
// nested extglobs that can be adopted in, but with the addition of
// a blank '' element.
const adoptionWithSpaceMap = new Map([
    ['!', ['?']],
    ['@', ['?']],
    ['+', ['?', '*']],
]);
// union of the previous two maps
const adoptionAnyMap = new Map([
    ['!', ['?', '@']],
    ['?', ['?', '@']],
    ['@', ['?', '@']],
    ['*', ['*', '+', '?', '@']],
    ['+', ['+', '@', '?', '*']],
]);
// Extglobs that can take over their parent if they are the only child
// the key is parent, value maps child to resulting extglob parent type
// '@' is omitted because it's a special case. An `@` extglob with a single
// member can always be usurped by that subpattern.
const usurpMap = new Map([
    ['!', new Map([['!', '@']])],
    [
        '?',
        new Map([
            ['*', '*'],
            ['+', '*'],
        ]),
    ],
    [
        '@',
        new Map([
            ['!', '!'],
            ['?', '?'],
            ['@', '@'],
            ['*', '*'],
            ['+', '+'],
        ]),
    ],
    [
        '+',
        new Map([
            ['?', '*'],
            ['*', '*'],
        ]),
    ],
]);
// Patterns that get prepended to bind to the start of either the
// entire string, or just a single path portion, to prevent dots
// and/or traversal patterns, when needed.
// Exts don't need the ^ or / bit, because the root binds that already.
const startNoTraversal = '(?!(?:^|/)\\.\\.?(?:$|/))';
const startNoDot = '(?!\\.)';
// characters that indicate a start of pattern needs the "no dots" bit,
// because a dot *might* be matched. ( is not in the list, because in
// the case of a child extglob, it will handle the prevention itself.
const addPatternStart = new Set(['[', '.']);
// cases where traversal is A-OK, no dot prevention needed
const justDots = new Set(['..', '.']);
const reSpecials = new Set('().*{}+?[]^$\\!');
const regExpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
// any single thing other than /
const qmark = '[^/]';
// * => any number of characters
const star = qmark + '*?';
// use + when we need to ensure that *something* matches, because the * is
// the only thing in the path portion.
const starNoEmpty = qmark + '+?';
// remove the \ chars that we added if we end up doing a nonmagic compare
// const deslash = (s: string) => s.replace(/\\(.)/g, '$1')
let ID = 0;
class AST {
    type;
    #root;
    #hasMagic;
    #uflag = false;
    #parts = [];
    #parent;
    #parentIndex;
    #negs;
    #filledNegs = false;
    #options;
    #toString;
    // set to true if it's an extglob with no children
    // (which really means one child of '')
    #emptyExt = false;
    id = ++ID;
    get depth() {
        return (this.#parent?.depth ?? -1) + 1;
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return {
            '@@type': 'AST',
            id: this.id,
            type: this.type,
            root: this.#root.id,
            parent: this.#parent?.id,
            depth: this.depth,
            partsLength: this.#parts.length,
            parts: this.#parts,
        };
    }
    constructor(type, parent, options = {}) {
        this.type = type;
        // extglobs are inherently magical
        if (type)
            this.#hasMagic = true;
        this.#parent = parent;
        this.#root = this.#parent ? this.#parent.#root : this;
        this.#options = this.#root === this ? options : this.#root.#options;
        this.#negs = this.#root === this ? [] : this.#root.#negs;
        if (type === '!' && !this.#root.#filledNegs)
            this.#negs.push(this);
        this.#parentIndex = this.#parent ? this.#parent.#parts.length : 0;
    }
    get hasMagic() {
        /* c8 ignore start */
        if (this.#hasMagic !== undefined)
            return this.#hasMagic;
        /* c8 ignore stop */
        for (const p of this.#parts) {
            if (typeof p === 'string')
                continue;
            if (p.type || p.hasMagic)
                return (this.#hasMagic = true);
        }
        // note: will be undefined until we generate the regexp src and find out
        return this.#hasMagic;
    }
    // reconstructs the pattern
    toString() {
        return (this.#toString !== undefined ? this.#toString
            : !this.type ?
                (this.#toString = this.#parts.map(p => String(p)).join(''))
                : (this.#toString =
                    this.type +
                        '(' +
                        this.#parts.map(p => String(p)).join('|') +
                        ')'));
    }
    #fillNegs() {
        /* c8 ignore start */
        if (this !== this.#root)
            throw new Error('should only call on root');
        if (this.#filledNegs)
            return this;
        /* c8 ignore stop */
        // call toString() once to fill this out
        this.toString();
        this.#filledNegs = true;
        let n;
        while ((n = this.#negs.pop())) {
            if (n.type !== '!')
                continue;
            // walk up the tree, appending everthing that comes AFTER parentIndex
            let p = n;
            let pp = p.#parent;
            while (pp) {
                for (let i = p.#parentIndex + 1; !pp.type && i < pp.#parts.length; i++) {
                    for (const part of n.#parts) {
                        /* c8 ignore start */
                        if (typeof part === 'string') {
                            throw new Error('string part in extglob AST??');
                        }
                        /* c8 ignore stop */
                        part.copyIn(pp.#parts[i]);
                    }
                }
                p = pp;
                pp = p.#parent;
            }
        }
        return this;
    }
    push(...parts) {
        for (const p of parts) {
            if (p === '')
                continue;
            /* c8 ignore start */
            if (typeof p !== 'string' &&
                !(p instanceof _a && p.#parent === this)) {
                throw new Error('invalid part: ' + p);
            }
            /* c8 ignore stop */
            this.#parts.push(p);
        }
    }
    toJSON() {
        const ret = this.type === null ?
            this.#parts
                .slice()
                .map(p => (typeof p === 'string' ? p : p.toJSON()))
            : [this.type, ...this.#parts.map(p => p.toJSON())];
        if (this.isStart() && !this.type)
            ret.unshift([]);
        if (this.isEnd() &&
            (this === this.#root ||
                (this.#root.#filledNegs && this.#parent?.type === '!'))) {
            ret.push({});
        }
        return ret;
    }
    isStart() {
        if (this.#root === this)
            return true;
        // if (this.type) return !!this.#parent?.isStart()
        if (!this.#parent?.isStart())
            return false;
        if (this.#parentIndex === 0)
            return true;
        // if everything AHEAD of this is a negation, then it's still the "start"
        const p = this.#parent;
        for (let i = 0; i < this.#parentIndex; i++) {
            const pp = p.#parts[i];
            if (!(pp instanceof _a && pp.type === '!')) {
                return false;
            }
        }
        return true;
    }
    isEnd() {
        if (this.#root === this)
            return true;
        if (this.#parent?.type === '!')
            return true;
        if (!this.#parent?.isEnd())
            return false;
        if (!this.type)
            return this.#parent?.isEnd();
        // if not root, it'll always have a parent
        /* c8 ignore start */
        const pl = this.#parent ? this.#parent.#parts.length : 0;
        /* c8 ignore stop */
        return this.#parentIndex === pl - 1;
    }
    copyIn(part) {
        if (typeof part === 'string')
            this.push(part);
        else
            this.push(part.clone(this));
    }
    clone(parent) {
        const c = new _a(this.type, parent);
        for (const p of this.#parts) {
            c.copyIn(p);
        }
        return c;
    }
    static #parseAST(str, ast, pos, opt, extDepth) {
        const maxDepth = opt.maxExtglobRecursion ?? 2;
        let escaping = false;
        let inBrace = false;
        let braceStart = -1;
        let braceNeg = false;
        if (ast.type === null) {
            // outside of a extglob, append until we find a start
            let i = pos;
            let acc = '';
            while (i < str.length) {
                const c = str.charAt(i++);
                // still accumulate escapes at this point, but we do ignore
                // starts that are escaped
                if (escaping || c === '\\') {
                    escaping = !escaping;
                    acc += c;
                    continue;
                }
                if (inBrace) {
                    if (i === braceStart + 1) {
                        if (c === '^' || c === '!') {
                            braceNeg = true;
                        }
                    }
                    else if (c === ']' && !(i === braceStart + 2 && braceNeg)) {
                        inBrace = false;
                    }
                    acc += c;
                    continue;
                }
                else if (c === '[') {
                    inBrace = true;
                    braceStart = i;
                    braceNeg = false;
                    acc += c;
                    continue;
                }
                // we don't have to check for adoption here, because that's
                // done at the other recursion point.
                const doRecurse = !opt.noext &&
                    isExtglobType(c) &&
                    str.charAt(i) === '(' &&
                    extDepth <= maxDepth;
                if (doRecurse) {
                    ast.push(acc);
                    acc = '';
                    const ext = new _a(c, ast);
                    i = _a.#parseAST(str, ext, i, opt, extDepth + 1);
                    ast.push(ext);
                    continue;
                }
                acc += c;
            }
            ast.push(acc);
            return i;
        }
        // some kind of extglob, pos is at the (
        // find the next | or )
        let i = pos + 1;
        let part = new _a(null, ast);
        const parts = [];
        let acc = '';
        while (i < str.length) {
            const c = str.charAt(i++);
            // still accumulate escapes at this point, but we do ignore
            // starts that are escaped
            if (escaping || c === '\\') {
                escaping = !escaping;
                acc += c;
                continue;
            }
            if (inBrace) {
                if (i === braceStart + 1) {
                    if (c === '^' || c === '!') {
                        braceNeg = true;
                    }
                }
                else if (c === ']' && !(i === braceStart + 2 && braceNeg)) {
                    inBrace = false;
                }
                acc += c;
                continue;
            }
            else if (c === '[') {
                inBrace = true;
                braceStart = i;
                braceNeg = false;
                acc += c;
                continue;
            }
            const doRecurse = !opt.noext &&
                isExtglobType(c) &&
                str.charAt(i) === '(' &&
                /* c8 ignore start - the maxDepth is sufficient here */
                (extDepth <= maxDepth || (ast && ast.#canAdoptType(c)));
            /* c8 ignore stop */
            if (doRecurse) {
                const depthAdd = ast && ast.#canAdoptType(c) ? 0 : 1;
                part.push(acc);
                acc = '';
                const ext = new _a(c, part);
                part.push(ext);
                i = _a.#parseAST(str, ext, i, opt, extDepth + depthAdd);
                continue;
            }
            if (c === '|') {
                part.push(acc);
                acc = '';
                parts.push(part);
                part = new _a(null, ast);
                continue;
            }
            if (c === ')') {
                if (acc === '' && ast.#parts.length === 0) {
                    ast.#emptyExt = true;
                }
                part.push(acc);
                acc = '';
                ast.push(...parts, part);
                return i;
            }
            acc += c;
        }
        // unfinished extglob
        // if we got here, it was a malformed extglob! not an extglob, but
        // maybe something else in there.
        ast.type = null;
        ast.#hasMagic = undefined;
        ast.#parts = [str.substring(pos - 1)];
        return i;
    }
    #canAdoptWithSpace(child) {
        return this.#canAdopt(child, adoptionWithSpaceMap);
    }
    #canAdopt(child, map = adoptionMap) {
        if (!child ||
            typeof child !== 'object' ||
            child.type !== null ||
            child.#parts.length !== 1 ||
            this.type === null) {
            return false;
        }
        const gc = child.#parts[0];
        if (!gc || typeof gc !== 'object' || gc.type === null) {
            return false;
        }
        return this.#canAdoptType(gc.type, map);
    }
    #canAdoptType(c, map = adoptionAnyMap) {
        return !!map.get(this.type)?.includes(c);
    }
    #adoptWithSpace(child, index) {
        const gc = child.#parts[0];
        const blank = new _a(null, gc, this.options);
        blank.#parts.push('');
        gc.push(blank);
        this.#adopt(child, index);
    }
    #adopt(child, index) {
        const gc = child.#parts[0];
        this.#parts.splice(index, 1, ...gc.#parts);
        for (const p of gc.#parts) {
            if (typeof p === 'object')
                p.#parent = this;
        }
        this.#toString = undefined;
    }
    #canUsurpType(c) {
        const m = usurpMap.get(this.type);
        return !!m?.has(c);
    }
    #canUsurp(child) {
        if (!child ||
            typeof child !== 'object' ||
            child.type !== null ||
            child.#parts.length !== 1 ||
            this.type === null ||
            this.#parts.length !== 1) {
            return false;
        }
        const gc = child.#parts[0];
        if (!gc || typeof gc !== 'object' || gc.type === null) {
            return false;
        }
        return this.#canUsurpType(gc.type);
    }
    #usurp(child) {
        const m = usurpMap.get(this.type);
        const gc = child.#parts[0];
        const nt = m?.get(gc.type);
        /* c8 ignore start - impossible */
        if (!nt)
            return false;
        /* c8 ignore stop */
        this.#parts = gc.#parts;
        for (const p of this.#parts) {
            if (typeof p === 'object') {
                p.#parent = this;
            }
        }
        this.type = nt;
        this.#toString = undefined;
        this.#emptyExt = false;
    }
    static fromGlob(pattern, options = {}) {
        const ast = new _a(null, undefined, options);
        _a.#parseAST(pattern, ast, 0, options, 0);
        return ast;
    }
    // returns the regular expression if there's magic, or the unescaped
    // string if not.
    toMMPattern() {
        // should only be called on root
        /* c8 ignore start */
        if (this !== this.#root)
            return this.#root.toMMPattern();
        /* c8 ignore stop */
        const glob = this.toString();
        const [re, body, hasMagic, uflag] = this.toRegExpSource();
        // if we're in nocase mode, and not nocaseMagicOnly, then we do
        // still need a regular expression if we have to case-insensitively
        // match capital/lowercase characters.
        const anyMagic = hasMagic ||
            this.#hasMagic ||
            (this.#options.nocase &&
                !this.#options.nocaseMagicOnly &&
                glob.toUpperCase() !== glob.toLowerCase());
        if (!anyMagic) {
            return body;
        }
        const flags = (this.#options.nocase ? 'i' : '') + (uflag ? 'u' : '');
        return Object.assign(new RegExp(`^${re}$`, flags), {
            _src: re,
            _glob: glob,
        });
    }
    get options() {
        return this.#options;
    }
    // returns the string match, the regexp source, whether there's magic
    // in the regexp (so a regular expression is required) and whether or
    // not the uflag is needed for the regular expression (for posix classes)
    // TODO: instead of injecting the start/end at this point, just return
    // the BODY of the regexp, along with the start/end portions suitable
    // for binding the start/end in either a joined full-path makeRe context
    // (where we bind to (^|/), or a standalone matchPart context (where
    // we bind to ^, and not /).  Otherwise slashes get duped!
    //
    // In part-matching mode, the start is:
    // - if not isStart: nothing
    // - if traversal possible, but not allowed: ^(?!\.\.?$)
    // - if dots allowed or not possible: ^
    // - if dots possible and not allowed: ^(?!\.)
    // end is:
    // - if not isEnd(): nothing
    // - else: $
    //
    // In full-path matching mode, we put the slash at the START of the
    // pattern, so start is:
    // - if first pattern: same as part-matching mode
    // - if not isStart(): nothing
    // - if traversal possible, but not allowed: /(?!\.\.?(?:$|/))
    // - if dots allowed or not possible: /
    // - if dots possible and not allowed: /(?!\.)
    // end is:
    // - if last pattern, same as part-matching mode
    // - else nothing
    //
    // Always put the (?:$|/) on negated tails, though, because that has to be
    // there to bind the end of the negated pattern portion, and it's easier to
    // just stick it in now rather than try to inject it later in the middle of
    // the pattern.
    //
    // We can just always return the same end, and leave it up to the caller
    // to know whether it's going to be used joined or in parts.
    // And, if the start is adjusted slightly, can do the same there:
    // - if not isStart: nothing
    // - if traversal possible, but not allowed: (?:/|^)(?!\.\.?$)
    // - if dots allowed or not possible: (?:/|^)
    // - if dots possible and not allowed: (?:/|^)(?!\.)
    //
    // But it's better to have a simpler binding without a conditional, for
    // performance, so probably better to return both start options.
    //
    // Then the caller just ignores the end if it's not the first pattern,
    // and the start always gets applied.
    //
    // But that's always going to be $ if it's the ending pattern, or nothing,
    // so the caller can just attach $ at the end of the pattern when building.
    //
    // So the todo is:
    // - better detect what kind of start is needed
    // - return both flavors of starting pattern
    // - attach $ at the end of the pattern when creating the actual RegExp
    //
    // Ah, but wait, no, that all only applies to the root when the first pattern
    // is not an extglob. If the first pattern IS an extglob, then we need all
    // that dot prevention biz to live in the extglob portions, because eg
    // +(*|.x*) can match .xy but not .yx.
    //
    // So, return the two flavors if it's #root and the first child is not an
    // AST, otherwise leave it to the child AST to handle it, and there,
    // use the (?:^|/) style of start binding.
    //
    // Even simplified further:
    // - Since the start for a join is eg /(?!\.) and the start for a part
    // is ^(?!\.), we can just prepend (?!\.) to the pattern (either root
    // or start or whatever) and prepend ^ or / at the Regexp construction.
    toRegExpSource(allowDot) {
        const dot = allowDot ?? !!this.#options.dot;
        if (this.#root === this) {
            this.#flatten();
            this.#fillNegs();
        }
        if (!isExtglobAST(this)) {
            const noEmpty = this.isStart() &&
                this.isEnd() &&
                !this.#parts.some(s => typeof s !== 'string');
            const src = this.#parts
                .map(p => {
                const [re, _, hasMagic, uflag] = typeof p === 'string' ?
                    _a.#parseGlob(p, this.#hasMagic, noEmpty)
                    : p.toRegExpSource(allowDot);
                this.#hasMagic = this.#hasMagic || hasMagic;
                this.#uflag = this.#uflag || uflag;
                return re;
            })
                .join('');
            let start = '';
            if (this.isStart()) {
                if (typeof this.#parts[0] === 'string') {
                    // this is the string that will match the start of the pattern,
                    // so we need to protect against dots and such.
                    // '.' and '..' cannot match unless the pattern is that exactly,
                    // even if it starts with . or dot:true is set.
                    const dotTravAllowed = this.#parts.length === 1 && justDots.has(this.#parts[0]);
                    if (!dotTravAllowed) {
                        const aps = addPatternStart;
                        // check if we have a possibility of matching . or ..,
                        // and prevent that.
                        const needNoTrav = 
                        // dots are allowed, and the pattern starts with [ or .
                        (dot && aps.has(src.charAt(0))) ||
                            // the pattern starts with \., and then [ or .
                            (src.startsWith('\\.') && aps.has(src.charAt(2))) ||
                            // the pattern starts with \.\., and then [ or .
                            (src.startsWith('\\.\\.') && aps.has(src.charAt(4)));
                        // no need to prevent dots if it can't match a dot, or if a
                        // sub-pattern will be preventing it anyway.
                        const needNoDot = !dot && !allowDot && aps.has(src.charAt(0));
                        start =
                            needNoTrav ? startNoTraversal
                                : needNoDot ? startNoDot
                                    : '';
                    }
                }
            }
            // append the "end of path portion" pattern to negation tails
            let end = '';
            if (this.isEnd() &&
                this.#root.#filledNegs &&
                this.#parent?.type === '!') {
                end = '(?:$|\\/)';
            }
            const final = start + src + end;
            return [
                final,
                (0,_unescape_js__WEBPACK_IMPORTED_MODULE_1__.unescape)(src),
                (this.#hasMagic = !!this.#hasMagic),
                this.#uflag,
            ];
        }
        // We need to calculate the body *twice* if it's a repeat pattern
        // at the start, once in nodot mode, then again in dot mode, so a
        // pattern like *(?) can match 'x.y'
        const repeated = this.type === '*' || this.type === '+';
        // some kind of extglob
        const start = this.type === '!' ? '(?:(?!(?:' : '(?:';
        let body = this.#partsToRegExp(dot);
        if (this.isStart() && this.isEnd() && !body && this.type !== '!') {
            // invalid extglob, has to at least be *something* present, if it's
            // the entire path portion.
            const s = this.toString();
            const me = this;
            me.#parts = [s];
            me.type = null;
            me.#hasMagic = undefined;
            return [s, (0,_unescape_js__WEBPACK_IMPORTED_MODULE_1__.unescape)(this.toString()), false, false];
        }
        let bodyDotAllowed = !repeated || allowDot || dot || !startNoDot ?
            ''
            : this.#partsToRegExp(true);
        if (bodyDotAllowed === body) {
            bodyDotAllowed = '';
        }
        if (bodyDotAllowed) {
            body = `(?:${body})(?:${bodyDotAllowed})*?`;
        }
        // an empty !() is exactly equivalent to a starNoEmpty
        let final = '';
        if (this.type === '!' && this.#emptyExt) {
            final = (this.isStart() && !dot ? startNoDot : '') + starNoEmpty;
        }
        else {
            const close = this.type === '!' ?
                // !() must match something,but !(x) can match ''
                '))' +
                    (this.isStart() && !dot && !allowDot ? startNoDot : '') +
                    star +
                    ')'
                : this.type === '@' ? ')'
                    : this.type === '?' ? ')?'
                        : this.type === '+' && bodyDotAllowed ? ')'
                            : this.type === '*' && bodyDotAllowed ? `)?`
                                : `)${this.type}`;
            final = start + body + close;
        }
        return [
            final,
            (0,_unescape_js__WEBPACK_IMPORTED_MODULE_1__.unescape)(body),
            (this.#hasMagic = !!this.#hasMagic),
            this.#uflag,
        ];
    }
    #flatten() {
        if (!isExtglobAST(this)) {
            for (const p of this.#parts) {
                if (typeof p === 'object') {
                    p.#flatten();
                }
            }
        }
        else {
            // do up to 10 passes to flatten as much as possible
            let iterations = 0;
            let done = false;
            do {
                done = true;
                for (let i = 0; i < this.#parts.length; i++) {
                    const c = this.#parts[i];
                    if (typeof c === 'object') {
                        c.#flatten();
                        if (this.#canAdopt(c)) {
                            done = false;
                            this.#adopt(c, i);
                        }
                        else if (this.#canAdoptWithSpace(c)) {
                            done = false;
                            this.#adoptWithSpace(c, i);
                        }
                        else if (this.#canUsurp(c)) {
                            done = false;
                            this.#usurp(c);
                        }
                    }
                }
            } while (!done && ++iterations < 10);
        }
        this.#toString = undefined;
    }
    #partsToRegExp(dot) {
        return this.#parts
            .map(p => {
            // extglob ASTs should only contain parent ASTs
            /* c8 ignore start */
            if (typeof p === 'string') {
                throw new Error('string type in extglob ast??');
            }
            /* c8 ignore stop */
            // can ignore hasMagic, because extglobs are already always magic
            const [re, _, _hasMagic, uflag] = p.toRegExpSource(dot);
            this.#uflag = this.#uflag || uflag;
            return re;
        })
            .filter(p => !(this.isStart() && this.isEnd()) || !!p)
            .join('|');
    }
    static #parseGlob(glob, hasMagic, noEmpty = false) {
        let escaping = false;
        let re = '';
        let uflag = false;
        // multiple stars that aren't globstars coalesce into one *
        let inStar = false;
        for (let i = 0; i < glob.length; i++) {
            const c = glob.charAt(i);
            if (escaping) {
                escaping = false;
                re += (reSpecials.has(c) ? '\\' : '') + c;
                continue;
            }
            if (c === '*') {
                if (inStar)
                    continue;
                inStar = true;
                re += noEmpty && /^[*]+$/.test(glob) ? starNoEmpty : star;
                hasMagic = true;
                continue;
            }
            else {
                inStar = false;
            }
            if (c === '\\') {
                if (i === glob.length - 1) {
                    re += '\\\\';
                }
                else {
                    escaping = true;
                }
                continue;
            }
            if (c === '[') {
                const [src, needUflag, consumed, magic] = (0,_brace_expressions_js__WEBPACK_IMPORTED_MODULE_0__.parseClass)(glob, i);
                if (consumed) {
                    re += src;
                    uflag = uflag || needUflag;
                    i += consumed - 1;
                    hasMagic = hasMagic || magic;
                    continue;
                }
            }
            if (c === '?') {
                re += qmark;
                hasMagic = true;
                continue;
            }
            re += regExpEscape(c);
        }
        return [re, (0,_unescape_js__WEBPACK_IMPORTED_MODULE_1__.unescape)(glob), !!hasMagic, uflag];
    }
}
_a = AST;
//# sourceMappingURL=ast.js.map

/***/ },

/***/ "./node_modules/glob/node_modules/minimatch/dist/esm/brace-expressions.js"
/*!********************************************************************************!*\
  !*** ./node_modules/glob/node_modules/minimatch/dist/esm/brace-expressions.js ***!
  \********************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parseClass: () => (/* binding */ parseClass)
/* harmony export */ });
// translate the various posix character classes into unicode properties
// this works across all unicode locales
// { <posix class>: [<translation>, /u flag required, negated]
const posixClasses = {
    '[:alnum:]': ['\\p{L}\\p{Nl}\\p{Nd}', true],
    '[:alpha:]': ['\\p{L}\\p{Nl}', true],
    '[:ascii:]': ['\\x' + '00-\\x' + '7f', false],
    '[:blank:]': ['\\p{Zs}\\t', true],
    '[:cntrl:]': ['\\p{Cc}', true],
    '[:digit:]': ['\\p{Nd}', true],
    '[:graph:]': ['\\p{Z}\\p{C}', true, true],
    '[:lower:]': ['\\p{Ll}', true],
    '[:print:]': ['\\p{C}', true],
    '[:punct:]': ['\\p{P}', true],
    '[:space:]': ['\\p{Z}\\t\\r\\n\\v\\f', true],
    '[:upper:]': ['\\p{Lu}', true],
    '[:word:]': ['\\p{L}\\p{Nl}\\p{Nd}\\p{Pc}', true],
    '[:xdigit:]': ['A-Fa-f0-9', false],
};
// only need to escape a few things inside of brace expressions
// escapes: [ \ ] -
const braceEscape = (s) => s.replace(/[[\]\\-]/g, '\\$&');
// escape all regexp magic characters
const regexpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
// everything has already been escaped, we just have to join
const rangesToString = (ranges) => ranges.join('');
// takes a glob string at a posix brace expression, and returns
// an equivalent regular expression source, and boolean indicating
// whether the /u flag needs to be applied, and the number of chars
// consumed to parse the character class.
// This also removes out of order ranges, and returns ($.) if the
// entire class just no good.
const parseClass = (glob, position) => {
    const pos = position;
    /* c8 ignore start */
    if (glob.charAt(pos) !== '[') {
        throw new Error('not in a brace expression');
    }
    /* c8 ignore stop */
    const ranges = [];
    const negs = [];
    let i = pos + 1;
    let sawStart = false;
    let uflag = false;
    let escaping = false;
    let negate = false;
    let endPos = pos;
    let rangeStart = '';
    WHILE: while (i < glob.length) {
        const c = glob.charAt(i);
        if ((c === '!' || c === '^') && i === pos + 1) {
            negate = true;
            i++;
            continue;
        }
        if (c === ']' && sawStart && !escaping) {
            endPos = i + 1;
            break;
        }
        sawStart = true;
        if (c === '\\') {
            if (!escaping) {
                escaping = true;
                i++;
                continue;
            }
            // escaped \ char, fall through and treat like normal char
        }
        if (c === '[' && !escaping) {
            // either a posix class, a collation equivalent, or just a [
            for (const [cls, [unip, u, neg]] of Object.entries(posixClasses)) {
                if (glob.startsWith(cls, i)) {
                    // invalid, [a-[] is fine, but not [a-[:alpha]]
                    if (rangeStart) {
                        return ['$.', false, glob.length - pos, true];
                    }
                    i += cls.length;
                    if (neg)
                        negs.push(unip);
                    else
                        ranges.push(unip);
                    uflag = uflag || u;
                    continue WHILE;
                }
            }
        }
        // now it's just a normal character, effectively
        escaping = false;
        if (rangeStart) {
            // throw this range away if it's not valid, but others
            // can still match.
            if (c > rangeStart) {
                ranges.push(braceEscape(rangeStart) + '-' + braceEscape(c));
            }
            else if (c === rangeStart) {
                ranges.push(braceEscape(c));
            }
            rangeStart = '';
            i++;
            continue;
        }
        // now might be the start of a range.
        // can be either c-d or c-] or c<more...>] or c] at this point
        if (glob.startsWith('-]', i + 1)) {
            ranges.push(braceEscape(c + '-'));
            i += 2;
            continue;
        }
        if (glob.startsWith('-', i + 1)) {
            rangeStart = c;
            i += 2;
            continue;
        }
        // not the start of a range, just a single character
        ranges.push(braceEscape(c));
        i++;
    }
    if (endPos < i) {
        // didn't see the end of the class, not a valid class,
        // but might still be valid as a literal match.
        return ['', false, 0, false];
    }
    // if we got no ranges and no negates, then we have a range that
    // cannot possibly match anything, and that poisons the whole glob
    if (!ranges.length && !negs.length) {
        return ['$.', false, glob.length - pos, true];
    }
    // if we got one positive range, and it's a single character, then that's
    // not actually a magic pattern, it's just that one literal character.
    // we should not treat that as "magic", we should just return the literal
    // character. [_] is a perfectly valid way to escape glob magic chars.
    if (negs.length === 0 &&
        ranges.length === 1 &&
        /^\\?.$/.test(ranges[0]) &&
        !negate) {
        const r = ranges[0].length === 2 ? ranges[0].slice(-1) : ranges[0];
        return [regexpEscape(r), false, endPos - pos, false];
    }
    const sranges = '[' + (negate ? '^' : '') + rangesToString(ranges) + ']';
    const snegs = '[' + (negate ? '' : '^') + rangesToString(negs) + ']';
    const comb = ranges.length && negs.length ? '(' + sranges + '|' + snegs + ')'
        : ranges.length ? sranges
            : snegs;
    return [comb, uflag, endPos - pos, true];
};
//# sourceMappingURL=brace-expressions.js.map

/***/ },

/***/ "./node_modules/glob/node_modules/minimatch/dist/esm/escape.js"
/*!*********************************************************************!*\
  !*** ./node_modules/glob/node_modules/minimatch/dist/esm/escape.js ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   escape: () => (/* binding */ escape)
/* harmony export */ });
/**
 * Escape all magic characters in a glob pattern.
 *
 * If the {@link MinimatchOptions.windowsPathsNoEscape}
 * option is used, then characters are escaped by wrapping in `[]`, because
 * a magic character wrapped in a character class can only be satisfied by
 * that exact character.  In this mode, `\` is _not_ escaped, because it is
 * not interpreted as a magic character, but instead as a path separator.
 *
 * If the {@link MinimatchOptions.magicalBraces} option is used,
 * then braces (`{` and `}`) will be escaped.
 */
const escape = (s, { windowsPathsNoEscape = false, magicalBraces = false, } = {}) => {
    // don't need to escape +@! because we escape the parens
    // that make those magic, and escaping ! as [!] isn't valid,
    // because [!]] is a valid glob class meaning not ']'.
    if (magicalBraces) {
        return windowsPathsNoEscape ?
            s.replace(/[?*()[\]{}]/g, '[$&]')
            : s.replace(/[?*()[\]\\{}]/g, '\\$&');
    }
    return windowsPathsNoEscape ?
        s.replace(/[?*()[\]]/g, '[$&]')
        : s.replace(/[?*()[\]\\]/g, '\\$&');
};
//# sourceMappingURL=escape.js.map

/***/ },

/***/ "./node_modules/glob/node_modules/minimatch/dist/esm/index.js"
/*!********************************************************************!*\
  !*** ./node_modules/glob/node_modules/minimatch/dist/esm/index.js ***!
  \********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AST: () => (/* reexport safe */ _ast_js__WEBPACK_IMPORTED_MODULE_2__.AST),
/* harmony export */   GLOBSTAR: () => (/* binding */ GLOBSTAR),
/* harmony export */   Minimatch: () => (/* binding */ Minimatch),
/* harmony export */   braceExpand: () => (/* binding */ braceExpand),
/* harmony export */   defaults: () => (/* binding */ defaults),
/* harmony export */   escape: () => (/* reexport safe */ _escape_js__WEBPACK_IMPORTED_MODULE_3__.escape),
/* harmony export */   filter: () => (/* binding */ filter),
/* harmony export */   makeRe: () => (/* binding */ makeRe),
/* harmony export */   match: () => (/* binding */ match),
/* harmony export */   minimatch: () => (/* binding */ minimatch),
/* harmony export */   sep: () => (/* binding */ sep),
/* harmony export */   unescape: () => (/* reexport safe */ _unescape_js__WEBPACK_IMPORTED_MODULE_4__.unescape)
/* harmony export */ });
/* harmony import */ var brace_expansion__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! brace-expansion */ "./node_modules/glob/node_modules/brace-expansion/dist/esm/index.js");
/* harmony import */ var _assert_valid_pattern_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./assert-valid-pattern.js */ "./node_modules/glob/node_modules/minimatch/dist/esm/assert-valid-pattern.js");
/* harmony import */ var _ast_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ast.js */ "./node_modules/glob/node_modules/minimatch/dist/esm/ast.js");
/* harmony import */ var _escape_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./escape.js */ "./node_modules/glob/node_modules/minimatch/dist/esm/escape.js");
/* harmony import */ var _unescape_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./unescape.js */ "./node_modules/glob/node_modules/minimatch/dist/esm/unescape.js");





const minimatch = (p, pattern, options = {}) => {
    (0,_assert_valid_pattern_js__WEBPACK_IMPORTED_MODULE_1__.assertValidPattern)(pattern);
    // shortcut: comments match nothing.
    if (!options.nocomment && pattern.charAt(0) === '#') {
        return false;
    }
    return new Minimatch(pattern, options).match(p);
};
// Optimized checking for the most common glob patterns.
const starDotExtRE = /^\*+([^+@!?*[(]*)$/;
const starDotExtTest = (ext) => (f) => !f.startsWith('.') && f.endsWith(ext);
const starDotExtTestDot = (ext) => (f) => f.endsWith(ext);
const starDotExtTestNocase = (ext) => {
    ext = ext.toLowerCase();
    return (f) => !f.startsWith('.') && f.toLowerCase().endsWith(ext);
};
const starDotExtTestNocaseDot = (ext) => {
    ext = ext.toLowerCase();
    return (f) => f.toLowerCase().endsWith(ext);
};
const starDotStarRE = /^\*+\.\*+$/;
const starDotStarTest = (f) => !f.startsWith('.') && f.includes('.');
const starDotStarTestDot = (f) => f !== '.' && f !== '..' && f.includes('.');
const dotStarRE = /^\.\*+$/;
const dotStarTest = (f) => f !== '.' && f !== '..' && f.startsWith('.');
const starRE = /^\*+$/;
const starTest = (f) => f.length !== 0 && !f.startsWith('.');
const starTestDot = (f) => f.length !== 0 && f !== '.' && f !== '..';
const qmarksRE = /^\?+([^+@!?*[(]*)?$/;
const qmarksTestNocase = ([$0, ext = '']) => {
    const noext = qmarksTestNoExt([$0]);
    if (!ext)
        return noext;
    ext = ext.toLowerCase();
    return (f) => noext(f) && f.toLowerCase().endsWith(ext);
};
const qmarksTestNocaseDot = ([$0, ext = '']) => {
    const noext = qmarksTestNoExtDot([$0]);
    if (!ext)
        return noext;
    ext = ext.toLowerCase();
    return (f) => noext(f) && f.toLowerCase().endsWith(ext);
};
const qmarksTestDot = ([$0, ext = '']) => {
    const noext = qmarksTestNoExtDot([$0]);
    return !ext ? noext : (f) => noext(f) && f.endsWith(ext);
};
const qmarksTest = ([$0, ext = '']) => {
    const noext = qmarksTestNoExt([$0]);
    return !ext ? noext : (f) => noext(f) && f.endsWith(ext);
};
const qmarksTestNoExt = ([$0]) => {
    const len = $0.length;
    return (f) => f.length === len && !f.startsWith('.');
};
const qmarksTestNoExtDot = ([$0]) => {
    const len = $0.length;
    return (f) => f.length === len && f !== '.' && f !== '..';
};
/* c8 ignore start */
const defaultPlatform = (typeof process === 'object' && process ?
    (typeof process.env === 'object' &&
        process.env &&
        process.env.__MINIMATCH_TESTING_PLATFORM__) ||
        process.platform
    : 'posix');
const path = {
    win32: { sep: '\\' },
    posix: { sep: '/' },
};
/* c8 ignore stop */
const sep = defaultPlatform === 'win32' ? path.win32.sep : path.posix.sep;
minimatch.sep = sep;
const GLOBSTAR = Symbol('globstar **');
minimatch.GLOBSTAR = GLOBSTAR;
// any single thing other than /
// don't need to escape / when using new RegExp()
const qmark = '[^/]';
// * => any number of characters
const star = qmark + '*?';
// ** when dots are allowed.  Anything goes, except .. and .
// not (^ or / followed by one or two dots followed by $ or /),
// followed by anything, any number of times.
const twoStarDot = '(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?';
// not a ^ or / followed by a dot,
// followed by anything, any number of times.
const twoStarNoDot = '(?:(?!(?:\\/|^)\\.).)*?';
const filter = (pattern, options = {}) => (p) => minimatch(p, pattern, options);
minimatch.filter = filter;
const ext = (a, b = {}) => Object.assign({}, a, b);
const defaults = (def) => {
    if (!def || typeof def !== 'object' || !Object.keys(def).length) {
        return minimatch;
    }
    const orig = minimatch;
    const m = (p, pattern, options = {}) => orig(p, pattern, ext(def, options));
    return Object.assign(m, {
        Minimatch: class Minimatch extends orig.Minimatch {
            constructor(pattern, options = {}) {
                super(pattern, ext(def, options));
            }
            static defaults(options) {
                return orig.defaults(ext(def, options)).Minimatch;
            }
        },
        AST: class AST extends orig.AST {
            /* c8 ignore start */
            constructor(type, parent, options = {}) {
                super(type, parent, ext(def, options));
            }
            /* c8 ignore stop */
            static fromGlob(pattern, options = {}) {
                return orig.AST.fromGlob(pattern, ext(def, options));
            }
        },
        unescape: (s, options = {}) => orig.unescape(s, ext(def, options)),
        escape: (s, options = {}) => orig.escape(s, ext(def, options)),
        filter: (pattern, options = {}) => orig.filter(pattern, ext(def, options)),
        defaults: (options) => orig.defaults(ext(def, options)),
        makeRe: (pattern, options = {}) => orig.makeRe(pattern, ext(def, options)),
        braceExpand: (pattern, options = {}) => orig.braceExpand(pattern, ext(def, options)),
        match: (list, pattern, options = {}) => orig.match(list, pattern, ext(def, options)),
        sep: orig.sep,
        GLOBSTAR: GLOBSTAR,
    });
};
minimatch.defaults = defaults;
// Brace expansion:
// a{b,c}d -> abd acd
// a{b,}c -> abc ac
// a{0..3}d -> a0d a1d a2d a3d
// a{b,c{d,e}f}g -> abg acdfg acefg
// a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
//
// Invalid sets are not expanded.
// a{2..}b -> a{2..}b
// a{b}c -> a{b}c
const braceExpand = (pattern, options = {}) => {
    (0,_assert_valid_pattern_js__WEBPACK_IMPORTED_MODULE_1__.assertValidPattern)(pattern);
    // Thanks to Yeting Li <https://github.com/yetingli> for
    // improving this regexp to avoid a ReDOS vulnerability.
    if (options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern)) {
        // shortcut. no need to expand.
        return [pattern];
    }
    return (0,brace_expansion__WEBPACK_IMPORTED_MODULE_0__.expand)(pattern, { max: options.braceExpandMax });
};
minimatch.braceExpand = braceExpand;
// parse a component of the expanded set.
// At this point, no pattern may contain "/" in it
// so we're going to return a 2d array, where each entry is the full
// pattern, split on '/', and then turned into a regular expression.
// A regexp is made at the end which joins each array with an
// escaped /, and another full one which joins each regexp with |.
//
// Following the lead of Bash 4.1, note that "**" only has special meaning
// when it is the *only* thing in a path portion.  Otherwise, any series
// of * is equivalent to a single *.  Globstar behavior is enabled by
// default, and can be disabled by setting options.noglobstar.
const makeRe = (pattern, options = {}) => new Minimatch(pattern, options).makeRe();
minimatch.makeRe = makeRe;
const match = (list, pattern, options = {}) => {
    const mm = new Minimatch(pattern, options);
    list = list.filter(f => mm.match(f));
    if (mm.options.nonull && !list.length) {
        list.push(pattern);
    }
    return list;
};
minimatch.match = match;
// replace stuff like \* with *
const globMagic = /[?*]|[+@!]\(.*?\)|\[|\]/;
const regExpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
class Minimatch {
    options;
    set;
    pattern;
    windowsPathsNoEscape;
    nonegate;
    negate;
    comment;
    empty;
    preserveMultipleSlashes;
    partial;
    globSet;
    globParts;
    nocase;
    isWindows;
    platform;
    windowsNoMagicRoot;
    maxGlobstarRecursion;
    regexp;
    constructor(pattern, options = {}) {
        (0,_assert_valid_pattern_js__WEBPACK_IMPORTED_MODULE_1__.assertValidPattern)(pattern);
        options = options || {};
        this.options = options;
        this.maxGlobstarRecursion = options.maxGlobstarRecursion ?? 200;
        this.pattern = pattern;
        this.platform = options.platform || defaultPlatform;
        this.isWindows = this.platform === 'win32';
        // avoid the annoying deprecation flag lol
        const awe = ('allowWindow' + 'sEscape');
        this.windowsPathsNoEscape =
            !!options.windowsPathsNoEscape || options[awe] === false;
        if (this.windowsPathsNoEscape) {
            this.pattern = this.pattern.replace(/\\/g, '/');
        }
        this.preserveMultipleSlashes = !!options.preserveMultipleSlashes;
        this.regexp = null;
        this.negate = false;
        this.nonegate = !!options.nonegate;
        this.comment = false;
        this.empty = false;
        this.partial = !!options.partial;
        this.nocase = !!this.options.nocase;
        this.windowsNoMagicRoot =
            options.windowsNoMagicRoot !== undefined ?
                options.windowsNoMagicRoot
                : !!(this.isWindows && this.nocase);
        this.globSet = [];
        this.globParts = [];
        this.set = [];
        // make the set of regexps etc.
        this.make();
    }
    hasMagic() {
        if (this.options.magicalBraces && this.set.length > 1) {
            return true;
        }
        for (const pattern of this.set) {
            for (const part of pattern) {
                if (typeof part !== 'string')
                    return true;
            }
        }
        return false;
    }
    debug(..._) { }
    make() {
        const pattern = this.pattern;
        const options = this.options;
        // empty patterns and comments match nothing.
        if (!options.nocomment && pattern.charAt(0) === '#') {
            this.comment = true;
            return;
        }
        if (!pattern) {
            this.empty = true;
            return;
        }
        // step 1: figure out negation, etc.
        this.parseNegate();
        // step 2: expand braces
        this.globSet = [...new Set(this.braceExpand())];
        if (options.debug) {
            //oxlint-disable-next-line no-console
            this.debug = (...args) => console.error(...args);
        }
        this.debug(this.pattern, this.globSet);
        // step 3: now we have a set, so turn each one into a series of
        // path-portion matching patterns.
        // These will be regexps, except in the case of "**", which is
        // set to the GLOBSTAR object for globstar behavior,
        // and will not contain any / characters
        //
        // First, we preprocess to make the glob pattern sets a bit simpler
        // and deduped.  There are some perf-killing patterns that can cause
        // problems with a glob walk, but we can simplify them down a bit.
        const rawGlobParts = this.globSet.map(s => this.slashSplit(s));
        this.globParts = this.preprocess(rawGlobParts);
        this.debug(this.pattern, this.globParts);
        // glob --> regexps
        let set = this.globParts.map((s, _, __) => {
            if (this.isWindows && this.windowsNoMagicRoot) {
                // check if it's a drive or unc path.
                const isUNC = s[0] === '' &&
                    s[1] === '' &&
                    (s[2] === '?' || !globMagic.test(s[2])) &&
                    !globMagic.test(s[3]);
                const isDrive = /^[a-z]:/i.test(s[0]);
                if (isUNC) {
                    return [
                        ...s.slice(0, 4),
                        ...s.slice(4).map(ss => this.parse(ss)),
                    ];
                }
                else if (isDrive) {
                    return [s[0], ...s.slice(1).map(ss => this.parse(ss))];
                }
            }
            return s.map(ss => this.parse(ss));
        });
        this.debug(this.pattern, set);
        // filter out everything that didn't compile properly.
        this.set = set.filter(s => s.indexOf(false) === -1);
        // do not treat the ? in UNC paths as magic
        if (this.isWindows) {
            for (let i = 0; i < this.set.length; i++) {
                const p = this.set[i];
                if (p[0] === '' &&
                    p[1] === '' &&
                    this.globParts[i][2] === '?' &&
                    typeof p[3] === 'string' &&
                    /^[a-z]:$/i.test(p[3])) {
                    p[2] = '?';
                }
            }
        }
        this.debug(this.pattern, this.set);
    }
    // various transforms to equivalent pattern sets that are
    // faster to process in a filesystem walk.  The goal is to
    // eliminate what we can, and push all ** patterns as far
    // to the right as possible, even if it increases the number
    // of patterns that we have to process.
    preprocess(globParts) {
        // if we're not in globstar mode, then turn ** into *
        if (this.options.noglobstar) {
            for (const partset of globParts) {
                for (let j = 0; j < partset.length; j++) {
                    if (partset[j] === '**') {
                        partset[j] = '*';
                    }
                }
            }
        }
        const { optimizationLevel = 1 } = this.options;
        if (optimizationLevel >= 2) {
            // aggressive optimization for the purpose of fs walking
            globParts = this.firstPhasePreProcess(globParts);
            globParts = this.secondPhasePreProcess(globParts);
        }
        else if (optimizationLevel >= 1) {
            // just basic optimizations to remove some .. parts
            globParts = this.levelOneOptimize(globParts);
        }
        else {
            // just collapse multiple ** portions into one
            globParts = this.adjascentGlobstarOptimize(globParts);
        }
        return globParts;
    }
    // just get rid of adjascent ** portions
    adjascentGlobstarOptimize(globParts) {
        return globParts.map(parts => {
            let gs = -1;
            while (-1 !== (gs = parts.indexOf('**', gs + 1))) {
                let i = gs;
                while (parts[i + 1] === '**') {
                    i++;
                }
                if (i !== gs) {
                    parts.splice(gs, i - gs);
                }
            }
            return parts;
        });
    }
    // get rid of adjascent ** and resolve .. portions
    levelOneOptimize(globParts) {
        return globParts.map(parts => {
            parts = parts.reduce((set, part) => {
                const prev = set[set.length - 1];
                if (part === '**' && prev === '**') {
                    return set;
                }
                if (part === '..') {
                    if (prev && prev !== '..' && prev !== '.' && prev !== '**') {
                        set.pop();
                        return set;
                    }
                }
                set.push(part);
                return set;
            }, []);
            return parts.length === 0 ? [''] : parts;
        });
    }
    levelTwoFileOptimize(parts) {
        if (!Array.isArray(parts)) {
            parts = this.slashSplit(parts);
        }
        let didSomething = false;
        do {
            didSomething = false;
            // <pre>/<e>/<rest> -> <pre>/<rest>
            if (!this.preserveMultipleSlashes) {
                for (let i = 1; i < parts.length - 1; i++) {
                    const p = parts[i];
                    // don't squeeze out UNC patterns
                    if (i === 1 && p === '' && parts[0] === '')
                        continue;
                    if (p === '.' || p === '') {
                        didSomething = true;
                        parts.splice(i, 1);
                        i--;
                    }
                }
                if (parts[0] === '.' &&
                    parts.length === 2 &&
                    (parts[1] === '.' || parts[1] === '')) {
                    didSomething = true;
                    parts.pop();
                }
            }
            // <pre>/<p>/../<rest> -> <pre>/<rest>
            let dd = 0;
            while (-1 !== (dd = parts.indexOf('..', dd + 1))) {
                const p = parts[dd - 1];
                if (p &&
                    p !== '.' &&
                    p !== '..' &&
                    p !== '**' &&
                    !(this.isWindows && /^[a-z]:$/i.test(p))) {
                    didSomething = true;
                    parts.splice(dd - 1, 2);
                    dd -= 2;
                }
            }
        } while (didSomething);
        return parts.length === 0 ? [''] : parts;
    }
    // First phase: single-pattern processing
    // <pre> is 1 or more portions
    // <rest> is 1 or more portions
    // <p> is any portion other than ., .., '', or **
    // <e> is . or ''
    //
    // **/.. is *brutal* for filesystem walking performance, because
    // it effectively resets the recursive walk each time it occurs,
    // and ** cannot be reduced out by a .. pattern part like a regexp
    // or most strings (other than .., ., and '') can be.
    //
    // <pre>/**/../<p>/<p>/<rest> -> {<pre>/../<p>/<p>/<rest>,<pre>/**/<p>/<p>/<rest>}
    // <pre>/<e>/<rest> -> <pre>/<rest>
    // <pre>/<p>/../<rest> -> <pre>/<rest>
    // **/**/<rest> -> **/<rest>
    //
    // **/*/<rest> -> */**/<rest> <== not valid because ** doesn't follow
    // this WOULD be allowed if ** did follow symlinks, or * didn't
    firstPhasePreProcess(globParts) {
        let didSomething = false;
        do {
            didSomething = false;
            // <pre>/**/../<p>/<p>/<rest> -> {<pre>/../<p>/<p>/<rest>,<pre>/**/<p>/<p>/<rest>}
            for (let parts of globParts) {
                let gs = -1;
                while (-1 !== (gs = parts.indexOf('**', gs + 1))) {
                    let gss = gs;
                    while (parts[gss + 1] === '**') {
                        // <pre>/**/**/<rest> -> <pre>/**/<rest>
                        gss++;
                    }
                    // eg, if gs is 2 and gss is 4, that means we have 3 **
                    // parts, and can remove 2 of them.
                    if (gss > gs) {
                        parts.splice(gs + 1, gss - gs);
                    }
                    let next = parts[gs + 1];
                    const p = parts[gs + 2];
                    const p2 = parts[gs + 3];
                    if (next !== '..')
                        continue;
                    if (!p ||
                        p === '.' ||
                        p === '..' ||
                        !p2 ||
                        p2 === '.' ||
                        p2 === '..') {
                        continue;
                    }
                    didSomething = true;
                    // edit parts in place, and push the new one
                    parts.splice(gs, 1);
                    const other = parts.slice(0);
                    other[gs] = '**';
                    globParts.push(other);
                    gs--;
                }
                // <pre>/<e>/<rest> -> <pre>/<rest>
                if (!this.preserveMultipleSlashes) {
                    for (let i = 1; i < parts.length - 1; i++) {
                        const p = parts[i];
                        // don't squeeze out UNC patterns
                        if (i === 1 && p === '' && parts[0] === '')
                            continue;
                        if (p === '.' || p === '') {
                            didSomething = true;
                            parts.splice(i, 1);
                            i--;
                        }
                    }
                    if (parts[0] === '.' &&
                        parts.length === 2 &&
                        (parts[1] === '.' || parts[1] === '')) {
                        didSomething = true;
                        parts.pop();
                    }
                }
                // <pre>/<p>/../<rest> -> <pre>/<rest>
                let dd = 0;
                while (-1 !== (dd = parts.indexOf('..', dd + 1))) {
                    const p = parts[dd - 1];
                    if (p && p !== '.' && p !== '..' && p !== '**') {
                        didSomething = true;
                        const needDot = dd === 1 && parts[dd + 1] === '**';
                        const splin = needDot ? ['.'] : [];
                        parts.splice(dd - 1, 2, ...splin);
                        if (parts.length === 0)
                            parts.push('');
                        dd -= 2;
                    }
                }
            }
        } while (didSomething);
        return globParts;
    }
    // second phase: multi-pattern dedupes
    // {<pre>/*/<rest>,<pre>/<p>/<rest>} -> <pre>/*/<rest>
    // {<pre>/<rest>,<pre>/<rest>} -> <pre>/<rest>
    // {<pre>/**/<rest>,<pre>/<rest>} -> <pre>/**/<rest>
    //
    // {<pre>/**/<rest>,<pre>/**/<p>/<rest>} -> <pre>/**/<rest>
    // ^-- not valid because ** doens't follow symlinks
    secondPhasePreProcess(globParts) {
        for (let i = 0; i < globParts.length - 1; i++) {
            for (let j = i + 1; j < globParts.length; j++) {
                const matched = this.partsMatch(globParts[i], globParts[j], !this.preserveMultipleSlashes);
                if (matched) {
                    globParts[i] = [];
                    globParts[j] = matched;
                    break;
                }
            }
        }
        return globParts.filter(gs => gs.length);
    }
    partsMatch(a, b, emptyGSMatch = false) {
        let ai = 0;
        let bi = 0;
        let result = [];
        let which = '';
        while (ai < a.length && bi < b.length) {
            if (a[ai] === b[bi]) {
                result.push(which === 'b' ? b[bi] : a[ai]);
                ai++;
                bi++;
            }
            else if (emptyGSMatch && a[ai] === '**' && b[bi] === a[ai + 1]) {
                result.push(a[ai]);
                ai++;
            }
            else if (emptyGSMatch && b[bi] === '**' && a[ai] === b[bi + 1]) {
                result.push(b[bi]);
                bi++;
            }
            else if (a[ai] === '*' &&
                b[bi] &&
                (this.options.dot || !b[bi].startsWith('.')) &&
                b[bi] !== '**') {
                if (which === 'b')
                    return false;
                which = 'a';
                result.push(a[ai]);
                ai++;
                bi++;
            }
            else if (b[bi] === '*' &&
                a[ai] &&
                (this.options.dot || !a[ai].startsWith('.')) &&
                a[ai] !== '**') {
                if (which === 'a')
                    return false;
                which = 'b';
                result.push(b[bi]);
                ai++;
                bi++;
            }
            else {
                return false;
            }
        }
        // if we fall out of the loop, it means they two are identical
        // as long as their lengths match
        return a.length === b.length && result;
    }
    parseNegate() {
        if (this.nonegate)
            return;
        const pattern = this.pattern;
        let negate = false;
        let negateOffset = 0;
        for (let i = 0; i < pattern.length && pattern.charAt(i) === '!'; i++) {
            negate = !negate;
            negateOffset++;
        }
        if (negateOffset)
            this.pattern = pattern.slice(negateOffset);
        this.negate = negate;
    }
    // set partial to true to test if, for example,
    // "/a/b" matches the start of "/*/b/*/d"
    // Partial means, if you run out of file before you run
    // out of pattern, then that's fine, as long as all
    // the parts match.
    matchOne(file, pattern, partial = false) {
        let fileStartIndex = 0;
        let patternStartIndex = 0;
        // UNC paths like //?/X:/... can match X:/... and vice versa
        // Drive letters in absolute drive or unc paths are always compared
        // case-insensitively.
        if (this.isWindows) {
            const fileDrive = typeof file[0] === 'string' && /^[a-z]:$/i.test(file[0]);
            const fileUNC = !fileDrive &&
                file[0] === '' &&
                file[1] === '' &&
                file[2] === '?' &&
                /^[a-z]:$/i.test(file[3]);
            const patternDrive = typeof pattern[0] === 'string' && /^[a-z]:$/i.test(pattern[0]);
            const patternUNC = !patternDrive &&
                pattern[0] === '' &&
                pattern[1] === '' &&
                pattern[2] === '?' &&
                typeof pattern[3] === 'string' &&
                /^[a-z]:$/i.test(pattern[3]);
            const fdi = fileUNC ? 3
                : fileDrive ? 0
                    : undefined;
            const pdi = patternUNC ? 3
                : patternDrive ? 0
                    : undefined;
            if (typeof fdi === 'number' && typeof pdi === 'number') {
                const [fd, pd] = [
                    file[fdi],
                    pattern[pdi],
                ];
                // start matching at the drive letter index of each
                if (fd.toLowerCase() === pd.toLowerCase()) {
                    pattern[pdi] = fd;
                    patternStartIndex = pdi;
                    fileStartIndex = fdi;
                }
            }
        }
        // resolve and reduce . and .. portions in the file as well.
        // don't need to do the second phase, because it's only one string[]
        const { optimizationLevel = 1 } = this.options;
        if (optimizationLevel >= 2) {
            file = this.levelTwoFileOptimize(file);
        }
        if (pattern.includes(GLOBSTAR)) {
            return this.#matchGlobstar(file, pattern, partial, fileStartIndex, patternStartIndex);
        }
        return this.#matchOne(file, pattern, partial, fileStartIndex, patternStartIndex);
    }
    #matchGlobstar(file, pattern, partial, fileIndex, patternIndex) {
        // split the pattern into head, tail, and middle of ** delimited parts
        const firstgs = pattern.indexOf(GLOBSTAR, patternIndex);
        const lastgs = pattern.lastIndexOf(GLOBSTAR);
        // split the pattern up into globstar-delimited sections
        // the tail has to be at the end, and the others just have
        // to be found in order from the head.
        const [head, body, tail] = partial ?
            [
                pattern.slice(patternIndex, firstgs),
                pattern.slice(firstgs + 1),
                [],
            ]
            : [
                pattern.slice(patternIndex, firstgs),
                pattern.slice(firstgs + 1, lastgs),
                pattern.slice(lastgs + 1),
            ];
        // check the head, from the current file/pattern index.
        if (head.length) {
            const fileHead = file.slice(fileIndex, fileIndex + head.length);
            if (!this.#matchOne(fileHead, head, partial, 0, 0)) {
                return false;
            }
            fileIndex += head.length;
            patternIndex += head.length;
        }
        // now we know the head matches!
        // if the last portion is not empty, it MUST match the end
        // check the tail
        let fileTailMatch = 0;
        if (tail.length) {
            // if head + tail > file, then we cannot possibly match
            if (tail.length + fileIndex > file.length)
                return false;
            // try to match the tail
            let tailStart = file.length - tail.length;
            if (this.#matchOne(file, tail, partial, tailStart, 0)) {
                fileTailMatch = tail.length;
            }
            else {
                // affordance for stuff like a/**/* matching a/b/
                // if the last file portion is '', and there's more to the pattern
                // then try without the '' bit.
                if (file[file.length - 1] !== '' ||
                    fileIndex + tail.length === file.length) {
                    return false;
                }
                tailStart--;
                if (!this.#matchOne(file, tail, partial, tailStart, 0)) {
                    return false;
                }
                fileTailMatch = tail.length + 1;
            }
        }
        // now we know the tail matches!
        // the middle is zero or more portions wrapped in **, possibly
        // containing more ** sections.
        // so a/**/b/**/c/**/d has become **/b/**/c/**
        // if it's empty, it means a/**/b, just verify we have no bad dots
        // if there's no tail, so it ends on /**, then we must have *something*
        // after the head, or it's not a matc
        if (!body.length) {
            let sawSome = !!fileTailMatch;
            for (let i = fileIndex; i < file.length - fileTailMatch; i++) {
                const f = String(file[i]);
                sawSome = true;
                if (f === '.' ||
                    f === '..' ||
                    (!this.options.dot && f.startsWith('.'))) {
                    return false;
                }
            }
            // in partial mode, we just need to get past all file parts
            return partial || sawSome;
        }
        // now we know that there's one or more body sections, which can
        // be matched anywhere from the 0 index (because the head was pruned)
        // through to the length-fileTailMatch index.
        // split the body up into sections, and note the minimum index it can
        // be found at (start with the length of all previous segments)
        // [section, before, after]
        const bodySegments = [[[], 0]];
        let currentBody = bodySegments[0];
        let nonGsParts = 0;
        const nonGsPartsSums = [0];
        for (const b of body) {
            if (b === GLOBSTAR) {
                nonGsPartsSums.push(nonGsParts);
                currentBody = [[], 0];
                bodySegments.push(currentBody);
            }
            else {
                currentBody[0].push(b);
                nonGsParts++;
            }
        }
        let i = bodySegments.length - 1;
        const fileLength = file.length - fileTailMatch;
        for (const b of bodySegments) {
            b[1] = fileLength - (nonGsPartsSums[i--] + b[0].length);
        }
        return !!this.#matchGlobStarBodySections(file, bodySegments, fileIndex, 0, partial, 0, !!fileTailMatch);
    }
    // return false for "nope, not matching"
    // return null for "not matching, cannot keep trying"
    #matchGlobStarBodySections(file, 
    // pattern section, last possible position for it
    bodySegments, fileIndex, bodyIndex, partial, globStarDepth, sawTail) {
        // take the first body segment, and walk from fileIndex to its "after"
        // value at the end
        // If it doesn't match at that position, we increment, until we hit
        // that final possible position, and give up.
        // If it does match, then advance and try to rest.
        // If any of them fail we keep walking forward.
        // this is still a bit recursively painful, but it's more constrained
        // than previous implementations, because we never test something that
        // can't possibly be a valid matching condition.
        const bs = bodySegments[bodyIndex];
        if (!bs) {
            // just make sure that there's no bad dots
            for (let i = fileIndex; i < file.length; i++) {
                sawTail = true;
                const f = file[i];
                if (f === '.' ||
                    f === '..' ||
                    (!this.options.dot && f.startsWith('.'))) {
                    return false;
                }
            }
            return sawTail;
        }
        // have a non-globstar body section to test
        const [body, after] = bs;
        while (fileIndex <= after) {
            const m = this.#matchOne(file.slice(0, fileIndex + body.length), body, partial, fileIndex, 0);
            // if limit exceeded, no match. intentional false negative,
            // acceptable break in correctness for security.
            if (m && globStarDepth < this.maxGlobstarRecursion) {
                // match! see if the rest match. if so, we're done!
                const sub = this.#matchGlobStarBodySections(file, bodySegments, fileIndex + body.length, bodyIndex + 1, partial, globStarDepth + 1, sawTail);
                if (sub !== false) {
                    return sub;
                }
            }
            const f = file[fileIndex];
            if (f === '.' ||
                f === '..' ||
                (!this.options.dot && f.startsWith('.'))) {
                return false;
            }
            fileIndex++;
        }
        // walked off. no point continuing
        return partial || null;
    }
    #matchOne(file, pattern, partial, fileIndex, patternIndex) {
        let fi;
        let pi;
        let pl;
        let fl;
        for (fi = fileIndex,
            pi = patternIndex,
            fl = file.length,
            pl = pattern.length; fi < fl && pi < pl; fi++, pi++) {
            this.debug('matchOne loop');
            let p = pattern[pi];
            let f = file[fi];
            this.debug(pattern, p, f);
            // should be impossible.
            // some invalid regexp stuff in the set.
            /* c8 ignore start */
            if (p === false || p === GLOBSTAR) {
                return false;
            }
            /* c8 ignore stop */
            // something other than **
            // non-magic patterns just have to match exactly
            // patterns with magic have been turned into regexps.
            let hit;
            if (typeof p === 'string') {
                hit = f === p;
                this.debug('string match', p, f, hit);
            }
            else {
                hit = p.test(f);
                this.debug('pattern match', p, f, hit);
            }
            if (!hit)
                return false;
        }
        // Note: ending in / means that we'll get a final ""
        // at the end of the pattern.  This can only match a
        // corresponding "" at the end of the file.
        // If the file ends in /, then it can only match a
        // a pattern that ends in /, unless the pattern just
        // doesn't have any more for it. But, a/b/ should *not*
        // match "a/b/*", even though "" matches against the
        // [^/]*? pattern, except in partial mode, where it might
        // simply not be reached yet.
        // However, a/b/ should still satisfy a/*
        // now either we fell off the end of the pattern, or we're done.
        if (fi === fl && pi === pl) {
            // ran out of pattern and filename at the same time.
            // an exact hit!
            return true;
        }
        else if (fi === fl) {
            // ran out of file, but still had pattern left.
            // this is ok if we're doing the match as part of
            // a glob fs traversal.
            return partial;
        }
        else if (pi === pl) {
            // ran out of pattern, still have file left.
            // this is only acceptable if we're on the very last
            // empty segment of a file with a trailing slash.
            // a/* should match a/b/
            return fi === fl - 1 && file[fi] === '';
            /* c8 ignore start */
        }
        else {
            // should be unreachable.
            throw new Error('wtf?');
        }
        /* c8 ignore stop */
    }
    braceExpand() {
        return braceExpand(this.pattern, this.options);
    }
    parse(pattern) {
        (0,_assert_valid_pattern_js__WEBPACK_IMPORTED_MODULE_1__.assertValidPattern)(pattern);
        const options = this.options;
        // shortcuts
        if (pattern === '**')
            return GLOBSTAR;
        if (pattern === '')
            return '';
        // far and away, the most common glob pattern parts are
        // *, *.*, and *.<ext>  Add a fast check method for those.
        let m;
        let fastTest = null;
        if ((m = pattern.match(starRE))) {
            fastTest = options.dot ? starTestDot : starTest;
        }
        else if ((m = pattern.match(starDotExtRE))) {
            fastTest = (options.nocase ?
                options.dot ?
                    starDotExtTestNocaseDot
                    : starDotExtTestNocase
                : options.dot ? starDotExtTestDot
                    : starDotExtTest)(m[1]);
        }
        else if ((m = pattern.match(qmarksRE))) {
            fastTest = (options.nocase ?
                options.dot ?
                    qmarksTestNocaseDot
                    : qmarksTestNocase
                : options.dot ? qmarksTestDot
                    : qmarksTest)(m);
        }
        else if ((m = pattern.match(starDotStarRE))) {
            fastTest = options.dot ? starDotStarTestDot : starDotStarTest;
        }
        else if ((m = pattern.match(dotStarRE))) {
            fastTest = dotStarTest;
        }
        const re = _ast_js__WEBPACK_IMPORTED_MODULE_2__.AST.fromGlob(pattern, this.options).toMMPattern();
        if (fastTest && typeof re === 'object') {
            // Avoids overriding in frozen environments
            Reflect.defineProperty(re, 'test', { value: fastTest });
        }
        return re;
    }
    makeRe() {
        if (this.regexp || this.regexp === false)
            return this.regexp;
        // at this point, this.set is a 2d array of partial
        // pattern strings, or "**".
        //
        // It's better to use .match().  This function shouldn't
        // be used, really, but it's pretty convenient sometimes,
        // when you just want to work with a regex.
        const set = this.set;
        if (!set.length) {
            this.regexp = false;
            return this.regexp;
        }
        const options = this.options;
        const twoStar = options.noglobstar ? star
            : options.dot ? twoStarDot
                : twoStarNoDot;
        const flags = new Set(options.nocase ? ['i'] : []);
        // regexpify non-globstar patterns
        // if ** is only item, then we just do one twoStar
        // if ** is first, and there are more, prepend (\/|twoStar\/)? to next
        // if ** is last, append (\/twoStar|) to previous
        // if ** is in the middle, append (\/|\/twoStar\/) to previous
        // then filter out GLOBSTAR symbols
        let re = set
            .map(pattern => {
            const pp = pattern.map(p => {
                if (p instanceof RegExp) {
                    for (const f of p.flags.split(''))
                        flags.add(f);
                }
                return (typeof p === 'string' ? regExpEscape(p)
                    : p === GLOBSTAR ? GLOBSTAR
                        : p._src);
            });
            pp.forEach((p, i) => {
                const next = pp[i + 1];
                const prev = pp[i - 1];
                if (p !== GLOBSTAR || prev === GLOBSTAR) {
                    return;
                }
                if (prev === undefined) {
                    if (next !== undefined && next !== GLOBSTAR) {
                        pp[i + 1] = '(?:\\/|' + twoStar + '\\/)?' + next;
                    }
                    else {
                        pp[i] = twoStar;
                    }
                }
                else if (next === undefined) {
                    pp[i - 1] = prev + '(?:\\/|\\/' + twoStar + ')?';
                }
                else if (next !== GLOBSTAR) {
                    pp[i - 1] = prev + '(?:\\/|\\/' + twoStar + '\\/)' + next;
                    pp[i + 1] = GLOBSTAR;
                }
            });
            const filtered = pp.filter(p => p !== GLOBSTAR);
            // For partial matches, we need to make the pattern match
            // any prefix of the full path. We do this by generating
            // alternative patterns that match progressively longer prefixes.
            if (this.partial && filtered.length >= 1) {
                const prefixes = [];
                for (let i = 1; i <= filtered.length; i++) {
                    prefixes.push(filtered.slice(0, i).join('/'));
                }
                return '(?:' + prefixes.join('|') + ')';
            }
            return filtered.join('/');
        })
            .join('|');
        // need to wrap in parens if we had more than one thing with |,
        // otherwise only the first will be anchored to ^ and the last to $
        const [open, close] = set.length > 1 ? ['(?:', ')'] : ['', ''];
        // must match entire pattern
        // ending in a * or ** will make it less strict.
        re = '^' + open + re + close + '$';
        // In partial mode, '/' should always match as it's a valid prefix for any pattern
        if (this.partial) {
            re = '^(?:\\/|' + open + re.slice(1, -1) + close + ')$';
        }
        // can match anything, as long as it's not this.
        if (this.negate)
            re = '^(?!' + re + ').+$';
        try {
            this.regexp = new RegExp(re, [...flags].join(''));
            /* c8 ignore start */
        }
        catch {
            // should be impossible
            this.regexp = false;
        }
        /* c8 ignore stop */
        return this.regexp;
    }
    slashSplit(p) {
        // if p starts with // on windows, we preserve that
        // so that UNC paths aren't broken.  Otherwise, any number of
        // / characters are coalesced into one, unless
        // preserveMultipleSlashes is set to true.
        if (this.preserveMultipleSlashes) {
            return p.split('/');
        }
        else if (this.isWindows && /^\/\/[^/]+/.test(p)) {
            // add an extra '' for the one we lose
            return ['', ...p.split(/\/+/)];
        }
        else {
            return p.split(/\/+/);
        }
    }
    match(f, partial = this.partial) {
        this.debug('match', f, this.pattern);
        // short-circuit in the case of busted things.
        // comments, etc.
        if (this.comment) {
            return false;
        }
        if (this.empty) {
            return f === '';
        }
        if (f === '/' && partial) {
            return true;
        }
        const options = this.options;
        // windows: need to use /, not \
        if (this.isWindows) {
            f = f.split('\\').join('/');
        }
        // treat the test path as a set of pathparts.
        const ff = this.slashSplit(f);
        this.debug(this.pattern, 'split', ff);
        // just ONE of the pattern sets in this.set needs to match
        // in order for it to be valid.  If negating, then just one
        // match means that we have failed.
        // Either way, return on the first hit.
        const set = this.set;
        this.debug(this.pattern, 'set', set);
        // Find the basename of the path by looking for the last non-empty segment
        let filename = ff[ff.length - 1];
        if (!filename) {
            for (let i = ff.length - 2; !filename && i >= 0; i--) {
                filename = ff[i];
            }
        }
        for (const pattern of set) {
            let file = ff;
            if (options.matchBase && pattern.length === 1) {
                file = [filename];
            }
            const hit = this.matchOne(file, pattern, partial);
            if (hit) {
                if (options.flipNegate) {
                    return true;
                }
                return !this.negate;
            }
        }
        // didn't get any hits.  this is success if it's a negative
        // pattern, failure otherwise.
        if (options.flipNegate) {
            return false;
        }
        return this.negate;
    }
    static defaults(def) {
        return minimatch.defaults(def).Minimatch;
    }
}
/* c8 ignore start */



/* c8 ignore stop */
minimatch.AST = _ast_js__WEBPACK_IMPORTED_MODULE_2__.AST;
minimatch.Minimatch = Minimatch;
minimatch.escape = _escape_js__WEBPACK_IMPORTED_MODULE_3__.escape;
minimatch.unescape = _unescape_js__WEBPACK_IMPORTED_MODULE_4__.unescape;
//# sourceMappingURL=index.js.map

/***/ },

/***/ "./node_modules/glob/node_modules/minimatch/dist/esm/unescape.js"
/*!***********************************************************************!*\
  !*** ./node_modules/glob/node_modules/minimatch/dist/esm/unescape.js ***!
  \***********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   unescape: () => (/* binding */ unescape)
/* harmony export */ });
/**
 * Un-escape a string that has been escaped with {@link escape}.
 *
 * If the {@link MinimatchOptions.windowsPathsNoEscape} option is used, then
 * square-bracket escapes are removed, but not backslash escapes.
 *
 * For example, it will turn the string `'[*]'` into `*`, but it will not
 * turn `'\\*'` into `'*'`, because `\` is a path separator in
 * `windowsPathsNoEscape` mode.
 *
 * When `windowsPathsNoEscape` is not set, then both square-bracket escapes and
 * backslash escapes are removed.
 *
 * Slashes (and backslashes in `windowsPathsNoEscape` mode) cannot be escaped
 * or unescaped.
 *
 * When `magicalBraces` is not set, escapes of braces (`{` and `}`) will not be
 * unescaped.
 */
const unescape = (s, { windowsPathsNoEscape = false, magicalBraces = true, } = {}) => {
    if (magicalBraces) {
        return windowsPathsNoEscape ?
            s.replace(/\[([^/\\])\]/g, '$1')
            : s
                .replace(/((?!\\).|^)\[([^/\\])\]/g, '$1$2')
                .replace(/\\([^/])/g, '$1');
    }
    return windowsPathsNoEscape ?
        s.replace(/\[([^/\\{}])\]/g, '$1')
        : s
            .replace(/((?!\\).|^)\[([^/\\{}])\]/g, '$1$2')
            .replace(/\\([^/{}])/g, '$1');
};
//# sourceMappingURL=unescape.js.map

/***/ },

/***/ "./node_modules/minipass/dist/esm/index.js"
/*!*************************************************!*\
  !*** ./node_modules/minipass/dist/esm/index.js ***!
  \*************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Minipass: () => (/* binding */ Minipass),
/* harmony export */   isReadable: () => (/* binding */ isReadable),
/* harmony export */   isStream: () => (/* binding */ isStream),
/* harmony export */   isWritable: () => (/* binding */ isWritable)
/* harmony export */ });
/* harmony import */ var node_events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! node:events */ "node:events");
/* harmony import */ var node_stream__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! node:stream */ "node:stream");
/* harmony import */ var node_string_decoder__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! node:string_decoder */ "node:string_decoder");
const proc = typeof process === 'object' && process
    ? process
    : {
        stdout: null,
        stderr: null,
    };



/**
 * Return true if the argument is a Minipass stream, Node stream, or something
 * else that Minipass can interact with.
 */
const isStream = (s) => !!s &&
    typeof s === 'object' &&
    (s instanceof Minipass ||
        s instanceof node_stream__WEBPACK_IMPORTED_MODULE_1__ ||
        isReadable(s) ||
        isWritable(s));
/**
 * Return true if the argument is a valid {@link Minipass.Readable}
 */
const isReadable = (s) => !!s &&
    typeof s === 'object' &&
    s instanceof node_events__WEBPACK_IMPORTED_MODULE_0__.EventEmitter &&
    typeof s.pipe === 'function' &&
    // node core Writable streams have a pipe() method, but it throws
    s.pipe !== node_stream__WEBPACK_IMPORTED_MODULE_1__.Writable.prototype.pipe;
/**
 * Return true if the argument is a valid {@link Minipass.Writable}
 */
const isWritable = (s) => !!s &&
    typeof s === 'object' &&
    s instanceof node_events__WEBPACK_IMPORTED_MODULE_0__.EventEmitter &&
    typeof s.write === 'function' &&
    typeof s.end === 'function';
const EOF = Symbol('EOF');
const MAYBE_EMIT_END = Symbol('maybeEmitEnd');
const EMITTED_END = Symbol('emittedEnd');
const EMITTING_END = Symbol('emittingEnd');
const EMITTED_ERROR = Symbol('emittedError');
const CLOSED = Symbol('closed');
const READ = Symbol('read');
const FLUSH = Symbol('flush');
const FLUSHCHUNK = Symbol('flushChunk');
const ENCODING = Symbol('encoding');
const DECODER = Symbol('decoder');
const FLOWING = Symbol('flowing');
const PAUSED = Symbol('paused');
const RESUME = Symbol('resume');
const BUFFER = Symbol('buffer');
const PIPES = Symbol('pipes');
const BUFFERLENGTH = Symbol('bufferLength');
const BUFFERPUSH = Symbol('bufferPush');
const BUFFERSHIFT = Symbol('bufferShift');
const OBJECTMODE = Symbol('objectMode');
// internal event when stream is destroyed
const DESTROYED = Symbol('destroyed');
// internal event when stream has an error
const ERROR = Symbol('error');
const EMITDATA = Symbol('emitData');
const EMITEND = Symbol('emitEnd');
const EMITEND2 = Symbol('emitEnd2');
const ASYNC = Symbol('async');
const ABORT = Symbol('abort');
const ABORTED = Symbol('aborted');
const SIGNAL = Symbol('signal');
const DATALISTENERS = Symbol('dataListeners');
const DISCARDED = Symbol('discarded');
const defer = (fn) => Promise.resolve().then(fn);
const nodefer = (fn) => fn();
const isEndish = (ev) => ev === 'end' || ev === 'finish' || ev === 'prefinish';
const isArrayBufferLike = (b) => b instanceof ArrayBuffer ||
    (!!b &&
        typeof b === 'object' &&
        b.constructor &&
        b.constructor.name === 'ArrayBuffer' &&
        b.byteLength >= 0);
const isArrayBufferView = (b) => !Buffer.isBuffer(b) && ArrayBuffer.isView(b);
/**
 * Internal class representing a pipe to a destination stream.
 *
 * @internal
 */
class Pipe {
    src;
    dest;
    opts;
    ondrain;
    constructor(src, dest, opts) {
        this.src = src;
        this.dest = dest;
        this.opts = opts;
        this.ondrain = () => src[RESUME]();
        this.dest.on('drain', this.ondrain);
    }
    unpipe() {
        this.dest.removeListener('drain', this.ondrain);
    }
    // only here for the prototype
    /* c8 ignore start */
    proxyErrors(_er) { }
    /* c8 ignore stop */
    end() {
        this.unpipe();
        if (this.opts.end)
            this.dest.end();
    }
}
/**
 * Internal class representing a pipe to a destination stream where
 * errors are proxied.
 *
 * @internal
 */
class PipeProxyErrors extends Pipe {
    unpipe() {
        this.src.removeListener('error', this.proxyErrors);
        super.unpipe();
    }
    constructor(src, dest, opts) {
        super(src, dest, opts);
        this.proxyErrors = (er) => this.dest.emit('error', er);
        src.on('error', this.proxyErrors);
    }
}
const isObjectModeOptions = (o) => !!o.objectMode;
const isEncodingOptions = (o) => !o.objectMode && !!o.encoding && o.encoding !== 'buffer';
/**
 * Main export, the Minipass class
 *
 * `RType` is the type of data emitted, defaults to Buffer
 *
 * `WType` is the type of data to be written, if RType is buffer or string,
 * then any {@link Minipass.ContiguousData} is allowed.
 *
 * `Events` is the set of event handler signatures that this object
 * will emit, see {@link Minipass.Events}
 */
class Minipass extends node_events__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
    [FLOWING] = false;
    [PAUSED] = false;
    [PIPES] = [];
    [BUFFER] = [];
    [OBJECTMODE];
    [ENCODING];
    [ASYNC];
    [DECODER];
    [EOF] = false;
    [EMITTED_END] = false;
    [EMITTING_END] = false;
    [CLOSED] = false;
    [EMITTED_ERROR] = null;
    [BUFFERLENGTH] = 0;
    [DESTROYED] = false;
    [SIGNAL];
    [ABORTED] = false;
    [DATALISTENERS] = 0;
    [DISCARDED] = false;
    /**
     * true if the stream can be written
     */
    writable = true;
    /**
     * true if the stream can be read
     */
    readable = true;
    /**
     * If `RType` is Buffer, then options do not need to be provided.
     * Otherwise, an options object must be provided to specify either
     * {@link Minipass.SharedOptions.objectMode} or
     * {@link Minipass.SharedOptions.encoding}, as appropriate.
     */
    constructor(...args) {
        const options = (args[0] ||
            {});
        super();
        if (options.objectMode && typeof options.encoding === 'string') {
            throw new TypeError('Encoding and objectMode may not be used together');
        }
        if (isObjectModeOptions(options)) {
            this[OBJECTMODE] = true;
            this[ENCODING] = null;
        }
        else if (isEncodingOptions(options)) {
            this[ENCODING] = options.encoding;
            this[OBJECTMODE] = false;
        }
        else {
            this[OBJECTMODE] = false;
            this[ENCODING] = null;
        }
        this[ASYNC] = !!options.async;
        this[DECODER] = this[ENCODING]
            ? new node_string_decoder__WEBPACK_IMPORTED_MODULE_2__.StringDecoder(this[ENCODING])
            : null;
        //@ts-ignore - private option for debugging and testing
        if (options && options.debugExposeBuffer === true) {
            Object.defineProperty(this, 'buffer', { get: () => this[BUFFER] });
        }
        //@ts-ignore - private option for debugging and testing
        if (options && options.debugExposePipes === true) {
            Object.defineProperty(this, 'pipes', { get: () => this[PIPES] });
        }
        const { signal } = options;
        if (signal) {
            this[SIGNAL] = signal;
            if (signal.aborted) {
                this[ABORT]();
            }
            else {
                signal.addEventListener('abort', () => this[ABORT]());
            }
        }
    }
    /**
     * The amount of data stored in the buffer waiting to be read.
     *
     * For Buffer strings, this will be the total byte length.
     * For string encoding streams, this will be the string character length,
     * according to JavaScript's `string.length` logic.
     * For objectMode streams, this is a count of the items waiting to be
     * emitted.
     */
    get bufferLength() {
        return this[BUFFERLENGTH];
    }
    /**
     * The `BufferEncoding` currently in use, or `null`
     */
    get encoding() {
        return this[ENCODING];
    }
    /**
     * @deprecated - This is a read only property
     */
    set encoding(_enc) {
        throw new Error('Encoding must be set at instantiation time');
    }
    /**
     * @deprecated - Encoding may only be set at instantiation time
     */
    setEncoding(_enc) {
        throw new Error('Encoding must be set at instantiation time');
    }
    /**
     * True if this is an objectMode stream
     */
    get objectMode() {
        return this[OBJECTMODE];
    }
    /**
     * @deprecated - This is a read-only property
     */
    set objectMode(_om) {
        throw new Error('objectMode must be set at instantiation time');
    }
    /**
     * true if this is an async stream
     */
    get ['async']() {
        return this[ASYNC];
    }
    /**
     * Set to true to make this stream async.
     *
     * Once set, it cannot be unset, as this would potentially cause incorrect
     * behavior.  Ie, a sync stream can be made async, but an async stream
     * cannot be safely made sync.
     */
    set ['async'](a) {
        this[ASYNC] = this[ASYNC] || !!a;
    }
    // drop everything and get out of the flow completely
    [ABORT]() {
        this[ABORTED] = true;
        this.emit('abort', this[SIGNAL]?.reason);
        this.destroy(this[SIGNAL]?.reason);
    }
    /**
     * True if the stream has been aborted.
     */
    get aborted() {
        return this[ABORTED];
    }
    /**
     * No-op setter. Stream aborted status is set via the AbortSignal provided
     * in the constructor options.
     */
    set aborted(_) { }
    write(chunk, encoding, cb) {
        if (this[ABORTED])
            return false;
        if (this[EOF])
            throw new Error('write after end');
        if (this[DESTROYED]) {
            this.emit('error', Object.assign(new Error('Cannot call write after a stream was destroyed'), { code: 'ERR_STREAM_DESTROYED' }));
            return true;
        }
        if (typeof encoding === 'function') {
            cb = encoding;
            encoding = 'utf8';
        }
        if (!encoding)
            encoding = 'utf8';
        const fn = this[ASYNC] ? defer : nodefer;
        // convert array buffers and typed array views into buffers
        // at some point in the future, we may want to do the opposite!
        // leave strings and buffers as-is
        // anything is only allowed if in object mode, so throw
        if (!this[OBJECTMODE] && !Buffer.isBuffer(chunk)) {
            if (isArrayBufferView(chunk)) {
                //@ts-ignore - sinful unsafe type changing
                chunk = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
            }
            else if (isArrayBufferLike(chunk)) {
                //@ts-ignore - sinful unsafe type changing
                chunk = Buffer.from(chunk);
            }
            else if (typeof chunk !== 'string') {
                throw new Error('Non-contiguous data written to non-objectMode stream');
            }
        }
        // handle object mode up front, since it's simpler
        // this yields better performance, fewer checks later.
        if (this[OBJECTMODE]) {
            // maybe impossible?
            /* c8 ignore start */
            if (this[FLOWING] && this[BUFFERLENGTH] !== 0)
                this[FLUSH](true);
            /* c8 ignore stop */
            if (this[FLOWING])
                this.emit('data', chunk);
            else
                this[BUFFERPUSH](chunk);
            if (this[BUFFERLENGTH] !== 0)
                this.emit('readable');
            if (cb)
                fn(cb);
            return this[FLOWING];
        }
        // at this point the chunk is a buffer or string
        // don't buffer it up or send it to the decoder
        if (!chunk.length) {
            if (this[BUFFERLENGTH] !== 0)
                this.emit('readable');
            if (cb)
                fn(cb);
            return this[FLOWING];
        }
        // fast-path writing strings of same encoding to a stream with
        // an empty buffer, skipping the buffer/decoder dance
        if (typeof chunk === 'string' &&
            // unless it is a string already ready for us to use
            !(encoding === this[ENCODING] && !this[DECODER]?.lastNeed)) {
            //@ts-ignore - sinful unsafe type change
            chunk = Buffer.from(chunk, encoding);
        }
        if (Buffer.isBuffer(chunk) && this[ENCODING]) {
            //@ts-ignore - sinful unsafe type change
            chunk = this[DECODER].write(chunk);
        }
        // Note: flushing CAN potentially switch us into not-flowing mode
        if (this[FLOWING] && this[BUFFERLENGTH] !== 0)
            this[FLUSH](true);
        if (this[FLOWING])
            this.emit('data', chunk);
        else
            this[BUFFERPUSH](chunk);
        if (this[BUFFERLENGTH] !== 0)
            this.emit('readable');
        if (cb)
            fn(cb);
        return this[FLOWING];
    }
    /**
     * Low-level explicit read method.
     *
     * In objectMode, the argument is ignored, and one item is returned if
     * available.
     *
     * `n` is the number of bytes (or in the case of encoding streams,
     * characters) to consume. If `n` is not provided, then the entire buffer
     * is returned, or `null` is returned if no data is available.
     *
     * If `n` is greater that the amount of data in the internal buffer,
     * then `null` is returned.
     */
    read(n) {
        if (this[DESTROYED])
            return null;
        this[DISCARDED] = false;
        if (this[BUFFERLENGTH] === 0 ||
            n === 0 ||
            (n && n > this[BUFFERLENGTH])) {
            this[MAYBE_EMIT_END]();
            return null;
        }
        if (this[OBJECTMODE])
            n = null;
        if (this[BUFFER].length > 1 && !this[OBJECTMODE]) {
            // not object mode, so if we have an encoding, then RType is string
            // otherwise, must be Buffer
            this[BUFFER] = [
                (this[ENCODING]
                    ? this[BUFFER].join('')
                    : Buffer.concat(this[BUFFER], this[BUFFERLENGTH])),
            ];
        }
        const ret = this[READ](n || null, this[BUFFER][0]);
        this[MAYBE_EMIT_END]();
        return ret;
    }
    [READ](n, chunk) {
        if (this[OBJECTMODE])
            this[BUFFERSHIFT]();
        else {
            const c = chunk;
            if (n === c.length || n === null)
                this[BUFFERSHIFT]();
            else if (typeof c === 'string') {
                this[BUFFER][0] = c.slice(n);
                chunk = c.slice(0, n);
                this[BUFFERLENGTH] -= n;
            }
            else {
                this[BUFFER][0] = c.subarray(n);
                chunk = c.subarray(0, n);
                this[BUFFERLENGTH] -= n;
            }
        }
        this.emit('data', chunk);
        if (!this[BUFFER].length && !this[EOF])
            this.emit('drain');
        return chunk;
    }
    end(chunk, encoding, cb) {
        if (typeof chunk === 'function') {
            cb = chunk;
            chunk = undefined;
        }
        if (typeof encoding === 'function') {
            cb = encoding;
            encoding = 'utf8';
        }
        if (chunk !== undefined)
            this.write(chunk, encoding);
        if (cb)
            this.once('end', cb);
        this[EOF] = true;
        this.writable = false;
        // if we haven't written anything, then go ahead and emit,
        // even if we're not reading.
        // we'll re-emit if a new 'end' listener is added anyway.
        // This makes MP more suitable to write-only use cases.
        if (this[FLOWING] || !this[PAUSED])
            this[MAYBE_EMIT_END]();
        return this;
    }
    // don't let the internal resume be overwritten
    [RESUME]() {
        if (this[DESTROYED])
            return;
        if (!this[DATALISTENERS] && !this[PIPES].length) {
            this[DISCARDED] = true;
        }
        this[PAUSED] = false;
        this[FLOWING] = true;
        this.emit('resume');
        if (this[BUFFER].length)
            this[FLUSH]();
        else if (this[EOF])
            this[MAYBE_EMIT_END]();
        else
            this.emit('drain');
    }
    /**
     * Resume the stream if it is currently in a paused state
     *
     * If called when there are no pipe destinations or `data` event listeners,
     * this will place the stream in a "discarded" state, where all data will
     * be thrown away. The discarded state is removed if a pipe destination or
     * data handler is added, if pause() is called, or if any synchronous or
     * asynchronous iteration is started.
     */
    resume() {
        return this[RESUME]();
    }
    /**
     * Pause the stream
     */
    pause() {
        this[FLOWING] = false;
        this[PAUSED] = true;
        this[DISCARDED] = false;
    }
    /**
     * true if the stream has been forcibly destroyed
     */
    get destroyed() {
        return this[DESTROYED];
    }
    /**
     * true if the stream is currently in a flowing state, meaning that
     * any writes will be immediately emitted.
     */
    get flowing() {
        return this[FLOWING];
    }
    /**
     * true if the stream is currently in a paused state
     */
    get paused() {
        return this[PAUSED];
    }
    [BUFFERPUSH](chunk) {
        if (this[OBJECTMODE])
            this[BUFFERLENGTH] += 1;
        else
            this[BUFFERLENGTH] += chunk.length;
        this[BUFFER].push(chunk);
    }
    [BUFFERSHIFT]() {
        if (this[OBJECTMODE])
            this[BUFFERLENGTH] -= 1;
        else
            this[BUFFERLENGTH] -= this[BUFFER][0].length;
        return this[BUFFER].shift();
    }
    [FLUSH](noDrain = false) {
        do { } while (this[FLUSHCHUNK](this[BUFFERSHIFT]()) &&
            this[BUFFER].length);
        if (!noDrain && !this[BUFFER].length && !this[EOF])
            this.emit('drain');
    }
    [FLUSHCHUNK](chunk) {
        this.emit('data', chunk);
        return this[FLOWING];
    }
    /**
     * Pipe all data emitted by this stream into the destination provided.
     *
     * Triggers the flow of data.
     */
    pipe(dest, opts) {
        if (this[DESTROYED])
            return dest;
        this[DISCARDED] = false;
        const ended = this[EMITTED_END];
        opts = opts || {};
        if (dest === proc.stdout || dest === proc.stderr)
            opts.end = false;
        else
            opts.end = opts.end !== false;
        opts.proxyErrors = !!opts.proxyErrors;
        // piping an ended stream ends immediately
        if (ended) {
            if (opts.end)
                dest.end();
        }
        else {
            // "as" here just ignores the WType, which pipes don't care about,
            // since they're only consuming from us, and writing to the dest
            this[PIPES].push(!opts.proxyErrors
                ? new Pipe(this, dest, opts)
                : new PipeProxyErrors(this, dest, opts));
            if (this[ASYNC])
                defer(() => this[RESUME]());
            else
                this[RESUME]();
        }
        return dest;
    }
    /**
     * Fully unhook a piped destination stream.
     *
     * If the destination stream was the only consumer of this stream (ie,
     * there are no other piped destinations or `'data'` event listeners)
     * then the flow of data will stop until there is another consumer or
     * {@link Minipass#resume} is explicitly called.
     */
    unpipe(dest) {
        const p = this[PIPES].find(p => p.dest === dest);
        if (p) {
            if (this[PIPES].length === 1) {
                if (this[FLOWING] && this[DATALISTENERS] === 0) {
                    this[FLOWING] = false;
                }
                this[PIPES] = [];
            }
            else
                this[PIPES].splice(this[PIPES].indexOf(p), 1);
            p.unpipe();
        }
    }
    /**
     * Alias for {@link Minipass#on}
     */
    addListener(ev, handler) {
        return this.on(ev, handler);
    }
    /**
     * Mostly identical to `EventEmitter.on`, with the following
     * behavior differences to prevent data loss and unnecessary hangs:
     *
     * - Adding a 'data' event handler will trigger the flow of data
     *
     * - Adding a 'readable' event handler when there is data waiting to be read
     *   will cause 'readable' to be emitted immediately.
     *
     * - Adding an 'endish' event handler ('end', 'finish', etc.) which has
     *   already passed will cause the event to be emitted immediately and all
     *   handlers removed.
     *
     * - Adding an 'error' event handler after an error has been emitted will
     *   cause the event to be re-emitted immediately with the error previously
     *   raised.
     */
    on(ev, handler) {
        const ret = super.on(ev, handler);
        if (ev === 'data') {
            this[DISCARDED] = false;
            this[DATALISTENERS]++;
            if (!this[PIPES].length && !this[FLOWING]) {
                this[RESUME]();
            }
        }
        else if (ev === 'readable' && this[BUFFERLENGTH] !== 0) {
            super.emit('readable');
        }
        else if (isEndish(ev) && this[EMITTED_END]) {
            super.emit(ev);
            this.removeAllListeners(ev);
        }
        else if (ev === 'error' && this[EMITTED_ERROR]) {
            const h = handler;
            if (this[ASYNC])
                defer(() => h.call(this, this[EMITTED_ERROR]));
            else
                h.call(this, this[EMITTED_ERROR]);
        }
        return ret;
    }
    /**
     * Alias for {@link Minipass#off}
     */
    removeListener(ev, handler) {
        return this.off(ev, handler);
    }
    /**
     * Mostly identical to `EventEmitter.off`
     *
     * If a 'data' event handler is removed, and it was the last consumer
     * (ie, there are no pipe destinations or other 'data' event listeners),
     * then the flow of data will stop until there is another consumer or
     * {@link Minipass#resume} is explicitly called.
     */
    off(ev, handler) {
        const ret = super.off(ev, handler);
        // if we previously had listeners, and now we don't, and we don't
        // have any pipes, then stop the flow, unless it's been explicitly
        // put in a discarded flowing state via stream.resume().
        if (ev === 'data') {
            this[DATALISTENERS] = this.listeners('data').length;
            if (this[DATALISTENERS] === 0 &&
                !this[DISCARDED] &&
                !this[PIPES].length) {
                this[FLOWING] = false;
            }
        }
        return ret;
    }
    /**
     * Mostly identical to `EventEmitter.removeAllListeners`
     *
     * If all 'data' event handlers are removed, and they were the last consumer
     * (ie, there are no pipe destinations), then the flow of data will stop
     * until there is another consumer or {@link Minipass#resume} is explicitly
     * called.
     */
    removeAllListeners(ev) {
        const ret = super.removeAllListeners(ev);
        if (ev === 'data' || ev === undefined) {
            this[DATALISTENERS] = 0;
            if (!this[DISCARDED] && !this[PIPES].length) {
                this[FLOWING] = false;
            }
        }
        return ret;
    }
    /**
     * true if the 'end' event has been emitted
     */
    get emittedEnd() {
        return this[EMITTED_END];
    }
    [MAYBE_EMIT_END]() {
        if (!this[EMITTING_END] &&
            !this[EMITTED_END] &&
            !this[DESTROYED] &&
            this[BUFFER].length === 0 &&
            this[EOF]) {
            this[EMITTING_END] = true;
            this.emit('end');
            this.emit('prefinish');
            this.emit('finish');
            if (this[CLOSED])
                this.emit('close');
            this[EMITTING_END] = false;
        }
    }
    /**
     * Mostly identical to `EventEmitter.emit`, with the following
     * behavior differences to prevent data loss and unnecessary hangs:
     *
     * If the stream has been destroyed, and the event is something other
     * than 'close' or 'error', then `false` is returned and no handlers
     * are called.
     *
     * If the event is 'end', and has already been emitted, then the event
     * is ignored. If the stream is in a paused or non-flowing state, then
     * the event will be deferred until data flow resumes. If the stream is
     * async, then handlers will be called on the next tick rather than
     * immediately.
     *
     * If the event is 'close', and 'end' has not yet been emitted, then
     * the event will be deferred until after 'end' is emitted.
     *
     * If the event is 'error', and an AbortSignal was provided for the stream,
     * and there are no listeners, then the event is ignored, matching the
     * behavior of node core streams in the presense of an AbortSignal.
     *
     * If the event is 'finish' or 'prefinish', then all listeners will be
     * removed after emitting the event, to prevent double-firing.
     */
    emit(ev, ...args) {
        const data = args[0];
        // error and close are only events allowed after calling destroy()
        if (ev !== 'error' &&
            ev !== 'close' &&
            ev !== DESTROYED &&
            this[DESTROYED]) {
            return false;
        }
        else if (ev === 'data') {
            return !this[OBJECTMODE] && !data
                ? false
                : this[ASYNC]
                    ? (defer(() => this[EMITDATA](data)), true)
                    : this[EMITDATA](data);
        }
        else if (ev === 'end') {
            return this[EMITEND]();
        }
        else if (ev === 'close') {
            this[CLOSED] = true;
            // don't emit close before 'end' and 'finish'
            if (!this[EMITTED_END] && !this[DESTROYED])
                return false;
            const ret = super.emit('close');
            this.removeAllListeners('close');
            return ret;
        }
        else if (ev === 'error') {
            this[EMITTED_ERROR] = data;
            super.emit(ERROR, data);
            const ret = !this[SIGNAL] || this.listeners('error').length
                ? super.emit('error', data)
                : false;
            this[MAYBE_EMIT_END]();
            return ret;
        }
        else if (ev === 'resume') {
            const ret = super.emit('resume');
            this[MAYBE_EMIT_END]();
            return ret;
        }
        else if (ev === 'finish' || ev === 'prefinish') {
            const ret = super.emit(ev);
            this.removeAllListeners(ev);
            return ret;
        }
        // Some other unknown event
        const ret = super.emit(ev, ...args);
        this[MAYBE_EMIT_END]();
        return ret;
    }
    [EMITDATA](data) {
        for (const p of this[PIPES]) {
            if (p.dest.write(data) === false)
                this.pause();
        }
        const ret = this[DISCARDED] ? false : super.emit('data', data);
        this[MAYBE_EMIT_END]();
        return ret;
    }
    [EMITEND]() {
        if (this[EMITTED_END])
            return false;
        this[EMITTED_END] = true;
        this.readable = false;
        return this[ASYNC]
            ? (defer(() => this[EMITEND2]()), true)
            : this[EMITEND2]();
    }
    [EMITEND2]() {
        if (this[DECODER]) {
            const data = this[DECODER].end();
            if (data) {
                for (const p of this[PIPES]) {
                    p.dest.write(data);
                }
                if (!this[DISCARDED])
                    super.emit('data', data);
            }
        }
        for (const p of this[PIPES]) {
            p.end();
        }
        const ret = super.emit('end');
        this.removeAllListeners('end');
        return ret;
    }
    /**
     * Return a Promise that resolves to an array of all emitted data once
     * the stream ends.
     */
    async collect() {
        const buf = Object.assign([], {
            dataLength: 0,
        });
        if (!this[OBJECTMODE])
            buf.dataLength = 0;
        // set the promise first, in case an error is raised
        // by triggering the flow here.
        const p = this.promise();
        this.on('data', c => {
            buf.push(c);
            if (!this[OBJECTMODE])
                buf.dataLength += c.length;
        });
        await p;
        return buf;
    }
    /**
     * Return a Promise that resolves to the concatenation of all emitted data
     * once the stream ends.
     *
     * Not allowed on objectMode streams.
     */
    async concat() {
        if (this[OBJECTMODE]) {
            throw new Error('cannot concat in objectMode');
        }
        const buf = await this.collect();
        return (this[ENCODING]
            ? buf.join('')
            : Buffer.concat(buf, buf.dataLength));
    }
    /**
     * Return a void Promise that resolves once the stream ends.
     */
    async promise() {
        return new Promise((resolve, reject) => {
            this.on(DESTROYED, () => reject(new Error('stream destroyed')));
            this.on('error', er => reject(er));
            this.on('end', () => resolve());
        });
    }
    /**
     * Asynchronous `for await of` iteration.
     *
     * This will continue emitting all chunks until the stream terminates.
     */
    [Symbol.asyncIterator]() {
        // set this up front, in case the consumer doesn't call next()
        // right away.
        this[DISCARDED] = false;
        let stopped = false;
        const stop = async () => {
            this.pause();
            stopped = true;
            return { value: undefined, done: true };
        };
        const next = () => {
            if (stopped)
                return stop();
            const res = this.read();
            if (res !== null)
                return Promise.resolve({ done: false, value: res });
            if (this[EOF])
                return stop();
            let resolve;
            let reject;
            const onerr = (er) => {
                this.off('data', ondata);
                this.off('end', onend);
                this.off(DESTROYED, ondestroy);
                stop();
                reject(er);
            };
            const ondata = (value) => {
                this.off('error', onerr);
                this.off('end', onend);
                this.off(DESTROYED, ondestroy);
                this.pause();
                resolve({ value, done: !!this[EOF] });
            };
            const onend = () => {
                this.off('error', onerr);
                this.off('data', ondata);
                this.off(DESTROYED, ondestroy);
                stop();
                resolve({ done: true, value: undefined });
            };
            const ondestroy = () => onerr(new Error('stream destroyed'));
            return new Promise((res, rej) => {
                reject = rej;
                resolve = res;
                this.once(DESTROYED, ondestroy);
                this.once('error', onerr);
                this.once('end', onend);
                this.once('data', ondata);
            });
        };
        return {
            next,
            throw: stop,
            return: stop,
            [Symbol.asyncIterator]() {
                return this;
            },
            [Symbol.asyncDispose]: async () => { },
        };
    }
    /**
     * Synchronous `for of` iteration.
     *
     * The iteration will terminate when the internal buffer runs out, even
     * if the stream has not yet terminated.
     */
    [Symbol.iterator]() {
        // set this up front, in case the consumer doesn't call next()
        // right away.
        this[DISCARDED] = false;
        let stopped = false;
        const stop = () => {
            this.pause();
            this.off(ERROR, stop);
            this.off(DESTROYED, stop);
            this.off('end', stop);
            stopped = true;
            return { done: true, value: undefined };
        };
        const next = () => {
            if (stopped)
                return stop();
            const value = this.read();
            return value === null ? stop() : { done: false, value };
        };
        this.once('end', stop);
        this.once(ERROR, stop);
        this.once(DESTROYED, stop);
        return {
            next,
            throw: stop,
            return: stop,
            [Symbol.iterator]() {
                return this;
            },
            [Symbol.dispose]: () => { },
        };
    }
    /**
     * Destroy a stream, preventing it from being used for any further purpose.
     *
     * If the stream has a `close()` method, then it will be called on
     * destruction.
     *
     * After destruction, any attempt to write data, read data, or emit most
     * events will be ignored.
     *
     * If an error argument is provided, then it will be emitted in an
     * 'error' event.
     */
    destroy(er) {
        if (this[DESTROYED]) {
            if (er)
                this.emit('error', er);
            else
                this.emit(DESTROYED);
            return this;
        }
        this[DESTROYED] = true;
        this[DISCARDED] = true;
        // throw away all buffered data, it's never coming out
        this[BUFFER].length = 0;
        this[BUFFERLENGTH] = 0;
        const wc = this;
        if (typeof wc.close === 'function' && !this[CLOSED])
            wc.close();
        if (er)
            this.emit('error', er);
        // if no error to emit, still reject pending promises
        else
            this.emit(DESTROYED);
        return this;
    }
    /**
     * Alias for {@link isStream}
     *
     * Former export location, maintained for backwards compatibility.
     *
     * @deprecated
     */
    static get isStream() {
        return isStream;
    }
}
//# sourceMappingURL=index.js.map

/***/ },

/***/ "./node_modules/path-scurry/dist/esm/index.js"
/*!****************************************************!*\
  !*** ./node_modules/path-scurry/dist/esm/index.js ***!
  \****************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

var node_fs__WEBPACK_IMPORTED_MODULE_4___namespace_cache;
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ChildrenCache: () => (/* binding */ ChildrenCache),
/* harmony export */   Path: () => (/* binding */ Path),
/* harmony export */   PathBase: () => (/* binding */ PathBase),
/* harmony export */   PathPosix: () => (/* binding */ PathPosix),
/* harmony export */   PathScurry: () => (/* binding */ PathScurry),
/* harmony export */   PathScurryBase: () => (/* binding */ PathScurryBase),
/* harmony export */   PathScurryDarwin: () => (/* binding */ PathScurryDarwin),
/* harmony export */   PathScurryPosix: () => (/* binding */ PathScurryPosix),
/* harmony export */   PathScurryWin32: () => (/* binding */ PathScurryWin32),
/* harmony export */   PathWin32: () => (/* binding */ PathWin32),
/* harmony export */   ResolveCache: () => (/* binding */ ResolveCache)
/* harmony export */ });
/* harmony import */ var lru_cache__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lru-cache */ "./node_modules/path-scurry/node_modules/lru-cache/dist/esm/node/index.min.js");
/* harmony import */ var node_path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! node:path */ "node:path");
/* harmony import */ var node_url__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! node:url */ "node:url");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var node_fs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! node:fs */ "node:fs");
/* harmony import */ var node_fs_promises__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! node:fs/promises */ "node:fs/promises");
/* harmony import */ var minipass__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! minipass */ "./node_modules/minipass/dist/esm/index.js");





const realpathSync = fs__WEBPACK_IMPORTED_MODULE_3__.realpathSync.native;
// TODO: test perf of fs/promises realpath vs realpathCB,
// since the promises one uses realpath.native


const defaultFS = {
    lstatSync: fs__WEBPACK_IMPORTED_MODULE_3__.lstatSync,
    readdir: fs__WEBPACK_IMPORTED_MODULE_3__.readdir,
    readdirSync: fs__WEBPACK_IMPORTED_MODULE_3__.readdirSync,
    readlinkSync: fs__WEBPACK_IMPORTED_MODULE_3__.readlinkSync,
    realpathSync,
    promises: {
        lstat: node_fs_promises__WEBPACK_IMPORTED_MODULE_5__.lstat,
        readdir: node_fs_promises__WEBPACK_IMPORTED_MODULE_5__.readdir,
        readlink: node_fs_promises__WEBPACK_IMPORTED_MODULE_5__.readlink,
        realpath: node_fs_promises__WEBPACK_IMPORTED_MODULE_5__.realpath,
    },
};
// if they just gave us require('fs') then use our default
const fsFromOption = (fsOption) => !fsOption || fsOption === defaultFS || fsOption === /*#__PURE__*/ (node_fs__WEBPACK_IMPORTED_MODULE_4___namespace_cache || (node_fs__WEBPACK_IMPORTED_MODULE_4___namespace_cache = __webpack_require__.t(node_fs__WEBPACK_IMPORTED_MODULE_4__, 2))) ?
    defaultFS
    : {
        ...defaultFS,
        ...fsOption,
        promises: {
            ...defaultFS.promises,
            ...(fsOption.promises || {}),
        },
    };
// turn something like //?/c:/ into c:\
const uncDriveRegexp = /^\\\\\?\\([a-z]:)\\?$/i;
const uncToDrive = (rootPath) => rootPath.replace(/\//g, '\\').replace(uncDriveRegexp, '$1\\');
// windows paths are separated by either / or \
const eitherSep = /[\\\/]/;
const UNKNOWN = 0; // may not even exist, for all we know
const IFIFO = 0b0001;
const IFCHR = 0b0010;
const IFDIR = 0b0100;
const IFBLK = 0b0110;
const IFREG = 0b1000;
const IFLNK = 0b1010;
const IFSOCK = 0b1100;
const IFMT = 0b1111;
// mask to unset low 4 bits
const IFMT_UNKNOWN = ~IFMT;
// set after successfully calling readdir() and getting entries.
const READDIR_CALLED = 0b0000_0001_0000;
// set after a successful lstat()
const LSTAT_CALLED = 0b0000_0010_0000;
// set if an entry (or one of its parents) is definitely not a dir
const ENOTDIR = 0b0000_0100_0000;
// set if an entry (or one of its parents) does not exist
// (can also be set on lstat errors like EACCES or ENAMETOOLONG)
const ENOENT = 0b0000_1000_0000;
// cannot have child entries -- also verify &IFMT is either IFDIR or IFLNK
// set if we fail to readlink
const ENOREADLINK = 0b0001_0000_0000;
// set if we know realpath() will fail
const ENOREALPATH = 0b0010_0000_0000;
const ENOCHILD = ENOTDIR | ENOENT | ENOREALPATH;
const TYPEMASK = 0b0011_1111_1111;
const entToType = (s) => s.isFile() ? IFREG
    : s.isDirectory() ? IFDIR
        : s.isSymbolicLink() ? IFLNK
            : s.isCharacterDevice() ? IFCHR
                : s.isBlockDevice() ? IFBLK
                    : s.isSocket() ? IFSOCK
                        : s.isFIFO() ? IFIFO
                            : UNKNOWN;
// normalize unicode path names
const normalizeCache = new lru_cache__WEBPACK_IMPORTED_MODULE_0__.LRUCache({ max: 2 ** 12 });
const normalize = (s) => {
    const c = normalizeCache.get(s);
    if (c)
        return c;
    const n = s.normalize('NFKD');
    normalizeCache.set(s, n);
    return n;
};
const normalizeNocaseCache = new lru_cache__WEBPACK_IMPORTED_MODULE_0__.LRUCache({ max: 2 ** 12 });
const normalizeNocase = (s) => {
    const c = normalizeNocaseCache.get(s);
    if (c)
        return c;
    const n = normalize(s.toLowerCase());
    normalizeNocaseCache.set(s, n);
    return n;
};
/**
 * An LRUCache for storing resolved path strings or Path objects.
 * @internal
 */
class ResolveCache extends lru_cache__WEBPACK_IMPORTED_MODULE_0__.LRUCache {
    constructor() {
        super({ max: 256 });
    }
}
// In order to prevent blowing out the js heap by allocating hundreds of
// thousands of Path entries when walking extremely large trees, the "children"
// in this tree are represented by storing an array of Path entries in an
// LRUCache, indexed by the parent.  At any time, Path.children() may return an
// empty array, indicating that it doesn't know about any of its children, and
// thus has to rebuild that cache.  This is fine, it just means that we don't
// benefit as much from having the cached entries, but huge directory walks
// don't blow out the stack, and smaller ones are still as fast as possible.
//
//It does impose some complexity when building up the readdir data, because we
//need to pass a reference to the children array that we started with.
/**
 * an LRUCache for storing child entries.
 * @internal
 */
class ChildrenCache extends lru_cache__WEBPACK_IMPORTED_MODULE_0__.LRUCache {
    constructor(maxSize = 16 * 1024) {
        super({
            maxSize,
            // parent + children
            sizeCalculation: a => a.length + 1,
        });
    }
}
const setAsCwd = Symbol('PathScurry setAsCwd');
/**
 * Path objects are sort of like a super-powered
 * {@link https://nodejs.org/docs/latest/api/fs.html#class-fsdirent fs.Dirent}
 *
 * Each one represents a single filesystem entry on disk, which may or may not
 * exist. It includes methods for reading various types of information via
 * lstat, readlink, and readdir, and caches all information to the greatest
 * degree possible.
 *
 * Note that fs operations that would normally throw will instead return an
 * "empty" value. This is in order to prevent excessive overhead from error
 * stack traces.
 */
class PathBase {
    /**
     * the basename of this path
     *
     * **Important**: *always* test the path name against any test string
     * usingthe {@link isNamed} method, and not by directly comparing this
     * string. Otherwise, unicode path strings that the system sees as identical
     * will not be properly treated as the same path, leading to incorrect
     * behavior and possible security issues.
     */
    name;
    /**
     * the Path entry corresponding to the path root.
     *
     * @internal
     */
    root;
    /**
     * All roots found within the current PathScurry family
     *
     * @internal
     */
    roots;
    /**
     * a reference to the parent path, or undefined in the case of root entries
     *
     * @internal
     */
    parent;
    /**
     * boolean indicating whether paths are compared case-insensitively
     * @internal
     */
    nocase;
    /**
     * boolean indicating that this path is the current working directory
     * of the PathScurry collection that contains it.
     */
    isCWD = false;
    // potential default fs override
    #fs;
    // Stats fields
    #dev;
    get dev() {
        return this.#dev;
    }
    #mode;
    get mode() {
        return this.#mode;
    }
    #nlink;
    get nlink() {
        return this.#nlink;
    }
    #uid;
    get uid() {
        return this.#uid;
    }
    #gid;
    get gid() {
        return this.#gid;
    }
    #rdev;
    get rdev() {
        return this.#rdev;
    }
    #blksize;
    get blksize() {
        return this.#blksize;
    }
    #ino;
    get ino() {
        return this.#ino;
    }
    #size;
    get size() {
        return this.#size;
    }
    #blocks;
    get blocks() {
        return this.#blocks;
    }
    #atimeMs;
    get atimeMs() {
        return this.#atimeMs;
    }
    #mtimeMs;
    get mtimeMs() {
        return this.#mtimeMs;
    }
    #ctimeMs;
    get ctimeMs() {
        return this.#ctimeMs;
    }
    #birthtimeMs;
    get birthtimeMs() {
        return this.#birthtimeMs;
    }
    #atime;
    get atime() {
        return this.#atime;
    }
    #mtime;
    get mtime() {
        return this.#mtime;
    }
    #ctime;
    get ctime() {
        return this.#ctime;
    }
    #birthtime;
    get birthtime() {
        return this.#birthtime;
    }
    #matchName;
    #depth;
    #fullpath;
    #fullpathPosix;
    #relative;
    #relativePosix;
    #type;
    #children;
    #linkTarget;
    #realpath;
    /**
     * This property is for compatibility with the Dirent class as of
     * Node v20, where Dirent['parentPath'] refers to the path of the
     * directory that was passed to readdir. For root entries, it's the path
     * to the entry itself.
     */
    get parentPath() {
        return (this.parent || this).fullpath();
    }
    /* c8 ignore start */
    /**
     * Deprecated alias for Dirent['parentPath'] Somewhat counterintuitively,
     * this property refers to the *parent* path, not the path object itself.
     *
     * @deprecated
     */
    get path() {
        return this.parentPath;
    }
    /* c8 ignore stop */
    /**
     * Do not create new Path objects directly.  They should always be accessed
     * via the PathScurry class or other methods on the Path class.
     *
     * @internal
     */
    constructor(name, type = UNKNOWN, root, roots, nocase, children, opts) {
        this.name = name;
        this.#matchName = nocase ? normalizeNocase(name) : normalize(name);
        this.#type = type & TYPEMASK;
        this.nocase = nocase;
        this.roots = roots;
        this.root = root || this;
        this.#children = children;
        this.#fullpath = opts.fullpath;
        this.#relative = opts.relative;
        this.#relativePosix = opts.relativePosix;
        this.parent = opts.parent;
        if (this.parent) {
            this.#fs = this.parent.#fs;
        }
        else {
            this.#fs = fsFromOption(opts.fs);
        }
    }
    /**
     * Returns the depth of the Path object from its root.
     *
     * For example, a path at `/foo/bar` would have a depth of 2.
     */
    depth() {
        if (this.#depth !== undefined)
            return this.#depth;
        if (!this.parent)
            return (this.#depth = 0);
        return (this.#depth = this.parent.depth() + 1);
    }
    /**
     * @internal
     */
    childrenCache() {
        return this.#children;
    }
    /**
     * Get the Path object referenced by the string path, resolved from this Path
     */
    resolve(path) {
        if (!path) {
            return this;
        }
        const rootPath = this.getRootString(path);
        const dir = path.substring(rootPath.length);
        const dirParts = dir.split(this.splitSep);
        const result = rootPath ?
            this.getRoot(rootPath).#resolveParts(dirParts)
            : this.#resolveParts(dirParts);
        return result;
    }
    #resolveParts(dirParts) {
        let p = this;
        for (const part of dirParts) {
            p = p.child(part);
        }
        return p;
    }
    /**
     * Returns the cached children Path objects, if still available.  If they
     * have fallen out of the cache, then returns an empty array, and resets the
     * READDIR_CALLED bit, so that future calls to readdir() will require an fs
     * lookup.
     *
     * @internal
     */
    children() {
        const cached = this.#children.get(this);
        if (cached) {
            return cached;
        }
        const children = Object.assign([], { provisional: 0 });
        this.#children.set(this, children);
        this.#type &= ~READDIR_CALLED;
        return children;
    }
    /**
     * Resolves a path portion and returns or creates the child Path.
     *
     * Returns `this` if pathPart is `''` or `'.'`, or `parent` if pathPart is
     * `'..'`.
     *
     * This should not be called directly.  If `pathPart` contains any path
     * separators, it will lead to unsafe undefined behavior.
     *
     * Use `Path.resolve()` instead.
     *
     * @internal
     */
    child(pathPart, opts) {
        if (pathPart === '' || pathPart === '.') {
            return this;
        }
        if (pathPart === '..') {
            return this.parent || this;
        }
        // find the child
        const children = this.children();
        const name = this.nocase ? normalizeNocase(pathPart) : normalize(pathPart);
        for (const p of children) {
            if (p.#matchName === name) {
                return p;
            }
        }
        // didn't find it, create provisional child, since it might not
        // actually exist.  If we know the parent isn't a dir, then
        // in fact it CAN'T exist.
        const s = this.parent ? this.sep : '';
        const fullpath = this.#fullpath ? this.#fullpath + s + pathPart : undefined;
        const pchild = this.newChild(pathPart, UNKNOWN, {
            ...opts,
            parent: this,
            fullpath,
        });
        if (!this.canReaddir()) {
            pchild.#type |= ENOENT;
        }
        // don't have to update provisional, because if we have real children,
        // then provisional is set to children.length, otherwise a lower number
        children.push(pchild);
        return pchild;
    }
    /**
     * The relative path from the cwd. If it does not share an ancestor with
     * the cwd, then this ends up being equivalent to the fullpath()
     */
    relative() {
        if (this.isCWD)
            return '';
        if (this.#relative !== undefined) {
            return this.#relative;
        }
        const name = this.name;
        const p = this.parent;
        if (!p) {
            return (this.#relative = this.name);
        }
        const pv = p.relative();
        return pv + (!pv || !p.parent ? '' : this.sep) + name;
    }
    /**
     * The relative path from the cwd, using / as the path separator.
     * If it does not share an ancestor with
     * the cwd, then this ends up being equivalent to the fullpathPosix()
     * On posix systems, this is identical to relative().
     */
    relativePosix() {
        if (this.sep === '/')
            return this.relative();
        if (this.isCWD)
            return '';
        if (this.#relativePosix !== undefined)
            return this.#relativePosix;
        const name = this.name;
        const p = this.parent;
        if (!p) {
            return (this.#relativePosix = this.fullpathPosix());
        }
        const pv = p.relativePosix();
        return pv + (!pv || !p.parent ? '' : '/') + name;
    }
    /**
     * The fully resolved path string for this Path entry
     */
    fullpath() {
        if (this.#fullpath !== undefined) {
            return this.#fullpath;
        }
        const name = this.name;
        const p = this.parent;
        if (!p) {
            return (this.#fullpath = this.name);
        }
        const pv = p.fullpath();
        const fp = pv + (!p.parent ? '' : this.sep) + name;
        return (this.#fullpath = fp);
    }
    /**
     * On platforms other than windows, this is identical to fullpath.
     *
     * On windows, this is overridden to return the forward-slash form of the
     * full UNC path.
     */
    fullpathPosix() {
        if (this.#fullpathPosix !== undefined)
            return this.#fullpathPosix;
        if (this.sep === '/')
            return (this.#fullpathPosix = this.fullpath());
        if (!this.parent) {
            const p = this.fullpath().replace(/\\/g, '/');
            if (/^[a-z]:\//i.test(p)) {
                return (this.#fullpathPosix = `//?/${p}`);
            }
            else {
                return (this.#fullpathPosix = p);
            }
        }
        const p = this.parent;
        const pfpp = p.fullpathPosix();
        const fpp = pfpp + (!pfpp || !p.parent ? '' : '/') + this.name;
        return (this.#fullpathPosix = fpp);
    }
    /**
     * Is the Path of an unknown type?
     *
     * Note that we might know *something* about it if there has been a previous
     * filesystem operation, for example that it does not exist, or is not a
     * link, or whether it has child entries.
     */
    isUnknown() {
        return (this.#type & IFMT) === UNKNOWN;
    }
    isType(type) {
        return this[`is${type}`]();
    }
    getType() {
        return (this.isUnknown() ? 'Unknown'
            : this.isDirectory() ? 'Directory'
                : this.isFile() ? 'File'
                    : this.isSymbolicLink() ? 'SymbolicLink'
                        : this.isFIFO() ? 'FIFO'
                            : this.isCharacterDevice() ? 'CharacterDevice'
                                : this.isBlockDevice() ? 'BlockDevice'
                                    : /* c8 ignore start */ this.isSocket() ? 'Socket'
                                        : 'Unknown');
        /* c8 ignore stop */
    }
    /**
     * Is the Path a regular file?
     */
    isFile() {
        return (this.#type & IFMT) === IFREG;
    }
    /**
     * Is the Path a directory?
     */
    isDirectory() {
        return (this.#type & IFMT) === IFDIR;
    }
    /**
     * Is the path a character device?
     */
    isCharacterDevice() {
        return (this.#type & IFMT) === IFCHR;
    }
    /**
     * Is the path a block device?
     */
    isBlockDevice() {
        return (this.#type & IFMT) === IFBLK;
    }
    /**
     * Is the path a FIFO pipe?
     */
    isFIFO() {
        return (this.#type & IFMT) === IFIFO;
    }
    /**
     * Is the path a socket?
     */
    isSocket() {
        return (this.#type & IFMT) === IFSOCK;
    }
    /**
     * Is the path a symbolic link?
     */
    isSymbolicLink() {
        return (this.#type & IFLNK) === IFLNK;
    }
    /**
     * Return the entry if it has been subject of a successful lstat, or
     * undefined otherwise.
     *
     * Does not read the filesystem, so an undefined result *could* simply
     * mean that we haven't called lstat on it.
     */
    lstatCached() {
        return this.#type & LSTAT_CALLED ? this : undefined;
    }
    /**
     * Return the cached link target if the entry has been the subject of a
     * successful readlink, or undefined otherwise.
     *
     * Does not read the filesystem, so an undefined result *could* just mean we
     * don't have any cached data. Only use it if you are very sure that a
     * readlink() has been called at some point.
     */
    readlinkCached() {
        return this.#linkTarget;
    }
    /**
     * Returns the cached realpath target if the entry has been the subject
     * of a successful realpath, or undefined otherwise.
     *
     * Does not read the filesystem, so an undefined result *could* just mean we
     * don't have any cached data. Only use it if you are very sure that a
     * realpath() has been called at some point.
     */
    realpathCached() {
        return this.#realpath;
    }
    /**
     * Returns the cached child Path entries array if the entry has been the
     * subject of a successful readdir(), or [] otherwise.
     *
     * Does not read the filesystem, so an empty array *could* just mean we
     * don't have any cached data. Only use it if you are very sure that a
     * readdir() has been called recently enough to still be valid.
     */
    readdirCached() {
        const children = this.children();
        return children.slice(0, children.provisional);
    }
    /**
     * Return true if it's worth trying to readlink.  Ie, we don't (yet) have
     * any indication that readlink will definitely fail.
     *
     * Returns false if the path is known to not be a symlink, if a previous
     * readlink failed, or if the entry does not exist.
     */
    canReadlink() {
        if (this.#linkTarget)
            return true;
        if (!this.parent)
            return false;
        // cases where it cannot possibly succeed
        const ifmt = this.#type & IFMT;
        return !((ifmt !== UNKNOWN && ifmt !== IFLNK) ||
            this.#type & ENOREADLINK ||
            this.#type & ENOENT);
    }
    /**
     * Return true if readdir has previously been successfully called on this
     * path, indicating that cachedReaddir() is likely valid.
     */
    calledReaddir() {
        return !!(this.#type & READDIR_CALLED);
    }
    /**
     * Returns true if the path is known to not exist. That is, a previous lstat
     * or readdir failed to verify its existence when that would have been
     * expected, or a parent entry was marked either enoent or enotdir.
     */
    isENOENT() {
        return !!(this.#type & ENOENT);
    }
    /**
     * Return true if the path is a match for the given path name.  This handles
     * case sensitivity and unicode normalization.
     *
     * Note: even on case-sensitive systems, it is **not** safe to test the
     * equality of the `.name` property to determine whether a given pathname
     * matches, due to unicode normalization mismatches.
     *
     * Always use this method instead of testing the `path.name` property
     * directly.
     */
    isNamed(n) {
        return !this.nocase ?
            this.#matchName === normalize(n)
            : this.#matchName === normalizeNocase(n);
    }
    /**
     * Return the Path object corresponding to the target of a symbolic link.
     *
     * If the Path is not a symbolic link, or if the readlink call fails for any
     * reason, `undefined` is returned.
     *
     * Result is cached, and thus may be outdated if the filesystem is mutated.
     */
    async readlink() {
        const target = this.#linkTarget;
        if (target) {
            return target;
        }
        if (!this.canReadlink()) {
            return undefined;
        }
        /* c8 ignore start */
        // already covered by the canReadlink test, here for ts grumples
        if (!this.parent) {
            return undefined;
        }
        /* c8 ignore stop */
        try {
            const read = await this.#fs.promises.readlink(this.fullpath());
            const linkTarget = (await this.parent.realpath())?.resolve(read);
            if (linkTarget) {
                return (this.#linkTarget = linkTarget);
            }
        }
        catch (er) {
            this.#readlinkFail(er.code);
            return undefined;
        }
    }
    /**
     * Synchronous {@link PathBase.readlink}
     */
    readlinkSync() {
        const target = this.#linkTarget;
        if (target) {
            return target;
        }
        if (!this.canReadlink()) {
            return undefined;
        }
        /* c8 ignore start */
        // already covered by the canReadlink test, here for ts grumples
        if (!this.parent) {
            return undefined;
        }
        /* c8 ignore stop */
        try {
            const read = this.#fs.readlinkSync(this.fullpath());
            const linkTarget = this.parent.realpathSync()?.resolve(read);
            if (linkTarget) {
                return (this.#linkTarget = linkTarget);
            }
        }
        catch (er) {
            this.#readlinkFail(er.code);
            return undefined;
        }
    }
    #readdirSuccess(children) {
        // succeeded, mark readdir called bit
        this.#type |= READDIR_CALLED;
        // mark all remaining provisional children as ENOENT
        for (let p = children.provisional; p < children.length; p++) {
            const c = children[p];
            if (c)
                c.#markENOENT();
        }
    }
    #markENOENT() {
        // mark as UNKNOWN and ENOENT
        if (this.#type & ENOENT)
            return;
        this.#type = (this.#type | ENOENT) & IFMT_UNKNOWN;
        this.#markChildrenENOENT();
    }
    #markChildrenENOENT() {
        // all children are provisional and do not exist
        const children = this.children();
        children.provisional = 0;
        for (const p of children) {
            p.#markENOENT();
        }
    }
    #markENOREALPATH() {
        this.#type |= ENOREALPATH;
        this.#markENOTDIR();
    }
    // save the information when we know the entry is not a dir
    #markENOTDIR() {
        // entry is not a directory, so any children can't exist.
        // this *should* be impossible, since any children created
        // after it's been marked ENOTDIR should be marked ENOENT,
        // so it won't even get to this point.
        /* c8 ignore start */
        if (this.#type & ENOTDIR)
            return;
        /* c8 ignore stop */
        let t = this.#type;
        // this could happen if we stat a dir, then delete it,
        // then try to read it or one of its children.
        if ((t & IFMT) === IFDIR)
            t &= IFMT_UNKNOWN;
        this.#type = t | ENOTDIR;
        this.#markChildrenENOENT();
    }
    #readdirFail(code = '') {
        // markENOTDIR and markENOENT also set provisional=0
        if (code === 'ENOTDIR' || code === 'EPERM') {
            this.#markENOTDIR();
        }
        else if (code === 'ENOENT') {
            this.#markENOENT();
        }
        else {
            this.children().provisional = 0;
        }
    }
    #lstatFail(code = '') {
        // Windows just raises ENOENT in this case, disable for win CI
        /* c8 ignore start */
        if (code === 'ENOTDIR') {
            // already know it has a parent by this point
            const p = this.parent;
            p.#markENOTDIR();
        }
        else if (code === 'ENOENT') {
            /* c8 ignore stop */
            this.#markENOENT();
        }
    }
    #readlinkFail(code = '') {
        let ter = this.#type;
        ter |= ENOREADLINK;
        if (code === 'ENOENT')
            ter |= ENOENT;
        // windows gets a weird error when you try to readlink a file
        if (code === 'EINVAL' || code === 'UNKNOWN') {
            // exists, but not a symlink, we don't know WHAT it is, so remove
            // all IFMT bits.
            ter &= IFMT_UNKNOWN;
        }
        this.#type = ter;
        // windows just gets ENOENT in this case.  We do cover the case,
        // just disabled because it's impossible on Windows CI
        /* c8 ignore start */
        if (code === 'ENOTDIR' && this.parent) {
            this.parent.#markENOTDIR();
        }
        /* c8 ignore stop */
    }
    #readdirAddChild(e, c) {
        return (this.#readdirMaybePromoteChild(e, c) ||
            this.#readdirAddNewChild(e, c));
    }
    #readdirAddNewChild(e, c) {
        // alloc new entry at head, so it's never provisional
        const type = entToType(e);
        const child = this.newChild(e.name, type, { parent: this });
        const ifmt = child.#type & IFMT;
        if (ifmt !== IFDIR && ifmt !== IFLNK && ifmt !== UNKNOWN) {
            child.#type |= ENOTDIR;
        }
        c.unshift(child);
        c.provisional++;
        return child;
    }
    #readdirMaybePromoteChild(e, c) {
        for (let p = c.provisional; p < c.length; p++) {
            const pchild = c[p];
            const name = this.nocase ? normalizeNocase(e.name) : normalize(e.name);
            if (name !== pchild.#matchName) {
                continue;
            }
            return this.#readdirPromoteChild(e, pchild, p, c);
        }
    }
    #readdirPromoteChild(e, p, index, c) {
        const v = p.name;
        // retain any other flags, but set ifmt from dirent
        p.#type = (p.#type & IFMT_UNKNOWN) | entToType(e);
        // case sensitivity fixing when we learn the true name.
        if (v !== e.name)
            p.name = e.name;
        // just advance provisional index (potentially off the list),
        // otherwise we have to splice/pop it out and re-insert at head
        if (index !== c.provisional) {
            if (index === c.length - 1)
                c.pop();
            else
                c.splice(index, 1);
            c.unshift(p);
        }
        c.provisional++;
        return p;
    }
    /**
     * Call lstat() on this Path, and update all known information that can be
     * determined.
     *
     * Note that unlike `fs.lstat()`, the returned value does not contain some
     * information, such as `mode`, `dev`, `nlink`, and `ino`.  If that
     * information is required, you will need to call `fs.lstat` yourself.
     *
     * If the Path refers to a nonexistent file, or if the lstat call fails for
     * any reason, `undefined` is returned.  Otherwise the updated Path object is
     * returned.
     *
     * Results are cached, and thus may be out of date if the filesystem is
     * mutated.
     */
    async lstat() {
        if ((this.#type & ENOENT) === 0) {
            try {
                this.#applyStat(await this.#fs.promises.lstat(this.fullpath()));
                return this;
            }
            catch (er) {
                this.#lstatFail(er.code);
            }
        }
    }
    /**
     * synchronous {@link PathBase.lstat}
     */
    lstatSync() {
        if ((this.#type & ENOENT) === 0) {
            try {
                this.#applyStat(this.#fs.lstatSync(this.fullpath()));
                return this;
            }
            catch (er) {
                this.#lstatFail(er.code);
            }
        }
    }
    #applyStat(st) {
        const { atime, atimeMs, birthtime, birthtimeMs, blksize, blocks, ctime, ctimeMs, dev, gid, ino, mode, mtime, mtimeMs, nlink, rdev, size, uid, } = st;
        this.#atime = atime;
        this.#atimeMs = atimeMs;
        this.#birthtime = birthtime;
        this.#birthtimeMs = birthtimeMs;
        this.#blksize = blksize;
        this.#blocks = blocks;
        this.#ctime = ctime;
        this.#ctimeMs = ctimeMs;
        this.#dev = dev;
        this.#gid = gid;
        this.#ino = ino;
        this.#mode = mode;
        this.#mtime = mtime;
        this.#mtimeMs = mtimeMs;
        this.#nlink = nlink;
        this.#rdev = rdev;
        this.#size = size;
        this.#uid = uid;
        const ifmt = entToType(st);
        // retain any other flags, but set the ifmt
        this.#type = (this.#type & IFMT_UNKNOWN) | ifmt | LSTAT_CALLED;
        if (ifmt !== UNKNOWN && ifmt !== IFDIR && ifmt !== IFLNK) {
            this.#type |= ENOTDIR;
        }
    }
    #onReaddirCB = [];
    #readdirCBInFlight = false;
    #callOnReaddirCB(children) {
        this.#readdirCBInFlight = false;
        const cbs = this.#onReaddirCB.slice();
        this.#onReaddirCB.length = 0;
        cbs.forEach(cb => cb(null, children));
    }
    /**
     * Standard node-style callback interface to get list of directory entries.
     *
     * If the Path cannot or does not contain any children, then an empty array
     * is returned.
     *
     * Results are cached, and thus may be out of date if the filesystem is
     * mutated.
     *
     * @param cb The callback called with (er, entries).  Note that the `er`
     * param is somewhat extraneous, as all readdir() errors are handled and
     * simply result in an empty set of entries being returned.
     * @param allowZalgo Boolean indicating that immediately known results should
     * *not* be deferred with `queueMicrotask`. Defaults to `false`. Release
     * zalgo at your peril, the dark pony lord is devious and unforgiving.
     */
    readdirCB(cb, allowZalgo = false) {
        if (!this.canReaddir()) {
            if (allowZalgo)
                cb(null, []);
            else
                queueMicrotask(() => cb(null, []));
            return;
        }
        const children = this.children();
        if (this.calledReaddir()) {
            const c = children.slice(0, children.provisional);
            if (allowZalgo)
                cb(null, c);
            else
                queueMicrotask(() => cb(null, c));
            return;
        }
        // don't have to worry about zalgo at this point.
        this.#onReaddirCB.push(cb);
        if (this.#readdirCBInFlight) {
            return;
        }
        this.#readdirCBInFlight = true;
        // else read the directory, fill up children
        // de-provisionalize any provisional children.
        const fullpath = this.fullpath();
        this.#fs.readdir(fullpath, { withFileTypes: true }, (er, entries) => {
            if (er) {
                this.#readdirFail(er.code);
                children.provisional = 0;
            }
            else {
                // if we didn't get an error, we always get entries.
                //@ts-ignore
                for (const e of entries) {
                    this.#readdirAddChild(e, children);
                }
                this.#readdirSuccess(children);
            }
            this.#callOnReaddirCB(children.slice(0, children.provisional));
            return;
        });
    }
    #asyncReaddirInFlight;
    /**
     * Return an array of known child entries.
     *
     * If the Path cannot or does not contain any children, then an empty array
     * is returned.
     *
     * Results are cached, and thus may be out of date if the filesystem is
     * mutated.
     */
    async readdir() {
        if (!this.canReaddir()) {
            return [];
        }
        const children = this.children();
        if (this.calledReaddir()) {
            return children.slice(0, children.provisional);
        }
        // else read the directory, fill up children
        // de-provisionalize any provisional children.
        const fullpath = this.fullpath();
        if (this.#asyncReaddirInFlight) {
            await this.#asyncReaddirInFlight;
        }
        else {
            /* c8 ignore start */
            let resolve = () => { };
            /* c8 ignore stop */
            this.#asyncReaddirInFlight = new Promise(res => (resolve = res));
            try {
                for (const e of await this.#fs.promises.readdir(fullpath, {
                    withFileTypes: true,
                })) {
                    this.#readdirAddChild(e, children);
                }
                this.#readdirSuccess(children);
            }
            catch (er) {
                this.#readdirFail(er.code);
                children.provisional = 0;
            }
            this.#asyncReaddirInFlight = undefined;
            resolve();
        }
        return children.slice(0, children.provisional);
    }
    /**
     * synchronous {@link PathBase.readdir}
     */
    readdirSync() {
        if (!this.canReaddir()) {
            return [];
        }
        const children = this.children();
        if (this.calledReaddir()) {
            return children.slice(0, children.provisional);
        }
        // else read the directory, fill up children
        // de-provisionalize any provisional children.
        const fullpath = this.fullpath();
        try {
            for (const e of this.#fs.readdirSync(fullpath, {
                withFileTypes: true,
            })) {
                this.#readdirAddChild(e, children);
            }
            this.#readdirSuccess(children);
        }
        catch (er) {
            this.#readdirFail(er.code);
            children.provisional = 0;
        }
        return children.slice(0, children.provisional);
    }
    canReaddir() {
        if (this.#type & ENOCHILD)
            return false;
        const ifmt = IFMT & this.#type;
        // we always set ENOTDIR when setting IFMT, so should be impossible
        /* c8 ignore start */
        if (!(ifmt === UNKNOWN || ifmt === IFDIR || ifmt === IFLNK)) {
            return false;
        }
        /* c8 ignore stop */
        return true;
    }
    shouldWalk(dirs, walkFilter) {
        return ((this.#type & IFDIR) === IFDIR &&
            !(this.#type & ENOCHILD) &&
            !dirs.has(this) &&
            (!walkFilter || walkFilter(this)));
    }
    /**
     * Return the Path object corresponding to path as resolved
     * by realpath(3).
     *
     * If the realpath call fails for any reason, `undefined` is returned.
     *
     * Result is cached, and thus may be outdated if the filesystem is mutated.
     * On success, returns a Path object.
     */
    async realpath() {
        if (this.#realpath)
            return this.#realpath;
        if ((ENOREALPATH | ENOREADLINK | ENOENT) & this.#type)
            return undefined;
        try {
            const rp = await this.#fs.promises.realpath(this.fullpath());
            return (this.#realpath = this.resolve(rp));
        }
        catch (_) {
            this.#markENOREALPATH();
        }
    }
    /**
     * Synchronous {@link realpath}
     */
    realpathSync() {
        if (this.#realpath)
            return this.#realpath;
        if ((ENOREALPATH | ENOREADLINK | ENOENT) & this.#type)
            return undefined;
        try {
            const rp = this.#fs.realpathSync(this.fullpath());
            return (this.#realpath = this.resolve(rp));
        }
        catch (_) {
            this.#markENOREALPATH();
        }
    }
    /**
     * Internal method to mark this Path object as the scurry cwd,
     * called by {@link PathScurry#chdir}
     *
     * @internal
     */
    [setAsCwd](oldCwd) {
        if (oldCwd === this)
            return;
        oldCwd.isCWD = false;
        this.isCWD = true;
        const changed = new Set([]);
        let rp = [];
        let p = this;
        while (p && p.parent) {
            changed.add(p);
            p.#relative = rp.join(this.sep);
            p.#relativePosix = rp.join('/');
            p = p.parent;
            rp.push('..');
        }
        // now un-memoize parents of old cwd
        p = oldCwd;
        while (p && p.parent && !changed.has(p)) {
            p.#relative = undefined;
            p.#relativePosix = undefined;
            p = p.parent;
        }
    }
}
/**
 * Path class used on win32 systems
 *
 * Uses `'\\'` as the path separator for returned paths, either `'\\'` or `'/'`
 * as the path separator for parsing paths.
 */
class PathWin32 extends PathBase {
    /**
     * Separator for generating path strings.
     */
    sep = '\\';
    /**
     * Separator for parsing path strings.
     */
    splitSep = eitherSep;
    /**
     * Do not create new Path objects directly.  They should always be accessed
     * via the PathScurry class or other methods on the Path class.
     *
     * @internal
     */
    constructor(name, type = UNKNOWN, root, roots, nocase, children, opts) {
        super(name, type, root, roots, nocase, children, opts);
    }
    /**
     * @internal
     */
    newChild(name, type = UNKNOWN, opts = {}) {
        return new PathWin32(name, type, this.root, this.roots, this.nocase, this.childrenCache(), opts);
    }
    /**
     * @internal
     */
    getRootString(path) {
        return node_path__WEBPACK_IMPORTED_MODULE_1__.win32.parse(path).root;
    }
    /**
     * @internal
     */
    getRoot(rootPath) {
        rootPath = uncToDrive(rootPath.toUpperCase());
        if (rootPath === this.root.name) {
            return this.root;
        }
        // ok, not that one, check if it matches another we know about
        for (const [compare, root] of Object.entries(this.roots)) {
            if (this.sameRoot(rootPath, compare)) {
                return (this.roots[rootPath] = root);
            }
        }
        // otherwise, have to create a new one.
        return (this.roots[rootPath] = new PathScurryWin32(rootPath, this).root);
    }
    /**
     * @internal
     */
    sameRoot(rootPath, compare = this.root.name) {
        // windows can (rarely) have case-sensitive filesystem, but
        // UNC and drive letters are always case-insensitive, and canonically
        // represented uppercase.
        rootPath = rootPath
            .toUpperCase()
            .replace(/\//g, '\\')
            .replace(uncDriveRegexp, '$1\\');
        return rootPath === compare;
    }
}
/**
 * Path class used on all posix systems.
 *
 * Uses `'/'` as the path separator.
 */
class PathPosix extends PathBase {
    /**
     * separator for parsing path strings
     */
    splitSep = '/';
    /**
     * separator for generating path strings
     */
    sep = '/';
    /**
     * Do not create new Path objects directly.  They should always be accessed
     * via the PathScurry class or other methods on the Path class.
     *
     * @internal
     */
    constructor(name, type = UNKNOWN, root, roots, nocase, children, opts) {
        super(name, type, root, roots, nocase, children, opts);
    }
    /**
     * @internal
     */
    getRootString(path) {
        return path.startsWith('/') ? '/' : '';
    }
    /**
     * @internal
     */
    getRoot(_rootPath) {
        return this.root;
    }
    /**
     * @internal
     */
    newChild(name, type = UNKNOWN, opts = {}) {
        return new PathPosix(name, type, this.root, this.roots, this.nocase, this.childrenCache(), opts);
    }
}
/**
 * The base class for all PathScurry classes, providing the interface for path
 * resolution and filesystem operations.
 *
 * Typically, you should *not* instantiate this class directly, but rather one
 * of the platform-specific classes, or the exported {@link PathScurry} which
 * defaults to the current platform.
 */
class PathScurryBase {
    /**
     * The root Path entry for the current working directory of this Scurry
     */
    root;
    /**
     * The string path for the root of this Scurry's current working directory
     */
    rootPath;
    /**
     * A collection of all roots encountered, referenced by rootPath
     */
    roots;
    /**
     * The Path entry corresponding to this PathScurry's current working directory.
     */
    cwd;
    #resolveCache;
    #resolvePosixCache;
    #children;
    /**
     * Perform path comparisons case-insensitively.
     *
     * Defaults true on Darwin and Windows systems, false elsewhere.
     */
    nocase;
    #fs;
    /**
     * This class should not be instantiated directly.
     *
     * Use PathScurryWin32, PathScurryDarwin, PathScurryPosix, or PathScurry
     *
     * @internal
     */
    constructor(cwd = process.cwd(), pathImpl, sep, { nocase, childrenCacheSize = 16 * 1024, fs = defaultFS, } = {}) {
        this.#fs = fsFromOption(fs);
        if (cwd instanceof URL || cwd.startsWith('file://')) {
            cwd = (0,node_url__WEBPACK_IMPORTED_MODULE_2__.fileURLToPath)(cwd);
        }
        // resolve and split root, and then add to the store.
        // this is the only time we call path.resolve()
        const cwdPath = pathImpl.resolve(cwd);
        this.roots = Object.create(null);
        this.rootPath = this.parseRootPath(cwdPath);
        this.#resolveCache = new ResolveCache();
        this.#resolvePosixCache = new ResolveCache();
        this.#children = new ChildrenCache(childrenCacheSize);
        const split = cwdPath.substring(this.rootPath.length).split(sep);
        // resolve('/') leaves '', splits to [''], we don't want that.
        if (split.length === 1 && !split[0]) {
            split.pop();
        }
        /* c8 ignore start */
        if (nocase === undefined) {
            throw new TypeError('must provide nocase setting to PathScurryBase ctor');
        }
        /* c8 ignore stop */
        this.nocase = nocase;
        this.root = this.newRoot(this.#fs);
        this.roots[this.rootPath] = this.root;
        let prev = this.root;
        let len = split.length - 1;
        const joinSep = pathImpl.sep;
        let abs = this.rootPath;
        let sawFirst = false;
        for (const part of split) {
            const l = len--;
            prev = prev.child(part, {
                relative: new Array(l).fill('..').join(joinSep),
                relativePosix: new Array(l).fill('..').join('/'),
                fullpath: (abs += (sawFirst ? '' : joinSep) + part),
            });
            sawFirst = true;
        }
        this.cwd = prev;
    }
    /**
     * Get the depth of a provided path, string, or the cwd
     */
    depth(path = this.cwd) {
        if (typeof path === 'string') {
            path = this.cwd.resolve(path);
        }
        return path.depth();
    }
    /**
     * Return the cache of child entries.  Exposed so subclasses can create
     * child Path objects in a platform-specific way.
     *
     * @internal
     */
    childrenCache() {
        return this.#children;
    }
    /**
     * Resolve one or more path strings to a resolved string
     *
     * Same interface as require('path').resolve.
     *
     * Much faster than path.resolve() when called multiple times for the same
     * path, because the resolved Path objects are cached.  Much slower
     * otherwise.
     */
    resolve(...paths) {
        // first figure out the minimum number of paths we have to test
        // we always start at cwd, but any absolutes will bump the start
        let r = '';
        for (let i = paths.length - 1; i >= 0; i--) {
            const p = paths[i];
            if (!p || p === '.')
                continue;
            r = r ? `${p}/${r}` : p;
            if (this.isAbsolute(p)) {
                break;
            }
        }
        const cached = this.#resolveCache.get(r);
        if (cached !== undefined) {
            return cached;
        }
        const result = this.cwd.resolve(r).fullpath();
        this.#resolveCache.set(r, result);
        return result;
    }
    /**
     * Resolve one or more path strings to a resolved string, returning
     * the posix path.  Identical to .resolve() on posix systems, but on
     * windows will return a forward-slash separated UNC path.
     *
     * Same interface as require('path').resolve.
     *
     * Much faster than path.resolve() when called multiple times for the same
     * path, because the resolved Path objects are cached.  Much slower
     * otherwise.
     */
    resolvePosix(...paths) {
        // first figure out the minimum number of paths we have to test
        // we always start at cwd, but any absolutes will bump the start
        let r = '';
        for (let i = paths.length - 1; i >= 0; i--) {
            const p = paths[i];
            if (!p || p === '.')
                continue;
            r = r ? `${p}/${r}` : p;
            if (this.isAbsolute(p)) {
                break;
            }
        }
        const cached = this.#resolvePosixCache.get(r);
        if (cached !== undefined) {
            return cached;
        }
        const result = this.cwd.resolve(r).fullpathPosix();
        this.#resolvePosixCache.set(r, result);
        return result;
    }
    /**
     * find the relative path from the cwd to the supplied path string or entry
     */
    relative(entry = this.cwd) {
        if (typeof entry === 'string') {
            entry = this.cwd.resolve(entry);
        }
        return entry.relative();
    }
    /**
     * find the relative path from the cwd to the supplied path string or
     * entry, using / as the path delimiter, even on Windows.
     */
    relativePosix(entry = this.cwd) {
        if (typeof entry === 'string') {
            entry = this.cwd.resolve(entry);
        }
        return entry.relativePosix();
    }
    /**
     * Return the basename for the provided string or Path object
     */
    basename(entry = this.cwd) {
        if (typeof entry === 'string') {
            entry = this.cwd.resolve(entry);
        }
        return entry.name;
    }
    /**
     * Return the dirname for the provided string or Path object
     */
    dirname(entry = this.cwd) {
        if (typeof entry === 'string') {
            entry = this.cwd.resolve(entry);
        }
        return (entry.parent || entry).fullpath();
    }
    async readdir(entry = this.cwd, opts = {
        withFileTypes: true,
    }) {
        if (typeof entry === 'string') {
            entry = this.cwd.resolve(entry);
        }
        else if (!(entry instanceof PathBase)) {
            opts = entry;
            entry = this.cwd;
        }
        const { withFileTypes } = opts;
        if (!entry.canReaddir()) {
            return [];
        }
        else {
            const p = await entry.readdir();
            return withFileTypes ? p : p.map(e => e.name);
        }
    }
    readdirSync(entry = this.cwd, opts = {
        withFileTypes: true,
    }) {
        if (typeof entry === 'string') {
            entry = this.cwd.resolve(entry);
        }
        else if (!(entry instanceof PathBase)) {
            opts = entry;
            entry = this.cwd;
        }
        const { withFileTypes = true } = opts;
        if (!entry.canReaddir()) {
            return [];
        }
        else if (withFileTypes) {
            return entry.readdirSync();
        }
        else {
            return entry.readdirSync().map(e => e.name);
        }
    }
    /**
     * Call lstat() on the string or Path object, and update all known
     * information that can be determined.
     *
     * Note that unlike `fs.lstat()`, the returned value does not contain some
     * information, such as `mode`, `dev`, `nlink`, and `ino`.  If that
     * information is required, you will need to call `fs.lstat` yourself.
     *
     * If the Path refers to a nonexistent file, or if the lstat call fails for
     * any reason, `undefined` is returned.  Otherwise the updated Path object is
     * returned.
     *
     * Results are cached, and thus may be out of date if the filesystem is
     * mutated.
     */
    async lstat(entry = this.cwd) {
        if (typeof entry === 'string') {
            entry = this.cwd.resolve(entry);
        }
        return entry.lstat();
    }
    /**
     * synchronous {@link PathScurryBase.lstat}
     */
    lstatSync(entry = this.cwd) {
        if (typeof entry === 'string') {
            entry = this.cwd.resolve(entry);
        }
        return entry.lstatSync();
    }
    async readlink(entry = this.cwd, { withFileTypes } = {
        withFileTypes: false,
    }) {
        if (typeof entry === 'string') {
            entry = this.cwd.resolve(entry);
        }
        else if (!(entry instanceof PathBase)) {
            withFileTypes = entry.withFileTypes;
            entry = this.cwd;
        }
        const e = await entry.readlink();
        return withFileTypes ? e : e?.fullpath();
    }
    readlinkSync(entry = this.cwd, { withFileTypes } = {
        withFileTypes: false,
    }) {
        if (typeof entry === 'string') {
            entry = this.cwd.resolve(entry);
        }
        else if (!(entry instanceof PathBase)) {
            withFileTypes = entry.withFileTypes;
            entry = this.cwd;
        }
        const e = entry.readlinkSync();
        return withFileTypes ? e : e?.fullpath();
    }
    async realpath(entry = this.cwd, { withFileTypes } = {
        withFileTypes: false,
    }) {
        if (typeof entry === 'string') {
            entry = this.cwd.resolve(entry);
        }
        else if (!(entry instanceof PathBase)) {
            withFileTypes = entry.withFileTypes;
            entry = this.cwd;
        }
        const e = await entry.realpath();
        return withFileTypes ? e : e?.fullpath();
    }
    realpathSync(entry = this.cwd, { withFileTypes } = {
        withFileTypes: false,
    }) {
        if (typeof entry === 'string') {
            entry = this.cwd.resolve(entry);
        }
        else if (!(entry instanceof PathBase)) {
            withFileTypes = entry.withFileTypes;
            entry = this.cwd;
        }
        const e = entry.realpathSync();
        return withFileTypes ? e : e?.fullpath();
    }
    async walk(entry = this.cwd, opts = {}) {
        if (typeof entry === 'string') {
            entry = this.cwd.resolve(entry);
        }
        else if (!(entry instanceof PathBase)) {
            opts = entry;
            entry = this.cwd;
        }
        const { withFileTypes = true, follow = false, filter, walkFilter, } = opts;
        const results = [];
        if (!filter || filter(entry)) {
            results.push(withFileTypes ? entry : entry.fullpath());
        }
        const dirs = new Set();
        const walk = (dir, cb) => {
            dirs.add(dir);
            dir.readdirCB((er, entries) => {
                /* c8 ignore start */
                if (er) {
                    return cb(er);
                }
                /* c8 ignore stop */
                let len = entries.length;
                if (!len)
                    return cb();
                const next = () => {
                    if (--len === 0) {
                        cb();
                    }
                };
                for (const e of entries) {
                    if (!filter || filter(e)) {
                        results.push(withFileTypes ? e : e.fullpath());
                    }
                    if (follow && e.isSymbolicLink()) {
                        e.realpath()
                            .then(r => (r?.isUnknown() ? r.lstat() : r))
                            .then(r => r?.shouldWalk(dirs, walkFilter) ? walk(r, next) : next());
                    }
                    else {
                        if (e.shouldWalk(dirs, walkFilter)) {
                            walk(e, next);
                        }
                        else {
                            next();
                        }
                    }
                }
            }, true); // zalgooooooo
        };
        const start = entry;
        return new Promise((res, rej) => {
            walk(start, er => {
                /* c8 ignore start */
                if (er)
                    return rej(er);
                /* c8 ignore stop */
                res(results);
            });
        });
    }
    walkSync(entry = this.cwd, opts = {}) {
        if (typeof entry === 'string') {
            entry = this.cwd.resolve(entry);
        }
        else if (!(entry instanceof PathBase)) {
            opts = entry;
            entry = this.cwd;
        }
        const { withFileTypes = true, follow = false, filter, walkFilter, } = opts;
        const results = [];
        if (!filter || filter(entry)) {
            results.push(withFileTypes ? entry : entry.fullpath());
        }
        const dirs = new Set([entry]);
        for (const dir of dirs) {
            const entries = dir.readdirSync();
            for (const e of entries) {
                if (!filter || filter(e)) {
                    results.push(withFileTypes ? e : e.fullpath());
                }
                let r = e;
                if (e.isSymbolicLink()) {
                    if (!(follow && (r = e.realpathSync())))
                        continue;
                    if (r.isUnknown())
                        r.lstatSync();
                }
                if (r.shouldWalk(dirs, walkFilter)) {
                    dirs.add(r);
                }
            }
        }
        return results;
    }
    /**
     * Support for `for await`
     *
     * Alias for {@link PathScurryBase.iterate}
     *
     * Note: As of Node 19, this is very slow, compared to other methods of
     * walking.  Consider using {@link PathScurryBase.stream} if memory overhead
     * and backpressure are concerns, or {@link PathScurryBase.walk} if not.
     */
    [Symbol.asyncIterator]() {
        return this.iterate();
    }
    iterate(entry = this.cwd, options = {}) {
        // iterating async over the stream is significantly more performant,
        // especially in the warm-cache scenario, because it buffers up directory
        // entries in the background instead of waiting for a yield for each one.
        if (typeof entry === 'string') {
            entry = this.cwd.resolve(entry);
        }
        else if (!(entry instanceof PathBase)) {
            options = entry;
            entry = this.cwd;
        }
        return this.stream(entry, options)[Symbol.asyncIterator]();
    }
    /**
     * Iterating over a PathScurry performs a synchronous walk.
     *
     * Alias for {@link PathScurryBase.iterateSync}
     */
    [Symbol.iterator]() {
        return this.iterateSync();
    }
    *iterateSync(entry = this.cwd, opts = {}) {
        if (typeof entry === 'string') {
            entry = this.cwd.resolve(entry);
        }
        else if (!(entry instanceof PathBase)) {
            opts = entry;
            entry = this.cwd;
        }
        const { withFileTypes = true, follow = false, filter, walkFilter, } = opts;
        if (!filter || filter(entry)) {
            yield withFileTypes ? entry : entry.fullpath();
        }
        const dirs = new Set([entry]);
        for (const dir of dirs) {
            const entries = dir.readdirSync();
            for (const e of entries) {
                if (!filter || filter(e)) {
                    yield withFileTypes ? e : e.fullpath();
                }
                let r = e;
                if (e.isSymbolicLink()) {
                    if (!(follow && (r = e.realpathSync())))
                        continue;
                    if (r.isUnknown())
                        r.lstatSync();
                }
                if (r.shouldWalk(dirs, walkFilter)) {
                    dirs.add(r);
                }
            }
        }
    }
    stream(entry = this.cwd, opts = {}) {
        if (typeof entry === 'string') {
            entry = this.cwd.resolve(entry);
        }
        else if (!(entry instanceof PathBase)) {
            opts = entry;
            entry = this.cwd;
        }
        const { withFileTypes = true, follow = false, filter, walkFilter, } = opts;
        const results = new minipass__WEBPACK_IMPORTED_MODULE_6__.Minipass({ objectMode: true });
        if (!filter || filter(entry)) {
            results.write(withFileTypes ? entry : entry.fullpath());
        }
        const dirs = new Set();
        const queue = [entry];
        let processing = 0;
        const process = () => {
            let paused = false;
            while (!paused) {
                const dir = queue.shift();
                if (!dir) {
                    if (processing === 0)
                        results.end();
                    return;
                }
                processing++;
                dirs.add(dir);
                const onReaddir = (er, entries, didRealpaths = false) => {
                    /* c8 ignore start */
                    if (er)
                        return results.emit('error', er);
                    /* c8 ignore stop */
                    if (follow && !didRealpaths) {
                        const promises = [];
                        for (const e of entries) {
                            if (e.isSymbolicLink()) {
                                promises.push(e
                                    .realpath()
                                    .then((r) => r?.isUnknown() ? r.lstat() : r));
                            }
                        }
                        if (promises.length) {
                            Promise.all(promises).then(() => onReaddir(null, entries, true));
                            return;
                        }
                    }
                    for (const e of entries) {
                        if (e && (!filter || filter(e))) {
                            if (!results.write(withFileTypes ? e : e.fullpath())) {
                                paused = true;
                            }
                        }
                    }
                    processing--;
                    for (const e of entries) {
                        const r = e.realpathCached() || e;
                        if (r.shouldWalk(dirs, walkFilter)) {
                            queue.push(r);
                        }
                    }
                    if (paused && !results.flowing) {
                        results.once('drain', process);
                    }
                    else if (!sync) {
                        process();
                    }
                };
                // zalgo containment
                let sync = true;
                dir.readdirCB(onReaddir, true);
                sync = false;
            }
        };
        process();
        return results;
    }
    streamSync(entry = this.cwd, opts = {}) {
        if (typeof entry === 'string') {
            entry = this.cwd.resolve(entry);
        }
        else if (!(entry instanceof PathBase)) {
            opts = entry;
            entry = this.cwd;
        }
        const { withFileTypes = true, follow = false, filter, walkFilter, } = opts;
        const results = new minipass__WEBPACK_IMPORTED_MODULE_6__.Minipass({ objectMode: true });
        const dirs = new Set();
        if (!filter || filter(entry)) {
            results.write(withFileTypes ? entry : entry.fullpath());
        }
        const queue = [entry];
        let processing = 0;
        const process = () => {
            let paused = false;
            while (!paused) {
                const dir = queue.shift();
                if (!dir) {
                    if (processing === 0)
                        results.end();
                    return;
                }
                processing++;
                dirs.add(dir);
                const entries = dir.readdirSync();
                for (const e of entries) {
                    if (!filter || filter(e)) {
                        if (!results.write(withFileTypes ? e : e.fullpath())) {
                            paused = true;
                        }
                    }
                }
                processing--;
                for (const e of entries) {
                    let r = e;
                    if (e.isSymbolicLink()) {
                        if (!(follow && (r = e.realpathSync())))
                            continue;
                        if (r.isUnknown())
                            r.lstatSync();
                    }
                    if (r.shouldWalk(dirs, walkFilter)) {
                        queue.push(r);
                    }
                }
            }
            if (paused && !results.flowing)
                results.once('drain', process);
        };
        process();
        return results;
    }
    chdir(path = this.cwd) {
        const oldCwd = this.cwd;
        this.cwd = typeof path === 'string' ? this.cwd.resolve(path) : path;
        this.cwd[setAsCwd](oldCwd);
    }
}
/**
 * Windows implementation of {@link PathScurryBase}
 *
 * Defaults to case insensitve, uses `'\\'` to generate path strings.  Uses
 * {@link PathWin32} for Path objects.
 */
class PathScurryWin32 extends PathScurryBase {
    /**
     * separator for generating path strings
     */
    sep = '\\';
    constructor(cwd = process.cwd(), opts = {}) {
        const { nocase = true } = opts;
        super(cwd, node_path__WEBPACK_IMPORTED_MODULE_1__.win32, '\\', { ...opts, nocase });
        this.nocase = nocase;
        for (let p = this.cwd; p; p = p.parent) {
            p.nocase = this.nocase;
        }
    }
    /**
     * @internal
     */
    parseRootPath(dir) {
        // if the path starts with a single separator, it's not a UNC, and we'll
        // just get separator as the root, and driveFromUNC will return \
        // In that case, mount \ on the root from the cwd.
        return node_path__WEBPACK_IMPORTED_MODULE_1__.win32.parse(dir).root.toUpperCase();
    }
    /**
     * @internal
     */
    newRoot(fs) {
        return new PathWin32(this.rootPath, IFDIR, undefined, this.roots, this.nocase, this.childrenCache(), { fs });
    }
    /**
     * Return true if the provided path string is an absolute path
     */
    isAbsolute(p) {
        return (p.startsWith('/') || p.startsWith('\\') || /^[a-z]:(\/|\\)/i.test(p));
    }
}
/**
 * {@link PathScurryBase} implementation for all posix systems other than Darwin.
 *
 * Defaults to case-sensitive matching, uses `'/'` to generate path strings.
 *
 * Uses {@link PathPosix} for Path objects.
 */
class PathScurryPosix extends PathScurryBase {
    /**
     * separator for generating path strings
     */
    sep = '/';
    constructor(cwd = process.cwd(), opts = {}) {
        const { nocase = false } = opts;
        super(cwd, node_path__WEBPACK_IMPORTED_MODULE_1__.posix, '/', { ...opts, nocase });
        this.nocase = nocase;
    }
    /**
     * @internal
     */
    parseRootPath(_dir) {
        return '/';
    }
    /**
     * @internal
     */
    newRoot(fs) {
        return new PathPosix(this.rootPath, IFDIR, undefined, this.roots, this.nocase, this.childrenCache(), { fs });
    }
    /**
     * Return true if the provided path string is an absolute path
     */
    isAbsolute(p) {
        return p.startsWith('/');
    }
}
/**
 * {@link PathScurryBase} implementation for Darwin (macOS) systems.
 *
 * Defaults to case-insensitive matching, uses `'/'` for generating path
 * strings.
 *
 * Uses {@link PathPosix} for Path objects.
 */
class PathScurryDarwin extends PathScurryPosix {
    constructor(cwd = process.cwd(), opts = {}) {
        const { nocase = true } = opts;
        super(cwd, { ...opts, nocase });
    }
}
/**
 * Default {@link PathBase} implementation for the current platform.
 *
 * {@link PathWin32} on Windows systems, {@link PathPosix} on all others.
 */
const Path = process.platform === 'win32' ? PathWin32 : PathPosix;
/**
 * Default {@link PathScurryBase} implementation for the current platform.
 *
 * {@link PathScurryWin32} on Windows systems, {@link PathScurryDarwin} on
 * Darwin (macOS) systems, {@link PathScurryPosix} on all others.
 */
const PathScurry = process.platform === 'win32' ? PathScurryWin32
    : process.platform === 'darwin' ? PathScurryDarwin
        : PathScurryPosix;
//# sourceMappingURL=index.js.map

/***/ },

/***/ "./node_modules/path-scurry/node_modules/lru-cache/dist/esm/node/index.min.js"
/*!************************************************************************************!*\
  !*** ./node_modules/path-scurry/node_modules/lru-cache/dist/esm/node/index.min.js ***!
  \************************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LRUCache: () => (/* binding */ I)
/* harmony export */ });
/* harmony import */ var node_diagnostics_channel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! node:diagnostics_channel */ "node:diagnostics_channel");
var S=(0,node_diagnostics_channel__WEBPACK_IMPORTED_MODULE_0__.channel)("lru-cache:metrics"),W=(0,node_diagnostics_channel__WEBPACK_IMPORTED_MODULE_0__.tracingChannel)("lru-cache");var L=typeof performance=="object"&&performance&&typeof performance.now=="function"?performance:Date;var D=()=>S.hasSubscribers||W.hasSubscribers,U=new Set,M=typeof process=="object"&&process?process:{},k=(u,e,t,i)=>{typeof M.emitWarning=="function"?M.emitWarning(u,e,t,i):console.error(`[${t}] ${e}: ${u}`)},H=u=>!U.has(u);var T=u=>!!u&&u===Math.floor(u)&&u>0&&isFinite(u),j=u=>T(u)?u<=Math.pow(2,8)?Uint8Array:u<=Math.pow(2,16)?Uint16Array:u<=Math.pow(2,32)?Uint32Array:u<=Number.MAX_SAFE_INTEGER?O:null:null,O=class extends Array{constructor(e){super(e),this.fill(0)}},R=class u{heap;length;static#o=!1;static create(e){let t=j(e);if(!t)return[];u.#o=!0;let i=new u(e,t);return u.#o=!1,i}constructor(e,t){if(!u.#o)throw new TypeError("instantiate Stack using Stack.create(n)");this.heap=new t(e),this.length=0}push(e){this.heap[this.length++]=e}pop(){return this.heap[--this.length]}},I=class u{#o;#c;#S;#O;#w;#M;#I;#m;get perf(){return this.#m}ttl;ttlResolution;ttlAutopurge;updateAgeOnGet;updateAgeOnHas;allowStale;noDisposeOnSet;noUpdateTTL;maxEntrySize;sizeCalculation;noDeleteOnFetchRejection;noDeleteOnStaleGet;allowStaleOnFetchAbort;allowStaleOnFetchRejection;ignoreFetchAbort;backgroundFetchSize;#n;#b;#s;#i;#t;#l;#u;#a;#h;#y;#r;#_;#F;#d;#g;#T;#U;#f;#x;static unsafeExposeInternals(e){return{starts:e.#F,ttls:e.#d,autopurgeTimers:e.#g,sizes:e.#_,keyMap:e.#s,keyList:e.#i,valList:e.#t,next:e.#l,prev:e.#u,get head(){return e.#a},get tail(){return e.#h},free:e.#y,isBackgroundFetch:t=>e.#e(t),backgroundFetch:(t,i,s,n)=>e.#P(t,i,s,n),moveToTail:t=>e.#L(t),indexes:t=>e.#A(t),rindexes:t=>e.#z(t),isStale:t=>e.#p(t)}}get max(){return this.#o}get maxSize(){return this.#c}get calculatedSize(){return this.#b}get size(){return this.#n}get fetchMethod(){return this.#M}get memoMethod(){return this.#I}get dispose(){return this.#S}get onInsert(){return this.#O}get disposeAfter(){return this.#w}constructor(e){let{max:t=0,ttl:i,ttlResolution:s=1,ttlAutopurge:n,updateAgeOnGet:r,updateAgeOnHas:h,allowStale:a,dispose:o,onInsert:d,disposeAfter:y,noDisposeOnSet:_,noUpdateTTL:c,maxSize:g=0,maxEntrySize:f=0,sizeCalculation:b,fetchMethod:l,memoMethod:w,noDeleteOnFetchRejection:F,noDeleteOnStaleGet:m,allowStaleOnFetchRejection:p,allowStaleOnFetchAbort:A,ignoreFetchAbort:z,backgroundFetchSize:C=1,perf:E}=e;if(this.backgroundFetchSize=C,E!==void 0&&typeof E?.now!="function")throw new TypeError("perf option must have a now() method if specified");if(this.#m=E??L,t!==0&&!T(t))throw new TypeError("max option must be a nonnegative integer");let v=t?j(t):Array;if(!v)throw new Error("invalid max value: "+t);if(this.#o=t,this.#c=g,this.maxEntrySize=f||this.#c,this.sizeCalculation=b,this.sizeCalculation){if(!this.#c&&!this.maxEntrySize)throw new TypeError("cannot set sizeCalculation without setting maxSize or maxEntrySize");if(typeof this.sizeCalculation!="function")throw new TypeError("sizeCalculation set to non-function")}if(w!==void 0&&typeof w!="function")throw new TypeError("memoMethod must be a function if defined");if(this.#I=w,l!==void 0&&typeof l!="function")throw new TypeError("fetchMethod must be a function if specified");if(this.#M=l,this.#U=!!l,this.#s=new Map,this.#i=Array.from({length:t}).fill(void 0),this.#t=Array.from({length:t}).fill(void 0),this.#l=new v(t),this.#u=new v(t),this.#a=0,this.#h=0,this.#y=R.create(t),this.#n=0,this.#b=0,typeof o=="function"&&(this.#S=o),typeof d=="function"&&(this.#O=d),typeof y=="function"?(this.#w=y,this.#r=[]):(this.#w=void 0,this.#r=void 0),this.#T=!!this.#S,this.#x=!!this.#O,this.#f=!!this.#w,this.noDisposeOnSet=!!_,this.noUpdateTTL=!!c,this.noDeleteOnFetchRejection=!!F,this.allowStaleOnFetchRejection=!!p,this.allowStaleOnFetchAbort=!!A,this.ignoreFetchAbort=!!z,this.maxEntrySize!==0){if(this.#c!==0&&!T(this.#c))throw new TypeError("maxSize must be a positive integer if specified");if(!T(this.maxEntrySize))throw new TypeError("maxEntrySize must be a positive integer if specified");this.#X()}if(this.allowStale=!!a,this.noDeleteOnStaleGet=!!m,this.updateAgeOnGet=!!r,this.updateAgeOnHas=!!h,this.ttlResolution=T(s)||s===0?s:1,this.ttlAutopurge=!!n,this.ttl=i||0,this.ttl){if(!T(this.ttl))throw new TypeError("ttl must be a positive integer if specified");this.#k()}if(this.#o===0&&this.ttl===0&&this.#c===0)throw new TypeError("At least one of max, maxSize, or ttl is required");if(!this.ttlAutopurge&&!this.#o&&!this.#c){let x="LRU_CACHE_UNBOUNDED";H(x)&&(U.add(x),k("TTL caching without ttlAutopurge, max, or maxSize can result in unbounded memory consumption.","UnboundedCacheWarning",x,u))}}getRemainingTTL(e){return this.#s.has(e)?1/0:0}#k(){let e=new O(this.#o),t=new O(this.#o);this.#d=e,this.#F=t;let i=this.ttlAutopurge?Array.from({length:this.#o}):void 0;this.#g=i,this.#H=(h,a,o=this.#m.now())=>{t[h]=a!==0?o:0,e[h]=a,s(h,a)},this.#D=h=>{t[h]=e[h]!==0?this.#m.now():0,s(h,e[h])};let s=this.ttlAutopurge?(h,a)=>{if(i?.[h]&&(clearTimeout(i[h]),i[h]=void 0),a&&a!==0&&i){let o=setTimeout(()=>{this.#p(h)&&this.#E(this.#i[h],"expire")},a+1);o.unref&&o.unref(),i[h]=o}}:()=>{};this.#v=(h,a)=>{if(e[a]){let o=e[a],d=t[a];if(!o||!d)return;h.ttl=o,h.start=d,h.now=n||r();let y=h.now-d;h.remainingTTL=o-y}};let n=0,r=()=>{let h=this.#m.now();if(this.ttlResolution>0){n=h;let a=setTimeout(()=>n=0,this.ttlResolution);a.unref&&a.unref()}return h};this.getRemainingTTL=h=>{let a=this.#s.get(h);if(a===void 0)return 0;let o=e[a],d=t[a];if(!o||!d)return 1/0;let y=(n||r())-d;return o-y},this.#p=h=>{let a=t[h],o=e[h];return!!o&&!!a&&(n||r())-a>o}}#D=()=>{};#v=()=>{};#H=()=>{};#p=()=>!1;#X(){let e=new O(this.#o);this.#b=0,this.#_=e,this.#R=t=>{this.#b-=e[t],e[t]=0},this.#N=(t,i,s,n)=>{if(!T(s)){if(this.#e(i))return this.backgroundFetchSize;if(n){if(typeof n!="function")throw new TypeError("sizeCalculation must be a function");if(s=n(i,t),!T(s))throw new TypeError("sizeCalculation return invalid (expect positive integer)")}else throw new TypeError("invalid size value (must be positive integer). When maxSize or maxEntrySize is used, sizeCalculation or size must be set.")}return s},this.#j=(t,i,s)=>{if(e[t]=i,this.#c){let n=this.#c-e[t];for(;this.#b>n;)this.#G(!0)}this.#b+=e[t],s&&(s.entrySize=i,s.totalCalculatedSize=this.#b)}}#R=e=>{};#j=(e,t,i)=>{};#N=(e,t,i,s)=>{if(i||s)throw new TypeError("cannot set size without setting maxSize or maxEntrySize on cache");return 0};*#A({allowStale:e=this.allowStale}={}){if(this.#n)for(let t=this.#h;this.#V(t)&&((e||!this.#p(t))&&(yield t),t!==this.#a);)t=this.#u[t]}*#z({allowStale:e=this.allowStale}={}){if(this.#n)for(let t=this.#a;this.#V(t)&&((e||!this.#p(t))&&(yield t),t!==this.#h);)t=this.#l[t]}#V(e){return e!==void 0&&this.#s.get(this.#i[e])===e}*entries(){for(let e of this.#A())this.#t[e]!==void 0&&this.#i[e]!==void 0&&!this.#e(this.#t[e])&&(yield[this.#i[e],this.#t[e]])}*rentries(){for(let e of this.#z())this.#t[e]!==void 0&&this.#i[e]!==void 0&&!this.#e(this.#t[e])&&(yield[this.#i[e],this.#t[e]])}*keys(){for(let e of this.#A()){let t=this.#i[e];t!==void 0&&!this.#e(this.#t[e])&&(yield t)}}*rkeys(){for(let e of this.#z()){let t=this.#i[e];t!==void 0&&!this.#e(this.#t[e])&&(yield t)}}*values(){for(let e of this.#A())this.#t[e]!==void 0&&!this.#e(this.#t[e])&&(yield this.#t[e])}*rvalues(){for(let e of this.#z())this.#t[e]!==void 0&&!this.#e(this.#t[e])&&(yield this.#t[e])}[Symbol.iterator](){return this.entries()}[Symbol.toStringTag]="LRUCache";find(e,t={}){for(let i of this.#A()){let s=this.#t[i],n=this.#e(s)?s.__staleWhileFetching:s;if(n!==void 0&&e(n,this.#i[i],this))return this.#C(this.#i[i],t)}}forEach(e,t=this){for(let i of this.#A()){let s=this.#t[i],n=this.#e(s)?s.__staleWhileFetching:s;n!==void 0&&e.call(t,n,this.#i[i],this)}}rforEach(e,t=this){for(let i of this.#z()){let s=this.#t[i],n=this.#e(s)?s.__staleWhileFetching:s;n!==void 0&&e.call(t,n,this.#i[i],this)}}purgeStale(){let e=!1;for(let t of this.#z({allowStale:!0}))this.#p(t)&&(this.#E(this.#i[t],"expire"),e=!0);return e}info(e){let t=this.#s.get(e);if(t===void 0)return;let i=this.#t[t],s=this.#e(i)?i.__staleWhileFetching:i;if(s===void 0)return;let n={value:s};if(this.#d&&this.#F){let r=this.#d[t],h=this.#F[t];if(r&&h){let a=r-(this.#m.now()-h);n.ttl=a,n.start=Date.now()}}return this.#_&&(n.size=this.#_[t]),n}dump(){let e=[];for(let t of this.#A({allowStale:!0})){let i=this.#i[t],s=this.#t[t],n=this.#e(s)?s.__staleWhileFetching:s;if(n===void 0||i===void 0)continue;let r={value:n};if(this.#d&&this.#F){r.ttl=this.#d[t];let h=this.#m.now()-this.#F[t];r.start=Math.floor(Date.now()-h)}this.#_&&(r.size=this.#_[t]),e.unshift([i,r])}return e}load(e){this.clear();for(let[t,i]of e){if(i.start){let s=Date.now()-i.start;i.start=this.#m.now()-s}this.#W(t,i.value,i)}}set(e,t,i={}){let{status:s=S.hasSubscribers?{}:void 0}=i;i.status=s,s&&(s.op="set",s.key=e,t!==void 0&&(s.value=t),s.cache=this);let n=this.#W(e,t,i);return s&&S.hasSubscribers&&S.publish(s),n}#W(e,t,i,s){let{ttl:n=this.ttl,start:r,noDisposeOnSet:h=this.noDisposeOnSet,sizeCalculation:a=this.sizeCalculation,status:o}=i,d=this.#e(t);if(t===void 0)return o&&(o.set="deleted"),this.delete(e),this;let{noUpdateTTL:y=this.noUpdateTTL}=i;o&&!d&&(o.value=t);let _=this.#N(e,t,i.size||0,a,o);if(this.maxEntrySize&&_>this.maxEntrySize)return this.#E(e,"set"),o&&(o.set="miss",o.maxEntrySizeExceeded=!0),this;let c=this.#n===0?void 0:this.#s.get(e);if(c===void 0)c=this.#n===0?this.#h:this.#y.length!==0?this.#y.pop():this.#n===this.#o?this.#G(!1):this.#n,this.#i[c]=e,this.#t[c]=t,this.#s.set(e,c),this.#l[this.#h]=c,this.#u[c]=this.#h,this.#h=c,this.#n++,this.#j(c,_,o),o&&(o.set="add"),y=!1,this.#x&&!d&&this.#O?.(t,e,"add");else{this.#L(c);let g=this.#t[c];if(t!==g){if(!h)if(this.#e(g)){g!==s&&g.__abortController.abort(new Error("replaced"));let{__staleWhileFetching:f}=g;f!==void 0&&f!==t&&(this.#T&&this.#S?.(f,e,"set"),this.#f&&this.#r?.push([f,e,"set"]))}else this.#T&&this.#S?.(g,e,"set"),this.#f&&this.#r?.push([g,e,"set"]);if(this.#R(c),this.#j(c,_,o),this.#t[c]=t,!d){let f=g&&this.#e(g)?g.__staleWhileFetching:g,b=f===void 0?"add":t!==f?"replace":"update";o&&(o.set=b,f!==void 0&&(o.oldValue=f)),this.#x&&this.onInsert?.(t,e,b)}}else d||(o&&(o.set="update"),this.#x&&this.onInsert?.(t,e,"update"))}if(n!==0&&!this.#d&&this.#k(),this.#d&&(y||this.#H(c,n,r),o&&this.#v(o,c)),!h&&this.#f&&this.#r){let g=this.#r,f;for(;f=g?.shift();)this.#w?.(...f)}return this}pop(){try{for(;this.#n;){let e=this.#t[this.#a];if(this.#G(!0),this.#e(e)){if(e.__staleWhileFetching)return e.__staleWhileFetching}else if(e!==void 0)return e}}finally{if(this.#f&&this.#r){let e=this.#r,t;for(;t=e?.shift();)this.#w?.(...t)}}}#G(e){let t=this.#a,i=this.#i[t],s=this.#t[t],n=this.#e(s);n&&s.__abortController.abort(new Error("evicted"));let r=n?s.__staleWhileFetching:s;return(this.#T||this.#f)&&r!==void 0&&(this.#T&&this.#S?.(r,i,"evict"),this.#f&&this.#r?.push([r,i,"evict"])),this.#R(t),this.#g?.[t]&&(clearTimeout(this.#g[t]),this.#g[t]=void 0),e&&(this.#i[t]=void 0,this.#t[t]=void 0,this.#y.push(t)),this.#n===1?(this.#a=this.#h=0,this.#y.length=0):this.#a=this.#l[t],this.#s.delete(i),this.#n--,t}has(e,t={}){let{status:i=S.hasSubscribers?{}:void 0}=t;t.status=i,i&&(i.op="has",i.key=e,i.cache=this);let s=this.#Y(e,t);return S.hasSubscribers&&S.publish(i),s}#Y(e,t={}){let{updateAgeOnHas:i=this.updateAgeOnHas,status:s}=t,n=this.#s.get(e);if(n!==void 0){let r=this.#t[n];if(this.#e(r)&&r.__staleWhileFetching===void 0)return!1;if(this.#p(n))s&&(s.has="stale",this.#v(s,n));else return i&&this.#D(n),s&&(s.has="hit",this.#v(s,n)),!0}else s&&(s.has="miss");return!1}peek(e,t={}){let{status:i=D()?{}:void 0}=t;i&&(i.op="peek",i.key=e,i.cache=this),t.status=i;let s=this.#J(e,t);return S.hasSubscribers&&S.publish(i),s}#J(e,t){let{status:i,allowStale:s=this.allowStale}=t,n=this.#s.get(e);if(n===void 0||!s&&this.#p(n)){i&&(i.peek=n===void 0?"miss":"stale");return}let r=this.#t[n],h=this.#e(r)?r.__staleWhileFetching:r;return i&&(h!==void 0?(i.peek="hit",i.value=h):i.peek="miss"),h}#P(e,t,i,s){let n=t===void 0?void 0:this.#t[t];if(this.#e(n))return n;let r=new AbortController,{signal:h}=i;h?.addEventListener("abort",()=>r.abort(h.reason),{signal:r.signal});let a={signal:r.signal,options:i,context:s},o=(f,b=!1)=>{let{aborted:l}=r.signal,w=i.ignoreFetchAbort&&f!==void 0,F=i.ignoreFetchAbort||!!(i.allowStaleOnFetchAbort&&f!==void 0);if(i.status&&(l&&!b?(i.status.fetchAborted=!0,i.status.fetchError=r.signal.reason,w&&(i.status.fetchAbortIgnored=!0)):i.status.fetchResolved=!0),l&&!w&&!b)return y(r.signal.reason,F);let m=c,p=this.#t[t];return(p===c||p===void 0&&w&&b)&&(f===void 0?m.__staleWhileFetching!==void 0?this.#t[t]=m.__staleWhileFetching:this.#E(e,"fetch"):(i.status&&(i.status.fetchUpdated=!0),this.#W(e,f,a.options,m))),f},d=f=>(i.status&&(i.status.fetchRejected=!0,i.status.fetchError=f),y(f,!1)),y=(f,b)=>{let{aborted:l}=r.signal,w=l&&i.allowStaleOnFetchAbort,F=w||i.allowStaleOnFetchRejection,m=F||i.noDeleteOnFetchRejection,p=c;if(this.#t[t]===c&&(!m||!b&&p.__staleWhileFetching===void 0?this.#E(e,"fetch"):w||(this.#t[t]=p.__staleWhileFetching)),F)return i.status&&p.__staleWhileFetching!==void 0&&(i.status.returnedStale=!0),p.__staleWhileFetching;if(p.__returned===p)throw f},_=(f,b)=>{let l=this.#M?.(e,n,a);r.signal.addEventListener("abort",()=>{(!i.ignoreFetchAbort||i.allowStaleOnFetchAbort)&&(f(void 0),i.allowStaleOnFetchAbort&&(f=w=>o(w,!0)))}),l&&l instanceof Promise?l.then(w=>f(w===void 0?void 0:w),b):l!==void 0&&f(l)};i.status&&(i.status.fetchDispatched=!0);let c=new Promise(_).then(o,d),g=Object.assign(c,{__abortController:r,__staleWhileFetching:n,__returned:void 0});return t===void 0?(this.#W(e,g,{...a.options,status:void 0}),t=this.#s.get(e)):this.#t[t]=g,g}#e(e){if(!this.#U)return!1;let t=e;return!!t&&t instanceof Promise&&t.hasOwnProperty("__staleWhileFetching")&&t.__abortController instanceof AbortController}fetch(e,t={}){let i=W.hasSubscribers,{status:s=D()?{}:void 0}=t;t.status=s,s&&t.context&&(s.context=t.context);let n=this.#B(e,t);return s&&i&&(s.trace=!0,W.tracePromise(()=>n,s).catch(()=>{})),n}async#B(e,t={}){let{allowStale:i=this.allowStale,updateAgeOnGet:s=this.updateAgeOnGet,noDeleteOnStaleGet:n=this.noDeleteOnStaleGet,ttl:r=this.ttl,noDisposeOnSet:h=this.noDisposeOnSet,size:a=0,sizeCalculation:o=this.sizeCalculation,noUpdateTTL:d=this.noUpdateTTL,noDeleteOnFetchRejection:y=this.noDeleteOnFetchRejection,allowStaleOnFetchRejection:_=this.allowStaleOnFetchRejection,ignoreFetchAbort:c=this.ignoreFetchAbort,allowStaleOnFetchAbort:g=this.allowStaleOnFetchAbort,context:f,forceRefresh:b=!1,status:l,signal:w}=t;if(l&&(l.op="fetch",l.key=e,b&&(l.forceRefresh=!0),l.cache=this),!this.#U)return l&&(l.fetch="get"),this.#C(e,{allowStale:i,updateAgeOnGet:s,noDeleteOnStaleGet:n,status:l});let F={allowStale:i,updateAgeOnGet:s,noDeleteOnStaleGet:n,ttl:r,noDisposeOnSet:h,size:a,sizeCalculation:o,noUpdateTTL:d,noDeleteOnFetchRejection:y,allowStaleOnFetchRejection:_,allowStaleOnFetchAbort:g,ignoreFetchAbort:c,status:l,signal:w},m=this.#s.get(e);if(m===void 0){l&&(l.fetch="miss");let p=this.#P(e,m,F,f);return p.__returned=p}else{let p=this.#t[m];if(this.#e(p)){let v=i&&p.__staleWhileFetching!==void 0;return l&&(l.fetch="inflight",v&&(l.returnedStale=!0)),v?p.__staleWhileFetching:p.__returned=p}let A=this.#p(m);if(!b&&!A)return l&&(l.fetch="hit"),this.#L(m),s&&this.#D(m),l&&this.#v(l,m),p;let z=this.#P(e,m,F,f),E=z.__staleWhileFetching!==void 0&&i;return l&&(l.fetch=A?"stale":"refresh",E&&A&&(l.returnedStale=!0)),E?z.__staleWhileFetching:z.__returned=z}}forceFetch(e,t={}){let i=W.hasSubscribers,{status:s=D()?{}:void 0}=t;t.status=s,s&&t.context&&(s.context=t.context);let n=this.#K(e,t);return s&&i&&(s.trace=!0,W.tracePromise(()=>n,s).catch(()=>{})),n}async#K(e,t={}){let i=await this.#B(e,t);if(i===void 0)throw new Error("fetch() returned undefined");return i}memo(e,t={}){let{status:i=S.hasSubscribers?{}:void 0}=t;t.status=i,i&&(i.op="memo",i.key=e,t.context&&(i.context=t.context),i.cache=this);let s=this.#Q(e,t);return i&&(i.value=s),S.hasSubscribers&&S.publish(i),s}#Q(e,t={}){let i=this.#I;if(!i)throw new Error("no memoMethod provided to constructor");let{context:s,status:n,forceRefresh:r,...h}=t;n&&r&&(n.forceRefresh=!0);let a=this.#C(e,h),o=r||a===void 0;if(n&&(n.memo=o?"miss":"hit",o||(n.value=a)),!o)return a;let d=i(e,a,{options:h,context:s});return n&&(n.value=d),this.#W(e,d,h),d}get(e,t={}){let{status:i=S.hasSubscribers?{}:void 0}=t;t.status=i,i&&(i.op="get",i.key=e,i.cache=this);let s=this.#C(e,t);return i&&(s!==void 0&&(i.value=s),S.hasSubscribers&&S.publish(i)),s}#C(e,t={}){let{allowStale:i=this.allowStale,updateAgeOnGet:s=this.updateAgeOnGet,noDeleteOnStaleGet:n=this.noDeleteOnStaleGet,status:r}=t,h=this.#s.get(e);if(h===void 0){r&&(r.get="miss");return}let a=this.#t[h],o=this.#e(a);return r&&this.#v(r,h),this.#p(h)?o?(r&&(r.get="stale-fetching"),i&&a.__staleWhileFetching!==void 0?(r&&(r.returnedStale=!0),a.__staleWhileFetching):void 0):(n||this.#E(e,"expire"),r&&(r.get="stale"),i?(r&&(r.returnedStale=!0),a):void 0):(r&&(r.get=o?"fetching":"hit"),this.#L(h),s&&this.#D(h),o?a.__staleWhileFetching:a)}#$(e,t){this.#u[t]=e,this.#l[e]=t}#L(e){e!==this.#h&&(e===this.#a?this.#a=this.#l[e]:this.#$(this.#u[e],this.#l[e]),this.#$(this.#h,e),this.#h=e)}delete(e){return this.#E(e,"delete")}#E(e,t){S.hasSubscribers&&S.publish({op:"delete",delete:t,key:e,cache:this});let i=!1;if(this.#n!==0){let s=this.#s.get(e);if(s!==void 0)if(this.#g?.[s]&&(clearTimeout(this.#g?.[s]),this.#g[s]=void 0),i=!0,this.#n===1)this.#q(t);else{this.#R(s);let n=this.#t[s];if(this.#e(n)?n.__abortController.abort(new Error("deleted")):(this.#T||this.#f)&&(this.#T&&this.#S?.(n,e,t),this.#f&&this.#r?.push([n,e,t])),this.#s.delete(e),this.#i[s]=void 0,this.#t[s]=void 0,s===this.#h)this.#h=this.#u[s];else if(s===this.#a)this.#a=this.#l[s];else{let r=this.#u[s];this.#l[r]=this.#l[s];let h=this.#l[s];this.#u[h]=this.#u[s]}this.#n--,this.#y.push(s)}}if(this.#f&&this.#r?.length){let s=this.#r,n;for(;n=s?.shift();)this.#w?.(...n)}return i}clear(){return this.#q("delete")}#q(e){for(let t of this.#z({allowStale:!0})){let i=this.#t[t];if(this.#e(i))i.__abortController.abort(new Error("deleted"));else{let s=this.#i[t];this.#T&&this.#S?.(i,s,e),this.#f&&this.#r?.push([i,s,e])}}if(this.#s.clear(),this.#t.fill(void 0),this.#i.fill(void 0),this.#d&&this.#F){this.#d.fill(0),this.#F.fill(0);for(let t of this.#g??[])t!==void 0&&clearTimeout(t);this.#g?.fill(void 0)}if(this.#_&&this.#_.fill(0),this.#a=0,this.#h=0,this.#y.length=0,this.#b=0,this.#n=0,this.#f&&this.#r){let t=this.#r,i;for(;i=t?.shift();)this.#w?.(...i)}}};
//# sourceMappingURL=index.min.js.map


/***/ },

/***/ "./package.json"
/*!**********************!*\
  !*** ./package.json ***!
  \**********************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"name":"imde","displayName":"IMDE","description":"Ingenic MCU Development Environment — VS Code integration","version":"0.3.5-beta","publisher":"ingenic","license":"ISC","icon":"icon.png","engines":{"vscode":"^1.85.0"},"categories":["Other"],"activationEvents":["workspaceContains:imde.json","onCommand:imde.guiConfig","onCommand:imde.build","onCommand:imde.doctor","onCommand:imde.fullCleanBuild","onCommand:imde.viewMap"],"main":"./dist/extension.js","contributes":{"commands":[{"command":"imde.doctor","title":"IMDE: Run Doctor","icon":"$(heart)"},{"command":"imde.build","title":"IMDE: Build","icon":"$(wrench)"},{"command":"imde.fullCleanBuild","title":"IMDE: FullClean & Build","icon":""},{"command":"imde.configure","title":"IMDE: Configure"},{"command":"imde.menuconfig","title":"IMDE: Menuconfig"},{"command":"imde.guiConfig","title":"IMDE: GUI Config","icon":"$(settings)"},{"command":"imde.clean","title":"IMDE: Clean"},{"command":"imde.fullclean","title":"IMDE: Full Clean"},{"command":"imde.selectDefconfig","title":"IMDE: Select Defconfig","icon":"$(list-selection)"},{"command":"imde.saveDefconfig","title":"IMDE: Save Defconfig"},{"command":"imde.setupToolchain","title":"IMDE: Setup Toolchain"},{"command":"imde.status","title":"IMDE: Show Status"},{"command":"imde.artifacts","title":"IMDE: Show Artifacts"},{"command":"imde.copyPath","title":"IMDE: Copy Path","icon":"$(copy)"},{"command":"imde.revealFile","title":"IMDE: Reveal File","icon":"$(folder-opened)"},{"command":"imde.refresh","title":"IMDE: Refresh View","icon":"$(refresh)"},{"command":"imde.viewMap","title":"IMDE: View Map","icon":"$(symbol-color)"},{"command":"imde.openFile","title":"IMDE: Open Source File"}],"viewsContainers":{"activitybar":[{"id":"imde-sidebar","title":"IMDE","icon":"logo/ingenic_blue.svg"}]},"views":{"imde-sidebar":[{"id":"imde.doctorView","name":"Environment"},{"id":"imde.buildView","name":"Build & Config"},{"id":"imde.artifactsView","name":"Artifacts"}]},"menus":{"view/title":[{"command":"imde.refresh","when":"view == imde.doctorView","group":"navigation"},{"command":"imde.refresh","when":"view == imde.artifactsView","group":"navigation"},{"command":"imde.build","when":"view == imde.buildView","group":"navigation"},{"command":"imde.selectDefconfig","when":"view == imde.buildView","group":"navigation"}],"view/item/context":[{"command":"imde.copyPath","when":"view == imde.artifactsView && viewItem == imdeArtifact","group":"inline"},{"command":"imde.revealFile","when":"view == imde.artifactsView && viewItem == imdeArtifact","group":"inline"},{"command":"imde.viewMap","when":"view == imde.artifactsView && viewItem == imdeMapArtifact","group":"inline@1"}]},"configuration":{"title":"IMDE","properties":{"imde.projectDir":{"type":"string","default":"","scope":"resource","description":"Override the SDK project directory. When empty, IMDE searches upward from the first workspace folder for imde.json."},"imde.terminalName":{"type":"string","default":"IMDE","description":"Terminal name used for interactive IMDE commands."},"imde.captureTimeoutMs":{"type":"number","default":15000,"minimum":1000,"description":"Timeout in milliseconds for short JSON capture commands used by IMDE views."},"imde.commandTimeoutMs":{"type":"number","default":0,"minimum":0,"description":"Timeout in milliseconds for non-interactive IMDE commands. Use 0 to disable the timeout."},"imde.showOutputOnError":{"type":"boolean","default":true,"description":"Reveal the IMDE output channel when a non-interactive command fails."},"imde.guiConfig.uiTheme":{"scope":"window","type":"string","default":"modern","enum":["modern","default"],"enumDescriptions":["Default tree navigation interface","Modern table layout"],"description":"Select the UI theme for the GUI Config panel."},"imde.guiConfig.autoHeaderPath":{"scope":"resource","type":"string","default":"","description":"Path to write the generated C header file. Leave empty to skip header generation (SDK uses CMake-generated sdk_config.h)."}}}},"scripts":{"vscode:prepublish":"webpack --mode production","compile":"webpack --mode development","check":"webpack --mode development","watch":"webpack --mode development --watch","test":"npm run test:parser && npm run test:diag","test:parser":"npx ts-node --project test/tsconfig.json test/parser.test.ts","test:diag":"npx ts-node --project test/tsconfig.json test/diagnostics.test.ts","package":"vsce package","package:dry":"vsce ls","publish":"vsce publish"},"devDependencies":{"@types/node":"^18.19.0","@types/vscode":"^1.85.0","@vscode/vsce":"^2.22.0","@vue/compiler-sfc":"^3.3.4","assert":"^2.0.0","css-loader":"^6.8.1","os-browserify":"^0.3.0","path-browserify":"^1.0.1","sass":"^1.64.1","sass-loader":"^13.3.2","stream-browserify":"^3.0.0","ts-loader":"^9.3.1","typescript":"^5.3.0","vue-loader":"^17.2.2","vue-style-loader":"^4.1.3","webpack":"^5.74.0","webpack-cli":"^4.10.0"},"dependencies":{"@iconify-prerendered/vue-codicon":"^0.28.1753246500","@vscode/codicons":"^0.0.35","glob":"^11.0.3","pinia":"^2.1.6","vue":"^3.3.4"}}');

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; (typeof current == 'object' || typeof current == 'function') && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**************************!*\
  !*** ./src/extension.ts ***!
  \**************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   activate: () => (/* binding */ activate),
/* harmony export */   deactivate: () => (/* binding */ deactivate)
/* harmony export */ });
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vscode */ "vscode");
/* harmony import */ var vscode__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vscode__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _imdeRunner__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./imdeRunner */ "./src/imdeRunner.ts");
/* harmony import */ var _doctorTree__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./doctorTree */ "./src/doctorTree.ts");
/* harmony import */ var _artifactsTree__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./artifactsTree */ "./src/artifactsTree.ts");
/* harmony import */ var _buildTree__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./buildTree */ "./src/buildTree.ts");
/* harmony import */ var _menuconfig_MenuconfigPanel__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./menuconfig/MenuconfigPanel */ "./src/menuconfig/MenuconfigPanel.ts");
/* harmony import */ var _menuconfig_fileWatcher__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./menuconfig/fileWatcher */ "./src/menuconfig/fileWatcher.ts");
/* harmony import */ var _logger_logger__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./logger/logger */ "./src/logger/logger.ts");
/* harmony import */ var _diagnostics__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./diagnostics */ "./src/diagnostics.ts");
/* harmony import */ var _mapview_parser__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./mapview/parser */ "./src/mapview/parser.ts");
/* harmony import */ var _mapview_panel__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./mapview/panel */ "./src/mapview/panel.ts");
/* harmony import */ var _defconfig__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./defconfig */ "./src/defconfig.ts");



// eslint-disable-next-line @typescript-eslint/no-var-requires
const PACKAGE_JSON = __webpack_require__(/*! ../package.json */ "./package.json");










// Cache for parsed .map files: path -> { mtime, data }
const mapCache = new Map();
async function getCachedMapData(filePath) {
    const fs = __webpack_require__(/*! fs */ "fs");
    const stat = fs.statSync(filePath);
    const cached = mapCache.get(filePath);
    if (cached && cached.mtime === stat.mtimeMs) {
        return cached.data;
    }
    const content = await vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.fs.readFile(vscode__WEBPACK_IMPORTED_MODULE_0__.Uri.file(filePath));
    const text = Buffer.from(content).toString("utf-8");
    const data = (0,_mapview_parser__WEBPACK_IMPORTED_MODULE_10__.parseMapFile)(text);
    mapCache.set(filePath, { mtime: stat.mtimeMs, data });
    return data;
}
function activate(context) {
    _logger_logger__WEBPACK_IMPORTED_MODULE_8__.Logger.info("IMDE extension is now active");
    const runner = new _imdeRunner__WEBPACK_IMPORTED_MODULE_2__.ImdeRunner();
    context.subscriptions.push(runner);
    _imdeRunner__WEBPACK_IMPORTED_MODULE_2__.ImdeRunner.warmupEnv();
    // ---- Diagnostics (Problems panel integration) ----
    const diagnostics = new _diagnostics__WEBPACK_IMPORTED_MODULE_9__.ImdeDiagnostics(runner.getProjectDir());
    context.subscriptions.push(diagnostics);
    // ---- File watcher for config changes ----
    const fileWatcher = new _menuconfig_fileWatcher__WEBPACK_IMPORTED_MODULE_7__.FileWatcher(context);
    fileWatcher.initialize();
    // ---- Tree views ----
    const doctorTree = new _doctorTree__WEBPACK_IMPORTED_MODULE_3__.DoctorTreeProvider(runner);
    const buildTree = new _buildTree__WEBPACK_IMPORTED_MODULE_5__.BuildTreeProvider(runner);
    const artifactsTree = new _artifactsTree__WEBPACK_IMPORTED_MODULE_4__.ArtifactsTreeProvider(runner);
    context.subscriptions.push(vscode__WEBPACK_IMPORTED_MODULE_0__.window.registerTreeDataProvider("imde.doctorView", doctorTree), vscode__WEBPACK_IMPORTED_MODULE_0__.window.registerTreeDataProvider("imde.buildView", buildTree), vscode__WEBPACK_IMPORTED_MODULE_0__.window.registerTreeDataProvider("imde.artifactsView", artifactsTree));
    const refreshAll = () => {
        doctorTree.refresh();
        buildTree.refresh();
        artifactsTree.refresh();
    };
    const runAction = async (command, args, title, after) => {
        diagnostics.clear();
        const result = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.withProgress({ location: vscode__WEBPACK_IMPORTED_MODULE_0__.ProgressLocation.Window, title, cancellable: false }, () => runner.runCommand(command, args, { streamOutput: true }));
        if (result.code !== 0 || result.timedOut) {
            const count = diagnostics.report(result.stderr + "\n" + result.stdout);
            if (count > 0) {
                const action = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showErrorMessage(`IMDE ${command} failed with ${count} issue${count > 1 ? "s" : ""}.`, "Show Problems", "Show Output");
                if (action === "Show Problems") {
                    vscode__WEBPACK_IMPORTED_MODULE_0__.commands.executeCommand("workbench.actions.view.problems");
                }
                else if (action === "Show Output") {
                    runner.showOutput();
                }
                return; // Don't call reportResult again
            }
        }
        await reportResult(runner, command, result);
        if (result.code === 0 && !result.timedOut) {
            after?.();
        }
    };
    // ---- Commands ----
    context.subscriptions.push(vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.doctor", () => {
        diagnostics.clear();
        runner.runTerminal("doctor", [], { show: true });
        pollRefresh(() => doctorTree.refresh(true), 2000, 2);
    }), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.build", async () => {
        diagnostics.clear();
        vscode__WEBPACK_IMPORTED_MODULE_0__.window.withProgress({ location: vscode__WEBPACK_IMPORTED_MODULE_0__.ProgressLocation.Window, title: "IMDE Build — running…" }, () => new Promise(resolve => {
            runner.runTerminal("build", [], { show: true });
            // Terminal exits asynchronously; poll for artifacts as best-effort completion signal
            const poll = setInterval(() => {
                runner.captureJson("artifacts").then(data => {
                    if (data?.artifacts && Object.keys(data.artifacts).length > 0) {
                        clearInterval(poll);
                        resolve();
                    }
                }).catch(() => { });
            }, 2000);
            // Safety timeout
            setTimeout(() => { clearInterval(poll); resolve(); }, 120000);
        }));
        pollRefresh(() => { artifactsTree.refresh(); buildTree.refresh(); }, 3000, 3);
    }), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.configure", () => {
        diagnostics.clear();
        runner.runTerminal("configure", [], { show: true });
        pollRefresh(() => buildTree.refresh(), 2000, 2);
    }), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.menuconfig", async () => {
        const projDir = runner.getProjectDir();
        const cmakeCache = path__WEBPACK_IMPORTED_MODULE_1__.join(projDir, "build", "CMakeCache.txt");
        if (!(__webpack_require__(/*! fs */ "fs").existsSync)(cmakeCache)) {
            await vscode__WEBPACK_IMPORTED_MODULE_0__.window.withProgress({ location: vscode__WEBPACK_IMPORTED_MODULE_0__.ProgressLocation.Notification, title: "Configuring build before menuconfig..." }, async () => {
                await runner.runCommand("configure", [], { streamOutput: false });
            });
        }
        runner.runTerminal("menuconfig", [], { show: true });
        pollRefresh(() => { buildTree.refresh(); artifactsTree.refresh(); }, 3000, 3);
    }), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.fullCleanBuild", () => {
        diagnostics.clear();
        runner.runTerminal("fullclean", ["--yes"], { show: true });
        setTimeout(() => {
            runner.runTerminal("build", [], { show: true });
        }, 800);
        pollRefresh(() => { artifactsTree.refresh(); buildTree.refresh(); }, 3000, 5);
    }), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.clean", () => {
        diagnostics.clear();
        runner.runTerminal("clean", [], { show: true });
        pollRefresh(() => artifactsTree.refresh(), 2000, 2);
    }), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.fullclean", async () => {
        const ans = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage("Delete the entire IMDE build directory? This cannot be undone.", { modal: true }, "Delete");
        if (ans === "Delete") {
            diagnostics.clear();
            runner.runTerminal("fullclean", ["--yes"], { show: true });
            pollRefresh(() => { artifactsTree.refresh(); buildTree.refresh(); }, 2000, 2);
        }
    }), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.status", async () => runAction("status", [], "Reading IMDE status", buildTree.refresh.bind(buildTree))), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.artifacts", async () => runAction("artifacts", [], "Reading IMDE artifacts", artifactsTree.refresh.bind(artifactsTree))), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.setupToolchain", async () => runAction("setup-toolchain", [], "Setting up IMDE toolchain", refreshAll)), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.selectDefconfig", () => (0,_defconfig__WEBPACK_IMPORTED_MODULE_12__.selectDefconfig)(runner, context, buildTree.refresh.bind(buildTree))), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.saveDefconfig", () => (0,_defconfig__WEBPACK_IMPORTED_MODULE_12__.saveDefconfig)(runner)), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.copyPath", async (itemOrPath) => {
        const filePath = typeof itemOrPath === "string" ? itemOrPath : itemOrPath.artifactPath;
        await vscode__WEBPACK_IMPORTED_MODULE_0__.env.clipboard.writeText(filePath);
        vscode__WEBPACK_IMPORTED_MODULE_0__.window.showInformationMessage("Path copied");
    }), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.revealFile", async (itemOrPath) => {
        const filePath = typeof itemOrPath === "string" ? itemOrPath : itemOrPath.artifactPath;
        await vscode__WEBPACK_IMPORTED_MODULE_0__.commands.executeCommand("revealFileInOS", vscode__WEBPACK_IMPORTED_MODULE_0__.Uri.file(filePath));
    }), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.refresh", refreshAll), 
    // Used by Map View webview to open source files from tooltip links
    vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.openFile", async (args) => {
        // Accept single path or [fullPath, relativePath] tuple
        const fullPath = Array.isArray(args) ? args[0] : args;
        const relPath = Array.isArray(args) ? args[1] : "";
        const uri = vscode__WEBPACK_IMPORTED_MODULE_0__.Uri.file(fullPath);
        if ((__webpack_require__(/*! fs */ "fs").existsSync)(fullPath)) {
            await vscode__WEBPACK_IMPORTED_MODULE_0__.commands.executeCommand("vscode.open", uri);
            return;
        }
        // Fallback: fuzzy search in workspace for the relative source file
        if (relPath) {
            const results = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.withProgress({ location: vscode__WEBPACK_IMPORTED_MODULE_0__.ProgressLocation.Window, title: "Searching source file…" }, () => vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.findFiles("**/" + relPath.replace(/\\/g, "/"), null, 1));
            if (results.length > 0) {
                await vscode__WEBPACK_IMPORTED_MODULE_0__.commands.executeCommand("vscode.open", results[0]);
                return;
            }
        }
        vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage("Source file not found: " + (relPath || fullPath));
    }), 
    // ---- Map View ----
    vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.viewMap", async (item) => {
        let filePath;
        if (typeof item === "string") {
            filePath = item;
        }
        else if (item?.artifactPath) {
            filePath = item.artifactPath;
        }
        else {
            // Find .map artifact automatically
            const data = await runner.captureJson("artifacts");
            if (data?.artifacts) {
                const maps = Object.entries(data.artifacts)
                    .filter(([k, v]) => k.endsWith(".map") && v.exists)
                    .map(([k, v]) => ({ label: k, path: v.path }));
                if (maps.length === 1) {
                    filePath = maps[0].path;
                }
                else if (maps.length > 1) {
                    const picked = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showQuickPick(maps, { placeHolder: "Select a .map file to view" });
                    filePath = picked?.path;
                }
            }
            if (!filePath) {
                vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage("No .map artifact found. Build first?");
                return;
            }
        }
        try {
            const mapData = await getCachedMapData(filePath);
            _mapview_panel__WEBPACK_IMPORTED_MODULE_11__.MapViewPanel.createOrShow(context.extensionUri, filePath, mapData, runner.getProjectDir());
        }
        catch (err) {
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.showErrorMessage(`Failed to parse map file: ${err.message}`);
        }
    }), 
    // ---- GUI Config (Visual Kconfig Editor) ----
    vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.guiConfig", async (uri) => {
        const workspaceFolder = uri
            ? vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getWorkspaceFolder(uri)
            : vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.showErrorMessage("Please open a workspace folder first.");
            return;
        }
        // Check .config exists
        const fs = __webpack_require__(/*! fs */ "fs");
        const projDir = workspaceFolder.uri.fsPath;
        const configPath = path__WEBPACK_IMPORTED_MODULE_1__.join(projDir, ".config");
        if (!fs.existsSync(configPath)) {
            const action = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage("No .config found. Select a defconfig to generate one.", "Select Defconfig");
            if (action === "Select Defconfig") {
                await (0,_defconfig__WEBPACK_IMPORTED_MODULE_12__.selectDefconfig)(runner, context);
            }
            return;
        }
        // .config exists but build directory may have been cleaned — auto-configure
        const cmakeCache = path__WEBPACK_IMPORTED_MODULE_1__.join(projDir, "build", "CMakeCache.txt");
        if (!fs.existsSync(cmakeCache)) {
            await vscode__WEBPACK_IMPORTED_MODULE_0__.window.withProgress({ location: vscode__WEBPACK_IMPORTED_MODULE_0__.ProgressLocation.Notification, title: "Build directory cleaned — re-configuring..." }, async () => {
                await runner.runCommand("configure", [], { streamOutput: false });
            });
        }
        try {
            _menuconfig_MenuconfigPanel__WEBPACK_IMPORTED_MODULE_6__.MenuconfigPanel.createOrShow(context.extensionUri, workspaceFolder.uri, context);
        }
        catch (error) {
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.showErrorMessage(`Failed to open IMDE GUI Config: ${error.message}`);
        }
    }));
    // Auto-refresh tree views on first load (silent, no terminal)
    doctorTree.refresh();
    buildTree.refresh();
    // ---- Status bar quick actions ----
    // Polling helper: refresh after terminal commands complete
    const pollRefresh = (fn, delay = 3000, retries = 3) => {
        let count = 0;
        const attempt = () => {
            fn();
            if (++count < retries)
                setTimeout(attempt, delay);
        };
        setTimeout(attempt, delay);
    };
    const mkBar = (text, cmd, tooltip, priority) => {
        const item = vscode__WEBPACK_IMPORTED_MODULE_0__.window.createStatusBarItem(vscode__WEBPACK_IMPORTED_MODULE_0__.StatusBarAlignment.Left, priority);
        item.command = cmd;
        item.text = text;
        item.tooltip = tooltip;
        item.show();
        return item;
    };
    const mapBar = mkBar("$(symbol-color) Map", "imde.viewMap", "View Memory Map", 95);
    async function updateMapBarVisibility() {
        try {
            const data = await runner.captureJson("artifacts");
            const hasMap = data?.artifacts && Object.entries(data.artifacts).some(([k, v]) => k.endsWith(".map") && v.exists);
            if (hasMap) {
                mapBar.show();
            }
            else {
                mapBar.hide();
            }
        }
        catch {
            mapBar.hide();
        }
    }
    // Update visibility periodically and after build
    const mapBarTimer = setInterval(updateMapBarVisibility, 10000);
    context.subscriptions.push({ dispose: () => clearInterval(mapBarTimer) });
    setTimeout(updateMapBarVisibility, 2000);
    context.subscriptions.push(mkBar("$(circuit-board) IMDE", "imde.doctor", `IMDE ${PACKAGE_JSON.version}`, 100), mkBar("$(debug-rerun) Rebuild", "imde.fullCleanBuild", "FullClean & Build", 99), mkBar("$(play) Build", "imde.build", "Build", 98), mkBar("$(list-selection) Select", "imde.selectDefconfig", "Select Defconfig", 97), mkBar("$(settings) Config", "imde.guiConfig", "GUI Config", 96), mapBar);
}
async function reportResult(runner, command, result) {
    if (result.code === 0 && !result.timedOut) {
        return;
    }
    const reason = result.timedOut ? "timed out" : `failed with exit code ${result.code ?? "unknown"}`;
    const action = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration("imde").get("showOutputOnError") ?? true
        ? await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showErrorMessage(`IMDE ${command} ${reason}.`, "Show Output")
        : await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showErrorMessage(`IMDE ${command} ${reason}.`);
    if (action === "Show Output") {
        runner.showOutput();
    }
}
function deactivate() {
    _logger_logger__WEBPACK_IMPORTED_MODULE_8__.Logger.info("IMDE extension is now deactivated");
}

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map