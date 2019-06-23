//--------------------------------------------------------------------------
// CXcontrol
//--------------------------------------------------------------------------
/**
 * The Control-class
 *
 * @class
 */
CXcontrol = {

    /**
     * Default settings
     */
    defaults: {
        background: "close",     // close | block | none
        draggable: true,         // true | false
        alertOverride: true,     // true | false
        confirmOverride: true    // true | false
    },

    /**
     * This property is used to change settings externally
     */
    options: {},  

    /**
     * Create all model-objects (CXmodel) based on every element with a proper dataset (data-cxmodal)
     */
    init: function() {

        var elems = document.querySelectorAll("[data-cxmodal-alert], [data-cxmodal-confirm], [data-cxmodal-iframe], [data-cxmodal-ajax], [data-cxmodal]");
        var i;
        for (i = 0; i < elems.length; i++) {           
            var modal = new CXmodel(elems[i]);
            if (modal) {
                elems[i].modal = modal; // för att hämtas via event.currentTarget
                elems[i].addEventListener("click", CXcontrol.open, false);
            }
        }

        if (CXcontrol.options) CXcontrol.defaults = Object.assign(CXcontrol.defaults, CXcontrol.options);

        // Override the default alert function
        if (CXcontrol.defaults.alertOverride) {
            window.alert = function (x) {
                CXcontrol.open(x, "alert");
            };
        }

        // Override the default confirm function
        if (CXcontrol.defaults.confirmOverride) {
            window.confirm = function (x) {
                CXcontrol.open(x, "confirm");
            };
        }
    },

    /**
     * Get and set the main content based on AJAX call
     *
     * @param   {string}  url  
     *
     * @return  {null}
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
     * Calls CXview.open() with the right content and settings
     *
     * @param   {event}  evt   
     * @param   {string}  type  
     *
     * @return  {null}       
     */
    open: function(evt, type) {
        var content = {}, settings = {};
        if (type) {  // If alert or confirm from override (no event)
            settings = CXcontrol.defaults;
            CXview.init(settings);
            content.header = type.toUpperCase();
            content.body = evt;
            content.footer = '<button onclick="CXview.close(true)" type="button">OK</button>';
            if (type == "confirm") {
                content.footer = '<button onclick="CXview.close(false)" type="button">Cancel</button> ' + content.footer;
            }
            CXview.open(content, settings);
        } else {
            var modal;
            if (evt instanceof Event) {
                modal = evt.currentTarget.modal;
                modal.init();
                evt.preventDefault();
                content = CXcontrol.getContent(modal);
                settings = modal.settings;
                console.log(modal.data);
                if (modal.data.message && (modal.data.message !== modal.data.href)) {
                    CXview.open(content, settings, modal);
                } else {
                    CXview.open(content, settings);
                } 
            } else {
                modal = evt;
                if (modal.data.type == 'link') {
                    location.href = modal.data.href;
                } else {
                    modal.data.messageType = "";
                    content = CXcontrol.getContent(modal);
                    settings = modal.settings;
                    CXview.open(content, settings);
                }
            }
        }
    },

    /**
     * Set the HTML-content based on the models data
     *
     * @param   {object}  m  model
     *
     * @return  {object}     content
     */
    getContent: function(m) {
        var content = {};
        content.type = m.data.type;
        if (m.data.type == 'image') {
            content.header = m.data.title;
            content.body = '<img class="cxmodal__body-img" src="' + m.data.href + '" alt="' + m.data.description + '">';
            content.footer = m.data.description;
        }
        else if (m.data.type == 'ajax') {
            content.body = CXcontrol.ajax(m.data.href);
            content.header = m.data.title ? m.data.title : "AJAX";
        }
        else if (m.data.type == 'iframe') {
            content.body = '<iframe src="' + m.data.href + '"></iframe>';
            content.header = m.data.title ? m.data.title : "IFRAME";
            content.footer = m.data.description;
        }
        if (m.data.messageType == 'alert') {
            content.type = 'alert';
            content.header = m.data.messageTitle ? m.data.messageTitle : "ALERT";
            content.body =  '<p>' + m.data.message + '</p>';
            content.footer = '<button class="cxmodal__footer-button" onclick="CXview.close(true)" type="button">OK</button>';
        }
        else if (m.data.messageType == 'confirm') {
            content.type = 'confirm';
            content.header = m.data.messageTitle ? m.data.messageTitle : "CONFIRM";
            content.body =  '<p>' + m.data.message + '</p>';
            content.footer = '<button class="cxmodal__footer-button" onclick="CXview.close(false)" type="button">Cancel</button><button class="cxmodal__footer-button" onclick="CXview.close(true)" type="button">OK</button>';
        }
        return content;
    },

}

window.addEventListener("load", CXcontrol.init);