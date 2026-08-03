import * as fs from "fs";
import * as path from "path";

export interface PinmuxBoardTarget {
  id: string;
  directory: string;
  pinmuxFile: string;
}

export interface PinmuxChipTarget {
  id: string;
  directory: string;
  boards: PinmuxBoardTarget[];
  pinlistFiles: string[];
}

async function readDirectories(directory: string): Promise<fs.Dirent[]> {
  try {
    const entries = await fs.promises.readdir(directory, { withFileTypes: true });
    return entries.filter(entry => entry.isDirectory());
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function isFile(filePath: string): Promise<boolean> {
  try {
    return (await fs.promises.stat(filePath)).isFile();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

function compareIds(left: { id: string }, right: { id: string }): number {
  return left.id.localeCompare(right.id, undefined, { numeric: true, sensitivity: "base" });
}

export async function discoverPinmuxTargets(projectDir: string): Promise<PinmuxChipTarget[]> {
  const bspRoot = path.join(projectDir, "code", "bsp");
  const pinlistRoot = path.join(projectDir, "tools", "imde", "pinmux");
  const chipDirectories = await readDirectories(bspRoot);
  const chips: PinmuxChipTarget[] = [];

  for (const chipEntry of chipDirectories) {
    if (chipEntry.name === "common") continue;

    const chipDirectory = path.join(bspRoot, chipEntry.name);
    const boardDirectories = await readDirectories(chipDirectory);
    const boards: PinmuxBoardTarget[] = [];

    for (const boardEntry of boardDirectories) {
      const boardDirectory = path.join(chipDirectory, boardEntry.name);
      const pinmuxFile = path.join(boardDirectory, "board_pinmux.c");
      if (await isFile(pinmuxFile)) {
        boards.push({ id: boardEntry.name, directory: boardDirectory, pinmuxFile });
      }
    }

    const pinlistDirectory = path.join(pinlistRoot, chipEntry.name);
    let pinlistFiles: string[] = [];
    try {
      const entries = await fs.promises.readdir(pinlistDirectory, { withFileTypes: true });
      pinlistFiles = entries
        .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith(".impx"))
        .map(entry => path.join(pinlistDirectory, entry.name))
        .sort((left, right) => path.basename(left).localeCompare(path.basename(right), undefined, { numeric: true, sensitivity: "base" }));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }

    if (boards.length === 0 && pinlistFiles.length === 0) continue;

    boards.sort(compareIds);
    chips.push({ id: chipEntry.name, directory: chipDirectory, boards, pinlistFiles });
  }

  return chips.sort(compareIds);
}
