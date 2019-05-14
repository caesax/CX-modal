CXcontrol = {

    init: function() {
        var elems = document.querySelectorAll("[data-cxmodal]");
        var i;
        for (i = 0; i < elems.length; i++) {           
            var modal = new CXmodel(elems[i]);

            if (modal) {
                elems[i].modal = modal;
                elems[i].addEventListener("click", CXview.open, false);
            }
        }
    }

}

window.addEventListener("load", CXcontrol.init);