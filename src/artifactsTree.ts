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

  constructor(private runner: ImdeRunner) { this.refresh(); }

  refresh(): void {
    this._fetch().then(items => {
      this.cached = items;
      this._onDidChange.fire();
    });
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem { return element; }

  getChildren(): vscode.TreeItem[] { return this.cached; }

  private async _fetch(): Promise<vscode.TreeItem[]> {
    const data = await this.runner.captureJson("artifacts");
    if (!data?.artifacts) {
      const ti = new vscode.TreeItem("No artifacts available");
      ti.iconPath = new vscode.ThemeIcon("warning");
      ti.description = "build first";
      return [ti];
    }

    return Object.entries(data.artifacts).map(([key, meta]: [string, any]) => {
      const exists = meta.exists;
      const size = meta.size ? `${(meta.size / 1024).toFixed(1)} KB` : "";
      return new ArtifactTreeItem(key, meta.path, exists, size);
    });
  }
}
