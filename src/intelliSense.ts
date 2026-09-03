import * as path from "path";
import * as fs from "fs";

interface CompileCommand {
  directory: string;
  command?: string;
  arguments?: string[];
  file: string;
}

interface CppProperties {
  configurations: CppConfiguration[];
  version: number;
}

interface CppConfiguration {
  name: string;
  includePath: string[];
  defines: string[];
  compilerPath: string;
  cStandard: string;
  cppStandard: string;
  intelliSenseMode: string;
  compilerArgs: string[];
  configurationProvider?: string;
}

interface IntelliSenseSummary {
  includePath: string[];
  defines: string[];
  compilerPath: string;
  cStandard: string;
  intelliSenseMode: string;
  fileCount: number;
}

/**
 * Parse compile_commands.json and extract IntelliSense configuration.
 * Returns null if the file doesn't exist or is empty.
 */
export function parseCompileCommands(
  projectDir: string
): IntelliSenseSummary | null {
  const buildDir = path.join(projectDir, "build", "default");
  const ccPath = path.join(buildDir, "compile_commands.json");

  if (!fs.existsSync(ccPath)) {
    return null;
  }

  let raw: string;
  try {
    raw = fs.readFileSync(ccPath, "utf-8");
  } catch {
    return null;
  }

  let entries: CompileCommand[];
  try {
    entries = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(entries) || entries.length === 0) {
    return null;
  }

  // Collect unique args across all compilation units
  const includeDirs = new Set<string>();
  const defines = new Set<string>();
  const stdFlags = new Set<string>();
  let compilerPath = "";

  const resolveArgPath = (arg: string, cwd: string): string => {
    if (path.isAbsolute(arg)) return arg;
    return path.resolve(cwd, arg);
  };

  for (const entry of entries) {
    const cwd = entry.directory || buildDir;

    // First entry's command/arguments give us the compiler path
    const compiler = entry.command
      ? entry.command.split(/\s+/)[0]
      : entry.arguments?.[0] || "";
    if (compiler && !compilerPath) {
      compilerPath = compiler.includes(path.sep)
        ? resolveArgPath(compiler, cwd)
        : compiler;
    }

    const tokens = extractTokens(entry);
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token === "-I" || token === "-isystem" || token === "/I") {
        const dir = tokens[i + 1];
        if (dir) {
          includeDirs.add(resolveArgPath(dir, cwd));
          i++;
        }
      } else if (token.startsWith("-I") && token.length > 2) {
        includeDirs.add(resolveArgPath(token.slice(2), cwd));
      } else if (token.startsWith("/I") && token.length > 2) {
        includeDirs.add(resolveArgPath(token.slice(2), cwd));
      } else if (token.startsWith("-isystem") && token.length > "-isystem".length) {
        includeDirs.add(resolveArgPath(token.slice("-isystem".length), cwd));
      } else if (token === "-D" || token === "/D") {
        const def = tokens[i + 1];
        if (def) {
          defines.add(def);
          i++;
        }
      } else if (token.startsWith("-D") && token.length > 2) {
        defines.add(token.slice(2));
      } else if (token.startsWith("/D") && token.length > 2) {
        defines.add(token.slice(2));
      } else if (token.startsWith("-std=")) {
        stdFlags.add(token.slice(5));
      }
    }
  }

  // Determine C standard
  const stdList = Array.from(stdFlags);
  const cStd =
    stdList.find(s => s.startsWith("c")) ||
    stdList.find(s => s.startsWith("gnu"));
  let cStandard = "c17";
  if (cStd) {
    const m = cStd.match(/^(?:gnu)?(\d+)/);
    if (m) cStandard = `c${m[1]}`;
  }
  // Determine IntelliSense mode
  const intelliSenseMode = compilerPath.includes("riscv")
    ? "linux-gcc-riscv32"
    : compilerPath.includes("arm")
    ? "linux-gcc-arm"
    : guessPlatformMode();

  return {
    includePath: Array.from(includeDirs).sort(),
    defines: Array.from(defines).sort(),
    compilerPath,
    cStandard,
    intelliSenseMode,
    fileCount: entries.length,
  };
}

function extractTokens(entry: CompileCommand): string[] {
  if (entry.arguments && entry.arguments.length > 0) {
    return entry.arguments.slice(1); // skip compiler path
  }
  if (entry.command) {
    return tokenizeCommand(entry.command).slice(1); // skip compiler path
  }
  return [];
}

/** Split a shell command line into tokens, handling quotes. */
function tokenizeCommand(cmd: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;
  let escaped = false;

  for (const ch of cmd) {
    if (escaped) {
      current += ch;
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    if ((ch === " " || ch === "\t") && !inSingle && !inDouble) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }
    current += ch;
  }
  if (current) tokens.push(current);
  return tokens;
}

function guessPlatformMode(): string {
  switch (process.platform) {
    case "win32":
      return "windows-gcc-x86";
    case "darwin":
      return "macos-clang-x64";
    default:
      return "linux-gcc-x64";
  }
}

/**
 * Generate c_cpp_properties.json content from parsed compile commands.
 */
function generateCppProperties(summary: IntelliSenseSummary): CppProperties {
  return {
    configurations: [
      {
        name: "IMDE",
        includePath: summary.includePath.concat(["${workspaceFolder}/**"]),
        defines: summary.defines,
        compilerPath: summary.compilerPath,
        cStandard: summary.cStandard,
        cppStandard: "c++17",
        intelliSenseMode: summary.intelliSenseMode,
        compilerArgs: [],
      },
    ],
    version: 4,
  };
}

/**
 * Write .vscode/c_cpp_properties.json if it needs to be created or updated.
 * Returns a summary of what was written, or null if no changes needed.
 */
export function writeCppProperties(
  projectDir: string,
  summary: IntelliSenseSummary
): { created: boolean; changed: boolean; path: string; defines: number; includes: number } | null {
  const vscodeDir = path.join(projectDir, ".vscode");
  const propsPath = path.join(vscodeDir, "c_cpp_properties.json");

  // Generate the new config
  const newProps = generateCppProperties(summary);

  // Check if existing config is from IMDE — if so, update it in place.
  // If not from IMDE, don't touch (user may have custom config).
  if (fs.existsSync(propsPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(propsPath, "utf-8"));
      const configs: any[] = existing.configurations || [];
      const imdeIdx = configs.findIndex(
        (c: any) => c.name === "IMDE"
      );
      if (imdeIdx >= 0) {
        const previous = JSON.stringify(existing);
        configs[imdeIdx] = newProps.configurations[0];
        existing.configurations = configs;
        const next = JSON.stringify(existing);
        if (previous !== next) {
          fs.mkdirSync(vscodeDir, { recursive: true });
          fs.writeFileSync(propsPath, JSON.stringify(existing, null, 2), "utf-8");
        }
        return {
          created: false,
          changed: previous !== next,
          path: propsPath,
          defines: summary.defines.length,
          includes: summary.includePath.length,
        };
      }
      // IMDE config not found — don't overwrite user's custom config
      return null;
    } catch {
      return null;
    }
  }

  // Fresh creation
  fs.mkdirSync(vscodeDir, { recursive: true });
  fs.writeFileSync(propsPath, JSON.stringify(newProps, null, 2), "utf-8");
  return {
    created: true,
    changed: true,
    path: propsPath,
    defines: summary.defines.length,
    includes: summary.includePath.length,
  };
}

/**
 * High-level entry: parse compile_commands.json → write .vscode/c_cpp_properties.json.
 * Safe to call even if compile_commands.json doesn't exist yet.
 */
export function syncIntelliSense(projectDir: string): string | null {
  const summary = parseCompileCommands(projectDir);
  if (!summary) {
    return null;
  }

  const result = writeCppProperties(projectDir, summary);
  if (!result) {
    return null;
  }

  if (!result.changed) {
    return null;
  }
  const action = result.created ? "Created" : "Updated";
  return `${action} IntelliSense: ${summary.defines} defines, ${summary.includePath.length} include paths (${summary.fileCount} source files)`;
}
