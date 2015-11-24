'use strict';

const
    Animation   = require('./animation'),
    eventBus    = require('./event-bus');

const
    pacmanNormalColor       = 0xffff00,
    pacmanFrighteningColor  = 0xffffff,
    ghostFrightenedColor    = 0x5555ff;

class CharacterAnimations {

    constructor(gfx) {
        this._gfx = gfx;
        this._animations = [];

        this._handlePause = () => {
            for (let animation of this._animations) {
                animation.pause();
            }
        };

        this._handleResume = () => {
            for (let animation of this._animations) {
                animation.resume();
            }
        };
    }

    start() {
        eventBus.register('event.pause.begin', this._handlePause);
        eventBus.register('event.pause.end', this._handleResume);
    }

    stop() {
        eventBus.unregister('event.pause.begin', this._handlePause);
        eventBus.unregister('event.pause.end', this._handleResume);
    }

    createPacManAnimations() {
        let animation = new Animation(this._gfx, pacmanNormalColor, pacmanFrighteningColor);
        this._animations.push(animation);
        return animation;
    }

    createGhostAnimations(ghostNormalColor) {
        let animation = new Animation(this._gfx, ghostNormalColor, ghostFrightenedColor);
        this._animations.push(animation);
        return animation;
    }
}

module.exports = CharacterAnimations;