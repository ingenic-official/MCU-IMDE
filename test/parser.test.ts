import { parseMapFile, MapParseResult } from "../src/mapview/parser";
import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";

const fixture = fs.readFileSync(path.join(__dirname, "fixtures", "map-view.fixture"), "utf-8");
const result: MapParseResult = parseMapFile(fixture);

let passed = 0, failed = 0;
function check(cond: boolean, msg: string) {
  if (cond) { passed++; } else { failed++; console.error("  ❌ FAIL:", msg); }
}

// --- Sections ---
console.log("\n=== Sections ===");
const secNames = result.sections.map(s => s.name);
console.log("Found:", secNames.join(", "));
check(secNames.includes(".vectors"), "Missing .vectors");
check(secNames.includes(".start"), "Missing .start");
check(secNames.includes(".text"), "Missing .text");
check(secNames.includes(".data"), "Missing .data");
check(secNames.includes(".bss"), "Missing .bss");
check(!secNames.includes(".debug_info"), "Should skip .debug_info");
check(!secNames.includes(".comment"), "Should skip .comment");
check(!secNames.includes(".user_heap"), "Should skip .user_heap");

const textSec = result.sections.find(s => s.name === ".text")!;
check(textSec.addressRange.includes("0x"), "Address range hex");
console.log("  .text range:", textSec.addressRange);

const rodataSec = result.sections.find(s => s.name === ".rodata");
check(!!rodataSec, "Detect .rodata from __ro_end/__ro_start");
if (rodataSec) console.log("  .rodata range:", rodataSec.addressRange);

// --- Objects ---
console.log("\n=== Objects (" + result.objects.length + ") ===");
check(result.objects.length >= 2, "At least 2 objects");

const uartObj = result.objects.find(o => o.name.includes("uart"));
check(!!uartObj, "UART object found");
if (uartObj) console.log("  UART:", uartObj.name, "=", uartObj.totalSize, "bytes");

const sources = result.objects.filter(o => o.sourceFile);
check(sources.length > 0, "Source files extracted");
if (sources.length > 0) console.log("  Example source:", sources[0].sourceFile);

const asmObj = result.objects.find(o => o.path.includes(".S.obj"));
check(!!asmObj, "Assembly file handling");

// --- Module tree ---
console.log("\n=== Module Tree ===");
check(result.moduleTree.length > 0, "Module tree not empty");
console.log("Root nodes:", result.moduleTree.length);
for (const n of result.moduleTree) {
  console.log("  " + n.name + ": " + n.size + " bytes, children=" + n.children.length);
  check(n.size > 0, "Node " + n.name + " has non-zero size");
}

// --- Totals ---
console.log("\n=== Totals ===");
console.log("ROM:", result.romUsed, "bytes  RAM:", result.ramUsed, "bytes");
check(result.romUsed > 0, "ROM used > 0");
check(result.ramUsed > 0, "RAM used > 0");

// --- Result ---
console.log("\n" + (failed === 0 ? "✅" : "❌") + " Passed: " + passed + "  Failed: " + failed);
if (failed > 0) process.exit(1);
