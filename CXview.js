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
        <div class="cxmodal__window">\
            <div class="cxmodal__header"></div>\
            <span class="cxmodal__close">&times;</span>\
            <div class="cxmodal__body"></div>\
        </div>',

    /* Reference to the window element */
    elem: null,

    /* Reference to the data-model object */
    modal: null,

    /* Reference to the overlay element (modal background) */
    bgrElem: null,

    /* Offset-values for the window when drag'n'drop */
    offsetX: 0,
    offsetY: 0,

    /**
     * Renders the modal structure with the right settings and adds eventlisteners
     *
     * @param   {object}  settings
     */
    init: function(settings) {
        if (CXview.bgrElem) document.body.removeChild(CXview.bgrElem); // reset modal
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
        document.body.appendChild(newElem);
        CXview.bgrElem = newElem;
        CXview.elem = newElem.querySelector(".cxmodal__window");
    },

    /**
     * Render the content with its settings and show the modal window
     */
    open: function(content, settings, modal){
        CXview.modal = modal;
        CXview.init(settings);
        CXview.elem.classList.add("cxmodal--" + content.type);
        document.querySelector(".cxmodal__header").innerHTML = content.header;
        document.querySelector(".cxmodal__body").innerHTML = content.body;
        if (content.footer) {
            var newElem = document.createElement("div");
            newElem.className = "cxmodal__footer";
            newElem.innerHTML = content.footer;
            CXview.elem.appendChild(newElem);
        }
        CXview.bgrElem.style.display = "flex";
        console.log(CXview.elem);
    },

    /**
     * Close (hide) the modal window, or open it again with the "next" content
     */
    close: function(ok) {
        CXview.bgrElem.style.display = "none";
        console.log(ok)
        if (ok && CXview.modal) {
            CXcontrol.open(CXview.modal);
        }
    },

    /**
     * Start drag'n'drop and set the offset values
     */
    dragStart: function (event) {
        CXview.elem.style.opacity = 0.95;
        CXview.offsetX = event.offsetX;
        CXview.offsetY = event.offsetY;
        CXview.elem.style.margin = 0;
        document.cursor = "move";
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
    },

    /**
     * Stop drag and remove its event listeners
     */
    dragStop: function () {
        CXview.elem.style.opacity = 1;
        CXview.elem.style.cursor = "default";
        document.onmousemove = null;
        document.onmouseup = null;
    }
    
}

