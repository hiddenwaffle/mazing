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
    }

    start() {
        eventBus.register('event.pause.begin', () => {
            for (let animation of this._animations) {
                animation.pause();
            }
        });

        eventBus.register('event.pause.end', () => {
            for (let animation of this._animations) {
                animation.resume();
            }
        })
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