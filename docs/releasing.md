# Release Checklist

1. Confirm the working tree only contains intended changes.
2. Update `package.json` and `CHANGELOG.md` for the new version.
3. Run `npm run verify`.
4. Build the distributable with `npm run package`.
5. Install the generated VSIX in a clean VS Code profile for a final smoke
   test against an SDK project.
6. Commit the release changes, create an annotated tag named `v<version>`, and
   push the commit and tag.
7. Create a GitHub Release from that tag, paste the relevant changelog notes,
   and upload the generated `imde-<version>.vsix` asset.
8. Confirm the Release page exposes the intended tag, notes, and VSIX download.

GitHub Release ordering is based on publish time. Publish historical releases
from oldest to newest when their display order matters.
