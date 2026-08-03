"use strict";
exports.id = "src_pinmux_discovery_ts";
exports.ids = ["src_pinmux_discovery_ts"];
exports.modules = {

/***/ "./src/pinmux/discovery.ts"
/*!*********************************!*\
  !*** ./src/pinmux/discovery.ts ***!
  \*********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   discoverPinmuxTargets: () => (/* binding */ discoverPinmuxTargets)
/* harmony export */ });
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);


async function readDirectories(directory) {
    try {
        const entries = await fs__WEBPACK_IMPORTED_MODULE_0__.promises.readdir(directory, { withFileTypes: true });
        return entries.filter(entry => entry.isDirectory());
    }
    catch (error) {
        if (error.code === "ENOENT")
            return [];
        throw error;
    }
}
async function isFile(filePath) {
    try {
        return (await fs__WEBPACK_IMPORTED_MODULE_0__.promises.stat(filePath)).isFile();
    }
    catch (error) {
        if (error.code === "ENOENT")
            return false;
        throw error;
    }
}
function compareIds(left, right) {
    return left.id.localeCompare(right.id, undefined, { numeric: true, sensitivity: "base" });
}
async function discoverPinmuxTargets(projectDir) {
    const bspRoot = path__WEBPACK_IMPORTED_MODULE_1__.join(projectDir, "code", "bsp");
    const pinlistRoot = path__WEBPACK_IMPORTED_MODULE_1__.join(projectDir, "tools", "imde", "pinmux");
    const chipDirectories = await readDirectories(bspRoot);
    const chips = [];
    for (const chipEntry of chipDirectories) {
        if (chipEntry.name === "common")
            continue;
        const chipDirectory = path__WEBPACK_IMPORTED_MODULE_1__.join(bspRoot, chipEntry.name);
        const boardDirectories = await readDirectories(chipDirectory);
        const boards = [];
        for (const boardEntry of boardDirectories) {
            const boardDirectory = path__WEBPACK_IMPORTED_MODULE_1__.join(chipDirectory, boardEntry.name);
            const pinmuxFile = path__WEBPACK_IMPORTED_MODULE_1__.join(boardDirectory, "board_pinmux.c");
            if (await isFile(pinmuxFile)) {
                boards.push({ id: boardEntry.name, directory: boardDirectory, pinmuxFile });
            }
        }
        const pinlistDirectory = path__WEBPACK_IMPORTED_MODULE_1__.join(pinlistRoot, chipEntry.name);
        let pinlistFiles = [];
        try {
            const entries = await fs__WEBPACK_IMPORTED_MODULE_0__.promises.readdir(pinlistDirectory, { withFileTypes: true });
            pinlistFiles = entries
                .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith(".impx"))
                .map(entry => path__WEBPACK_IMPORTED_MODULE_1__.join(pinlistDirectory, entry.name))
                .sort((left, right) => path__WEBPACK_IMPORTED_MODULE_1__.basename(left).localeCompare(path__WEBPACK_IMPORTED_MODULE_1__.basename(right), undefined, { numeric: true, sensitivity: "base" }));
        }
        catch (error) {
            if (error.code !== "ENOENT")
                throw error;
        }
        if (boards.length === 0 && pinlistFiles.length === 0)
            continue;
        boards.sort(compareIds);
        chips.push({ id: chipEntry.name, directory: chipDirectory, boards, pinlistFiles });
    }
    return chips.sort(compareIds);
}


/***/ }

};
;
//# sourceMappingURL=src_pinmux_discovery_ts.js.map