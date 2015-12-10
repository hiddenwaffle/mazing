'use strict';

const
    config = require('./config');

class Entity {

    constructor(name, board, x, y, animation, movementStrategy, turnAcceleration) {
        this._name = name;
        this._board = board;
        this._animation = animation;

        this._turnAcceleration = turnAcceleration;
        this._turnAccelerationTimeLeft = 0;

        // Set using setter to delegate to the animation
        this.x = x;
        this.y = y;
        this.width = config.wallSize;   // TODO: have an offset for this hit box TODO: Maybe not? Seems like it works ok
        this.height = config.wallSize;

        this._normalSpeed = 0.0;
        this._frightSpeed = 0.0;
        this._frightened = false;
        this._mode = '';

        this._movementStrategy = movementStrategy;
        this._reverseNeeded = false;

        // Helps the AI know which tile the entity just came from.
        this.lastTileAIx = -1;
        this.lastTileAIy = -1;

        // Should it be counted in collision detection
        this.solid = true;

        // When Pac-Man hits a wall, save the direction he was going (used by respawn algorithm).
        this._requestedDirectionAtStop = '';
    }

    start(normalSpeed, frightSpeed, mode, requestedDirection, frightTime, frightFlashes) {
        this._normalSpeed = config.topSpeed * normalSpeed;
        this._frightSpeed = config.topSpeed * frightSpeed;
        this._mode = mode;

        this._requestedDirection = requestedDirection;
        this._switchCurrentDirection(requestedDirection);

        this._animation.start(frightTime, frightFlashes);
    }

    step(elapsed) {
        this._animation.step(elapsed);

        if (this._reverseNeeded) {
            this._reverseNeeded = false;

            let newDirection = oppositeOfDirection(this._currentDirection);
            this._requestedDirection = newDirection;
            this._switchCurrentDirection(newDirection);

            this.lastTileAIx = -1;
            this.lastTileAIy = -1;
        }

        let speed;
        if (this._frightened) {
            speed = this._frightSpeed;
        } else {
            speed = this._normalSpeed;
        }

        if (this._turnAccelerationTimeLeft > 0) {
            this._turnAccelerationTimeLeft -= elapsed;
            speed = speed * config.pacmanTurnSpeedIncrease;
        }

        for (let v = 0; v < elapsed; v++) {
            this._milliStep(speed);
        }
    }

    signalFrightened() {
        this._frightened = true;
        this._animation.startFrightened();
    }

    removeFrightIfAny() {
        this._frightened = false;
        this._animation.stopFrightened();
    }

    /**
     * Called by respawn algorithm to ensure that Pac-Man is always moving
     */
    ensureRequestedDirectionActive() {
        if (this._requestedDirection === '' || this._requestedDirection === null || this._requestedDirection === undefined) {
            this._requestedDirection = this._requestedDirectionAtStop;
        }
    }

    set visible(value) {
        this._animation.visible = value;
    }

    get mode() {
        return this._mode;
    }

    set mode(value) {
        this._mode = value;
    }

    get frightened() {
        return this._frightened;
    }

    get x() {
        return this._animation.x;
    }

    set x(value) {
        this._animation.x = value;
    }

    get y() {
        return this._animation.y;
    }

    set y(value) {
        this._animation.y = value;
    }

    get currentDirection() {
        return this._currentDirection;
    }

    set requestedDirection(value) {
        this._requestedDirection = value;
    }

    set reverseNeeded(value) {
        this._reverseNeeded = value;
    }

    get name() {
        return this._name;
    }

    set alpha(value) {
        this._animation.alpha = value;
    }

    _milliStep(speed) {
        this._moveInCurrentDirection(speed);
        this._runAI();
        this._attemptTurnIfRequested();
    }

    _moveInCurrentDirection(speed) {
        let newx = this.x;
        let newy = this.y;

        switch (this._currentDirection) {
            case 'up':
                newy -= speed;
                break;
            case 'down':
                newy += speed;
                break;
            case 'left':
                newx -= speed;
                break;
            case 'right':
                newx += speed;
                break;
            default:
                break;
        }

        let tryMoveResult = this._board.tryMove(
            this.x,
            this.y,
            newx,
            newy,
            this.width,
            this.height
        );
        this.x = tryMoveResult.finalx;
        this.y = tryMoveResult.finaly;

        // Prevent shaking when Pac-Man hits a wall.
        // This doesn't work well with ghosts, but they shouldn't hit it.
        if (tryMoveResult.doStop) {
            this.x = Math.floor(this.x);
            this.y = Math.floor(this.y);
            this._requestedDirectionAtStop = this._requestedDirection;
            this._requestedDirection = '';
        }
    }

    _runAI() {
        this._movementStrategy.execute(this);
    }

    _attemptTurnIfRequested() {
        if (this._requestedDirection !== this._currentDirection) {
            let switchx = this.x;
            let switchy = this.y;
            let halfstep = config.wallSize / 2;

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

            let changeDirectionResult = this._board.tryMove(
                this.x,
                this.y,
                switchx,
                switchy,
                this.width,
                this.height
            );
            if (changeDirectionResult.success) {
                this._switchCurrentDirection(this._requestedDirection);
            } else {
                // wasn't able to change to this direction immediately
            }
        }
    }

    _switchCurrentDirection(direction) {

        let previousDirection = this._currentDirection;
        if (this._turnAcceleration && isTurn(previousDirection, direction)) {
            this._turnAccelerationTimeLeft = config.pacmanTurnSpeedLength;
        }

        this._animation.changeDirection(direction);
        this._currentDirection = direction;
    }
}

module.exports = Entity;

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

    // TODO: Does this need a default return case?
}

/**
 * Returns true if going from d1 to d2 is not a reversal of direction.
 */
function isTurn(d1, d2) {
    return d2 !== oppositeOfDirection(d1);
}
