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
