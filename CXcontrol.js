CXcontrol = {

    init: function() {
        // TODO skapa bättre urvalsfunktion
        var elems = document.querySelectorAll("[data-cxmodal], [data-cxmodal-alert], [data-cxmodal-confirm]");
        var i;
        for (i = 0; i < elems.length; i++) {           
            var modal = new CXmodel(elems[i]);

            if (modal) {
                elems[i].modal = modal; // för att hämtas via event.currentTarget
                elems[i].addEventListener("click", CXview.open, false);
            }
        }
    }

}

window.addEventListener("load", CXcontrol.init);