import type { ModalContent, ModalOptions, TriggerModelLike } from "./types.js";
export declare function buildContent(model: TriggerModelLike, defaults: ModalOptions): ModalContent;
export declare function buildAlertContent(message: unknown, defaults: ModalOptions, type: "alert" | "confirm"): ModalContent;
