function powerupGlitchPlus(obj) {
    obj.glitchUp(random(10, 20));
}

function powerupSpeedUp(obj) {
    obj.speed = Math.floor(obj.defaultSpeed * 1.6);
    gameTimers.setTimeout('powerupSU', function () {
        obj.speed = obj.defaultSpeed;
    }, 7000);
}

function powerupDoubleDamage(obj) {
    obj.damageFactor = 2;
    gameTimers.setTimeout('powerupDD', function () {
        obj.damageFactor = 1;
    }, 7000);
}

function Powerup(x, y) {

    var self = this,
        effectArray,
        sprite;

    self.id = getUniqueID();
    self.creationTime = currentTime;

    effectArray = Powerup.EFFECTS[random(0, Powerup.EFFECTS.length - 1)];
    self.effect = effectArray[0];
    sprite = effectArray[1];

    self.animation = new Animation(sprite);

    self.x = x;
    self.y = y;
    self.w = sprite.w * PIXEL_SIZE;
    self.h = sprite.h * PIXEL_SIZE;

    self.hp = 3;
    self.gp = 0;

    level.units[self.id] = self;

}

Powerup.prototype.tick = function () {
    if (currentTime - this.creationTime >= 5000) {
        this.absorb();
    }
};

Powerup.prototype.hit = function () {
    this.hp--;
    if (!this.hp) this.absorb();
};

Powerup.prototype.bump = function (obj) {
    this.absorb(obj);
};

Powerup.prototype.absorb = function (obj) {
    var self = this;
    obj == hero && self.effect(obj);
    gameTimers.setTimeout(function () {
        delete level.units[self.id];
    }, 0);
};

Powerup.prototype.getAnimationFrame = function () {
    return this.animation.getFrame(isOdd ? 0 : 1);
};

Powerup.EFFECTS = [
    [powerupGlitchPlus, SPRITES.POWERUP_GP],
    [powerupSpeedUp, SPRITES.POWERUP_SU],
    [powerupDoubleDamage, SPRITES.POWERUP_DD]
];