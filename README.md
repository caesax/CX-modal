# CX-modal
A simple but flexible modal/lightbox


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

