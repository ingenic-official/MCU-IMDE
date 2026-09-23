import * as vscode from "vscode";
import { ImdeRunner } from "./imdeRunner";

export class DoctorTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChange = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChange.event;
  private cached: vscode.TreeItem[] = [];
  private lastRefresh = 0;
  private refreshTimer: ReturnType<typeof setTimeout> | undefined;
  private loading = false;
  private loaded = false;

  constructor(private runner: ImdeRunner) {}

  refresh(force = false): void {
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

  private _doRefresh(): void {
    if (this.loading) return;
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

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem { return element; }

  getChildren(): vscode.TreeItem[] {
    if (!this.loaded && !this.loading) this._doRefresh();
    if (this.loading) {
      const ti = new vscode.TreeItem("Refreshing environment...");
      ti.iconPath = new vscode.ThemeIcon("loading~spin");
      return [ti];
    }
    return this.cached;
  }

  private async _fetch(): Promise<vscode.TreeItem[]> {
    const data = await this.runner.captureJson("doctor");
    if (!data?.checks) return [this._action("Failed to run doctor", "imde.doctor", "open env")];

    const c = data.checks;
    const items: vscode.TreeItem[] = [];

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

  private _check(label: string, ok: boolean, detail?: string, tooltip?: string): vscode.TreeItem {
    const ti = new vscode.TreeItem(label);
    ti.iconPath = new vscode.ThemeIcon(ok ? "pass" : "error");
    ti.description = detail || (ok ? "OK" : "FAIL");
    ti.tooltip = tooltip || label;
    return ti;
  }

  private _ver(raw?: string): string {
    if (!raw) return "";
    const parts = raw.split(" ");
    return parts[parts.length - 1] || raw;
  }

  private _error(msg: string): vscode.TreeItem {
    const ti = new vscode.TreeItem(msg);
    ti.iconPath = new vscode.ThemeIcon("warning");
    return ti;
  }

  private _action(msg: string, command: string, description: string): vscode.TreeItem {
    const ti = this._error(msg);
    ti.description = description;
    ti.command = { command, title: description };
    return ti;
  }
}
