'use strict';

const
    eventBus = require('./event-bus');

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
        this._gfx.x -= this._xenergy;
        this._xenergy -= 0.15;

        this._gfx.y -= this._yenergy;
        this._yenergy -= 0.15;
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
            this._emitDotCrumbs(args.x, args.y);
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

    _emitDotCrumbs(xorig, yorig) {
        for (let count = 0; count < 4; count++) {
            let {x, y, ttl, xenergy, yenergy} = generateRandomValues(
                xorig-4, xorig+4,
                yorig-4, yorig+4,
                500,
                -2, 2,
                -2, 2
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

function generateRandomValues(
    xmin, xmax,
    ymin, ymax,
    ttlmax,
    xminenergy, xmaxenergy,
    yminenergy, ymaxenergy
) {
    let x = (Math.random() * (xmax - xmin)) + xmin;
    let y = (Math.random() * (ymax - ymin)) + ymin;
    let ttl = Math.random() * ttlmax;
    let xenergy = (Math.random() * (xmaxenergy - xminenergy)) + xminenergy;
    let yenergy = (Math.random() * (ymaxenergy - yminenergy)) + yminenergy;

    return {
        x: x,
        y: y,
        ttl: ttl,
        xenergy: xenergy,
        yenergy: yenergy
    }
}