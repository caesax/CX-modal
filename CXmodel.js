//--------------------------------------------------------------------------
// CXmodel
//--------------------------------------------------------------------------
/**
 * The Model-class
 *
 * @class
 */
CXmodel = function(elem) {

    /**
     * A reference to the event-element
     */
    this.targetElem = elem || null;

    /**
     * Data for this model
     */
    this.data = {
        type: "",
        href: "",
        title: "",
        description: "",
        message: "",
        messageType: "",
        messageTitle: ""
    };

    /**
     * Settings for this model
     */
    this.settings = {};

}

// The prototype
CXmodel.prototype = {

    constructor: CXmodel,

    /**
     * Get and update settings based on datasets from targetElem
     */
    init: function() {
        
        if (this.targetElem) {
            
            var dataset = this.targetElem.dataset;
            this.settings = Object.assign({}, CXcontrol.defaults);
            if (dataset.cxmodalBackground) this.settings.background = dataset.cxmodalBackground;
            if (dataset.cxmodalDraggable !== undefined) {
                this.settings.draggable = CXmodel.parseBoolean(dataset.cxmodalDraggable, CXcontrol.defaults.draggable);
            }

            this.getData();

        }

    },

    /**
     * Get and update the data based on datasets and attributes from targetElem
     */
    getData: function() {

        var dataset = this.targetElem.dataset;

        this.data.href = this.targetElem.getAttribute("href");
        if (!this.data.href) {
            this.data.href = this.targetElem.getAttribute("src");
        }
        if (dataset.cxmodal > "") this.data.href = dataset.cxmodal;

        if (dataset.cxmodalAjax !== undefined) {
            this.data.href = dataset.cxmodalAjax ? dataset.cxmodalAjax: this.data.href;
            this.data.type = "ajax";
        }
        else if (dataset.cxmodalIframe !== undefined) {
            this.data.href = dataset.cxmodalIframe ? dataset.cxmodalIframe: this.data.href;
            this.data.type = "iframe";
        }
        else if (dataset.cxmodalImage !== undefined) {
            this.data.href = dataset.cxmodalImage ? dataset.cxmodalImage: this.data.href;
            this.data.type = "image";
        }

        if (dataset.cxmodalConfirm !== undefined) {
            this.data.message = dataset.cxmodalConfirm ? dataset.cxmodalConfirm: this.data.href;
            this.data.messageType = "confirm";
            if (dataset.cxmodalConfirmTitle) {
                this.data.messageTitle = dataset.cxmodalConfirmTitle;
            }
        }
        else if (dataset.cxmodalAlert !== undefined) {
            this.data.message = dataset.cxmodalAlert ? dataset.cxmodalAlert: this.data.href;
            this.data.messageType = "alert";
            if (dataset.cxmodalAlertTitle) {
                this.data.messageTitle = dataset.cxmodalAlertTitle;
            }
        }
        
        this.data.title = this.resolveMeta(dataset.cxmodalTitle, CXcontrol.defaults.defaultTitle, "title");
        this.data.description = this.resolveMeta(dataset.cxmodalDescription, CXcontrol.defaults.defaultDescription, "alt");

        if (!this.data.type) this.guessType();

    },

    /**
     * Resolve title/description from dataset value, default mode, or element attributes
     *
     * @param   {string|undefined}  value        Dataset value
     * @param   {string}            defaultMode  Default mode (title | alt | none)
     * @param   {string}            attrName     Attribute to read as fallback
     *
     * @return  {string}
     */
    resolveMeta: function(value, defaultMode, attrName) {
        var mode = value !== undefined ? value : defaultMode;
        if (mode === undefined || mode === null || mode === "none") return "";
        if (mode === "title" || mode === "alt") {
            return this.readAttr(mode);
        }
        if (value !== undefined && value !== "") {
            return value;
        }
        return this.readAttr(attrName) || this.readAttr(defaultMode === "alt" ? "alt" : "title");
    },

    /**
     * Read title/alt from the trigger or a nested element
     *
     * @param   {string}  attrName
     *
     * @return  {string}
     */
    readAttr: function(attrName) {
        if (!attrName || attrName === "none") return "";
        var value = this.targetElem.getAttribute(attrName);
        if (value) return value;
        var nested = this.targetElem.querySelector("[" + attrName + "]");
        return nested ? nested.getAttribute(attrName) : "";
    },

    
    /**
     * Try to figure out data.type based on data.href
     */
    guessType: function() {

            var href = this.data.href || "";
            var ext = getFileExtension(href);
            var type = "message";
            if (tryIfImage(ext)) {
                type = 'image';
            } else if (tryIfAjax(ext)) {
                type = 'ajax';
            } else if (/^https?:\/\//i.test(href)) {
                type = 'iframe';
            }
            this.data.type = type;

            /**
             * Get the file extension from data.href
             *
             * @param   {string}  href  data.href
             *
             * @return  {string}        The file extension
             */
            function getFileExtension(href) {
                var path = href.split('?')[0].split('#')[0];
                var parts = path.split('.');
                if (parts.length < 2) return "";
                return parts.pop().toLowerCase();
            }

            /**
             * Try if data.type should be image
             *
             * @param   {string}  ext  File extension
             *
             * @return  {boolean}       If extension is Image
             */
            function tryIfImage(ext) {
                var array = ['jpg', 'jpeg', 'gif', 'png', 'webp', 'svg', 'avif'];
                return array.includes(ext);
            }

            /**
             * Try if data.type should be ajax
             *
             * @param   {string}  ext  File extension
             *
             * @return  {boolean}       If extension suggests Ajax
             */
            function tryIfAjax(ext) {
                var array = ['php', 'htm', 'html', 'txt'];
                return array.includes(ext);
            }

    }

}

/**
 * Parse a dataset boolean string
 *
 * @param   {string|boolean}  value
 * @param   {boolean}         fallback
 *
 * @return  {boolean}
 */
CXmodel.parseBoolean = function(value, fallback) {
    if (typeof value === "boolean") return value;
    if (value === undefined || value === null || value === "") return !!fallback;
    var normalized = String(value).toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
    return !!fallback;
}
