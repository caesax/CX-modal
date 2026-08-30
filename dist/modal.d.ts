import { type ModalContent, type ModalEvent, type ModalEventHandler, type ModalOptions, type TriggerModelLike } from "./types.js";
export declare class Modal {
    defaults: ModalOptions;
    options: ModalOptions;
    /** @internal Legacy view state exposed on CXview */
    elem: HTMLElement | null;
    /** @internal Two-step trigger model */
    modal: TriggerModelLike | null;
    bgrElem: HTMLElement | null;
    previousFocus: Element | null;
    offsetX: number;
    offsetY: number;
    private _xhr;
    private _initialized;
    private _nativeAlert;
    private _nativeConfirm;
    private _onKeyDown;
    private _onDragMove;
    private _onDragEnd;
    private _previousBodyOverflow;
    private _handlers;
    private _confirmResolvers;
    private _lastContentType;
    private _autoInit;
    constructor(options?: ModalOptions);
    on(event: ModalEvent, handler: ModalEventHandler): () => void;
    private emit;
    init(): void;
    bindTriggers(root?: ParentNode): void;
    open(content: ModalContent, settings?: ModalOptions, triggerModel?: TriggerModelLike): void;
    close(ok?: boolean): void;
    alert(message: string): Promise<void>;
    confirm(message: string): Promise<boolean>;
    private resolveConfirm;
    openFromEvent(event: Event): void;
    openFromModel(model: TriggerModelLike): void;
    /** Legacy CXcontrol.open(evt, type) */
    openLegacy(evt: unknown, type?: string): void;
    getContent(model: TriggerModelLike): ModalContent;
    abortAjax(): void;
    ajax(url: string, target?: HTMLElement | null): false | null;
    destroy(): void;
    /** Legacy CXview.init — render overlay shell only */
    initView(settings: ModalOptions): void;
    private renderShell;
    lockScroll(): void;
    unlockScroll(): void;
    bindKeys(): void;
    unbindKeys(): void;
    trapFocus(event: KeyboardEvent): void;
    dragStart(event: MouseEvent): void;
    drag(event: MouseEvent): void;
    dragStop(): void;
}
