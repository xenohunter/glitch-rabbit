function Hero(x) {

    var self = this,
        sprite = SPRITES.HERO;

    self.x = x;
    self.y = 200;

    self.w = sprite.w * PIXEL_SIZE;
    self.h = sprite.h * PIXEL_SIZE;

    self.ax = 0;
    self.ay = -9;

    self.speed = self.defaultSpeed = 10;
    self.dir = 1;

    self.damageFactor = 1;

    off();

    on('ArrowRight', self.run.bind(self), self.stop.bind(self));
    on('ArrowLeft', self.run.bind(self, true), self.stop.bind(self, true));
    on('ArrowUp', self.jump.bind(self, 24)); // 24 is the jump force.

    // Arguments are attack type and cost.
    on('KeyZ', self.attack.bind(self, 'shot', 1));
    on('KeyX', self.attack.bind(self, 'beam', 15));
    on('KeyC', self.attack.bind(self, 'xxxx', 15));

    self.animation = new Animation(sprite);

    self.timers = {};

    self.glitchAmount = self.maxGlitchAmount = 25;
    self.oneThird = self.maxGlitchAmount / 3; // To calculate GLITCH intensity.

    self.glitch = new Glitch(self.x, self.y, self.w, self.h, self.getGlitchIntensity());

    self.glitchUp();
    self.glitchTrail();

}

extend(Hero, Unit);

Hero.prototype.tick = function () {

    var self = this;

    // Gap is 0 because the hero cannot move beyond the borders.
    self.applyBorders(0);
    self.applyFriction();
    self.applyGravity();
    self.getLandingState();

};

Hero.prototype.ownTick = function () {

    var self = this;

    level.iterateUnits(self.id, true, function (obj) {
        if (haveCollision(self, obj)) {
            self.hit(obj.gp);
            obj.bump(self, self.ax, -12); // Direct collision bumps the enemy, then kills it.
        }
    });

};

Hero.prototype.glitchUp = function (n) {

    var self = this;

    gameTimers.clearTimeout(self.timers.glitch);

    self.glitchAmount += (n || 1);

    if (self.glitchAmount > self.maxGlitchAmount) {
        self.glitchAmount = self.maxGlitchAmount;
    } else if (self.glitchAmount < 0) {
        self.glitchAmount = 0;
    }

    if (self.glitchAmount == 0) {
        self.kill();
    } else {
        self.timers.glitch = gameTimers.setTimeout(self.glitchUp.bind(self), 800); // New GLITCH point every 800 ms.
        self.pushedWithForce = n; // Here, `n` is most often `undefined`, so `pushedWithForce` animation isn't triggered.
    }

};

Hero.prototype.glitchTrail = function () {

    var self = this,
        delay = 70;

    // Glitch is updated once in `delay` ms which leaves a kind of trail while running or jumping.
    self.glitch.update(self.x, self.y, self.w, self.h, self.getGlitchIntensity());

    self.timers.trail = gameTimers.setTimeout(self.glitchTrail.bind(self), delay);

};

Hero.prototype.getGlitchIntensity = function () {
    return Math.ceil(this.glitchAmount / this.oneThird);
};

Hero.prototype.run = function (left, rec) {

    var self = this,
        dir = left ? -1 : 1;

    if (rec || !self.isRunning || self.dir != dir) {
        gameTimers.clearTimeout(self.timers.run);
        self.isRunning = true;
        self.dir = dir;
        self.ax = left ? -self.speed : self.speed;
        self.timers.run = gameTimers.setTimeout(self.run.bind(self, left, true), 50);
    }
};

Hero.prototype.stop = function (left) {

    var self = this,
        dir = left ? -1 : 1;

    if (self.dir == dir) {
        gameTimers.clearTimeout(this.timers.run);
        this.isRunning = false;
    }

};

Hero.prototype.attack = function (type, cost) {

    var self = this,
        directedX = self.x + (self.dir < 0 ? 0 : self.w);

    if (self.glitchAmount <= cost) return;
    self.glitchAmount -= cost;

    if (type == 'shot') {
        new Shot(self, 'SHOT', directedX, self.y, self.dir, null, 1000, 10 * self.damageFactor);
    } else if (type == 'beam') {
        new Beam(5 * self.damageFactor);
    }

};

Hero.prototype.hit = function (n) {
    this.glitchUp(-n);
};

Hero.prototype.bump = function (bumper, ax, ay) {

    var self = this;

    // A little hack to interrupt running.
    gameTimers.clearTimeout(self.timers.run);
    gameTimers.setTimeout(self.stop.bind(self), 300);

    self.ax = ax || -self.ax;
    self.ay = ay || -5;

};

Hero.prototype.kill = function () {

    var self = this;

    self.dead = true;
    self.ax = 0;

    self.glitch.remove();
    self.clearTimers();

    off(); // Switch off controls.

    level.lose();

};

Hero.prototype.getAnimationFrame = function () {

    var self = this,
        reversed = this.dir < 0;

    if (self.dead) {
        return self.animation.getFrame('dead');
    } else if (self.pushedWithForce) {
        self.pushedWithForce--;
        return self.animation.getFrame('punched', reversed);
    } else if (!self.isLanded) {
        return self.animation.getFrame('jump', reversed);
    } else if (self.isRunning) {
        return self.animation.getFrame(isOdd ? 'stepLeft' : 'stepRight', reversed);
    } else {
        return self.animation.getFrame('still', reversed);
    }

};