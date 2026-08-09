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
        confirmOverride: false,        // true | false — opt-in; native confirm returns boolean
        hideclose: false               // true | false — hide the close (×) control
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
     * In-flight AJAX request (aborted when the modal closes)
     */
    _xhr: null,

    /**
     * Whether init() has already bound page triggers / overrides
     */
    _initialized: false,

    /**
     * Selector for modal trigger elements
     */
    TRIGGER_SELECTOR: "[data-cxmodal-alert], [data-cxmodal-confirm], [data-cxmodal-iframe], [data-cxmodal-ajax], [data-cxmodal]",

    /**
     * Create all model-objects (CXmodel) based on every element with a proper dataset (data-cxmodal).
     * Safe to call more than once: existing triggers are not double-bound; new triggers are picked up.
     */
    init: function() {

        if (CXcontrol.options) {
            CXcontrol.defaults = Object.assign({}, CXcontrol.defaults, CXcontrol.options);
        }

        CXcontrol.bindTriggers(document);

        if (CXcontrol._initialized) return;
        CXcontrol._initialized = true;

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
     * Bind click handlers to trigger elements inside a root (document or a subtree).
     * Skips elements that already have a bound model.
     *
     * @param   {ParentNode}  [root]
     */
    bindTriggers: function(root) {
        var scope = root || document;
        var elems = scope.querySelectorAll(CXcontrol.TRIGGER_SELECTOR);
        var i;
        for (i = 0; i < elems.length; i++) {
            if (elems[i].modal) continue;
            var modal = new CXmodel(elems[i]);
            elems[i].modal = modal;
            elems[i].addEventListener("click", CXcontrol.open, false);
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
     * Allow only http(s), protocol-relative, root-relative, or plain relative URLs.
     * Blocks javascript:, data:, vbscript:, etc.
     *
     * @param   {string}  url
     *
     * @return  {boolean}
     */
    isSafeUrl: function(url) {
        if (url === undefined || url === null) return false;
        var value = String(url).trim();
        if (!value) return false;
        if (/^\/\//.test(value)) return true;          // protocol-relative
        if (/^[./?#]/.test(value)) return true;        // relative / hash / query
        if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
            return /^(https?:)/i.test(value);
        }
        return true; // path without leading slash, e.g. "img/photo.jpg"
    },

    /**
     * Return a safe URL or empty string
     *
     * @param   {string}  url
     *
     * @return  {string}
     */
    sanitizeUrl: function(url) {
        return CXcontrol.isSafeUrl(url) ? String(url).trim() : "";
    },

    /**
     * Abort any in-flight AJAX request
     */
    abortAjax: function() {
        if (CXcontrol._xhr) {
            try { CXcontrol._xhr.abort(); } catch (e) { /* ignore */ }
            CXcontrol._xhr = null;
        }
    },

    /**
     * Get and set the main content based on AJAX call.
     * Response HTML is inserted as-is — only use with trusted same-origin URLs.
     *
     * @param   {string}  url
     * @param   {HTMLElement}  [target]
     *
     * @return  {null}
     */
    ajax: function(url, target) {
        var xhr;
        CXcontrol.abortAjax();

        if (!CXcontrol.isSafeUrl(url)) {
            if (target) target.textContent = "Blocked unsafe URL.";
            return false;
        }

        if (typeof XMLHttpRequest === "undefined") {
            if (target) target.textContent = "AJAX is not supported in this browser.";
            return false;
        }

        xhr = new XMLHttpRequest();
        CXcontrol._xhr = xhr;
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;
            if (CXcontrol._xhr === xhr) CXcontrol._xhr = null;
            if (!target || !target.isConnected) return;
            if (xhr.status >= 200 && xhr.status < 300) {
                target.innerHTML = xhr.responseText;
            } else if (xhr.status !== 0) {
                target.textContent = "Could not load content (" + xhr.status + ").";
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
            if (content.header === "none") content.header = "";
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
                // Gate two-step on messageType, not message !== href
                // (empty data-cxmodal-confirm falls back to href but must still confirm)
                if (modal.data.messageType === "alert" || modal.data.messageType === "confirm") {
                    CXview.open(content, settings, modal);
                } else {
                    CXview.open(content, settings);
                }
            } else {
                modal = evt;
                modal.data.messageType = "";
                content = CXcontrol.getContent(modal);
                settings = modal.settings;
                CXview.open(content, settings);
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
        var safeHref = CXcontrol.sanitizeUrl(m.data.href);
        var href = CXcontrol.escapeAttr(safeHref);
        var message = m.data.message || "";
        var messageTitle = m.data.messageTitle || "";
        if (messageTitle === "none") messageTitle = "";

        content.type = m.data.type;
        if (m.data.type == 'image') {
            content.header = title;
            if (safeHref) {
                content.body = '<img class="cxmodal__body-img" src="' + href + '" alt="' + CXcontrol.escapeAttr(description) + '">';
            } else {
                content.body = "Blocked unsafe image URL.";
                content.bodyIsHtml = false;
            }
            if (safeHref) content.bodyIsHtml = true;
            content.footer = description;
            content.footerIsHtml = false;
        }
        else if (m.data.type == 'ajax') {
            content.body = '<p class="cxmodal__loading">Loading…</p>';
            content.header = title || "AJAX";
            content.bodyIsHtml = true;
            content.ajaxUrl = safeHref;
            if (!safeHref) {
                content.body = "Blocked unsafe URL.";
                content.bodyIsHtml = false;
            }
        }
        else if (m.data.type == 'iframe') {
            content.header = title || "IFRAME";
            content.footer = description;
            content.footerIsHtml = false;
            if (safeHref) {
                content.body = '<iframe src="' + href + '" title="' + CXcontrol.escapeAttr(title || "IFRAME") + '" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>';
                content.bodyIsHtml = true;
            } else {
                content.body = "Blocked unsafe iframe URL.";
                content.bodyIsHtml = false;
            }
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
            content.header = messageTitle || (CXcontrol.defaults.alertTitle === "none" ? "" : CXcontrol.defaults.alertTitle);
            content.body = message;
            content.footer = '<button class="cxmodal__footer-button" type="button" data-cxmodal-action="ok">OK</button>';
            content.bodyIsHtml = false;
            content.footerIsHtml = true;
        }
        else if (m.data.messageType == 'confirm') {
            content.type = 'confirm';
            content.header = messageTitle || (CXcontrol.defaults.confirmTitle === "none" ? "" : CXcontrol.defaults.confirmTitle);
            content.body = message;
            content.footer = '<button class="cxmodal__footer-button" type="button" data-cxmodal-action="cancel">Cancel</button><button class="cxmodal__footer-button" type="button" data-cxmodal-action="ok">OK</button>';
            content.bodyIsHtml = false;
            content.footerIsHtml = true;
        }
        return content;
    },

}

window.addEventListener("load", CXcontrol.init);
