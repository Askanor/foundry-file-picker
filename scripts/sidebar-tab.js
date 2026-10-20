const { HandlebarsApplicationMixin } = foundry.applications.api;
const { AbstractSidebarTab } = foundry.applications.sidebar;

const TAB_NAME = "fileBrowser";

/**
 * Add a sidebar tab, placed before Settings. Must run during init, before
 * Foundry creates the sidebar applications from CONFIG.ui.
 * @param {typeof AbstractSidebarTab} TabClass
 */
export function registerSidebarTab(TabClass) {
  const Sidebar = CONFIG.ui.sidebar;
  const { settings, ...tabs } = Sidebar.TABS;
  Sidebar.TABS = {
    ...tabs,
    [TabClass.tabName]: { tooltip: "FFP.FileBrowser", icon: "fa-solid fa-folder-open" },
    settings
  };
  CONFIG.ui[TabClass.tabName] = TabClass;
}

/**
 * Sidebar tab that hosts a file picker. Right-clicking the tab icon pops it
 * out into a window, like every other sidebar tab.
 */
export class FileBrowserTab extends HandlebarsApplicationMixin(AbstractSidebarTab) {
  static tabName = TAB_NAME;

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["ffp-file-browser"],
    window: { title: "FFP.FileBrowser" },
    position: { width: 420, height: 720 }
  };

  /** @override */
  static PARTS = {
    browser: { template: "modules/foundry-file-picker/templates/file-browser.hbs" }
  };

  /** @type {foundry.applications.apps.FilePicker|null} */
  #picker = null;

  get #pickerId() {
    return `${this.id}-picker`;
  }

  /** @inheritDoc */
  _canRender(options) {
    if (!game.user.can("FILES_BROWSE")) return false;
    return super._canRender(options);
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.pickerId = this.#pickerId;
    return context;
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    // The sidebar renders every tab on load; the picker waits until it is seen.
    if (this.isPopout || this.active) await this.#showPicker();
  }

  /** @inheritDoc */
  _onActivate() {
    super._onActivate();
    this.#showPicker();
  }

  /** @inheritDoc */
  _onClose(options) {
    super._onClose(options);
    this.#picker?.close();
    this.#picker = null;
  }

  async #showPicker() {
    const placeholder = this.element.querySelector(`#${this.#pickerId}`);
    if (this.#picker?.rendered) {
      // Re-rendering this tab replaced the picker with a fresh placeholder.
      if (placeholder !== this.#picker.element) placeholder?.replaceWith(this.#picker.element);
      return;
    }
    // On first render, Foundry swaps the element with the same id, our placeholder, for the picker.
    this.#picker ??= new (embeddedPickerClass())({ id: this.#pickerId, type: "any" });
    await this.#picker.browse();
  }
}

let EmbeddedFilePicker;

/**
 * The configured FilePicker, without a window frame and without the Select
 * button, which only makes sense in a dialog. Created on first use, because
 * other modules may still change CONFIG.ux.FilePicker during init.
 */
function embeddedPickerClass() {
  EmbeddedFilePicker ??= class extends foundry.applications.apps.FilePicker.implementation {
    /** @override */
    static DEFAULT_OPTIONS = {
      classes: ["ffp-embedded"],
      window: { frame: false, positioned: false }
    };

    /** @inheritDoc */
    _configureRenderParts(options) {
      const parts = super._configureRenderParts(options);
      delete parts.footer;
      return parts;
    }

    /** @inheritDoc */
    async _prepareContext(options) {
      const context = await super._prepareContext(options);
      context.canSelect = false;
      return context;
    }
  };
  return EmbeddedFilePicker;
}
