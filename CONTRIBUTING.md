# Contributing to IMDE

## Before You Start

- Search existing issues before filing a new one.
- Keep each pull request focused on one problem or feature.
- Do not include SDK binaries, local toolchains, generated `dist/` files, or
  `.vsix` packages in source commits.

## Development Setup

```bash
npm ci
npm run compile
npm test
```

See [docs/development.md](docs/development.md) for debugging and packaging
instructions.

## Making Changes

- Keep feature-specific logic in its existing feature directory.
- Add or update tests for parser, generator, or workspace behavior changes.
- Keep user-facing command and configuration text clear and consistent with
  the extension's existing terminology.
- Update `CHANGELOG.md` when a change affects users.

## Pull Requests

Before opening a pull request, run:

```bash
npm run verify
```

Describe the problem, the behavior change, and the validation performed. For
visual webview changes, include screenshots in the pull request description.

By contributing, you agree that your contributions may be distributed under
this repository's [ISC License](LICENSE).
