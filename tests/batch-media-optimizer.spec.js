import fs from "node:fs/promises";
import path from "node:path";
import { dataPath, enableModules, fixturesPath } from "@askanor/foundry-devkit/playwright";
import { expect, openFilePicker, openSidebarPicker, test } from "./fixtures.js";

// Batch Media Optimizer converts PNG and JPEG uploads to WebP by wrapping the
// configured FilePicker's upload. Uploads from this module must still pass
// through that wrapper.
const BMO = "batch-media-optimizer";
const MANIFEST = "https://github.com/aronjanosch/foundryvtt-batch-media-optimizer/releases/latest/download/module.json";

const uploadDirOf = testInfo => `devkit-uploads/${testInfo.testId}`;

/** @param {import("@playwright/test").Page} page */
const setUploadOptimize = (page, enabled) =>
  page.evaluate(enabled => game.settings.set("batch-media-optimizer", "uploadOptimize", enabled), enabled);

test.describe("with Batch Media Optimizer", () => {
  test.beforeEach(async ({ gm }, testInfo) => {
    const installed = await gm.evaluate(id => game.modules.has(id), BMO);
    test.skip(!installed, `Batch Media Optimizer is not in the devkit. Run: bin/foundry install ${MANIFEST}`);
    await enableModules(gm, [BMO]);
    await setUploadOptimize(gm, true);
    const dir = uploadDirOf(testInfo);
    await gm.evaluate(dir => foundry.applications.apps.FilePicker.implementation.createDirectory("data", dir), dir);
  });

  test.afterEach(async ({ gm }, testInfo) => {
    // Other tests expect uploads to keep their names.
    if (await gm.evaluate(id => game.modules.get(id)?.active, BMO)) await setUploadOptimize(gm, false);
    await fs.rm(path.join(dataPath, uploadDirOf(testInfo)), { recursive: true, force: true });
  });

  const pickers = {
    dialog: (page, dir) => openFilePicker(page, dir, "image"),
    sidebar: openSidebarPicker
  };

  for (const [where, openPicker] of Object.entries(pickers)) {
    test(`converts a multi-file upload in the ${where} picker to WebP`, async ({ gm }, testInfo) => {
      const dir = uploadDirOf(testInfo);
      const picker = await openPicker(gm, dir);
      const files = ["landscape.png", "token.png"].map(f => path.join(fixturesPath, "assets", f));
      await picker.locator('input[name="upload"]').setInputFiles(files);

      for (const file of ["landscape.webp", "token.webp"]) {
        await expect(picker.locator(`li[data-path="${dir}/${file}"]`)).toBeVisible();
      }
    });
  }
});
