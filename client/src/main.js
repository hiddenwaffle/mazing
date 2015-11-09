'use strict';

require('./input');
let Constants = require('./constants');

let renderer = PIXI.autoDetectRenderer(800, 600, {backgroundColor: 0x333333});
document.body.appendChild(renderer.view);

let field = new PIXI.Container();
field.x = 32;
field.y = 32;

let walls = new PIXI.Container();
for (let y = 0; y < Constants.walls.length; y++) {
    let scanline = Constants.walls[y];
    for (let x = 0; x < scanline.length; x++) {
        let wall = Constants.walls[y][x];
        if (wall === 1) {
            let wallImg = new PIXI.Graphics();
            wallImg.beginFill(0x0077ff);
            wallImg.drawRect(x * Constants.wallSize, y * Constants.wallSize, Constants.wallSize, Constants.wallSize);
            wallImg.endFill();
            walls.addChild(wallImg);
        }
    }
}
field.addChild(walls);

let dots = new PIXI.Container();
for (let y = 0; y < Constants.edibles.length; y++) {
    let scanline = Constants.edibles[y];
    for (let x = 0; x < scanline.length; x++) {
        let edible = Constants.edibles[y][x];
        switch (edible) {
            case 1:
                let dotImg = new PIXI.Graphics();
                dotImg.beginFill(0xeeeeee);
                dotImg.drawRect(0, 0, Constants.dotSize, Constants.dotSize);
                dotImg.endFill();
                dotImg.x = x * Constants.wallSize + Math.floor(Constants.wallSize / 2) - (Constants.dotSize / 2);
                dotImg.y = y * Constants.wallSize + Math.floor(Constants.wallSize / 2) - (Constants.dotSize / 2);
                dots.addChild(dotImg);
                break;
            default:
                break;
        }
    }
}
field.addChild(dots);

let pacman = require('./pacman');
field.addChild(pacman.graphics);

let stage = new PIXI.Container();
stage.addChild(field);

animate();
function animate() {
    requestAnimationFrame(animate);
    renderer.render(stage);
}

pacmanStep();
function pacmanStep() {
    setTimeout(pacmanStep, 16.66);

    // https://www.reddit.com/r/todayilearned/comments/2oschi/til_every_time_pacman_eats_a_regular_dot_he_stops/
    if (collisionChecks()) {
        // TODO: Check for board clear
    } else {
        pacman.fullstep();
    }

}

function collisionChecks() {
    let collision = false;

    for (let idx = dots.children.length - 1; idx >= 0; idx--) {
        let dotImg = dots.getChildAt(idx);
        if (pacman.overlaps(dotImg)) {
            dots.removeChildAt(idx);
            collision = true;
        }
    }

    return collision;
}