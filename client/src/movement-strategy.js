'use strict';

const
    Util = require('./util');

/**
 * All movement methods should have the same signature so that execute() can call them.
 */
class MovementStrategy {

    /**
     * @param board
     * @param methodName
     * @param frightMethodName
     * @param scatterx (optional)
     * @param scattery (optional)
     * @param pacman (optional)
     * @param blinky (optional)
     */
    constructor(board, methodName, frightMethodName, scatterx= null, scattery=null, pacman=null, blinky=null) {
        this._board = board;
        this._method = this[methodName];
        this._frightMethod = this[frightMethodName];
        this._scatterx = scatterx;
        this._scattery = scattery;
        this._pacman = pacman;
        this._blinky = blinky;
    }

    execute(entity) {
        if (entity.frightened) {
            this._frightMethod(entity);

        } else {
            if (entity.mode === 'chase') {
                this._method(entity);

            } else if (entity.mode === 'scatter') {
                this.scatter(entity);

            }
        }
    }

    // Movement methods begin here

    doNothing(entity) {
        // Do nothing.
    }

    random(entity) {
        runIfNewIntersection(entity, this._board, (directions) => {
            let index = Util.getRandomIntInclusive(0, directions.length - 1);
            entity.requestedDirection = directions[index];
        });
    }

    scatter(entity) {
        runIfNewIntersection(entity, this._board, (directions) => {
            aimTowardsTargetTile(entity, this._scatterx, this._scattery, directions);
        });
    }

    /**
     * Blinky is the red ghost and follows Pac-Man directly.
     */
    blinky(entity) {
        runIfNewIntersection(entity, this._board, (directions) => {
            let targetx = Util.convertToTileSpace(this._pacman.x);
            let targety = Util.convertToTileSpace(this._pacman.y);
            aimTowardsTargetTile(entity, targetx, targety, directions);
        });
    }

    /**
     * Pinky is the pink ghost and attempts to cut Pac-Man off.
     */
    pinky(entity) {
        runIfNewIntersection(entity, this._board, directions => {
            let targetx = Util.convertToTileSpace(this._pacman.x);
            let targety = Util.convertToTileSpace(this._pacman.y);

            switch (this._pacman.currentDirection) {
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

            aimTowardsTargetTile(entity, targetx, targety, directions);
        });
    }

    /**
     * Inky is the blue ghost and attempts to ambush Pac-Man by approaching from the opposite line of Blinky.
     */
    inky(entity) {
        runIfNewIntersection(entity, this._board, directions => {
            let firstx = Util.convertToTileSpace(this._pacman.x);
            let firsty = Util.convertToTileSpace(this._pacman.y);

            switch (this._pacman.currentDirection) {
                case 'up':
                    firsty -= 2;
                    break;
                case 'down':
                    firsty += 2;
                    break;
                case 'left':
                    firstx -= 2;
                    break;
                case 'right':
                    firstx += 2;
                    break;
            }

            let secondx = Util.convertToTileSpace(this._blinky.x);
            let secondy = Util.convertToTileSpace(this._blinky.y);

            let diffx = firstx - secondx;
            let diffy = firsty - secondy;

            let targetx = firstx + diffx;
            let targety = firsty + diffy;

            aimTowardsTargetTile(entity, targetx, targety, directions); // lower right
        });
    }

    /**
     * Clyde is the orange ghost and tends to stay away from Pac-Man.
     */
    clyde(entity) {
        runIfNewIntersection(entity, this._board, directions => {
            let pacmanx = Util.convertToTileSpace(this._pacman.x);
            let pacmany = Util.convertToTileSpace(this._pacman.y);
            let tilex = Util.convertToTileSpace(entity.x);
            let tiley = Util.convertToTileSpace(entity.y);

            let distanceSquared = Util.qs(
                pacmanx - tilex,
                pacmany - tiley
            );

            if (distanceSquared >= 64) {
                aimTowardsTargetTile(entity, pacmanx, pacmany, directions);
            } else {
                aimTowardsTargetTile(entity, 1, 30, directions); // same as scatter tile
            }
        });
    }
}

module.exports = MovementStrategy;

/**
 * Run the given function IF the entity has arrived at an intersection.
 * Otherwise it will proceed along its path if there is only one direction to move.
 * Run AI once per intersection; do this by tracking the last tile.
 */
function runIfNewIntersection(entity, board, cb) {
    let currenttilex = Util.convertToTileSpace(entity.x);
    let currenttiley = Util.convertToTileSpace(entity.y);

    if (currenttilex !== entity.lastTileAIx ||
        currenttiley !== entity.lastTileAIy) {

        entity.lastTileAIx = currenttilex;
        entity.lastTileAIy = currenttiley;

        let directions = determinePossibleDirections(currenttilex, currenttiley, entity.currentDirection, board);

        if (directions.length === 1) { // either in a cooridor or a turn
            entity.requestedDirection = directions[0];

        } else if (directions.length >= 2) {
            cb(directions);
        }
    }
}

function aimTowardsTargetTile(entity, targetx, targety, directions) {
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

        let tilex = Util.convertToTileSpace(entity.x);
        let tiley = Util.convertToTileSpace(entity.y);

        let distance = Util.qs(
            tilex + dx - targetx,
            tiley + dy - targety
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
 * Given where the entity is currently and where it was one tile ago,
 * return the array of directions it is allowed to go in at this intersection.
 * It will either be a total of 1, 2, or 3 directions.
 */
function determinePossibleDirections(tilex, tiley, currentDirection, board) {
    let directions = [];

    if (currentDirection !== 'up' && board.isWallOpen(tilex, tiley+1)) {
        directions.push('down');
    }

    if (currentDirection !== 'down' && board.isWallOpen(tilex, tiley-1)) {
        directions.push('up');
    }

    if (currentDirection !== 'left' && board.isWallOpen(tilex+1, tiley)) {
        directions.push('right');
    }

    if (currentDirection !== 'right' && board.isWallOpen(tilex-1, tiley)) {
        directions.push('left');
    }

    return directions;
}