'use strict';

const
    Animation = require('./animation');

const
    pacmanNormalColor       = 0xffff00,
    pacmanFrightenedColor   = 0xffffff,
    ghostFrightenedColor    = 0x5555ff;

class CharacterAnimations {

    constructor(gfx) {
        this._gfx = gfx;
    }

    createPacManAnimations() {
        return new Animation(this._gfx, pacmanNormalColor, pacmanFrightenedColor);
    }

    createGhostAnimations(ghostNormalColor) {
        return new Animation(this._gfx, ghostNormalColor, ghostFrightenedColor);
    }
}

module.exports = CharacterAnimations;