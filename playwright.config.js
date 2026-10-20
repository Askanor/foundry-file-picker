import { defineConfig } from "@playwright/test";
import { devkitConfig } from "@askanor/foundry-devkit/playwright";

export default defineConfig(devkitConfig({ testDir: "tests" }));
