//--------------------------------------------------------------------------
// Kontrollklassen CXcontrol
//--------------------------------------------------------------------------

CXcontrol = {

    /**
     * Default settings
     */
    settings: {
        background: "close",    // close | block | none
        draggable: true         // true | false
    },

    /**
     * Add or change settings externally
     */
    options: {},  

    /**
     * Initierar alla modal-objekt på sidan
     *
     * @return  {null}
     */
    init: function() {

        var elems = document.querySelectorAll("[data-cxmodal-alert], [data-cxmodal-confirm], [data-cxmodal]");
        var i;
        for (i = 0; i < elems.length; i++) {           
            var modal = new CXmodel(elems[i]);
            if (modal) {
                elems[i].modal = modal; // för att hämtas via event.currentTarget
                elems[i].addEventListener("click", CXcontrol.open, false);
            }
        }

        // Skriver över alert-funktionen
        window.alert = function (x) {
            CXcontrol.open(x);
        };

        // TODO: Skriva över confirm-funktionen...

    },

    /**
     * [ajax description]
     *
     * @param   {[type]}  url  [url description]
     *
     * @return  {[type]}       [return description]
     */
    ajax: function(url) {  // TODO Förbättra ajax-funktionen
        var xhr;
        if (XMLHttpRequest) { xhr = new XMLHttpRequest(); }
        else { alert("Tyvärr inget stöd för AJAX, så data kan inte läsas in"); return false; }
        xhr.open("GET", url, true);
        xhr.send(null);
        xhr.onreadystatechange = function () { 
            if (xhr.readyState === 4) {
                if (xhr.status == 200) {
                    document.querySelector(".cxmodal__body").innerHTML = xhr.response;
                }
            } 
        };
    },

    /**
     * [open description]
     *
     * @param   {[type]}  evt  [evt description]
     *
     * @return  {[type]}       [return description]
     */
    open: function(evt) {
        var content = {}, settings = {};
        if (typeof evt == "string") {  // If alert from override (no event)
            settings = CXcontrol.settings;
            CXview.init(CXcontrol.settings);
            content.header = "ALERT";
            content.body = evt;
            content.footer = '<button onclick="CXview.close()" type="button">OK</button>';
            CXview.open(content, settings);
        } else {
            var modal;
            if (evt instanceof Event) {
                modal = evt.currentTarget.modal;
                modal.init();
                evt.preventDefault();
                if (modal.data.message) {
                    modal.data.type = "alert";
                    content = CXcontrol.getContent(modal);
                    settings = modal.settings;
                    if (modal.data.href !== modal.data.message) {
                        CXview.open(content, settings, modal);
                    } else {
                        CXview.open(content, settings);
                    }
                } else {
                    content = CXcontrol.getContent(modal);
                    settings = modal.settings;
                    CXview.open(content, settings);
                } 
            } else {
                modal = evt;
                modal.init();
                content = CXcontrol.getContent(modal);
                settings = modal.settings;
                CXview.open(content, settings);
            }
        }
    },

    /**
     * [getContent description]
     *
     * @param   {object}  m  [m description]
     *
     * @return  {object}     [return description]
     */
    getContent: function(m) {
        var content = {};
        content.type = m.data.type;
        if (m.data.type == 'image') {
            content.header = m.data.title;
            content.body = '<img src="' + m.data.href + '" alt="' + m.data.description + '">';
            content.footer = m.data.description;
        }
        if (m.data.type == 'ajax') {
            content.body = CXcontrol.ajax(m.data.href);
            content.header = m.data.title ? m.data.title : "AJAX";
        }
        if (m.data.type == 'alert') {
            content.header = m.data.title ? m.data.title : "ALERT";
            content.body =  '<p>' + m.data.message + '</p>';
            content.footer = '<button onclick="CXview.close()" type="button">OK</button>';
        }
        return content;
    },

}

window.addEventListener("load", CXcontrol.init);