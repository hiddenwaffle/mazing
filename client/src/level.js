'use strict';

const
    Board       = require('./board'),
    config      = require('./config'),
    Characters  = require('./characters'),
    LongTasks   = require('./long-tasks'),
    Pause       = require('./pause');

class Level {

    /**
     * @param number Level number
     * @param input
     * @param stage
     */
    constructor(number, input, stage) {
        this._number = number;
        this._input = input;

        let lvlGfxContainer = new PIXI.Container();
        lvlGfxContainer.x = 32;
        lvlGfxContainer.y = 32;
        stage.addChild(lvlGfxContainer);

        this._board = new Board(lvlGfxContainer);
        this._stage = stage;
        this._longTasksManager = new LongTasks.Manager();
        this._characters = new Characters(this._board, lvlGfxContainer, this._longTasksManager);

        this._currentGhostSubModeIndex = 0;
        this._ghostSubModeElapsed = 0;

        this._frightTimeLeft = null;

        this._lvlSpec = null;

        this._pause = new Pause(stage, input);
    }

    start() {
        this._pause.start();
        this._lvlSpec = config.levelSpecifications[this._number];
        this._characters.start(this._lvlSpec);
    }

    stop() {
        this._characters.stop();
    }

    step(elapsed) {
        if (this._pause.active) {
            // TODO: Count how long paused

        } else {
            this._handleLongTasks(elapsed);
            this._handleSubMode(elapsed);
            this._handleCollisionsAndSteps(elapsed);
        }

        this._stepPaused(elapsed);
    }

    checkForEndLevelCondition() {
        return this._board.dotsLeft() == false;
    }

    _stepPaused(elapsed) {
        this._pause.step(elapsed);
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