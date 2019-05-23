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
        var modal = evt.currentTarget.modal;
        var content = CXview.getContent(modal);
        document.querySelector(".cxmodal-content").innerHTML = content;
        evt.preventDefault();
        CXview.elem.style.display = "flex";
    },

    close: function() {
        CXview.elem.style.display = "none";
    },

    getContent: function(m) {
        if (m.dataType == 'image') {
            var _return = '<img src="' + m.dataRef + '" alt="img">';
            if (m.metaData) {
                _return += '<div class="cxmodal-meta">' + m.metaData + '</div>';
            }
            return _return;
        }
        if (m.dataType == 'ajax') {
            CXcontrol.ajax(m.dataRef);
        }
        if (m.dataType == 'alert') {
            return '<h3>ALERT</h3><p>' + m.dataRef + '</p>\
            <div class="cxmodal-meta"> <button onclick="CXview.close()" type="button">OK</button> </div>';
        }
    }
    
}

window.addEventListener("load", CXview.init);
