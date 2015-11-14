'use strict';

require('./input').start();
const gameState = require('./gamestate');
const map = require('./map');

const renderer = PIXI.autoDetectRenderer(800, 600, {backgroundColor: 0x333333});
document.body.appendChild(renderer.view);

const stage = new PIXI.Container();
stage.addChild(map.graphics);

animate();
function animate() {
    requestAnimationFrame(animate);
    renderer.render(stage);
}

gameState.startLevel(0);
loop();
function loop() {
    setTimeout(loop, 16.66);

    gameState.step();
    map.step();
}