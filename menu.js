function Menu(startCallback) {

    var self = this,
        halfScreen = CAMERA_W / 2;

    self.land = new Texture(camera.textureWidth, camera.heightDiff, LAND).generate();
    self.sky = new Texture(camera.textureWidth / camera.parallaxFactor, camera.h, SKY).generate(8);

    self.w = CAMERA_W;

    self.units = {
        '1': new Fire(random(250, 820)),
        '2': new Cactus(100)
    };

    self.textsCopy = [
        [0, 1, {
            text: 'PRESS Z TO PLAY',
            font: 'italic bold 56px Verdana',
            color: COLOR_RED,
            x: halfScreen,
            y: 190,
            shake: 1,
            center: true
        }],
        [0, 1, {
            text: 'PRESS X TO LAUNCH TUTORIAL',
            font: 'italic bold 22px Verdana',
            color: COLOR_RED,
            x: halfScreen,
            y: 240,
            center: true
        }],
        [0, 1, {
            text: 'Z and X to ATTACK',
            x: halfScreen - halfScreen / 2,
            y: 310,
            center: true
        }],
        [0, 1, {
            text: 'ARROWS to MOVE',
            x: halfScreen + halfScreen / 2,
            y: 310,
            center: true
        }],
        [0, 1, {
            text: 'Q to toggle MUSIC',
            x: halfScreen,
            y: 85,
            center: true
        }]
    ];

    self.texts = []; // That's to be looked up by `camera.postEffects`. Texts will be added here by Level.updateTexts().

    off();

    on('KeyZ', startCallback.bind(null, 1)); // Start the game.
    on('KeyX', startCallback.bind(null, 0)); // Tutorial (zeroth level).

}

extend(Menu, Level);