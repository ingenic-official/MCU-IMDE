"use strict";
exports.id = "src_pinmux_boardParser_ts";
exports.ids = ["src_pinmux_boardParser_ts"];
exports.modules = {

/***/ "./src/pinmux/boardGenerator.ts"
/*!**************************************!*\
  !*** ./src/pinmux/boardGenerator.ts ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   boardSignalMacro: () => (/* binding */ boardSignalMacro),
/* harmony export */   generateBoardPinmuxSource: () => (/* binding */ generateBoardPinmuxSource),
/* harmony export */   generateBoardPinsHeader: () => (/* binding */ generateBoardPinsHeader)
/* harmony export */ });
function requirePin(definition, pinId) {
    const pin = definition.pins.find(candidate => candidate.id === pinId);
    if (!pin)
        throw new Error(`${pinId} is not present in ${definition.package.id}.`);
    return pin;
}
function pinLocation(pinId) {
    const match = /^P([A-Z])(\d+)$/.exec(pinId);
    if (!match)
        throw new Error(`Invalid logical pin id: ${pinId}.`);
    return { port: match[1], index: Number(match[2]) };
}
function boardSignalMacro(owner) {
    const normalized = owner.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    if (!normalized)
        throw new Error("GPIO owner does not produce a valid board signal name.");
    return normalized.startsWith("BOARD_") ? normalized : `BOARD_${normalized}`;
}
function activeLevel(configuration) {
    if (configuration.activeLevel === "low" || configuration.activeLevel === "high") {
        return configuration.activeLevel;
    }
    return configuration.gpioMode === "output-high" ? "high" : "low";
}
function functionMode(configuration, signal) {
    if (!Number.isInteger(configuration.mux) || configuration.mux < 0 || configuration.mux > 3) {
        throw new Error(`${signal} has an invalid FUNC value.`);
    }
    return `IM_GPIO_FUNCTION_${configuration.mux}`;
}
function gpioMode(configuration) {
    switch (configuration.gpioMode) {
        case "input": return "IM_GPIO_FUNCTION_INPUT";
        case "output-low": return "IM_GPIO_FUNCTION_OUTPUT_LOW";
        case "output-high": return "IM_GPIO_FUNCTION_OUTPUT_HIGH";
        default: throw new Error("GPIO configuration is missing a mode.");
    }
}
function driveStrength(value) {
    const normalized = String(value);
    if (!/^\d+$/.test(normalized) || Number(normalized) <= 0)
        throw new Error(`Invalid GPIO drive strength: ${value}.`);
    return `IM_GPIO_DRIVE_STRENGTH_${normalized}MA`;
}
function macroFor(configuration, definition) {
    if (configuration.kind !== "function" && configuration.kind !== "gpio")
        throw new Error("Pinmux configuration has an invalid kind.");
    if (!configuration.pinId || typeof configuration.pinId !== "string")
        throw new Error("Pinmux configuration is missing a pin id.");
    if (configuration.owner !== undefined && typeof configuration.owner !== "string")
        throw new Error(`${configuration.pinId} has an invalid owner.`);
    if (configuration.pull !== "none" && configuration.pull !== "up" && configuration.pull !== "down")
        throw new Error(`${configuration.pinId} has an invalid pull setting.`);
    if (configuration.speed !== "low" && configuration.speed !== "high")
        throw new Error(`${configuration.pinId} has an invalid speed setting.`);
    if (typeof configuration.schmitt !== "boolean")
        throw new Error(`${configuration.pinId} has an invalid Schmitt setting.`);
    const pin = requirePin(definition, configuration.pinId);
    const location = pinLocation(pin.id);
    const selectedFunction = configuration.kind === "function"
        ? pin.functions.find(candidate => candidate.mux === configuration.mux)
        : undefined;
    if (configuration.kind === "function" && !selectedFunction) {
        throw new Error(`${pin.id} does not support FUNC${configuration.mux}.`);
    }
    const explicitOwner = configuration.owner?.trim();
    if (configuration.kind === "gpio" && !explicitOwner)
        throw new Error(`${pin.id} GPIO owner is required.`);
    if (configuration.kind === "function" && explicitOwner && definition.signals[explicitOwner] && explicitOwner !== selectedFunction.signal) {
        throw new Error(`${pin.id} owner ${explicitOwner} does not match ${selectedFunction.signal}.`);
    }
    const owner = explicitOwner || selectedFunction.signal;
    const ownerLiteral = JSON.stringify(owner);
    const mode = configuration.kind === "function"
        ? functionMode(configuration, selectedFunction.signal)
        : gpioMode(configuration);
    const pull = `IM_GPIO_PULL_${configuration.pull.toUpperCase()}`;
    const speed = `IM_GPIO_SLEW_${configuration.speed.toUpperCase()}`;
    const drive = driveStrength(configuration.driveMa);
    return [
        `    IM_GPIO_PINMUX_CONFIG(${ownerLiteral},`,
        `                           IM_GPIO_PORT_${location.port},`,
        `                           ${location.index}U,`,
        `                           ${mode},`,
        `                           ${pull},`,
        `                           ${speed},`,
        `                           ${drive},`,
        `                           ${configuration.schmitt ? "true" : "false"}),`,
    ].join("\n");
}
function generateBoardPinmuxSource(definition, chipId, boardId, configurations, options = {}) {
    const ordered = configurations.slice().sort((left, right) => left.pinId.localeCompare(right.pinId, undefined, { numeric: true }));
    if (ordered.length === 0 && !options.allowEmpty)
        throw new Error("Configure at least one pin before generating the BSP.");
    const duplicatePins = new Set();
    const signalPins = new Map();
    const ownerPins = new Map();
    for (const configuration of ordered) {
        if (duplicatePins.has(configuration.pinId))
            throw new Error(`${configuration.pinId} is configured more than once.`);
        duplicatePins.add(configuration.pinId);
        let selectedFunction;
        if (configuration.kind === "function") {
            const pin = requirePin(definition, configuration.pinId);
            selectedFunction = pin.functions.find(candidate => candidate.mux === configuration.mux);
            if (!selectedFunction)
                throw new Error(`${pin.id} does not support FUNC${configuration.mux}.`);
            const previousPin = signalPins.get(selectedFunction.signal);
            if (previousPin)
                throw new Error(`${selectedFunction.signal} is assigned to both ${previousPin} and ${pin.id}.`);
            signalPins.set(selectedFunction.signal, pin.id);
        }
        const owner = configuration.owner?.trim() || selectedFunction?.signal;
        if (owner) {
            const ownerKey = boardSignalMacro(owner);
            const previousPin = ownerPins.get(ownerKey);
            if (previousPin)
                throw new Error(`${ownerKey} owner is assigned to both ${previousPin} and ${configuration.pinId}.`);
            ownerPins.set(ownerKey, configuration.pinId);
        }
    }
    const entries = ordered.map(configuration => macroFor(configuration, definition)).join("\n");
    const isPreview = options.mode !== "persisted";
    const ownershipNote = isPreview
        ? " * This is a preview. It has not been written to the BSP.\n"
        : " * This file is generated by IMDE Pinmux. Manual edits may be overwritten.\n";
    return `/**
 * @file board_pinmux.c
 * @brief Generated by IMDE Pinmux for ${chipId}/${boardId}.
 *
${ownershipNote.trimEnd()}
 */

#include "bsp_pinmux.h"

#include "im_gpio.h"
#include "im_utils.h"

static const im_gpio_pinmux_config_t s_board_pinmux[] = {
${entries}
};

error_code_t bsp_pinmux_init(void)
{
    return im_gpio_apply_pinmux(s_board_pinmux,
                                IM_ARRAY_SIZE(s_board_pinmux));
}
`;
}
function generateBoardPinsHeader(chipId, boardId, configurations) {
    const gpioConfigurations = configurations
        .filter(configuration => configuration.kind === "gpio")
        .slice()
        .sort((left, right) => left.pinId.localeCompare(right.pinId, undefined, { numeric: true }));
    const macroPins = new Set();
    const entries = gpioConfigurations.map(configuration => {
        if (!configuration.owner?.trim())
            throw new Error(`${configuration.pinId} GPIO owner is required.`);
        const location = pinLocation(configuration.pinId);
        const macro = boardSignalMacro(configuration.owner);
        if (macroPins.has(macro))
            throw new Error(`${macro} is assigned more than once.`);
        macroPins.add(macro);
        return `#define ${macro.padEnd(24)} IM_GPIO_SIGNAL(IM_GPIO_PORT_${location.port}, ${location.index}U, ${activeLevel(configuration) === "high" ? "true" : "false"})`;
    });
    const guard = `${boardSignalMacro(boardId)}_PINS_H`;
    const body = entries.length > 0 ? entries.join("\n") : "/* No GPIO signal mappings are configured. */";
    return `/**
 * @file board_pins.h
 * @brief Generated by IMDE Pinmux for ${chipId}/${boardId}.
 *
 * These macros describe the selected board GPIO signal mappings. GPIO
 * ownership and electrical configuration are applied by board_pinmux.c.
 */
#ifndef ${guard}
#define ${guard}

#include "im_gpio.h"

${body}

#endif /* ${guard} */
`;
}


/***/ },

/***/ "./src/pinmux/boardParser.ts"
/*!***********************************!*\
  !*** ./src/pinmux/boardParser.ts ***!
  \***********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   loadBoardPinmuxFile: () => (/* binding */ loadBoardPinmuxFile),
/* harmony export */   parseBoardPinmux: () => (/* binding */ parseBoardPinmux),
/* harmony export */   parseBoardPins: () => (/* binding */ parseBoardPins)
/* harmony export */ });
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _boardGenerator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./boardGenerator */ "./src/pinmux/boardGenerator.ts");



function parseBoardPins(source) {
    const pattern = /^\s*#define\s+(BOARD_[A-Z0-9_]+)\s+(?:(?:GPIO_SIGNAL\(\s*GPIO([A-Z])\s*,\s*GPIO_PIN_(\d+))|(?:IM_GPIO_SIGNAL\(\s*IM_GPIO_PORT_([A-Z])\s*,\s*(\d+)U?))\s*,\s*(true|false)\s*\)/gm;
    const entries = [];
    let match;
    while ((match = pattern.exec(source)) !== null) {
        const port = match[2] || match[4];
        const pinIndex = match[3] || match[5];
        entries.push({
            macro: match[1],
            pinId: `P${port}${String(Number(pinIndex)).padStart(2, "0")}`,
            activeLevel: match[6] === "true" ? "high" : "low",
            line: 1 + source.slice(0, match.index).split("\n").length - 1,
        });
    }
    return entries;
}
function maskComments(source) {
    const result = source.split("");
    let index = 0;
    let quote = "";
    while (index < source.length) {
        const character = source[index];
        const next = source[index + 1];
        if (quote) {
            if (character === "\\") {
                index += 2;
                continue;
            }
            if (character === quote)
                quote = "";
            index++;
            continue;
        }
        if (character === "\"" || character === "'") {
            quote = character;
            index++;
            continue;
        }
        if (character === "/" && next === "/") {
            while (index < source.length && source[index] !== "\n") {
                result[index] = " ";
                index++;
            }
            continue;
        }
        if (character === "/" && next === "*") {
            result[index++] = " ";
            result[index++] = " ";
            while (index < source.length && !(source[index] === "*" && source[index + 1] === "/")) {
                if (source[index] !== "\r" && source[index] !== "\n")
                    result[index] = " ";
                index++;
            }
            if (index < source.length) {
                result[index++] = " ";
                result[index++] = " ";
            }
            continue;
        }
        index++;
    }
    return result.join("");
}
function splitMacroArguments(source, masked, openIndex) {
    const argumentsList = [];
    let argumentStart = openIndex + 1;
    let depth = 1;
    let quote = "";
    for (let index = openIndex + 1; index < source.length; index++) {
        const character = source[index];
        if (quote) {
            if (character === "\\") {
                index++;
                continue;
            }
            if (character === quote)
                quote = "";
            continue;
        }
        if (character === "\"" || character === "'") {
            quote = character;
            continue;
        }
        const visibleCharacter = masked[index];
        if (visibleCharacter === "(") {
            depth++;
        }
        else if (visibleCharacter === ")") {
            depth--;
            if (depth === 0) {
                argumentsList.push(source.slice(argumentStart, index).trim());
                return { arguments: argumentsList, endIndex: index + 1 };
            }
        }
        else if (visibleCharacter === "," && depth === 1) {
            argumentsList.push(source.slice(argumentStart, index).trim());
            argumentStart = index + 1;
        }
    }
    return undefined;
}
function extractMacroCalls(source, issues) {
    const masked = maskComments(source);
    const pattern = /\b(BSP_GPIO_PINMUX|IM_GPIO_PINMUX_CONFIG)\s*\(/g;
    const calls = [];
    let match;
    while ((match = pattern.exec(masked)) !== null) {
        const macro = match[1];
        const openIndex = masked.indexOf("(", match.index);
        const line = 1 + source.slice(0, match.index).split("\n").length - 1;
        const parsed = splitMacroArguments(source, masked, openIndex);
        if (!parsed) {
            issues.push({ line, message: `Unterminated ${macro} call.` });
            break;
        }
        calls.push({ arguments: parsed.arguments, line, macro });
        pattern.lastIndex = parsed.endIndex;
    }
    return calls;
}
function parseCString(value) {
    if (!/^"(?:\\.|[^"\\])*"$/.test(value))
        return undefined;
    try {
        return JSON.parse(value);
    }
    catch {
        return undefined;
    }
}
function parseEntry(call, issues) {
    if (call.arguments.length !== 8) {
        issues.push({ line: call.line, message: `${call.macro} expects 8 arguments, got ${call.arguments.length}.` });
        return undefined;
    }
    const [ownerArg, portArg, pinArg, modeArg, pullArg, speedArg, driveArg, schmittArg] = call.arguments;
    const isLegacy = call.macro === "BSP_GPIO_PINMUX";
    const enumPrefix = isLegacy ? "HAL_GPIO" : "IM_GPIO";
    const owner = parseCString(ownerArg);
    const portMatch = isLegacy ? /^GPIO([A-Z])$/.exec(portArg) : /^IM_GPIO_PORT_([A-Z])$/.exec(portArg);
    const pinMatch = /^(\d+)U?$/.exec(pinArg);
    const functionMatch = new RegExp(`^${enumPrefix}_FUNCTION_([0-3])$`).exec(modeArg);
    const pullMatch = new RegExp(`^${enumPrefix}_PULL_(NONE|UP|DOWN)$`).exec(pullArg);
    const speedMatch = isLegacy
        ? new RegExp(`^${enumPrefix}_SPEED_(LOW|HIGH)$`).exec(speedArg)
        : new RegExp(`^${enumPrefix}_SLEW_(LOW|HIGH)$`).exec(speedArg);
    const driveMatch = new RegExp(`^${enumPrefix}_DRIVE_STRENGTH_(\\d+)MA$`).exec(driveArg);
    const gpioModes = {
        HAL_GPIO_FUNCTION_INPUT: "input",
        HAL_GPIO_FUNCTION_OUTPUT_LOW: "output-low",
        HAL_GPIO_FUNCTION_OUTPUT_HIGH: "output-high",
        IM_GPIO_FUNCTION_INPUT: "input",
        IM_GPIO_FUNCTION_OUTPUT_LOW: "output-low",
        IM_GPIO_FUNCTION_OUTPUT_HIGH: "output-high",
    };
    const gpioMode = gpioModes[modeArg];
    if (!owner || !portMatch || !pinMatch || (!functionMatch && !gpioMode) || !pullMatch || !speedMatch || !driveMatch || (schmittArg !== "true" && schmittArg !== "false")) {
        issues.push({ line: call.line, message: `Unsupported ${call.macro} argument.` });
        return undefined;
    }
    const pinIndex = Number(pinMatch[1]);
    const port = portMatch[1];
    return {
        owner,
        pinId: `P${port}${String(pinIndex).padStart(2, "0")}`,
        port,
        pinIndex,
        kind: functionMatch ? "function" : "gpio",
        mux: functionMatch ? Number(functionMatch[1]) : undefined,
        gpioMode,
        pull: pullMatch[1].toLowerCase(),
        speed: speedMatch[1].toLowerCase(),
        driveMa: Number(driveMatch[1]),
        schmitt: schmittArg === "true",
        line: call.line,
    };
}
function parseBoardPinmux(source, filePath, definition, boardPinsSource) {
    const issues = [];
    const entries = extractMacroCalls(source, issues)
        .map(call => parseEntry(call, issues))
        .filter((entry) => entry !== undefined);
    const pinsById = new Map(definition.pins.map(pin => [pin.id, pin]));
    const seenPins = new Map();
    const boardSignals = new Map(boardPinsSource === undefined
        ? []
        : parseBoardPins(boardPinsSource).map(entry => [`${entry.macro}:${entry.pinId}`, entry]));
    for (const entry of entries) {
        const previousLine = seenPins.get(entry.pinId);
        if (previousLine !== undefined) {
            issues.push({ line: entry.line, message: `${entry.pinId} is already configured on line ${previousLine}.` });
        }
        else {
            seenPins.set(entry.pinId, entry.line);
        }
        const pin = pinsById.get(entry.pinId);
        if (!pin) {
            issues.push({ line: entry.line, message: `${entry.pinId} is not present in ${definition.package.id}.` });
            continue;
        }
        if (entry.kind === "gpio") {
            let ownerMacro;
            try {
                ownerMacro = (0,_boardGenerator__WEBPACK_IMPORTED_MODULE_2__.boardSignalMacro)(entry.owner);
            }
            catch {
                issues.push({ line: entry.line, message: `GPIO owner "${entry.owner}" does not produce a valid board signal name.` });
                continue;
            }
            const signal = boardSignals.get(`${ownerMacro}:${entry.pinId}`);
            entry.activeLevel = signal?.activeLevel ?? (entry.gpioMode === "output-high" ? "high" : "low");
            continue;
        }
        if (entry.mux === undefined)
            continue;
        const selectedFunction = pin.functions.find(option => option.mux === entry.mux);
        if (!selectedFunction) {
            issues.push({ line: entry.line, message: `${entry.pinId} does not support FUNC${entry.mux}.` });
            continue;
        }
        entry.signal = selectedFunction.signal;
        if (definition.signals[entry.owner] && entry.owner !== selectedFunction.signal) {
            issues.push({
                line: entry.line,
                message: `${entry.owner} on ${entry.pinId}/FUNC${entry.mux} selects ${selectedFunction.signal}.`,
            });
        }
    }
    return { filePath, entries, issues };
}
async function loadBoardPinmuxFile(filePath, definition) {
    const source = await fs__WEBPACK_IMPORTED_MODULE_0__.promises.readFile(filePath, "utf-8");
    const boardPinsPath = path__WEBPACK_IMPORTED_MODULE_1__.join(path__WEBPACK_IMPORTED_MODULE_1__.dirname(filePath), "include", "board_pins.h");
    let boardPinsSource;
    try {
        boardPinsSource = await fs__WEBPACK_IMPORTED_MODULE_0__.promises.readFile(boardPinsPath, "utf-8");
    }
    catch (error) {
        if (error.code !== "ENOENT")
            throw error;
    }
    return parseBoardPinmux(source, filePath, definition, boardPinsSource);
}


/***/ }

};
;
//# sourceMappingURL=src_pinmux_boardParser_ts.js.map