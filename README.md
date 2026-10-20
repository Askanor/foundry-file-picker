# Foundry File Picker

A Foundry VTT V14 module that adds hover previews, multi-file upload, and a sidebar file browser to the file picker.

The module extends Foundry's own file picker, so the image dialogs of sheets, tokens, and tiles get the same changes as the sidebar tab. Favorite folders are core Foundry since V14 and work unchanged.

## Features

- Rest the pointer on an image or a video in any file picker to see a large preview.
- Select several files in the **Upload** field to upload all of them. One progress bar replaces the per-file notifications. Dropping files onto the picker already uploads all of them in core Foundry.
- Open the **File Browser** tab in the sidebar, the folder icon above **Settings**, to browse and upload without a dialog. Right-click the icon to open the tab in a window. Users without the **Use File Browser** permission do not see the tab.

## Install

In Foundry's **Install Module** dialog, paste this manifest URL:

```text
https://github.com/Askanor/foundry-file-picker/releases/latest/download/module.json
```

## Develop

The tests run against the Foundry devkit, a private sibling repository at `../../devkit` that links this module into a local Foundry.

```bash
../../devkit/bin/foundry up        # start Foundry on http://localhost:30000 with this module linked
npm install
npx playwright install chromium    # once per Playwright version
npm test                           # run the Playwright tests
```

The code is plain JavaScript without a build step. Reload the browser after a change to `scripts/`. Foundry reloads changes to `styles/`, `templates/`, and `lang/` by itself.

## Release

Push a version tag:

```bash
git tag v0.2.0
git push origin v0.2.0
```

The `Release` workflow writes the version into `module.json`, packs `module.zip`, and publishes both as a GitHub release. Foundry finds the update through the manifest URL.

## Foundry updates

The module depends on Foundry internals. [How to check the module after a Foundry update](docs/check-a-foundry-update.md) lists them.

## License

MIT, see [LICENSE](LICENSE).
