'use strict';

let Constants = require('./constants');
let Util = require('./util');

class Entity {

    constructor(x, y, requestedDirection, color, chaseAi, scatterAi) {
        this._currentDirection = this._requestedDirection = requestedDirection;

        this._speed = 0;

        this._graphics = new PIXI.Graphics();
        this._graphics.x = x;
        this._graphics.y = y;
        this._graphics.beginFill(color, 1);
        this._graphics.drawRect(0, 0, Constants.wallSize, Constants.wallSize);
        this._graphics.endFill();

        this._lastStep = 0;

        this._mode = 'scatter';
        this._chaseAi = chaseAi;
        this._scatterAi = scatterAi;

        this._reverseNeeded = false;

        // Initialize _tilex and _tiley for good measure
        this._updateTileCoordinates();
    }

    /**
     * @param map used by the entity to determine if it can move in the direction it wants to
     */
    fullstep(map) {
        let elapsed;
        if (this._lastStep === 0) {
            elapsed = 1;
        } else {
            elapsed = Date.now() - this._lastStep;
            if (elapsed > 1000) {
                elapsed = 1000; // enforce speed limit
            }
        }
        this._lastStep = Date.now();

        for (let t = 0; t < elapsed; t++) {
            this._step(map);
        }
    }
    overlaps(graphics) {
        let ax1 = this._graphics.x;
        let ay1 = this._graphics.y;
        let ax2 = this._graphics.x + this._graphics.width;
        let ay2 = this._graphics.y + this._graphics.height;

        let bx1 = graphics.x;
        let by1 = graphics.y;
        let bx2 = graphics.x + graphics.width;
        let by2 = graphics.y + graphics.height;

        return (ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1);
    }

    set mode(newMode) {
        this._mode = newMode;
    }

    get graphics() {
        return this._graphics;
    }

    get tilex() {
        return this._tilex;
    }

    get tiley() {
        return this._tiley;
    }

    get currentDirection() {
        return this._currentDirection;
    }

    set requestedDirection(newDirection) {
        this._requestedDirection = newDirection;
    }

    set reverseNeeded(value) {
        this._reverseNeeded = value;
    }

    set speed(value) {
        this._speed = value;
    }

    _step(map) {
        let tilex = Util.convertToTileSpace(this.graphics.x);
        let tiley = Util.convertToTileSpace(this.graphics.y);

        let newx = this._graphics.x;
        let newy = this._graphics.y;

        switch (this._currentDirection) {
            case 'up':
                newy -= this._speed;
                break;
            case 'down':
                newy += this._speed;
                break;
            case 'left':
                newx -= this._speed;
                break;
            case 'right':
                newx += this._speed;
                break;
            default:
                break;
        }

        let tryMoveResult = map.tryMove(
            this._graphics.x,
            this._graphics.y,
            newx,
            newy,
            this._graphics.width,
            this._graphics.height
        );
        // NOTE: success value is unused in this section
        this._graphics.x = tryMoveResult.finalx;
        this._graphics.y = tryMoveResult.finaly;

        // Prevent shaking when Pac-Man hits a wall
        if (tryMoveResult.doStop) {
            this._graphics.x = Math.floor(this._graphics.x);
            this._graphics.y = Math.floor(this._graphics.y);
            this._requestedDirection = '';
        }

        if (this._requestedDirection !== this._currentDirection) {
            let switchx = this._graphics.x;
            let switchy = this._graphics.y;
            let halfstep = Math.floor(Constants.wallSize / 2);

            switch (this._requestedDirection) {
                case 'up':
                    switchy -= halfstep;
                    break;
                case 'down':
                    switchy += halfstep;
                    break;
                case 'left':
                    switchx -= halfstep;
                    break;
                case 'right':
                    switchx += halfstep;
                    break;
                default:
                    break;
            }

            let changeDirectionResult = map.tryMove(
                this._graphics.x,
                this._graphics.y,
                switchx,
                switchy,
                this._graphics.width,
                this._graphics.height
            );
            if (changeDirectionResult.success) {
                this._currentDirection = this._requestedDirection;
            } else {
                // wasn't able to change to this direction immediately
            }
        }

        this._handleIfMovedToNewTile();
    }

    /**
     * First determine if we are on a new tile. If so, see if there is a
     * pending reversal, and handle it. Otherwise, ask the AI routine what to do.
     */
    _handleIfMovedToNewTile() {
        let oldtilex = this._tilex;
        let oldtiley = this._tiley;
        this._updateTileCoordinates();

        if (oldtilex !== this._tilex || oldtiley !== this._tiley) {
            if (this._reverseNeeded) { // go in the direction of the old tile
                this.reverseNeeded = false;

                if (oldtilex > this._tilex) {
                    this._requestedDirection = 'right';

                } else if (oldtilex < this._tilex) {
                    this._requestedDirection = 'left';

                } else if (oldtiley > this._tiley) {
                    this._requestedDirection = 'down';

                } else if (oldtiley < this._tiley) {
                    this._requestedDirection = 'up';
                }

            } else {
                this._runAi(oldtilex, oldtiley);  // use AI to decide which way
            }
        }
    }

    _updateTileCoordinates() {
        this._tilex = Util.convertToTileSpace(this._graphics.x);
        this._tiley = Util.convertToTileSpace(this._graphics.y);
    }

    _runAi(oldtilex, oldtiley) {
        switch (this._mode) {
            case 'chase':
                this._chaseAi.handleNewTile(this, oldtilex, oldtiley);
                break;
            case 'scatter':
                this._scatterAi.handleNewTile(this, oldtilex, oldtiley);
                break;
        }
    }
}

module.exports = Entity;