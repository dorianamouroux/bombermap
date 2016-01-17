'use strict';
var lightbox = document.getElementById("lightbox"),
    squares = document.getElementsByClassName('square'),
    limMin = 5, limMax = 150;

function openLightbox() {
    lightbox.style.display = "block";
}

function closeLightbox() {
    lightbox.style.display = "none";
}

function keypress(e) {
    if (e.keyCode === 27) {
        closeLightbox();
    }
}

function setSize(elem, size) {
    size = elem.offsetHeight + size;
    if (size <= limMin || size >= limMax)
        return (false);
    size += "px";
    elem.style.height = size;
    elem.style.width = size;
    return (true);
}

function zoomPlus() {
    for (var i = 0; i < squares.length; i++) {
        if (setSize(squares[i], 5) == false)
            return ;
    }
}

function zoomMinus() {
    for (var i = 0; i < squares.length; i++) {
        if (setSize(squares[i], -5) == false)
            return ;
    }
}

document.getElementById("body").addEventListener("keydown", keypress, false);