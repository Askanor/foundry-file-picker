import { extendFilePicker } from "./file-picker.js";
import { FileBrowserTab, registerSidebarTab } from "./sidebar-tab.js";

Hooks.once("init", () => {
  // Extend whatever is configured, so other modules that replace the picker keep working.
  CONFIG.ux.FilePicker = extendFilePicker(CONFIG.ux.FilePicker);
  registerSidebarTab(FileBrowserTab);
});
