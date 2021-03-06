'use strict';

require('./safari-audio-bandaid').check();

require('./preload').start(() => {
    const Game = require('./game');

    let stage = new PIXI.Container();
    let renderer = PIXI.autoDetectRenderer(800, 600, { backgroundColor: 0x333333 });

    let game = new Game(stage, renderer);
    game.start();

    loop();
    function loop() {
        setTimeout(loop, 16.66);
        game.step();
    }

    animate();
    function animate() {
        requestAnimationFrame(animate);
        game.draw();
    }
});