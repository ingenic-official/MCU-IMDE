"use strict";
exports.id = "src_pinmux_parser_ts";
exports.ids = ["src_pinmux_parser_ts"];
exports.modules = {

/***/ "./src/pinmux/parser.ts"
/*!******************************!*\
  !*** ./src/pinmux/parser.ts ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   loadPinmuxFile: () => (/* binding */ loadPinmuxFile)
/* harmony export */ });
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);

function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function requireString(value, field) {
    if (typeof value !== "string" || value.length === 0)
        throw new Error(`Invalid .impx field: ${field}`);
    return value;
}
function parseSignals(value) {
    if (!isRecord(value))
        throw new Error("Invalid .impx field: signals");
    const signals = {};
    for (const [name, signal] of Object.entries(value)) {
        if (!isRecord(signal))
            throw new Error(`Invalid .impx signal: ${name}`);
        const direction = signal.direction;
        if (direction !== "input" && direction !== "output" && direction !== "bidirectional" && direction !== "unknown") {
            throw new Error(`Invalid .impx signal direction: ${name}`);
        }
        signals[name] = {
            direction,
            defaultValue: typeof signal.defaultValue === "number" ? signal.defaultValue : null,
            description: typeof signal.description === "string" ? signal.description : undefined,
        };
    }
    return signals;
}
function parseFunctions(value, pinId) {
    if (!Array.isArray(value))
        throw new Error(`Invalid .impx functions: ${pinId}`);
    return value.map((item, index) => {
        if (!isRecord(item) || !Number.isInteger(item.mux) || typeof item.signal !== "string") {
            throw new Error(`Invalid .impx function: ${pinId}[${index}]`);
        }
        return { mux: item.mux, signal: item.signal };
    });
}
function parsePins(value) {
    if (!Array.isArray(value))
        throw new Error("Invalid .impx field: pins");
    return value.map((item, index) => {
        if (!isRecord(item) || !isRecord(item.default))
            throw new Error(`Invalid .impx pin: ${index}`);
        const mode = item.default.mode;
        const pull = item.default.pull;
        if ((mode !== "input" && mode !== "output" && mode !== "alternate") || (pull !== "none" && pull !== "up" && pull !== "down")) {
            throw new Error(`Invalid .impx default configuration: ${index}`);
        }
        const pinId = requireString(item.id, `pins[${index}].id`);
        const driveMa = item.default.driveMa;
        if (typeof driveMa !== "number" && typeof driveMa !== "string")
            throw new Error(`Invalid .impx drive strength: ${pinId}`);
        return {
            id: pinId,
            powerDomain: requireString(item.powerDomain, `${pinId}.powerDomain`),
            pad: requireString(item.pad, `${pinId}.pad`),
            default: {
                mode,
                pull,
                driveMa,
                mux: typeof item.default.mux === "number" ? item.default.mux : undefined,
                outputLevel: item.default.outputLevel === 0 || item.default.outputLevel === 1 ? item.default.outputLevel : undefined,
                schmitt: typeof item.default.schmitt === "boolean" ? item.default.schmitt : undefined,
                slew: typeof item.default.slew === "boolean" ? item.default.slew : undefined,
            },
            functions: parseFunctions(item.functions, pinId),
        };
    });
}
function parsePeripheralGroups(value, signals, pins) {
    if (!Array.isArray(value))
        throw new Error("Invalid .impx field: peripheralGroups");
    const pinsById = new Map(pins.map(pin => [pin.id, pin]));
    const groupIds = new Set();
    return value.map((item, index) => {
        if (!isRecord(item) || !Array.isArray(item.assignments))
            throw new Error(`Invalid .impx peripheral group: ${index}`);
        const id = requireString(item.id, `peripheralGroups[${index}].id`);
        if (groupIds.has(id))
            throw new Error(`Duplicate .impx peripheral group: ${id}`);
        groupIds.add(id);
        const peripheral = requireString(item.peripheral, `${id}.peripheral`);
        const label = requireString(item.label, `${id}.label`);
        const assignedSignals = new Set();
        const assignedPins = new Set();
        const assignments = item.assignments.map((assignment, assignmentIndex) => {
            if (!isRecord(assignment) || typeof assignment.mux !== "number")
                throw new Error(`Invalid .impx group assignment: ${id}[${assignmentIndex}]`);
            const signal = requireString(assignment.signal, `${id}[${assignmentIndex}].signal`);
            const pinId = requireString(assignment.pin, `${id}[${assignmentIndex}].pin`);
            const pin = pinsById.get(pinId);
            if (!signals[signal] || !pin || !pin.functions.some(functionOption => functionOption.signal === signal && functionOption.mux === assignment.mux)) {
                throw new Error(`Invalid .impx group mapping: ${id} ${signal} -> ${pinId}/FUNC${assignment.mux}`);
            }
            if (assignedSignals.has(signal) || assignedPins.has(pinId))
                throw new Error(`Duplicate .impx group assignment in ${id}`);
            assignedSignals.add(signal);
            assignedPins.add(pinId);
            return { signal, pin: pinId, mux: assignment.mux };
        });
        if (assignments.length === 0)
            throw new Error(`Empty .impx peripheral group: ${id}`);
        return { id, peripheral, label, assignments };
    });
}
async function loadPinmuxFile(filePath) {
    let document;
    try {
        document = JSON.parse(await fs__WEBPACK_IMPORTED_MODULE_0__.promises.readFile(filePath, "utf-8"));
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Unable to load ${filePath}: ${message}`);
    }
    if (!isRecord(document) || document.format !== "impx" || document.version !== 1 || !isRecord(document.device) || !isRecord(document.package) || !isRecord(document.source)) {
        throw new Error("Unsupported .impx document.");
    }
    const packagePinCount = document.package.pinCount;
    if (!Number.isInteger(packagePinCount))
        throw new Error("Invalid .impx package pin count.");
    const pinCount = packagePinCount;
    const signals = parseSignals(document.signals);
    const pins = parsePins(document.pins);
    const peripheralGroups = parsePeripheralGroups(document.peripheralGroups, signals, pins);
    return {
        filePath,
        definition: {
            format: "impx",
            version: 1,
            device: { id: requireString(document.device.id, "device.id"), name: requireString(document.device.name, "device.name") },
            package: { id: requireString(document.package.id, "package.id"), name: requireString(document.package.name, "package.name"), pinCount },
            source: {
                file: requireString(document.source.file, "source.file"),
                revision: requireString(document.source.revision, "source.revision"),
                date: requireString(document.source.date, "source.date"),
                sheets: Array.isArray(document.source.sheets) ? document.source.sheets.filter((sheet) => typeof sheet === "string") : [],
            },
            signals,
            pins,
            peripheralGroups,
        },
    };
}


/***/ }

};
;
//# sourceMappingURL=src_pinmux_parser_ts.js.map