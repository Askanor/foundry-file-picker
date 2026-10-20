import { test as base, expect } from "@playwright/test";
import { foundryFixtures } from "@askanor/foundry-devkit/playwright";

export const test = base.extend(foundryFixtures({ modules: ["foundry-file-picker"] }));
export { expect };

/**
 * Open the configured file picker on a directory, like a sheet's image button does.
 * @param {import("@playwright/test").Page} page
 * @param {string} directory
 * @param {string} [type]
 */
export async function openFilePicker(page, directory, type = "imagevideo") {
  await page.evaluate(
    ({ directory, type }) => new foundry.applications.apps.FilePicker.implementation({ type }).browse(directory),
    { directory, type }
  );
  return page.locator("#file-picker");
}

/**
 * Open the sidebar file browser and click through to a directory. Starts at
 * the root, so call it once per page.
 * @param {import("@playwright/test").Page} page
 * @param {string} directory
 */
export async function openSidebarPicker(page, directory) {
  await page.locator('#sidebar-tabs [data-tab="fileBrowser"]').click();
  const picker = page.locator("#fileBrowser-picker");
  const parts = directory.split("/");
  for (let depth = 1; depth <= parts.length; depth++) {
    await picker.locator(`li[data-path="${parts.slice(0, depth).join("/")}"]`).click();
  }
  await expect(picker.locator('input[name="target"]')).toHaveValue(directory);
  return picker;
}
