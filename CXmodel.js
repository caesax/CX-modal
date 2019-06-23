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
            this.settings = Object.create(CXcontrol.defaults);
            if (dataset.cxmodalBackground) this.settings.background = dataset.cxmodalBackground;
            if (dataset.cxmodalDraggable) this.settings.draggable = dataset.cxmodalDraggable;
            console.log(this.settings);  // TODO: ta bort console.log-test
            console.log(dataset);  // TODO: ta bort console.log-test

            this.getData();

        }

    },

    /**
     * Get and update the data based on datasets and attributes from targetElem
     */
    getData: function() {  // TODO: Förbättra och generalisera denna kod

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
                this.data.messageTitle = dataset.cxmodalMessageTitle;
            }
        }
        
        if (dataset.cxmodalTitle !== undefined) {
            this.data.title = dataset.cxmodalTitle ? dataset.cxmodalTitle: this.targetElem.getAttribute("title");
            if (!this.data.title && this.targetElem.querySelector("[title]")) this.data.title = this.targetElem.querySelector("[title]").getAttribute("title");
        }
        if (dataset.cxmodalDescription !== undefined) {
            this.data.description = dataset.cxmodalDescription ? dataset.cxmodalDescription: this.targetElem.getAttribute("alt");
            if (!this.data.description && this.targetElem.querySelector("[alt]")) this.data.description = this.targetElem.querySelector("[alt]").getAttribute("alt");
        }

        if (!this.data.type) this.guessType();

    },

    
    /**
     * Try to figure out data.type based on data.href
     */
    guessType: function() {

            var ext = getFileExtension(this.data.href);
            var type = "message";
            if (tryIfImage(ext)) {
                type = 'image';
            } else if (tryIfAjax(ext)) {
                type = 'ajax';
            } else if (this.data.href.substr(0, 4) == 'http') {
                type = 'link';
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
                var ext = href.split('.').pop();
                return ext.split('?')[0].toLowerCase();
            }

            /**
             * Try if data.type should be image
             *
             * @param   {string}  ext  File extension
             *
             * @return  {boolean}       If extension is Image
             */
            function tryIfImage(ext) {
                var array = ['jpg', 'jpeg', 'gif', 'png'];
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