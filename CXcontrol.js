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
        background: "close",           // close | block | none
        draggable: true,               // true | false
        defaultTitle: "title",         // title | alt | none
        defaultDescription: "alt",     // title | alt | none
        alertTitle: "ALERT",           // * | none
        confirmTitle: "CONFIRM",       // * | none
        alertOverride: false,          // true | false — opt-in; native alert is sync
        confirmOverride: false         // true | false — opt-in; native confirm returns boolean
    },

    /**
     * This property is used to change settings externally
     */
    options: {},

    /**
     * Original window.alert / window.confirm when overrides are enabled
     */
    _nativeAlert: null,
    _nativeConfirm: null,

    /**
     * Create all model-objects (CXmodel) based on every element with a proper dataset (data-cxmodal)
     */
    init: function() {

        if (CXcontrol.options) CXcontrol.defaults = Object.assign(CXcontrol.defaults, CXcontrol.options);

        var elems = document.querySelectorAll("[data-cxmodal-alert], [data-cxmodal-confirm], [data-cxmodal-iframe], [data-cxmodal-ajax], [data-cxmodal]");
        var i;
        for (i = 0; i < elems.length; i++) {           
            var modal = new CXmodel(elems[i]);
            if (modal) {
                elems[i].modal = modal; // för att hämtas via event.currentTarget
                elems[i].addEventListener("click", CXcontrol.open, false);
            }
        }

        // Override the default alert function (async UI — does not block)
        if (CXcontrol.defaults.alertOverride) {
            if (!CXcontrol._nativeAlert) CXcontrol._nativeAlert = window.alert;
            window.alert = function (x) {
                CXcontrol.open(x, "alert");
            };
        }

        // Override confirm only when opted in. Native confirm() is synchronous and
        // returns a boolean; the modal cannot preserve that contract, so callers
        // must not rely on the return value when this override is enabled.
        if (CXcontrol.defaults.confirmOverride) {
            if (!CXcontrol._nativeConfirm) CXcontrol._nativeConfirm = window.confirm;
            window.confirm = function (x) {
                CXcontrol.open(x, "confirm");
                return false;
            };
        }
    },

    /**
     * Escape text for safe use in HTML
     *
     * @param   {*}  value
     *
     * @return  {string}
     */
    escapeHtml: function(value) {
        if (value === undefined || value === null) return "";
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    },

    /**
     * Escape a value for use inside an HTML attribute
     *
     * @param   {*}  value
     *
     * @return  {string}
     */
    escapeAttr: function(value) {
        return CXcontrol.escapeHtml(value);
    },

    /**
     * Get and set the main content based on AJAX call
     *
     * @param   {string}  url
     * @param   {HTMLElement}  [target]
     *
     * @return  {null}
     */
    ajax: function(url, target) {
        var xhr;
        if (typeof XMLHttpRequest === "undefined") {
            if (target) target.textContent = "AJAX is not supported in this browser.";
            return false;
        }
        xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                var body = target || document.querySelector(".cxmodal__body");
                if (!body) return;
                if (xhr.status >= 200 && xhr.status < 300) {
                    body.innerHTML = xhr.responseText;
                } else {
                    body.textContent = "Could not load content (" + xhr.status + ").";
                }
            }
        };
        xhr.send(null);
        return null;
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
            settings = Object.assign({}, CXcontrol.defaults);
            content.type = type;
            content.header = type === "confirm"
                ? CXcontrol.defaults.confirmTitle
                : CXcontrol.defaults.alertTitle;
            content.body = evt == null ? "" : String(evt);
            content.bodyIsHtml = false;
            content.footer = '<button class="cxmodal__footer-button" type="button" data-cxmodal-action="ok">OK</button>';
            content.footerIsHtml = true;
            if (type == "confirm") {
                content.footer = '<button class="cxmodal__footer-button" type="button" data-cxmodal-action="cancel">Cancel</button>' + content.footer;
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
        var title = m.data.title || "";
        var description = m.data.description || "";
        var href = CXcontrol.escapeAttr(m.data.href);
        var message = m.data.message || "";
        var messageTitle = m.data.messageTitle || "";

        content.type = m.data.type;
        if (m.data.type == 'image') {
            content.header = title;
            content.body = '<img class="cxmodal__body-img" src="' + href + '" alt="' + CXcontrol.escapeAttr(description) + '">';
            content.footer = description;
            content.bodyIsHtml = true;
            content.footerIsHtml = false;
        }
        else if (m.data.type == 'ajax') {
            content.body = '<p class="cxmodal__loading">Loading…</p>';
            content.header = title || "AJAX";
            content.bodyIsHtml = true;
            content.ajaxUrl = m.data.href;
        }
        else if (m.data.type == 'iframe') {
            content.body = '<iframe src="' + href + '" title="' + CXcontrol.escapeAttr(title || "IFRAME") + '"></iframe>';
            content.header = title || "IFRAME";
            content.footer = description;
            content.bodyIsHtml = true;
            content.footerIsHtml = false;
        }
        else if (m.data.type == 'message') {
            content.header = title;
            content.body = message || (m.data.href || "");
            content.footer = description;
            content.bodyIsHtml = false;
            content.footerIsHtml = false;
        }
        if (m.data.messageType == 'alert') {
            content.type = 'alert';
            content.header = messageTitle || CXcontrol.defaults.alertTitle;
            content.body = message;
            content.footer = '<button class="cxmodal__footer-button" type="button" data-cxmodal-action="ok">OK</button>';
            content.bodyIsHtml = false;
            content.footerIsHtml = true;
        }
        else if (m.data.messageType == 'confirm') {
            content.type = 'confirm';
            content.header = messageTitle || CXcontrol.defaults.confirmTitle;
            content.body = message;
            content.footer = '<button class="cxmodal__footer-button" type="button" data-cxmodal-action="cancel">Cancel</button><button class="cxmodal__footer-button" type="button" data-cxmodal-action="ok">OK</button>';
            content.bodyIsHtml = false;
            content.footerIsHtml = true;
        }
        return content;
    },

}

window.addEventListener("load", CXcontrol.init);
