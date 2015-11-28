'use strict';

const
    EntityAnimation = require('./entity-animation'),
    eventBus        = require('./event-bus'),
    config          = require('./config');

const
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
        let frames = [];
        for (let filename of ['pacman1.png', 'pacman2.png', 'pacman3.png', 'pacman2.png']) {
            frames.push({ texture: PIXI.Texture.fromFrame(filename), time: 50 });
        }

        let up = new PIXI.extras.MovieClip(frames);
        centerClip(up);
        up.rotation = Math.PI * (3/2);

        let down = new PIXI.extras.MovieClip(frames);
        centerClip(down);
        down.rotation = Math.PI / 2;

        let left = new PIXI.extras.MovieClip(frames);
        centerClip(left);
        left.scale.x = -1;

        let right = new PIXI.extras.MovieClip(frames);
        centerClip(right);

        let frightened = new PIXI.extras.MovieClip([PIXI.Texture.EMPTY]);
        let flashing = new PIXI.extras.MovieClip([PIXI.Texture.EMPTY]);

        let animation = new EntityAnimation(
            this._gfx,
            up,
            down,
            left,
            right,
            frightened,
            flashing,
            true
        );

        this._animations.push(animation);
        return animation;
    }

    createGhostAnimations(color) {
        let colorMatrix = new PIXI.filters.ColorMatrixFilter();
        colorMatrix.matrix = generateColorMatrixValue(color);

        let upFrames = [];
        for (let filename of ['ghost-green-up1.png', 'ghost-green-up2.png', 'ghost-green-up3.png']) {
            upFrames.push({ texture: PIXI.Texture.fromFrame(filename), time: 50 });
        }

        let up = new PIXI.extras.MovieClip(upFrames);
        up.filters = [colorMatrix];
        centerClip(up);

        let downFrames = [];
        for (let filename of ['ghost-green-down1.png', 'ghost-green-down2.png', 'ghost-green-down3.png']) {
            downFrames.push({ texture: PIXI.Texture.fromFrame(filename), time: 50 });
        }

        let down = new PIXI.extras.MovieClip(downFrames);
        down.filters = [colorMatrix];
        centerClip(down);

        let rightFrames = [];
        for (let filename of ['ghost-green-right1.png', 'ghost-green-right2.png', 'ghost-green-right3.png']) {
            rightFrames.push({ texture: PIXI.Texture.fromFrame(filename), time: 50 });
        }

        let left = new PIXI.extras.MovieClip(rightFrames);
        left.filters = [colorMatrix];
        centerClip(left);
        left.scale.x = -1;

        let right = new PIXI.extras.MovieClip(rightFrames);
        right.filters = [colorMatrix];
        centerClip(right);

        let frightenedFrames = [];
        for (let filename of ['ghost-frightened1.png', 'ghost-frightened2.png', 'ghost-frightened3.png']) {
            frightenedFrames.push({ texture: PIXI.Texture.fromFrame(filename), time: 50 });
        }

        let frightened = new PIXI.extras.MovieClip(frightenedFrames);
        centerClip(frightened);

        let flashingFrames = [];
        for (let filename of [
            'ghost-frightened1.png',
            'ghost-frightened2.png',
            'ghost-frightened3.png',
            'ghost-flash1.png',
            'ghost-flash2.png',
            'ghost-flash3.png']) {
            flashingFrames.push({ texture: PIXI.Texture.fromFrame(filename), time: 83.34 });
        }

        let flashing = new PIXI.extras.MovieClip(flashingFrames);
        centerClip(flashing);

        let animation = new EntityAnimation(
            this._gfx,
            up,
            down,
            left,
            right,
            frightened,
            flashing
        );

        this._animations.push(animation);
        return animation;
    }
}

module.exports = CharacterAnimations;

function centerClip(clip) {
    clip.anchor.x = 0.5;
    clip.anchor.y = 0.5;
    clip.position.x = config.characterAnimationOffset;
    clip.position.y = config.characterAnimationOffset;
}

/**
 * Matrices are keyed off of the pure green of the green ghost.
 */
function generateColorMatrixValue(input) {

    if (input === 'red') {
        return [
            1, 1, 0, 0,   0,
            0, 0, 0, 0,   0,
            0, 0, 1, 0,   0,
            0, 0, 0, 0.5, 0
        ];

    } else if (input === 'pink') {
        return [
            1, 1,    0, 0,   0,
            0, 0.72, 0, 0,   0,
            0, 1,    1, 0,   0,
            0, 0,    0, 0.5, 0
        ];

    } else if (input === 'blue') {
        return [
            1, 0, 0, 0,   0,
            0, 1, 0, 0,   0,
            0, 1, 1, 0,   0,
            0, 0, 0, 0.5, 0
        ]

    } else if (input === 'orange') {
        return [
            1, 1,    0, 0,   0,
            0, 0.73, 0, 0,   0,
            0, 0.31, 1, 0,   0,
            0, 0,    0, 0.5, 0
        ];

    } else { // lower only the alpha
        return [
            1, 0, 0, 0,   0,
            0, 1, 0, 0,   0,
            0, 0, 1, 0,   0,
            0, 0, 0, 0.5, 0
        ];
    }
}