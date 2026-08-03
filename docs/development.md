# Development Guide

## Prerequisites

- Node.js 18 or later (Node.js 20 is used by CI).
- npm 9 or later.
- VS Code 1.85 or later for extension debugging.

## Install Dependencies

```bash
npm ci
```

## Build

```bash
npm run compile
```

Webpack produces the extension host bundle at `dist/extension.js` and the
GUI Config webview bundle at `dist/views/webview-bundle.js`.

Use watch mode during webview or extension development:

```bash
npm run watch
```

## Debug in VS Code

Open this folder in VS Code and run either provided launch configuration:

- `Run Extension (Extension Folder)` starts an Extension Development Host.
- `Run Extension (IMDE Project)` starts an Extension Development Host with the
  sibling `../proj` SDK project opened.

The debug configurations build the extension first and use `dist/` source maps.

## Test and Validate

```bash
npm test
npm run typecheck
npm run check
npm run package:dry
npm run verify
```

`npm test` runs parser, diagnostics, IntelliSense, Kconfig, and Pinmux tests.
`npm run typecheck` checks extension and test TypeScript with unused-code
validation. `npm run check` performs a development webpack build.
`npm run package:dry` prints the files that will be included in the VSIX
package. `npm run verify` runs all checks in CI order.

## Package

```bash
npm run package
```

The generated `imde-<version>.vsix` stays local and is ignored by Git. Attach
the VSIX to the corresponding GitHub Release rather than committing it.

## Publish to the VS Code Marketplace

Publishing requires a Visual Studio Marketplace publisher that matches the
`publisher` field in `package.json` and a personal access token with the
required publishing scope.

```bash
npm run publish
```

## Versioning

Before a release:

1. Update `version` in `package.json`.
2. Add the release notes to `CHANGELOG.md`.
3. Run `npm run verify` and create the VSIX with `npm run package`.
4. Create and push the matching Git tag, then publish the VSIX in GitHub
   Releases. See [releasing.md](releasing.md) for the release checklist.
