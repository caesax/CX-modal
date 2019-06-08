//--------------------------------------------------------------------------
// Klassen CXview - som sköter renderingen av modalen
//--------------------------------------------------------------------------

CXview = {

    /**
     * HTML-mall för modal-fönstret
     */
    TEMPLATE: '\
        <div class="cxmodal__window">\
            <div class="cxmodal__header"></div>\
            <span class="cxmodal__close">&times;</span>\
            <div class="cxmodal__body"></div>\
        </div>',

    /* Referens till modalfönstret */
    elem: null,

    /* Referens till aktuellt data-objekt */
    modal: null,

    /* Referens till modalens overlay (bakgrund) */
    bgrElem: null,

    /* Offset-värden för fönstret som används vid drag */
    offsetX: 0,
    offsetY: 0,

    /**
     * [init description]
     *
     * @param   {object}  settings
     *
     * @return  {null}
     */
    init: function(settings) {
        if (CXview.bgrElem) document.body.removeChild(CXview.bgrElem); // reset
        var newElem = document.createElement("div");
        newElem.innerHTML = CXview.TEMPLATE;
        newElem.className = "cxmodal";
        if (settings) {
                newElem.classList.add("cxmodal_background-" + settings.background);
            if (settings.background == "close") {
                newElem.addEventListener("click", function() {
                    CXview.close();
                });
            }
            if (settings.draggable) {
                newElem.classList.add("cxmodal_draggable");
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
     * 
     */
    open: function(content, settings, modal){
        CXview.modal = modal;
        CXview.init(settings);
        CXview.elem.classList.add("cxmodal_" + content.type);
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
     * [close description]
     *
     * @return  {[type]}  [return description]
     */
    close: function(ok) {
        CXview.bgrElem.style.display = "none";
        console.log(ok)
        if (ok && CXview.modal) {
            CXcontrol.open(CXview.modal);
        }
    },

    /**
     * [dragStart description]
     *
     * @return  {[type]}  [return description]
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
     * ...
     * 
     * @param {MouseEvent} event 
     */
    drag: function (event) {
        CXview.elem.style.left = event.clientX - CXview.offsetX + "px";
        CXview.elem.style.top = event.clientY - CXview.offsetY + "px";
    },

    /**
     * [dragStop description]
     *
     * @return  {[type]}  [return description]
     */
    dragStop: function () {
        CXview.elem.style.opacity = 1;
        CXview.elem.style.cursor = "default";
        document.onmousemove = null;
        document.onmouseup = null;
    }
    
}

