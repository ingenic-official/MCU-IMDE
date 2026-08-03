"use strict";
exports.id = "src_pinmux_boardGenerator_ts";
exports.ids = ["src_pinmux_boardGenerator_ts"];
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


/***/ }

};
;
//# sourceMappingURL=src_pinmux_boardGenerator_ts.js.map