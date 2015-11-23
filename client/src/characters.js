'use strict';

const
    Entity              = require('./entity'),
    CharacterAnimations = require('./character-animations'),
    MovementStrategy    = require('./movement-strategy'),
    Death               = require('./death'),
    config              = require('./config'),
    Util                = require('./util'),
    LongTasks           = require('./long-tasks');

class Characters {

    constructor(board, parentGfx, longTasksManager) {
        this._board = board;
        this._longTasksManager = longTasksManager;

        let gfx = new PIXI.Container();
        parentGfx.addChild(gfx);

        let characterAnimations = new CharacterAnimations(gfx);

        this._pacman = new Entity(
            'pacman',
            board,
            config.startpacmanx,
            config.startpacmany,
            characterAnimations.createPacManAnimations(),
            new MovementStrategy(board, 'doNothing', 'doNothing')
        );

        this._ghosts = [];

        let randomMovementStrategy = new MovementStrategy(board, 'random');

        this._blinky = new Entity(
            'blinky',
            board,
            config.startghostx + (3 * config.wallSize),
            config.startghosty,
            characterAnimations.createGhostAnimations(0xff0000),
            new MovementStrategy(board, 'blinky', 'random', 27, 1, this._pacman),
            randomMovementStrategy
        );
        this._ghosts.push(this._blinky);

        this._pinky = new Entity(
            'pinky',
            board,
            config.startghostx - (3 * config.wallSize),
            config.startghosty,
            characterAnimations.createGhostAnimations(0xffb9ff),
            new MovementStrategy(board, 'pinky', 'random', 1, 1, this._pacman),
            randomMovementStrategy
        );
        this._ghosts.push(this._pinky);

        this._inky = new Entity(
            'inky',
            board,
            config.startghostx + config.wallSize,
            config.startghosty,
            characterAnimations.createGhostAnimations(0x00ffff),
            new MovementStrategy(board, 'inky', 'random', 27, 30, this._pacman, this._blinky),
            randomMovementStrategy
        );
        this._ghosts.push(this._inky);

        this._clyde = new Entity(
            'clyde',
            board,
            config.startghostx - config.wallSize,
            config.startghosty,
            characterAnimations.createGhostAnimations(0xffb950),
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
            'left',
            lvlSpec.frightTime,
            lvlSpec.frightFlashes
        );

        this._blinky.start(
            speedGroup.ghostNormal,
            speedGroup.ghostFright,
            mode,
            randomStartDirection(),
            lvlSpec.frightTime,
            lvlSpec.frightFlashes
        );

        this._pinky.start(
            speedGroup.ghostNormal,
            speedGroup.ghostFright,
            mode,
            randomStartDirection(),
            lvlSpec.frightTime,
            lvlSpec.frightFlashes
        );

        this._inky.start(
            speedGroup.ghostNormal,
            speedGroup.ghostFright,
            mode,
            randomStartDirection(),
            lvlSpec.frightTime,
            lvlSpec.frightFlashes
        );

        this._clyde.start(
            speedGroup.ghostNormal,
            speedGroup.ghostFright,
            mode,
            randomStartDirection(),
            lvlSpec.frightTime,
            lvlSpec.frightFlashes
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
        let death = new Death.Ghost(ghost);
        death.start();

        this._longTasksManager.addTask(new LongTasks.TimeoutTask(500, () => {
            death.respawn();
        }));
    }

    _killPacman() {
        let death = new Death.Pacman(this._pacman, this._ghosts, this._board);
        death.start();

        this._longTasksManager.addTask(new LongTasks.TimeoutTask(1000, () => {
            death.respawn();
        }));
    }
}

module.exports = Characters;

function randomStartDirection() {
    let directions = ['left', 'right'];
    let index = Util.getRandomIntInclusive(0, directions.length - 1);
    return directions[index];
}
