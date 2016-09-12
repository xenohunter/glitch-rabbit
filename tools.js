function extend(Child, Parent) {
    var F = function () {};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
}

function random(from, to) {
    return Math.floor(Math.random() * (to - from + 1)) + from;
}

function on(key, onDown, onUp) {
    on.keys[key] = {
        listeners: [onDown, onUp],
        isPressed: false
    };
}

on.keys = {};

function off() {
    on.keys = {};
}

window.addEventListener('keydown', function (e) {
    if (e.code in on.keys && !on.keys[e.code].isPressed) {
        on.keys[e.code].listeners[0] && on.keys[e.code].listeners[0]();
        on.keys[e.code].isPressed = true;
    }
});

window.addEventListener('keyup', function (e) {
    if (e.code in on.keys) {
        on.keys[e.code].listeners[1] && on.keys[e.code].listeners[1]();
        on.keys[e.code].isPressed = false;
    }
});

function haveCollision(a, b) {

    var bottom = (a.y <= b.y && a.y + a.h >= b.y),
        top = (a.y >= b.y && a.y <= b.y + b.h),
        right = (a.x <= b.x && a.x + a.w >= b.x),
        left = (a.x >= b.x && a.x <= b.x + b.w);

    return (bottom && right ||
            bottom && left ||
            top && right ||
            top && left);

}

var getUniqueID = (function () {
    var count = 0;
    return function () {
        // We are guaranteed to not have a zero id.
        return ++count;
    };
})();

function createCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
}

function disableCanvasSmoothness(context) {
    context.mozImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;
}

function loadImages(sprites, callback) {

    function load() {
        var key = keys.pop(),
            dataString = sprites[key].sprite,
            image = new Image();
        image.onload = function () {
            sprites[key].sprite = this; // image
            keys.length ? load() : callback();
        };
        image.src = 'data:' + IMAGE_TYPE + ';base64,R0lGODlh' + dataString;
    }

    var keys = Object.keys(sprites);
    load();

}

function iterateImageData(imageData, callback) {

    function changePoint(r, g, b) {
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
    }

    var data = imageData.data,
        len = data.length,
        i;

    for (i = 0; i < len; i += 4) {
        callback(data[i], data[i + 1], data[i + 2], changePoint);
    }

}