//--------------------------------------------------------------------------
// CXview
//--------------------------------------------------------------------------
/**
 * The View-class
 *
 * @class
 */
CXview = {

    /**
     * HTML-template for the modal window
     */
    TEMPLATE: '\
        <div class="cxmodal__window" role="dialog" aria-modal="true" aria-labelledby="cxmodal-title" tabindex="-1">\
            <div class="cxmodal__header" id="cxmodal-title"></div>\
            <button type="button" class="cxmodal__close" aria-label="Close">&times;</button>\
            <div class="cxmodal__body" id="cxmodal-desc"></div>\
        </div>',

    /* Reference to the window element */
    elem: null,

    /* Reference to the data-model object */
    modal: null,

    /* Reference to the overlay element (modal background) */
    bgrElem: null,

    /* Element that had focus before the modal opened */
    previousFocus: null,

    /* Bound keydown handler for Escape / focus trap */
    _onKeyDown: null,

    /* Bound drag move / end handlers */
    _onDragMove: null,
    _onDragEnd: null,

    /* Previous body overflow before scroll lock */
    _previousBodyOverflow: "",

    /* Offset-values for the window when drag'n'drop */
    offsetX: 0,
    offsetY: 0,

    /**
     * Focusable control selector inside the dialog
     */
    FOCUSABLE: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',

    /**
     * Renders the modal structure with the right settings and adds eventlisteners
     *
     * @param   {object}  settings
     */
    init: function(settings) {
        CXcontrol.abortAjax();
        CXview.dragStop();

        if (CXview.bgrElem && CXview.bgrElem.parentNode) {
            CXview.bgrElem.parentNode.removeChild(CXview.bgrElem);
        }
        CXview.unbindKeys();

        var newElem = document.createElement("div");
        newElem.innerHTML = CXview.TEMPLATE;
        newElem.className = "cxmodal";
        if (settings) {
            newElem.classList.add("cxmodal--background-" + settings.background);
            if (settings.background == "close") {
                newElem.addEventListener("click", function() {
                    CXview.close();
                });
            }
            if (settings.draggable) {
                newElem.classList.add("cxmodal--draggable");
                var winHeader = newElem.querySelector(".cxmodal__header");
                winHeader.addEventListener("mousedown", function (e) {
                    if (e.button !== 0) return;
                    e.preventDefault();
                    CXview.dragStart(e);
                });
            }
        }
        var winElem = newElem.querySelector(".cxmodal__window");
        // Handle OK/Cancel on the window itself — stopPropagation below would
        // otherwise prevent these clicks from reaching a listener on the overlay.
        winElem.addEventListener("click", function(event) {
            var actionEl = event.target.closest
                ? event.target.closest("[data-cxmodal-action]")
                : event.target;
            var action = actionEl && actionEl.getAttribute && actionEl.getAttribute("data-cxmodal-action");
            if (action === "ok") CXview.close(true);
            if (action === "cancel") CXview.close(false);
            event.stopPropagation();
        });
        var closeBtn = newElem.querySelector(".cxmodal__close");
        if (settings && settings.hideclose) {
            closeBtn.style.display = "none";
        } else {
            closeBtn.addEventListener("click", function() {
                CXview.close();
            });
        }
        document.body.appendChild(newElem);
        CXview.bgrElem = newElem;
        CXview.elem = winElem;
        CXview.elem.setAttribute("aria-describedby", "cxmodal-desc");
    },

    /**
     * Render the content with its settings and show the modal window
     */
    open: function(content, settings, modal){
        CXview.previousFocus = document.activeElement;
        CXview.modal = modal || null;
        CXview.init(settings);
        if (content.type) {
            CXview.elem.classList.add("cxmodal--" + content.type);
        }

        var header = CXview.elem.querySelector(".cxmodal__header");
        var body = CXview.elem.querySelector(".cxmodal__body");
        header.textContent = content.header || "";

        if (content.bodyIsHtml) {
            body.innerHTML = content.body || "";
        } else {
            body.textContent = content.body || "";
        }

        if (content.footer) {
            var footer = document.createElement("div");
            footer.className = "cxmodal__footer";
            if (content.footerIsHtml === false) {
                footer.textContent = content.footer;
            } else {
                footer.innerHTML = content.footer;
            }
            CXview.elem.appendChild(footer);
        }

        if (content.ajaxUrl) {
            CXcontrol.ajax(content.ajaxUrl, body);
        }

        CXview.lockScroll();
        CXview.bgrElem.style.display = "flex";
        CXview.bindKeys();

        var focusTarget = CXview.elem.querySelector("[data-cxmodal-action='ok'], .cxmodal__close");
        if (focusTarget) focusTarget.focus();
    },

    /**
     * Close (hide) the modal window, or open it again with the "next" content
     */
    close: function(ok) {
        CXcontrol.abortAjax();
        CXview.dragStop();
        CXview.unbindKeys();
        CXview.unlockScroll();
        if (CXview.bgrElem) {
            CXview.bgrElem.style.display = "none";
        }
        var nextModal = ok && CXview.modal ? CXview.modal : null;
        CXview.modal = null;
        if (CXview.previousFocus && typeof CXview.previousFocus.focus === "function") {
            try { CXview.previousFocus.focus(); } catch (e) { /* ignore */ }
        }
        CXview.previousFocus = null;
        if (nextModal) {
            CXcontrol.open(nextModal);
        }
    },

    /**
     * Prevent background page scroll while the modal is open
     */
    lockScroll: function() {
        if (CXview._previousBodyOverflow === "" && document.body.style.overflow !== "hidden") {
            CXview._previousBodyOverflow = document.body.style.overflow;
        }
        document.body.style.overflow = "hidden";
    },

    unlockScroll: function() {
        document.body.style.overflow = CXview._previousBodyOverflow || "";
        CXview._previousBodyOverflow = "";
    },

    /**
     * Close on Escape and trap Tab focus inside the dialog
     */
    bindKeys: function() {
        CXview.unbindKeys();
        CXview._onKeyDown = function(event) {
            if (event.key === "Escape" || event.keyCode === 27) {
                event.preventDefault();
                CXview.close(false);
                return;
            }
            if (event.key === "Tab" || event.keyCode === 9) {
                CXview.trapFocus(event);
            }
        };
        document.addEventListener("keydown", CXview._onKeyDown);
    },

    unbindKeys: function() {
        if (CXview._onKeyDown) {
            document.removeEventListener("keydown", CXview._onKeyDown);
            CXview._onKeyDown = null;
        }
    },

    /**
     * Keep keyboard focus cycling inside the modal
     *
     * @param {KeyboardEvent} event
     */
    trapFocus: function(event) {
        if (!CXview.elem) return;
        var nodes = CXview.elem.querySelectorAll(CXview.FOCUSABLE);
        var focusable = [];
        var i;
        for (i = 0; i < nodes.length; i++) {
            if (!nodes[i].disabled && nodes[i].offsetParent !== null) {
                focusable.push(nodes[i]);
            }
        }
        if (!focusable.length) {
            event.preventDefault();
            CXview.elem.focus();
            return;
        }
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    },

    /**
     * Start drag'n'drop and set the offset values
     */
    dragStart: function (event) {
        var rect = CXview.elem.getBoundingClientRect();
        CXview.elem.style.opacity = 0.95;
        CXview.offsetX = event.clientX - rect.left;
        CXview.offsetY = event.clientY - rect.top;
        CXview.elem.style.margin = 0;
        document.body.style.cursor = "move";

        CXview._onDragMove = function (e) {
            CXview.drag(e);
        };
        CXview._onDragEnd = function (e) {
            CXview.dragStop();
            e.stopPropagation();
        };
        document.addEventListener("mousemove", CXview._onDragMove);
        document.addEventListener("mouseup", CXview._onDragEnd);
        CXview.drag(event);
    },

    /**
     * Listen for the mouse event to drag the window
     * 
     * @param {MouseEvent} event 
     */
    drag: function (event) {
        CXview.elem.style.left = event.clientX - CXview.offsetX + "px";
        CXview.elem.style.top = event.clientY - CXview.offsetY + "px";
        CXview.elem.style.position = "absolute";
    },

    /**
     * Stop drag and remove its event listeners
     */
    dragStop: function () {
        if (CXview.elem) {
            CXview.elem.style.opacity = 1;
        }
        document.body.style.cursor = "";
        if (CXview._onDragMove) {
            document.removeEventListener("mousemove", CXview._onDragMove);
            CXview._onDragMove = null;
        }
        if (CXview._onDragEnd) {
            document.removeEventListener("mouseup", CXview._onDragEnd);
            CXview._onDragEnd = null;
        }
    }
    
}
