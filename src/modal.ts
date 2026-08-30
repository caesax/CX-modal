import { buildAlertContent, buildContent } from "./content-builder.js";
import {
  DEFAULT_OPTIONS,
  TRIGGER_SELECTOR,
  TriggerModel,
  type ModalContent,
  type ModalEvent,
  type ModalEventDetail,
  type ModalEventHandler,
  type ModalOptions,
  type TriggerModelLike,
} from "./types.js";
import { coerceBoolean, isSafeUrl, sanitizeUrl } from "./url-guard.js";

const TEMPLATE =
  '<div class="cxmodal__window" role="dialog" aria-modal="true" aria-labelledby="cxmodal-title" tabindex="-1">' +
  '<div class="cxmodal__header" id="cxmodal-title"></div>' +
  '<button type="button" class="cxmodal__close" aria-label="Close">&times;</button>' +
  '<div class="cxmodal__body" id="cxmodal-desc"></div>' +
  "</div>";

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export class Modal {
  defaults: ModalOptions;
  options: ModalOptions;

  /** @internal Legacy view state exposed on CXview */
  elem: HTMLElement | null = null;
  /** @internal Two-step trigger model */
  modal: TriggerModelLike | null = null;
  bgrElem: HTMLElement | null = null;
  previousFocus: Element | null = null;
  offsetX = 0;
  offsetY = 0;

  private _xhr: XMLHttpRequest | null = null;
  private _initialized = false;
  private _nativeAlert: typeof window.alert | null = null;
  private _nativeConfirm: typeof window.confirm | null = null;
  private _onKeyDown: ((event: KeyboardEvent) => void) | null = null;
  private _onDragMove: ((event: MouseEvent) => void) | null = null;
  private _onDragEnd: ((event: MouseEvent) => void) | null = null;
  private _previousBodyOverflow = "";
  private _handlers = new Map<ModalEvent, Set<ModalEventHandler>>();
  private _confirmResolvers: Array<(value: boolean) => void> = [];
  private _lastContentType = "";
  private _autoInit: boolean;

  constructor(options: ModalOptions = {}) {
    this._autoInit = options.autoInit !== false;
    this.defaults = { ...DEFAULT_OPTIONS, ...options };
    this.options = {};

    if (this._autoInit && typeof window !== "undefined") {
      window.addEventListener("load", () => this.init());
    }
  }

  on(event: ModalEvent, handler: ModalEventHandler): () => void {
    if (!this._handlers.has(event)) {
      this._handlers.set(event, new Set());
    }
    this._handlers.get(event)!.add(handler);
    return () => this._handlers.get(event)?.delete(handler);
  }

  private emit(event: ModalEvent, detail: ModalEventDetail = {}): void {
    this._handlers.get(event)?.forEach((handler) => handler(detail));
  }

  init(): void {
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
          ...this.defaults,
        });
      };
    }

    if (this.defaults.confirmOverride) {
      if (!this._nativeConfirm) this._nativeConfirm = window.confirm;
      window.confirm = () => {
        this.open(buildAlertContent("", this.defaults, "confirm"), {
          ...this.defaults,
        });
        return false;
      };
    }
  }

  bindTriggers(root: ParentNode = document): void {
    const elems = root.querySelectorAll(TRIGGER_SELECTOR);
    for (let i = 0; i < elems.length; i++) {
      const el = elems[i] as HTMLElement;
      if (el.modal) continue;
      const model = new TriggerModel(el);
      el.modal = model;
      el.addEventListener("click", (event) => this.openFromEvent(event), false);
    }
  }

  open(content: ModalContent, settings?: ModalOptions, triggerModel?: TriggerModelLike): void {
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
      "[data-cxmodal-action='ok'], .cxmodal__close",
    ) as HTMLElement | null;
    if (focusTarget) focusTarget.focus();

    this.emit("open", { content, settings });
  }

  close(ok?: boolean): void {
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

    if (
      this.previousFocus &&
      typeof (this.previousFocus as HTMLElement).focus === "function"
    ) {
      try {
        (this.previousFocus as HTMLElement).focus();
      } catch {
        /* ignore */
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

  alert(message: string): Promise<void> {
    return new Promise((resolve) => {
      const unsub = this.on("close", () => {
        unsub();
        resolve();
      });
      this.open(buildAlertContent(message, this.defaults, "alert"), {
        ...this.defaults,
      });
    });
  }

  confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this._confirmResolvers.push(resolve);
      this.open(buildAlertContent(message, this.defaults, "confirm"), {
        ...this.defaults,
      });
    });
  }

  private resolveConfirm(value: boolean): void {
    const resolver = this._confirmResolvers.shift();
    if (resolver) resolver(value);
  }

  openFromEvent(event: Event): void {
    const target = event.currentTarget as HTMLElement | null;
    if (!target?.modal) return;

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

  openFromModel(model: TriggerModelLike): void {
    model.data.messageType = "";
    const content = buildContent(model, this.defaults);
    this.open(content, model.settings);
  }

  /** Legacy CXcontrol.open(evt, type) */
  openLegacy(evt: unknown, type?: string): void {
    if (type) {
      this.open(buildAlertContent(evt, this.defaults, type as "alert" | "confirm"), {
        ...this.defaults,
      });
      return;
    }

    if (evt instanceof Event) {
      this.openFromEvent(evt);
      return;
    }

    this.openFromModel(evt as TriggerModelLike);
  }

  getContent(model: TriggerModelLike): ModalContent {
    return buildContent(model, this.defaults);
  }

  abortAjax(): void {
    if (this._xhr) {
      try {
        this._xhr.abort();
      } catch {
        /* ignore */
      }
      this._xhr = null;
    }
  }

  ajax(url: string, target?: HTMLElement | null): false | null {
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

  destroy(): void {
    this.abortAjax();
    this.dragStop();
    this.unbindKeys();
    this.unlockScroll();
    if (this.bgrElem?.parentNode) {
      this.bgrElem.parentNode.removeChild(this.bgrElem);
    }
    this.bgrElem = null;
    this.elem = null;
    this._handlers.clear();
  }

  /** Legacy CXview.init — render overlay shell only */
  initView(settings: ModalOptions): void {
    this.renderShell(settings);
  }

  private renderShell(settings: ModalOptions): void {
    this.abortAjax();
    this.dragStop();

    if (this.bgrElem?.parentNode) {
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
      coerceBoolean(this.defaults.draggable, true),
    );

    if (draggable) {
      newElem.classList.add("cxmodal--draggable");
      const winHeader = newElem.querySelector(".cxmodal__header");
      winHeader?.addEventListener("mousedown", (e: Event) => {
        const me = e as MouseEvent;
        if (me.button !== 0) return;
        e.preventDefault();
        this.dragStart(me);
      });
    }

    const winElem = newElem.querySelector(".cxmodal__window") as HTMLElement;
    winElem.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const actionEl = target.closest
        ? target.closest("[data-cxmodal-action]")
        : target;
      const action =
        actionEl instanceof HTMLElement
          ? actionEl.getAttribute("data-cxmodal-action")
          : null;
      if (action === "ok") this.close(true);
      if (action === "cancel") this.close(false);
      event.stopPropagation();
    });

    const closeBtn = newElem.querySelector(".cxmodal__close") as HTMLElement;
    const hideclose = coerceBoolean(
      settings.hideclose,
      coerceBoolean(this.defaults.hideclose, false),
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

  lockScroll(): void {
    if (this._previousBodyOverflow === "" && document.body.style.overflow !== "hidden") {
      this._previousBodyOverflow = document.body.style.overflow;
    }
    document.body.style.overflow = "hidden";
  }

  unlockScroll(): void {
    document.body.style.overflow = this._previousBodyOverflow || "";
    this._previousBodyOverflow = "";
  }

  bindKeys(): void {
    this.unbindKeys();
    this._onKeyDown = (event: KeyboardEvent) => {
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

  unbindKeys(): void {
    if (this._onKeyDown) {
      document.removeEventListener("keydown", this._onKeyDown);
      this._onKeyDown = null;
    }
  }

  trapFocus(event: KeyboardEvent): void {
    if (!this.elem) return;
    const nodes = this.elem.querySelectorAll(FOCUSABLE);
    const focusable: HTMLElement[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i] as HTMLElement;
      if (!(node as HTMLButtonElement).disabled && node.offsetParent !== null) {
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

  dragStart(event: MouseEvent): void {
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

  drag(event: MouseEvent): void {
    if (!this.elem) return;
    this.elem.style.left = event.clientX - this.offsetX + "px";
    this.elem.style.top = event.clientY - this.offsetY + "px";
    this.elem.style.position = "absolute";
  }

  dragStop(): void {
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
}
