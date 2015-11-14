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

        this._levelSpecifications = [
            // level 1
            {
                bonusSymbol: 'cherries',
                bonusPoints: 100,
                ghostModeIndex: 0, // first configuration
                speedGroupIndex: 0, // first configuration
                frightTime: 6000,
                frightFlashes: 5,
                elroy1DotsLeft: 20,
                elroy2DotsLeft: 10
            },
            // level 2
            {
                bonusSymbol: 'strawberry',
                bonusPoints: 300,
                ghostModeIndex: 1, // second configuration
                speedGroupIndex: 1, // second configuration
                frightTime: 5000,
                frightFlashes: 5,
                elroy1DotsLeft: 30,
                elroy2DotsLeft: 15
            }
            // TODO: More levels
        ];

        this._levelIndex = 0;

        this._currentGhostModeMark = Date.now();

        this._ghostModeConfigIndex = 0;
        this._ghostModeSubConfigIndex = 0;
    }

    startLevel(levelIndex) {
        this._levelIndex = levelIndex;

        let [, , speedGroup] = this._determineCurrentConfiguration();
        characters.manager.changeSpeed(speedGroup.pacmanNormal, speedGroup.ghostNormal);

        // TODO: Other start level stuff
    }

    step() {
        this._stepGhostMode();
    }

    signalFrightened() {
        for (let ghost of characters.ghosts) {
            ghost.reverseNeeded = true;
        }
    }

    _determineCurrentConfiguration() {
        let levelSpecification = this._levelSpecifications[this._levelIndex];
        let ghostMode = this._ghostModes[levelSpecification.ghostModeIndex];
        let speedGroup = this._speedGroups[levelSpecification.speedGroupIndex];

        return [levelSpecification, ghostMode, speedGroup];
    }

    /**
     * TOOD: This needs to pause when ghosts are frightened and keep track of fright time
     * Probably can do that by adding time to a elapsedGhostMode rather than calculating each time
     *
     * @private
     */
    _stepGhostMode() {
        if (this._onTheFinalGhostModeSubConfig() == false) {
            let currentGhostMode = this._determineCurrentGhostMode();
            let elapsedGhostMode = Date.now() - this._currentGhostModeMark;
            if (elapsedGhostMode >= currentGhostMode.time) {
                this._ghostModeSubConfigIndex++;
                let newGhostMode = this._determineCurrentGhostMode();

                for (let ghost of characters.ghosts) {
                    ghost.mode = newGhostMode.mode;
                    ghost.reverseNeeded = true;
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