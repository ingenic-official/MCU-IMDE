import * as vscode from "vscode";
import { ImdeRunner } from "./imdeRunner";

const RECENT_DEFCONFIGS_KEY = "imde.recentDefconfigs";
const MAX_RECENT = 5;

interface DefconfigItem extends vscode.QuickPickItem { token: string; }

export async function selectDefconfig(
  runner: ImdeRunner,
  context?: vscode.ExtensionContext,
  after?: () => void,
) {
  const output = await runner.captureJson<{
    defconfigs?: Array<{ token: string; relativePath?: string; boardFamily?: string }>;
  }>("list-defconfigs");
  if (!output?.defconfigs?.length) {
    vscode.window.showWarningMessage("No defconfigs found");
    return;
  }

  const recent: string[] = context?.workspaceState.get<string[]>(RECENT_DEFCONFIGS_KEY) || [];
  const recentSet = new Set(recent);

  const allItems: DefconfigItem[] = output.defconfigs.map((d) => ({
    label: d.token, token: d.token,
    description: d.relativePath,
    detail: d.boardFamily ? `Board: ${d.boardFamily}` : undefined,
  }));

  allItems.sort((a, b) => {
    const aR = recentSet.has(a.token), bR = recentSet.has(b.token);
    if (aR && !bR) return -1;
    if (!aR && bR) return 1;
    return a.label.localeCompare(b.label);
  });

  for (const item of allItems) {
    if (recentSet.has(item.token)) {
      item.description = `$(history) ${item.description || ""}`.trim();
    }
  }

  const picked = await vscode.window.showQuickPick(allItems, {
    placeHolder: "Select a defconfig...",
  });
  if (!picked) return;

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

export async function saveDefconfig(runner: ImdeRunner) {
  const name = await vscode.window.showInputBox({
    prompt: "Defconfig name (without _defconfig suffix) — saved to config/",
    placeHolder: "myboard -> config/myboard_defconfig",
    validateInput: (v) => {
      if (!v.trim()) return "Name is required";
      if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(v.trim())) return "Use letters, numbers, underscores, or dashes";
      return undefined;
    },
  });
  if (!name) return;

  await runner.runCommand("save-defconfig", [name.trim()], {
    progressTitle: `Saving ${name.trim()}_defconfig`, streamOutput: true,
  });
}
