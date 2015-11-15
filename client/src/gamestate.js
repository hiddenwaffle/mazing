'use strict';

const Constants = require('./constants');
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

        this._elapsedGhostMode = 0;
        this._lastStep = Date.now();

        this._isFrightened = false;
        this._frightStartMark = null;

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
        if (this._isFrightened == false) {
            let elapsed;
            if (this._lastStep === 0) {
                elapsed = 1;
            } else {
                elapsed = Date.now() - this._lastStep;
                if (elapsed > 1000) {
                    elapsed = 1000; // enforce speed limit
                }
            }
            this._stepGhostMode(elapsed);
        }

        this._seeIfStillFrightened();
    }

    /**
     * See _seeIfStillFrightened() for more information.
     */
    signalFrightened() {
        let [levelSpecification, , speedGroup] = this._determineCurrentConfiguration();

        for (let ghost of characters.ghosts) {
            ghost.reverseNeeded = true;
            ghost.speed = Constants.topSpeed * speedGroup.ghostFright;
        }

        characters.pacman.speed = Constants.topSpeed * speedGroup.pacmanFright;
        this._isFrightened = true;
        this._frightStartMark = Date.now();
    }

    _determineCurrentConfiguration() {
        let levelSpecification = this._levelSpecifications[this._levelIndex];
        let ghostMode = this._ghostModes[levelSpecification.ghostModeIndex];
        let speedGroup = this._speedGroups[levelSpecification.speedGroupIndex];

        return [levelSpecification, ghostMode, speedGroup];
    }

    /**
     * See if it is time to change the ghosts' mode from scatter <-> chase
     * @private
     */
    _stepGhostMode(elapsed) {
        this._lastStep = Date.now();
        this._elapsedGhostMode += elapsed;

        if (this._onTheFinalGhostModeSubConfig() == false) {
            let currentGhostMode = this._determineCurrentGhostMode();

            if (this._elapsedGhostMode >= currentGhostMode.time) {
                this._ghostModeSubConfigIndex++;
                let newGhostMode = this._determineCurrentGhostMode();

                for (let ghost of characters.ghosts) {
                    ghost.mode = newGhostMode.mode;
                    ghost.reverseNeeded = true;
                }

                this._elapsedGhostMode = 0;
            }
        }
    }

    /**
     * Determine if the ghosts are frightened and if so, see if the fright timer has run out.
     * @private
     */
    _seeIfStillFrightened() {
        if (this._isFrightened) {
            let elapsed = Date.now() - this._frightStartMark;
            let [levelSpecification, , speedGroup] = this._determineCurrentConfiguration();

            if (elapsed >= levelSpecification.frightTime) {
                for (let ghost of characters.ghosts) {
                    ghost.speed = Constants.topSpeed * speedGroup.ghostNormal;
                }

                characters.pacman.speed = Constants.topSpeed * speedGroup.pacmanNormal;
                this._isFrightened = false;
                this._frightStartMark = null;

            }
        }
    }

    /**
     * @returns {boolean} true if the current ghost mode is the last one of mode configuration
     * @private
     */
    _onTheFinalGhostModeSubConfig() {
        return this._ghostModeSubConfigIndex >= this._ghostModes[this._ghostModeConfigIndex].length - 1;
    }

    _determineCurrentGhostMode() {
        return this._ghostModes[this._ghostModeConfigIndex][this._ghostModeSubConfigIndex];
    }
}

let gameState = new GameState();
module.exports = gameState;