import * as vscode from "vscode";
import * as path from "path";
import { ImdeCommandResult, ImdeRunner } from "./imdeRunner";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PACKAGE_JSON = require("../package.json");
import { DoctorTreeProvider } from "./doctorTree";
import { ArtifactsTreeProvider, ArtifactTreeItem } from "./artifactsTree";
import { BuildTreeProvider } from "./buildTree";
import { MenuconfigPanel } from "./menuconfig/MenuconfigPanel";
import { FileWatcher } from "./menuconfig/fileWatcher";
import { Logger } from "./logger/logger";
import { ImdeDiagnostics } from "./diagnostics";
import { parseMapFile, MapParseResult } from "./mapview/parser";
import { MapViewPanel } from "./mapview/panel";
import { selectDefconfig, saveDefconfig } from "./defconfig";

// Cache for parsed .map files: path -> { mtime, data }
const mapCache = new Map<string, { mtime: number; data: MapParseResult }>();

async function getCachedMapData(filePath: string): Promise<MapParseResult> {
  const fs = require("fs");
  const stat = fs.statSync(filePath);
  const cached = mapCache.get(filePath);
  if (cached && cached.mtime === stat.mtimeMs) {
    return cached.data;
  }
  const content = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
  const text = Buffer.from(content).toString("utf-8");
  const data = parseMapFile(text);
  mapCache.set(filePath, { mtime: stat.mtimeMs, data });
  return data;
}

export function activate(context: vscode.ExtensionContext) {
  Logger.info("IMDE extension is now active");

  const runner = new ImdeRunner();
  context.subscriptions.push(runner);
  ImdeRunner.warmupEnv();

  // ---- Diagnostics (Problems panel integration) ----
  const diagnostics = new ImdeDiagnostics(runner.getProjectDir());
  context.subscriptions.push(diagnostics);

  // ---- File watcher for config changes ----
  const fileWatcher = new FileWatcher(context);
  fileWatcher.initialize();

  // ---- Tree views ----
  const doctorTree = new DoctorTreeProvider(runner);
  const buildTree = new BuildTreeProvider(runner);
  const artifactsTree = new ArtifactsTreeProvider(runner);

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("imde.doctorView", doctorTree),
    vscode.window.registerTreeDataProvider("imde.buildView", buildTree),
    vscode.window.registerTreeDataProvider("imde.artifactsView", artifactsTree),
  );

  const refreshAll = () => {
    doctorTree.refresh();
    buildTree.refresh();
    artifactsTree.refresh();
  };

  const runAction = async (
    command: string,
    args: string[],
    title: string,
    after?: () => void,
  ) => {
    diagnostics.clear();
    const result = await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Window, title, cancellable: false },
      () => runner.runCommand(command, args, { streamOutput: true }),
    );
    if (result.code !== 0 || result.timedOut) {
      const count = diagnostics.report(result.stderr + "\n" + result.stdout);
      if (count > 0) {
        const action = await vscode.window.showErrorMessage(
          `IMDE ${command} failed with ${count} issue${count > 1 ? "s" : ""}.`,
          "Show Problems", "Show Output"
        );
        if (action === "Show Problems") {
          vscode.commands.executeCommand("workbench.actions.view.problems");
        } else if (action === "Show Output") {
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
  context.subscriptions.push(
    vscode.commands.registerCommand("imde.doctor", () => {
      diagnostics.clear();
      runner.runTerminal("doctor", [], { show: true });
      pollRefresh(() => doctorTree.refresh(true), 2000, 2);
    }),
    vscode.commands.registerCommand("imde.build", async () => {
      diagnostics.clear();
      vscode.window.withProgress(
        { location: vscode.ProgressLocation.Window, title: "IMDE Build — running…" },
        () => new Promise<void>(resolve => {
          runner.runTerminal("build", [], { show: true });
          // Terminal exits asynchronously; poll for artifacts as best-effort completion signal
          const poll = setInterval(() => {
            runner.captureJson("artifacts").then(data => {
              if (data?.artifacts && Object.keys(data.artifacts).length > 0) {
                clearInterval(poll);
                resolve();
              }
            }).catch(() => {});
          }, 2000);
          // Safety timeout
          setTimeout(() => { clearInterval(poll); resolve(); }, 120000);
        })
      );
      pollRefresh(() => { artifactsTree.refresh(); buildTree.refresh(); }, 3000, 3);
    }),
    vscode.commands.registerCommand("imde.configure", () => {
      diagnostics.clear();
      runner.runTerminal("configure", [], { show: true });
      pollRefresh(() => buildTree.refresh(), 2000, 2);
    }),
    vscode.commands.registerCommand("imde.menuconfig", async () => {
      const projDir = runner.getProjectDir();
      const cmakeCache = path.join(projDir, "build", "CMakeCache.txt");
      if (!require("fs").existsSync(cmakeCache)) {
        await vscode.window.withProgress(
          { location: vscode.ProgressLocation.Notification, title: "Configuring build before menuconfig..." },
          async () => {
            await runner.runCommand("configure", [], { streamOutput: false });
          }
        );
      }
      runner.runTerminal("menuconfig", [], { show: true });
      pollRefresh(() => { buildTree.refresh(); artifactsTree.refresh(); }, 3000, 3);
    }),
    vscode.commands.registerCommand("imde.fullCleanBuild", () => {
      diagnostics.clear();
      runner.runTerminal("fullclean", ["--yes"], { show: true });
      setTimeout(() => {
        runner.runTerminal("build", [], { show: true });
      }, 800);
      pollRefresh(() => { artifactsTree.refresh(); buildTree.refresh(); }, 3000, 5);
    }),
    vscode.commands.registerCommand("imde.clean", () => {
      diagnostics.clear();
      runner.runTerminal("clean", [], { show: true });
      pollRefresh(() => artifactsTree.refresh(), 2000, 2);
    }),
    vscode.commands.registerCommand("imde.fullclean", async () => {
      const ans = await vscode.window.showWarningMessage(
        "Delete the entire IMDE build directory? This cannot be undone.",
        { modal: true },
        "Delete"
      );
      if (ans === "Delete") {
        diagnostics.clear();
        runner.runTerminal("fullclean", ["--yes"], { show: true });
        pollRefresh(() => { artifactsTree.refresh(); buildTree.refresh(); }, 2000, 2);
      }
    }),
    vscode.commands.registerCommand("imde.status", async () =>
      runAction("status", [], "Reading IMDE status", buildTree.refresh.bind(buildTree))
    ),
    vscode.commands.registerCommand("imde.artifacts", async () =>
      runAction("artifacts", [], "Reading IMDE artifacts", artifactsTree.refresh.bind(artifactsTree))
    ),
    vscode.commands.registerCommand("imde.setupToolchain", async () =>
      runAction("setup-toolchain", [], "Setting up IMDE toolchain", refreshAll)
    ),
    vscode.commands.registerCommand("imde.selectDefconfig", () =>
      selectDefconfig(runner, context, buildTree.refresh.bind(buildTree))
    ),
    vscode.commands.registerCommand("imde.saveDefconfig", () =>
      saveDefconfig(runner)
    ),
    vscode.commands.registerCommand("imde.copyPath", async (itemOrPath: ArtifactTreeItem | string) => {
      const filePath = typeof itemOrPath === "string" ? itemOrPath : itemOrPath.artifactPath;
      await vscode.env.clipboard.writeText(filePath);
      vscode.window.showInformationMessage("Path copied");
    }),
    vscode.commands.registerCommand("imde.revealFile", async (itemOrPath: ArtifactTreeItem | string) => {
      const filePath = typeof itemOrPath === "string" ? itemOrPath : itemOrPath.artifactPath;
      await vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(filePath));
    }),
    vscode.commands.registerCommand("imde.refresh", refreshAll),

    // Used by Map View webview to open source files from tooltip links
    vscode.commands.registerCommand("imde.openFile", async (args: string | [string, string]) => {
      // Accept single path or [fullPath, relativePath] tuple
      const fullPath = Array.isArray(args) ? args[0] : args;
      const relPath = Array.isArray(args) ? args[1] : "";
      const uri = vscode.Uri.file(fullPath);
      if (require("fs").existsSync(fullPath)) {
        await vscode.commands.executeCommand("vscode.open", uri);
        return;
      }
      // Fallback: fuzzy search in workspace for the relative source file
      if (relPath) {
        const results = await vscode.window.withProgress(
          { location: vscode.ProgressLocation.Window, title: "Searching source file…" },
          () => vscode.workspace.findFiles("**/" + relPath.replace(/\\/g, "/"), null, 1)
        );
        if (results.length > 0) {
          await vscode.commands.executeCommand("vscode.open", results[0]);
          return;
        }
      }
      vscode.window.showWarningMessage("Source file not found: " + (relPath || fullPath));
    }),

    // ---- Map View ----
    vscode.commands.registerCommand("imde.viewMap", async (item?: ArtifactTreeItem) => {
      let filePath: string | undefined;
      if (typeof item === "string") {
        filePath = item;
      } else if (item?.artifactPath) {
        filePath = item.artifactPath;
      } else {
        // Find .map artifact automatically
        const data = await runner.captureJson<{ artifacts?: Record<string, { path: string; exists: boolean }> }>("artifacts");
        if (data?.artifacts) {
          const maps = Object.entries(data.artifacts)
            .filter(([k, v]) => k.endsWith(".map") && v.exists)
            .map(([k, v]) => ({ label: k, path: v.path }));
          if (maps.length === 1) {
            filePath = maps[0].path;
          } else if (maps.length > 1) {
            const picked = await vscode.window.showQuickPick(maps, { placeHolder: "Select a .map file to view" });
            filePath = picked?.path;
          }
        }
        if (!filePath) {
          vscode.window.showWarningMessage("No .map artifact found. Build first?");
          return;
        }
      }
      try {
        const mapData = await getCachedMapData(filePath);
        MapViewPanel.createOrShow(context.extensionUri, filePath, mapData, runner.getProjectDir());
      } catch (err: any) {
        vscode.window.showErrorMessage(`Failed to parse map file: ${err.message}`);
      }
    }),

    // ---- GUI Config (Visual Kconfig Editor) ----
    vscode.commands.registerCommand("imde.guiConfig", async (uri?: vscode.Uri) => {
      const workspaceFolder = uri
        ? vscode.workspace.getWorkspaceFolder(uri)
        : vscode.workspace.workspaceFolders?.[0];

      if (!workspaceFolder) {
        vscode.window.showErrorMessage("Please open a workspace folder first.");
        return;
      }

      // Check .config exists
      const fs = require("fs");
      const projDir = workspaceFolder.uri.fsPath;
      const configPath = path.join(projDir, ".config");
      if (!fs.existsSync(configPath)) {
        const action = await vscode.window.showWarningMessage(
          "No .config found. Select a defconfig to generate one.",
          "Select Defconfig"
        );
        if (action === "Select Defconfig") {
          await selectDefconfig(runner, context);
        }
        return;
      }

      // .config exists but build directory may have been cleaned — auto-configure
      const cmakeCache = path.join(projDir, "build", "CMakeCache.txt");
      if (!fs.existsSync(cmakeCache)) {
        await vscode.window.withProgress(
          { location: vscode.ProgressLocation.Notification, title: "Build directory cleaned — re-configuring..." },
          async () => {
            await runner.runCommand("configure", [], { streamOutput: false });
          }
        );
      }

      try {
        MenuconfigPanel.createOrShow(context.extensionUri, workspaceFolder.uri, context);
      } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to open IMDE GUI Config: ${error.message}`);
      }
    }),
  );

  // Auto-refresh tree views on first load (silent, no terminal)
  doctorTree.refresh();
  buildTree.refresh();

  // ---- Status bar quick actions ----
  // Polling helper: refresh after terminal commands complete
  const pollRefresh = (fn: () => void, delay = 3000, retries = 3) => {
    let count = 0;
    const attempt = () => {
      fn();
      if (++count < retries) setTimeout(attempt, delay);
    };
    setTimeout(attempt, delay);
  };

  const mkBar = (text: string, cmd: string, tooltip: string, priority: number) => {
    const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, priority);
    item.command = cmd;
    item.text = text;
    item.tooltip = tooltip;
    item.show();
    return item;
  };

  const mapBar = mkBar("$(symbol-color) Map", "imde.viewMap", "View Memory Map", 95);

  async function updateMapBarVisibility() {
    try {
      const data = await runner.captureJson<{ artifacts?: Record<string, { exists: boolean }> }>("artifacts");
      const hasMap = data?.artifacts && Object.entries(data.artifacts).some(([k, v]) => k.endsWith(".map") && v.exists);
      if (hasMap) { mapBar.show(); }
      else { mapBar.hide(); }
    } catch {
      mapBar.hide();
    }
  }

  // Update visibility periodically and after build
  const mapBarTimer = setInterval(updateMapBarVisibility, 10000);
  context.subscriptions.push({ dispose: () => clearInterval(mapBarTimer) });
  setTimeout(updateMapBarVisibility, 2000);

  context.subscriptions.push(
    mkBar("$(circuit-board) IMDE", "imde.doctor", `IMDE ${PACKAGE_JSON.version}`, 100),
    mkBar("$(debug-rerun) Rebuild", "imde.fullCleanBuild", "FullClean & Build", 99),
    mkBar("$(play) Build", "imde.build", "Build", 98),
    mkBar("$(list-selection) Select", "imde.selectDefconfig", "Select Defconfig", 97),
    mkBar("$(settings) Config", "imde.guiConfig", "GUI Config", 96),
    mapBar,
  );
}

async function reportResult(runner: ImdeRunner, command: string, result: ImdeCommandResult): Promise<void> {
  if (result.code === 0 && !result.timedOut) {
    return;
  }

  const reason = result.timedOut ? "timed out" : `failed with exit code ${result.code ?? "unknown"}`;
  const action = vscode.workspace.getConfiguration("imde").get<boolean>("showOutputOnError") ?? true
    ? await vscode.window.showErrorMessage(`IMDE ${command} ${reason}.`, "Show Output")
    : await vscode.window.showErrorMessage(`IMDE ${command} ${reason}.`);
  if (action === "Show Output") {
    runner.showOutput();
  }
}

export function deactivate() {
  Logger.info("IMDE extension is now deactivated");
}
