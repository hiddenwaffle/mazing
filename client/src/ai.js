const characters = require('./characters');

// in order of preference
const directions = ['up', 'left', 'down', 'right'];

const board = require('./board');

exports.start = function() {
    loop();
};

function loop() {
    // TODO: Maybe something with timing scatter and chase

    //setTimeout(loop, 500);
}

exports.doNothing = {
    handleNewTile() { /* Do nothing. Intended for Pac Man */ }
};

exports.blinky = {
    handleNewTile(entity, oldtilex, oldtiley) {
        runIfIntersection(entity, oldtilex, oldtiley, directions => {
            let dirnum = getRandomIntInclusive(0, directions.length - 1);
            let direction = directions[dirnum];
            if (direction === oppositeOfDirection(characters.blinky.currentDirection)) {
                dirnum++;
                if (dirnum >= directions.length) dirnum = 0;
            }
            entity.requestedDirection = directions[dirnum];
        });
    }
};

function runIfIntersection(entity, oldtilex, oldtiley, ghostSpecificDecision) {
    let directions = determinePossibleDirections(entity, oldtilex, oldtiley);

    if (directions.length === 1) { // either in a corridor or a turn
        entity.requestedDirection = directions[0];

    } else if (directions.length >= 2) {
        ghostSpecificDecision(directions);
    }
}

/**
 * Given where the entity is currently and where it was one tile ago,
 * return the array of directions it is allowed to go in at this intersection.
 * It will either be a total of 1, 2, or 3 directions.
 */
function determinePossibleDirections(entity, oldtilex, oldtiley) {
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

    return directions;
}

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