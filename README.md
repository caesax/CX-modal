# CX-modal
A small but flexible modal/lightbox that easily can be set to be both draggable, modal and with or without overlay.


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
    <a data-cxmodal href="help.html" data-cxmodal-draggable="false">Help</a>
    
And/or put some options in a script-tag:

    <script>
        CXcontrol.options = {
            draggable: "true",
            background: "block"
        }
    </script>
    
    
## Datasets
**cxmodal**\
`<a data-cxmodal href="content for the modal here">Click Me</a>`\
`<a data-cxmodal="content for the modal here" href="#">Click Me</a>`\
The model tries to find the right type _(image, ajax, message, iframe)_ based on the content . If the content is not set directly it will look in the elements href-attribute and then in the src-attribute.

**cxmodal-image, cxmodal-ajax, cxmodal-iframe**\
Use this to be sure to set the right datatype.\
`<a data-cxmodal-ajax href="help.html">Click Me</a>`\
`<a data-cxmodal-image="myPicture.jpg" href="#">Click Me</a>`\

**cxmodal-alert, cxmodal-confirm**\
`<a data-cxmodal-alert="More detailed info here..." href="#">Info</a>`\
These can also be combined with other dataset-types to create "two-step"-modals.\
`<a data-cxmodal-confirm="Are you sure you want to edit this?" data-cxmodal-ajax="edit.php">Edit</a>`\

**cxmodal-draggable**\
`<img data-cxmodal data-cxmodal-draggable="true" src="image.png" alt="Beautiful Fish">`\
Set if the modal-window should be draggable or not.

**cxmodal-background**\
`<a data-cxmodal-alert="Do not forget this!" data-cxmodal-background="block" href="#">Remember</a>`\
Sets how the modal-overlay (background) is handled. Nothing happens if you click the background when set to _block_ and with _close_ the modal closes. To fully interact with the background set the cxmodal-bakground to _none_.

**cxmodal-title**\
`<a data-cxmodal-ajax data-cxmodal-title="EDIT" href="edit.php?e=12">Edit</a>`\
Sets the title of the content and is shown in the modal-windows header (top). It can also be set to "_none_", "_title_" or "_alt_" to find the text in the title- or the alt-attribute.

**cxmodal-description**\
`<a data-cxmodal-image data-cxmodal-description="alt" href="largefish.jpg"><img src="smallfish.jpg" alt="Red Snapper"></a>`\
Sets the description of the content and is shown in the modal-windows footer (bottom). It can also be set to "_none_", "_title_" or "_alt_" to find the text in the title- or the alt-attribute.

**cxmodal-alert-title, cxmodal-confirm-title**\
`<a data-cxmodal-alert="Take a big breath..." data-cxmodal-alert-title="Prepare yourself!" href="http://scarypage.com">Scary Page</a>`\
You need this to control the title for the message in a "two-step"-modal.

## Defaults
    defaults = {
        draggable: "true",              // true | false
        background: "close",            // block | close | none
        defaultTitle: "title",          // title | alt | none
        defaultDescription: "alt",      // title | alt | none
        alertTitle: "ALERT",            // * | none
        confirmTitle: "CONFIRM"         // * | none
    }

To set your own defaults use javascript last in your body-tag like this:

    <script>
        CXcontrol.options = {
            draggable: "false",
            background: "block"
        }
    </script>
