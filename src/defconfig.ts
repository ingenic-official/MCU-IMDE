import * as vscode from "vscode";
import { ImdeRunner } from "./imdeRunner";

const RECENT_DEFCONFIGS_KEY = "imde.recentDefconfigs";
const MAX_RECENT = 5;

interface DefconfigRecord {
  token: string;
  relativePath?: string;
  sourceRoot?: string;
  rootRelativePath?: string;
  boardFamily?: string;
  microchip?: string;
  board?: string;
}

interface SourceItem extends vscode.QuickPickItem {
  source: string;
  sourceKind: "chip" | "middleware" | "test" | "other";
  records: DefconfigRecord[];
}

interface ChipItem extends vscode.QuickPickItem {
  chip: string;
  records: DefconfigRecord[];
}

interface DefconfigItem extends vscode.QuickPickItem {
  commandArgs: string[];
  recentKey: string;
  legacyToken: string;
}

type PickStepResult<T> =
  | { action: "pick"; item: T }
  | { action: "back" }
  | { action: "cancel" };

interface BackPickItem extends vscode.QuickPickItem {
  isBack: true;
}

function showPickStep<T extends vscode.QuickPickItem>(
  items: readonly T[],
  placeHolder: string,
  showBack: boolean,
): Promise<PickStepResult<T>> {
  return new Promise((resolve) => {
    const picker = vscode.window.createQuickPick<T | BackPickItem>();
    let settled = false;
    const backItem: BackPickItem = {
      label: "← Back",
      alwaysShow: true,
      isBack: true,
    };
    picker.items = showBack ? [backItem, ...items] : items;
    picker.placeholder = placeHolder;
    picker.matchOnDescription = true;
    picker.matchOnDetail = true;

    const finish = (result: PickStepResult<T>) => {
      if (settled) return;
      settled = true;
      resolve(result);
      picker.hide();
    };

    picker.onDidAccept(() => {
      const selected = picker.selectedItems[0];
      if (!selected) return;
      if ("isBack" in selected) {
        finish({ action: "back" });
      } else {
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

function normalizedRoot(record: DefconfigRecord): string {
  return (record.sourceRoot || "").replace(/\\/g, "/").replace(/^\.\//, "");
}

function sourceIdentity(record: DefconfigRecord): Pick<SourceItem, "source" | "sourceKind"> {
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

function withoutPrefix(value: string, prefix: string): string {
  const normalized = value.replace(/\\/g, "/");
  const expected = `${prefix}/`;
  return normalized.startsWith(expected) ? normalized.slice(expected.length) : normalized;
}

function selectionArgs(record: DefconfigRecord, source: string): { args: string[]; label: string } {
  const relative = record.rootRelativePath || record.token;
  if (source === "test" && record.microchip) {
    const config = withoutPrefix(relative, record.microchip);
    return { args: ["--reconfigure", "--object", "default", source, record.microchip, config], label: config };
  }
  if (source === "test") {
    return { args: ["--reconfigure", "--object", "default", record.token], label: record.token };
  }

  const config = record.boardFamily && normalizedRoot(record) === "config"
    ? withoutPrefix(relative, record.boardFamily)
    : relative;
  return { args: ["--reconfigure", "--object", "default", source, config], label: config };
}

function makeConfigItems(
  records: DefconfigRecord[],
  source: string,
  recent: string[],
): DefconfigItem[] {
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
    if (leftRecent !== rightRecent) return leftRecent ? -1 : 1;
    return left.label.localeCompare(right.label);
  });
}

export async function selectDefconfig(
  runner: ImdeRunner,
  context?: vscode.ExtensionContext,
  after?: () => void,
) {
  const output = await runner.captureJson<{
    defconfigs?: DefconfigRecord[];
  }>("list-defconfigs");
  if (!output?.defconfigs?.length) {
    vscode.window.showWarningMessage("No defconfigs found");
    return;
  }

  const recent: string[] = context?.workspaceState.get<string[]>(RECENT_DEFCONFIGS_KEY) || [];
  const sourceMap = new Map<string, SourceItem>();
  for (const record of output.defconfigs) {
    const identity = sourceIdentity(record);
    if (!identity.source) continue;
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
      iconPath: new vscode.ThemeIcon(
        identity.sourceKind === "chip" ? "circuit-board" : identity.sourceKind === "test" ? "beaker" : "library",
      ),
    });
  }

  const sourceOrder: Record<SourceItem["sourceKind"], number> = {
    chip: 0,
    middleware: 1,
    test: 2,
    other: 3,
  };
  const sources = [...sourceMap.values()].sort((left, right) =>
    sourceOrder[left.sourceKind] - sourceOrder[right.sourceKind] || left.label.localeCompare(right.label));
  let pickedSource: SourceItem | undefined;
  let picked: DefconfigItem | undefined;
  while (!picked) {
    if (!pickedSource) {
      const sourceResult = await showPickStep(sources, "Select config source...", false);
      if (sourceResult.action !== "pick") return;
      pickedSource = sourceResult.item;
    }

    let records = pickedSource.records;
    if (pickedSource.sourceKind === "test") {
      const chipMap = new Map<string, DefconfigRecord[]>();
      for (const record of records) {
        const chip = record.microchip || "Unclassified";
        const grouped = chipMap.get(chip) || [];
        grouped.push(record);
        chipMap.set(chip, grouped);
      }
      const chips: ChipItem[] = [...chipMap.entries()]
        .map(([chip, chipRecords]) => ({
          label: chip,
          chip,
          records: chipRecords,
          description: `${chipRecords.length} configs`,
          iconPath: new vscode.ThemeIcon("circuit-board"),
        }))
        .sort((left, right) => left.label.localeCompare(right.label));
      const chipResult = await showPickStep(chips, "Select test chip...", true);
      if (chipResult.action === "cancel") return;
      if (chipResult.action === "back") {
        pickedSource = undefined;
        continue;
      }
      records = chipResult.item.records;
    }

    const configResult = await showPickStep(
      makeConfigItems(records, pickedSource.source, recent),
      `Select ${pickedSource.source} defconfig...`,
      true,
    );
    if (configResult.action === "cancel") return;
    if (configResult.action === "back") {
      if (pickedSource.sourceKind !== "test") pickedSource = undefined;
      continue;
    }
    picked = configResult.item;
  }

  const result = await runner.runCommand("use-defconfig", picked.commandArgs, {
    progressTitle: `Using ${picked.label}`, streamOutput: true,
  });
  if (result.code === 0 && !result.timedOut) {
    if (context) {
      const updated = [picked.recentKey, ...recent.filter((item) =>
        item !== picked.recentKey && item !== picked.legacyToken)].slice(0, MAX_RECENT);
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
