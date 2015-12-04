'use strict';

const
    Entity              = require('./entity'),
    CharacterAnimations = require('./character-animations'),
    MovementStrategy    = require('./movement-strategy'),
    Death               = require('./death'),
    config              = require('./config'),
    Util                = require('./util'),
    LongTasks           = require('./long-tasks'),
    eventBus            = require('./event-bus');

class Characters {

    constructor(board, parentGfx, longTasksManager) {
        this._board = board;
        this._longTasksManager = longTasksManager;

        this._gfx = new PIXI.Container();
        parentGfx.addChild(this._gfx);

        this._characterAnimations = new CharacterAnimations(this._gfx);

        this._pacman = new Entity(
            'pacman',
            board,
            config.startpacmanx,
            config.startpacmany,
            this._characterAnimations.createPacManAnimations(),
            new MovementStrategy(board, 'doNothing', 'doNothing'),
            true
        );

        this._ghosts = [];

        this._blinky = new Entity(
            'blinky',
            board,
            config.startghostx + (3 * config.wallSize),
            config.startghosty,
            this._characterAnimations.createGhostAnimations('red'),
            new MovementStrategy(board, 'blinky', 'random', 27, 1, this._pacman),
            false
        );
        this._ghosts.push(this._blinky);

        this._pinky = new Entity(
            'pinky',
            board,
            config.startghostx - (3 * config.wallSize),
            config.startghosty,
            this._characterAnimations.createGhostAnimations('pink'),
            new MovementStrategy(board, 'pinky', 'random', 1, 1, this._pacman),
            false
        );
        this._ghosts.push(this._pinky);

        this._inky = new Entity(
            'inky',
            board,
            config.startghostx + config.wallSize,
            config.startghosty,
            this._characterAnimations.createGhostAnimations('blue'),
            new MovementStrategy(board, 'inky', 'random', 27, 30, this._pacman, this._blinky),
            false
        );
        this._ghosts.push(this._inky);

        this._clyde = new Entity(
            'clyde',
            board,
            config.startghostx - config.wallSize,
            config.startghosty,
            this._characterAnimations.createGhostAnimations('orange'),
            new MovementStrategy(board, 'clyde', 'random', 1, 30, this._pacman),
            false
        );
        this._ghosts.push(this._clyde);
    }

    start(lvlSpec) {
        this._characterAnimations.start();

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

    stop() {
        this._characterAnimations.stop();
    }

    checkCollisions() {
        let dot = false;
        let collision = false;
        let energizer = false;

        if (this._pacman.solid) {
            if (this._board.handleDotCollision(
                    this._pacman.x,
                    this._pacman.y,
                    this._pacman.width,
                    this._pacman.height)) {
                collision = true;
                dot = true;
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
            dot: dot,
            collision: collision,
            energizer: energizer
        };
    }

    stepPacman(elapsed, playerRequestedDirection) {
        if (playerRequestedDirection !== null) {
            this._pacman.requestedDirection = playerRequestedDirection;
        }

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
                    this._killPacman(ghost);
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

        eventBus.fire({ name: 'event.action.death.ghost', args: { ghostName: ghost.name } });
        eventBus.fire({ name: 'event.screenshake.start' });
    }

    _killPacman(ghost) {
        let death = new Death.Pacman(this._pacman, this._ghosts, this._board);
        death.start();

        this._longTasksManager.addTask(new LongTasks.TimeoutTask(1000, () => {
            death.respawn();
        }));

        eventBus.fire({ name: 'event.action.death.pacman', args: { ghostName: ghost.name } });
        eventBus.fire({ name: 'event.screenshake.start' });
    }
}

module.exports = Characters;

function randomStartDirection() {
    let directions = ['left', 'right'];
    let index = Util.getRandomIntInclusive(0, directions.length - 1);
    return directions[index];
}
