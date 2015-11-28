'use strict';

const
    Animation       = require('./animation'),
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
        up.anchor.x = 0.5;
        up.anchor.y = 0.5;
        up.position.x = config.characterAnimationOffset;
        up.position.y = config.characterAnimationOffset;
        up.rotation = Math.PI * (3/2);

        let down = new PIXI.extras.MovieClip(frames);
        down.anchor.x = 0.5;
        down.anchor.y = 0.5;
        down.position.x = config.characterAnimationOffset;
        down.position.y = config.characterAnimationOffset;
        down.rotation = Math.PI / 2;

        let left = new PIXI.extras.MovieClip(frames);
        left.anchor.x = 0.5;
        left.anchor.y = 0.5;
        left.position.x = config.characterAnimationOffset;
        left.position.y = config.characterAnimationOffset;
        left.scale.x = -1;

        let right = new PIXI.extras.MovieClip(frames);
        right.anchor.x = 0.5;
        right.anchor.y = 0.5;
        right.position.x = config.characterAnimationOffset;
        right.position.y = config.characterAnimationOffset;

        let frightened = new PIXI.extras.MovieClip([PIXI.Texture.EMPTY]);
        let flashing = new PIXI.extras.MovieClip([PIXI.Texture.EMPTY]);

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

    createGhostAnimations(ghostNormalColor) {
        let animation = new Animation(this._gfx, ghostNormalColor, ghostFrightenedColor);
        this._animations.push(animation);
        return animation;
    }
}

module.exports = CharacterAnimations;