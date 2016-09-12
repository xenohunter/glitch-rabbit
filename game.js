var camera,
    level,

    hero,

    RAFID,

    music,

    // Those are used in various methods to define the needed animation frame.
    currentTime,
    isOdd,

    gameTimers = new Timers(),

    levelCount = Object.keys(Level.LEVELS).length - 1,
    delay = 700;

loadImages(SPRITES, function () {

    function tickLevel() {

        currentTime = Date.now();
        isOdd = currentTime % 200 < 100;

        camera.clear();

        level.update(hero.x);

        level.iterateUnits(false, false, function (unit) {

            // General logic, like gravitation, applies to all units.
            unit.tick();

            // Own logic applies only to live units.
            !unit.dead && unit.ownTick && unit.ownTick();

            camera.draw(unit);

        });

        level.iterateAttacks();

        camera.drawAttacks();
        camera.drawGlitches();

        level.updateText();
        camera.postEffects();

        RAFID = window.requestAnimationFrame(tickLevel);

    }

    function tickMenu() {

        currentTime = Date.now();
        isOdd = currentTime % 200 < 100;

        camera.clear();

        level.iterateUnits(false, false, function (unit) {
            unit.tick();
            camera.draw(unit);
        });

        level.updateText();
        camera.postEffects();

        RAFID = window.requestAnimationFrame(tickMenu);

    }

    function nextLevel(lvl) {

        RAFID && window.cancelAnimationFrame(RAFID);
        gameTimers.nullifyTimers();
        camera.reset();
        camera.unfade();

        level = new Level(lvl, function () {
            if (lvl < levelCount) {
                camera.fade();
                gameTimers.setTimeout(nextLevel.bind(null, lvl + 1), delay);
            } else {
                camera.fade();
                gameTimers.setTimeout(menu, delay);
            }
        }, function () {
            camera.fade();
            gameTimers.setTimeout(menu, delay);
        });

        hero = new Hero(START_X);

        level.addUnit(hero);
        camera.focusOn(hero);

        window.requestAnimationFrame(tickLevel);

    }

    function menu() {

        RAFID && window.cancelAnimationFrame(RAFID);
        gameTimers.nullifyTimers();
        camera.reset();
        camera.unfade();

        level = new Menu(function (lvl) {
            camera.fade();
            gameTimers.setTimeout(function () {
                nextLevel(lvl);
                camera.unfade();
            }, delay);
        });

        camera.focusOn(level.units[1]);

        hero = null;

        window.requestAnimationFrame(tickMenu);

    }

    camera = new Camera();
    music = new Music();

    menu();

});