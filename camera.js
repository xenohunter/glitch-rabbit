function Camera() {

    var self = this;

    self.canvas = document.querySelector('canvas');
    self.ctx = self.canvas.getContext('2d');

    self.x = 0;
    self.y = 0;

    self.w = CAMERA_W;
    self.H = 576;

    self.h = GAME_H;

    self.heightDiff = self.H - self.h;
    self.textureWidth = self.heightDiff * 8;

    self.parallaxFactor = 4;

    self.mask = document.querySelector('#mask');

}

Camera.prototype.fade = function () {
    self.mask.className = 'on';
};

Camera.prototype.unfade = function () {
    self.mask.className = '';
};

Camera.prototype.clear = function () {

    var self = this,
        backGap = 50,
        foreGap = 200;

    // Focusing on the Hero movement.
    if (self.x + START_X + backGap > self.focus.x && self.x > 0) {
        self.x = self.focus.x - START_X - backGap;
        self.x = self.x < 0 ? 0 : self.x;
    } else if (self.x + START_X + foreGap < self.focus.x && self.x + self.w < level.w) {
        self.x = self.focus.x - START_X - foreGap;
        self.x = self.x + self.w > level.w ? level.w - self.w : self.x;
    }

    // Parallax sky background.
    self.ctx.fillStyle = level.sky;
    self.ctx.save();
    self.ctx.translate(-self.x % self.textureWidth / self.parallaxFactor, 0);
    self.ctx.fillRect(0, 0, self.w + self.textureWidth / self.parallaxFactor, self.h);
    self.ctx.restore();

    // Moving land texture.
    self.ctx.fillStyle = level.land;
    self.ctx.save();
    self.ctx.translate(-self.x % self.textureWidth, 0);
    self.ctx.fillRect(0, self.h, self.w + self.textureWidth, self.H);
    self.ctx.restore();

};

Camera.prototype.draw = function (obj) {

    var self = this;

    if (self.isInBounds(obj)) {
        if (obj.getAnimationFrame) {
            self.ctx.drawImage(obj.getAnimationFrame(), obj.x - self.x, obj.y - self.y);
        } else {
            self.ctx.fillStyle = obj.color || '#000';
            self.ctx.fillRect(obj.x - self.x, obj.y - self.y, obj.w, obj.h);
        }
    }

};

Camera.prototype.drawAttacks = function () {

    var self = this;

    Object.keys(level.attacks).forEach(function (key) {
        var a = level.attacks[key];
        if (self.isInBounds(a) && a.getAnimationFrame) {
            self.ctx.drawImage(a.getAnimationFrame(), a.x - self.x, a.y - self.y, a.w, a.h);
        }
    });

};

Camera.prototype.drawGlitches = function () {

    // Decreasing re-render frequency.
    if (isOdd || random(0, 1)) return;

    var self = this;

    Object.keys(level.glitches).forEach(function (key) {

        var g = level.glitches[key],
            area,
            gap;

        if (self.isInBounds(g)) {

            area = self.ctx.getImageData(g.x - self.x, g.y - self.y, g.w, g.h);
            gap = 12 * g.intensity;

            self.ctx.drawImage(Glitch.distort(area, gap, g.intensity), g.x - self.x - gap, g.y - self.y - gap);

        }

    });

};

Camera.prototype.drawText = function (text) {

    var self = this,
        randomShiftX = text.shake ? random(-text.shake, text.shake) : 0,
        randomShiftY = text.shake ? random(-text.shake, text.shake) : 0;

    self.ctx.font = text.font;
    self.ctx.textAlign = text.center ? 'center' : 'left';

    self.ctx.shadowColor = '#000';
    self.ctx.shadowBlur = 2;
    self.ctx.lineWidth = 3;

    self.ctx.strokeText(text.text, text.x + randomShiftX + 1, text.y + randomShiftY + 1);

    self.ctx.shadowBlur = 0;
    self.ctx.fillStyle = text.color;
    self.ctx.fillText(text.text, text.x + randomShiftX - 1, text.y + randomShiftY - 1);

};

Camera.prototype.postEffects = function () {

    var self = this,
        glitch,

        rChannel,
        gChannel,
        bChannel;

    level.texts.forEach(self.drawText.bind(self));

    if (hero) {

        glitch = hero.glitchAmount;

        rChannel = 255 - (glitch * 10);
        gChannel = glitch * 9;
        bChannel = 40;

        if (glitch < 15) {
            rChannel += 10 * (15 - glitch);
            gChannel -= 5 * (15 - glitch);
            bChannel -= 15 - glitch;
        }

        rChannel = rChannel < 0 ? 0 : rChannel > 255 ? 255 :rChannel;
        gChannel = gChannel < 0 ? 0 : gChannel > 255 ? 255 :gChannel;

        self.drawText({
            text: 'G ' + glitch,
            font: 'italic bold 46px Verdana',
            color: 'rgb(' + rChannel + ', ' + gChannel + ', ' + bChannel + ')',
            x: 40,
            y: 60,
            shake: glitch < 6 ? 2 : glitch < 10 ? 1 : 0
        });

    }

};

Camera.prototype.isInBounds = function (obj) {
    var self = this;
    return (obj.x < self.x + self.w &&
            obj.y < self.y + self.h &&
            obj.x + obj.w > self.x &&
            obj.y + obj.h > self.y);
};

Camera.prototype.focusOn = function (unit) {
    this.focus = unit;
};

Camera.prototype.reset = function () {
    this.x = 0;
};