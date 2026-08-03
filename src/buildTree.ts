import * as vscode from "vscode";
import { ImdeRunner } from "./imdeRunner";

export class BuildTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChange = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChange.event;

  constructor(private runner: ImdeRunner) {}

  refresh(): void { this._onDidChange.fire(); }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem { return element; }

  async getChildren(): Promise<vscode.TreeItem[]> {
    const items: vscode.TreeItem[] = [];

    const data = await this.runner.captureJson("status");
    if (data) {
      const state = data.state || "unknown";
      const ok = state.startsWith("matched") && data.buildConfigured;
      const statusItem = new vscode.TreeItem(
        `Status: ${state}`, vscode.TreeItemCollapsibleState.None
      );
      statusItem.iconPath = new vscode.ThemeIcon(ok ? "pass" : "warning");
      statusItem.description = data.buildConfigured ? "configured" : "not configured";
      statusItem.tooltip = data.buildConfigured
        ? "Build system is configured."
        : "Build system is not configured yet. Run Configure before building.";
      items.push(statusItem);
      if (data.defconfig) {
        const defconfig = new vscode.TreeItem(`Defconfig: ${data.defconfig}`, vscode.TreeItemCollapsibleState.None);
        defconfig.iconPath = new vscode.ThemeIcon("symbol-file");
        items.push(defconfig);
      } else {
        const defconfig = new vscode.TreeItem("No defconfig selected", vscode.TreeItemCollapsibleState.None);
        defconfig.iconPath = new vscode.ThemeIcon("warning");
        defconfig.description = "select one";
        defconfig.command = { command: "imde.selectDefconfig", title: "Select Defconfig" };
        items.push(defconfig);
      }
    } else {
      const failed = new vscode.TreeItem("Status unavailable", vscode.TreeItemCollapsibleState.None);
      failed.iconPath = new vscode.ThemeIcon("warning");
      failed.description = "run doctor";
      failed.command = { command: "imde.doctor", title: "Run Doctor" };
      items.push(failed);
    }

    // ---- Action buttons (command-linked tree items) ----
    const mkBtn = (label: string, cmd: string, icon: string, desc?: string): vscode.TreeItem => {
      const ti = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
      ti.command = { command: cmd, title: label };
      ti.iconPath = new vscode.ThemeIcon(icon);
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
