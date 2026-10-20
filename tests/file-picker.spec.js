import fs from "node:fs/promises";
import path from "node:path";
import { dataPath, fixturesPath } from "@askanor/foundry-devkit/playwright";
import { expect, openFilePicker, test } from "./fixtures.js";

for (const [file, tag] of [["landscape.png", "img"], ["clip.webm", "video"]]) {
  test(`previews ${file} on hover`, async ({ gm }) => {
    const picker = await openFilePicker(gm, "devkit-assets");
    await picker.locator(`li[data-path="devkit-assets/${file}"]`).hover();

    await expect(gm.locator(`#tooltip.ffp-preview ${tag}`)).toHaveAttribute("src", `devkit-assets/${file}`);
  });
}

test.describe("upload", () => {
  let uploadDir;

  test.beforeEach(async ({ gm }, testInfo) => {
    uploadDir = `devkit-uploads/${testInfo.testId}`;
    await gm.evaluate(dir => foundry.applications.apps.FilePicker.implementation.createDirectory("data", dir), uploadDir);
  });

  test.afterEach(async () => {
    await fs.rm(path.join(dataPath, uploadDir), { recursive: true, force: true });
  });

  test("uploads every file chosen in the upload field", async ({ gm }) => {
    const picker = await openFilePicker(gm, uploadDir, "image");
    const files = ["token.png", "portrait.jpg", "tile.webp"];
    await picker.locator('input[name="upload"]').setInputFiles(files.map(f => path.join(fixturesPath, "assets", f)));

    for (const file of files) {
      await expect(picker.locator(`li[data-path="${uploadDir}/${file}"]`)).toBeVisible();
    }
  });
});

test("browses files in the sidebar next to an open file picker", async ({ gm }) => {
  await gm.locator('#sidebar-tabs [data-tab="fileBrowser"]').click();
  const browser = gm.locator("#fileBrowser-picker");
  await browser.locator('li[data-path="devkit-assets"]').click();
  await expect(browser.locator('li[data-path="devkit-assets/token.png"]')).toBeVisible();

  // Core pickers share one element id; the sidebar picker must not take that slot.
  const picker = await openFilePicker(gm, "devkit-assets/creatures");
  await expect(picker).toBeVisible();
  await expect(browser.locator('li[data-path="devkit-assets/token.png"]')).toBeVisible();
});
