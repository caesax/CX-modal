//--------------------------------------------------------------------------
// Datamodellklassen CXmodel
//--------------------------------------------------------------------------

CXmodel = function(elem) {

    /**
     * "Event-elementet" som ligger till grund för datamodellen
     */
    this.targetElem = elem || null;

    /**
     * Själva data-innehållet
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
     * Inställningarna för varje enskilt objekt (modal)
     */
    this.settings = {};

}

// Prototypen
CXmodel.prototype = {

    constructor: CXmodel,

    /**
     * Objektet initieras
     *
     * @return  {[type]}  [return description]
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
     * [getData description]
     *
     * @return  {null}
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
     * Hämtar data-typ baserat på värdet för data.href
     *
     * @return  {[type]}  [return description]
     */
    guessType: function() {

            this.data.type="message";
            var ext = this.data.href.split('.').pop();
            ext = ext.split('?')[0].toLowerCase();
            var tryExt = ['jpg', 'jpeg', 'gif', 'png'];
            if (tryExt.includes(ext)) this.data.type = 'image';
            tryExt = ['php', 'htm', 'html', 'txt'];
            if (tryExt.includes(ext)) this.data.type = 'ajax';
            if (this.data.href.substr(0, 4) == 'http') this.data.type = 'link';

    }

}