# IMDE

IMDE is a VS Code extension for Ingenic MCU SDK projects. It wraps the local
`tools/imde/imde.py` CLI and exposes environment checks, build/config actions,
artifacts, and defconfig selection in the activity bar.

## Requirements

- VS Code 1.85 or newer.
- An SDK workspace that contains `imde.json`.
- Python, CMake, Ninja, and the SDK toolchain as reported by `IMDE: Run Doctor`.

## Getting Started

1. Open an SDK project folder in VS Code.
2. Use the IMDE activity bar view.
3. Run `IMDE: Run Doctor` to check the host environment.
4. Select a defconfig, configure, then build.

## Settings

- `imde.projectDir`: Overrides SDK project discovery.
- `imde.terminalName`: Terminal name for interactive commands.
- `imde.captureTimeoutMs`: Timeout for short JSON commands used by views.
- `imde.commandTimeoutMs`: Timeout for non-interactive commands.
- `imde.showOutputOnError`: Reveals the output channel on command failure.

## Development

```powershell
npm ci
npm run compile
npm run package:dry
```

Use the `Run Extension` launch configuration to start an Extension Development
Host.
