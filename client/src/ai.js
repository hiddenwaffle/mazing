const characters = require('./characters');

const directions = ['up', 'down', 'left', 'right'];

exports.start = function() {
    loop();
};

function loop() {
    setTimeout(loop, 500);

    let dirnum = getRandomIntInclusive(0, directions.length - 1);
    characters.blinky.requestedDirection = directions[dirnum];
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}