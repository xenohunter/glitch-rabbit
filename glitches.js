function Glitch(x, y, w, h, intensity) {

    var self = this;

    self.update(x, y, w, h, intensity);

    self.id = getUniqueID();
    if (level.glitches) level.glitches[self.id] = self;

}

Glitch.prototype.update = function (x, y, w, h, intensity) {

    var self = this;

    self.x = x;
    self.y = y;
    self.w = w;
    self.h = h;

    self.intensity = intensity || self.intensity || 1;

};

Glitch.prototype.remove = function () {
    delete level.glitches[this.id];
};

Glitch.distort = function (area, gap, intensity) {

    var w = area.width,
        h = area.height,

        canvas = createCanvas(w + gap * 2, h + gap * 2),
        ctx = canvas.getContext('2d'),

        tempX,
        tempY,
        tempW,
        tempH,
        tempImgData;

    ctx.putImageData(area, gap, gap);

    while (intensity--) {

        tempX = random(gap, gap + 10);
        tempY = random(gap, gap + 10);
        tempW = random(16, w + 32);
        tempH = random(8, h / 2 + 8);

        tempImgData = ctx.getImageData(tempX, tempY, tempW, tempH);
        tempImgData = Glitch.shift(tempImgData);

        ctx.putImageData(tempImgData, random(gap / 2, w / 2 + gap / 2), random(gap, h * 1.2));

    }

    return canvas;

};

Glitch.shift = function (imageData) {

    var type = random(0, 3);

    switch (type) {

        case 0:
            iterateImageData(imageData, function (r, g, b, changePoint) {
                changePoint(r - 100, g - 100, b - 100);
            });
            break;
        case 1:
            iterateImageData(imageData, function (r, g, b, changePoint) {
                changePoint(r + 100, g + 100, b + 100);
            });
            break;

    }

    return imageData;

};