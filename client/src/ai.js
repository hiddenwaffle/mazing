const characters = require('./characters');

const directions = ['up', 'down', 'left', 'right'];
const board = require('./board');

exports.start = function() {
    loop();
};

function loop() {
    // TODO: Maybe something with timing scatter and chase

    //setTimeout(loop, 500);
}

exports.doNothing = {
    handleNewTile() {
        // Do nothing. Intended for Pac Man
    }
};

exports.blinky = {
    handleNewTile(entity, oldtilex, oldtiley) {
        let directions = [];

        if (board.walls[entity.tiley - 1][entity.tilex] === 0 &&
            entity.tilex    !== oldtilex &&
            entity.tiley-1  !== oldtiley) {
            directions.push('up');
        }

        if (board.walls[entity.tiley+1][entity.tilex] === 0 &&
            entity.tilex    !== oldtilex &&
            entity.tiley+1  !== oldtiley) {
            directions.push('down');
        }

        if (board.walls[entity.tiley][entity.tilex-1] === 0 &&
            entity.tilex-1  !== oldtilex &&
            entity.tiley    !== oldtiley) {
            directions.push('left');
        }

        if (board.walls[entity.tiley][entity.tilex+1] === 0 &&
            entity.tilex+1  !== oldtilex &&
            entity.tiley    !== oldtiley) {
            directions.push('right');
        }

        if (directions.length >= 2) { // at an intersection
            let dirnum = getRandomIntInclusive(0, directions.length - 1);
            let direction = directions[dirnum];
            if (direction === oppositeOfDirection(characters.blinky.currentDirection)) {
                dirnum++;
                if (dirnum >= directions.length) dirnum = 0;
            }
            entity.requestedDirection = directions[dirnum];

        } else if (directions.length === 1) { // either in a corridor or a turn
            entity.requestedDirection = directions[0];

        } else {
            // shouldn't get here...
        }
    }
};

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function oppositeOfDirection(direction) {
    switch (direction) {
        case 'up':
            return 'down';
        case 'down':
            return 'up';
        case 'left':
            return 'right';
        case 'right':
            return 'left';
    }
}