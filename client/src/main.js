'use strict';

require('./input').start();
require('./ai').start();

let map = require('./map');

let renderer = PIXI.autoDetectRenderer(800, 600, {backgroundColor: 0x333333});
document.body.appendChild(renderer.view);

let stage = new PIXI.Container();
stage.addChild(map.graphics);

animate();
function animate() {
    requestAnimationFrame(animate);
    renderer.render(stage);
}

loop();
function loop() {
    setTimeout(loop, 16.66);
    map.step();
}