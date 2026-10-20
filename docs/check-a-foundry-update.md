# How to check the module after a Foundry update

Run the tests against the new Foundry image before you update production.

1. Start the devkit on the new image:

   ```bash
   FOUNDRY_IMAGE=docker.io/felddy/foundryvtt:<version> ../../devkit/bin/foundry up
   ```

2. If the version is a new major, accept the EULA in the browser.
3. Run the tests:

   ```bash
   npm test
   ```

4. If the tests pass, raise `compatibility.verified` in `module.json` and release.

## Where a break comes from

The module relies on these parts of Foundry. Compare them with the new version's source in the devkit container, under `/home/node/resources/app/`.

| Feature | Foundry part | Source |
| --- | --- | --- |
| Previews, multi-file upload | `CONFIG.ux.FilePicker`, `FilePicker#_onRender`, `FilePicker#canUpload`, `FilePicker.upload` | `client/applications/apps/file-picker.mjs` |
| Previews | File rows `li[data-file]` with `data-path` and `data-name` | `templates/apps/file-picker/body.hbs` |
| Multi-file upload | The field `input[name="upload"]` | `templates/apps/file-picker/subfooter.hbs` |
| Previews | `game.tooltip.activate()` with an `html` element | `client/helpers/interaction/tooltip-manager.mjs` |
| Sidebar tab | `CONFIG.ui`, `Sidebar.TABS`, `AbstractSidebarTab` | `client/applications/sidebar/` |
| Sidebar tab | `ApplicationV2#_insertElement` swaps an element with the same id for the picker | `client/applications/api/application.mjs` |
| Sidebar tab layout | The `#file-picker` rules, mirrored in `styles/foundry-file-picker.css` | `public/css/foundry2.css` |

## Common issues

None known yet.
