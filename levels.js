function Level(name, winCallback, loseCallback) {

    var self = this;

    self.meta = Level.LEVELS[name];

    self.w = self.meta.width;

    self.land = new Texture(camera.textureWidth, camera.heightDiff, self.meta.land).generate(); // Default scale is PIXEL_SIZE (16).
    self.sky = new Texture(camera.textureWidth / camera.parallaxFactor, camera.h, self.meta.sky).generate(8);

    self.units = {};
    self.attacks = {};
    self.glitches = {};

    self.heroFarthestX = 0; // How far Hero could reach.
    self.ambushesPointer = 0; // Points to the last released ambush.

    // Calculating how much "necessary enemies" are about to be killed.
    self.winSteps = self.meta.ambushes.reduce(function (steps, ambush) {
        if (ambush[5] && typeof ambush[4] == 'number') {
            return steps + ambush[2]; // Add the minimal number from random distribution.
        } else if (ambush[5]) {
            return steps + ambush[4].length; // Add `spread` array length.
        } else {
            return steps; // If not a `killToWin` case.
        }
    }, 0);

    self.winCallback = winCallback;
    self.loseCallback = loseCallback;

    self.textsCopy = self.meta.texts.slice(0); // It must be sliced every time texts go to `self.texts`.
    self.texts = []; // That is to be looked up by `camera.postEffects`.

}

Level.prototype.update = function (heroX) {

    var self = this,

        ambushes = self.meta.ambushes,
        len = ambushes.length,
        i = self.ambushesPointer,

        ambush,

        triggerX,
        unitConstructor,
        unitQuantity,
        spread,
        killToWin,

        j;

    if (heroX > self.heroFarthestX) self.heroFarthestX = heroX;

    while (i < len) {

        ambush = ambushes[i];

        triggerX = ambush[0];
        killToWin = ambush[5];

        // An X point where ambush is triggered by Hero.
        if (triggerX <= self.heroFarthestX) {

            unitConstructor = ambush[1];
            unitQuantity = random(ambush[2], ambush[3]);

            spread = ambush[4];
            if (typeof spread == 'number') {
                spread = Level.createSpreadArray(unitQuantity, 0, spread);
            }

            for (j = 0; j < spread.length; j++) {
                level.addUnit(new unitConstructor(triggerX + CAMERA_W + spread[j]), killToWin);
            }

            ++i;

        } else {

            break;

        }

    }

    // Next time, iteration will begin from that point.
    self.ambushesPointer = i;

};

Level.prototype.updateText = function () {

    var self = this,
        texts = self.textsCopy, // That array is to be changed.
        curText,
        i;

    // Removing old texts. CAUTION, `texts` and `self.texts` are different arrays, `self.texts` is for final output.
    i = self.texts.length;
    while (i--) {
        curText = self.texts[i];
        if (curText.upToX <= camera.x || (curText.upToTime && curText.upToTime < currentTime)) {
            self.texts.splice(i, 1);
        }
    }

    // Adding new texts.
    i = 0;
    while (i < texts.length) {

        curText = texts[i];

        if (camera.x >= curText[0]) {
            self.texts.push(Level.applyTextDefaults(curText[2], curText[1])); // Args: `textObject`, then `endCameraX`.
            ++i;
        } else {
            break;
        }

    }

    self.textsCopy = self.textsCopy.slice(i);

};

Level.prototype.stepToWin = function () {
    this.winSteps--;
    !this.winSteps && this.win();
};

Level.prototype.win = function () {

    var self = this,
        winMessage;

    // To be sure level is not lost yet.
    if (!self.isLost) {

        // Common message or one for the last level.
        winMessage = self.meta.last ? 'YOUR GLITCH JOURNEY IS DONE!' : WIN_MESSAGES[random(0, WIN_MESSAGES.length - 1)];

        self.isLost = false;

        self.textsCopy.unshift([camera.x - CAMERA_W, camera.x + CAMERA_W, {
            text: winMessage,
            font: 'italic bold 56px Verdana',
            color: COLOR_RED,
            x: CAMERA_W / 2,
            y: 250,
            center: true
        }]);

        gameTimers.setTimeout(self.winCallback, self.meta.last ? 3000 : 1800);

    }

};

Level.prototype.lose = function () {

    var self = this;

    // To be sure level is not won nor lost yet.
    if (self.isLost !== false && self.isLost !== true) {

        self.isLost = true;

        self.textsCopy.unshift([camera.x - CAMERA_W, camera.x + CAMERA_W, {
            text: LOSE_MESSAGES[random(0, LOSE_MESSAGES.length - 1)],
            font: 'italic bold 56px Verdana',
            color: COLOR_WHITE,
            x: CAMERA_W / 2,
            y: 250,
            center: true
        }]);

        gameTimers.setTimeout(self.loseCallback, 2000);

    }

};

Level.prototype.addUnit = function (unit, killToWin) {
    unit.id = getUniqueID();
    unit.killToWin = killToWin;
    this.units[unit.id] = unit;
};

Level.prototype.iterateUnits = function (exceptID, liveOnly, callback) {

    var unitsKeys = Object.keys(this.units),
        key,
        i;

    for (i = 0; i < unitsKeys.length; i++) {
        key = unitsKeys[i];
        // Skip exceptID, if present. Skip dead enemies, if needed.
        if ((!exceptID || key != exceptID) && !(liveOnly && this.units[key].dead)) {
            if (callback(this.units[key]) == 0) break; // Optimization.
        }
    }

};

Level.prototype.iterateAttacks = function () {
    Object.keys(this.attacks).forEach(function (key) {
        this.attacks[key].tick();
    }, this);
};

// Generate exact positions for enemies with a range of positions.
Level.createSpreadArray = function (quantity, from, to) {
    var array = [];
    while (quantity--) {
        array.push(random(from, to));
    }
    return array;
};

Level.applyTextDefaults = function (textObject, endCameraX) {

    var result = {};

    result.text = textObject.text;
    result.font = textObject.font || 'italic bold 30px Verdana';
    result.color = textObject.color || COLOR_WHITE;
    result.center = textObject.center || false;
    result.shake = textObject.shake || 0;

    result.x = textObject.x || 50;
    result.y = textObject.y || GAME_H + 80;

    result.upToX = endCameraX;
    result.upToTime = textObject.duration ? currentTime + textObject.duration * 1000 : 0; // Timestamp or 0 - forever.

    return result;

};

Level.LEVELS = {

    '0': {

        width: 8000,
        land: LAND,
        sky: SKY,

        // Ambushes legend: [heroX, Enemy, minQuantity, maxQuantity, spreadingWidth OR [spreadPoints], killToWin].
        // WARNING : ambushes must be sorted by triggerX, ascending.
        // WARNING : all `spread` values are summed with `CAMERA_W`.
        // WARNING : each level has to have at least one ambush with `killToWin`; also, number of units in such ambushes MUST BE FIXED!
        ambushes: [
            [0, Fire, 1, 1, 0],
            [700, Fire, 5, 5, [0, 100, 200, 300, 400]],
            [6200, Fire, 1, 1, 0, true]
        ],

        // Texts legend: [startCameraX, endCameraX, textObject].
        // Text object legend: { text, font, center, shake, duration }.
        // WARNING : texts must be sorted by startCameraX, ascending.
        texts: [
            [0, 500, {
                text: 'USE ARROWS TO MOVE AND JUMP',
                duration: 5
            }],
            [500, 1000, {
                text: 'PRESS Z FOR A COMMON ATTACK',
                duration: 5
            }],
            [1000, 1600, {
                text: 'PRESS X FOR A GLITCH BEAM',
                duration: 5
            }],
            [1600, 2200, {
                text: 'EACH ATTACK SPENDS YOUR GLITCH',
                duration: 5
            }],
            [2200, 2800, {
                text: 'GLITCH LEVEL IS DISPLAYED IN THE TOP LEFT',
                duration: 5
            }],
            [2800, 3400, {
                text: 'COLORED BLOCKS WILL POWER-UP YOU',
                duration: 5
            }],
            [3400, 4000, {
                text: 'WHITE WILL GIVE YOU GLITCH',
                duration: 5
            }],
            [4000, 4600, {
                text: 'RED WILL IMPROVE YOUR SPEED',
                duration: 5
            }],
            [4600, 5200, {
                text: 'AND BLUE WILL DOUBLE YOUR DAMAGE',
                duration: 5
            }],
            [5200, 5800, {
                text: 'REMEMBER, GLITCH IS YOUR LIFE',
                duration: 5
            }],
            [5800, 6400, {
                text: 'IF IT ENDS, YOU\'LL DIE',
                duration: 5
            }],
            [6400, 7000, {
                text: 'AND, UNLIKE THAT FIRE, YOUR GLITCH MUST LIVE',
                duration: 8
            }]
        ]

    },

    '1': {

        width: 7000,
        land: LAND,
        sky: SKY,

        ambushes: [
            [-1200, Fire, 6, 6, [700, 2000, 2800, 3800, 4000, 6200]],
            [0, Stone, 2, 2, [1800, 4000]],
            [1400, Bird, 2, 3, 100],
            [2000, Mouse, 3, 4, 600],
            [2200, Bird, 3, 3, [1000, 1100, 2600]],
            [2800, Mouse, 3, 3, [300, 400, 500]],
            [3200, Bird, 2, 3, 700],
            [3400, Mouse, 4, 4, [0, 100, 200, 300]],
            [3800, Bat, 3, 5, 500, true]
        ],

        texts: [
            [0, 500, {
                text: 'BY THE WAY, MY NAME IS NICH',
                duration: 5,
                color: COLOR_BLUE
            }],
            [500, 1000, {
                text: 'NICH THE GLITCH RABBIT',
                duration: 5,
                color: COLOR_BLUE
            }],
            [1100, 1500, {
                text: 'O-OH, BEWARE!',
                duration: 5,
                color: COLOR_BLUE
            }]
        ]

    },

    '2': {

        width: 7000,
        land: SAND,
        sky: SKY,

        ambushes: [
            [600, Cactus, 3, 6, 3600],
            [700, Fire, 4, 4, [0, 100, 200, 300]],
            [1000, Bird, 2, 3, 600],
            [1500, Mouse, 2, 4, 1400],
            [1500, Stone, 1, 1, 0],
            [1900, Fire, 1, 1, 0],
            [2200, Bird, 3, 4, [0, 200, 400, 600]],
            [2600, Mouse, 4, 4, [200, 300, 400, 500]],
            [3200, BigCactus, 1, 1, 1600, true]
        ],

        texts: [
            [0, 500, {
                text: 'I HEARD THAT CACTUS NEEDLES ARE DANGEROUS',
                duration: 5,
                color: COLOR_BLUE
            }],
            [500, 1000, {
                text: 'DON\'T LET THEM HURT YOU',
                duration: 5,
                color: COLOR_BLUE
            }]
        ]

    },

    '3': {

        last: true,

        width: 7000,
        land: DARK_SAND,
        sky: NIGHT_SKY,

        ambushes: [
            [500, Fire, 1, 1, 0],
            [800, Cactus, 3, 6, 3600],
            [1000, Mouse, 3, 3, [0, 200, 400]],
            [1500, Stone, 1, 1, 0],
            [1800, Bird, 2, 3, 600],
            [2400, Fire, 1, 1, 100],
            [2500, Mouse, 3, 3, [0, 200, 400]],
            [2800, Bird, 3, 4, [0, 200, 400, 600]],
            [3200, Bat, 4, 4, [200, 300, 400, 500]],
            [3700, Hydra, 1, 1, 1200, true]
        ],

        texts: [
            [0, 500, {
                text: 'IT\'S GETTING LATE, YOU NEED TO MAKE A...',
                duration: 5,
                color: COLOR_BLUE
            }],
            [500, 1000, {
                text: 'LOOK, FIRE!',
                duration: 5,
                color: COLOR_BLUE
            }]
        ]

    }

};