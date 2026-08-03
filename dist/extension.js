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
    loading = false;
    loaded = false;
    constructor(runner) {
        this.runner = runner;
    }
    refresh() {
        if (this.loading)
            return;
        this.loading = true;
        this._fetch().then(items => {
            this.cached = items;
        }).catch(() => {
            this.cached = [];
        }).finally(() => {
            this.loaded = true;
            this.loading = false;
            this._onDidChange.fire();
        });
    }
    getTreeItem(element) { return element; }
    getChildren() {
        if (!this.loaded && !this.loading)
            this.refresh();
        if (this.loading) {
            const item = new vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItem("Reading artifacts...");
            item.iconPath = new vscode__WEBPACK_IMPORTED_MODULE_0__.ThemeIcon("loading~spin");
            return [item];
        }
        return this.cached;
    }
    async _fetch() {
        const data = await this.runner.captureJson("artifacts");
        if (!data?.artifacts) {
            const ti = new vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItem("No artifacts available");
            ti.iconPath = new vscode__WEBPACK_IMPORTED_MODULE_0__.ThemeIcon("warning");
            ti.description = "build first";
            ti.tooltip = "Run IMDE Build to generate artifacts.";
            ti.command = { command: "imde.build", title: "Build" };
            return [ti];
        }
        const items = Object.entries(data.artifacts).map(([key, meta]) => {
            const exists = meta.exists;
            const size = meta.size ? `${(meta.size / 1024).toFixed(1)} KB` : "";
            return new ArtifactTreeItem(key, meta.path, exists, size);
        });
        const builtCount = items.filter((item) => item.contextValue === "imdeArtifact" || item.contextValue === "imdeMapArtifact").length;
        if (items.length > 0 && builtCount === 0) {
            const build = new vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItem("Artifacts are not built yet", vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItemCollapsibleState.None);
            build.iconPath = new vscode__WEBPACK_IMPORTED_MODULE_0__.ThemeIcon("play");
            build.description = "run build";
            build.command = { command: "imde.build", title: "Build" };
            return [build, ...items];
        }
        return items;
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
    constructor(runner) {
        this.runner = runner;
    }
    refresh() { this._onDidChange.fire(); }
    getTreeItem(element) { return element; }
    async getChildren() {
        const items = [];
        const data = await this.runner.captureJson("status");
        if (data) {
            const state = data.state || "unknown";
            const ok = state.startsWith("matched") && data.buildConfigured;
            const statusItem = new vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItem(`Status: ${state}`, vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItemCollapsibleState.None);
            statusItem.iconPath = new vscode__WEBPACK_IMPORTED_MODULE_0__.ThemeIcon(ok ? "pass" : "warning");
            statusItem.description = data.buildConfigured ? "configured" : "not configured";
            statusItem.tooltip = data.buildConfigured
                ? "Build system is configured."
                : "Build system is not configured yet. Run Configure before building.";
            items.push(statusItem);
            if (data.defconfig) {
                const defconfig = new vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItem(`Defconfig: ${data.defconfig}`, vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItemCollapsibleState.None);
                defconfig.iconPath = new vscode__WEBPACK_IMPORTED_MODULE_0__.ThemeIcon("symbol-file");
                items.push(defconfig);
            }
            else {
                const defconfig = new vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItem("No defconfig selected", vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItemCollapsibleState.None);
                defconfig.iconPath = new vscode__WEBPACK_IMPORTED_MODULE_0__.ThemeIcon("warning");
                defconfig.description = "select one";
                defconfig.command = { command: "imde.selectDefconfig", title: "Select Defconfig" };
                items.push(defconfig);
            }
        }
        else {
            const failed = new vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItem("Status unavailable", vscode__WEBPACK_IMPORTED_MODULE_0__.TreeItemCollapsibleState.None);
            failed.iconPath = new vscode__WEBPACK_IMPORTED_MODULE_0__.ThemeIcon("warning");
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
        items.push(mkBtn("Pinmux", "imde.pinmux", "circuit-board"));
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
function showPickStep(items, placeHolder, showBack) {
    return new Promise((resolve) => {
        const picker = vscode__WEBPACK_IMPORTED_MODULE_0__.window.createQuickPick();
        let settled = false;
        const backItem = {
            label: "← Back",
            alwaysShow: true,
            isBack: true,
        };
        picker.items = showBack ? [backItem, ...items] : items;
        picker.placeholder = placeHolder;
        picker.matchOnDescription = true;
        picker.matchOnDetail = true;
        const finish = (result) => {
            if (settled)
                return;
            settled = true;
            resolve(result);
            picker.hide();
        };
        picker.onDidAccept(() => {
            const selected = picker.selectedItems[0];
            if (!selected)
                return;
            if ("isBack" in selected) {
                finish({ action: "back" });
            }
            else {
                finish({ action: "pick", item: selected });
            }
        });
        picker.onDidHide(() => {
            if (!settled) {
                settled = true;
                resolve({ action: "cancel" });
            }
            picker.dispose();
        });
        picker.show();
    });
}
function normalizedRoot(record) {
    return (record.sourceRoot || "").replace(/\\/g, "/").replace(/^\.\//, "");
}
function sourceIdentity(record) {
    const root = normalizedRoot(record);
    if (root === "config" && record.boardFamily) {
        return { source: record.boardFamily, sourceKind: "chip" };
    }
    if (root === "test") {
        return { source: "test", sourceKind: "test" };
    }
    if (root === "code/middleware" || root.endsWith("/middleware")) {
        return { source: "middleware", sourceKind: "middleware" };
    }
    return { source: root.split("/").filter(Boolean).pop() || root, sourceKind: "other" };
}
function withoutPrefix(value, prefix) {
    const normalized = value.replace(/\\/g, "/");
    const expected = `${prefix}/`;
    return normalized.startsWith(expected) ? normalized.slice(expected.length) : normalized;
}
function selectionArgs(record, source) {
    const relative = record.rootRelativePath || record.token;
    if (source === "test" && record.microchip) {
        const config = withoutPrefix(relative, record.microchip);
        return { args: ["--reconfigure", source, record.microchip, config], label: config };
    }
    if (source === "test") {
        return { args: ["--reconfigure", record.token], label: record.token };
    }
    const config = record.boardFamily && normalizedRoot(record) === "config"
        ? withoutPrefix(relative, record.boardFamily)
        : relative;
    return { args: ["--reconfigure", source, config], label: config };
}
function makeConfigItems(records, source, recent) {
    const recentSet = new Set(recent);
    const items = records.map((record) => {
        const selection = selectionArgs(record, source);
        const recentKey = record.relativePath || record.token;
        const isRecent = recentSet.has(recentKey) || recentSet.has(record.token);
        return {
            label: selection.label,
            commandArgs: selection.args,
            recentKey,
            legacyToken: record.token,
            description: `${isRecent ? "$(history) " : ""}${record.relativePath || ""}`.trim(),
            detail: [
                record.microchip ? `Microchip: ${record.microchip}` : "",
                record.board ? `Board: ${record.board}` : "",
            ].filter(Boolean).join(" · ") || undefined,
        };
    });
    return items.sort((left, right) => {
        const leftRecent = recentSet.has(left.recentKey) || recentSet.has(left.legacyToken);
        const rightRecent = recentSet.has(right.recentKey) || recentSet.has(right.legacyToken);
        if (leftRecent !== rightRecent)
            return leftRecent ? -1 : 1;
        return left.label.localeCompare(right.label);
    });
}
async function selectDefconfig(runner, context, after) {
    const output = await runner.captureJson("list-defconfigs");
    if (!output?.defconfigs?.length) {
        vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage("No defconfigs found");
        return;
    }
    const recent = context?.workspaceState.get(RECENT_DEFCONFIGS_KEY) || [];
    const sourceMap = new Map();
    for (const record of output.defconfigs) {
        const identity = sourceIdentity(record);
        if (!identity.source)
            continue;
        const existing = sourceMap.get(identity.source);
        if (existing) {
            existing.records.push(record);
            existing.description = `${existing.records.length} configs`;
            continue;
        }
        sourceMap.set(identity.source, {
            label: identity.source,
            source: identity.source,
            sourceKind: identity.sourceKind,
            records: [record],
            description: "1 config",
            iconPath: new vscode__WEBPACK_IMPORTED_MODULE_0__.ThemeIcon(identity.sourceKind === "chip" ? "circuit-board" : identity.sourceKind === "test" ? "beaker" : "library"),
        });
    }
    const sourceOrder = {
        chip: 0,
        middleware: 1,
        test: 2,
        other: 3,
    };
    const sources = [...sourceMap.values()].sort((left, right) => sourceOrder[left.sourceKind] - sourceOrder[right.sourceKind] || left.label.localeCompare(right.label));
    let pickedSource;
    let picked;
    while (!picked) {
        if (!pickedSource) {
            const sourceResult = await showPickStep(sources, "Select config source...", false);
            if (sourceResult.action !== "pick")
                return;
            pickedSource = sourceResult.item;
        }
        let records = pickedSource.records;
        if (pickedSource.sourceKind === "test") {
            const chipMap = new Map();
            for (const record of records) {
                const chip = record.microchip || "Unclassified";
                const grouped = chipMap.get(chip) || [];
                grouped.push(record);
                chipMap.set(chip, grouped);
            }
            const chips = [...chipMap.entries()]
                .map(([chip, chipRecords]) => ({
                label: chip,
                chip,
                records: chipRecords,
                description: `${chipRecords.length} configs`,
                iconPath: new vscode__WEBPACK_IMPORTED_MODULE_0__.ThemeIcon("circuit-board"),
            }))
                .sort((left, right) => left.label.localeCompare(right.label));
            const chipResult = await showPickStep(chips, "Select test chip...", true);
            if (chipResult.action === "cancel")
                return;
            if (chipResult.action === "back") {
                pickedSource = undefined;
                continue;
            }
            records = chipResult.item.records;
        }
        const configResult = await showPickStep(makeConfigItems(records, pickedSource.source, recent), `Select ${pickedSource.source} defconfig...`, true);
        if (configResult.action === "cancel")
            return;
        if (configResult.action === "back") {
            if (pickedSource.sourceKind !== "test")
                pickedSource = undefined;
            continue;
        }
        picked = configResult.item;
    }
    const result = await runner.runCommand("use-defconfig", picked.commandArgs, {
        progressTitle: `Using ${picked.label}`, streamOutput: true,
    });
    if (result.code === 0 && !result.timedOut) {
        if (context) {
            const updated = [picked.recentKey, ...recent.filter((item) => item !== picked.recentKey && item !== picked.legacyToken)].slice(0, MAX_RECENT);
            await context.workspaceState.update(RECENT_DEFCONFIGS_KEY, updated);
        }
        after?.();
    }
}
async function saveDefconfig(runner) {
    const name = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showInputBox({
        prompt: "Defconfig name (without _defconfig suffix) — saved to config/",
        placeHolder: "myboard -> config/myboard_defconfig",
        validateInput: (v) => {
            if (!v.trim())
                return "Name is required";
            if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(v.trim()))
                return "Use letters, numbers, underscores, or dashes";
            return undefined;
        },
    });
    if (!name)
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
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);


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
        return path__WEBPACK_IMPORTED_MODULE_1__.resolve(root, filePath);
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
    loaded = false;
    constructor(runner) {
        this.runner = runner;
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
        if (this.loading)
            return;
        this.loading = true;
        this._onDidChange.fire();
        this.lastRefresh = Date.now();
        this._fetch().then(items => {
            this.cached = items;
        }).catch(() => {
            this.cached = [this._action("Failed to run doctor", "imde.doctor", "open env")];
        }).finally(() => {
            this.loaded = true;
            this.loading = false;
            this._onDidChange.fire();
        });
    }
    getTreeItem(element) { return element; }
    getChildren() {
        if (!this.loaded && !this.loading)
            this._doRefresh();
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
            return [this._action("Failed to run doctor", "imde.doctor", "open env")];
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
    _action(msg, command, description) {
        const ti = this._error(msg);
        ti.description = description;
        ti.command = { command, title: description };
        return ti;
    }
}


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
/* harmony import */ var os__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! os */ "os");
/* harmony import */ var os__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(os__WEBPACK_IMPORTED_MODULE_4__);





/** Canonical platform directory name matching IMDE Python detect_platform(). */
function imdePlatformDir() {
    if (process.platform === "win32")
        return "windows";
    if (process.platform === "linux")
        return "linux";
    if (process.platform === "darwin") {
        try {
            const cpu = os__WEBPACK_IMPORTED_MODULE_4__.cpus();
            // Apple Silicon models report "Apple M…" in their model name
            const isArm = cpu.length > 0 && /Apple\s+M\d/i.test(cpu[0]?.model || "");
            return isArm ? "macos-arm64" : "macos";
        }
        catch {
            return "macos";
        }
    }
    return process.platform;
}
class ImdeRunner {
    terminal;
    output = vscode__WEBPACK_IMPORTED_MODULE_0__.window.createOutputChannel("IMDE");
    _projectRoot = null;
    _projectChecked = false;
    terminalCommandQueue = Promise.resolve();
    terminalEnvReady = false;
    terminalEnvReadyPromise;
    static loginEnvCache = null;
    dispose() {
        this.jsonCache.clear();
        this.output.dispose();
    }
    invalidateJsonCache() {
        this.jsonCache.clear();
    }
    /** Force re-detection of the IMDE project root on next access. */
    resetProjectCheck() {
        this._projectChecked = false;
        this._projectRoot = null;
    }
    /** True when a valid IMDE project (containing imde.json) was resolved. */
    get isValidImdeProject() {
        this._ensureProjectChecked();
        return this._projectRoot !== null;
    }
    /** The resolved IMDE project root, or an empty string when invalid. */
    getProjectDir() {
        this._ensureProjectChecked();
        return this._projectRoot || "";
    }
    _ensureProjectChecked() {
        if (this._projectChecked)
            return;
        this._projectChecked = true;
        const cfg = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration("imde");
        const configured = cfg.get("projectDir")?.trim();
        if (configured) {
            const resolved = path__WEBPACK_IMPORTED_MODULE_2__.resolve(configured);
            if (fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(path__WEBPACK_IMPORTED_MODULE_2__.join(resolved, "imde.json"))) {
                this._projectRoot = resolved;
                return;
            }
            this.output.appendLine(`IMDE: configured projectDir "${resolved}" does not contain imde.json`);
        }
        const ws = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.workspaceFolders;
        if (!ws?.length) {
            this._projectRoot = null;
            return;
        }
        let dir = ws[0].uri.fsPath;
        let depth = 0;
        const MAX_DEPTH = 10;
        while (dir !== path__WEBPACK_IMPORTED_MODULE_2__.dirname(dir) && depth < MAX_DEPTH) {
            if (fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(path__WEBPACK_IMPORTED_MODULE_2__.join(dir, "imde.json"))) {
                this._projectRoot = dir;
                return;
            }
            dir = path__WEBPACK_IMPORTED_MODULE_2__.dirname(dir);
            depth++;
        }
        // Not found within limit — not an IMDE workspace
        this._projectRoot = null;
        this.output.appendLine(`IMDE: imde.json not found within ${MAX_DEPTH} levels above workspace root. Extension will stay idle.`);
    }
    static loginEnvPromise = null;
    /** Kick off async login-shell env capture. Non-blocking — returns immediately. */
    static warmupEnv() {
        if (process.platform === "win32") {
            ImdeRunner.loginEnvCache = { ...process.env };
            return;
        }
        if (ImdeRunner.loginEnvPromise)
            return;
        // Fire-and-forget: capture login-shell PATH in background
        ImdeRunner.loginEnvPromise = ImdeRunner.captureShellEnvAsync().then(env => {
            ImdeRunner.loginEnvCache = env;
            return env;
        }).catch(() => {
            // Fall back to process.env on failure
            const fallback = { ...process.env };
            ImdeRunner.loginEnvCache = fallback;
            return fallback;
        });
    }
    static resolveLoginEnv(_force = false) {
        if (ImdeRunner.loginEnvCache) {
            return ImdeRunner.loginEnvCache;
        }
        if (process.platform === "win32") {
            ImdeRunner.loginEnvCache = { ...process.env };
            return ImdeRunner.loginEnvCache;
        }
        // Still warming up — return process.env as fallback
        return { ...process.env };
    }
    static async captureShellEnvAsync() {
        const merged = { ...process.env };
        const shell = process.env.SHELL || "/bin/bash";
        const execShell = (args, timeout) => new Promise(resolve => {
            const child = child_process__WEBPACK_IMPORTED_MODULE_1__.spawn(shell, args, {
                timeout, stdio: ["ignore", "pipe", "pipe"],
            });
            let stdout = "";
            child.stdout?.on("data", (d) => { stdout += d.toString("utf8"); });
            child.on("close", () => resolve(stdout));
            child.on("error", () => resolve(""));
            setTimeout(() => { child.kill(); resolve(stdout); }, timeout);
        });
        const login = await execShell(["-l", "-c", "echo __PATH__:$PATH"], 3000);
        const m1 = login.match(/__PATH__:(.+)/);
        if (m1) {
            merged.PATH = m1[1];
        }
        const interactive = await execShell(["-i", "-c", "echo __PATH__:$PATH"], 5000);
        const m2 = interactive.match(/__PATH__:(.+)/);
        if (m2) {
            merged.PATH = m2[1];
        }
        return merged;
    }
    showOutput() {
        this.output.show(true);
    }
    showCommandTerminal() {
        if (this.terminal) {
            this.terminal.show(true);
            return;
        }
        if (!this.isValidImdeProject) {
            return;
        }
        const cfg = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration("imde");
        const termName = cfg.get("terminalName") || "IMDE";
        const existing = vscode__WEBPACK_IMPORTED_MODULE_0__.window.terminals.find(t => t.name === termName);
        if (existing) {
            this.terminal = existing;
            existing.show(true);
        }
    }
    log(message) {
        this.output.appendLine(`[${new Date().toLocaleTimeString()}] ${message}`);
    }
    /** Cached result of system Python probe — probe only once per session. */
    static _systemPythonCache;
    /** Find the Python executable to use (bundled or system). */
    python() {
        if (!this.isValidImdeProject)
            return null;
        const proj = this._projectRoot;
        const platformDir = imdePlatformDir();
        const bundled = path__WEBPACK_IMPORTED_MODULE_2__.join(proj, "tools", "python", platformDir, platformDir === "windows" ? "python.exe" : "bin/python3");
        if (fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(bundled)) {
            return bundled;
        }
        // Probe for system Python once per session (spawnSync is blocking).
        if (ImdeRunner._systemPythonCache !== undefined) {
            return ImdeRunner._systemPythonCache;
        }
        const env = ImdeRunner.resolveLoginEnv();
        for (const name of platformDir === "windows" ? ["python", "python3"] : ["python3", "python"]) {
            const result = child_process__WEBPACK_IMPORTED_MODULE_1__.spawnSync(name, ["--version"], { env, timeout: 3000 });
            if (result.status === 0) {
                ImdeRunner._systemPythonCache = name;
                return name;
            }
        }
        ImdeRunner._systemPythonCache = null;
        return null;
    }
    imdePy() {
        return path__WEBPACK_IMPORTED_MODULE_2__.join(this._projectRoot || "", "tools", "imde", "imde.py");
    }
    imdeBin() {
        const proj = this._projectRoot;
        if (!proj)
            return null;
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
                return { exe: fs__WEBPACK_IMPORTED_MODULE_3__.existsSync("/bin/bash") ? "/bin/bash" : "bash", args: [bin, ...args] };
            }
        }
        catch { /* fall through */ }
        return { exe: bin, args };
    }
    getSharedTerminal(proj) {
        const cfg = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration("imde");
        const termName = cfg.get("terminalName") || "IMDE";
        const isUsable = (terminal) => !!terminal && terminal.exitStatus === undefined;
        if (isUsable(this.terminal)) {
            return { terminal: this.terminal, created: false };
        }
        this.terminalEnvReady = false;
        this.terminalEnvReadyPromise = undefined;
        const existing = vscode__WEBPACK_IMPORTED_MODULE_0__.window.terminals.find(t => t.name === termName && t.exitStatus === undefined);
        if (existing) {
            this.terminal = existing;
            this.terminalEnvReady = false;
            this.terminalEnvReadyPromise = undefined;
            return { terminal: existing, created: false };
        }
        this.terminal = vscode__WEBPACK_IMPORTED_MODULE_0__.window.createTerminal({
            name: termName,
            cwd: proj,
        });
        this.terminalEnvReady = false;
        this.terminalEnvReadyPromise = undefined;
        return { terminal: this.terminal, created: true };
    }
    /** Run IMDE in the shared terminal. Use this for interactive commands. */
    runTerminal(cmd, args = [], opts) {
        if (!this.isValidImdeProject) {
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage("IMDE: not an IMDE project (imde.json not found).");
            return;
        }
        const proj = this._projectRoot;
        const { terminal } = this.getSharedTerminal(proj);
        if (cmd) {
            void this.ensureTerminalEnv(proj).then(() => {
                terminal.sendText(this.formatVisibleImdeCommand(cmd, args));
            });
        }
        if (opts?.show) {
            terminal.show(true);
        }
    }
    /** Open the shared IMDE terminal and source the environment script.
     *  Call this to ensure the shell can run `imde` commands directly. */
    openEnvTerminal(show = true) {
        if (!this.isValidImdeProject) {
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage("IMDE: not an IMDE project (imde.json not found).");
            return;
        }
        const proj = this._projectRoot;
        const { terminal } = this.getSharedTerminal(proj);
        void this.ensureTerminalEnv(proj);
        if (show) {
            terminal.show(true);
        }
    }
    /** Source the environment on first use, then run doctor on later clicks. */
    openEnvOrRunDoctor(show = true) {
        if (!this.isValidImdeProject) {
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage("IMDE: not an IMDE project (imde.json not found).");
            return;
        }
        const proj = this._projectRoot;
        const { terminal } = this.getSharedTerminal(proj);
        if (this.terminalEnvReady) {
            terminal.sendText(this.formatVisibleImdeCommand("doctor", []));
        }
        else {
            void this.ensureTerminalEnv(proj);
        }
        if (show) {
            terminal.show(true);
        }
    }
    /** Source the full IMDE environment script once so the terminal can run short `imde ...` commands. */
    ensureTerminalEnv(proj) {
        if (this.terminalEnvReady) {
            return Promise.resolve();
        }
        if (this.terminalEnvReadyPromise) {
            return this.terminalEnvReadyPromise;
        }
        const { terminal } = this.getSharedTerminal(proj);
        const sourceCmd = this.sourceCommand(proj);
        if (!sourceCmd) {
            this.terminalEnvReady = true;
            return Promise.resolve();
        }
        const run = async () => {
            const shellIntegration = await this.waitForShellIntegration(terminal, 3000);
            if (shellIntegration) {
                await this.executeTerminalSetupCommand(terminal, shellIntegration, sourceCmd);
            }
            else {
                terminal.sendText(sourceCmd);
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            this.terminalEnvReady = true;
        };
        this.terminalEnvReadyPromise = run().finally(() => {
            this.terminalEnvReadyPromise = undefined;
        });
        return this.terminalEnvReadyPromise;
    }
    sourceCommand(proj, shellOverride) {
        const imdeDir = path__WEBPACK_IMPORTED_MODULE_2__.join(proj, "tools", "imde");
        const psEnv = path__WEBPACK_IMPORTED_MODULE_2__.join(imdeDir, "env.ps1");
        const shEnv = path__WEBPACK_IMPORTED_MODULE_2__.join(imdeDir, "env.sh");
        const shell = (shellOverride || vscode__WEBPACK_IMPORTED_MODULE_0__.env.shell || "").toLowerCase();
        if (shell.includes("powershell") || shell.includes("pwsh")) {
            return fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(psEnv) ? `. ${this.quoteTerminalArg(psEnv, shell)}` : null;
        }
        if (process.platform === "win32" && shell.includes("cmd")) {
            return null;
        }
        // bash / zsh — use env.sh which auto-detects
        if (!fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(shEnv)) {
            return null;
        }
        const sourceBuiltin = shell.includes("bash") || shell.includes("zsh") ? "source" : ".";
        return `${sourceBuiltin} ${this.quoteTerminalArg(shEnv, shell)}`;
    }
    run(cmd, args = [], opts) {
        this.runTerminal(cmd, args, opts);
    }
    async runCommand(cmd, args = [], opts = {}) {
        const run = async () => {
            this.invalidateJsonCache();
            const result = await this.execute(cmd, args, {
                json: false,
                streamOutput: opts.streamOutput ?? true,
                displayTarget: opts.displayTarget ?? "terminal",
                timeoutMs: opts.timeoutMs ?? this.commandTimeoutMs(),
                onProgress: opts.onProgress,
            });
            this.invalidateJsonCache();
            return result;
        };
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
        if (!this.isValidImdeProject)
            return null;
        const cacheKey = cmd + "|" + args.join(",");
        const cached = this.jsonCache.get(cacheKey);
        if (cached && Date.now() - cached.ts < ImdeRunner.CACHE_TTL) {
            return cached.data;
        }
        const result = await this.execute(cmd, args, {
            json: true,
            streamOutput: false,
            displayTarget: "output",
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
        if (!this.isValidImdeProject) {
            return Promise.resolve({ code: null, stdout: "", stderr: "Not an IMDE project", timedOut: false, commandLine: "" });
        }
        const proj = this._projectRoot;
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
            if (opts.displayTarget === "output") {
                this.output.appendLine(`> ${commandLine}`);
            }
        }
        if (opts.streamOutput && opts.displayTarget === "terminal") {
            return this.executeInSharedTerminal([spawnExe, ...spawnArgs], {
                cwd: proj,
                commandLine,
                timeoutMs: opts.timeoutMs,
                onProgress: opts.onProgress,
            });
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
                try {
                    proc.kill();
                }
                catch { /* best-effort */ }
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
    executeInSharedTerminal(commandTokens, opts) {
        const run = async () => {
            const { terminal } = this.getSharedTerminal(opts.cwd);
            terminal.show(true);
            const visibleCommand = this.formatManagedTerminalCommand(commandTokens);
            const shellIntegration = process.platform === "darwin"
                ? undefined
                : await this.waitForShellIntegration(terminal, 3000);
            if (shellIntegration) {
                try {
                    return await this.executeWithShellIntegration(terminal, shellIntegration, visibleCommand, opts);
                }
                catch (err) {
                    this.output.appendLine(`IMDE terminal shell integration failed, using script fallback: ${err?.message || err}`);
                }
            }
            return this.executeWithTerminalScript(commandTokens, opts);
        };
        const queued = this.terminalCommandQueue.catch(() => undefined).then(run);
        this.terminalCommandQueue = queued.then(() => undefined, () => undefined);
        return queued;
    }
    waitForShellIntegration(terminal, timeoutMs) {
        if (terminal.shellIntegration) {
            return Promise.resolve(terminal.shellIntegration);
        }
        return new Promise(resolve => {
            const timer = setTimeout(() => {
                subscription.dispose();
                resolve(undefined);
            }, timeoutMs);
            const subscription = vscode__WEBPACK_IMPORTED_MODULE_0__.window.onDidChangeTerminalShellIntegration(event => {
                if (event.terminal === terminal) {
                    clearTimeout(timer);
                    subscription.dispose();
                    resolve(event.shellIntegration);
                }
            });
        });
    }
    executeTerminalSetupCommand(terminal, shellIntegration, commandLine) {
        return new Promise(resolve => {
            let execution;
            let settled = false;
            const finish = () => {
                if (settled) {
                    return;
                }
                settled = true;
                clearTimeout(timer);
                subscription.dispose();
                resolve();
            };
            const subscription = vscode__WEBPACK_IMPORTED_MODULE_0__.window.onDidEndTerminalShellExecution(event => {
                if (event.terminal === terminal && event.execution === execution) {
                    finish();
                }
            });
            const timer = setTimeout(finish, 10000);
            execution = shellIntegration.executeCommand(commandLine);
        });
    }
    executeWithShellIntegration(terminal, shellIntegration, commandLine, opts) {
        return new Promise(resolve => {
            let execution;
            let stdout = "";
            let settled = false;
            let timedOut = false;
            let outputDone = Promise.resolve();
            const finish = (code) => {
                if (settled) {
                    return;
                }
                settled = true;
                if (timer) {
                    clearTimeout(timer);
                }
                endSubscription.dispose();
                void (async () => {
                    await Promise.race([
                        outputDone,
                        new Promise(resolveDrain => setTimeout(resolveDrain, 1000)),
                    ]);
                    resolve({
                        code,
                        stdout,
                        stderr: "",
                        timedOut,
                        commandLine: opts.commandLine,
                    });
                })();
            };
            const endSubscription = vscode__WEBPACK_IMPORTED_MODULE_0__.window.onDidEndTerminalShellExecution(event => {
                if (event.terminal === terminal && event.execution === execution) {
                    finish(event.exitCode ?? null);
                }
            });
            const timer = opts.timeoutMs > 0
                ? setTimeout(() => {
                    timedOut = true;
                    // Best effort: ask the foreground shell command to stop.
                    terminal.sendText("\x03", false);
                    finish(null);
                }, opts.timeoutMs)
                : undefined;
            execution = shellIntegration.executeCommand(commandLine);
            outputDone = (async () => {
                for await (const data of execution.read()) {
                    const clean = this.stripTerminalControl(data);
                    stdout += clean;
                    this.parseProgress(clean, opts.onProgress);
                }
            })().catch(err => {
                stdout += `\n[IMDE] Failed to read terminal output: ${err?.message || err}\n`;
            });
        });
    }
    executeWithTerminalScript(commandTokens, opts) {
        return new Promise(resolve => {
            const { terminal } = this.getSharedTerminal(opts.cwd);
            const tempDir = fs__WEBPACK_IMPORTED_MODULE_3__.mkdtempSync(path__WEBPACK_IMPORTED_MODULE_2__.join(os__WEBPACK_IMPORTED_MODULE_4__.tmpdir(), "imde-"));
            const logFile = path__WEBPACK_IMPORTED_MODULE_2__.join(tempDir, "command.log");
            const exitFile = path__WEBPACK_IMPORTED_MODULE_2__.join(tempDir, "exit.code");
            const visibleCommand = this.formatManagedTerminalCommand(commandTokens);
            const script = this.createTerminalScript(visibleCommand, opts.cwd, logFile, exitFile, opts.commandLine);
            let stdout = "";
            let offset = 0;
            let settled = false;
            const consumeLog = () => {
                if (!fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(logFile)) {
                    return;
                }
                const text = fs__WEBPACK_IMPORTED_MODULE_3__.readFileSync(logFile, "utf8");
                if (text.length <= offset) {
                    return;
                }
                const chunk = this.stripTerminalControl(text.slice(offset));
                offset = text.length;
                stdout += chunk;
                this.parseProgress(chunk, opts.onProgress);
            };
            const finish = (code, timedOut) => {
                if (settled) {
                    return;
                }
                settled = true;
                clearTimeout(startupTimer);
                if (timer) {
                    clearTimeout(timer);
                }
                clearInterval(poll);
                consumeLog();
                if (timedOut) {
                    terminal.sendText("\x03", false);
                }
                this.cleanupTempDir(tempDir);
                resolve({
                    code,
                    stdout,
                    stderr: "",
                    timedOut,
                    commandLine: opts.commandLine,
                });
            };
            const poll = setInterval(() => {
                consumeLog();
                if (!fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(exitFile)) {
                    return;
                }
                const raw = fs__WEBPACK_IMPORTED_MODULE_3__.readFileSync(exitFile, "utf8").trim();
                const parsed = Number.parseInt(raw, 10);
                finish(Number.isFinite(parsed) ? parsed : null, false);
            }, 250);
            const timer = opts.timeoutMs > 0
                ? setTimeout(() => finish(null, true), opts.timeoutMs)
                : undefined;
            const startupTimer = setTimeout(() => {
                if (!fs__WEBPACK_IMPORTED_MODULE_3__.existsSync(logFile))
                    finish(null, true);
            }, 15000);
            terminal.show(true);
            terminal.sendText(script.commandLine);
        });
    }
    createTerminalScript(visibleCommand, cwd, logFile, exitFile, commandLine) {
        const shell = (vscode__WEBPACK_IMPORTED_MODULE_0__.env.shell || "").toLowerCase();
        if (process.platform === "win32" && !this.isUnixLikeShell(shell)) {
            const scriptPath = path__WEBPACK_IMPORTED_MODULE_2__.join(path__WEBPACK_IMPORTED_MODULE_2__.dirname(logFile), "run-imde.ps1");
            const psShell = shell.includes("powershell") || shell.includes("pwsh") ? shell : "powershell";
            const content = [
                "$ErrorActionPreference = 'Continue'",
                `Write-Host ${this.quoteTerminalArg(`[IMDE] > ${commandLine}`, psShell)}`,
                `Set-Location -LiteralPath ${this.quoteTerminalArg(cwd, psShell)}`,
                `[System.IO.File]::WriteAllText(${this.quoteTerminalArg(logFile, psShell)}, '')`,
                "if (-not $env:PYTHONIOENCODING) { $env:PYTHONIOENCODING = 'utf-8' }",
                `${visibleCommand} 2>&1 | Tee-Object -FilePath ${this.quoteTerminalArg(logFile, psShell)}`,
                "$__imde_code = if ($null -ne $LASTEXITCODE) { [int]$LASTEXITCODE } elseif ($?) { 0 } else { 1 }",
                `Set-Content -LiteralPath ${this.quoteTerminalArg(exitFile, psShell)} -Value $__imde_code -Encoding ascii`,
                "",
            ].join("\n");
            fs__WEBPACK_IMPORTED_MODULE_3__.writeFileSync(scriptPath, content, "utf8");
            if (shell.includes("cmd")) {
                return { commandLine: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${scriptPath.replace(/"/g, '""')}"` };
            }
            return { commandLine: `& ${this.quoteTerminalArg(scriptPath, psShell)}` };
        }
        const scriptPath = path__WEBPACK_IMPORTED_MODULE_2__.join(path__WEBPACK_IMPORTED_MODULE_2__.dirname(logFile), "run-imde.sh");
        const shShell = shell || "sh";
        const content = [
            "#!/bin/sh",
            `printf '%s\\n' ${this.quoteTerminalArg(`[IMDE] > ${commandLine}`, shShell)}`,
            `cd ${this.quoteTerminalArg(cwd, shShell)} || { printf '%s\\n' 'IMDE: failed to enter project directory' | tee ${this.quoteTerminalArg(logFile, shShell)}; printf '%s' 1 > ${this.quoteTerminalArg(exitFile, shShell)}; exit 1; }`,
            `: > ${this.quoteTerminalArg(logFile, shShell)}`,
            "if [ -z \"${PYTHONIOENCODING+x}\" ]; then export PYTHONIOENCODING=utf-8; fi",
            `{ ${visibleCommand} 2>&1; printf '%s' "$?" > ${this.quoteTerminalArg(exitFile, shShell)}; } | tee ${this.quoteTerminalArg(logFile, shShell)}`,
            "",
        ].join("\n");
        fs__WEBPACK_IMPORTED_MODULE_3__.writeFileSync(scriptPath, content, { encoding: "utf8", mode: 0o700 });
        return { commandLine: `sh ${this.quoteTerminalArg(scriptPath, shShell)}` };
    }
    isUnixLikeShell(shell) {
        const normalized = shell.replace(/\\/g, "/").toLowerCase();
        const name = normalized.split("/").pop() || normalized;
        return ["bash", "bash.exe", "zsh", "zsh.exe", "sh", "sh.exe", "fish", "fish.exe"].includes(name);
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
    formatVisibleImdeCommand(cmd, args) {
        const shell = (vscode__WEBPACK_IMPORTED_MODULE_0__.env.shell || "").toLowerCase();
        const tokens = ["imde", cmd, ...args].filter(Boolean);
        return tokens.map((token) => this.quoteTerminalArg(token, shell, { bareSimple: true })).join(" ");
    }
    formatManagedTerminalCommand(tokens) {
        const shell = (vscode__WEBPACK_IMPORTED_MODULE_0__.env.shell || "").toLowerCase();
        const command = tokens
            .map((token) => this.quoteTerminalArg(token, shell, { bareSimple: true }))
            .join(" ");
        return shell.includes("powershell") || shell.includes("pwsh") ? `& ${command}` : command;
    }
    parseProgress(text, onProgress) {
        if (!onProgress)
            return;
        const m = text.match(/\[(\d+)\/(\d+)\]\s+(.+)/);
        if (m) {
            onProgress(parseInt(m[1], 10), parseInt(m[2], 10), m[3].trim());
        }
    }
    stripTerminalControl(text) {
        // eslint-disable-next-line no-control-regex
        return text
            .replace(/\x1b\][^\x07]*(?:\x07|\x1b\\)/g, "")
            .replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "")
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n");
    }
    cleanupTempDir(dir) {
        setTimeout(() => {
            try {
                fs__WEBPACK_IMPORTED_MODULE_3__.rmSync(dir, { recursive: true, force: true });
            }
            catch {
                // Best-effort cleanup; stale temp logs are harmless.
            }
        }, 1000);
    }
    quoteTerminalArg(token, shell, options) {
        if (!token) {
            return "''";
        }
        if (options?.bareSimple && /^[A-Za-z0-9_./:@%+=,-]+$/.test(token)) {
            return token;
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

/***/ "./src/intelliSense.ts"
/*!*****************************!*\
  !*** ./src/intelliSense.ts ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parseCompileCommands: () => (/* binding */ parseCompileCommands),
/* harmony export */   syncIntelliSense: () => (/* binding */ syncIntelliSense),
/* harmony export */   writeCppProperties: () => (/* binding */ writeCppProperties)
/* harmony export */ });
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);


/**
 * Parse compile_commands.json and extract IntelliSense configuration.
 * Returns null if the file doesn't exist or is empty.
 */
function parseCompileCommands(projectDir) {
    const buildDir = path__WEBPACK_IMPORTED_MODULE_0__.join(projectDir, "build");
    const ccPath = path__WEBPACK_IMPORTED_MODULE_0__.join(buildDir, "compile_commands.json");
    if (!fs__WEBPACK_IMPORTED_MODULE_1__.existsSync(ccPath)) {
        return null;
    }
    let raw;
    try {
        raw = fs__WEBPACK_IMPORTED_MODULE_1__.readFileSync(ccPath, "utf-8");
    }
    catch {
        return null;
    }
    let entries;
    try {
        entries = JSON.parse(raw);
    }
    catch {
        return null;
    }
    if (!Array.isArray(entries) || entries.length === 0) {
        return null;
    }
    // Collect unique args across all compilation units
    const includeDirs = new Set();
    const defines = new Set();
    const stdFlags = new Set();
    let compilerPath = "";
    const resolveArgPath = (arg, cwd) => {
        if (path__WEBPACK_IMPORTED_MODULE_0__.isAbsolute(arg))
            return arg;
        return path__WEBPACK_IMPORTED_MODULE_0__.resolve(cwd, arg);
    };
    for (const entry of entries) {
        const cwd = entry.directory || buildDir;
        // First entry's command/arguments give us the compiler path
        const compiler = entry.command
            ? entry.command.split(/\s+/)[0]
            : entry.arguments?.[0] || "";
        if (compiler && !compilerPath) {
            compilerPath = compiler.includes(path__WEBPACK_IMPORTED_MODULE_0__.sep)
                ? resolveArgPath(compiler, cwd)
                : compiler;
        }
        const tokens = extractTokens(entry, cwd);
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token === "-I" || token === "-isystem" || token === "/I") {
                const dir = tokens[i + 1];
                if (dir) {
                    includeDirs.add(resolveArgPath(dir, cwd));
                    i++;
                }
            }
            else if (token.startsWith("-I") && token.length > 2) {
                includeDirs.add(resolveArgPath(token.slice(2), cwd));
            }
            else if (token.startsWith("/I") && token.length > 2) {
                includeDirs.add(resolveArgPath(token.slice(2), cwd));
            }
            else if (token.startsWith("-isystem") && token.length > "-isystem".length) {
                includeDirs.add(resolveArgPath(token.slice("-isystem".length), cwd));
            }
            else if (token === "-D" || token === "/D") {
                const def = tokens[i + 1];
                if (def) {
                    defines.add(def);
                    i++;
                }
            }
            else if (token.startsWith("-D") && token.length > 2) {
                defines.add(token.slice(2));
            }
            else if (token.startsWith("/D") && token.length > 2) {
                defines.add(token.slice(2));
            }
            else if (token.startsWith("-std=")) {
                stdFlags.add(token.slice(5));
            }
        }
    }
    // Determine C standard
    const stdList = Array.from(stdFlags);
    const cStd = stdList.find(s => s.startsWith("c")) ||
        stdList.find(s => s.startsWith("gnu"));
    let cStandard = "c17";
    if (cStd) {
        const m = cStd.match(/^(?:gnu)?(\d+)/);
        if (m)
            cStandard = `c${m[1]}`;
    }
    const cppStd = stdList.find(s => s.startsWith("c++")) ||
        stdList.find(s => s.startsWith("gnu++"));
    // Determine IntelliSense mode
    const intelliSenseMode = compilerPath.includes("riscv")
        ? "linux-gcc-riscv32"
        : compilerPath.includes("arm")
            ? "linux-gcc-arm"
            : guessPlatformMode();
    return {
        includePath: Array.from(includeDirs).sort(),
        defines: Array.from(defines).sort(),
        compilerPath,
        cStandard,
        intelliSenseMode,
        fileCount: entries.length,
    };
}
function extractTokens(entry, cwd) {
    if (entry.arguments && entry.arguments.length > 0) {
        return entry.arguments.slice(1); // skip compiler path
    }
    if (entry.command) {
        return tokenizeCommand(entry.command).slice(1); // skip compiler path
    }
    return [];
}
/** Split a shell command line into tokens, handling quotes. */
function tokenizeCommand(cmd) {
    const tokens = [];
    let current = "";
    let inSingle = false;
    let inDouble = false;
    let escaped = false;
    for (const ch of cmd) {
        if (escaped) {
            current += ch;
            escaped = false;
            continue;
        }
        if (ch === "\\") {
            escaped = true;
            continue;
        }
        if (ch === "'" && !inDouble) {
            inSingle = !inSingle;
            continue;
        }
        if (ch === '"' && !inSingle) {
            inDouble = !inDouble;
            continue;
        }
        if ((ch === " " || ch === "\t") && !inSingle && !inDouble) {
            if (current) {
                tokens.push(current);
                current = "";
            }
            continue;
        }
        current += ch;
    }
    if (current)
        tokens.push(current);
    return tokens;
}
function guessPlatformMode() {
    switch (process.platform) {
        case "win32":
            return "windows-gcc-x86";
        case "darwin":
            return "macos-clang-x64";
        default:
            return "linux-gcc-x64";
    }
}
/**
 * Generate c_cpp_properties.json content from parsed compile commands.
 */
function generateCppProperties(summary) {
    return {
        configurations: [
            {
                name: "IMDE",
                includePath: summary.includePath.concat(["${workspaceFolder}/**"]),
                defines: summary.defines,
                compilerPath: summary.compilerPath,
                cStandard: summary.cStandard,
                cppStandard: "c++17",
                intelliSenseMode: summary.intelliSenseMode,
                compilerArgs: [],
            },
        ],
        version: 4,
    };
}
/**
 * Write .vscode/c_cpp_properties.json if it needs to be created or updated.
 * Returns a summary of what was written, or null if no changes needed.
 */
function writeCppProperties(projectDir, summary) {
    const vscodeDir = path__WEBPACK_IMPORTED_MODULE_0__.join(projectDir, ".vscode");
    const propsPath = path__WEBPACK_IMPORTED_MODULE_0__.join(vscodeDir, "c_cpp_properties.json");
    // Generate the new config
    const newProps = generateCppProperties(summary);
    // Check if existing config is from IMDE — if so, update it in place.
    // If not from IMDE, don't touch (user may have custom config).
    if (fs__WEBPACK_IMPORTED_MODULE_1__.existsSync(propsPath)) {
        try {
            const existing = JSON.parse(fs__WEBPACK_IMPORTED_MODULE_1__.readFileSync(propsPath, "utf-8"));
            const configs = existing.configurations || [];
            const imdeIdx = configs.findIndex((c) => c.name === "IMDE");
            if (imdeIdx >= 0) {
                const previous = JSON.stringify(existing);
                configs[imdeIdx] = newProps.configurations[0];
                existing.configurations = configs;
                const next = JSON.stringify(existing);
                if (previous !== next) {
                    fs__WEBPACK_IMPORTED_MODULE_1__.mkdirSync(vscodeDir, { recursive: true });
                    fs__WEBPACK_IMPORTED_MODULE_1__.writeFileSync(propsPath, JSON.stringify(existing, null, 2), "utf-8");
                }
                return {
                    created: false,
                    changed: previous !== next,
                    path: propsPath,
                    defines: summary.defines.length,
                    includes: summary.includePath.length,
                };
            }
            // IMDE config not found — don't overwrite user's custom config
            return null;
        }
        catch {
            return null;
        }
    }
    // Fresh creation
    fs__WEBPACK_IMPORTED_MODULE_1__.mkdirSync(vscodeDir, { recursive: true });
    fs__WEBPACK_IMPORTED_MODULE_1__.writeFileSync(propsPath, JSON.stringify(newProps, null, 2), "utf-8");
    return {
        created: true,
        changed: true,
        path: propsPath,
        defines: summary.defines.length,
        includes: summary.includePath.length,
    };
}
/**
 * High-level entry: parse compile_commands.json → write .vscode/c_cpp_properties.json.
 * Safe to call even if compile_commands.json doesn't exist yet.
 */
function syncIntelliSense(projectDir) {
    const summary = parseCompileCommands(projectDir);
    if (!summary) {
        return null;
    }
    const result = writeCppProperties(projectDir, summary);
    if (!result) {
        return null;
    }
    if (!result.changed) {
        return null;
    }
    const action = result.created ? "Created" : "Updated";
    return `${action} IntelliSense: ${summary.defines} defines, ${summary.includePath.length} include paths (${summary.fileCount} source files)`;
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
    static CACHE_VERSION = 5;
    static CACHE_KEY_VERSION = "v5";
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
    static clearHotCache() {
        KconfigSessionCache.hotCache.clear();
    }
    async invalidate(cacheKey) {
        if (cacheKey) {
            KconfigSessionCache.hotCache.delete(cacheKey);
            try {
                await fs__WEBPACK_IMPORTED_MODULE_1__.promises.unlink(this.getCacheFilePath(cacheKey));
            }
            catch {
                // Cache invalidation is best-effort.
            }
            return;
        }
        KconfigSessionCache.clearHotCache();
        try {
            await fs__WEBPACK_IMPORTED_MODULE_1__.promises.rm(this.cacheDir, { recursive: true, force: true });
        }
        catch {
            // Cache invalidation is best-effort.
        }
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
/* harmony import */ var _KconfigSessionCache__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./KconfigSessionCache */ "./src/menuconfig/KconfigSessionCache.ts");
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


class FileWatcher {
    static instance;
    fileWatchers = [];
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
        const configPattern = new vscode__WEBPACK_IMPORTED_MODULE_0__.RelativePattern(workspaceFolder, '**/{sdkconfig,defconfig,.config,*_defconfig}');
        const kconfigPattern = new vscode__WEBPACK_IMPORTED_MODULE_0__.RelativePattern(workspaceFolder, '**/{Kconfig,Kconfig.*}');
        this.registerWatcher(configPattern, (uri) => this.handleConfigFileChange(uri));
        this.registerWatcher(kconfigPattern, (uri) => this.handleKconfigFileChange(uri));
    }
    registerWatcher(pattern, onChange) {
        const watcher = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.createFileSystemWatcher(pattern);
        watcher.onDidCreate((uri) => {
            if (Date.now() < this.ignoreNextChangeTimestamp) {
                return;
            }
            onChange(uri);
        });
        watcher.onDidChange((uri) => {
            if (Date.now() < this.ignoreNextChangeTimestamp) {
                return;
            }
            onChange(uri);
        });
        watcher.onDidDelete((uri) => {
            if (Date.now() < this.ignoreNextChangeTimestamp) {
                return;
            }
            onChange(uri);
        });
        this.fileWatchers.push(watcher);
        this.context.subscriptions.push(watcher);
    }
    getFileName(uri) {
        return uri.fsPath.split(/[\\/]/).pop() || 'Unknown';
    }
    handleConfigFileChange(uri) {
        if (Date.now() < this.ignoreNextChangeTimestamp) {
            return;
        }
        const fileName = this.getFileName(uri);
        vscode__WEBPACK_IMPORTED_MODULE_0__.window.showInformationMessage(`Configuration file ${fileName} has been modified externally.`);
    }
    handleKconfigFileChange(uri) {
        if (Date.now() < this.ignoreNextChangeTimestamp) {
            return;
        }
        _KconfigSessionCache__WEBPACK_IMPORTED_MODULE_1__.KconfigSessionCache.clearHotCache();
        const workspaceFolder = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getWorkspaceFolder(uri);
        if (workspaceFolder) {
            const cache = new _KconfigSessionCache__WEBPACK_IMPORTED_MODULE_1__.KconfigSessionCache(workspaceFolder.uri.fsPath);
            void cache.invalidate();
        }
        const fileName = this.getFileName(uri);
        vscode__WEBPACK_IMPORTED_MODULE_0__.window.showInformationMessage(`Kconfig file ${fileName} has changed. Refresh GUI Config to reload the menu tree.`);
    }
    dispose() {
        this.fileWatchers.forEach((watcher) => watcher.dispose());
        this.fileWatchers = [];
        if (FileWatcher.instance === this) {
            FileWatcher.instance = undefined;
        }
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

/***/ "os"
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
(module) {

module.exports = require("os");

/***/ },

/***/ "path"
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
(module) {

module.exports = require("path");

/***/ },

/***/ "./package.json"
/*!**********************!*\
  !*** ./package.json ***!
  \**********************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"name":"imde","displayName":"IMDE","description":"Ingenic MCU Development Environment — VS Code integration","version":"0.3.6","publisher":"ingenic","license":"ISC","repository":{"type":"git","url":"https://github.com/ingenic/imde"},"sideEffects":["*.scss","*.css","*.vue"],"icon":"icon.png","engines":{"vscode":"^1.85.0"},"categories":["Other"],"activationEvents":["workspaceContains:imde.json","onCommand:imde.guiConfig","onCommand:imde.pinmux","onCommand:imde.build","onCommand:imde.doctor","onCommand:imde.fullCleanBuild","onCommand:imde.viewMap","onView:imde.doctorView","onView:imde.buildView","onView:imde.artifactsView"],"main":"./dist/extension.js","contributes":{"commands":[{"command":"imde.doctor","title":"IMDE: Run Doctor","icon":"$(heart)"},{"command":"imde.build","title":"IMDE: Build","icon":"$(wrench)"},{"command":"imde.fullCleanBuild","title":"IMDE: FullClean & Build","icon":""},{"command":"imde.configure","title":"IMDE: Configure"},{"command":"imde.menuconfig","title":"IMDE: Menuconfig"},{"command":"imde.guiConfig","title":"IMDE: GUI Config","icon":"$(settings)"},{"command":"imde.pinmux","title":"IMDE: Pinmux","icon":"$(circuit-board)"},{"command":"imde.clean","title":"IMDE: Clean"},{"command":"imde.fullclean","title":"IMDE: Full Clean"},{"command":"imde.selectDefconfig","title":"IMDE: Select Defconfig","icon":"$(list-selection)"},{"command":"imde.saveDefconfig","title":"IMDE: Save Defconfig"},{"command":"imde.setupToolchain","title":"IMDE: Setup Toolchain"},{"command":"imde.status","title":"IMDE: Show Status"},{"command":"imde.artifacts","title":"IMDE: Show Artifacts"},{"command":"imde.copyPath","title":"IMDE: Copy Path","icon":"$(copy)"},{"command":"imde.revealFile","title":"IMDE: Reveal File","icon":"$(folder-opened)"},{"command":"imde.refresh","title":"IMDE: Refresh View","icon":"$(refresh)"},{"command":"imde.viewMap","title":"IMDE: View Map","icon":"$(symbol-color)"},{"command":"imde.openFile","title":"IMDE: Open Source File"},{"command":"imde.setupIntelliSense","title":"IMDE: Setup IntelliSense"}],"viewsContainers":{"activitybar":[{"id":"imde-sidebar","title":"IMDE","icon":"logo/ingenic_blue.svg"}]},"views":{"imde-sidebar":[{"id":"imde.doctorView","name":"Environment"},{"id":"imde.buildView","name":"Build & Config"},{"id":"imde.artifactsView","name":"Artifacts"}]},"menus":{"view/title":[{"command":"imde.refresh","when":"view == imde.doctorView","group":"navigation"},{"command":"imde.refresh","when":"view == imde.artifactsView","group":"navigation"},{"command":"imde.build","when":"view == imde.buildView","group":"navigation"},{"command":"imde.selectDefconfig","when":"view == imde.buildView","group":"navigation"},{"command":"imde.pinmux","when":"view == imde.buildView","group":"navigation@3"}],"view/item/context":[{"command":"imde.copyPath","when":"view == imde.artifactsView && viewItem == imdeArtifact","group":"inline"},{"command":"imde.revealFile","when":"view == imde.artifactsView && viewItem == imdeArtifact","group":"inline"},{"command":"imde.viewMap","when":"view == imde.artifactsView && viewItem == imdeMapArtifact","group":"inline@1"}]},"configuration":{"title":"IMDE","properties":{"imde.projectDir":{"type":"string","default":"","scope":"resource","description":"Override the SDK project directory. When empty, IMDE searches upward from the first workspace folder for imde.json."},"imde.terminalName":{"type":"string","default":"IMDE","description":"Terminal name used for interactive IMDE commands."},"imde.captureTimeoutMs":{"type":"number","default":15000,"minimum":1000,"description":"Timeout in milliseconds for short JSON capture commands used by IMDE views."},"imde.commandTimeoutMs":{"type":"number","default":0,"minimum":0,"description":"Timeout in milliseconds for non-interactive IMDE commands. Use 0 to disable the timeout."},"imde.showOutputOnError":{"type":"boolean","default":true,"description":"Reveal the shared IMDE terminal when a managed command fails."},"imde.guiConfig.autoHeaderPath":{"scope":"resource","type":"string","default":"","description":"Path to write the generated C header file. Leave empty to skip header generation (SDK uses CMake-generated sdk_config.h)."}}}},"scripts":{"vscode:prepublish":"webpack --mode production","compile":"webpack --mode development","check":"webpack --mode development","watch":"webpack --mode development --watch","test":"npm run test:parser && npm run test:kconfig && npm run test:diag && npm run test:intellisense && npm run test:pinmux && npm run test:board-pinmux","test:parser":"npx ts-node --project test/tsconfig.json test/parser.test.ts","test:kconfig":"npx ts-node --project test/tsconfig.json test/kconfig.test.ts","test:diag":"npx ts-node --project test/tsconfig.json test/diagnostics.test.ts","test:intellisense":"npx ts-node --project test/tsconfig.json test/intelliSense.test.ts","test:pinmux":"npx ts-node --project test/tsconfig.json test/pinmuxDiscovery.test.ts","test:board-pinmux":"npx ts-node --project test/tsconfig.json test/boardPinmuxParser.test.ts && npx ts-node --project test/tsconfig.json test/boardPinmuxGenerator.test.ts && npx ts-node --project test/tsconfig.json test/pinmuxBoardFiles.test.ts && npx ts-node --project test/tsconfig.json test/pinmuxBoardWorkspace.test.ts","package":"vsce package","package:dry":"vsce ls","publish":"vsce publish"},"devDependencies":{"@types/node":"^18.19.0","@types/vscode":"^1.85.0","@vscode/vsce":"^2.22.0","@vue/compiler-sfc":"^3.3.4","assert":"^2.0.0","css-loader":"^6.8.1","os-browserify":"^0.3.0","path-browserify":"^1.0.1","sass":"^1.64.1","sass-loader":"^13.3.2","stream-browserify":"^3.0.0","ts-loader":"^9.3.1","typescript":"^5.3.0","vue-loader":"^17.2.2","vue-style-loader":"^4.1.3","webpack":"^5.74.0","webpack-cli":"^4.10.0"},"dependencies":{"@iconify-prerendered/vue-codicon":"^0.28.1753246500","@vscode/codicons":"^0.0.35","glob":"^11.0.3","pinia":"^2.1.6","vue":"^3.3.4"}}');

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
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
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
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".js";
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
/******/ 	/* webpack/runtime/require chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "loaded", otherwise not loaded yet
/******/ 		var installedChunks = {
/******/ 			"extension": 1
/******/ 		};
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		var installChunk = (chunk) => {
/******/ 			var moreModules = chunk.modules, chunkIds = chunk.ids, runtime = chunk.runtime;
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			for(var i = 0; i < chunkIds.length; i++)
/******/ 				installedChunks[chunkIds[i]] = 1;
/******/ 		
/******/ 		};
/******/ 		
/******/ 		// require() chunk loading for javascript
/******/ 		__webpack_require__.f.require = (chunkId, promises) => {
/******/ 			// "1" is the signal for "already loaded"
/******/ 			if(!installedChunks[chunkId]) {
/******/ 				if(true) { // all chunks have JS
/******/ 					var installedChunk = require("./" + __webpack_require__.u(chunkId));
/******/ 					if (!installedChunks[chunkId]) {
/******/ 						installChunk(installedChunk);
/******/ 					}
/******/ 				} else installedChunks[chunkId] = 1;
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		// no external install chunk
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
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
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _imdeRunner__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./imdeRunner */ "./src/imdeRunner.ts");
/* harmony import */ var _doctorTree__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./doctorTree */ "./src/doctorTree.ts");
/* harmony import */ var _artifactsTree__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./artifactsTree */ "./src/artifactsTree.ts");
/* harmony import */ var _buildTree__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./buildTree */ "./src/buildTree.ts");
/* harmony import */ var _menuconfig_fileWatcher__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./menuconfig/fileWatcher */ "./src/menuconfig/fileWatcher.ts");
/* harmony import */ var _logger_logger__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./logger/logger */ "./src/logger/logger.ts");
/* harmony import */ var _diagnostics__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./diagnostics */ "./src/diagnostics.ts");
/* harmony import */ var _defconfig__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./defconfig */ "./src/defconfig.ts");
/* harmony import */ var _intelliSense__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./intelliSense */ "./src/intelliSense.ts");












// eslint-disable-next-line @typescript-eslint/no-var-requires
const PACKAGE_JSON = __webpack_require__(/*! ../package.json */ "./package.json");
// Cache for parsed .map files: path -> { mtime, data }.  Bounded to prevent unbounded growth.
const mapCache = new Map();
const MAP_CACHE_MAX = 8;
async function getCachedMapData(filePath) {
    const stat = await fs__WEBPACK_IMPORTED_MODULE_2__.promises.stat(filePath);
    const cached = mapCache.get(filePath);
    if (cached && cached.mtime === stat.mtimeMs) {
        return cached.data;
    }
    const { parseMapFile } = await __webpack_require__.e(/*! import() */ "src_mapview_parser_ts").then(__webpack_require__.bind(__webpack_require__, /*! ./mapview/parser */ "./src/mapview/parser.ts"));
    const content = await vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.fs.readFile(vscode__WEBPACK_IMPORTED_MODULE_0__.Uri.file(filePath));
    const text = Buffer.from(content).toString("utf-8");
    const data = parseMapFile(text);
    if (mapCache.size >= MAP_CACHE_MAX) {
        const first = mapCache.keys().next().value;
        mapCache.delete(first);
    }
    mapCache.set(filePath, { mtime: stat.mtimeMs, data });
    return data;
}
function activate(context) {
    _logger_logger__WEBPACK_IMPORTED_MODULE_8__.Logger.info("IMDE extension is now active");
    const runner = new _imdeRunner__WEBPACK_IMPORTED_MODULE_3__.ImdeRunner();
    context.subscriptions.push(runner);
    if (!runner.isValidImdeProject) {
        _logger_logger__WEBPACK_IMPORTED_MODULE_8__.Logger.info("IMDE: imde.json not found within 10 levels — extension idle.");
        // Register only a minimal set of commands that show guidance
        context.subscriptions.push(vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.doctor", () => vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage("IMDE: not an IMDE project. Open a workspace that contains imde.json.")), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.build", () => vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage("IMDE: not an IMDE project. Open a workspace that contains imde.json.")), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.guiConfig", () => vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage("IMDE: not an IMDE project. Open a workspace that contains imde.json.")));
        return;
    }
    _imdeRunner__WEBPACK_IMPORTED_MODULE_3__.ImdeRunner.warmupEnv();
    // ---- Workspace folder change handling ----
    context.subscriptions.push(vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.onDidChangeWorkspaceFolders(() => {
        runner.resetProjectCheck();
    }));
    // ---- IntelliSense (auto-setup include paths / defines from CMake) ----
    const intelliSenseSync = () => {
        const proj = runner.getProjectDir();
        if (!proj)
            return null;
        const msg = (0,_intelliSense__WEBPACK_IMPORTED_MODULE_11__.syncIntelliSense)(proj);
        if (msg) {
            _logger_logger__WEBPACK_IMPORTED_MODULE_8__.Logger.info(msg);
        }
        return msg;
    };
    // Run once on activation if compile_commands.json already exists
    const intelliSenseTimer = setTimeout(intelliSenseSync, 3000);
    context.subscriptions.push({ dispose: () => clearTimeout(intelliSenseTimer) });
    // ---- Diagnostics (Problems panel integration) ----
    const diagnostics = new _diagnostics__WEBPACK_IMPORTED_MODULE_9__.ImdeDiagnostics(runner.getProjectDir());
    context.subscriptions.push(diagnostics);
    // ---- File watcher for config changes ----
    const fileWatcher = new _menuconfig_fileWatcher__WEBPACK_IMPORTED_MODULE_7__.FileWatcher(context);
    fileWatcher.initialize();
    // ---- Tree views ----
    const doctorTree = new _doctorTree__WEBPACK_IMPORTED_MODULE_4__.DoctorTreeProvider(runner);
    const buildTree = new _buildTree__WEBPACK_IMPORTED_MODULE_6__.BuildTreeProvider(runner);
    const artifactsTree = new _artifactsTree__WEBPACK_IMPORTED_MODULE_5__.ArtifactsTreeProvider(runner);
    context.subscriptions.push(vscode__WEBPACK_IMPORTED_MODULE_0__.window.registerTreeDataProvider("imde.doctorView", doctorTree), vscode__WEBPACK_IMPORTED_MODULE_0__.window.registerTreeDataProvider("imde.buildView", buildTree), vscode__WEBPACK_IMPORTED_MODULE_0__.window.registerTreeDataProvider("imde.artifactsView", artifactsTree));
    let refreshMapStatus;
    const refreshAll = () => {
        runner.invalidateJsonCache();
        doctorTree.refresh(true);
        buildTree.refresh();
        artifactsTree.refresh();
        refreshMapStatus?.();
    };
    const refreshProjectState = (options) => {
        runner.invalidateJsonCache();
        if (options?.doctor) {
            doctorTree.refresh(true);
        }
        buildTree.refresh();
        artifactsTree.refresh();
        if (options?.intelliSense) {
            intelliSenseSync();
        }
        if (options?.map) {
            refreshMapStatus?.();
        }
    };
    const runAction = async (command, args, title, after) => {
        diagnostics.clear();
        const result = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.withProgress({ location: vscode__WEBPACK_IMPORTED_MODULE_0__.ProgressLocation.Window, title, cancellable: false }, () => runner.runCommand(command, args, { streamOutput: true }));
        if (result.code !== 0 || result.timedOut) {
            const count = diagnostics.report(result.stderr + "\n" + result.stdout);
            if (count > 0) {
                const action = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showErrorMessage(`IMDE ${command} failed with ${count} issue${count > 1 ? "s" : ""}.`, "Show Problems", "Show Terminal");
                if (action === "Show Problems") {
                    vscode__WEBPACK_IMPORTED_MODULE_0__.commands.executeCommand("workbench.actions.view.problems");
                }
                else if (action === "Show Terminal") {
                    runner.showCommandTerminal();
                }
                return; // Don't call reportResult again
            }
        }
        await reportResult(runner, command, result);
        if (result.code === 0 && !result.timedOut) {
            after?.();
        }
    };
    const runManagedAction = async (command, args, title, options) => {
        diagnostics.clear();
        runner.invalidateJsonCache();
        const result = await runner.runCommand(command, args, {
            progressTitle: title,
            progressDetail: title,
            streamOutput: true,
            timeoutMs: options?.timeoutMs,
        });
        if (result.code !== 0 || result.timedOut) {
            const issueCount = diagnostics.report(result.stderr + "\n" + result.stdout);
            const reason = result.timedOut
                ? "timed out"
                : `failed with exit code ${result.code ?? "unknown"}`;
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.setStatusBarMessage(`$(error) IMDE ${command} ${reason}`, 5000);
            if (vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration("imde").get("showOutputOnError") ?? true) {
                runner.showCommandTerminal();
            }
            const action = issueCount > 0
                ? await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showErrorMessage(`IMDE ${command} ${reason} with ${issueCount} issue${issueCount > 1 ? "s" : ""}.`, "Show Problems", "Show Terminal")
                : await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showErrorMessage(`IMDE ${command} ${reason}.`, "Show Terminal");
            if (action === "Show Problems") {
                vscode__WEBPACK_IMPORTED_MODULE_0__.commands.executeCommand("workbench.actions.view.problems");
            }
            else if (action === "Show Terminal") {
                runner.showCommandTerminal();
            }
            refreshProjectState({
                doctor: options?.refreshDoctor,
                intelliSense: options?.syncIntelliSense,
                map: options?.refreshMap,
            });
            return false;
        }
        refreshProjectState({
            doctor: options?.refreshDoctor,
            intelliSense: options?.syncIntelliSense,
            map: options?.refreshMap,
        });
        if (options?.successMessage) {
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.setStatusBarMessage(`$(check) ${options.successMessage}`, 3000);
        }
        return true;
    };
    // ---- Commands ----
    context.subscriptions.push(vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.openEnv", () => {
        runner.openEnvOrRunDoctor(true);
        pollRefresh(() => doctorTree.refresh(true), 2000, 2);
    }), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.doctor", () => {
        runner.runTerminal("doctor", [], { show: true });
        pollRefresh(() => doctorTree.refresh(true), 2000, 2);
    }), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.build", () => runManagedAction("build", [], "IMDE Build", {
        successMessage: "Build completed",
        refreshMap: true,
        syncIntelliSense: true,
    })), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.configure", () => runManagedAction("configure", [], "IMDE Configure", {
        successMessage: "Configure completed",
        syncIntelliSense: true,
        refreshMap: true,
    })), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.menuconfig", async () => {
        const projDir = runner.getProjectDir();
        const cmakeCache = path__WEBPACK_IMPORTED_MODULE_1__.join(projDir, "build", "CMakeCache.txt");
        if (!fs__WEBPACK_IMPORTED_MODULE_2__.existsSync(cmakeCache)) {
            const configured = await runManagedAction("configure", [], "IMDE Configure", {
                successMessage: "Configure completed",
                syncIntelliSense: true,
                refreshMap: true,
            });
            if (!configured) {
                return;
            }
        }
        runner.runTerminal("menuconfig", ["--configure-if-needed"], { show: true });
        pollRefresh(() => { buildTree.refresh(); artifactsTree.refresh(); }, 3000, 3);
    }), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.fullCleanBuild", async () => {
        const cleaned = await runManagedAction("fullclean", ["--yes"], "IMDE Full Clean", {
            successMessage: "Full clean completed",
            refreshMap: true,
        });
        if (!cleaned) {
            return;
        }
        await runManagedAction("build", [], "IMDE Build", {
            successMessage: "Rebuild completed",
            syncIntelliSense: true,
            refreshMap: true,
        });
    }), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.clean", () => runManagedAction("clean", [], "IMDE Clean", {
        successMessage: "Clean completed",
        refreshMap: true,
    })), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.fullclean", async () => {
        const ans = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage("Delete the entire IMDE build directory? This cannot be undone.", { modal: true }, "Delete");
        if (ans === "Delete") {
            await runManagedAction("fullclean", ["--yes"], "IMDE Full Clean", {
                successMessage: "Full clean completed",
                refreshMap: true,
            });
        }
    }), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.status", async () => runAction("status", [], "Reading IMDE status", buildTree.refresh.bind(buildTree))), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.artifacts", async () => runAction("artifacts", [], "Reading IMDE artifacts", artifactsTree.refresh.bind(artifactsTree))), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.setupToolchain", async () => runAction("setup-toolchain", [], "Setting up IMDE toolchain", refreshAll)), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.selectDefconfig", () => (0,_defconfig__WEBPACK_IMPORTED_MODULE_10__.selectDefconfig)(runner, context, () => {
        refreshProjectState({ intelliSense: true, map: true });
    })), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.saveDefconfig", async () => {
        await (0,_defconfig__WEBPACK_IMPORTED_MODULE_10__.saveDefconfig)(runner);
        refreshProjectState({ map: true });
    }), vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.copyPath", async (itemOrPath) => {
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
        if (fs__WEBPACK_IMPORTED_MODULE_2__.existsSync(fullPath)) {
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
    // ---- Pinmux ----
    vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.pinmux", async () => {
        const projectDir = runner.getProjectDir();
        try {
            const [{ discoverPinmuxTargets }, { loadPinmuxFile }, { loadBoardPinmuxFile }, { generateBoardPinmuxSource, generateBoardPinsHeader }, { createPinmuxBoard, deletePinmuxBoard, validateBoardId }, { PinmuxPanel }] = await Promise.all([
                __webpack_require__.e(/*! import() */ "src_pinmux_discovery_ts").then(__webpack_require__.bind(__webpack_require__, /*! ./pinmux/discovery */ "./src/pinmux/discovery.ts")),
                __webpack_require__.e(/*! import() */ "src_pinmux_parser_ts").then(__webpack_require__.bind(__webpack_require__, /*! ./pinmux/parser */ "./src/pinmux/parser.ts")),
                __webpack_require__.e(/*! import() */ "src_pinmux_boardParser_ts").then(__webpack_require__.bind(__webpack_require__, /*! ./pinmux/boardParser */ "./src/pinmux/boardParser.ts")),
                __webpack_require__.e(/*! import() */ "src_pinmux_boardGenerator_ts").then(__webpack_require__.bind(__webpack_require__, /*! ./pinmux/boardGenerator */ "./src/pinmux/boardGenerator.ts")),
                __webpack_require__.e(/*! import() */ "src_pinmux_boardWorkspace_ts").then(__webpack_require__.bind(__webpack_require__, /*! ./pinmux/boardWorkspace */ "./src/pinmux/boardWorkspace.ts")),
                Promise.all(/*! import() */[__webpack_require__.e("src_pinmux_boardWorkspace_ts"), __webpack_require__.e("src_pinmux_boardParser_ts"), __webpack_require__.e("src_pinmux_panel_ts")]).then(__webpack_require__.bind(__webpack_require__, /*! ./pinmux/panel */ "./src/pinmux/panel.ts")),
            ]);
            const chips = await discoverPinmuxTargets(projectDir);
            if (chips.length === 0) {
                vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage("IMDE: no BSP chips with board_pinmux.c were found.");
                return;
            }
            const chipItem = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showQuickPick(chips.map(chip => ({ label: chip.id, description: `${chip.boards.length} board${chip.boards.length === 1 ? "" : "s"}`, chip })), { placeHolder: "Select a chip" });
            if (!chipItem)
                return;
            const boardChoices = [
                ...chipItem.chip.boards.map(board => ({ label: board.id, description: path__WEBPACK_IMPORTED_MODULE_1__.relative(projectDir, board.pinmuxFile), board, action: "open" })),
                { label: "$(add) Create blank BSP...", description: "Start this chip with no selected pins", action: "create" },
                ...(chipItem.chip.boards.length > 0
                    ? [{ label: "$(trash) Delete BSP...", description: "Remove a board and its CMake/Kconfig registration", action: "delete" }]
                    : []),
            ];
            const boardItem = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showQuickPick(boardChoices, { placeHolder: `Select a ${chipItem.chip.id} board` });
            if (!boardItem)
                return;
            if (boardItem.action === "delete") {
                const deleteItem = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showQuickPick(chipItem.chip.boards.map(board => ({
                    label: board.id,
                    description: path__WEBPACK_IMPORTED_MODULE_1__.relative(projectDir, board.directory),
                    board,
                })), { placeHolder: `Select a ${chipItem.chip.id} BSP to delete` });
                if (!deleteItem)
                    return;
                if (PinmuxPanel.isShowingBoard(chipItem.chip.id, deleteItem.board.id)) {
                    vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage(`Close the ${chipItem.chip.id}/${deleteItem.board.id} Pinmux panel before deleting its BSP.`);
                    return;
                }
                const boardDirectory = path__WEBPACK_IMPORTED_MODULE_1__.resolve(deleteItem.board.directory);
                const dirtyDocument = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.textDocuments.find(document => {
                    if (!document.isDirty || document.uri.scheme !== "file")
                        return false;
                    const relative = path__WEBPACK_IMPORTED_MODULE_1__.relative(boardDirectory, path__WEBPACK_IMPORTED_MODULE_1__.resolve(document.uri.fsPath));
                    return relative === "" || (!relative.startsWith("..") && !path__WEBPACK_IMPORTED_MODULE_1__.isAbsolute(relative));
                });
                if (dirtyDocument) {
                    vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage(`Save or close ${path__WEBPACK_IMPORTED_MODULE_1__.basename(dirtyDocument.uri.fsPath)} before deleting ${deleteItem.board.id}.`);
                    return;
                }
                const confirmed = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage(`Delete BSP ${chipItem.chip.id}/${deleteItem.board.id}?`, {
                    modal: true,
                    detail: `IMDE will permanently remove ${path__WEBPACK_IMPORTED_MODULE_1__.relative(projectDir, boardDirectory)} and update the chip CMakeLists.txt and Kconfig registrations.`,
                }, "Delete BSP");
                if (confirmed !== "Delete BSP")
                    return;
                const deleted = await deletePinmuxBoard({
                    boardId: deleteItem.board.id,
                    chipId: chipItem.chip.id,
                    chipDirectory: chipItem.chip.directory,
                });
                vscode__WEBPACK_IMPORTED_MODULE_0__.window.showInformationMessage(`IMDE: deleted ${chipItem.chip.id}/${deleted.boardId} and updated board integration.`);
                refreshProjectState({ map: true });
                return;
            }
            if (chipItem.chip.pinlistFiles.length === 0) {
                throw new Error(`No .impx pinlist found for ${chipItem.chip.id}.`);
            }
            let pinlistFile = chipItem.chip.pinlistFiles[0];
            if (chipItem.chip.pinlistFiles.length > 1) {
                const pinlistItem = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showQuickPick(chipItem.chip.pinlistFiles.map(filePath => ({ label: path__WEBPACK_IMPORTED_MODULE_1__.basename(filePath), description: path__WEBPACK_IMPORTED_MODULE_1__.relative(projectDir, filePath), filePath })), { placeHolder: `Select a ${chipItem.chip.id} package` });
                if (!pinlistItem)
                    return;
                pinlistFile = pinlistItem.filePath;
            }
            const { definition, filePath } = await loadPinmuxFile(pinlistFile);
            if (boardItem.action === "create") {
                const boardId = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showInputBox({
                    prompt: `Create a blank ${chipItem.chip.id} BSP`,
                    placeHolder: "pd_lock",
                    validateInput: value => validateBoardId(value.trim()),
                });
                if (!boardId)
                    return;
                const normalizedBoardId = boardId.trim();
                const pinmuxSource = generateBoardPinmuxSource(definition, chipItem.chip.id, normalizedBoardId, [], {
                    mode: "persisted",
                    allowEmpty: true,
                });
                const boardPinsSource = generateBoardPinsHeader(chipItem.chip.id, normalizedBoardId, []);
                const confirmed = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage(`Create blank BSP ${chipItem.chip.id}/${normalizedBoardId}?`, {
                    modal: true,
                    detail: "IMDE will create an empty board_pinmux.c and board_pins.h, plus the board CMake/Kconfig files. Existing boards are not copied.",
                }, "Create Board");
                if (confirmed !== "Create Board")
                    return;
                const created = await createPinmuxBoard({
                    boardId: normalizedBoardId,
                    chipId: chipItem.chip.id,
                    chipDirectory: chipItem.chip.directory,
                    pinmuxSource,
                    boardPinsSource,
                });
                const boardPinmux = await loadBoardPinmuxFile(created.pinmuxFile, definition);
                PinmuxPanel.createOrShow(context, definition, filePath, chipItem.chip.id, created.boardId, boardPinmux);
                return;
            }
            const boardPinmux = await loadBoardPinmuxFile(boardItem.board.pinmuxFile, definition);
            PinmuxPanel.createOrShow(context, definition, filePath, chipItem.chip.id, boardItem.board.id, boardPinmux);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.showErrorMessage(`IMDE: Pinmux operation failed. ${message}`);
        }
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
            const { MapViewPanel } = await __webpack_require__.e(/*! import() */ "src_mapview_panel_ts").then(__webpack_require__.bind(__webpack_require__, /*! ./mapview/panel */ "./src/mapview/panel.ts"));
            MapViewPanel.createOrShow(context.extensionUri, filePath, mapData, runner.getProjectDir());
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
        const projDir = workspaceFolder.uri.fsPath;
        const configPath = path__WEBPACK_IMPORTED_MODULE_1__.join(projDir, ".config");
        if (!fs__WEBPACK_IMPORTED_MODULE_2__.existsSync(configPath)) {
            const action = await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage("No .config found. Select a defconfig to generate one.", "Select Defconfig");
            if (action === "Select Defconfig") {
                await (0,_defconfig__WEBPACK_IMPORTED_MODULE_10__.selectDefconfig)(runner, context);
            }
            return;
        }
        // .config exists but build directory may have been cleaned — auto-configure
        const cmakeCache = path__WEBPACK_IMPORTED_MODULE_1__.join(projDir, "build", "CMakeCache.txt");
        if (!fs__WEBPACK_IMPORTED_MODULE_2__.existsSync(cmakeCache)) {
            const configured = await runManagedAction("configure", [], "IMDE Configure", {
                successMessage: "Configure completed",
                syncIntelliSense: true,
                refreshMap: true,
            });
            if (!configured) {
                return;
            }
        }
        try {
            const { MenuconfigPanel } = await Promise.all(/*! import() */[__webpack_require__.e("vendors-node_modules_glob_dist_esm_index_js"), __webpack_require__.e("src_menuconfig_MenuconfigPanel_ts")]).then(__webpack_require__.bind(__webpack_require__, /*! ./menuconfig/MenuconfigPanel */ "./src/menuconfig/MenuconfigPanel.ts"));
            MenuconfigPanel.createOrShow(context.extensionUri, workspaceFolder.uri, context);
        }
        catch (error) {
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.showErrorMessage(`Failed to open IMDE GUI Config: ${error.message}`);
        }
    }), 
    // ---- IntelliSense ----
    vscode__WEBPACK_IMPORTED_MODULE_0__.commands.registerCommand("imde.setupIntelliSense", () => {
        runner.invalidateJsonCache();
        const msg = intelliSenseSync();
        if (msg) {
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.showInformationMessage(msg);
        }
        else {
            vscode__WEBPACK_IMPORTED_MODULE_0__.window.showWarningMessage("IMDE: compile_commands.json not found. Run `imde configure` first.");
        }
    }));
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
    const artifactsDirectory = path__WEBPACK_IMPORTED_MODULE_1__.join(runner.getProjectDir(), "build", "artifacts");
    async function updateMapBarVisibility() {
        try {
            const entries = await fs__WEBPACK_IMPORTED_MODULE_2__.promises.readdir(artifactsDirectory, { withFileTypes: true });
            const hasMap = entries.some(entry => entry.isFile() && entry.name.toLowerCase().endsWith(".map"));
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
    refreshMapStatus = () => { void updateMapBarVisibility(); };
    const mapWatcher = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.createFileSystemWatcher(new vscode__WEBPACK_IMPORTED_MODULE_0__.RelativePattern(vscode__WEBPACK_IMPORTED_MODULE_0__.Uri.file(runner.getProjectDir()), "build/artifacts/**/*.map"));
    const refreshMapBar = () => { void updateMapBarVisibility(); };
    mapWatcher.onDidCreate(refreshMapBar);
    mapWatcher.onDidChange(refreshMapBar);
    mapWatcher.onDidDelete(refreshMapBar);
    context.subscriptions.push(mapWatcher);
    const initialMapTimer = setTimeout(updateMapBarVisibility, 2000);
    context.subscriptions.push({ dispose: () => clearTimeout(initialMapTimer) });
    context.subscriptions.push(mkBar(`$(terminal-bash) IMDE ${PACKAGE_JSON.version || ""}`.trim(), "imde.openEnv", "Open IMDE terminal and source environment", 100), mkBar("$(debug-rerun) Rebuild", "imde.fullCleanBuild", "FullClean & Build", 99), mkBar("$(play) Build", "imde.build", "Build", 98), mkBar("$(list-selection) Select", "imde.selectDefconfig", "Select Defconfig", 97), mkBar("$(circuit-board) Pinmux", "imde.pinmux", "Open Pinmux", 96.5), mkBar("$(settings) Config", "imde.guiConfig", "GUI Config", 96), mapBar);
}
async function reportResult(runner, command, result) {
    if (result.code === 0 && !result.timedOut) {
        return;
    }
    const reason = result.timedOut ? "timed out" : `failed with exit code ${result.code ?? "unknown"}`;
    const action = vscode__WEBPACK_IMPORTED_MODULE_0__.workspace.getConfiguration("imde").get("showOutputOnError") ?? true
        ? await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showErrorMessage(`IMDE ${command} ${reason}.`, "Show Terminal")
        : await vscode__WEBPACK_IMPORTED_MODULE_0__.window.showErrorMessage(`IMDE ${command} ${reason}.`);
    if (action === "Show Terminal") {
        runner.showCommandTerminal();
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