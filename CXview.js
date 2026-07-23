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
        <div class="cxmodal__window" role="dialog" aria-modal="true" aria-labelledby="cxmodal-title">\
            <div class="cxmodal__header" id="cxmodal-title"></div>\
            <button type="button" class="cxmodal__close" aria-label="Close">&times;</button>\
            <div class="cxmodal__body"></div>\
        </div>',

    /* Reference to the window element */
    elem: null,

    /* Reference to the data-model object */
    modal: null,

    /* Reference to the overlay element (modal background) */
    bgrElem: null,

    /* Element that had focus before the modal opened */
    previousFocus: null,

    /* Bound keydown handler for Escape */
    _onKeyDown: null,

    /* Offset-values for the window when drag'n'drop */
    offsetX: 0,
    offsetY: 0,

    /**
     * Renders the modal structure with the right settings and adds eventlisteners
     *
     * @param   {object}  settings
     */
    init: function(settings) {
        if (CXview.bgrElem && CXview.bgrElem.parentNode) {
            CXview.bgrElem.parentNode.removeChild(CXview.bgrElem);
        }
        CXview.unbindEscape();

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
                    CXview.dragStart(e);
                    document.onmousemove = function (e) {
                        CXview.drag(e);
                    }
                    document.onmouseup = function (e) {
                        CXview.dragStop();
                        e.stopPropagation();
                    }
                });
            }
        }
        newElem.querySelector(".cxmodal__window").addEventListener("click", function(event) {
            event.stopPropagation();
        });
        newElem.querySelector(".cxmodal__close").addEventListener("click", function() {
            CXview.close();
        });
        newElem.addEventListener("click", function(event) {
            var action = event.target && event.target.getAttribute("data-cxmodal-action");
            if (action === "ok") CXview.close(true);
            if (action === "cancel") CXview.close(false);
        });
        document.body.appendChild(newElem);
        CXview.bgrElem = newElem;
        CXview.elem = newElem.querySelector(".cxmodal__window");
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

        CXview.bgrElem.style.display = "flex";
        CXview.bindEscape();

        var focusTarget = CXview.elem.querySelector("[data-cxmodal-action='ok'], .cxmodal__close");
        if (focusTarget) focusTarget.focus();
    },

    /**
     * Close (hide) the modal window, or open it again with the "next" content
     */
    close: function(ok) {
        CXview.unbindEscape();
        if (CXview.bgrElem) {
            CXview.bgrElem.style.display = "none";
        }
        var nextModal = ok && CXview.modal ? CXview.modal : null;
        CXview.modal = null;
        if (CXview.previousFocus && typeof CXview.previousFocus.focus === "function") {
            CXview.previousFocus.focus();
        }
        CXview.previousFocus = null;
        if (nextModal) {
            CXcontrol.open(nextModal);
        }
    },

    /**
     * Close on Escape
     */
    bindEscape: function() {
        CXview._onKeyDown = function(event) {
            if (event.key === "Escape" || event.keyCode === 27) {
                CXview.close(false);
            }
        };
        document.addEventListener("keydown", CXview._onKeyDown);
    },

    unbindEscape: function() {
        if (CXview._onKeyDown) {
            document.removeEventListener("keydown", CXview._onKeyDown);
            CXview._onKeyDown = null;
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
        CXview.elem.style.opacity = 1;
        document.body.style.cursor = "";
        document.onmousemove = null;
        document.onmouseup = null;
    }
    
}
