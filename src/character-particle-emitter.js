'use strict';

const
    eventBus = require('./event-bus');

const
    PARTICLE_SIZE = 3,
    MIN_ENERGY = 1.5,
    MAX_ENERGY = 12.5,
    ENTROPY = 0.0,
    MIN_TTL = 300,
    MAX_TTL = 600;

class CharacterParticle {

    constructor(parentGfx, texture, x, y, ttl, xenergy, yenergy) {
        this._parentGfx = parentGfx;
        this._gfx = new PIXI.Sprite(texture);
        parentGfx.addChild(this._gfx);

        this._gfx.x = x;
        this._gfx.y = y;
        this._ttl = ttl; // ms
        this._xenergy = xenergy;
        this._yenergy = yenergy;
    }

    /**
     * Return false if ttl <= 0
     */
    step(elapsed) {
        this._ttl -= elapsed;

        if (this._ttl <= 0) {
            this._remove();
            return false;
        } else {
            this._update();
            return true;
        }
    }

    _remove() {
        this._parentGfx.removeChild(this._gfx);
    }

    /**
     * Apply energy, then increase/decrease energy towards 0.
     */
    _update() {
        this._gfx.x += this._xenergy;
        if (this._xenergy < 0) {
            this._xenergy += ENTROPY;
        } else {
            this._xenergy -= ENTROPY;
        }

        this._gfx.y += this._yenergy;
        if (this._yenergy < 0) {
            this._yenergy += ENTROPY;
        } else {
            this._yenergy -= ENTROPY;
        }
    }
}

class CharacterParticleEmitter {

    constructor(parentGfx) {
        this._parentGfx = parentGfx;
        this._gfx = new PIXI.Container();
        parentGfx.addChild(this._gfx);

        this._blueParticles = [];
        this._blueGfx = new PIXI.ParticleContainer();
        this._gfx.addChild(this._blueGfx);

        let blueDot = new PIXI.Graphics();
        blueDot.lineStyle(1, 0x1600de, 1);
        blueDot.beginFill(0x4444ff, 1);
        blueDot.drawRect(0, 0, PARTICLE_SIZE, PARTICLE_SIZE);
        blueDot.endFill();
        this._blueTexture = blueDot.generateTexture();

        this._yellowParticles = [];
        this._yellowGfx = new PIXI.ParticleContainer();
        this._gfx.addChild(this._yellowGfx);

        let yellowDot = new PIXI.Graphics();
        yellowDot.lineStyle(1, 0xfcf400);
        yellowDot.beginFill(0xcbcb00, 1);
        yellowDot.drawRect(0, 0, PARTICLE_SIZE, PARTICLE_SIZE);
        yellowDot.endFill();
        this._yellowTexture = yellowDot.generateTexture();
    }

    start() {
        this._handleDeathGhost = (args) => {
            this._emitExplosion(
                this._blueParticles,
                this._blueGfx,
                this._blueTexture,
                args.x,
                args.y,
                args.ghostDirection,
                args.pacmanDirection
            );
        };
        eventBus.register('event.action.death.ghost', this._handleDeathGhost);

        this._handleDeathPacman = (args) => {
            this._emitExplosion(
                this._yellowParticles,
                this._yellowGfx,
                this._yellowTexture,
                args.x,
                args.y,
                args.ghostDirection,
                args.pacmanDirection
            )
        };
        eventBus.register('event.action.death.pacman', this._handleDeathPacman);
    }

    step(elapsed) {
        this._blueParticles = this._blueParticles.filter((particle) => {
            return particle.step(elapsed);
        });

        this._yellowParticles = this._yellowParticles.filter((particle) => {
            return particle.step(elapsed);
        });
    }

    stop() {
        eventBus.unregister('event.action.death.ghost', this._handleDeathGhost);
        eventBus.unregister('event.action.death.pacman', this._handleDeathPacman);
        this._parentGfx.removeChild(this._gfx);
        // TODO: destroy graphics? (textures?)
    }

    _emitExplosion(particles, gfx, texture, xorig, yorig, ghostDirection, pacmanDirection) {
        for (let count = 0; count < 100; count++) {
            let { x, y } = randomizeXY(xorig, yorig, 45); // 1.5x sprite width (30)
            let { xenergy, yenergy } = determineEnergy(ghostDirection, pacmanDirection);
            particles.push(
                new CharacterParticle(
                    gfx,
                    texture,
                    x,
                    y,
                    randomTtl(),
                    xenergy,
                    yenergy
                )
            );
        }
    }
}

module.exports = CharacterParticleEmitter;

function randomizeXY(x, y, max) {
    let targetx = (Math.random() * max) + (x - (max/2));
    let targety = (Math.random() * max) + (y - (max/2));

    return {
        x: targetx,
        y: targety
    };
}

function randomTtl() {
    return (Math.random() * (MAX_TTL - MIN_TTL)) + MIN_TTL;
}

/**
 * NOTE: Possible for direction to be blank
 */
function determineEnergy(d1, d2) {
    let { dx: dx1, dy: dy1 } = determineUnitEnergy(d1);
    let { dx: dx2, dy: dy2 } = determineUnitEnergy(d2);

    let xcombined = dx1 + dx2;
    let ycombined = dy1 + dy2;

    // Special case: when, head on collision, emit perpendicular;
    // also, send half in one direction, half in another
    if (xcombined === 0 && ycombined === 0) {
        let delta = randomNegativeOneOrOne();

        if (d1 === 'left' || d1 === 'right' || d2 === 'left' || d2 === 'right') {
            ycombined = delta;
        } else {
            xcombined = delta;
        }
    }

    let xavg = xcombined / 2;
    let yavg = ycombined / 2;

    let xrand = (Math.random() * (MAX_ENERGY - MIN_ENERGY)) + MIN_ENERGY;
    let yrand = (Math.random() * (MAX_ENERGY - MIN_ENERGY)) + MIN_ENERGY;

    let xenergy = xavg * xrand;
    let yenergy = yavg * yrand;

    // When zero energy in one of the axis, give it a little randomness
    if (xenergy === 0) {
        xenergy = (Math.random() * yenergy) - (yenergy/2);
    }
    if (yenergy === 0) {
        yenergy = (Math.random() * xenergy) - (xenergy/2);
    }

    return {
        xenergy: xenergy,
        yenergy: yenergy
    }
}

function determineUnitEnergy(d) {
    let dx = 0;
    let dy = 0;

    switch (d) {
        case 'up':
            dy = -1;
            break;
        case 'down':
            dy = 1;
            break;
        case 'left':
            dx = -1;
            break;
        case 'right':
            dx = 1;
    }

    return {
        dx: dx,
        dy: dy
    }
}

function randomNegativeOneOrOne() {
    let val = Math.random();
    if (val < 0.5) {
        return -1;
    } else {
        return 1;
    }
}