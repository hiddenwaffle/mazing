let Constants = require('./constants');
let map = require('./map');

function Entity (x, y, requestedDirection, speed, color) {
    this.currentDirection = this.requestedDirection = requestedDirection;
    this.speed = speed;

    this.width = Constants.wallSize; // TODO: might remove these and use graphcis instead
    this.height = Constants.wallSize;

    this.graphics = new PIXI.Graphics();
    this.graphics.x = x;
    this.graphics.y = y;
    this.graphics.beginFill(color, 1);
    this.graphics.drawRect(0, 0, this.width, this.height);
    this.graphics.endFill();

    this.lastStep = Date.now();
}

Entity.prototype.getTilePosition = function() {
    return {
        x: map.convertToTileSpace(pacman.graphics.x),
        y: map.convertToTileSpace(pacman.graphics.y)
    };
};

Entity.prototype.fullstep = function() {
    let elapsed = Date.now() - this.lastStep;
    this.lastStep = Date.now();

    for (let t = 0; t < elapsed; t++) {
        step.call(this);
    }
};

function step() {
    let tilex = map.convertToTileSpace(this.graphics.x);
    let tiley = map.convertToTileSpace(this.graphics.y);
    if (tilex !== this.tilex || tiley !== this.tiley) {
        this.tilex = tilex;
        this.tiley = tiley;
    }

    let newx = this.graphics.x;
    let newy = this.graphics.y;

    switch (this.currentDirection) {
        case 'up':
            newy -= this.speed;
            break;
        case 'down':
            newy += this.speed;
            break;
        case 'left':
            newx -= this.speed;
            break;
        case 'right':
            newx += this.speed;
            break;
        default:
            break;
    }

    let tryMoveResult = map.tryMove(this.graphics.x, this.graphics.y, newx, newy, this.width, this.height);
    // NOTE: success value is unused in this section
    this.graphics.x = tryMoveResult.finalx;
    this.graphics.y = tryMoveResult.finaly;

    // Prevent shaking when Pac-Man hits a wall
    if (tryMoveResult.doStop) {
        this.graphics.x = Math.floor(this.graphics.x);
        this.graphics.y = Math.floor(this.graphics.y);
        this.requestedDirection = '';
    }

    if (this.requestedDirection !== this.currentDirection) {
        let switchx = this.graphics.x;
        let switchy = this.graphics.y;
        let halfstep = Math.floor(Constants.wallSize / 2);

        switch (this.requestedDirection) {
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

        let changeDirectionResult = map.tryMove(this.graphics.x, this.graphics.y, switchx, switchy, this.width, this.height);
        if (changeDirectionResult.success) {
            this.currentDirection = this.requestedDirection;
        } else {
            // wasn't able to change to this direction immediately
        }
    }
}

/**
 * Based on algorithm and visualization from:
 *
 *      http://stackoverflow.com/a/306332
 *      http://silentmatt.com/rectangle-intersection/
 */
Entity.prototype.overlaps = function(graphics) {
    let ax1 = this.graphics.x;
    let ay1 = this.graphics.y;
    let ax2 = this.graphics.x + this.graphics.width;
    let ay2 = this.graphics.y + this.graphics.height;

    let bx1 = graphics.x;
    let by1 = graphics.y;
    let bx2 = graphics.x + graphics.width;
    let by2 = graphics.y + graphics.height;

    return (ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1);
};

module.exports = Entity;