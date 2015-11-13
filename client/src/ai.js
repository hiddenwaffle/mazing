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

            // Chase mode -> where is Pac-Mac right now
            let targetx = characters.pacman.tilex;
            let targety = characters.pacman.tiley;

            let distances = directions.map((direction) => {
                let dx = 0;
                let dy = 0;

                switch (direction) {
                    case 'up':
                        dy = -1;
                        break;
                    case 'down':
                        dy = 1;
                        break;
                    case 'left':
                        dx = -1;
                        break;
                    case 'right':
                        dx = 1;
                        break;
                }

                let distance = qs(
                    entity.tilex + dx - targetx,
                    entity.tiley + dy - targety
                );
                return { direction: direction, distance: distance };
            });

            distances.sort((a, b) => {
                return a.distance - b.distance;
            });

            entity.requestedDirection = distances[0].direction;
        });
    }
};

/**
 * Run the given function IF the entity has arrived at an intersection
 */
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
function determinePossibleDirections(entity) {
    let directions = [];

    if (entity.currentDirection !== 'up' &&
        board.walls[entity.tiley+1][entity.tilex] === 0) {
        directions.push('down');
    }

    if (entity.currentDirection !== 'down' &&
        board.walls[entity.tiley-1][entity.tilex] === 0) {
        directions.push('up');
    }

    if (entity.currentDirection !== 'left' &&
        board.walls[entity.tiley][entity.tilex+1] === 0) {
        directions.push('right');
    }

    if (entity.currentDirection !== 'right' &&
        board.walls[entity.tiley][entity.tilex-1] === 0) {
        directions.push('left');
    }

    console.log(directions + ' - ' + entity.currentDirection);

    return directions;
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

/**
 * Does a quick square of two numbers and returns the sum of the results
 */
function qs(a, b) {
    return (a * a) + (b * b);
}