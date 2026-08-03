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

import * as vscode from 'vscode';
import { KconfigSessionCache } from './KconfigSessionCache';

export class FileWatcher {
    private static instance: FileWatcher | undefined;
    private fileWatchers: vscode.FileSystemWatcher[] = [];
    private context: vscode.ExtensionContext;
    private ignoreNextChangeTimestamp: number = 0;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        FileWatcher.instance = this;
    }

    public static getInstance(): FileWatcher | undefined {
        return FileWatcher.instance;
    }

    /**
     * 忽略接下来一段时间内的文件变化通知（用于内部保存）
     * @param durationMs 忽略时长（毫秒），默认 1000ms
     */
    public ignoreNextChange(durationMs: number = 1000): void {
        this.ignoreNextChangeTimestamp = Date.now() + durationMs;
    }

    public initialize() {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return;
        }

        const configPattern = new vscode.RelativePattern(workspaceFolder, '**/{sdkconfig,defconfig,.config,*_defconfig}');
        const kconfigPattern = new vscode.RelativePattern(workspaceFolder, '**/{Kconfig,Kconfig.*}');

        this.registerWatcher(configPattern, (uri) => this.handleConfigFileChange(uri));
        this.registerWatcher(kconfigPattern, (uri) => this.handleKconfigFileChange(uri));
    }

    private registerWatcher(pattern: vscode.GlobPattern, onChange: (uri: vscode.Uri) => void): void {
        const watcher = vscode.workspace.createFileSystemWatcher(pattern);

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

    private getFileName(uri: vscode.Uri): string {
        return uri.fsPath.split(/[\\/]/).pop() || 'Unknown';
    }

    private handleConfigFileChange(uri: vscode.Uri) {
        if (Date.now() < this.ignoreNextChangeTimestamp) {
            return;
        }

        const fileName = this.getFileName(uri);
        vscode.window.showInformationMessage(
            `Configuration file ${fileName} has been modified externally.`
        );
    }

    private handleKconfigFileChange(uri: vscode.Uri): void {
        if (Date.now() < this.ignoreNextChangeTimestamp) {
            return;
        }

        KconfigSessionCache.clearHotCache();
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        if (workspaceFolder) {
            const cache = new KconfigSessionCache(workspaceFolder.uri.fsPath);
            void cache.invalidate();
        }

        const fileName = this.getFileName(uri);
        vscode.window.showInformationMessage(
            `Kconfig file ${fileName} has changed. Refresh GUI Config to reload the menu tree.`
        );
    }

    public dispose() {
        this.fileWatchers.forEach((watcher) => watcher.dispose());
        this.fileWatchers = [];
        if (FileWatcher.instance === this) {
            FileWatcher.instance = undefined;
        }
    }
}
