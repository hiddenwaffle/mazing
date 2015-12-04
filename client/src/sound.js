'use strict';

const
    Util = require('./util');

const
    eventBus = require('./event-bus');

const
    ICON_TRANSPARENCY = 0.70,
    MUTE_KEY = '183461283-sound-mute',
    CRACKLE_TIME = 200;

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
            urls: ['assets/punch.m4a'],
            volume: 0.5
        });

        this._whams = [
            new Howl({ urls: ['assets/wham1.m4a'], volume: 0.25 }),
            new Howl({ urls: ['assets/wham2.m4a'], volume: 0.25 }),
            new Howl({ urls: ['assets/wham3.m4a'], volume: 0.25 })
        ];

        this._energizer = new Howl({
            urls: ['assets/energizer.m4a'],
            volume: 0.5
        });

        this._levelBackgrounds = [
            new Howl({ urls: ['assets/cool-journey.m4a'], volume: 0.9, loop: true }),
            new Howl({ urls: ['assets/happy-energy.m4a'], volume: 0.9, loop: true })
        ];
        this._currentBackground = 0;

        this._levelEnd = new Howl({
            urls: ['assets/atari-st-beat-11.m4a'],
            volume: 0.4,
            loop: true
        });

        this._crackles = new Howl({
            urls: ['assets/crackles.m4a'],
            volume: 0.75,
            loop: true
        });
        this._cracklesTimeLeft = 0;

        Howler.volume(0.9);
    }

    step(elapsed) {
        if (this._cracklesTimeLeft > 0) {
            this._cracklesTimeLeft -= elapsed;
            if (this._cracklesTimeLeft <= 0) {
                this._cracklesTimeLeft = 0;
                this._crackles.pause();
            }
        }
    }

    start() {
        this._pauseBackgroundMusic = () => {
            this._levelBackgrounds[this._currentBackground].pause();
        };
        eventBus.register('event.pause.begin', this._pauseBackgroundMusic);

        this._playBackgroundMusic = () => {
            this._levelBackgrounds[this._currentBackground].play();
        };
        eventBus.register('event.pause.end', this._playBackgroundMusic);

        this._playLevelEndMusic = () => {
            this._stopAllMusic();
            this._levelEnd.play();
        };
        eventBus.register('event.level.end', this._playLevelEndMusic);

        this._stopLevelEndMusic = () => {
            this._levelEnd.stop();

            this._currentBackground += 1;
            if (this._currentBackground >= this._levelBackgrounds.length) {
                this._currentBackground = 0;
            }
        };
        eventBus.register('event.level.ending.readyfornext', this._stopLevelEndMusic);

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

        this._ensureCrackles = () => {
            if (this._cracklesTimeLeft > 0) {
                this._cracklesTimeLeft = CRACKLE_TIME;
            } else {
                this._cracklesTimeLeft = CRACKLE_TIME;
                this._crackles.play();
            }
        };
        eventBus.register('event.action.eatdot', this._ensureCrackles);

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
        // TODO: unregister the other stuff
    }

    _stopAllMusic() {
        for (let music of this._levelBackgrounds) {
            music.stop();
        }

        this._levelEnd.stop();
    }
}

module.exports = Sound;