'use strict';

const
    eventBus = require('./event-bus');

const
    ENTROPY = 0.15;

class Particle {

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
     * Return false if life <= 0
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

    get gfx() {
        return this._gfx;
    }

    _remove() {
        this._parentGfx.removeChild(this._gfx);
    }

    _update() {
        this._gfx.x += this._xenergy;
        this._gfx.y += this._yenergy;
    }
}

class ParticleEmitter {

    constructor(parentGfx) {
        this._parentGfx = parentGfx;
        this._gfx = new PIXI.ParticleContainer();
        parentGfx.addChild(this._gfx);

        let dot = new PIXI.Graphics();
        dot.beginFill(0xffffff, 1);
        dot.drawRect(0, 0, 2, 2);
        dot.endFill();
        this._sharedTexture = dot.generateTexture();

        this._particles = [];
    }

    start() {
        this._eatdotHandler = (args) => {
            let { xenergy, yenergy } = determineEnergy(args.direction);
            this._emitDotCrumbs(args.x, args.y, xenergy, yenergy);
        };
        eventBus.register('event.action.eatdot', this._eatdotHandler);
    }

    step(elapsed) {
        this._particles = this._particles.filter((particle) => {
            return particle.step(elapsed);
        });
    }

    stop() {
        eventBus.unregister('event.action.eatdot', this._eatdotHandler);
        // TODO: Remove and destroy graphics?
    }

    _emitDotCrumbs(xorig, yorig, xenergy, yenergy) {
        for (let count = 0; count < 8; count++) {
            let { x, y, ttl } = generateRandomValues(
                xorig-4, xorig+4,
                yorig-4, yorig+4,
                500
            );
            this._particles.push(
                new Particle(
                    this._gfx,
                    this._sharedTexture,
                    x,
                    y,
                    ttl,
                    xenergy,
                    yenergy
                )
            );
        }
    }
}

module.exports = ParticleEmitter;

function determineEnergy(characterDirection) {
    let xminenergy = -1;
    let xmaxenergy = 1;

    let yminenergy = -1;
    let ymaxenergy = 1;

    switch (characterDirection) {
        case 'up':
            yminenergy -= 1;
            ymaxenergy -= 1;
            break;
        case 'down':
            yminenergy += 1;
            ymaxenergy += 1;
            break;
        case 'left':
            xminenergy -= 1;
            xmaxenergy -= 1;
            break;
        case 'right':
            xminenergy += 1;
            xmaxenergy += 1;
            break;
        default:
            break;
    }

    let xenergy = (Math.random() * (xmaxenergy - xminenergy)) + xminenergy;
    let yenergy = (Math.random() * (ymaxenergy - yminenergy)) + yminenergy;

    return {
        xenergy: xenergy,
        yenergy: yenergy
    }
}

function generateRandomValues(
    xmin, xmax,
    ymin, ymax,
    ttlmax
) {
    let x = (Math.random() * (xmax - xmin)) + xmin;
    let y = (Math.random() * (ymax - ymin)) + ymin;
    let ttl = Math.random() * ttlmax;

    return {
        x: x,
        y: y,
        ttl: ttl
    }
}