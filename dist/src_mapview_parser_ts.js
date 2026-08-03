"use strict";
exports.id = "src_mapview_parser_ts";
exports.ids = ["src_mapview_parser_ts"];
exports.modules = {

/***/ "./src/mapview/parser.ts"
/*!*******************************!*\
  !*** ./src/mapview/parser.ts ***!
  \*******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parseMapFile: () => (/* binding */ parseMapFile)
/* harmony export */ });
const ROM_SECTIONS = new Set([
    ".vectors", ".start", ".text", ".rodata", ".srodata", ".init", ".fini",
    ".preinit_array", ".init_array", ".fini_array", ".eh_frame", ".ARM.exidx",
]);
const RAM_SECTIONS = new Set([
    ".data", ".sdata", ".bss", ".sbss", ".noinit", ".heap", ".stack",
]);
const SKIP_SECTIONS = new Set([
    ".comment", ".note", ".debug_info", ".debug_abbrev", ".debug_loclists",
    ".debug_aranges", ".debug_rnglists", ".debug_line", ".debug_str",
    ".debug_line_str", ".debug_frame", ".riscv.attributes", ".stab", ".stabstr",
]);
const RESERVED_SECTIONS = new Set([
    ".user_heap", ".user_stack", ".irq_stack", ".got", ".rela.dyn",
]);
function isDebugOrMetaSection(name) {
    return SKIP_SECTIONS.has(name) || name.startsWith(".debug_");
}
function isReservedSection(name) { return RESERVED_SECTIONS.has(name); }
function hexToNum(s) { return parseInt(s.replace(/^0x/i, ""), 16); }
function fmtAddr(addr) {
    return "0x" + addr.toString(16);
}
function looksLikeObjFile(path) {
    return path.includes(".obj") || path.includes(".o") || path.endsWith(")");
}
function getModuleName(path) {
    const m = path.match(/[\\/]([^\\/]+)\.c\.obj$/i);
    if (m) {
        const parts = path.split(/[\\/]/);
        const idx = parts.findIndex(p => p === "code");
        if (idx >= 0 && idx + 2 < parts.length) {
            return `${parts[idx + 1]}/${parts[parts.length - 1].replace(/\.c\.obj$/i, "")}`;
        }
        const file = parts[parts.length - 1].replace(/\.c\.obj$/i, "");
        const dir = parts.length > 1 ? parts[parts.length - 2] : "";
        return dir ? `${dir}/${file}` : file;
    }
    const sM = path.match(/[\\/]([^\\/]+)\.[Ss]\.obj$/i);
    if (sM) {
        const parts = path.split(/[\\/]/);
        const idx = parts.findIndex(p => p === "code");
        if (idx >= 0 && idx + 2 < parts.length) {
            return `${parts[idx + 1]}/${sM[1]}`;
        }
        const file = sM[1];
        const dir = parts.length > 1 ? parts[parts.length - 2] : "";
        return dir ? `${dir}/${file}` : file;
    }
    const libM = path.match(/([^\\/]+)\.a\([^)]*[-_]([^\\/]+)\.o\)$/i);
    if (libM) {
        return `${libM[1].replace(/^lib/, "")}/${libM[2]}`;
    }
    const oM = path.match(/[\\/]([^\\/]+)\.o$/i);
    if (oM) {
        return oM[1];
    }
    const parts = path.split(/[\\/]/);
    return parts[parts.length - 1].replace(/\.(o|obj|a)$/i, "");
}
/** Recover source file path from obj path, e.g. "code/common/src/im_log.c" */
function getSourceFile(path) {
    // CMake: CMakeFiles/xxx.dir/code/common/src/im_log.c.obj
    const m = path.match(/CMakeFiles[\\/][^\\/]+\.dir[\\/](.+)\.(?:c|s|S|cpp|cc)\.obj$/i);
    if (m) {
        return m[1].replace(/\\/g, "/") + ".c";
    }
    // Assembly
    const sm = path.match(/CMakeFiles[\\/][^\\/]+\.dir[\\/](.+)\.(s|S)\.obj$/i);
    if (sm) {
        return sm[1].replace(/\\/g, "/") + "." + sm[2];
    }
    // Library object — no source file
    if (path.includes(".a(")) {
        return "";
    }
    return "";
}
function getDirectoryPath(path) {
    const parts = path.split(/[\\/]/);
    const codeIdx = parts.findIndex(p => p === "code");
    if (codeIdx >= 0) {
        const underCode = parts.slice(codeIdx);
        if (underCode.length > 1) {
            underCode.pop();
            return underCode.join("/");
        }
        return underCode.join("/");
    }
    const genIdx = parts.findIndex(p => p === "generated" || p === "third_party");
    if (genIdx >= 0) {
        const sub = parts.slice(genIdx);
        if (sub.length > 1) {
            sub.pop();
            return sub.join("/");
        }
        return sub.join("/");
    }
    const libM = path.match(/lib([^\\/]+)\.a\(/);
    if (libM) {
        return `lib/${libM[1]}`;
    }
    if (parts.length > 1) {
        return parts[parts.length - 2];
    }
    return "";
}
function parseMapFile(content) {
    const lines = content.replace(/\r/g, "").split("\n");
    let sectionStartLine = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("LOAD "))
            sectionStartLine = i;
    }
    const sections = [];
    const objMap = new Map();
    let currentSection = null;
    // Track __ro_start / __ro_end for pure ROM size
    let roStart = 0, roEnd = 0;
    const sectionPattern = /^(\S+)\s+0x([0-9a-fA-F]+)\s+0x([0-9a-fA-F]+)(?:\s|$)/;
    const subSectionPattern = /^(\s+)(\S+)\s+0x([0-9a-fA-F]+)\s+0x([0-9a-fA-F]+)\s+(.*)$/;
    const anonPattern = /^(\s+)0x([0-9a-fA-F]+)\s+0x([0-9a-fA-F]+)\s+(.*)$/;
    const subNamePattern = /^(\s+)(\.\S+)\s*$/;
    for (let i = sectionStartLine; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim())
            continue;
        // Detect __ro_start / __ro_end markers (for .rodata estimation)
        if (line.includes("__ro_start = .")) {
            const m = line.match(/0x([0-9a-fA-F]+)/);
            if (m)
                roStart = hexToNum(m[0]);
            continue;
        }
        if (line.includes("__ro_end = .")) {
            const m = line.match(/0x([0-9a-fA-F]+)/);
            if (m)
                roEnd = hexToNum(m[0]);
            continue;
        }
        const secMatch = line.match(sectionPattern);
        if (secMatch && !line.startsWith(" ") && !line.startsWith("\t")) {
            const name = secMatch[1];
            const addr = hexToNum(secMatch[2]);
            const size = hexToNum(secMatch[3]);
            if (!isDebugOrMetaSection(name) && !isReservedSection(name) && size > 0) {
                currentSection = { name, address: addr, size, addressRange: fmtAddr(addr) + "–" + fmtAddr(addr + size) };
                sections.push(currentSection);
            }
            else {
                currentSection = null;
            }
            continue;
        }
        if (!currentSection)
            continue;
        if (line.includes("fill=0x"))
            continue;
        if (line.includes(" *fill* "))
            continue;
        if (line.match(subNamePattern))
            continue;
        const subMatch = line.match(subSectionPattern);
        if (subMatch) {
            const objPath = subMatch[5].trim();
            if (looksLikeObjFile(objPath)) {
                const sz = hexToNum(subMatch[4]);
                if (sz > 0)
                    recordContribution(objMap, currentSection.name, objPath, sz);
            }
            continue;
        }
        const anonMatch = line.match(anonPattern);
        if (anonMatch) {
            const objPath = anonMatch[4].trim();
            if (looksLikeObjFile(objPath)) {
                const sz = hexToNum(anonMatch[3]);
                if (sz > 0)
                    recordContribution(objMap, currentSection.name, objPath, sz);
            }
            continue;
        }
        if (line.match(/^(\s+)0x([0-9a-fA-F]+)\s+(\S+)\s*$/))
            continue;
    }
    // Estimate .rodata size from __ro_end - __ro_start minus vectors and start
    if (roStart > 0 && roEnd > 0 && roEnd > roStart) {
        const roTotal = roEnd - roStart;
        const vectorsSize = sections.find(s => s.name === ".vectors")?.size || 0;
        const startSize = sections.find(s => s.name === ".start")?.size || 0;
        const textSize = (sections.find(s => s.name === ".text")?.size || 0);
        const rodataSize = roTotal - vectorsSize - startSize - textSize;
        if (rodataSize > 0) {
            const textSec = sections.find(s => s.name === ".text");
            const rodataStart = textSec.address + textSec.size;
            sections.push({
                name: ".rodata",
                address: rodataStart,
                size: rodataSize,
                addressRange: fmtAddr(rodataStart) + "–" + fmtAddr(rodataStart + rodataSize),
            });
        }
    }
    const objects = Array.from(objMap.values()).sort((a, b) => b.totalSize - a.totalSize);
    const moduleTree = buildModuleTree(objects);
    let romUsed = 0, ramUsed = 0;
    for (const sec of sections) {
        if (ROM_SECTIONS.has(sec.name))
            romUsed += sec.size;
        if (RAM_SECTIONS.has(sec.name))
            ramUsed += sec.size;
    }
    return { sections, objects, romSize: 0, ramSize: 0, romUsed, ramUsed, moduleTree };
}
function recordContribution(objMap, sectionName, objPath, size) {
    let obj = objMap.get(objPath);
    if (!obj) {
        obj = {
            path: objPath,
            name: getModuleName(objPath),
            module: getDirectoryPath(objPath),
            sections: {}, totalSize: 0,
            sourceFile: getSourceFile(objPath),
        };
        objMap.set(objPath, obj);
    }
    obj.sections[sectionName] = (obj.sections[sectionName] || 0) + size;
    obj.totalSize += size;
}
function buildModuleTree(objects) {
    const root = [];
    const findOrCreate = (parent, name, fullPath) => {
        let node = parent.find(c => c.name === name);
        if (!node) {
            node = { name, fullPath, size: 0, romSize: 0, ramSize: 0, children: [] };
            parent.push(node);
        }
        return node;
    };
    for (const obj of objects) {
        const parts = obj.module.split("/").filter(Boolean);
        let current = root;
        let fullPath = "";
        for (let i = 0; i < parts.length; i++) {
            fullPath = fullPath ? `${fullPath}/${parts[i]}` : parts[i];
            current = findOrCreate(current, parts[i], fullPath).children;
        }
    }
    for (const obj of objects) {
        const parts = obj.module.split("/").filter(Boolean);
        let current = root;
        for (let i = 0; i < parts.length; i++) {
            const node = current.find(c => c.name === parts[i]);
            if (i === parts.length - 1) {
                node.size += obj.totalSize;
                for (const [secName, secSize] of Object.entries(obj.sections)) {
                    if (ROM_SECTIONS.has(secName))
                        node.romSize += secSize;
                    if (RAM_SECTIONS.has(secName))
                        node.ramSize += secSize;
                }
                if (obj.sourceFile) {
                    if (!node.sourceFiles)
                        node.sourceFiles = [];
                    if (!node.sourceFiles.includes(obj.sourceFile))
                        node.sourceFiles.push(obj.sourceFile);
                }
            }
            current = node.children;
        }
    }
    function rollup(nodes) {
        let total = 0;
        for (const node of nodes) {
            const childSize = rollup(node.children);
            if (node.size === 0 && childSize > 0)
                node.size = childSize;
            total += node.size;
        }
        return total;
    }
    rollup(root);
    return root;
}


/***/ }

};
;
//# sourceMappingURL=src_mapview_parser_ts.js.map