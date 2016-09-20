function Animation(props) {

    var self = this,

        count = props.frames.length,
        realW = props.w * PIXEL_SIZE,
        realH = props.h * PIXEL_SIZE,

        canvas,
        ctx,

        tempCanvas,
        tempCtx,
        imgData;

    canvas = createCanvas(realW * count, realH);
    ctx = canvas.getContext('2d');
    disableCanvasSmoothness(ctx);

    ctx.scale(PIXEL_SIZE, PIXEL_SIZE);
    ctx.drawImage(props.sprite, 0, 0);

    self.frames = {};

    while (count--) {

        tempCanvas = createCanvas(realW, realH);
        tempCtx = tempCanvas.getContext('2d');
        imgData = ctx.getImageData(realW * count, 0, realW, realH);

        // Put ImageData with a sprite into canvas context.
        tempCtx.putImageData(imgData, 0, 0);

        // Save the sprite as an image.
        self.frames[props.frames[count]] = new Image();
        self.frames[props.frames[count]].src = tempCanvas.toDataURL(IMAGE_TYPE);

        // Draw previously saved image on the canvas, in reverse by the X-axis.
        tempCtx.clearRect(0, 0, realW, realH);
        tempCtx.scale(-1, 1);
        tempCtx.drawImage(self.frames[props.frames[count]], -realW, 0);

        // Save the reversed sprite as an image.
        self.frames[props.frames[count] + 'R'] = new Image();
        self.frames[props.frames[count] + 'R'].src = tempCanvas.toDataURL(IMAGE_TYPE);

    }

}

Animation.prototype.getFrame = function (name, reversed) {
    return this.frames[name + (reversed ? 'R' : '')];
};