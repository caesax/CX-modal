//--------------------------------------------------------------------------
// Datamodellklassen CXmodel
//--------------------------------------------------------------------------

CXmodel = function(elem) {

    /**
     * "Event-elementet" som ligger till grund för datamodellen
     */
    this.targetElem = elem;

    /**
     * Själva data-innehållet
     */
    this.data = {
        type: "",
        message: "",
        href: "",
        title: "",
        description: ""
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

        console.log(this.targetElem);  // TODO: ta bort console.log-test

        this.settings = Object.assign(this.settings, CXcontrol.settings, CXcontrol.options); // TODO: Validera options
        
        if (this.targetElem) {
            
            var dataset = this.targetElem.dataset;
            var localSettings = {}
            if (dataset.cxmodalBackground) localSettings.background = dataset.cxmodalBackground;
            if (dataset.cxmodalDraggable) localSettings.draggable = dataset.cxmodalDraggable;
            this.settings = Object.assign(this.settings, localSettings);

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
        if (typeof dataset.cxmodalConfirm !== "undefined") {
            this.data.message = dataset.cxmodalConfirm ? dataset.cxmodalConfirm: this.data.href;
            this.data.type = "confirm";
        }
        if (typeof dataset.cxmodalAlert !== "undefined") {
            this.data.message = dataset.cxmodalAlert ? dataset.cxmodalAlert: this.data.href;
            this.data.type = "alert";
        }
        if (typeof dataset.cxmodalIframe !== "undefined") {
            this.data.href = dataset.cxmodalIframe ? dataset.cxmodalIframe: this.data.href;
            this.data.type = "iframe";
        }
        if (typeof dataset.cxmodalTitle !== "undefined") {
            this.data.title = dataset.cxmodalTitle ? dataset.cxmodalTitle: this.targetElem.getAttribute("title");
            if (!this.data.title && this.targetElem.querySelector("[title]")) this.data.title = this.targetElem.querySelector("[title]").getAttribute("title");
        }
        if (typeof dataset.cxmodalDescription !== "undefined") {
            this.data.description = dataset.cxmodalDescription ? dataset.cxmodalDescription: this.targetElem.getAttribute("alt");
            if (!this.data.description && this.targetElem.querySelector("[alt]")) this.data.description = this.targetElem.querySelector("[alt]").getAttribute("alt");
        }

        this.getType();

    },

    
    /**
     * Hämtar data-typ baserat på värdet för data.href
     *
     * @return  {[type]}  [return description]
     */
    getType: function() {

        // TODO: Förbättra getType
        // TODO: lägg till data.type: 'confirm', 'prompt'..

        this.data.type = 'alert';
        var ext = this.data.href.split('.').pop();
        ext = ext.split('?')[0].toLowerCase();
        var tryExt = ['jpg', 'jpeg', 'gif', 'png'];
        if (tryExt.includes(ext)) this.data.type = 'image';
        tryExt = ['php', 'htm', 'html', 'txt'];
        if (tryExt.includes(ext)) this.data.type = 'ajax';

        console.log(this.data);  // TODO: ta bort console.log-test

    }

}