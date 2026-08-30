// src/url-guard.ts
function escapeHtml(value) {
  if (value === void 0 || value === null) return "";
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function escapeAttr(value) {
  return escapeHtml(value);
}
function isSafeUrl(url) {
  if (url === void 0 || url === null) return false;
  const value = String(url).trim();
  if (!value) return false;
  if (/^\/\//.test(value)) return true;
  if (/^[./?#]/.test(value)) return true;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    return /^(https?:)/i.test(value);
  }
  return true;
}
function sanitizeUrl(url) {
  return isSafeUrl(url) ? String(url).trim() : "";
}
function coerceBoolean(value, fallback) {
  if (typeof value === "boolean") return value;
  if (value === void 0 || value === null || value === "") return fallback;
  const normalized = String(value).toLowerCase();
  if (normalized === "true" || normalized === "1") return true;
  if (normalized === "false" || normalized === "0") return false;
  return fallback;
}

// src/content-builder.ts
function buildContent(model, defaults) {
  const content = {};
  const title = model.data.title || "";
  const description = model.data.description || "";
  const safeHref = sanitizeUrl(model.data.href);
  const href = escapeAttr(safeHref);
  const message = model.data.message || "";
  let messageTitle = model.data.messageTitle || "";
  if (messageTitle === "none") messageTitle = "";
  content.type = model.data.type;
  if (model.data.type === "image") {
    content.header = title;
    if (safeHref) {
      content.body = '<img class="cxmodal__body-img" src="' + href + '" alt="' + escapeAttr(description) + '">';
      content.bodyIsHtml = true;
    } else {
      content.body = "Blocked unsafe image URL.";
      content.bodyIsHtml = false;
    }
    content.footer = description;
    content.footerIsHtml = false;
  } else if (model.data.type === "ajax") {
    content.body = '<p class="cxmodal__loading">Loading\u2026</p>';
    content.header = title || "AJAX";
    content.bodyIsHtml = true;
    content.ajaxUrl = safeHref;
    if (!safeHref) {
      content.body = "Blocked unsafe URL.";
      content.bodyIsHtml = false;
    }
  } else if (model.data.type === "iframe") {
    content.header = title || "IFRAME";
    content.footer = description;
    content.footerIsHtml = false;
    if (safeHref) {
      content.body = '<iframe src="' + href + '" title="' + escapeAttr(title || "IFRAME") + '" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>';
      content.bodyIsHtml = true;
    } else {
      content.body = "Blocked unsafe iframe URL.";
      content.bodyIsHtml = false;
    }
  } else if (model.data.type === "message") {
    content.header = title;
    content.body = message || model.data.href || "";
    content.footer = description;
    content.bodyIsHtml = false;
    content.footerIsHtml = false;
  }
  if (model.data.messageType === "alert") {
    content.type = "alert";
    content.header = messageTitle || (defaults.alertTitle === "none" ? "" : defaults.alertTitle || "ALERT");
    content.body = message;
    content.footer = '<button class="cxmodal__footer-button" type="button" data-cxmodal-action="ok">OK</button>';
    content.bodyIsHtml = false;
    content.footerIsHtml = true;
  } else if (model.data.messageType === "confirm") {
    content.type = "confirm";
    content.header = messageTitle || (defaults.confirmTitle === "none" ? "" : defaults.confirmTitle || "CONFIRM");
    content.body = message;
    content.footer = '<button class="cxmodal__footer-button" type="button" data-cxmodal-action="cancel">Cancel</button><button class="cxmodal__footer-button" type="button" data-cxmodal-action="ok">OK</button>';
    content.bodyIsHtml = false;
    content.footerIsHtml = true;
  }
  return content;
}
function buildAlertContent(message, defaults, type) {
  const content = {
    type,
    header: type === "confirm" ? defaults.confirmTitle === "none" ? "" : defaults.confirmTitle || "CONFIRM" : defaults.alertTitle === "none" ? "" : defaults.alertTitle || "ALERT",
    body: message == null ? "" : String(message),
    bodyIsHtml: false,
    footer: '<button class="cxmodal__footer-button" type="button" data-cxmodal-action="ok">OK</button>',
    footerIsHtml: true
  };
  if (type === "confirm") {
    content.footer = '<button class="cxmodal__footer-button" type="button" data-cxmodal-action="cancel">Cancel</button>' + content.footer;
  }
  return content;
}

// src/types.ts
var DEFAULT_OPTIONS = {
  background: "close",
  draggable: true,
  defaultTitle: "title",
  defaultDescription: "alt",
  alertTitle: "ALERT",
  confirmTitle: "CONFIRM",
  alertOverride: false,
  confirmOverride: false,
  hideclose: false
};
var TRIGGER_SELECTOR = "[data-cxmodal-alert], [data-cxmodal-confirm], [data-cxmodal-iframe], [data-cxmodal-ajax], [data-cxmodal-image], [data-cxmodal]";
var defaultsProvider = () => ({ ...DEFAULT_OPTIONS });
var TriggerModel = class _TriggerModel {
  constructor(elem) {
    this.targetElem = elem || null;
    this.data = {
      type: "",
      href: "",
      title: "",
      description: "",
      message: "",
      messageType: "",
      messageTitle: ""
    };
    this.settings = {};
  }
  init(defaults) {
    if (!this.targetElem) return;
    const base = defaults || defaultsProvider();
    const dataset = this.targetElem.dataset;
    this.settings = { ...base };
    if (dataset.cxmodalBackground) {
      this.settings.background = dataset.cxmodalBackground;
    }
    if (dataset.cxmodalDraggable !== void 0) {
      this.settings.draggable = _TriggerModel.parseBoolean(
        dataset.cxmodalDraggable,
        !!base.draggable
      );
    }
    if (dataset.cxmodalHideclose !== void 0) {
      this.settings.hideclose = _TriggerModel.parseBoolean(
        dataset.cxmodalHideclose,
        !!base.hideclose
      );
    }
    this.getData(base);
  }
  resetData() {
    this.data.type = "";
    this.data.href = "";
    this.data.title = "";
    this.data.description = "";
    this.data.message = "";
    this.data.messageType = "";
    this.data.messageTitle = "";
  }
  getData(defaults) {
    if (!this.targetElem) return;
    const dataset = this.targetElem.dataset;
    this.resetData();
    this.data.href = this.targetElem.getAttribute("href") || "";
    if (!this.data.href) {
      this.data.href = this.targetElem.getAttribute("src") || "";
    }
    if (dataset.cxmodal && dataset.cxmodal > "") {
      this.data.href = dataset.cxmodal;
    }
    if (dataset.cxmodalAjax !== void 0) {
      this.data.href = dataset.cxmodalAjax ? dataset.cxmodalAjax : this.data.href;
      this.data.type = "ajax";
    } else if (dataset.cxmodalIframe !== void 0) {
      this.data.href = dataset.cxmodalIframe ? dataset.cxmodalIframe : this.data.href;
      this.data.type = "iframe";
    } else if (dataset.cxmodalImage !== void 0) {
      this.data.href = dataset.cxmodalImage ? dataset.cxmodalImage : this.data.href;
      this.data.type = "image";
    }
    if (dataset.cxmodalConfirm !== void 0) {
      this.data.message = dataset.cxmodalConfirm ? dataset.cxmodalConfirm : this.data.href;
      this.data.messageType = "confirm";
      if (dataset.cxmodalConfirmTitle) {
        this.data.messageTitle = dataset.cxmodalConfirmTitle;
      }
    } else if (dataset.cxmodalAlert !== void 0) {
      this.data.message = dataset.cxmodalAlert ? dataset.cxmodalAlert : this.data.href;
      this.data.messageType = "alert";
      if (dataset.cxmodalAlertTitle) {
        this.data.messageTitle = dataset.cxmodalAlertTitle;
      }
    }
    this.data.title = this.resolveMeta(
      dataset.cxmodalTitle,
      defaults.defaultTitle || "title",
      "title"
    );
    this.data.description = this.resolveMeta(
      dataset.cxmodalDescription,
      defaults.defaultDescription || "alt",
      "alt"
    );
    if (!this.data.type) {
      this.guessType();
    }
  }
  resolveMeta(value, defaultMode, attrName) {
    const mode = value !== void 0 ? value : defaultMode;
    if (mode === void 0 || mode === null || mode === "none") return "";
    if (mode === "title" || mode === "alt") {
      return this.readAttr(mode);
    }
    if (value !== void 0 && value !== "") {
      return value;
    }
    return this.readAttr(attrName) || this.readAttr(defaultMode === "alt" ? "alt" : "title");
  }
  readAttr(attrName) {
    if (!attrName || attrName === "none" || !this.targetElem) return "";
    const value = this.targetElem.getAttribute(attrName);
    if (value) return value;
    const nested = this.targetElem.querySelector(`[${attrName}]`);
    return nested ? nested.getAttribute(attrName) || "" : "";
  }
  guessType() {
    const href = this.data.href || "";
    const ext = getFileExtension(href);
    let type = "message";
    if (isImageExt(ext)) {
      type = "image";
    } else if (isAjaxExt(ext)) {
      type = "ajax";
    } else if (/^https?:\/\//i.test(href)) {
      type = "iframe";
    }
    this.data.type = type;
  }
  static parseBoolean(value, fallback) {
    if (typeof value === "boolean") return value;
    if (value === void 0 || value === null || value === "") return !!fallback;
    const normalized = String(value).toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
    return !!fallback;
  }
};
function getFileExtension(href) {
  const path = href.split("?")[0].split("#")[0];
  const parts = path.split(".");
  if (parts.length < 2) return "";
  return parts.pop().toLowerCase();
}
function isImageExt(ext) {
  return ["jpg", "jpeg", "gif", "png", "webp", "svg", "avif"].includes(ext);
}
function isAjaxExt(ext) {
  return ["php", "htm", "html", "txt"].includes(ext);
}

// src/modal.ts
var TEMPLATE = '<div class="cxmodal__window" role="dialog" aria-modal="true" aria-labelledby="cxmodal-title" tabindex="-1"><div class="cxmodal__header" id="cxmodal-title"></div><button type="button" class="cxmodal__close" aria-label="Close">&times;</button><div class="cxmodal__body" id="cxmodal-desc"></div></div>';
var FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
var Modal = class {
  constructor(options = {}) {
    /** @internal Legacy view state exposed on CXview */
    this.elem = null;
    /** @internal Two-step trigger model */
    this.modal = null;
    this.bgrElem = null;
    this.previousFocus = null;
    this.offsetX = 0;
    this.offsetY = 0;
    this._xhr = null;
    this._initialized = false;
    this._nativeAlert = null;
    this._nativeConfirm = null;
    this._onKeyDown = null;
    this._onDragMove = null;
    this._onDragEnd = null;
    this._previousBodyOverflow = "";
    this._handlers = /* @__PURE__ */ new Map();
    this._confirmResolvers = [];
    this._lastContentType = "";
    this._autoInit = options.autoInit !== false;
    this.defaults = { ...DEFAULT_OPTIONS, ...options };
    this.options = {};
    if (this._autoInit && typeof window !== "undefined") {
      window.addEventListener("load", () => this.init());
    }
  }
  on(event, handler) {
    if (!this._handlers.has(event)) {
      this._handlers.set(event, /* @__PURE__ */ new Set());
    }
    this._handlers.get(event).add(handler);
    return () => {
      var _a;
      return (_a = this._handlers.get(event)) == null ? void 0 : _a.delete(handler);
    };
  }
  emit(event, detail = {}) {
    var _a;
    (_a = this._handlers.get(event)) == null ? void 0 : _a.forEach((handler) => handler(detail));
  }
  init() {
    if (this.options && Object.keys(this.options).length) {
      this.defaults = { ...this.defaults, ...this.options };
    }
    this.bindTriggers(document);
    if (this._initialized) return;
    this._initialized = true;
    if (this.defaults.alertOverride) {
      if (!this._nativeAlert) this._nativeAlert = window.alert;
      window.alert = (message) => {
        this.open(buildAlertContent(message, this.defaults, "alert"), {
          ...this.defaults
        });
      };
    }
    if (this.defaults.confirmOverride) {
      if (!this._nativeConfirm) this._nativeConfirm = window.confirm;
      window.confirm = () => {
        this.open(buildAlertContent("", this.defaults, "confirm"), {
          ...this.defaults
        });
        return false;
      };
    }
  }
  bindTriggers(root = document) {
    const elems = root.querySelectorAll(TRIGGER_SELECTOR);
    for (let i = 0; i < elems.length; i++) {
      const el = elems[i];
      if (el.modal) continue;
      const model = new TriggerModel(el);
      el.modal = model;
      el.addEventListener("click", (event) => this.openFromEvent(event), false);
    }
  }
  open(content, settings, triggerModel) {
    this.emit("beforeOpen", { content, settings });
    this.previousFocus = document.activeElement;
    this.modal = triggerModel || null;
    this.renderShell(settings || this.defaults);
    if (!this.elem || !this.bgrElem) return;
    this._lastContentType = content.type || "";
    if (content.type) {
      this.elem.classList.add("cxmodal--" + content.type);
    }
    const header = this.elem.querySelector(".cxmodal__header");
    const body = this.elem.querySelector(".cxmodal__body");
    if (header) header.textContent = content.header || "";
    if (body) {
      if (content.bodyIsHtml) {
        body.innerHTML = content.body || "";
      } else {
        body.textContent = content.body || "";
      }
    }
    if (content.footer && this.elem) {
      const footer = document.createElement("div");
      footer.className = "cxmodal__footer";
      if (content.footerIsHtml === false) {
        footer.textContent = content.footer;
      } else {
        footer.innerHTML = content.footer;
      }
      this.elem.appendChild(footer);
    }
    if (content.ajaxUrl && body instanceof HTMLElement) {
      this.ajax(content.ajaxUrl, body);
    }
    this.lockScroll();
    this.bgrElem.style.display = "flex";
    this.bindKeys();
    const focusTarget = this.elem.querySelector(
      "[data-cxmodal-action='ok'], .cxmodal__close"
    );
    if (focusTarget) focusTarget.focus();
    this.emit("open", { content, settings });
  }
  close(ok) {
    this.emit("beforeClose", { result: ok });
    this.abortAjax();
    this.dragStop();
    this.unbindKeys();
    this.unlockScroll();
    if (this.bgrElem) {
      this.bgrElem.style.display = "none";
    }
    const nextModal = ok && this.modal ? this.modal : null;
    this.modal = null;
    if (this.previousFocus && typeof this.previousFocus.focus === "function") {
      try {
        this.previousFocus.focus();
      } catch (e) {
      }
    }
    this.previousFocus = null;
    if (this._lastContentType === "confirm") {
      this.resolveConfirm(!!ok);
    }
    this._lastContentType = "";
    this.emit("close", { result: ok });
    if (nextModal) {
      this.openFromModel(nextModal);
    }
  }
  alert(message) {
    return new Promise((resolve) => {
      const unsub = this.on("close", () => {
        unsub();
        resolve();
      });
      this.open(buildAlertContent(message, this.defaults, "alert"), {
        ...this.defaults
      });
    });
  }
  confirm(message) {
    return new Promise((resolve) => {
      this._confirmResolvers.push(resolve);
      this.open(buildAlertContent(message, this.defaults, "confirm"), {
        ...this.defaults
      });
    });
  }
  resolveConfirm(value) {
    const resolver = this._confirmResolvers.shift();
    if (resolver) resolver(value);
  }
  openFromEvent(event) {
    const target = event.currentTarget;
    if (!(target == null ? void 0 : target.modal)) return;
    const model = target.modal;
    model.init(this.defaults);
    event.preventDefault();
    const content = buildContent(model, this.defaults);
    const settings = model.settings;
    if (model.data.messageType === "alert" || model.data.messageType === "confirm") {
      this.open(content, settings, model);
    } else {
      this.open(content, settings);
    }
  }
  openFromModel(model) {
    model.data.messageType = "";
    const content = buildContent(model, this.defaults);
    this.open(content, model.settings);
  }
  /** Legacy CXcontrol.open(evt, type) */
  openLegacy(evt, type) {
    if (type) {
      this.open(buildAlertContent(evt, this.defaults, type), {
        ...this.defaults
      });
      return;
    }
    if (evt instanceof Event) {
      this.openFromEvent(evt);
      return;
    }
    this.openFromModel(evt);
  }
  getContent(model) {
    return buildContent(model, this.defaults);
  }
  abortAjax() {
    if (this._xhr) {
      try {
        this._xhr.abort();
      } catch (e) {
      }
      this._xhr = null;
    }
  }
  ajax(url, target) {
    this.abortAjax();
    if (!isSafeUrl(url)) {
      if (target) target.textContent = "Blocked unsafe URL.";
      return false;
    }
    if (typeof XMLHttpRequest === "undefined") {
      if (target) target.textContent = "AJAX is not supported in this browser.";
      return false;
    }
    const xhr = new XMLHttpRequest();
    this._xhr = xhr;
    xhr.open("GET", url, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;
      if (this._xhr === xhr) this._xhr = null;
      if (!target || !target.isConnected) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        target.innerHTML = xhr.responseText;
      } else if (xhr.status !== 0) {
        target.textContent = "Could not load content (" + xhr.status + ").";
      }
    };
    xhr.send(null);
    return null;
  }
  destroy() {
    var _a;
    this.abortAjax();
    this.dragStop();
    this.unbindKeys();
    this.unlockScroll();
    if ((_a = this.bgrElem) == null ? void 0 : _a.parentNode) {
      this.bgrElem.parentNode.removeChild(this.bgrElem);
    }
    this.bgrElem = null;
    this.elem = null;
    this._handlers.clear();
  }
  /** Legacy CXview.init — render overlay shell only */
  initView(settings) {
    this.renderShell(settings);
  }
  renderShell(settings) {
    var _a;
    this.abortAjax();
    this.dragStop();
    if ((_a = this.bgrElem) == null ? void 0 : _a.parentNode) {
      this.bgrElem.parentNode.removeChild(this.bgrElem);
    }
    this.unbindKeys();
    const newElem = document.createElement("div");
    newElem.innerHTML = TEMPLATE;
    newElem.className = "cxmodal";
    const bg = settings.background || this.defaults.background || "close";
    newElem.classList.add("cxmodal--background-" + bg);
    if (bg === "close") {
      newElem.addEventListener("click", () => this.close());
    }
    const draggable = coerceBoolean(
      settings.draggable,
      coerceBoolean(this.defaults.draggable, true)
    );
    if (draggable) {
      newElem.classList.add("cxmodal--draggable");
      const winHeader = newElem.querySelector(".cxmodal__header");
      winHeader == null ? void 0 : winHeader.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        this.dragStart(e);
      });
    }
    const winElem = newElem.querySelector(".cxmodal__window");
    winElem.addEventListener("click", (event) => {
      const target = event.target;
      const actionEl = target.closest ? target.closest("[data-cxmodal-action]") : target;
      const action = actionEl instanceof HTMLElement ? actionEl.getAttribute("data-cxmodal-action") : null;
      if (action === "ok") this.close(true);
      if (action === "cancel") this.close(false);
      event.stopPropagation();
    });
    const closeBtn = newElem.querySelector(".cxmodal__close");
    const hideclose = coerceBoolean(
      settings.hideclose,
      coerceBoolean(this.defaults.hideclose, false)
    );
    if (hideclose) {
      closeBtn.style.display = "none";
    } else {
      closeBtn.addEventListener("click", () => this.close());
    }
    document.body.appendChild(newElem);
    this.bgrElem = newElem;
    this.elem = winElem;
    this.elem.setAttribute("aria-describedby", "cxmodal-desc");
  }
  lockScroll() {
    if (this._previousBodyOverflow === "" && document.body.style.overflow !== "hidden") {
      this._previousBodyOverflow = document.body.style.overflow;
    }
    document.body.style.overflow = "hidden";
  }
  unlockScroll() {
    document.body.style.overflow = this._previousBodyOverflow || "";
    this._previousBodyOverflow = "";
  }
  bindKeys() {
    this.unbindKeys();
    this._onKeyDown = (event) => {
      if (event.key === "Escape" || event.keyCode === 27) {
        event.preventDefault();
        this.close(false);
        return;
      }
      if (event.key === "Tab" || event.keyCode === 9) {
        this.trapFocus(event);
      }
    };
    document.addEventListener("keydown", this._onKeyDown);
  }
  unbindKeys() {
    if (this._onKeyDown) {
      document.removeEventListener("keydown", this._onKeyDown);
      this._onKeyDown = null;
    }
  }
  trapFocus(event) {
    if (!this.elem) return;
    const nodes = this.elem.querySelectorAll(FOCUSABLE);
    const focusable = [];
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node.disabled && node.offsetParent !== null) {
        focusable.push(node);
      }
    }
    if (!focusable.length) {
      event.preventDefault();
      this.elem.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  dragStart(event) {
    if (!this.elem) return;
    const rect = this.elem.getBoundingClientRect();
    this.elem.style.opacity = "0.95";
    this.offsetX = event.clientX - rect.left;
    this.offsetY = event.clientY - rect.top;
    this.elem.style.margin = "0";
    document.body.style.cursor = "move";
    this._onDragMove = (e) => this.drag(e);
    this._onDragEnd = (e) => {
      this.dragStop();
      e.stopPropagation();
    };
    document.addEventListener("mousemove", this._onDragMove);
    document.addEventListener("mouseup", this._onDragEnd);
    this.drag(event);
  }
  drag(event) {
    if (!this.elem) return;
    this.elem.style.left = event.clientX - this.offsetX + "px";
    this.elem.style.top = event.clientY - this.offsetY + "px";
    this.elem.style.position = "absolute";
  }
  dragStop() {
    if (this.elem) {
      this.elem.style.opacity = "1";
    }
    document.body.style.cursor = "";
    if (this._onDragMove) {
      document.removeEventListener("mousemove", this._onDragMove);
      this._onDragMove = null;
    }
    if (this._onDragEnd) {
      document.removeEventListener("mouseup", this._onDragEnd);
      this._onDragEnd = null;
    }
  }
};

// src/index.ts
var defaultInstance = null;
function createModal(options = {}) {
  return new Modal({ ...options, autoInit: false });
}
function getDefaultModal() {
  if (!defaultInstance) {
    defaultInstance = new Modal({ autoInit: true });
  }
  return defaultInstance;
}
export {
  Modal,
  TriggerModel,
  createModal,
  getDefaultModal
};
//# sourceMappingURL=cxmodal.esm.js.map
