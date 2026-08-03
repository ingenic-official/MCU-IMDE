import * as vscode from "vscode";
import * as path from "path";

interface ParsedError {
  file: string;
  line: number;
  col: number;
  severity: vscode.DiagnosticSeverity;
  message: string;
  raw: string;
}

/**
 * Parses GCC/Ninja/CMake build output into structured diagnostics.
 */
export class BuildErrorParser {
  // GCC/Clang: file:line:col: error/warning/fatal error: message
  private static readonly GCC_ERROR = /^(.+?):(\d+):(\d+):\s+(fatal |)(error|warning):\s+(.+)$/;
  // CMake: CMake Error/Warning at file:line
  private static readonly CMAKE_ERROR = /^\s*CMake (Error|Warning) at (.+?):(\d+)/;
  // Ninja: FAILED: target
  private static readonly NINJA_ERROR = /^FAILED:\s+(.+)$/;
  // Python traceback: File "path", line N, in ...
  private static readonly PYTHON_ERROR = /^\s*File\s+"(.+?)",\s+line\s+(\d+)/;
  // Python Exception/Error (last line of traceback)
  private static readonly PYTHON_EXC = /^(\w+(?:Error|Exception|Warning)):\s*(.+)$/;
  // Generic: [ERROR] or ERROR: at start
  private static readonly GENERIC_ERROR = /^\s*(?:\[ERROR\]|ERROR:)\s+(.+)$/;
  // Compiler driver: cc1.exe / cc1: fatal error: message
  private static readonly CC1_ERROR = /^(cc1(?:\.exe)?):\s+(fatal error|error):\s+(.+)$/i;
  // Tool: fatal error: file: message
  private static readonly TOOL_FATAL = /^(.+?):\s+fatal error:\s*(.+)$/i;
  // Shell: command not found, permission denied, etc.
  private static readonly SHELL_ERROR = /^(.+?):\s+(command not found|No such file|Permission denied|EACCES|ENOENT)/i;
  // Make-style: *** [target] Error N
  private static readonly MAKE_ERROR = /^\*\*\*\s+\[(.+?)\]\s+Error\s+\d+/;
  // Generic colon error: file:line: error
  private static readonly COLON_ERROR = /^(.+?):(\d+):\s+(error|fatal):\s*(.+)$/i;
  // Ninja build stop
  private static readonly NINJA_STOP = /^ninja:\s+build\s+stopped/;

  private static readonly LINE_LIMIT = 500;

  private static stripAnsi(text: string): string {
    // eslint-disable-next-line no-control-regex
    return text.replace(/\x1b\[[0-9;]*m/g, "");
  }

  // Strip unicode symbols (✗ ⚠ ✘ ✔ ● etc.) that IMDE prefixes error lines with
  private static readonly SYMBOL_PREFIX = /^[\s\u{2700}-\u{27BF}\u{2600}-\u{26FF}\u{2000}-\u{206F}\u{0080}-\u{00FF}●◆★▪▸-]+/u;

  static parse(output: string, workspaceRoot: string): ParsedError[] {
    const clean = BuildErrorParser.stripAnsi(output);
    const lines = clean.split("\n").slice(0, BuildErrorParser.LINE_LIMIT);
    const errors: ParsedError[] = [];

    for (const line of lines) {
      let trimmed = line.trim();
      if (!trimmed) continue;

      // Strip leading symbols that IMDE prefixes (✗ error, ⚠ warning, etc.)
      trimmed = trimmed.replace(BuildErrorParser.SYMBOL_PREFIX, "").trim();
      if (!trimmed) continue;

      // GCC/Clang: file:line:col: error/warning/fatal error: msg
      let m = BuildErrorParser.GCC_ERROR.exec(trimmed);
      if (m) {
        errors.push({
          file: BuildErrorParser.resolvePath(m[1], workspaceRoot),
          line: parseInt(m[2], 10) - 1,
          col: parseInt(m[3], 10) - 1,
          severity: m[5] === "error" || m[4].includes("fatal")
            ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning,
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
          severity: vscode.DiagnosticSeverity.Error,
          message: msg, raw: trimmed,
        });
        continue;
      }

      // tool: fatal error: message  (e.g. riscv-gcc.exe: fatal error: ...)
      m = BuildErrorParser.TOOL_FATAL.exec(trimmed);
      if (m && m[1] !== "ninja") {
        errors.push({
          file: "", line: 0, col: 0,
          severity: vscode.DiagnosticSeverity.Error,
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
          severity: vscode.DiagnosticSeverity.Error,
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
          severity: m[1] === "Error" ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning,
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
          severity: vscode.DiagnosticSeverity.Error,
          message: m[4].trim(), raw: trimmed,
        });
        continue;
      }

      // Make: *** [target] Error N
      if (BuildErrorParser.MAKE_ERROR.test(trimmed)) {
        errors.push({
          file: "", line: 0, col: 0,
          severity: vscode.DiagnosticSeverity.Error,
          message: trimmed, raw: trimmed,
        });
        continue;
      }

      // Ninja: build stopped
      if (BuildErrorParser.NINJA_STOP.test(trimmed)) {
        errors.push({
          file: "", line: 0, col: 0,
          severity: vscode.DiagnosticSeverity.Error,
          message: trimmed, raw: trimmed,
        });
        continue;
      }

      // Ninja: FAILED: target
      if (BuildErrorParser.NINJA_ERROR.test(trimmed)) {
        errors.push({
          file: "", line: 0, col: 0,
          severity: vscode.DiagnosticSeverity.Error,
          message: trimmed, raw: trimmed,
        });
        continue;
      }

      // Python exception (last traceback line)
      m = BuildErrorParser.PYTHON_EXC.exec(trimmed);
      if (m && !trimmed.includes("build succeeded") && !trimmed.includes("removed")) {
        errors.push({
          file: "", line: 0, col: 0,
          severity: m[1].includes("Warning") ? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Error,
          message: `${m[1]}: ${m[2]}`, raw: trimmed,
        });
        continue;
      }

      // Shell/system errors
      m = BuildErrorParser.SHELL_ERROR.exec(trimmed);
      if (m) {
        errors.push({
          file: "", line: 0, col: 0,
          severity: vscode.DiagnosticSeverity.Error,
          message: trimmed, raw: trimmed,
        });
        continue;
      }

      // Generic ERROR tag
      m = BuildErrorParser.GENERIC_ERROR.exec(trimmed);
      if (m) {
        errors.push({
          file: "", line: 0, col: 0,
          severity: vscode.DiagnosticSeverity.Error,
          message: m[1], raw: trimmed,
        });
      }
    }

    return errors;
  }

  private static resolvePath(filePath: string, root: string): string {
    if (filePath.startsWith("/") || /^[A-Za-z]:[\\/]/.test(filePath)) {
      return filePath;
    }
    return path.resolve(root, filePath);
  }
}

/**
 * Manages a DiagnosticCollection for IMDE build errors,
 * feeding the VS Code Problems panel.
 */
export class ImdeDiagnostics implements vscode.Disposable {
  private collection: vscode.DiagnosticCollection;
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.collection = vscode.languages.createDiagnosticCollection("imde-build");
  }

  dispose(): void {
    this.collection.dispose();
  }

  /** Clear all previous diagnostics. */
  clear(): void {
    this.collection.clear();
  }

  /** Parse output and populate Problems panel. Returns error count. */
  report(output: string): number {
    const errors = BuildErrorParser.parse(output, this.workspaceRoot);
    const byFile = new Map<string, vscode.Diagnostic[]>();

    for (const e of errors) {
      const diag = new vscode.Diagnostic(
        new vscode.Range(e.line, e.col, e.line, e.col + 1),
        e.message,
        e.severity,
      );
      diag.source = "IMDE Build";
      const list = byFile.get(e.file) || [];
      list.push(diag);
      byFile.set(e.file, list);
    }

    this.collection.clear();
    for (const [file, diags] of byFile) {
      this.collection.set(vscode.Uri.file(file), diags);
    }

    return errors.length;
  }
}
