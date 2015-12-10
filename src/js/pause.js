'use strict';

const
    eventBus = require('./event-bus');

const
    TRANSITION_TIME = 500, // ms, must be > 0
    INTENSITY       = 0.75;

class Pause {

    constructor(stage, input) {
        this._stage = stage;
        this._input = input;

        this.active = false;

        let style = {
            font: '36px Arial',
            fill: '#eeeeee',
            align: 'center',
            wordWrap: true,
            wordWrapWidth: 250
        };
        this._instructions = new PIXI.Text('Paused\n\nPress any key to continue', style);
        this._instructions.x = 520;
        this._instructions.y = 100;
        this._instructions.visible = false;

        this.filter = new PIXI.filters.SepiaFilter();
        this.filter.sepia = INTENSITY; // initially at full value

        this._transitionTimeLeft = 0;
    }

    start() {
        this._stage.addChild(this._instructions);

        // This arcane mix of 3 methods forces immediatel pause (no transition effect)
        this.active = false;
        this._flip();
        this.step(1000, true); // 1000 elapsed = immediate
    }

    stop() {
        let idx = this._stage.getChildIndex(this._instructions);
        this._stage.removeChildAt(idx);
        this._instructions.destroy();
    }

    step(elapsed) {
        this._handleInput();
        this._stepTransition(elapsed);
    }

    /**
     * User presses Enter to pause the game. Then presses any key to unpause.
     * Also if the user hit an arrow key to unpause the game, allow next keyhandler
     * to pick it up rather than consuming it here.
     */
    _handleInput() {
        if (this.active) {
            if (this._input.isArrowKeyDown()) {
                this._flip();

            } else if (this._input.isAnyKeyDownAndUnhandled()) {
                this._flip();
            }
        } else {
            if (this._input.isDownAndUnhandled('enter')) {
                this._flip();
            }
        }
    }

    _flip() {
        this.active = !this.active;
        this._beginTransition();

        if (this.active) {
            eventBus.fire({ name: 'event.pause.begin' });
        } else {
            eventBus.fire({ name: 'event.pause.end' });
        }
    }

    _beginTransition() {
        this._stage.filters = [this.filter];

        // Handle if this is in mid-transition, and start there for reversal.
        // Otherwise, start the full transition time.
        if (this._transitionTimeLeft !== 0) {
            this._transitionTimeLeft = TRANSITION_TIME - this._transitionTimeLeft;
        } else {
            this._transitionTimeLeft = TRANSITION_TIME;
        }

        this._instructions.visible = false;
    }

    _stepTransition(elapsed) {
        if (this._transitionTimeLeft > 0) {
            let pct = (this._transitionTimeLeft / TRANSITION_TIME) * INTENSITY;

            if (this.active) {
                this.filter.sepia = INTENSITY - pct;
            } else {
                this.filter.sepia = pct;
            }

            this._transitionTimeLeft -= elapsed;
            if (this._transitionTimeLeft <= 0) {
                this._transitionTimeLeft = 0;
                this._completeTransition();
            }
        }
    }

    _completeTransition() {
        if (this.active) {
            this.filter.sepia = 0.75;
            this._instructions.visible = true;
        } else {
            this.filter.sepia = 0;
            this._stage.filters = null;
        }
    }
}

module.exports = Pause;