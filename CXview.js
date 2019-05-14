CXview = {

    TEMPLATE: '\
        <div class="cxmodal">\
            <span class="close">&times;</span>\
            <div class="cxmodal-content"></div>\
        </div>',

    elem: null,

    init: function() {
        var newElem = document.createElement("div");
        newElem.innerHTML = CXview.TEMPLATE;
        newElem.className = "cxmodal-background";
        document.body.appendChild(newElem);
        newElem.querySelector(".close").addEventListener("click", function() {
            CXview.close();
        });
        CXview.elem = newElem;
    },

    open: function(evt) {
        document.querySelector(".cxmodal-content").innerHTML = evt.currentTarget.modal.contentElem;
        evt.preventDefault();
        CXview.elem.style.display = "flex";
    },

    close: function() {
        CXview.elem.style.display = "none";
    }
    
}

window.addEventListener("load", CXview.init);