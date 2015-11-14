'use strict';

const characters = require('./characters');

class GameState {

    constructor() {

        this._ghostModes = [
            // first configuration (first level)
            [
                {mode: 'scatter', time: 7000},
                {mode: 'chase', time: 20000},
                {mode: 'scatter', time: 7000},
                {mode: 'chase', time: 20000},
                {mode: 'scatter', time: 5000},
                {mode: 'chase', time: 20000},
                {mode: 'scatter', time: 5000},
                {mode: 'chase', time: Number.MAX_SAFE_INTEGER} // indefinite
            ],
            // second configuration (levels 2-4)
            [
                {mode: 'scatter', time: 7000},
                {mode: 'chase', time: 20000},
                {mode: 'scatter', time: 7000},
                {mode: 'chase', time: 20000},
                {mode: 'scatter', time: 5000},
                {mode: 'chase', time: 1033000},
                {mode: 'scatter', time: 16},
                {mode: 'chase', time: Number.MAX_SAFE_INTEGER} // indefinite
            ],
            // third configuration (levels 5+)
            [
                {mode: 'scatter', time: 5000},
                {mode: 'chase', time: 20000},
                {mode: 'scatter', time: 5000},
                {mode: 'chase', time: 20000},
                {mode: 'scatter', time: 5000},
                {mode: 'chase', time: 1037000},
                {mode: 'scatter', time: 16},
                {mode: 'chase', time: Number.MAX_SAFE_INTEGER} // indefinite
            ]
        ];

        this._speedGroups = [
            // first configuration (first level)
            {
                pacmanNormal:       0.8,
                pacmanFright:       0.9,
                ghostNormal:        0.75,
                ghostFright:        0.5,
                ghostTunnel:        0.4
            },
            // second configuration (levels 2-4)
            {
                pacmanNormal:       0.9,
                pacmanFright:       0.95,
                ghostNormal:        0.85,
                ghostFright:        0.55,
                ghostTunnel:        0.45
            },
            // third configuration (levels 5-20)
            {
                pacmanNormal:       1.0,
                pacmanFright:       1.0,
                ghostNormal:        0.95,
                ghostFright:        0.6,
                ghostTunnel:        0.5
            },
            // fourth configuration (levels 21+)
            {
                pacmanNormal:       1.0,
                pacmanFright:       1.0,
                ghostNormal:        0.95,
                ghostFright:        0.6,
                ghostTunnel:        0.5
            }
        ];

        this._level = 0;

        this._currentGhostModeMark = Date.now();

        this._ghostModeConfigIndex = 0;
        this._ghostModeSubConfigIndex = 0;

        this._speedGroupTimer = 0;
        this._speedGroupIndex = 0;
    }

    step() {
        this._stepGhostMode();
    }

    signalFrightened() {
        console.log('ghosts should become frightened and reverse direction on next tile');
    }

    _stepGhostMode() {
        if (this._onTheFinalGhostModeSubConfig() == false) {
            let currentGhostMode = this._determineCurrentGhostMode();
            let elapsedGhostMode = Date.now() - this._currentGhostModeMark;
            if (elapsedGhostMode >= currentGhostMode.time) {
                this._ghostModeSubConfigIndex++;
                let newGhostMode = this._determineCurrentGhostMode();

                for (let ghost of characters.ghosts) {
                    ghost.mode = newGhostMode.mode;
                }

                this._currentGhostModeMark = Date.now();
            }
        }
    }

    _onTheFinalGhostModeSubConfig() {
        return this._ghostModeSubConfigIndex >= this._ghostModes[this._ghostModeConfigIndex].length - 1;
    }

    _determineCurrentGhostMode() {
        return this._ghostModes[this._ghostModeConfigIndex][this._ghostModeSubConfigIndex];
    }
}

let gameState = new GameState();
module.exports = gameState;