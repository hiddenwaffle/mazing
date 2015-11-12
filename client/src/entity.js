let Constants = require('./constants');
let Util = require('./util');

class Entity {

    constructor(x, y, requestedDirection, speed, color) {
        this._currentDirection = this._requestedDirection = requestedDirection;
        this._speed = speed;

        this._graphics = new PIXI.Graphics();
        this._graphics.x = x;
        this._graphics.y = y;
        this._graphics.beginFill(color, 1);
        this._graphics.drawRect(0, 0, Constants.wallSize, Constants.wallSize);
        this._graphics.endFill();

        this._lastStep = null;
    }

    /**
     * @param map used by the entity to determine if it can move in the direction it wants to
     */
    fullstep(map) {
        let elapsed;
        if (this._lastStep === null) {
            elapsed = 1;
        } else {
            elapsed = Date.now() - this._lastStep;
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

    get graphics() {
        return this._graphics;
    }

    set requestedDirection(newDirection) {
        this._requestedDirection = newDirection;
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

            let changeDirectionResult = map.tryMove(this._graphics.x, this._graphics.y, switchx, switchy, this._graphics.width, this._graphics.height);
            if (changeDirectionResult.success) {
                this._currentDirection = this._requestedDirection;
            } else {
                // wasn't able to change to this direction immediately
            }
        }
    }
}

module.exports = Entity;