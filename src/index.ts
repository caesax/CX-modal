import { Modal } from "./modal.js";
import type { ModalOptions } from "./types.js";

let defaultInstance: Modal | null = null;

export function createModal(options: ModalOptions = {}): Modal {
  return new Modal({ ...options, autoInit: false });
}

export function getDefaultModal(): Modal {
  if (!defaultInstance) {
    defaultInstance = new Modal({ autoInit: true });
  }
  return defaultInstance;
}

export { Modal } from "./modal.js";
export { TriggerModel } from "./types.js";
export type {
  ModalContent,
  ModalEvent,
  ModalEventDetail,
  ModalEventHandler,
  ModalOptions,
  BackgroundMode,
} from "./types.js";
