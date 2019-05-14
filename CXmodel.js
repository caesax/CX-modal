CXmodel = function(elem) {

    this.targetElem = elem;

    this.dataRef = '';

    this.metaData = '';

    this.dataType = '';

    this.contentElem = null;

    this.settings = {
        draggable: false,
        background_interact: false
    };

    this.getRef = function() {
        var ref = this.targetElem.getAttribute("data-cxmodal");
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

    this.getType = function() {
        var type = 'image';
        if (this.dataRef) {
            this.dataType = type;
            this.getContent();
        }
    }

    this.getContent = function() {
        if (this.dataType == 'image') {
            this.contentElem = '<img src="' + this.dataRef + '" alt="img">';
        }
    }

    this.getRef();  // init

};