# Architecture

IMDE is a VS Code extension with a Node.js extension host and a Vue-based
webview for GUI Config. Webpack builds the two runtime targets independently.

```text
VS Code
|- extension host
|  |- src/extension.ts       Command registration and lifecycle
|  |- src/imdeRunner.ts      Wrapper around the SDK IMDE CLI
|  |- src/*Tree.ts           Activity bar tree providers
|  |- src/diagnostics.ts     Build output to Problems integration
|  |- src/menuconfig/        Kconfig parsing, state, and webview bridge
|  |- src/pinmux/            Pinmux discovery, parsing, and BSP generation
|  `- src/mapview/           Map-file parsing and memory-map panel
`- webview
   `- src/views/webview/     Vue UI, Pinia store, and theme components
```

## Extension Host

`src/extension.ts` is the extension entry point. It discovers the active SDK
project, registers commands and tree views, coordinates refreshes, and lazily
loads feature panels. `ImdeRunner` is the boundary between VS Code and the
SDK's Python CLI; keep CLI invocation and environment handling there instead
of duplicating it in feature modules.

Tree providers expose environment status, build/config actions, and artifacts
in the IMDE activity bar. Diagnostics convert known CMake, compiler, Ninja,
and Python failure formats into VS Code Problems.

## Feature Modules

- `menuconfig/` contains the Kconfig parser, evaluator, writer, file watcher,
  state cache, and the panel that hosts GUI Config.
- `pinmux/` discovers supported chips and BSPs, parses pin definitions, and
  generates board source and registration files.
- `mapview/` parses linker map files and renders an interactive memory view.

Keep feature-specific file access, parsing, and UI state within its feature
directory. Shared VS Code integration belongs near the extension host or in a
small focused module such as `logger/` or `i18n/`.

## Webview

The GUI Config webview starts at `src/views/webview/main.ts`. It uses Vue 3,
Pinia, and the modern theme in `themes/modern/`. Messages cross the webview
boundary through the panel and should use serializable data only.

## Build and Tests

`webpack.config.js` has separate configurations for the Node.js extension
bundle and the browser-targeted webview bundle. Tests live in `test/`, and
fixed input data belongs in `test/fixtures/`. The test suite runs through
`ts-node` without requiring a running VS Code instance.
