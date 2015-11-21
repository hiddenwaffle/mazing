'use strict';

const
    TRANSITION_TIME = 500, // ms, must be > 0
    INTENSITY       = 0.75;

class Pause {

    constructor(stage) {
        this.active = false;

        let style = {
            font: '36px Arial',
            fill: '#eeeeee',
            align: 'center',
            wordWrap: true,
            wordWrapWidth: 250
        };
        this._instructions = new PIXI.Text('Paused\n\nPress enter to continue', style);
        this._instructions.x = 520;
        this._instructions.y = 150;
        this._instructions.visible = false;
        stage.addChild(this._instructions);

        this.filter= new PIXI.filters.SepiaFilter;
        this.filter.sepia = INTENSITY; // initially at full value
        stage.filters = [this.filter];

        this._transitionTimeLeft = 0;
    }

    flip() {
        this.active = !this.active;
        this._beginTransition();
    }

    /**
     * This arcane mix of method pauses immediately (no transition effect)
     */
    start() {
        this.active = false;
        this.flip();
        this.step(1000, true); // 1000 elapsed = immediate
    }

    step(elapsed) {
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

    _beginTransition() {
        // Handle if this is in mid-transition, and start there for reversal.
        // Otherwise, start the full transition time.
        if (this._transitionTimeLeft !== 0) {
            this._transitionTimeLeft = TRANSITION_TIME - this._transitionTimeLeft;
        } else {
            this._transitionTimeLeft = TRANSITION_TIME;
        }

        this._instructions.visible = false;
    }

    _completeTransition() {
        if (this.active) {
            this.filter.sepia = 0.75;
            this._instructions.visible = true;
        } else {
            this.filter.sepia = 0;
        }
    }
}

module.exports = Pause;