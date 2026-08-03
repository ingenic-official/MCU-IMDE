// Override vscode module resolution before imports
const Module = require("module");
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request: string, _parent: any) {
  if (request === "vscode") return require("path").join(__dirname, "vscode-mock.ts");
  return origResolve.apply(this, arguments as any);
};

import { BuildErrorParser } from "../src/diagnostics";

const root = "/workspace";
let passed = 0, failed = 0;
function check(cond: boolean, msg: string) { if (cond) passed++; else { failed++; console.error("  ❌", msg); } }

// --- GCC error ---
let r = BuildErrorParser.parse("src/main.c:42:5: error: expected ';' before '}'", root);
check(r.length === 1 && r[0].message.includes("expected ';'"), "GCC error");
check(r[0].line === 41, "GCC error line 0-indexed");
check(r[0].severity === 0, "GCC error severity=Error");

// --- GCC warning ---
r = BuildErrorParser.parse("src/foo.c:10:1: warning: unused variable 'x'", root);
check(r.length === 1 && r[0].severity === 1, "GCC warning severity");

// --- GCC fatal ---
r = BuildErrorParser.parse("src/main.c:1:0: fatal error: missing_header.h: No such file", root);
check(r.length === 1 && r[0].message.includes("missing_header"), "GCC fatal error");

// --- CMake error ---
r = BuildErrorParser.parse("  CMake Error at CMakeLists.txt:15", root);
check(r.length === 1 && r[0].severity === 0, "CMake error");

// --- CMake warning ---
r = BuildErrorParser.parse("  CMake Warning at tools/FindFoo.cmake:3", root);
check(r.length === 1 && r[0].severity === 1, "CMake warning");

// --- Ninja ---
r = BuildErrorParser.parse("FAILED: CMakeFiles/test.dir/main.c.obj", root);
check(r.length >= 1, "Ninja FAILED");

r = BuildErrorParser.parse("ninja: build stopped", root);
check(r.length >= 1, "Ninja build stopped");

// --- Python ---
r = BuildErrorParser.parse('  File "/workspace/tools/imde.py", line 140', root);
check(r.length === 1 && r[0].line === 139, "Python traceback");

r = BuildErrorParser.parse("RuntimeError: Build failed with code 1", root);
check(r.length >= 1, "Python exception");

// --- ANSI stripping ---
r = BuildErrorParser.parse("\x1b[1;31msrc/main.c:1:1: error: ANSI test\x1b[0m", root);
check(r.length === 1 && r[0].message === "ANSI test", "ANSI stripping");

// --- Symbol stripping ---
r = BuildErrorParser.parse("✗ src/main.c:1:1: error: symbol test", root);
check(r.length === 1 && r[0].message === "symbol test", "Symbol stripping");

// --- cc1.exe ---
r = BuildErrorParser.parse("cc1.exe: fatal error: D:/some/file.c: No such file", root);
check(r.length >= 1, "cc1.exe error");

// --- Make ---
r = BuildErrorParser.parse("*** [all] Error 2", root);
check(r.length >= 1, "Make error");

// --- Shell ---
r = BuildErrorParser.parse("somecmd: command not found", root);
check(r.length >= 1, "Shell error");

// --- Multiple ---
const multi = "src/a.c:1:1: error: first\nerror\nsrc/b.c:2:2: error: second\nerror\nsrc/c.c:3:3: warning: third";
r = BuildErrorParser.parse(multi, root);
check(r.length === 3, "Multi errors: " + r.length);

// --- Empty ---
r = BuildErrorParser.parse("", root);
check(r.length === 0, "Empty output");

// --- Absolute path ---
r = BuildErrorParser.parse("D:/project/src/main.c:1:1: error: test", root);
check(r.length === 1 && r[0].file.startsWith("D:/"), "Absolute path");

console.log("\n" + (failed === 0 ? "✅" : "❌") + " Passed: " + passed + "  Failed: " + failed);
if (failed > 0) process.exit(1);
