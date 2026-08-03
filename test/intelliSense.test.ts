import * as assert from "assert";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { parseCompileCommands, syncIntelliSense, writeCppProperties } from "../src/intelliSense";

let passed = 0;
let failed = 0;

function check(cond: boolean, msg: string) {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.error("  FAIL:", msg);
  }
}

function withTempProject(run: (dir: string) => void) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "imde-intellisense-"));
  try {
    fs.mkdirSync(path.join(dir, "build"), { recursive: true });
    run(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function writeCompileCommands(projectDir: string, entries: unknown[]) {
  fs.writeFileSync(
    path.join(projectDir, "build", "compile_commands.json"),
    JSON.stringify(entries, null, 2),
    "utf-8"
  );
}

function testSplitIncludeAndDefineArguments() {
  withTempProject((dir) => {
    const buildDir = path.join(dir, "build");
    writeCompileCommands(dir, [
      {
        directory: buildDir,
        arguments: [
          "riscv-none-elf-gcc",
          "-I",
          "../include",
          "-isystem",
          "../third_party/include",
          "-D",
          "BOARD=G32S10",
          "-DENABLE_FEATURE",
          "-std=gnu11",
          "main.c",
        ],
        file: path.join(dir, "main.c"),
      },
    ]);

    const summary = parseCompileCommands(dir);
    assert.ok(summary, "summary should be parsed");
    check(summary!.includePath.includes(path.resolve(buildDir, "../include")), "bare -I path is collected");
    check(summary!.includePath.includes(path.resolve(buildDir, "../third_party/include")), "bare -isystem path is collected");
    check(summary!.defines.includes("BOARD=G32S10"), "bare -D value is collected");
    check(summary!.defines.includes("ENABLE_FEATURE"), "compact -D value is collected");
    check(summary!.cStandard === "c11", "gnu11 maps to c11");
  });
}

function testQuotedCommandLineArguments() {
  withTempProject((dir) => {
    const buildDir = path.join(dir, "build");
    writeCompileCommands(dir, [
      {
        directory: buildDir,
        command: 'gcc -I "../sdk include" -DNAME="hello world" -std=c17 main.c',
        file: path.join(dir, "main.c"),
      },
    ]);

    const summary = parseCompileCommands(dir);
    assert.ok(summary, "summary should be parsed");
    check(summary!.includePath.includes(path.resolve(buildDir, "../sdk include")), "quoted include path is collected");
    check(summary!.defines.includes("NAME=hello world"), "quoted define value is collected");
    check(summary!.cStandard === "c17", "c17 is preserved");
  });
}

function testRepeatedSyncDoesNotRewriteUnchangedConfig() {
  withTempProject((dir) => {
    const buildDir = path.join(dir, "build");
    writeCompileCommands(dir, [{
      directory: buildDir,
      arguments: ["gcc", "-I", "../include", "-DREPEATED", "-std=c17", "main.c"],
      file: path.join(dir, "main.c"),
    }]);

    const first = syncIntelliSense(dir);
    const second = syncIntelliSense(dir);
    check(first?.startsWith("Created IntelliSense") === true, "first IntelliSense sync creates the generated configuration");
    check(second === null, "repeated IntelliSense sync skips unchanged configuration");

    const summary = parseCompileCommands(dir);
    assert.ok(summary, "summary should be available for the no-op write check");
    const result = writeCppProperties(dir, summary!);
    check(result?.changed === false, "direct IntelliSense write reports unchanged content");
  });
}

console.log("\n=== IntelliSense ===");
testSplitIncludeAndDefineArguments();
testQuotedCommandLineArguments();
testRepeatedSyncDoesNotRewriteUnchangedConfig();

console.log("\n" + (failed === 0 ? "OK" : "FAIL") + ` Passed: ${passed}  Failed: ${failed}`);
if (failed > 0) {
  process.exit(1);
}
