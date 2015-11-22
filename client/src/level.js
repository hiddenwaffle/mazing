'use strict';

const
    Board       = require('./board'),
    config      = require('./config'),
    Characters  = require('./characters'),
    LongTasks   = require('./long-tasks');

class Level {

    constructor(number, input, stage) {
        let lvlGfxContainer = new PIXI.Container();
        lvlGfxContainer.x = 32;
        lvlGfxContainer.y = 32;
        stage.addChild(lvlGfxContainer);

        this._number = number;
        this._board = new Board(lvlGfxContainer);
        this._input = input;
        this._stage = stage;
        this._longTasksManager = new LongTasks.Manager();
        this._characters = new Characters(this._board, lvlGfxContainer, this._longTasksManager);

        this._currentGhostSubModeIndex = 0;
        this._ghostSubModeElapsed = 0;

        this._frightTimeLeft = null;

        this._lvlSpec = null;
    }

    start() {
        // Setup the level
        this._lvlSpec = config.levelSpecifications[this._number];
        this._characters.start(this._lvlSpec);
    }

    step(elapsed) {
        this._handleLongTasks(elapsed);
        this._handleSubMode(elapsed);
        this._handleCollisionsAndSteps(elapsed);
    }

    _handleLongTasks(elapsed) {
        this._longTasksManager.step(elapsed);
    }

    _handleSubMode(elapsed) {
        if (this._frightTimeLeft !== null) {
            this._handleFrightLeft(elapsed);
            return; // fright essentially pauses the sub-mode timer.
        }

        this._ghostSubModeElapsed += elapsed;

        let currentSubModeTotalTime = this._lvlSpec.ghostMode[this._currentGhostSubModeIndex].time;
        if (this._ghostSubModeElapsed >= currentSubModeTotalTime) {
            this._currentGhostSubModeIndex += 1;
            this._ghostSubModeElapsed = 0;

            let mode = this._lvlSpec.ghostMode[this._currentGhostSubModeIndex].mode;
            this._characters.switchMode(mode);
        }
    }

    _handleFrightLeft(elapsed) {
        this._frightTimeLeft -= elapsed;

        if (this._frightTimeLeft <= 0) {
            this._characters.removeRemainingFright();
            this._frightTimeLeft = null;

        } else {
            // TODO: Here check if flashing should start
        }
    }

    _handleCollisionsAndSteps(elapsed) {
        let result = this._characters.checkCollisions();

        if (result.collision) {
            this._characters.stepPacman(0, this._input.requestedDirection); // 0 means stopped one frame
        } else {
            this._characters.stepPacman(elapsed, this._input.requestedDirection);
        }
        this._characters.stepGhosts(elapsed);

        if (result.energizer) {
            this._characters.signalFright();
            this._frightTimeLeft = this._lvlSpec.frightTime;
        }
    }
}

module.exports = Level;