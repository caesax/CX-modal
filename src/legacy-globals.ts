import { Modal } from "./modal.js";
import { TriggerModel } from "./types.js";
import { escapeAttr, escapeHtml, isSafeUrl, sanitizeUrl } from "./url-guard.js";

export function createLegacyGlobals(instance: Modal) {
  const CXview = {
    TEMPLATE:
      '<div class="cxmodal__window" role="dialog" aria-modal="true" aria-labelledby="cxmodal-title" tabindex="-1">' +
      '<div class="cxmodal__header" id="cxmodal-title"></div>' +
      '<button type="button" class="cxmodal__close" aria-label="Close">&times;</button>' +
      '<div class="cxmodal__body" id="cxmodal-desc"></div>' +
      "</div>",
    get elem() {
      return instance.elem;
    },
    set elem(value: HTMLElement | null) {
      instance.elem = value;
    },
    get modal() {
      return instance.modal;
    },
    set modal(value) {
      instance.modal = value;
    },
    get bgrElem() {
      return instance.bgrElem;
    },
    set bgrElem(value: HTMLElement | null) {
      instance.bgrElem = value;
    },
    get previousFocus() {
      return instance.previousFocus;
    },
    set previousFocus(value: Element | null) {
      instance.previousFocus = value;
    },
    get offsetX() {
      return instance.offsetX;
    },
    set offsetX(value: number) {
      instance.offsetX = value;
    },
    get offsetY() {
      return instance.offsetY;
    },
    set offsetY(value: number) {
      instance.offsetY = value;
    },
    FOCUSABLE:
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    init(settings?: Parameters<Modal["open"]>[1]) {
      instance.initView(settings || instance.defaults);
    },
    open(
      content: Parameters<Modal["open"]>[0],
      settings?: Parameters<Modal["open"]>[1],
      modal?: Parameters<Modal["open"]>[2],
    ) {
      instance.open(content, settings, modal);
    },
    close(ok?: boolean) {
      instance.close(ok);
    },
    lockScroll() {
      instance.lockScroll();
    },
    unlockScroll() {
      instance.unlockScroll();
    },
    bindKeys() {
      instance.bindKeys();
    },
    unbindKeys() {
      instance.unbindKeys();
    },
    trapFocus(event: KeyboardEvent) {
      instance.trapFocus(event);
    },
    dragStart(event: MouseEvent) {
      instance.dragStart(event);
    },
    drag(event: MouseEvent) {
      instance.drag(event);
    },
    dragStop() {
      instance.dragStop();
    },
  };

  const CXcontrol = {
    get defaults() {
      return instance.defaults;
    },
    set defaults(value) {
      instance.defaults = value;
    },
    get options() {
      return instance.options;
    },
    set options(value) {
      instance.options = value;
    },
    _nativeAlert: null as typeof window.alert | null,
    _nativeConfirm: null as typeof window.confirm | null,
    _xhr: null as XMLHttpRequest | null,
    _initialized: false,
    TRIGGER_SELECTOR:
      "[data-cxmodal-alert], [data-cxmodal-confirm], [data-cxmodal-iframe], [data-cxmodal-ajax], [data-cxmodal-image], [data-cxmodal]",
    init() {
      instance.init();
    },
    bindTriggers(root?: ParentNode) {
      instance.bindTriggers(root);
    },
    escapeHtml,
    escapeAttr,
    isSafeUrl,
    sanitizeUrl,
    abortAjax() {
      instance.abortAjax();
    },
    ajax(url: string, target?: HTMLElement) {
      return instance.ajax(url, target);
    },
    open(evt: unknown, type?: string) {
      instance.openLegacy(evt, type);
    },
    getContent(model: Parameters<Modal["getContent"]>[0]) {
      return instance.getContent(model);
    },
  };

  return {
    CXmodel: TriggerModel,
    CXview,
    CXcontrol,
  };
}

export type LegacyGlobals = ReturnType<typeof createLegacyGlobals>;
