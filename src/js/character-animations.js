import { AnimatedSprite, Texture, ColorMatrixFilter } from 'pixi.js';
import EntityAnimation from './entity-animation';
import eventBus from './event-bus';
import config from './config';
import * as Util from './util';
import { getTexture } from './assets';

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
        for (let filename of ['player1.png', 'player2.png', 'player3.png', 'player2.png']) {
            frames.push({ texture: getTexture(filename), time: 50 });
        }

        let up = new AnimatedSprite(frames);
        centerClip(up);
        up.rotation = Math.PI * (3/2);

        let down = new AnimatedSprite(frames);
        centerClip(down);
        down.rotation = Math.PI / 2;

        let left = new AnimatedSprite(frames);
        centerClip(left);
        left.scale.x = -1;

        let right = new AnimatedSprite(frames);
        centerClip(right);

        let frightened = new AnimatedSprite([Texture.EMPTY]);
        let flashing = new AnimatedSprite([Texture.EMPTY]);

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

    createGhostAnimations(color) {
        let colorMatrix = new ColorMatrixFilter();
        colorMatrix.matrix = Util.generateColorMatrixValue(color);

        let upFrames = [];
        for (let filename of ['shade-green-up1.png', 'shade-green-up2.png', 'shade-green-up3.png']) {
            upFrames.push({ texture: getTexture(filename), time: 50 });
        }

        let up = new AnimatedSprite(upFrames);
        up.filters = [colorMatrix];
        centerClip(up);

        let downFrames = [];
        for (let filename of ['shade-green-down1.png', 'shade-green-down2.png', 'shade-green-down3.png']) {
            downFrames.push({ texture: getTexture(filename), time: 50 });
        }

        let down = new AnimatedSprite(downFrames);
        down.filters = [colorMatrix];
        centerClip(down);

        let rightFrames = [];
        for (let filename of ['shade-green-right1.png', 'shade-green-right2.png', 'shade-green-right3.png']) {
            rightFrames.push({ texture: getTexture(filename), time: 50 });
        }

        let left = new AnimatedSprite(rightFrames);
        left.filters = [colorMatrix];
        centerClip(left);
        left.scale.x = -1;

        let right = new AnimatedSprite(rightFrames);
        right.filters = [colorMatrix];
        centerClip(right);

        let frightenedFrames = [];
        for (let filename of ['shade-frightened1.png', 'shade-frightened2.png', 'shade-frightened3.png']) {
            frightenedFrames.push({ texture: getTexture(filename), time: 50 });
        }

        let frightened = new AnimatedSprite(frightenedFrames);
        centerClip(frightened);

        let flashingFrames = [];
        for (let filename of [
            'shade-frightened1.png',
            'shade-frightened2.png',
            'shade-frightened3.png',
            'shade-flash1.png',
            'shade-flash2.png',
            'shade-flash3.png']) {
            flashingFrames.push({ texture: getTexture(filename), time: 83.34 });
        }

        let flashing = new AnimatedSprite(flashingFrames);
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

export default CharacterAnimations;

function centerClip(clip) {
    clip.anchor.x = 0.5;
    clip.anchor.y = 0.5;
    clip.position.x = config.characterAnimationOffset;
    clip.position.y = config.characterAnimationOffset;
}
