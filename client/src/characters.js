'use strict';

const
    Entity              = require('./entity'),
    Animation           = require('./animation'),
    MovementStrategy    = require('./movement-strategy'),
    config              = require('./config'),
    Util                = require('./util');

class Characters {

    constructor(board, parentGfx, longTasks) {
        this._board = board;
        this._longTasks = longTasks;

        let gfx = new PIXI.Container();
        parentGfx.addChild(gfx);

        this._pacman = new Entity(
            'pacman',
            board,
            config.startpacmanx,
            config.startpacmany,
            new Animation(gfx, 0xffff00, 0xffff00),
            new MovementStrategy(board, 'doNothing', 'doNothing')
        );

        this._ghosts = [];

        let randomMovementStrategy = new MovementStrategy(board, 'random');

        this._blinky = new Entity(
            'blinky',
            board,
            config.startghostx + (3 * config.wallSize),
            config.startghosty,
            new Animation(gfx, 0xff0000, 0x5555ff),
            new MovementStrategy(board, 'blinky', 'random', 27, 1, this._pacman),
            randomMovementStrategy
        );
        this._ghosts.push(this._blinky);

        this._pinky = new Entity(
            'pinky',
            board,
            config.startghostx - (3 * config.wallSize),
            config.startghosty,
            new Animation(gfx, 0xffb9ff, 0x5555ff),
            new MovementStrategy(board, 'pinky', 'random', 1, 1, this._pacman),
            randomMovementStrategy
        );
        this._ghosts.push(this._pinky);

        this._inky = new Entity(
            'inky',
            board,
            config.startghostx + config.wallSize,
            config.startghosty,
            new Animation(gfx, 0x00ffff, 0x5555ff),
            new MovementStrategy(board, 'inky', 'random', 27, 30, this._pacman, this._blinky),
            randomMovementStrategy
        );
        this._ghosts.push(this._inky);

        this._clyde = new Entity(
            'clyde',
            board,
            config.startghostx - config.wallSize,
            config.startghosty,
            new Animation(gfx, 0xffb950, 0x5555ff),
            new MovementStrategy(board, 'clyde', 'random', 1, 30, this._pacman),
            randomMovementStrategy
        );
        this._ghosts.push(this._clyde);
    }

    start(lvlSpec) {
        let speedGroup = lvlSpec.speedGroup;
        let mode = lvlSpec.ghostMode[0].mode;

        this._pacman.start(
            speedGroup.pacmanNormal,
            speedGroup.pacmanFright,
            '',
            'left'
        );

        this._blinky.start(
            speedGroup.ghostNormal,
            speedGroup.ghostFright,
            mode,
            randomStartDirection()
        );

        this._pinky.start(
            speedGroup.ghostNormal,
            speedGroup.ghostFright,
            mode,
            randomStartDirection()
        );

        this._inky.start(
            speedGroup.ghostNormal,
            speedGroup.ghostFright,
            mode,
            randomStartDirection()
        );

        this._clyde.start(
            speedGroup.ghostNormal,
            speedGroup.ghostFright,
            mode,
            randomStartDirection()
        );
    }

    checkCollisions() {
        let collision = false;
        let energizer = false;

        if (this._pacman.solid) {
            if (this._board.handleDotCollision(
                    this._pacman.x,
                    this._pacman.y,
                    this._pacman.width,
                    this._pacman.height)) {
                collision = true;
            }

            if (this._board.handleEnergizerCollision(
                    this._pacman.x,
                    this._pacman.y,
                    this._pacman.width,
                    this._pacman.height)) {
                collision = true;
                energizer = true;
            }

            if (this._handleGhostCollision()) {
                collision = true;
            }
        }

        return {
            collision: collision,
            energizer: energizer
        };
    }

    stepPacman(elapsed, playerRequestedDirection) {
        this._pacman.requestedDirection = playerRequestedDirection;
        this._pacman.step(elapsed);
    }

    stepGhosts(elapsed) {
        for (let ghost of this._ghosts) {
            ghost.step(elapsed);
        }
    }

    switchMode(mode) {
        for (let ghost of this._ghosts) {
            ghost.mode = mode;
            ghost.reverseNeeded = true;
        }
    }

    signalFright() {
        this._pacman.signalFrightened();

        for (let ghost of this._ghosts) {
            ghost.signalFrightened();
            ghost._reverseNeeded = true;
        }
    }

    removeRemainingFright() {
        this._pacman.removeFrightIfAny();

        for (let ghost of this._ghosts) {
            ghost.removeFrightIfAny();
        }
    }

    _handleGhostCollision() {
        for (let ghost of this._ghosts) {
            if (ghost.solid === false) {
                continue;
            }

            if (Util.overlap(
                    this._pacman.x,
                    this._pacman.y,
                    this._pacman.x + this._pacman.width,
                    this._pacman.y + this._pacman.height,
                    ghost.x,
                    ghost.y,
                    ghost.x + ghost.width,
                    ghost.y + ghost.height)) {
                if (ghost.frightened) {
                    this._killGhost(ghost);
                    return true;
                } else {
                    this._killPacman();
                    return true;
                }
            }
        }
    }

    _killGhost(ghost) {
        ghost.removeFrightIfAny();
        ghost.solid = false;
        ghost.visible = false;

        this._longTasks.addTimeoutTask(1000, {}, () => {
            ghost.solid = true;
            ghost.visible = true;
            ghost.x = config.startghostx;
            ghost.y = config.startghosty;
        });
    }

    _killPacman() {
        this._pacman.solid = false;
        this._pacman.visible = false;

        this._longTasks.addTimeoutTask(1000, {}, () => {
            this._pacman.solid = true;
            this._pacman.visible = true;

            // TODO: Determine best place to respawn
            let { respawnx, respawny } = determineRespawn(this._pacman, this._ghosts, this._board);

            this._pacman.x = respawnx;
            this._pacman.y = respawny;
        });

        //// TODO: also queue an animation task that runs at 16.6ms, 1000/16.6 times
        //this._longTasks.addIntervalTask(250, { x: 1 }, (obj) => {
        //    console.log(obj.x);
        //    obj.x++;
        //
        //    if (obj.x > 10) {
        //        return false;
        //    }
        //});
    }
}

module.exports = Characters;

function randomStartDirection() {
    let directions = ['left', 'right'];
    let index = Util.getRandomIntInclusive(0, directions.length - 1);
    return directions[index];
}

function determineRespawn(pacman, ghosts, board) {

    let respawnx = config.startpacmanx;
    let respawny = config.startpacmany;

    // TODO: Determine best spawn point based on ghost locations and remaining dot locations

    return {
        respawnx: respawnx,
        respawny: respawny
    }
}