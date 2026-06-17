# IMDE Extension — Build & Package Guide

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A terminal that can run `bash` (Git Bash, WSL, or macOS/Linux)

## Project Structure

```
vs-imde/
├── src/                         # TypeScript & Vue source
│   ├── extension.ts             # Extension entry point
│   ├── imdeRunner.ts            # Python CLI wrapper
│   ├── doctorTree.ts            # Environment doctor tree
│   ├── buildTree.ts             # Build & Config tree
│   ├── artifactsTree.ts         # Artifacts tree
│   ├── menuconfig/              # GUI Config backend
│   │   ├── MenuconfigPanel.ts   # WebView panel manager
│   │   ├── KconfigServer.ts     # Config state management
│   │   ├── KconfigParser.ts     # Kconfig syntax parser
│   │   ├── KconfigWriter.ts     # .config / defconfig writer
│   │   └── ...
│   ├── views/webview/           # GUI Config frontend (Vue 3)
│   │   ├── main.ts              # Vue entry + postMessage
│   │   ├── store.ts             # Pinia state store
│   │   └── themes/
│   │       ├── modern/          # Modern table theme (default)
│   │       └── default/         # Classic tree theme
│   ├── i18n/                    # Backend i18n (zh/en)
│   └── logger/                  # Output channel logger
├── dist/                        # Webpack output (gitignored)
├── logo/                        # Ingenic logo SVGs
├── webpack.config.js            # Webpack config (dual entry)
├── tsconfig.json                # TypeScript config
└── package.json                 # Extension manifest
```

## Install Dependencies

```bash
npm ci
```

## Development Build

```bash
npm run compile
# or: npx webpack --mode development
```

Output:
- `dist/extension.js` — extension backend
- `dist/views/webview-bundle.js` — Vue 3 webview frontend

## Watch Mode

```bash
npm run watch
```

## Production Package

```bash
npm run package
# or: npx webpack --mode production && npx vsce package --no-rewrite-relative-links
```

The `--no-rewrite-relative-links` flag preserves relative paths for assets
embedded in the HTML template (required by the webview CSP).

Output: `imde-<version>.vsix`

## Preview Package Contents

```bash
npm run package:dry
# or: npx vsce ls
```

Shows exactly which files will be included in the `.vsix`.

## Publish

```bash
# Prerequisites: Personal Access Token with extension publish scope
# Set via environment variable:
export VSCE_PAT=<your-token>

npm run publish
# or: npx vsce publish
```

## Install Locally for Testing

```bash
# From VS Code Command Palette (Ctrl+Shift+P):
# "Extensions: Install from VSIX..." → select imde-*.vsix

# Or via CLI:
code --install-extension imde-0.3.0.vsix
```

## Build Artifacts Checklist

| File | Size (prod) | Description |
|------|-------------|-------------|
| `extension.js` | ~219 KB | Backend bundle (TypeScript → JS) |
| `webview-bundle.js` | ~222 KB | Vue 3 frontend (scoped CSS inlined) |
| `icon.png` | — | Extension icon |
| `logo/ingenic_blue.svg` | — | Blue logo (light theme) |
| `logo/ingenic_white.svg` | — | White logo (dark theme) |

## Common Issues

### Webpack SCSS errors

Ensure `sass` (Dart Sass) is installed:
```bash
npm install sass
```

The `sass-loader` is configured with `api: 'legacy'` for compatibility.

### `package.json` formatting

npm install may reformat `package.json`. The `vsce` tool reads the original
file — ensure `JSON.stringify(pkg, null, 2)` is the format used if you
modify it programmatically.

### CSP violations in webview

The webview Content-Security-Policy is defined in `MenuconfigPanel.ts`.
If you add external resources (fonts, CDN scripts), update the CSP header
in `createMenuconfigHtml()`.

## Versioning

Update the version in **three places**:
1. `package.json` → `"version"` field
2. `CHANGELOG.md` → add a new section
3. `extension.ts` → `statusBar.tooltip` string (cosmetic)
