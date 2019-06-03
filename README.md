# CX-modal
A simple but flexible modal/lightbox that easily can be set to be both draggable, modal and with or without overlay.


## Installation
All styling is done with CSS so you have to include both the CSS- and JavaScript.\
Download _**cxmodal.min.js**_ and _**cxmodal.min.css**_ and put them in your `<head>` tag like this:

    <link rel="stylesheet" href="cxmodal/cxmodal.min.css">
    <script src="cxmodal/cxmodal.min.js"></script>`


## Usage
By default, cxmodal acts on all elements using the 'data-cxmodal' attribute. An element with this attribute triggers the modal. Preferably put the attributes on links `<a>` but you can also use the value of the attribute to open up the modal.

    <a data-cxmodal href="img/large_picture.png"><img src="img/small_picture.png" alt="my picture"></a>
    <img data-cxmodal src="img/nice_photo.jpg" alt="Very Nice Photo">
    <a data-cxmodal-alert="Open as AJAX" href="edit.php" title="Edit your page">Edit</a>

## Configuration
Every modal-window can be easily customized both individually and generally with either attributes or simple javascript. The modal can have both a **title** (window-header) and a **description** (window-footer). It can also be draggable or not and the ability to interact with the background can be toggled on and off.

    <a data-cxmodal-alert="This text will show up in the a custom alert-window" data-cxmodal-titel="Important">...</a>
    <img data-cxmodal data-cxmodal-description src="image/painting.jpg" alt="description goes here">
    
    <script>
        CXcontrol.options = {
            draggable: "true",
            background: "block"
        }
    </script>
    
    

    
