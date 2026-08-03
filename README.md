# IMDE

[![CI](https://github.com/trevisy/IMDE/actions/workflows/ci.yml/badge.svg)](https://github.com/trevisy/IMDE/actions/workflows/ci.yml)

IMDE is a VS Code extension for Ingenic MCU SDK projects. It integrates the
SDK's local `tools/imde/imde.py` command-line interface into VS Code so that
common development tasks are available in one workspace.

## Features

- Environment diagnostics and SDK toolchain checks.
- Configure, build, clean, full-clean, and defconfig workflows.
- GUI configuration for Kconfig-based projects.
- Pinmux and BSP configuration tools.
- Build artifact browsing and interactive memory-map viewing.
- IntelliSense setup from generated compilation data.

## Requirements

- VS Code 1.85 or later.
- An Ingenic MCU SDK workspace containing `imde.json`.
- The SDK dependencies reported by `IMDE: Run Doctor`, including Python,
  CMake, Ninja, and the configured toolchain.

## Install

1. Open the [latest release](https://github.com/trevisy/IMDE/releases/latest).
2. Download the `imde-<version>.vsix` asset.
3. In VS Code, run `Extensions: Install from VSIX...` and select the file.
4. Open an SDK project and run `IMDE: Run Doctor` from the Command Palette.

## Everyday Workflow

1. Open an SDK project folder in VS Code.
2. Use `IMDE: Run Doctor` to verify the environment.
3. Select a defconfig, then run `IMDE: Configure`.
4. Run `IMDE: Build` and inspect the generated artifacts in the IMDE sidebar.

The extension activates only for workspaces that contain `imde.json`. Use the
`imde.projectDir` setting when the SDK project is not the workspace root.

## Repository Layout

```text
.
|- src/                 Extension TypeScript and webview source
|- test/                Automated tests and reusable fixtures
|- media/               Extension icons and branding assets
|- docs/                Development, architecture, and release documentation
|- .github/             CI and contributor-facing GitHub configuration
|- CHANGELOG.md         Version history
|- package.json         Extension manifest and npm scripts
`- webpack.config.js    Extension and webview bundling configuration
```

## Development

```powershell
npm ci
npm run compile
npm test
```

See [development documentation](docs/development.md) for debugging, packaging,
and the complete validation workflow. The design overview is in
[architecture documentation](docs/architecture.md).

## Contributing

Bug reports and feature requests are welcome through GitHub Issues. Please
read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Security
issues should follow [SECURITY.md](SECURITY.md).

## License

This project is distributed under the [ISC License](LICENSE).
