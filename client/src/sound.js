'use strict';

const
    Util = require('./util');

const
    eventBus = require('./event-bus');

const
    ICON_TRANSPARENCY = 0.70,
    MUTE_KEY = '183461283-sound-mute';

class Sound {

    /**
     * TOOD: Clean this up by breaking into small objects.
     */
    constructor(parentGfx) {
        this.parentGfx = parentGfx;
        this._gfx = new PIXI.Container();
        this._gfx.x = 750;
        this._gfx.y = 550;
        this.parentGfx.addChild(this._gfx);

        let soundOnTexture = PIXI.Texture.fromFrame('sound-on.png');
        this._soundOnIcon = new PIXI.Sprite(soundOnTexture);
        this._soundOnIcon.alpha = ICON_TRANSPARENCY;
        this._soundOnIcon.interactive = true;
        this._soundOnIcon.on('mouseover', () => {
            this._soundOnIcon.alpha = 1.0;
        });
        this._soundOnIcon.on('mouseout', () => {
            this._soundOnIcon.alpha = ICON_TRANSPARENCY;
        });
        this._soundOnIcon.on('mousedown', () => {
            this._soundOnIcon.visible = false;
            this._soundOffIcon.visible = true;
            Howler.mute();
            sessionStorage.setItem(MUTE_KEY, 'on');
        });
        this._soundOnIcon.visible = false;
        this._gfx.addChild(this._soundOnIcon);

        let soundOffTexture = PIXI.Texture.fromFrame('sound-off.png');
        this._soundOffIcon = new PIXI.Sprite(soundOffTexture);
        this._soundOffIcon.interactive = true;
        this._soundOffIcon.on('mouseover', () => {
            this._soundOffIcon.alpha = 1.0;
        });
        this._soundOffIcon.on('mouseout', () => {
            this._soundOffIcon.alpha = ICON_TRANSPARENCY;
        });
        this._soundOffIcon.on('mousedown', () => {
            this._soundOffIcon.visible = false;
            this._soundOnIcon.visible = true;
            Howler.unmute();
            sessionStorage.setItem(MUTE_KEY, 'off');
        });
        this._soundOffIcon.alpha = ICON_TRANSPARENCY;
        this._soundOffIcon.visible = false;
        this._gfx.addChild(this._soundOffIcon);

        // Load sound files

        this._punch = new Howl({
            urls: ['assets/punch.m4a']
        });

        this._whams = [
            new Howl({ urls: ['assets/wham1.m4a'] }),
            new Howl({ urls: ['assets/wham2.m4a'] }),
            new Howl({ urls: ['assets/wham3.m4a'] })
        ];

        this._energizer = new Howl({
            urls: ['assets/energizer.m4a']
        });

        Howler.volume(0.5);
    }

    start() {
        this._playWham = () => {
            let idx = Util.getRandomIntInclusive(0, this._whams.length - 1);
            this._whams[idx].play();
        };
        eventBus.register('event.action.death.pacman', this._playWham);

        this._playPunch = () => {
            this._punch.play();
        };
        eventBus.register('event.action.death.ghost', this._playPunch);

        this._playEnergizer = () => {
            this._energizer.play();
        };
        eventBus.register('event.action.energizer', this._playEnergizer);

        // Determine if the user had muted during this session
        let mute = sessionStorage.getItem(MUTE_KEY);
        if (mute === 'on') {
            this._soundOffIcon.visible = true;
            Howler.mute();
        } else {
            this._soundOnIcon.visible = true;
            Howler.unmute();
        }
    }

    stop() {
        eventBus.unregister('event.action.death.ghost', this._playWham);
        eventBus.unregister('event.action.death.ghost', this._playPunch);
        eventBus.unregister('event.action.energizer', this._playEnergizer);
    }
}

module.exports = Sound;