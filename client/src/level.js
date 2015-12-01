'use strict';

const
    Board       = require('./board'),
    config      = require('./config'),
    Characters  = require('./characters'),
    LongTasks   = require('./long-tasks'),
    Pause       = require('./pause'),
    Scoreboard  = require('./scoreboard');

const
    eventBus    = require('./event-bus');

class Level {

    /**
     * @param number Level number
     * @param input
     * @param stage
     */
    constructor(number, input, stage, levelEnding) {
        this.number = number;
        this._input = input;
        this._stage = stage;

        this._gfx = new PIXI.Container();
        this._gfx.z = 1; // custom property
        this._gfx.x = 32;
        this._gfx.y = 32;
        this._stage.addChild(this._gfx);

        this._board = new Board(this._gfx);
        this._longTasksManager = new LongTasks.Manager();
        this._characters = new Characters(this._board, this._gfx, this._longTasksManager);

        this._currentGhostSubModeIndex = 0;
        this._ghostSubModeElapsed = 0;

        this._frightTimeLeft = null;

        this._lvlSpec = null;

        this._pause = new Pause(stage, input);
        this._scoreboard = new Scoreboard(stage);
        levelEnding.scoreboard = this._scoreboard;
    }

    start() {
        this._lvlSpec = config.levelSpecifications[this.number];
        this._characters.start(this._lvlSpec);
        this._pause.start();
        this._scoreboard.start();

        eventBus.fire({ name: 'event.level.start', args: { levelNumber: this.number } });
    }

    stop() {
        this._characters.stop();
        this._pause.stop();
        this._scoreboard.stop();

        // TODO: In next game, make this more encapsulated
        let idx = this._stage.getChildIndex(this._gfx);
        this._stage.removeChildAt(idx);
        this._gfx.destroy(true);
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
        let requestedDirection = this._determineRequestedDirection();

        if (result.collision) {
            this._characters.stepPacman(0, requestedDirection); // 0 means stopped one frame
        } else {
            this._characters.stepPacman(elapsed, requestedDirection);
        }
        this._characters.stepGhosts(elapsed);

        if (result.energizer) {
            this._characters.signalFright();
            this._frightTimeLeft = this._lvlSpec.frightTime;
        }
    }

    _determineRequestedDirection() {
        if (this._input.isDown('up')) {
            return 'up';

        } else if (this._input.isDown('down')) {
            return 'down';

        } else if (this._input.isDown('left')) {
            return 'left';

        } else if (this._input.isDown('right')) {
            return 'right';

        } else {
            // null means no new requested direction; stay the course
            return null;
        }
    }
}

module.exports = Level;