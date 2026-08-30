import type { ModalContent, ModalOptions, TriggerModelLike } from "./types.js";
import { escapeAttr, sanitizeUrl } from "./url-guard.js";

export function buildContent(
  model: TriggerModelLike,
  defaults: ModalOptions,
): ModalContent {
  const content: ModalContent = {};
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
      content.body =
        '<img class="cxmodal__body-img" src="' +
        href +
        '" alt="' +
        escapeAttr(description) +
        '">';
      content.bodyIsHtml = true;
    } else {
      content.body = "Blocked unsafe image URL.";
      content.bodyIsHtml = false;
    }
    content.footer = description;
    content.footerIsHtml = false;
  } else if (model.data.type === "ajax") {
    content.body = '<p class="cxmodal__loading">Loading…</p>';
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
      content.body =
        '<iframe src="' +
        href +
        '" title="' +
        escapeAttr(title || "IFRAME") +
        '" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>';
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
    content.header =
      messageTitle ||
      (defaults.alertTitle === "none" ? "" : defaults.alertTitle || "ALERT");
    content.body = message;
    content.footer =
      '<button class="cxmodal__footer-button" type="button" data-cxmodal-action="ok">OK</button>';
    content.bodyIsHtml = false;
    content.footerIsHtml = true;
  } else if (model.data.messageType === "confirm") {
    content.type = "confirm";
    content.header =
      messageTitle ||
      (defaults.confirmTitle === "none" ? "" : defaults.confirmTitle || "CONFIRM");
    content.body = message;
    content.footer =
      '<button class="cxmodal__footer-button" type="button" data-cxmodal-action="cancel">Cancel</button>' +
      '<button class="cxmodal__footer-button" type="button" data-cxmodal-action="ok">OK</button>';
    content.bodyIsHtml = false;
    content.footerIsHtml = true;
  }

  return content;
}

export function buildAlertContent(
  message: unknown,
  defaults: ModalOptions,
  type: "alert" | "confirm",
): ModalContent {
  const content: ModalContent = {
    type,
    header:
      type === "confirm"
        ? defaults.confirmTitle === "none"
          ? ""
          : defaults.confirmTitle || "CONFIRM"
        : defaults.alertTitle === "none"
          ? ""
          : defaults.alertTitle || "ALERT",
    body: message == null ? "" : String(message),
    bodyIsHtml: false,
    footer:
      '<button class="cxmodal__footer-button" type="button" data-cxmodal-action="ok">OK</button>',
    footerIsHtml: true,
  };

  if (type === "confirm") {
    content.footer =
      '<button class="cxmodal__footer-button" type="button" data-cxmodal-action="cancel">Cancel</button>' +
      content.footer;
  }

  return content;
}
