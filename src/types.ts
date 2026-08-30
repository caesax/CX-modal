export type BackgroundMode = "close" | "block" | "none";

export interface ModalOptions {
  background?: BackgroundMode;
  draggable?: boolean | string;
  defaultTitle?: string;
  defaultDescription?: string;
  alertTitle?: string;
  confirmTitle?: string;
  alertOverride?: boolean;
  confirmOverride?: boolean;
  hideclose?: boolean | string;
  autoInit?: boolean;
}

export interface ModalContent {
  type?: string;
  header?: string;
  body?: string;
  bodyIsHtml?: boolean;
  footer?: string;
  footerIsHtml?: boolean;
  ajaxUrl?: string;
}

export interface TriggerData {
  type: string;
  href: string;
  title: string;
  description: string;
  message: string;
  messageType: string;
  messageTitle: string;
}

export interface TriggerModelLike {
  targetElem: HTMLElement | null;
  data: TriggerData;
  settings: ModalOptions;
  init(): void;
}

export type ModalEvent = "beforeOpen" | "open" | "beforeClose" | "close";

export interface ModalEventDetail {
  content?: ModalContent;
  settings?: ModalOptions;
  result?: boolean | undefined;
}

export type ModalEventHandler = (detail: ModalEventDetail) => void;

export const DEFAULT_OPTIONS: Required<
  Pick<
    ModalOptions,
    | "background"
    | "draggable"
    | "defaultTitle"
    | "defaultDescription"
    | "alertTitle"
    | "confirmTitle"
    | "alertOverride"
    | "confirmOverride"
    | "hideclose"
  >
> = {
  background: "close",
  draggable: true,
  defaultTitle: "title",
  defaultDescription: "alt",
  alertTitle: "ALERT",
  confirmTitle: "CONFIRM",
  alertOverride: false,
  confirmOverride: false,
  hideclose: false,
};

export const TRIGGER_SELECTOR =
  "[data-cxmodal-alert], [data-cxmodal-confirm], [data-cxmodal-iframe], [data-cxmodal-ajax], [data-cxmodal-image], [data-cxmodal]";

let defaultsProvider: () => ModalOptions = () => ({ ...DEFAULT_OPTIONS });

export function setDefaultsProvider(provider: () => ModalOptions): void {
  defaultsProvider = provider;
}

declare global {
  interface HTMLElement {
    modal?: TriggerModel;
  }
}

export class TriggerModel {
  targetElem: HTMLElement | null;
  data: TriggerData;
  settings: ModalOptions;

  constructor(elem?: HTMLElement | null) {
    this.targetElem = elem || null;
    this.data = {
      type: "",
      href: "",
      title: "",
      description: "",
      message: "",
      messageType: "",
      messageTitle: "",
    };
    this.settings = {};
  }

  init(defaults?: ModalOptions): void {
    if (!this.targetElem) return;

    const base = defaults || defaultsProvider();
    const dataset = this.targetElem.dataset;
    this.settings = { ...base };
    if (dataset.cxmodalBackground) {
      this.settings.background = dataset.cxmodalBackground as BackgroundMode;
    }
    if (dataset.cxmodalDraggable !== undefined) {
      this.settings.draggable = TriggerModel.parseBoolean(
        dataset.cxmodalDraggable,
        !!base.draggable,
      );
    }
    if (dataset.cxmodalHideclose !== undefined) {
      this.settings.hideclose = TriggerModel.parseBoolean(
        dataset.cxmodalHideclose,
        !!base.hideclose,
      );
    }

    this.getData(base);
  }

  resetData(): void {
    this.data.type = "";
    this.data.href = "";
    this.data.title = "";
    this.data.description = "";
    this.data.message = "";
    this.data.messageType = "";
    this.data.messageTitle = "";
  }

  getData(defaults: ModalOptions): void {
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

    if (dataset.cxmodalAjax !== undefined) {
      this.data.href = dataset.cxmodalAjax ? dataset.cxmodalAjax : this.data.href;
      this.data.type = "ajax";
    } else if (dataset.cxmodalIframe !== undefined) {
      this.data.href = dataset.cxmodalIframe ? dataset.cxmodalIframe : this.data.href;
      this.data.type = "iframe";
    } else if (dataset.cxmodalImage !== undefined) {
      this.data.href = dataset.cxmodalImage ? dataset.cxmodalImage : this.data.href;
      this.data.type = "image";
    }

    if (dataset.cxmodalConfirm !== undefined) {
      this.data.message = dataset.cxmodalConfirm ? dataset.cxmodalConfirm : this.data.href;
      this.data.messageType = "confirm";
      if (dataset.cxmodalConfirmTitle) {
        this.data.messageTitle = dataset.cxmodalConfirmTitle;
      }
    } else if (dataset.cxmodalAlert !== undefined) {
      this.data.message = dataset.cxmodalAlert ? dataset.cxmodalAlert : this.data.href;
      this.data.messageType = "alert";
      if (dataset.cxmodalAlertTitle) {
        this.data.messageTitle = dataset.cxmodalAlertTitle;
      }
    }

    this.data.title = this.resolveMeta(
      dataset.cxmodalTitle,
      defaults.defaultTitle || "title",
      "title",
    );
    this.data.description = this.resolveMeta(
      dataset.cxmodalDescription,
      defaults.defaultDescription || "alt",
      "alt",
    );

    if (!this.data.type) {
      this.guessType();
    }
  }

  resolveMeta(
    value: string | undefined,
    defaultMode: string,
    attrName: string,
  ): string {
    const mode = value !== undefined ? value : defaultMode;
    if (mode === undefined || mode === null || mode === "none") return "";
    if (mode === "title" || mode === "alt") {
      return this.readAttr(mode);
    }
    if (value !== undefined && value !== "") {
      return value;
    }
    return (
      this.readAttr(attrName) ||
      this.readAttr(defaultMode === "alt" ? "alt" : "title")
    );
  }

  readAttr(attrName: string): string {
    if (!attrName || attrName === "none" || !this.targetElem) return "";
    const value = this.targetElem.getAttribute(attrName);
    if (value) return value;
    const nested = this.targetElem.querySelector(`[${attrName}]`);
    return nested ? nested.getAttribute(attrName) || "" : "";
  }

  guessType(): void {
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

  static parseBoolean(value: unknown, fallback: boolean): boolean {
    if (typeof value === "boolean") return value;
    if (value === undefined || value === null || value === "") return !!fallback;
    const normalized = String(value).toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
    return !!fallback;
  }
}

function getFileExtension(href: string): string {
  const path = href.split("?")[0].split("#")[0];
  const parts = path.split(".");
  if (parts.length < 2) return "";
  return parts.pop()!.toLowerCase();
}

function isImageExt(ext: string): boolean {
  return ["jpg", "jpeg", "gif", "png", "webp", "svg", "avif"].includes(ext);
}

function isAjaxExt(ext: string): boolean {
  return ["php", "htm", "html", "txt"].includes(ext);
}
