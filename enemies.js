// In enemies, `self.gp` is an amount of GLITCH which is subtracted from `hero.glitchAmount`.

function Enemy() {}

extend(Enemy, Unit);

Enemy.prototype.tick = function () {

    var self = this;

    self.applyBorders(self.w);
    self.applyGravity();

    // For those enemies who've been glitched.
    self.glitch && self.glitch.update(self.x, self.y, self.w, self.h);

    // Kill the enemy when it reaches the start.
    if (self.x <= -self.w && !self.dead) self.kill();

};

Enemy.prototype.hit = function (n) {
    this.hp -= n;
    if (this.hp <= 0) this.kill();
};

// Default bump kills instantly.
Enemy.prototype.bump = function (bumper, x, y) {

    var self = this;

    self.dead = true;
    self.clearTimers();

    self.ax = x;
    self.ay = y;

    gameTimers.setTimeout(self.kill.bind(self), 500);

};

Enemy.prototype.kill = function () {

    var self = this;

    self.glitch = new Glitch(self.x, self.y, self.w, self.h, 3);

    self.dead = true;
    self.clearTimers();

    self.ax = 0;
    self.ay = 0;

    // That is to dispose enemy remains for some time on the screen.
    gameTimers.setTimeout(function () {

        self.glitch.remove();
        delete level.units[self.id];

        // 18% chance to drop a powerup.
        random(0, 100) < 18 && new Powerup(self.x + 1 * PIXEL_SIZE, self.y + self.h - 2 * PIXEL_SIZE); // `2 * PIXEL_SIZE` is the height of any powerup.

        if (self.killToWin) level.stepToWin();

    }, 500);

};

Enemy.prototype.setCommons = function (sprite) {
    this.w = sprite.w * PIXEL_SIZE;
    this.h = sprite.h * PIXEL_SIZE;
    this.animation = new Animation(sprite);
};

function Bird(x) {

    var self = this,
        sprite = SPRITES.BIRD;

    self.hp = 10;
    self.gp = 4;

    self.setCommons(sprite);

    self.x = x;
    self.y = self.startY = random(50, GAME_H - 250);

    self.ax = 0;
    self.ay = random(-5, 5);

    self.speed = random(4, 6);

    self.timers = {};

    self.shoot();

}

extend(Bird, Enemy);

Bird.prototype.ownTick = function () {
    var self = this;
    self.ax = -self.speed;
    self.ay += (self.y - 30 > self.startY) ? -6 : 1;
};

Bird.prototype.shoot = function () {
    var self = this;
    new Shrapnel(self.x, self.y, -1);
    new Shrapnel(self.x, self.y, -1);
    new Shrapnel(self.x, self.y, -1);
    self.timers.shoot = gameTimers.setTimeout(self.shoot.bind(self), 2000);
};

Bird.prototype.getAnimationFrame = function () {
    return this.animation.getFrame(isOdd ? 0 : 1);
};

function Mouse(x) {

    var self = this,
        sprite = SPRITES.MOUSE;

    self.hp = 10;
    self.gp = 2;

    self.setCommons(sprite);

    self.x = x;
    self.y = GAME_H - self.w;

    self.ax = 0;
    self.ay = 0;

    self.speed = 5;

}

extend(Mouse, Enemy);

Mouse.prototype.ownTick = function () {

    var self = this;
    self.ax = -self.speed;

    // Triple speed when Hero is near.
    if (self.x - hero.x + hero.w <= 500) self.speed = 15;

};

Mouse.prototype.getAnimationFrame = function () {
    return this.animation.getFrame(this.speed < 15 ? 0 : 1);
};

function Fire(x) {

    var self = this,
        sprite = SPRITES.FIRE;

    self.hp = 1;
    self.gp = 3;

    self.setCommons(sprite);

    self.x = x;
    self.y = GAME_H - self.h;

    self.ax = 0;
    self.ay = 0;

}

extend(Fire, Enemy);

// Replacement for a default `Enemy` method.
Fire.prototype.bump = function (bumper) {
    bumper == hero && hero.bump(this);
    this.kill();
};

Fire.prototype.getAnimationFrame = function () {
    if (!this.dead) {
        return this.animation.getFrame(isOdd ? 0 : 1);
    } else {
        return this.animation.getFrame('dead');
    }
};

function Stone(x) {

    var self = this,
        sprite = SPRITES.STONE;

    self.hp = 1;
    self.gp = 1;

    self.setCommons(sprite);

    self.x = x;
    self.y = GAME_H - self.h;

    self.ax = 0;
    self.ay = 0;

    self.isReversed = random(0, 1); // That's not functional, just for visual variety.

    self.hitCounter = 0;

}

extend(Stone, Enemy);

Stone.prototype.hit = function () {

    var self = this;
    self.hitCounter++;

    // Every 5 hits, generate a mouse.
    if (self.hitCounter % 5 == 0) {
        level.addUnit(new Mouse(self.x));
    // On eleventh hit, destroy the Stone.
    } else if (self.hitCounter >= 11) {
        self.kill();
    }

};

Stone.prototype.bump = function (obj) {
    obj == hero && obj.bump(this);
};

Stone.prototype.getAnimationFrame = function () {
    return this.animation.getFrame(0, this.isReversed);
};

function Cactus(x) {

    var self = this,
        sprite = SPRITES.CACTUS;

    self.hp = 30;
    self.gp = 8;

    self.setCommons(sprite);

    self.x = x;
    self.y = GAME_H - self.h;

    self.ax = 0;
    self.ay = 0;

}

extend(Cactus, Enemy);

Cactus.prototype.hit = function (n) {

    var self = this;

    // Reflect the hit in both sides.
    new Shot(self, 'BALL', self.x, self.y, -1, n + 5, 800, 4);
    new Shot(self, 'BALL', self.x + self.w, self.y, 1, n + 5, 800, 4);

    self.hp -= n;
    if (self.hp <= 0) self.kill();

};

Cactus.prototype.bump = function () {
    this.kill();
};

Cactus.prototype.getAnimationFrame = function () {
    return this.animation.getFrame(0);
};

function BigCactus(x) {

    var self = this,
        sprite = SPRITES.BIG_CACTUS;

    self.hp = 300;
    self.gp = 15;

    self.setCommons(sprite);

    self.x = x;
    self.y = GAME_H - self.h;

    self.ax = 0;
    self.ay = 0;

    self.timers = {};

    self.shoot();

}

extend(BigCactus, Enemy);

BigCactus.prototype.shoot = function (reflective) {

    var self = this,
        dir = random(0, 1) ? -1 : 1,
        minusY = random(0, 5) * PIXEL_SIZE,
        directedX = self.x + (dir < 0 ? 0 : self.w);

    // Reflective shots use BALL sprite, default ones use SHOT (Hero uses them too).
    new Shot(self, reflective ? 'BALL' : 'SHOT', directedX, self.y + minusY, dir, random(6, 14), random(700, 1300), 3);

    if (!reflective) {
        // Timer renews only on non-reflective shots.
        self.timers.shoot = gameTimers.setTimeout(self.shoot.bind(self), 800);
    }

};

BigCactus.prototype.hit = function (n) {

    var self = this;

    self.shoot(true); // Reflect attack.

    self.hp -= n;
    if (self.hp <= 0) self.kill();

};

BigCactus.prototype.bump = function () {
    this.hp -= 75;
    if (this.hp <= 0) this.kill();
};

BigCactus.prototype.getAnimationFrame = function () {
    return this.animation.getFrame(0);
};

function Bat(x) {

    var self = this,
        sprite = SPRITES.BAT;

    self.hp = 30;
    self.gp = 1;

    self.setCommons(sprite);

    self.x = x;
    self.y = random(50, GAME_H - 250);

    self.ax = 0;
    self.ay = random(-2, 2);

    self.dir = 1;
    self.vDir = 1;

    self.speed = 5;
    self.retreatCoef = 1;

    self.timers = {};

    self.hunt();

}

extend(Bat, Enemy);

Bat.prototype.ownTick = function () {

    var self = this;

    self.ax = self.speed * self.dir;

    // Establishing vertical boundaries.
    if (self.y <= 120) {
        self.retreatCoef = 1;
        self.vDir = 1;
    } else if (self.y >= GAME_H - 70) {
        self.vDir = -1;
    }

    self.ay = 4 * self.vDir * self.retreatCoef;

};

Bat.prototype.hunt = function () {

    var self = this,
        distance = Math.abs(self.x - hero.x);

    // At close distance, attack.
    if (distance < 600) {
        self.speed = 8;
        if (self.retreatCoef == 1) self.vDir = 1;
    // At medium distance, roam.
    } else if (distance < 800) {
        self.speed = 5;
        self.dir *= random(0, 1) ? -1 : 1;
    // At big distance, get closer.
    } else {
        self.speed = 5;
        self.dir = -(distance / (self.x - hero.x)); // Get the sign.
    }

    self.timers.hunt = gameTimers.setTimeout(self.hunt.bind(self), 150);

};

// Retreat upwards after a successful attack.
Bat.prototype.bump = function () {
    this.y -= 18;
    this.vDir = -1;
    this.retreatCoef = 4;
};

Bat.prototype.getAnimationFrame = function () {
    if (!this.dead) {
        return this.animation.getFrame(Math.floor(currentTime / 300) % 2 ? 0 : 1);
    } else {
        return this.animation.getFrame(0);
    }
};

function Hydra(x) {

    var self = this,
        sprite = SPRITES.HYDRA;

    self.hp = 500;
    self.gp = 8;

    self.setCommons(sprite);

    self.x = x;
    self.y = GAME_H - self.h;

    self.ax = 0;
    self.ay = 0;

    self.dir = -1;

    self.timers = {};

    self.attack();
    self.attacksCount = 0;

}

extend(Hydra, Enemy);

Hydra.prototype.ownTick = function () {

    var self = this;

    self.getLandingState();

    if (self.isLanded) {

        self.dir = (self.x > hero.x) ? -1 : 1;

        // Friction implementation.
        if (self.ax > 0 && self.isLanded) {
            self.ax--;
        } else if (self.ax < 0 && self.isLanded) {
            self.ax++;
        }

    }

};

Hydra.prototype.attack = function () {

    var self = this;

    self.attacksCount++;

    if (self.attacksCount >= 4) {
        self.dance(); // It's more like a jump, in fact.
        self.attacksCount = 0;
    } else {
        self.shoot();
    }

    self.timers.attack = gameTimers.setTimeout(self.attack.bind(self), 2000);

};

Hydra.prototype.shoot = function () {

    var self = this,
        directedX = self.x + (self.dir < 0 ? 0 : self.w);

    new Shot(self, 'BALL', directedX, self.y, self.dir, 10, 1000, 1);
    new Shot(self, 'BALL', directedX, self.y, self.dir, 8, 1000, 2);
    new Shot(self, 'BALL', directedX, self.y, self.dir, 6, 1000, 3);

    new Shrapnel(self.x, self.y, -1);
    new Shrapnel(self.x, self.y, -1);
    new Shrapnel(self.x, self.y, 1);
    new Shrapnel(self.x, self.y, 1);

};

Hydra.prototype.dance = function () {

    var self = this;

    self.ax = 20 * self.dir;
    self.jump(9);

    self.dir *= -1;

};

Hydra.prototype.bump = function (obj) {
    obj == hero && obj.bump(this, -obj.ax * 2, -15);
    this.hit(100);
};

Hydra.prototype.getAnimationFrame = function () {
    var self = this;
    if (!self.dead) {
        return self.animation.getFrame(Math.floor(currentTime / 1000) % 2 ? 0 : 1, self.dir > 0);
    } else {
        return self.animation.getFrame('dead', self.dir > 0);
    }
};