import * as vscode from "vscode";
import * as cp from "child_process";
import * as path from "path";
import * as fs from "fs";

export interface ImdeCommandResult {
  code: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  commandLine: string;
}

export interface ImdeRunOptions {
  progressTitle?: string;
  progressDetail?: string;
  timeoutMs?: number;
  streamOutput?: boolean;
  onProgress?: (current: number, total: number, detail: string) => void;
}

export class ImdeRunner implements vscode.Disposable {
  private terminal: vscode.Terminal | undefined;
  private output = vscode.window.createOutputChannel("IMDE");
  private static loginEnvCache: Record<string, string> | null = null;

  dispose(): void {
    this.output.dispose();
  }

  public static warmupEnv(): void { ImdeRunner.resolveLoginEnv(true); }

  private static resolveLoginEnv(force = false): Record<string, string> {
    if (ImdeRunner.loginEnvCache && !force) {
      return ImdeRunner.loginEnvCache;
    }
    if (process.platform === "win32") {
      ImdeRunner.loginEnvCache = { ...process.env } as Record<string, string>;
      return ImdeRunner.loginEnvCache;
    }
    return ImdeRunner.captureShellEnv();
  }

  private static captureShellEnv(): Record<string, string> {
    const merged = { ...process.env } as Record<string, string>;
    if (process.platform === "win32") {
      return merged;
    }
    const shell = process.env.SHELL || "/bin/bash";

    const login = cp.spawnSync(shell, ["-l", "-c", "echo __PATH__:$PATH"], {
      encoding: "utf8", timeout: 3000,
    });
    if (login.status === 0 && login.stdout) {
      const m = login.stdout.match(/__PATH__:(.+)/);
      if (m) { merged.PATH = m[1]; }
    }

    const interactive = cp.spawnSync(shell, ["-i", "-c", "echo __PATH__:$PATH"], {
      encoding: "utf8", timeout: 5000, stdio: ["ignore", "pipe", "pipe"],
    });
    if (interactive.status === 0 && interactive.stdout) {
      const m = interactive.stdout.match(/__PATH__:(.+)/);
      if (m) { merged.PATH = m[1]; }
    }

    ImdeRunner.loginEnvCache = merged;
    return merged;
  }

  getProjectDir(): string {
    const cfg = vscode.workspace.getConfiguration("imde");
    const configured = cfg.get<string>("projectDir")?.trim();
    if (configured) {
      return path.resolve(configured);
    }

    const ws = vscode.workspace.workspaceFolders;
    if (!ws?.length) {
      return process.cwd();
    }

    let dir = ws[0].uri.fsPath;
    while (dir !== path.dirname(dir)) {
      if (fs.existsSync(path.join(dir, "imde.json"))) {
        return dir;
      }
      dir = path.dirname(dir);
    }
    return ws[0].uri.fsPath;
  }

  showOutput(): void {
    this.output.show(true);
  }

  log(message: string): void {
    this.output.appendLine(`[${new Date().toLocaleTimeString()}] ${message}`);
  }

  /** Find the Python executable to use (bundled or system). */
  private python(): string | null {
    const proj = this.getProjectDir();
    const platformDir = process.platform === "win32" ? "windows" :
      process.platform === "linux" ? "linux" : "macos";
    const bundled = path.join(proj, "tools", "python", platformDir,
      platformDir === "windows" ? "python.exe" : "bin/python3");
    if (fs.existsSync(bundled)) {
      return bundled;
    }

    // Use login env for PATH — critical for WSL / custom Python installs
    const env = ImdeRunner.resolveLoginEnv();
    for (const name of platformDir === "windows" ? ["python", "python3"] : ["python3", "python"]) {
      const result = cp.spawnSync(name, ["--version"], { env });
      if (result.status === 0) return name;
    }
    return null;
  }

  private imdePy(): string {
    return path.join(this.getProjectDir(), "tools", "imde", "imde.py");
  }

  private imdeBin(): string | null {
    const proj = this.getProjectDir();
    const candidates = process.platform === "win32"
      ? ["tools/imde/bin/imde.cmd", "tools/imde/bin/imde.bat"]
      : ["tools/imde/bin/imde"];
    for (const rel of candidates) {
      const bin = path.join(proj, rel);
      if (fs.existsSync(bin)) {
        return bin;
      }
    }
    return null;
  }

  private spawnImdeBin(bin: string, args: string[]): { exe: string; args: string[] } {
    if (process.platform === "win32") {
      return { exe: bin, args };
    }
    try {
      if ((fs.statSync(bin).mode & 0o111) === 0) {
        return { exe: "/bin/sh", args: [bin, ...args] };
      }
    } catch { /* fall through */ }
    return { exe: bin, args };
  }

  /** Run IMDE in the shared terminal. Use this for interactive commands. */
  runTerminal(cmd: string, args: string[] = [], opts?: { show?: boolean }): void {
    const proj = this.getProjectDir();
    const imdeBin = this.imdeBin();

    const cfg = vscode.workspace.getConfiguration("imde");
    const termName = cfg.get<string>("terminalName") || "IMDE";

    const isNewTerminal = !this.terminal || this.terminal.exitStatus !== undefined;
    if (isNewTerminal) {
      const existing = vscode.window.terminals.find(t => t.name === termName);
      if (existing) {
        this.terminal = existing;
      } else {
        this.terminal = vscode.window.createTerminal({
          name: termName,
          cwd: proj,
        });
        // Source shell completion so tab-completion works immediately
        this.sourceCompletion(proj);
      }
    }

    let tokens: string[] = [];
    if (imdeBin) {
      let hasX = false;
      try { hasX = (fs.statSync(imdeBin).mode & 0o111) !== 0; } catch {}
      if (process.platform !== "win32" && !hasX) {
        tokens = ["sh", imdeBin, cmd, ...args];
      } else {
        tokens = [imdeBin, cmd, ...args];
      }
    } else {
      const py = this.python();
      if (!py) {
        vscode.window.showErrorMessage("Python not found");
        return;
      }
      const imde = this.imdePy();
      if (!fs.existsSync(imde)) {
        vscode.window.showErrorMessage(`IMDE CLI not found: ${imde}`);
        return;
      }
      tokens = [py, imde, "--project-dir", proj, cmd, ...args];
    }

    if (cmd && this.terminal) {
      this.terminal.sendText(this.formatTerminalCommand(tokens));
    }
    if (opts?.show && this.terminal) {
      this.terminal.show(true);
    }
  }

  /** Source shell completion script for bash/zsh/pwsh when terminal is first created. */
  private sourceCompletion(proj: string): void {
    const compDir = path.join(proj, "tools", "imde", "completion");
    const shell = (vscode.env.shell || "").toLowerCase();

    let sourceCmd: string;
    if (shell.includes("powershell") || shell.includes("pwsh")) {
      const ps1 = path.join(compDir, "imde.ps1");
      if (fs.existsSync(ps1)) {
        sourceCmd = `. '${ps1.replace(/\\/g, "\\\\")}'`;
      } else { return; }
    } else if (shell.includes("zsh")) {
      const zsh = path.join(compDir, "imde.zsh");
      if (fs.existsSync(zsh)) {
        sourceCmd = `source '${zsh}'`;
      } else { return; }
    } else {
      // bash (default)
      const bash = path.join(compDir, "imde.bash");
      if (fs.existsSync(bash)) {
        sourceCmd = `source '${bash}'`;
      } else { return; }
    }

    if (this.terminal) { this.terminal.sendText(sourceCmd); }
  }

  run(cmd: string, args: string[] = [], opts?: { show?: boolean }): void {
    this.runTerminal(cmd, args, opts);
  }

  async runCommand(cmd: string, args: string[] = [], opts: ImdeRunOptions = {}): Promise<ImdeCommandResult> {
    const run = () => this.execute(cmd, args, {
      json: false,
      streamOutput: opts.streamOutput ?? true,
      timeoutMs: opts.timeoutMs ?? this.commandTimeoutMs(),
      onProgress: opts.onProgress,
    });

    if (!opts.progressTitle) {
      return run();
    }

    return vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: opts.progressTitle, cancellable: false },
      async (progress) => {
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
        } finally {
          clearInterval(timer);
        }
      }
    );
  }

  private jsonCache = new Map<string, { data: any; ts: number }>();
  private static readonly CACHE_TTL = 10000;

  async captureJson<T = any>(cmd: string, args: string[] = []): Promise<T | null> {
    const cacheKey = cmd + "|" + args.join(",");
    const cached = this.jsonCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < ImdeRunner.CACHE_TTL) {
      return cached.data as T;
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
      const data = JSON.parse(result.stdout) as T;
      this.jsonCache.set(cacheKey, { data, ts: Date.now() });
      return data;
    } catch {
      this.output.appendLine(`IMDE captureJson(${cmd}) returned invalid JSON.`);
      this.output.appendLine(result.stdout.slice(0, 500));
      return null;
    }
  }

  private execute(
    cmd: string,
    args: string[],
    opts: { json: boolean; streamOutput: boolean; timeoutMs: number; onProgress?: (current: number, total: number, detail: string) => void }
  ): Promise<ImdeCommandResult> {
    const proj = this.getProjectDir();
    const imdeBin = this.imdeBin();

    let spawnArgs: string[];
    let spawnExe: string;
    if (imdeBin) {
      const s = this.spawnImdeBin(imdeBin, [
        "--project-dir", proj,
        ...(opts.json ? ["--json"] : []),
        cmd,
        ...args,
      ]);
      spawnExe = s.exe;
      spawnArgs = s.args;
    } else {
      const py = this.python();
      const imde = this.imdePy();
      if (!py) {
        vscode.window.showErrorMessage("Python not found");
        return Promise.resolve({ code: null, stdout: "", stderr: "Python not found", timedOut: false, commandLine: "" });
      }
      if (!fs.existsSync(imde)) {
        const message = `IMDE CLI not found: ${imde}`;
        vscode.window.showErrorMessage(message);
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
      const proc = cp.spawn(spawnExe, spawnArgs, {
        cwd: proj,
        env: {
          ...loginEnv,
          PYTHONIOENCODING: process.env.PYTHONIOENCODING || "utf-8",
        },
      });
      const finish = (result: ImdeCommandResult) => {
        if (settled) { return; }
        settled = true;
        resolve(result);
      };

      const timer = opts.timeoutMs > 0
        ? setTimeout(() => { timedOut = true; proc.kill(); }, opts.timeoutMs)
        : undefined;

      proc.stdout!.on("data", (d: Buffer) => {
        const text = d.toString();
        stdout += text;
        if (opts.streamOutput) { this.output.append(text); }
        parseProgress(text);
      });
      const parseProgress = (text: string) => {
        if (!opts.onProgress) return;
        const m = text.match(/\[(\d+)\/(\d+)\]\s+(.+)/);
        if (m) {
          opts.onProgress(parseInt(m[1], 10), parseInt(m[2], 10), m[3].trim());
        }
      };

      proc.stderr!.on("data", (d: Buffer) => {
        const text = d.toString();
        stderr += text;
        if (opts.streamOutput) { this.output.append(text); }
        parseProgress(text);
      });
      proc.on("error", (err) => {
        if (timer) { clearTimeout(timer); }
        finish({ code: null, stdout, stderr: stderr + err.message, timedOut, commandLine });
      });
      proc.on("close", (code) => {
        if (timer) { clearTimeout(timer); }
        if (opts.streamOutput) {
          this.output.appendLine("");
          this.output.appendLine(timedOut ? `Timed out: ${commandLine}` : `Exit code: ${code ?? "unknown"}`);
        }
        finish({ code, stdout, stderr, timedOut, commandLine });
      });
    });
  }

  private captureTimeoutMs(): number {
    return vscode.workspace.getConfiguration("imde").get<number>("captureTimeoutMs") ?? 15000;
  }

  private commandTimeoutMs(): number {
    return vscode.workspace.getConfiguration("imde").get<number>("commandTimeoutMs") ?? 0;
  }

  private formatForLog(tokens: string[]): string {
    return tokens.map((token) => token.includes(" ") ? `"${token}"` : token).join(" ");
  }

  private formatTerminalCommand(tokens: string[]): string {
    const shell = (vscode.env.shell || "").toLowerCase();
    const isPowerShell = shell.includes("powershell") || shell.includes("pwsh");
    const quoted = tokens.map((token) => this.quoteTerminalArg(token, shell));
    return isPowerShell ? `& ${quoted.join(" ")}` : quoted.join(" ");
  }

  private quoteTerminalArg(token: string, shell: string): string {
    if (!token) { return "''"; }
    if (shell.includes("powershell") || shell.includes("pwsh")) {
      return `'${token.replace(/'/g, "''")}'`;
    }
    if (process.platform === "win32" && shell.includes("cmd")) {
      return `"${token.replace(/"/g, '\\"')}"`;
    }
    return `'${token.replace(/'/g, "'\\''")}'`;
  }
}
