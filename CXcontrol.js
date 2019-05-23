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
    },

    ajax: function(url) {
        var xhr; // Object för Ajax-anropet
        if (XMLHttpRequest) { xhr = new XMLHttpRequest(); }
        else { alert("Tyvärr inget stöd för AJAX, så data kan inte läsas in"); return false; }
        xhr.open("GET", url, true);
        xhr.send(null); // Skicka begäran till servern
        xhr.onreadystatechange = function () { // Funktion för att avläsa status i kommunikationen
            if (xhr.readyState === 4) { // Då kommunikationen är klar blir readyState 4
                if (xhr.status == 200) {
                    document.querySelector(".cxmodal-content").innerHTML = xhr.response;
                }
            } 
        };
    }

}

window.addEventListener("load", CXcontrol.init);