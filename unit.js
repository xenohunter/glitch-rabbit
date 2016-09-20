// Units .id property is added in Level.prototype.addUnit().
// Units .tick() method is added in Hero and Enemy classes.
// Units .ownTick() method is added in Hero and some children enemy classes (i.e. Bird).

function Unit() {}

// Moving till borders; enemies have a gap to appear and disappear behind the screen.
Unit.prototype.applyBorders = function (gap) {
    var self = this;
    self.x = (self.x + self.ax > 0 - gap)
        ? (self.x + self.w + self.ax < level.w + gap)
        ? self.x + self.ax
        : level.w - self.w + gap
        : 0 - gap;
};

// Slow while not running and not in jump.
Unit.prototype.applyFriction = function () {
    var self = this;
    if (self.isLanded && !self.isRunning) {
        if (self.ax < 0) self.ax++;
        else if (self.ax > 0) self.ax--;
    }
};

Unit.prototype.applyGravity = function () {

    var self = this;

    if (self.y + self.h + self.ay < GAME_H) {
        self.y += ++self.ay;
    } else {
        self.y = GAME_H - self.h;
        self.ay = 0;
    }

};

Unit.prototype.getLandingState = function () {
    this.isLanded = (this.y + this.h == GAME_H);
};

Unit.prototype.jump = function (jumpForce) {
    if (this.isLanded) this.ay -= jumpForce;
};

// When unit is killed, all its timers are removed.
Unit.prototype.clearTimers = function () {
    var self = this;
    self.timers && Object.keys(self.timers).forEach(function (key) {
        gameTimers.clearTimeout(self.timers[key]);
    });
};