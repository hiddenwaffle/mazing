const characters = require('./characters');
const board = require('./board');

exports.doNothing = {
    handleNewTile() { /* Do nothing. Intended for Pac Man */ }
};

/**
 * Blinky is the red ghost and follows Pac-Man directly.
 */
exports.blinky = {
    handleNewTile(entity, oldtilex, oldtiley) {
        runIfIntersection(entity, oldtilex, oldtiley, directions => {
            aimTowardsTargetTile(entity, oldtilex, oldtiley, characters.pacman.tilex, characters.pacman.tiley, directions);
        });
    }
};

exports.blinkyScatter = {
    handleNewTile(entity, oldtilex, oldtiley) {
        runIfIntersection(entity, oldtilex, oldtiley, directions => {
            aimTowardsTargetTile(entity, oldtilex, oldtiley, 27, 1, directions); // upper right
        });
    }
};

/**
 * Pinky is the pink ghost and attempts to cut Pac-Man off.
 */
exports.pinky = {
    handleNewTile(entity, oldtilex, oldtiley) {
        runIfIntersection(entity, oldtilex, oldtiley, directions => {
            let pacman = characters.pacman;

            let targetx = pacman.tilex;
            let targety = pacman.tiley;

            switch (pacman.currentDirection) {
                case 'up':
                    targety -= 4;
                    break;
                case 'down':
                    targety += 4;
                    break;
                case 'left':
                    targetx -= 4;
                    break;
                case 'right':
                    targetx += 4;
                    break;
            }

            aimTowardsTargetTile(entity, oldtilex, oldtiley, targetx, targety, directions);
        });
    }
};

exports.pinkyScatter = {
    handleNewTile(entity, oldtilex, oldtiley) {
        runIfIntersection(entity, oldtilex, oldtiley, directions => {
            aimTowardsTargetTile(entity, oldtilex, oldtiley, 1, 1, directions); // upper left
        });
    }
};

function aimTowardsTargetTile(entity, oldtilex, oldtiley, targetx, targety, directions) {
    // Determine how far each open adjacent tile is from Pac-Man
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

    // Sort the distances so that the shortest is first
    distances.sort((a, b) => {
        return a.distance - b.distance;
    });

    // Use the direction from the shortest distance
    entity.requestedDirection = distances[0].direction;
}

/**
 * Run the given function IF the entity has arrived at an intersection.
 * Otherwise it will proceed along its path if there is only one direction to move.
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