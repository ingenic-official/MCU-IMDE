"use strict";
exports.id = "src_pinmux_boardWorkspace_ts";
exports.ids = ["src_pinmux_boardWorkspace_ts"];
exports.modules = {

/***/ "./src/pinmux/boardFiles.ts"
/*!**********************************!*\
  !*** ./src/pinmux/boardFiles.ts ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   boardConfigSymbol: () => (/* binding */ boardConfigSymbol),
/* harmony export */   boardSymbolFromKconfig: () => (/* binding */ boardSymbolFromKconfig),
/* harmony export */   generateBoardCMakeLists: () => (/* binding */ generateBoardCMakeLists),
/* harmony export */   generateBoardKconfig: () => (/* binding */ generateBoardKconfig),
/* harmony export */   generateChipCMakeLists: () => (/* binding */ generateChipCMakeLists),
/* harmony export */   generateChipKconfig: () => (/* binding */ generateChipKconfig),
/* harmony export */   mergeChipCMakeLists: () => (/* binding */ mergeChipCMakeLists),
/* harmony export */   mergeChipKconfig: () => (/* binding */ mergeChipKconfig),
/* harmony export */   normalizeBoardKconfig: () => (/* binding */ normalizeBoardKconfig)
/* harmony export */ });
function titleFromId(value) {
    return value
        .split(/[_-]+/)
        .filter(Boolean)
        .map(part => part.toUpperCase())
        .join(" ");
}
function boardConfigSymbol(boardId) {
    const normalized = boardId.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    if (!normalized)
        throw new Error("Board id does not produce a valid Kconfig symbol.");
    return `BOARD_${normalized}`;
}
function generateBoardCMakeLists() {
    return `target_include_directories(\${SDK_FIRMWARE_TARGET} PRIVATE
    "\${CMAKE_CURRENT_LIST_DIR}/include")

if(CONFIG_BSP_PINMUX)
    target_sources(\${SDK_FIRMWARE_TARGET} PRIVATE
        "\${CMAKE_CURRENT_LIST_DIR}/board_pinmux.c")
endif()
`;
}
function generateBoardKconfig(boardId) {
    const symbol = boardConfigSymbol(boardId);
    return `config ${symbol}
    bool "${titleFromId(boardId)} board"
    select BSP_PINMUX if DRIVER_GPIO
    help
      Build board support code for ${titleFromId(boardId)}.
`;
}
function normalizeBoardKconfig(source) {
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
function boardSymbolFromKconfig(source) {
    return /^\s*config\s+(BOARD_[A-Z0-9_]+)\b/m.exec(source)?.[1];
}
function normalizedBoards(boards) {
    const ids = new Set();
    return boards
        .map(board => ({ id: board.id, symbol: board.symbol || boardConfigSymbol(board.id) }))
        .sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true, sensitivity: "base" }))
        .filter(board => {
        if (ids.has(board.id))
            return false;
        ids.add(board.id);
        return true;
    });
}
function generateChipCMakeLists(boards) {
    const entries = normalizedBoards(boards);
    if (entries.length === 0)
        throw new Error("At least one board is required for chip CMake integration.");
    return `${entries.map(board => `if(CONFIG_${board.symbol})
    include("\${CMAKE_CURRENT_LIST_DIR}/${board.id}/CMakeLists.txt")
endif()`).join("\n\n")}\n`;
}
function generateChipKconfig(chipId, boards, defaultBoardId) {
    const entries = normalizedBoards(boards);
    if (entries.length === 0)
        throw new Error("At least one board is required for chip Kconfig integration.");
    const defaultBoard = entries.find(board => board.id === defaultBoardId);
    if (!defaultBoard)
        throw new Error(`Default board ${defaultBoardId} is not part of ${chipId}.`);
    return `choice
    prompt "${titleFromId(chipId)} board"
    default ${defaultBoard.symbol}

${entries.map(board => `source "code/bsp/${chipId}/${board.id}/Kconfig"`).join("\n")}

endchoice
`;
}
function replaceManagedSection(source, startMarker, endMarker, content) {
    const start = source.indexOf(startMarker);
    const end = source.indexOf(endMarker);
    if (start < 0 && end < 0)
        return undefined;
    if (start < 0 || end < start)
        throw new Error(`Malformed managed section: ${startMarker}.`);
    const before = source.slice(0, start).trimEnd();
    const after = source.slice(end + endMarker.length).trimStart();
    return `${before}${before ? "\n\n" : ""}${startMarker}\n${content.trim()}\n${endMarker}${after ? `\n\n${after}` : ""}\n`;
}
function removeManagedSection(source, startMarker, endMarker) {
    const start = source.indexOf(startMarker);
    const end = source.indexOf(endMarker);
    if (start < 0 && end < 0)
        return undefined;
    if (start < 0 || end < start)
        throw new Error(`Malformed managed section: ${startMarker}.`);
    const before = source.slice(0, start).trimEnd();
    const after = source.slice(end + endMarker.length).trimStart();
    const merged = `${before}${before && after ? "\n\n" : ""}${after}`;
    return merged ? `${merged}\n` : "";
}
function mergeChipCMakeLists(source, boards) {
    const startMarker = "# IMDE PINMUX BOARDS BEGIN";
    const endMarker = "# IMDE PINMUX BOARDS END";
    const legacyBoardBlock = /(?:^|\r?\n)\s*if\s*\(\s*CONFIG_BOARD_[A-Z0-9_]+\s*\)\s*\r?\n\s*include\s*\(\s*"\$\{CMAKE_CURRENT_LIST_DIR\}\/[^"\r\n]+\/CMakeLists\.txt"\s*\)\s*\r?\n\s*endif\s*\(\s*\)\s*(?=\r?\n|$)/g;
    if (boards.length === 0) {
        const removed = removeManagedSection(source, startMarker, endMarker);
        if (removed !== undefined)
            return removed;
        const preserved = source.replace(legacyBoardBlock, "\n").trim();
        return preserved ? `${preserved}\n` : "";
    }
    const generated = generateChipCMakeLists(boards);
    const replaced = replaceManagedSection(source, startMarker, endMarker, generated);
    if (replaced !== undefined)
        return replaced;
    const preserved = source.replace(legacyBoardBlock, "\n").trim();
    return `${preserved}${preserved ? "\n\n" : ""}${startMarker}\n${generated.trim()}\n${endMarker}\n`;
}
function mergeChipKconfig(source, chipId, boards, defaultBoardId) {
    const startMarker = "# IMDE PINMUX BOARDS BEGIN";
    const endMarker = "# IMDE PINMUX BOARDS END";
    const escapedChip = chipId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const legacySource = new RegExp(`^\\s*source\\s+"code/bsp/${escapedChip}/[^"\\r\\n]+/Kconfig"\\s*\\r?\\n?`, "gm");
    if (boards.length === 0) {
        const removed = removeManagedSection(source, startMarker, endMarker);
        if (removed !== undefined)
            return removed;
        const preserved = source.replace(legacySource, "").trim();
        return preserved ? `${preserved}\n` : "";
    }
    if (!defaultBoardId)
        throw new Error(`A default board is required for ${chipId}.`);
    const generated = generateChipKconfig(chipId, boards, defaultBoardId);
    const replaced = replaceManagedSection(source, startMarker, endMarker, generated);
    if (replaced !== undefined)
        return replaced;
    const preserved = source.replace(legacySource, "").trim();
    return `${preserved}${preserved ? "\n\n" : ""}${startMarker}\n${generated.trim()}\n${endMarker}\n`;
}


/***/ },

/***/ "./src/pinmux/boardWorkspace.ts"
/*!**************************************!*\
  !*** ./src/pinmux/boardWorkspace.ts ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createPinmuxBoard: () => (/* binding */ createPinmuxBoard),
/* harmony export */   deletePinmuxBoard: () => (/* binding */ deletePinmuxBoard),
/* harmony export */   validateBoardId: () => (/* binding */ validateBoardId),
/* harmony export */   writePinmuxFile: () => (/* binding */ writePinmuxFile),
/* harmony export */   writePinmuxFiles: () => (/* binding */ writePinmuxFiles)
/* harmony export */ });
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _boardFiles__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./boardFiles */ "./src/pinmux/boardFiles.ts");



async function pathExists(filePath) {
    try {
        await fs__WEBPACK_IMPORTED_MODULE_0__.promises.access(filePath);
        return true;
    }
    catch (error) {
        if (error.code === "ENOENT")
            return false;
        throw error;
    }
}
async function readText(filePath) {
    return fs__WEBPACK_IMPORTED_MODULE_0__.promises.readFile(filePath, "utf8");
}
async function readOptionalText(filePath) {
    try {
        return await readText(filePath);
    }
    catch (error) {
        if (error.code === "ENOENT")
            return undefined;
        throw error;
    }
}
async function restoreText(filePath, source) {
    if (source === undefined) {
        await fs__WEBPACK_IMPORTED_MODULE_0__.promises.rm(filePath, { force: true });
        return;
    }
    await fs__WEBPACK_IMPORTED_MODULE_0__.promises.mkdir(path__WEBPACK_IMPORTED_MODULE_1__.dirname(filePath), { recursive: true });
    await fs__WEBPACK_IMPORTED_MODULE_0__.promises.writeFile(filePath, source, "utf8");
}
function validateBoardId(boardId) {
    if (!/^[a-z0-9][a-z0-9_]*$/.test(boardId))
        return "Use lowercase letters, digits, and underscores; start with a letter or digit.";
    if (boardId === "common")
        return "The board id 'common' is reserved.";
    return undefined;
}
async function writePinmuxFiles(requests) {
    const normalizedPaths = new Set();
    const entries = [];
    for (const request of requests) {
        const filePath = path__WEBPACK_IMPORTED_MODULE_1__.resolve(request.filePath);
        const pathKey = filePath.toLowerCase();
        if (normalizedPaths.has(pathKey))
            throw new Error(`Duplicate Pinmux output path: ${filePath}.`);
        normalizedPaths.add(pathKey);
        const current = await readOptionalText(filePath);
        entries.push({ request, filePath, current, changed: current !== request.source });
    }
    const changedEntries = entries.filter(entry => entry.changed);
    if (changedEntries.length === 0)
        return entries.map(entry => ({ changed: false, filePath: entry.filePath }));
    try {
        for (const [index, entry] of changedEntries.entries()) {
            await fs__WEBPACK_IMPORTED_MODULE_0__.promises.mkdir(path__WEBPACK_IMPORTED_MODULE_1__.dirname(entry.filePath), { recursive: true });
            entry.temporaryPath = `${entry.filePath}.imde.tmp-${process.pid}-${Date.now()}-${index}`;
            await fs__WEBPACK_IMPORTED_MODULE_0__.promises.writeFile(entry.temporaryPath, entry.request.source, "utf8");
        }
        for (const entry of changedEntries) {
            await fs__WEBPACK_IMPORTED_MODULE_0__.promises.writeFile(entry.filePath, entry.request.source, "utf8");
        }
    }
    catch (error) {
        const rollbackErrors = [];
        for (const entry of changedEntries) {
            try {
                await restoreText(entry.filePath, entry.current);
            }
            catch (rollbackError) {
                rollbackErrors.push(`${entry.filePath}: ${String(rollbackError)}`);
            }
        }
        const message = error instanceof Error ? error.message : String(error);
        if (rollbackErrors.length > 0)
            throw new Error(`${message}; Pinmux rollback failed: ${rollbackErrors.join("; ")}`);
        throw error;
    }
    finally {
        await Promise.all(changedEntries.filter(entry => entry.temporaryPath).map(entry => fs__WEBPACK_IMPORTED_MODULE_0__.promises.rm(entry.temporaryPath, { force: true })));
    }
    return entries.map(entry => ({
        changed: entry.changed,
        filePath: entry.filePath,
    }));
}
async function writePinmuxFile(filePath, source) {
    return (await writePinmuxFiles([{ filePath, source }]))[0];
}
async function boardDescriptors(chipDirectory, excludedBoardId) {
    const entries = await fs__WEBPACK_IMPORTED_MODULE_0__.promises.readdir(chipDirectory, { withFileTypes: true });
    const boards = [];
    const normalizedFiles = new Map();
    for (const entry of entries) {
        if (!entry.isDirectory() || entry.name === "common" || entry.name === excludedBoardId)
            continue;
        const kconfigPath = path__WEBPACK_IMPORTED_MODULE_1__.join(chipDirectory, entry.name, "Kconfig");
        if (!await pathExists(kconfigPath))
            continue;
        const normalized = (0,_boardFiles__WEBPACK_IMPORTED_MODULE_2__.normalizeBoardKconfig)(await readText(kconfigPath));
        const symbol = (0,_boardFiles__WEBPACK_IMPORTED_MODULE_2__.boardSymbolFromKconfig)(normalized);
        if (!symbol)
            throw new Error(`${kconfigPath} does not define a board symbol.`);
        boards.push({ id: entry.name, symbol });
        normalizedFiles.set(kconfigPath, normalized);
    }
    boards.sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true, sensitivity: "base" }));
    return { boards, normalizedFiles };
}
function defaultBoardIdFromKconfig(source, boards) {
    const defaultSymbol = /^\s*default\s+(BOARD_[A-Z0-9_]+)\b/m.exec(source)?.[1];
    const defaultBoard = boards.find(board => (board.symbol || (0,_boardFiles__WEBPACK_IMPORTED_MODULE_2__.boardConfigSymbol)(board.id)) === defaultSymbol);
    if (defaultBoard)
        return defaultBoard.id;
    if (boards.length > 0)
        return boards[0].id;
    throw new Error("At least one existing board is required for chip Kconfig integration.");
}
async function createPinmuxBoard(options) {
    const idError = validateBoardId(options.boardId);
    if (idError)
        throw new Error(idError);
    const sourceBoardDirectory = options.sourceBoardDirectory ? path__WEBPACK_IMPORTED_MODULE_1__.resolve(options.sourceBoardDirectory) : undefined;
    const chipDirectory = options.chipDirectory
        ? path__WEBPACK_IMPORTED_MODULE_1__.resolve(options.chipDirectory)
        : sourceBoardDirectory
            ? path__WEBPACK_IMPORTED_MODULE_1__.dirname(sourceBoardDirectory)
            : undefined;
    if (!chipDirectory)
        throw new Error("A chip directory is required when creating a blank board.");
    const boardDirectory = path__WEBPACK_IMPORTED_MODULE_1__.resolve(chipDirectory, options.boardId);
    if (path__WEBPACK_IMPORTED_MODULE_1__.dirname(boardDirectory) !== chipDirectory)
        throw new Error("The new board directory must stay inside the selected chip BSP.");
    if (await pathExists(boardDirectory))
        throw new Error(`Board ${options.boardId} already exists.`);
    if (sourceBoardDirectory && !await pathExists(sourceBoardDirectory))
        throw new Error(`Source board directory does not exist: ${sourceBoardDirectory}`);
    const chipCMakePath = path__WEBPACK_IMPORTED_MODULE_1__.join(chipDirectory, "CMakeLists.txt");
    const chipKconfigPath = path__WEBPACK_IMPORTED_MODULE_1__.join(chipDirectory, "Kconfig");
    const chipCMakeSource = await readText(chipCMakePath);
    const chipKconfigSource = await readText(chipKconfigPath);
    const { boards: existingBoards, normalizedFiles } = await boardDescriptors(chipDirectory, options.boardId);
    const boards = [...existingBoards, { id: options.boardId }];
    if (options.sourceBoardId && !boards.some(board => board.id === options.sourceBoardId)) {
        throw new Error(`Source board ${options.sourceBoardId} is not registered under ${options.chipId}.`);
    }
    const defaultBoardId = options.sourceBoardId
        || (existingBoards.length > 0 ? defaultBoardIdFromKconfig(chipKconfigSource, existingBoards) : options.boardId);
    const nextChipCMake = (0,_boardFiles__WEBPACK_IMPORTED_MODULE_2__.mergeChipCMakeLists)(chipCMakeSource, boards);
    const nextChipKconfig = (0,_boardFiles__WEBPACK_IMPORTED_MODULE_2__.mergeChipKconfig)(chipKconfigSource, options.chipId, boards, defaultBoardId);
    let boardCreated = false;
    try {
        if (sourceBoardDirectory) {
            await fs__WEBPACK_IMPORTED_MODULE_0__.promises.cp(sourceBoardDirectory, boardDirectory, {
                errorOnExist: true,
                filter: source => !source.endsWith(".imde.bak"),
                force: false,
                recursive: true,
            });
        }
        else {
            await fs__WEBPACK_IMPORTED_MODULE_0__.promises.mkdir(boardDirectory, { recursive: true });
        }
        boardCreated = true;
        const includeDirectory = path__WEBPACK_IMPORTED_MODULE_1__.join(boardDirectory, "include");
        await fs__WEBPACK_IMPORTED_MODULE_0__.promises.mkdir(includeDirectory, { recursive: true });
        await fs__WEBPACK_IMPORTED_MODULE_0__.promises.rm(path__WEBPACK_IMPORTED_MODULE_1__.join(includeDirectory, "board_pinmux.h"), { force: true });
        const generatedFiles = new Map([
            [path__WEBPACK_IMPORTED_MODULE_1__.join(boardDirectory, "board_pinmux.c"), options.pinmuxSource],
            [path__WEBPACK_IMPORTED_MODULE_1__.join(includeDirectory, "board_pins.h"), options.boardPinsSource],
            [path__WEBPACK_IMPORTED_MODULE_1__.join(boardDirectory, "CMakeLists.txt"), (0,_boardFiles__WEBPACK_IMPORTED_MODULE_2__.generateBoardCMakeLists)()],
            [path__WEBPACK_IMPORTED_MODULE_1__.join(boardDirectory, "Kconfig"), (0,_boardFiles__WEBPACK_IMPORTED_MODULE_2__.generateBoardKconfig)(options.boardId)],
        ]);
        for (const [filePath, content] of generatedFiles)
            await fs__WEBPACK_IMPORTED_MODULE_0__.promises.writeFile(filePath, content, "utf8");
        const integrationWrites = [
            ...Array.from(normalizedFiles, ([filePath, source]) => ({ filePath, source })),
            { filePath: chipCMakePath, source: nextChipCMake },
            { filePath: chipKconfigPath, source: nextChipKconfig },
        ];
        const integrationResults = await writePinmuxFiles(integrationWrites);
        const updatedFiles = Array.from(generatedFiles.keys());
        integrationResults.forEach(result => {
            if (result.changed)
                updatedFiles.push(result.filePath);
        });
        return {
            boardDirectory,
            boardId: options.boardId,
            pinmuxFile: path__WEBPACK_IMPORTED_MODULE_1__.join(boardDirectory, "board_pinmux.c"),
            updatedFiles,
        };
    }
    catch (error) {
        if (boardCreated) {
            try {
                await fs__WEBPACK_IMPORTED_MODULE_0__.promises.rm(boardDirectory, { force: true, recursive: true });
            }
            catch (cleanupError) {
                const message = error instanceof Error ? error.message : String(error);
                throw new Error(`${message}; failed to remove incomplete board ${boardDirectory}: ${String(cleanupError)}`);
            }
        }
        throw error;
    }
}
async function deletePinmuxBoard(options) {
    const idError = validateBoardId(options.boardId);
    if (idError)
        throw new Error(idError);
    const chipDirectory = path__WEBPACK_IMPORTED_MODULE_1__.resolve(options.chipDirectory);
    const boardDirectory = path__WEBPACK_IMPORTED_MODULE_1__.resolve(chipDirectory, options.boardId);
    if (path__WEBPACK_IMPORTED_MODULE_1__.dirname(boardDirectory) !== chipDirectory)
        throw new Error("The board directory must stay inside the selected chip BSP.");
    if (!await pathExists(boardDirectory))
        throw new Error(`Board ${options.boardId} does not exist.`);
    const chipCMakePath = path__WEBPACK_IMPORTED_MODULE_1__.join(chipDirectory, "CMakeLists.txt");
    const chipKconfigPath = path__WEBPACK_IMPORTED_MODULE_1__.join(chipDirectory, "Kconfig");
    const chipCMakeSource = await readText(chipCMakePath);
    const chipKconfigSource = await readText(chipKconfigPath);
    const { boards, normalizedFiles } = await boardDescriptors(chipDirectory, options.boardId);
    const defaultBoardId = boards.length > 0
        ? defaultBoardIdFromKconfig(chipKconfigSource, boards)
        : undefined;
    const nextChipCMake = (0,_boardFiles__WEBPACK_IMPORTED_MODULE_2__.mergeChipCMakeLists)(chipCMakeSource, boards);
    const nextChipKconfig = (0,_boardFiles__WEBPACK_IMPORTED_MODULE_2__.mergeChipKconfig)(chipKconfigSource, options.chipId, boards, defaultBoardId);
    const originalIntegrationFiles = [];
    for (const filePath of normalizedFiles.keys()) {
        originalIntegrationFiles.push({ filePath, source: await readText(filePath) });
    }
    originalIntegrationFiles.push({ filePath: chipCMakePath, source: chipCMakeSource }, { filePath: chipKconfigPath, source: chipKconfigSource });
    const temporaryDirectory = `${boardDirectory}.imde-delete-${process.pid}-${Date.now()}`;
    let boardMoved = false;
    let integrationWritten = false;
    try {
        await fs__WEBPACK_IMPORTED_MODULE_0__.promises.rename(boardDirectory, temporaryDirectory);
        boardMoved = true;
        const integrationResults = await writePinmuxFiles([
            ...Array.from(normalizedFiles, ([filePath, source]) => ({ filePath, source })),
            { filePath: chipCMakePath, source: nextChipCMake },
            { filePath: chipKconfigPath, source: nextChipKconfig },
        ]);
        integrationWritten = true;
        await fs__WEBPACK_IMPORTED_MODULE_0__.promises.rm(temporaryDirectory, { force: true, recursive: true });
        boardMoved = false;
        return {
            boardDirectory,
            boardId: options.boardId,
            updatedFiles: integrationResults.filter(result => result.changed).map(result => result.filePath),
        };
    }
    catch (error) {
        const rollbackErrors = [];
        if (integrationWritten) {
            try {
                await writePinmuxFiles(originalIntegrationFiles);
            }
            catch (rollbackError) {
                rollbackErrors.push(`integration files: ${String(rollbackError)}`);
            }
        }
        if (boardMoved && await pathExists(temporaryDirectory)) {
            try {
                await fs__WEBPACK_IMPORTED_MODULE_0__.promises.rename(temporaryDirectory, boardDirectory);
            }
            catch (rollbackError) {
                rollbackErrors.push(`board directory: ${String(rollbackError)}`);
            }
        }
        const message = error instanceof Error ? error.message : String(error);
        if (rollbackErrors.length > 0)
            throw new Error(`${message}; BSP deletion rollback failed: ${rollbackErrors.join("; ")}`);
        throw error;
    }
}


/***/ }

};
;
//# sourceMappingURL=src_pinmux_boardWorkspace_ts.js.map