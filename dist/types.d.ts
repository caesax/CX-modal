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
export declare const DEFAULT_OPTIONS: Required<Pick<ModalOptions, "background" | "draggable" | "defaultTitle" | "defaultDescription" | "alertTitle" | "confirmTitle" | "alertOverride" | "confirmOverride" | "hideclose">>;
export declare const TRIGGER_SELECTOR = "[data-cxmodal-alert], [data-cxmodal-confirm], [data-cxmodal-iframe], [data-cxmodal-ajax], [data-cxmodal-image], [data-cxmodal]";
export declare function setDefaultsProvider(provider: () => ModalOptions): void;
declare global {
    interface HTMLElement {
        modal?: TriggerModel;
    }
}
export declare class TriggerModel {
    targetElem: HTMLElement | null;
    data: TriggerData;
    settings: ModalOptions;
    constructor(elem?: HTMLElement | null);
    init(defaults?: ModalOptions): void;
    resetData(): void;
    getData(defaults: ModalOptions): void;
    resolveMeta(value: string | undefined, defaultMode: string, attrName: string): string;
    readAttr(attrName: string): string;
    guessType(): void;
    static parseBoolean(value: unknown, fallback: boolean): boolean;
}
