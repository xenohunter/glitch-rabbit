function Texture(w, h, colors) {

    var self = this;

    self.colors = colors;

    self.canvas = createCanvas(w, h);
    self.ctx = self.canvas.getContext('2d');
    disableCanvasSmoothness(this.ctx);

    self.imageData = self.ctx.createImageData(w, h);

}

Texture.prototype.generate = function (factor) {

    var self = this,
        data = self.imageData.data,
        color,
        i;

    factor = factor || PIXEL_SIZE;

    for (i = 0; i < data.length; i += 4) {
        color = self.colors[random(0, self.colors.length - 1)];
        data[i] = color[0];
        data[i + 1] = color[1];
        data[i + 2] = color[2];
        data[i + 3] = 255;
    }

    self.ctx.putImageData(self.imageData, 0, 0);

    self.ctx.save();
    self.ctx.scale(factor, factor);
    self.ctx.drawImage(self.canvas, 0, 0);
    self.ctx.restore();

    return self.ctx.createPattern(self.canvas, 'repeat');

};