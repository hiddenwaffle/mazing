'use strict';

const
    Animation = require('./animation');

const
    pacmanNormalColor       = 0xffff00,
    pacmanFrighteningColor  = 0xffffff,
    ghostFrightenedColor    = 0x5555ff;

class CharacterAnimations {

    constructor(gfx) {
        this._gfx = gfx;
    }

    createPacManAnimations() {
        return new Animation(this._gfx, pacmanNormalColor, pacmanFrighteningColor);
    }

    createGhostAnimations(ghostNormalColor) {
        return new Animation(this._gfx, ghostNormalColor, ghostFrightenedColor);
    }
}

module.exports = CharacterAnimations;