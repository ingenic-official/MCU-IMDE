import * as fs from "fs";
import * as path from "path";
import {
  PinmuxBoardDescriptor,
  boardSymbolFromKconfig,
  boardConfigSymbol,
  generateBoardCMakeLists,
  generateBoardKconfig,
  mergeChipCMakeLists,
  mergeChipKconfig,
  normalizeBoardKconfig,
} from "./boardFiles";

export interface PinmuxFileWriteResult {
  changed: boolean;
  filePath: string;
}

export interface PinmuxFileWriteRequest {
  filePath: string;
  source: string;
}

export interface CreatePinmuxBoardOptions {
  boardId: string;
  chipId: string;
  chipDirectory?: string;
  pinmuxSource: string;
  boardPinsSource: string;
  sourceBoardDirectory?: string;
  sourceBoardId?: string;
}

export interface CreatedPinmuxBoard {
  boardDirectory: string;
  boardId: string;
  pinmuxFile: string;
  updatedFiles: string[];
}

export interface DeletePinmuxBoardOptions {
  boardId: string;
  chipId: string;
  chipDirectory: string;
}

export interface DeletedPinmuxBoard {
  boardDirectory: string;
  boardId: string;
  updatedFiles: string[];
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function readText(filePath: string): Promise<string> {
  return fs.promises.readFile(filePath, "utf8");
}

async function readOptionalText(filePath: string): Promise<string | undefined> {
  try {
    return await readText(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

async function restoreText(filePath: string, source: string | undefined): Promise<void> {
  if (source === undefined) {
    await fs.promises.rm(filePath, { force: true });
    return;
  }
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.writeFile(filePath, source, "utf8");
}

export function validateBoardId(boardId: string): string | undefined {
  if (!/^[a-z0-9][a-z0-9_]*$/.test(boardId)) return "Use lowercase letters, digits, and underscores; start with a letter or digit.";
  if (boardId === "common") return "The board id 'common' is reserved.";
  return undefined;
}

export async function writePinmuxFiles(requests: readonly PinmuxFileWriteRequest[]): Promise<PinmuxFileWriteResult[]> {
  const normalizedPaths = new Set<string>();
  const entries = [] as Array<{
    request: PinmuxFileWriteRequest;
    filePath: string;
    current?: string;
    changed: boolean;
    temporaryPath?: string;
  }>;

  for (const request of requests) {
    const filePath = path.resolve(request.filePath);
    const pathKey = filePath.toLowerCase();
    if (normalizedPaths.has(pathKey)) throw new Error(`Duplicate Pinmux output path: ${filePath}.`);
    normalizedPaths.add(pathKey);
    const current = await readOptionalText(filePath);
    entries.push({ request, filePath, current, changed: current !== request.source });
  }

  const changedEntries = entries.filter(entry => entry.changed);
  if (changedEntries.length === 0) return entries.map(entry => ({ changed: false, filePath: entry.filePath }));

  try {
    for (const [index, entry] of changedEntries.entries()) {
      await fs.promises.mkdir(path.dirname(entry.filePath), { recursive: true });
      entry.temporaryPath = `${entry.filePath}.imde.tmp-${process.pid}-${Date.now()}-${index}`;
      await fs.promises.writeFile(entry.temporaryPath, entry.request.source, "utf8");
    }

    for (const entry of changedEntries) {
      await fs.promises.writeFile(entry.filePath, entry.request.source, "utf8");
    }
  } catch (error) {
    const rollbackErrors: string[] = [];
    for (const entry of changedEntries) {
      try {
        await restoreText(entry.filePath, entry.current);
      } catch (rollbackError) {
        rollbackErrors.push(`${entry.filePath}: ${String(rollbackError)}`);
      }
    }
    const message = error instanceof Error ? error.message : String(error);
    if (rollbackErrors.length > 0) throw new Error(`${message}; Pinmux rollback failed: ${rollbackErrors.join("; ")}`);
    throw error;
  } finally {
    await Promise.all(changedEntries.filter(entry => entry.temporaryPath).map(entry => fs.promises.rm(entry.temporaryPath!, { force: true })));
  }

  return entries.map(entry => ({
    changed: entry.changed,
    filePath: entry.filePath,
  }));
}

export async function writePinmuxFile(filePath: string, source: string): Promise<PinmuxFileWriteResult> {
  return (await writePinmuxFiles([{ filePath, source }]))[0];
}

async function boardDescriptors(chipDirectory: string, excludedBoardId?: string): Promise<{ boards: PinmuxBoardDescriptor[]; normalizedFiles: Map<string, string> }> {
  const entries = await fs.promises.readdir(chipDirectory, { withFileTypes: true });
  const boards: PinmuxBoardDescriptor[] = [];
  const normalizedFiles = new Map<string, string>();

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === "common" || entry.name === excludedBoardId) continue;
    const kconfigPath = path.join(chipDirectory, entry.name, "Kconfig");
    if (!await pathExists(kconfigPath)) continue;
    const normalized = normalizeBoardKconfig(await readText(kconfigPath));
    const symbol = boardSymbolFromKconfig(normalized);
    if (!symbol) throw new Error(`${kconfigPath} does not define a board symbol.`);
    boards.push({ id: entry.name, symbol });
    normalizedFiles.set(kconfigPath, normalized);
  }

  boards.sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true, sensitivity: "base" }));
  return { boards, normalizedFiles };
}

function defaultBoardIdFromKconfig(source: string, boards: PinmuxBoardDescriptor[]): string {
  const defaultSymbol = /^\s*default\s+(BOARD_[A-Z0-9_]+)\b/m.exec(source)?.[1];
  const defaultBoard = boards.find(board => (board.symbol || boardConfigSymbol(board.id)) === defaultSymbol);
  if (defaultBoard) return defaultBoard.id;
  if (boards.length > 0) return boards[0].id;
  throw new Error("At least one existing board is required for chip Kconfig integration.");
}

export async function createPinmuxBoard(options: CreatePinmuxBoardOptions): Promise<CreatedPinmuxBoard> {
  const idError = validateBoardId(options.boardId);
  if (idError) throw new Error(idError);

  const sourceBoardDirectory = options.sourceBoardDirectory ? path.resolve(options.sourceBoardDirectory) : undefined;
  const chipDirectory = options.chipDirectory
    ? path.resolve(options.chipDirectory)
    : sourceBoardDirectory
      ? path.dirname(sourceBoardDirectory)
      : undefined;
  if (!chipDirectory) throw new Error("A chip directory is required when creating a blank board.");
  const boardDirectory = path.resolve(chipDirectory, options.boardId);
  if (path.dirname(boardDirectory) !== chipDirectory) throw new Error("The new board directory must stay inside the selected chip BSP.");
  if (await pathExists(boardDirectory)) throw new Error(`Board ${options.boardId} already exists.`);
  if (sourceBoardDirectory && !await pathExists(sourceBoardDirectory)) throw new Error(`Source board directory does not exist: ${sourceBoardDirectory}`);

  const chipCMakePath = path.join(chipDirectory, "CMakeLists.txt");
  const chipKconfigPath = path.join(chipDirectory, "Kconfig");
  const chipCMakeSource = await readText(chipCMakePath);
  const chipKconfigSource = await readText(chipKconfigPath);
  const { boards: existingBoards, normalizedFiles } = await boardDescriptors(chipDirectory, options.boardId);
  const boards = [...existingBoards, { id: options.boardId }];
  if (options.sourceBoardId && !boards.some(board => board.id === options.sourceBoardId)) {
    throw new Error(`Source board ${options.sourceBoardId} is not registered under ${options.chipId}.`);
  }
  const defaultBoardId = options.sourceBoardId
    || (existingBoards.length > 0 ? defaultBoardIdFromKconfig(chipKconfigSource, existingBoards) : options.boardId);
  const nextChipCMake = mergeChipCMakeLists(chipCMakeSource, boards);
  const nextChipKconfig = mergeChipKconfig(chipKconfigSource, options.chipId, boards, defaultBoardId);

  let boardCreated = false;
  try {
    if (sourceBoardDirectory) {
      await fs.promises.cp(sourceBoardDirectory, boardDirectory, {
        errorOnExist: true,
        filter: source => !source.endsWith(".imde.bak"),
        force: false,
        recursive: true,
      });
    } else {
      await fs.promises.mkdir(boardDirectory, { recursive: true });
    }
    boardCreated = true;

    const includeDirectory = path.join(boardDirectory, "include");
    await fs.promises.mkdir(includeDirectory, { recursive: true });
    await fs.promises.rm(path.join(includeDirectory, "board_pinmux.h"), { force: true });
    const generatedFiles = new Map<string, string>([
      [path.join(boardDirectory, "board_pinmux.c"), options.pinmuxSource],
      [path.join(includeDirectory, "board_pins.h"), options.boardPinsSource],
      [path.join(boardDirectory, "CMakeLists.txt"), generateBoardCMakeLists()],
      [path.join(boardDirectory, "Kconfig"), generateBoardKconfig(options.boardId)],
    ]);
    for (const [filePath, content] of generatedFiles) await fs.promises.writeFile(filePath, content, "utf8");

    const integrationWrites: PinmuxFileWriteRequest[] = [
      ...Array.from(normalizedFiles, ([filePath, source]) => ({ filePath, source })),
      { filePath: chipCMakePath, source: nextChipCMake },
      { filePath: chipKconfigPath, source: nextChipKconfig },
    ];
    const integrationResults = await writePinmuxFiles(integrationWrites);
    const updatedFiles: string[] = Array.from(generatedFiles.keys());
    integrationResults.forEach(result => {
      if (result.changed) updatedFiles.push(result.filePath);
    });

    return {
      boardDirectory,
      boardId: options.boardId,
      pinmuxFile: path.join(boardDirectory, "board_pinmux.c"),
      updatedFiles,
    };
  } catch (error) {
    if (boardCreated) {
      try {
        await fs.promises.rm(boardDirectory, { force: true, recursive: true });
      } catch (cleanupError) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`${message}; failed to remove incomplete board ${boardDirectory}: ${String(cleanupError)}`);
      }
    }
    throw error;
  }
}

export async function deletePinmuxBoard(options: DeletePinmuxBoardOptions): Promise<DeletedPinmuxBoard> {
  const idError = validateBoardId(options.boardId);
  if (idError) throw new Error(idError);

  const chipDirectory = path.resolve(options.chipDirectory);
  const boardDirectory = path.resolve(chipDirectory, options.boardId);
  if (path.dirname(boardDirectory) !== chipDirectory) throw new Error("The board directory must stay inside the selected chip BSP.");
  if (!await pathExists(boardDirectory)) throw new Error(`Board ${options.boardId} does not exist.`);

  const chipCMakePath = path.join(chipDirectory, "CMakeLists.txt");
  const chipKconfigPath = path.join(chipDirectory, "Kconfig");
  const chipCMakeSource = await readText(chipCMakePath);
  const chipKconfigSource = await readText(chipKconfigPath);
  const { boards, normalizedFiles } = await boardDescriptors(chipDirectory, options.boardId);
  const defaultBoardId = boards.length > 0
    ? defaultBoardIdFromKconfig(chipKconfigSource, boards)
    : undefined;
  const nextChipCMake = mergeChipCMakeLists(chipCMakeSource, boards);
  const nextChipKconfig = mergeChipKconfig(chipKconfigSource, options.chipId, boards, defaultBoardId);
  const originalIntegrationFiles: PinmuxFileWriteRequest[] = [];
  for (const filePath of normalizedFiles.keys()) {
    originalIntegrationFiles.push({ filePath, source: await readText(filePath) });
  }
  originalIntegrationFiles.push(
    { filePath: chipCMakePath, source: chipCMakeSource },
    { filePath: chipKconfigPath, source: chipKconfigSource },
  );
  const temporaryDirectory = `${boardDirectory}.imde-delete-${process.pid}-${Date.now()}`;
  let boardMoved = false;
  let integrationWritten = false;

  try {
    await fs.promises.rename(boardDirectory, temporaryDirectory);
    boardMoved = true;
    const integrationResults = await writePinmuxFiles([
      ...Array.from(normalizedFiles, ([filePath, source]) => ({ filePath, source })),
      { filePath: chipCMakePath, source: nextChipCMake },
      { filePath: chipKconfigPath, source: nextChipKconfig },
    ]);
    integrationWritten = true;
    await fs.promises.rm(temporaryDirectory, { force: true, recursive: true });
    boardMoved = false;
    return {
      boardDirectory,
      boardId: options.boardId,
      updatedFiles: integrationResults.filter(result => result.changed).map(result => result.filePath),
    };
  } catch (error) {
    const rollbackErrors: string[] = [];
    if (integrationWritten) {
      try {
        await writePinmuxFiles(originalIntegrationFiles);
      } catch (rollbackError) {
        rollbackErrors.push(`integration files: ${String(rollbackError)}`);
      }
    }
    if (boardMoved && await pathExists(temporaryDirectory)) {
      try {
        await fs.promises.rename(temporaryDirectory, boardDirectory);
      } catch (rollbackError) {
        rollbackErrors.push(`board directory: ${String(rollbackError)}`);
      }
    }
    const message = error instanceof Error ? error.message : String(error);
    if (rollbackErrors.length > 0) throw new Error(`${message}; BSP deletion rollback failed: ${rollbackErrors.join("; ")}`);
    throw error;
  }
}
