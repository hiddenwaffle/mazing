'use strict';

const
    config  = require('./config'),
    Util    = require('./util');

class Board {

    constructor(stage, mazeNumber) {
        this._gfx = new PIXI.Container();

        // Configure this board by using maze data.
        let color           = config.mazes[mazeNumber].color;
        this._grid          = config.mazes[mazeNumber].grid;
        this._respawnPoints = config.mazes[mazeNumber].respawnPoints;

        this._wallImgs = new PIXI.Container();
        for (let y = 0; y < this._grid.length; y++) {
            let line = this._grid[y];
            for (let x = 0; x < line.length; x++) {
                let wall = this._grid[y][x];

                if (wall === 1) {
                    let wallImg = new PIXI.Graphics();
                    wallImg.beginFill(color);
                    wallImg.drawRect(
                        x * config.wallSize,
                        y * config.wallSize,
                        config.wallSize,
                        config.wallSize
                    );
                    wallImg.endFill();
                    this._wallImgs.addChild(wallImg);

                } else if (wall === 2) {
                    let gateImg = new PIXI.Graphics();
                    gateImg.beginFill(0xffaaff);
                    gateImg.drawRect(
                        x * config.wallSize,
                        y * config.wallSize + (config.wallSize / 2),
                        config.wallSize,
                        config.dotSize
                    );
                    gateImg.endFill();
                    this._wallImgs.addChild(gateImg);
                }
            }
        }
        this._gfx.addChild(this._wallImgs);

        let energizerFrames = [];
        for (let idx = 1; idx <= 5; idx++) {
            let filename = 'energizer' + idx + '.png';
            energizerFrames.push({ texture: PIXI.Texture.fromFrame(filename), time: 50 });
        }
        for (let idx = 4; idx >= 2; idx--) {
            let filename = 'energizer' + idx + '.png';
            energizerFrames.push({ texture: PIXI.Texture.fromFrame(filename), time: 50 });
        }

        this._dotImgs = new PIXI.Container();
        this._energizerClips = new PIXI.Container();
        for (let y = 0; y < this._grid.length; y++) {
            let line = this._grid[y];
            for (let x = 0; x < line.length; x++) {
                let dot = this._grid[y][x];
                switch (dot) {
                    case 3:
                        let dotImg = new PIXI.Graphics();
                        dotImg.beginFill(0xeeeeee);
                        dotImg.drawRect(
                            0, 0,
                            config.dotSize, config.dotSize
                        );
                        {
                            let offset = (config.wallSize / 2) - (config.dotSize / 2);
                            dotImg.x = x * config.wallSize + offset;
                            dotImg.y = y * config.wallSize + offset;
                            this._dotImgs.addChild(dotImg);
                        }
                        break;

                    case 4:
                        let energizerClip = new PIXI.extras.MovieClip(energizerFrames);
                        let offset = 1;
                        energizerClip.x = x * config.wallSize + offset;
                        energizerClip.y = y * config.wallSize + offset;
                        energizerClip.play();
                        this._energizerClips.addChild(energizerClip);
                        break;

                    default:
                        break;
                }
            }
        }
        this._gfx.addChild(this._dotImgs);
        this._gfx.addChild(this._energizerClips);

        stage.addChild(this._gfx);
    }

    tryMove(srcx, srcy, destx, desty, width, height) {
        let success = false; // whether or not destx and desty and within a wall
        let finalx = srcx;
        let finaly = srcy;
        let doStop = false;

        let destx2 = destx + width - 1;     // TODO: is -1 the right route?
        let desty2 = desty + height - 1;

        let desttilex   = Util.convertToTileSpace(destx);
        let desttilex2  = Util.convertToTileSpace(destx2);
        let desttiley   = Util.convertToTileSpace(desty);
        let desttiley2  = Util.convertToTileSpace(desty2);

        let topLeftFree = this.isWallOpen(desttilex, desttiley);
        let topRightFree = this.isWallOpen(desttilex2, desttiley);
        let bottomLeftFree = this.isWallOpen(desttilex, desttiley2);
        let bottomRightFree = this.isWallOpen(desttilex2, desttiley2);

        // Assumption: Moving either horizontally or vertically, but not both.

        if (topLeftFree && topRightFree && bottomLeftFree && bottomRightFree) {
            success = true;
            finalx = destx;
            finaly = desty;

        } else {
            if (destx != srcx) { // horizontal
                finaly = desty;

                if (destx < srcx) {
                    // movement is to the left

                    if (desttilex === -1) {
                        finalx = (config.wallSize * 27) - 1; // handle wraparound
                    } else {
                        finalx = desttilex2 * config.wallSize; // get right edge of boundary of the blocking tile
                        doStop = true;
                    }

                } else {
                    // movement is to the right

                    if (desttilex2 === 28) {
                        finalx = 1; // handle wraparound
                    } else {
                        finalx = desttilex * config.wallSize; // get left edge of boundary of the blocking tile
                        doStop = true;
                    }
                }

            } else if (desty != srcy) { // vertical
                finalx = destx;

                if (desty < srcy) {
                    // movement is upwards
                    // get bottom edge of boundary of the blocking tile
                    finaly = desttiley2 * config.wallSize;
                    doStop = true;

                } else {
                    // movement is downwards
                    // get top edge of boundary of the blocking tile
                    finaly = desttiley * config.wallSize;
                    doStop = true;
                }
            }
        }

        return {
            success: success,
            finalx: finalx,
            finaly: finaly,
            doStop: doStop
        };
    };

    isWallOpen(x, y) {
        let row = this._grid[y];
        if (row !== undefined) {
            let wall = row[x];
            if (wall !== undefined) {
                return wall !== 1 && wall !== 2;
            }
        }

        return false;
    }

    handleDotCollision(x, y, width, height) {
        return this._handleCollision(x, y, width, height, this._dotImgs);
    }

    handleEnergizerCollision(x, y, width, height) {
        return this._handleCollision(x, y, width, height, this._energizerClips);
    }

    dotsLeft() {
        return (this._dotImgs.children.length > 0) || (this._energizerClips.children.length > 0)
    }

    get respawnPoints() {
        return this._respawnPoints;
    }

    _handleCollision(x, y, width, height, imgs) {
        let collision = false;

        for (let idx = imgs.children.length - 1; idx >= 0; idx--) {
            let img = imgs.getChildAt(idx);
            if (Util.overlap(
                    x, y, x + width, y + height,
                    img.x, img.y, img.x + img.width, img.y + img.height)) {
                imgs.removeChildAt(idx);
                collision = true;
            }
        }

        return collision;
    }
}

module.exports = Board;
