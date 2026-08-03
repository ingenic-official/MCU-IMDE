export interface PinmuxBoardDescriptor {
  id: string;
  symbol?: string;
}

function titleFromId(value: string): string {
  return value
    .split(/[_-]+/)
    .filter(Boolean)
    .map(part => part.toUpperCase())
    .join(" ");
}

export function boardConfigSymbol(boardId: string): string {
  const normalized = boardId.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  if (!normalized) throw new Error("Board id does not produce a valid Kconfig symbol.");
  return `BOARD_${normalized}`;
}

export function generateBoardCMakeLists(): string {
  return `target_include_directories(\${SDK_FIRMWARE_TARGET} PRIVATE
    "\${CMAKE_CURRENT_LIST_DIR}/include")

if(CONFIG_BSP_PINMUX)
    target_sources(\${SDK_FIRMWARE_TARGET} PRIVATE
        "\${CMAKE_CURRENT_LIST_DIR}/board_pinmux.c")
endif()
`;
}

export function generateBoardKconfig(boardId: string): string {
  const symbol = boardConfigSymbol(boardId);
  return `config ${symbol}
    bool "${titleFromId(boardId)} board"
    select BSP_PINMUX if DRIVER_GPIO
    help
      Build board support code for ${titleFromId(boardId)}.
`;
}

export function normalizeBoardKconfig(source: string): string {
  const newline = source.includes("\r\n") ? "\r\n" : "\n";
  const normalized = source.replace(/\r\n/g, "\n")
    .replace(/^\s*choice\s*\r?\n/gm, "")
    .replace(/^\s*endchoice\s*\r?\n?/gm, "")
    .replace(/^\s*prompt\s+"[^"]*"\s*\r?\n/gm, "")
    .replace(/^\s*default\s+BOARD_[A-Z0-9_]+\s*\r?\n/gm, "")
    .trim();
  if (!/^config\s+BOARD_[A-Z0-9_]+\b/m.test(normalized)) {
    throw new Error("Board Kconfig does not define a BOARD_* symbol.");
  }
  if (!/^\s*select\s+BSP_PINMUX\b/m.test(normalized)) {
    const withCapability = normalized.replace(/^(\s*bool[^\r\n]*)(?=\r?$)/m, "$1\n    select BSP_PINMUX if DRIVER_GPIO");
    return `${withCapability.replace(/\n/g, newline)}${newline}`;
  }
  return `${normalized.replace(/\n/g, newline)}${newline}`;
}

export function boardSymbolFromKconfig(source: string): string | undefined {
  return /^\s*config\s+(BOARD_[A-Z0-9_]+)\b/m.exec(source)?.[1];
}

function normalizedBoards(boards: PinmuxBoardDescriptor[]): Required<PinmuxBoardDescriptor>[] {
  const ids = new Set<string>();
  return boards
    .map(board => ({ id: board.id, symbol: board.symbol || boardConfigSymbol(board.id) }))
    .sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true, sensitivity: "base" }))
    .filter(board => {
      if (ids.has(board.id)) return false;
      ids.add(board.id);
      return true;
    });
}

export function generateChipCMakeLists(boards: PinmuxBoardDescriptor[]): string {
  const entries = normalizedBoards(boards);
  if (entries.length === 0) throw new Error("At least one board is required for chip CMake integration.");
  return `${entries.map(board => `if(CONFIG_${board.symbol})
    include("\${CMAKE_CURRENT_LIST_DIR}/${board.id}/CMakeLists.txt")
endif()`).join("\n\n")}\n`;
}

export function generateChipKconfig(chipId: string, boards: PinmuxBoardDescriptor[], defaultBoardId: string): string {
  const entries = normalizedBoards(boards);
  if (entries.length === 0) throw new Error("At least one board is required for chip Kconfig integration.");
  const defaultBoard = entries.find(board => board.id === defaultBoardId);
  if (!defaultBoard) throw new Error(`Default board ${defaultBoardId} is not part of ${chipId}.`);
  return `choice
    prompt "${titleFromId(chipId)} board"
    default ${defaultBoard.symbol}

${entries.map(board => `source "code/bsp/${chipId}/${board.id}/Kconfig"`).join("\n")}

endchoice
`;
}

function replaceManagedSection(source: string, startMarker: string, endMarker: string, content: string): string | undefined {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker);
  if (start < 0 && end < 0) return undefined;
  if (start < 0 || end < start) throw new Error(`Malformed managed section: ${startMarker}.`);
  const before = source.slice(0, start).trimEnd();
  const after = source.slice(end + endMarker.length).trimStart();
  return `${before}${before ? "\n\n" : ""}${startMarker}\n${content.trim()}\n${endMarker}${after ? `\n\n${after}` : ""}\n`;
}

function removeManagedSection(source: string, startMarker: string, endMarker: string): string | undefined {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker);
  if (start < 0 && end < 0) return undefined;
  if (start < 0 || end < start) throw new Error(`Malformed managed section: ${startMarker}.`);
  const before = source.slice(0, start).trimEnd();
  const after = source.slice(end + endMarker.length).trimStart();
  const merged = `${before}${before && after ? "\n\n" : ""}${after}`;
  return merged ? `${merged}\n` : "";
}

export function mergeChipCMakeLists(source: string, boards: PinmuxBoardDescriptor[]): string {
  const startMarker = "# IMDE PINMUX BOARDS BEGIN";
  const endMarker = "# IMDE PINMUX BOARDS END";
  const legacyBoardBlock = /(?:^|\r?\n)\s*if\s*\(\s*CONFIG_BOARD_[A-Z0-9_]+\s*\)\s*\r?\n\s*include\s*\(\s*"\$\{CMAKE_CURRENT_LIST_DIR\}\/[^"\r\n]+\/CMakeLists\.txt"\s*\)\s*\r?\n\s*endif\s*\(\s*\)\s*(?=\r?\n|$)/g;
  if (boards.length === 0) {
    const removed = removeManagedSection(source, startMarker, endMarker);
    if (removed !== undefined) return removed;
    const preserved = source.replace(legacyBoardBlock, "\n").trim();
    return preserved ? `${preserved}\n` : "";
  }
  const generated = generateChipCMakeLists(boards);
  const replaced = replaceManagedSection(source, startMarker, endMarker, generated);
  if (replaced !== undefined) return replaced;

  const preserved = source.replace(legacyBoardBlock, "\n").trim();
  return `${preserved}${preserved ? "\n\n" : ""}${startMarker}\n${generated.trim()}\n${endMarker}\n`;
}

export function mergeChipKconfig(source: string, chipId: string, boards: PinmuxBoardDescriptor[], defaultBoardId?: string): string {
  const startMarker = "# IMDE PINMUX BOARDS BEGIN";
  const endMarker = "# IMDE PINMUX BOARDS END";
  const escapedChip = chipId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const legacySource = new RegExp(`^\\s*source\\s+"code/bsp/${escapedChip}/[^"\\r\\n]+/Kconfig"\\s*\\r?\\n?`, "gm");
  if (boards.length === 0) {
    const removed = removeManagedSection(source, startMarker, endMarker);
    if (removed !== undefined) return removed;
    const preserved = source.replace(legacySource, "").trim();
    return preserved ? `${preserved}\n` : "";
  }
  if (!defaultBoardId) throw new Error(`A default board is required for ${chipId}.`);
  const generated = generateChipKconfig(chipId, boards, defaultBoardId);
  const replaced = replaceManagedSection(source, startMarker, endMarker, generated);
  if (replaced !== undefined) return replaced;

  const preserved = source.replace(legacySource, "").trim();
  return `${preserved}${preserved ? "\n\n" : ""}${startMarker}\n${generated.trim()}\n${endMarker}\n`;
}
