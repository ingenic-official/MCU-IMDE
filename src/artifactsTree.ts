import * as vscode from "vscode";
import { ImdeRunner } from "./imdeRunner";

export class ArtifactTreeItem extends vscode.TreeItem {
  constructor(label: string, public readonly artifactPath: string, exists: boolean, size: string) {
    super(label);
    this.description = exists ? size : "not built";
    this.iconPath = new vscode.ThemeIcon(exists ? "file" : "circle-slash");
    this.tooltip = artifactPath;
    if (exists) {
      this.command = { command: "vscode.open", title: "Open", arguments: [vscode.Uri.file(artifactPath)] };
      this.contextValue = label.endsWith(".map") ? "imdeMapArtifact" : "imdeArtifact";
    }
  }
}

export class ArtifactsTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChange = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChange.event;
  private cached: vscode.TreeItem[] = [];
  private loading = false;
  private loaded = false;

  constructor(private runner: ImdeRunner) {}

  refresh(): void {
    if (this.loading) return;
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

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem { return element; }

  getChildren(): vscode.TreeItem[] {
    if (!this.loaded && !this.loading) this.refresh();
    if (this.loading) {
      const item = new vscode.TreeItem("Reading artifacts...");
      item.iconPath = new vscode.ThemeIcon("loading~spin");
      return [item];
    }
    return this.cached;
  }

  private async _fetch(): Promise<vscode.TreeItem[]> {
    const data = await this.runner.captureJson("artifacts");
    if (!data?.artifacts) {
      const ti = new vscode.TreeItem("No artifacts available");
      ti.iconPath = new vscode.ThemeIcon("warning");
      ti.description = "build first";
      ti.tooltip = "Run IMDE Build to generate artifacts.";
      ti.command = { command: "imde.build", title: "Build" };
      return [ti];
    }

    const items = Object.entries(data.artifacts).map(([key, meta]: [string, any]) => {
      const exists = meta.exists;
      const size = meta.size ? `${(meta.size / 1024).toFixed(1)} KB` : "";
      return new ArtifactTreeItem(key, meta.path, exists, size);
    });
    const builtCount = items.filter((item) => item.contextValue === "imdeArtifact" || item.contextValue === "imdeMapArtifact").length;
    if (items.length > 0 && builtCount === 0) {
      const build = new vscode.TreeItem("Artifacts are not built yet", vscode.TreeItemCollapsibleState.None);
      build.iconPath = new vscode.ThemeIcon("play");
      build.description = "run build";
      build.command = { command: "imde.build", title: "Build" };
      return [build, ...items];
    }
    return items;
  }
}
