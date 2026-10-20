const { ImageHelper, VideoHelper } = foundry.helpers.media;

/** How long the pointer rests on a file before its preview opens. */
const PREVIEW_DELAY_MS = 300;

/**
 * Create a FilePicker subclass with hover previews and an upload field that
 * accepts several files at once.
 * @param {typeof foundry.applications.apps.FilePicker} Base  The class to extend.
 */
export function extendFilePicker(Base) {
  return class EnhancedFilePicker extends Base {
    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      addPreviews(this.element);
      if (this.canUpload) this.#allowMultipleUploads();
    }

    #allowMultipleUploads() {
      const input = this.element.querySelector('input[type="file"][name="upload"]');
      if (!input) return;
      // Core's listener on this input uploads only the first file. The clone
      // carries no listeners, so ours is the only one.
      const multiInput = input.cloneNode();
      multiInput.multiple = true;
      multiInput.addEventListener("change", () => this.#upload([...multiInput.files]));
      input.replaceWith(multiInput);
    }

    /** @param {File[]} files */
    async #upload(files) {
      const form = this.element;
      const target = form.elements.target.value;
      const body = { bucket: form.elements.bucket?.value ?? null };
      const accepted = files.filter(file => this.#isAllowed(file));

      // One progress bar instead of a notification per file.
      const progress = accepted.length > 1 ? ui.notifications.info("", { progress: true }) : null;
      let uploaded = 0;
      for (const file of accepted) {
        progress?.update({
          pct: uploaded / accepted.length,
          message: "FFP.Uploading",
          format: { current: String(uploaded + 1), total: String(accepted.length), name: file.name }
        });
        const response = await this.constructor.upload(this.activeSource, target, file, body, { notify: !progress });
        if (!response?.path) continue;
        this.request = response.path;
        uploaded++;
      }
      progress?.update({
        pct: 1,
        message: "FFP.Uploaded",
        format: { count: String(uploaded), total: String(accepted.length), target }
      });
      return this.browse(target);
    }

    /**
     * Mirror core's client-side extension check; the server checks MIME types too.
     * @param {File} file
     */
    #isAllowed(file) {
      const name = file.name.toLowerCase();
      const ext = `.${name.split(".").pop()}`;
      if (this.extensions.includes(ext)) return true;
      const allowed = this.extensions.join(" ");
      ui.notifications.error(game.i18n.format("FILES.ErrorDisallowedExtension", { name, ext, allowed }));
      return false;
    }
  };
}

/**
 * Show a large preview of images and videos when the pointer rests on them.
 * @param {HTMLElement} root  The rendered file picker.
 */
function addPreviews(root) {
  for (const row of root.querySelectorAll("li[data-file]")) {
    const { path } = row.dataset;
    if (!VideoHelper.hasVideoExtension(path) && !ImageHelper.hasImageExtension(path)) continue;
    let timeout;
    row.addEventListener("pointerenter", () => {
      timeout = setTimeout(() => showPreview(row), PREVIEW_DELAY_MS);
    });
    row.addEventListener("pointerleave", () => clearTimeout(timeout));
  }
}

/**
 * Open the preview in Foundry's tooltip, which also closes it when the pointer
 * leaves the row. Elements rather than an HTML string, because Foundry's HTML
 * cleaning strips the attributes a video needs.
 * @param {HTMLElement} row
 */
function showPreview(row) {
  if (!row.isConnected) return;
  const { path, name } = row.dataset;
  const media = VideoHelper.hasVideoExtension(path)
    ? Object.assign(document.createElement("video"), { src: path, autoplay: true, muted: true, loop: true })
    : Object.assign(document.createElement("img"), { src: path, alt: "" });
  const caption = document.createElement("figcaption");
  caption.textContent = name;
  const figure = document.createElement("figure");
  figure.append(media, caption);
  game.tooltip.activate(row, { html: figure, cssClass: "ffp-preview", direction: sideWithMoreRoom(row) });
}

/**
 * Open the preview beside the file list rather than over it.
 * @param {HTMLElement} row
 */
function sideWithMoreRoom(row) {
  const { left, right } = row.getBoundingClientRect();
  const { RIGHT, LEFT } = game.tooltip.constructor.TOOLTIP_DIRECTIONS;
  return window.innerWidth - right >= left ? RIGHT : LEFT;
}
