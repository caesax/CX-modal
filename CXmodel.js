CXmodel = function(elem) {

    this.targetElem = elem;

    this.dataRef = '';

    this.dataType = '';

    this.metaData = '';

    this.settings = {
        draggable: false,
        background_interact: false,
        background_close: true
    };

    this.getRef = function() {
        var ref = this.targetElem.getAttribute("data-cxmodal-alert");
        if (!ref) {
            ref = this.targetElem.getAttribute("href");
        }
        if (!ref) {
            ref = this.targetElem.getAttribute("src");
        }
        if (ref) {
            this.dataRef = ref;
            this.getType();
        }
    }

    // TODO: Förbättra getType
    this.getType = function() {
        this.dataType = 'alert';
        var ext = this.dataRef.split('.').pop();
        ext = ext.split('?')[0].toLowerCase();
        console.log(ext);
        var tryExt = ['jpg', 'jpeg', 'gif', 'png'];
        if (tryExt.includes(ext)) this.dataType = 'image';
        tryExt = ['php', 'htm', 'html', 'txt'];
        if (tryExt.includes(ext)) this.dataType = 'ajax';
        this.getMeta();
    }

    // TODO: hämta meta-data
    this.getMeta = function() {
        var _meta = '';
        if (this.dataType == 'image') {
            _meta = this.targetElem.getAttribute("title");
        }
        this.metaData = _meta;
    }

    this.getRef();  // init

};