function Shot(emitter, type, x, y, dir, speed, range, power) {

    var self = this,
        sprite = SPRITES[type];

    self.id = getUniqueID();
    self.emitter = emitter;

    self.dir = dir;

    self.w = sprite.w * PIXEL_SIZE;
    self.h = sprite.h * PIXEL_SIZE;

    self.x = self.startX = x + (0.5 * PIXEL_SIZE * self.dir) - (self.dir < 0 ? self.w : 0);
    self.y = y + (1 * PIXEL_SIZE);

    self.speed = speed || random(12, 15);
    self.range = range || random(400, 1000);
    self.power = power || random(15, 30);

    self.animation = new Animation(sprite);
    self.lastFrameNumber = sprite.frames.length - 1;

    self.creationTime = currentTime;

    if (level.attacks) level.attacks[self.id] = self;

}

Shot.prototype.tick = function () {

    var self = this,
        emitterIsHero = (self.emitter == hero);

    self.x += self.speed * self.dir;

    if (emitterIsHero) {

        level.iterateUnits(hero.id, true, function (unit) {
            if (haveCollision(unit, self)) {
                delete level.attacks[self.id];
                unit.hit(self.power);
                return 0; // Optimization to break iterating cycle (and hit only one enemy).
            }
        });

    } else {

        if (haveCollision(hero, self)) {
            delete level.attacks[self.id];
            hero.hit(self.power);
        }

    }

    if (Math.abs(self.startX - self.x) >= self.range && level.attacks[self.id]) {
    // if (self.x >= self.startX + self.range && level.attacks[self.id]) {
        delete level.attacks[self.id];
    }

};

Shot.prototype.getAnimationFrame = function () {

    var self = this,
        frameN,
        frame;

    frameN = Math.floor((currentTime - self.creationTime) / 100);
    frame = self.animation.getFrame(frameN <= self.lastFrameNumber ? frameN : self.lastFrameNumber);

    return frame;

};

// Hero-only attack.
function Beam(power) {

    var self = this;

    self.id = getUniqueID();

    self.w = 1000; // In that attack, `self.h` is dynamic. As well as X and Y.
    self.power = power;

    self.glitch = new Glitch(self.x, self.y, 1000, PIXEL_SIZE, 1);

    self.stepsLeft = 2;
    self.update();

    level.attacks[self.id] = self;

}

Beam.prototype.update = function () {

    var self = this;

    if (self.stepsLeft < 0) {
        hero.speed = hero.defaultSpeed; // Restore default speed.
        self.glitch.remove();
        delete level.attacks[self.id];
    } else {
        hero.speed = 4; // Reduce speed while beaming.
        gameTimers.setTimeout(self.update.bind(self), 800); // Set timeout for the next step.
        self.stepsLeft--;
    }

};

Beam.prototype.tick = function () {

    var self = this;

    // That is to get a widening of 1-3-5 pixels in three steps.
    self.h = (5 - self.stepsLeft * 2) * PIXEL_SIZE;

    self.x = hero.x + (hero.dir < 0 ? -self.w : hero.w); // Get direction.
    self.y = hero.y + (self.stepsLeft * PIXEL_SIZE); // Align to the vertical center of Hero.

    self.glitch.update(self.x, self.y, self.w, self.h, 3 - self.stepsLeft);

    // Here, we do not return `0` as far as that attack is MASSIVE.
    level.iterateUnits(hero.id, true, function (unit) {
        if (haveCollision(unit, self)) {
            if (unit.hp <= self.power) {
                unit.bump(self, 10 * hero.dir, -5);
            } else {
                unit.hit(self.power);
            }
        }
    });

};

// Enemy-only attack.
function Shrapnel(x, y, dir) {

    var self = this,
        sprite = SPRITES.BALL;

    self.id = getUniqueID();

    self.dir = dir;

    self.w = sprite.w * PIXEL_SIZE;
    self.h = sprite.h * PIXEL_SIZE;

    self.x = x + (0.5 * PIXEL_SIZE * self.dir) - (self.dir < 0 ? self.w : 0);
    self.y = y - 2 * PIXEL_SIZE;

    self.ay = -random(10, 18);

    self.speed = random(4, 10);
    self.power = random(3, 6);

    self.animation = new Animation(sprite);

    level.attacks[self.id] = self;

}

Shrapnel.prototype.tick = function () {

    var self = this;

    self.x += self.speed * self.dir;

    if (self.y + self.h + self.ay < GAME_H) {
        self.y += ++self.ay;
    } else {
        delete level.attacks[self.id];
    }

    if (haveCollision(hero, self)) {
        delete level.attacks[self.id];
        hero.hit(self.power);
    }

};

Shrapnel.prototype.getAnimationFrame = function () {
    return this.animation.getFrame(0);
};