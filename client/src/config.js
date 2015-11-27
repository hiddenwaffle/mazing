'use strict';

class Config {

    constructor() {
        this.wallSize   = 16;   // must be even
        this.dotSize    = 4;    // must be even

        this.startpacmanx = 13 * this.wallSize + (this.wallSize / 2);
        this.startpacmany = 23 * this.wallSize;

        this.startghostx = 13 * this.wallSize + (this.wallSize / 2);
        this.startghosty = 11 * this.wallSize;

        this.topSpeed = 0.16;

        this.flashSpeed = 250; // ms wait for each frame

        this.ghostModes = [
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

        this.speedGroups = [
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

        this.levelSpecifications = [
            // level 1
            {
                bonusSymbol: 'cherries',
                bonusPoints: 100,
                ghostMode: this.ghostModes[0],      // first configuration
                speedGroup: this.speedGroups[0],    // first configuration
                frightTime: 6000,
                frightFlashes: 5,
                elroy1DotsLeft: 20,
                elroy2DotsLeft: 10
            },
            // level 2
            {
                bonusSymbol: 'strawberry',
                bonusPoints: 300,
                ghostMode: this.ghostModes[1],      // second configuration
                speedGroup: this.speedGroups[1],    // second configuration
                frightTime: 5000,
                frightFlashes: 5,
                elroy1DotsLeft: 30,
                elroy2DotsLeft: 15
            },
            // level 3
            {
                bonusSymbol: 'peach',
                bonusPoints: 500,
                ghostMode: this.ghostModes[1],      // second configuration
                speedGroup: this.speedGroups[1],    // second configuration
                frightTime: 4000,
                frightFlashes: 5,
                elroy1DotsLeft: 40,
                elroy2DotsLeft: 20
            },
            // level 4
            {
                bonusSymbol: 'peach',
                bonusPoints: 500,
                ghostMode: this.ghostModes[1],      // second configuration
                speedGroup: this.speedGroups[1],    // second configuration
                frightTime: 3000,
                frightFlashes: 5,
                elroy1DotsLeft: 40,
                elroy2DotsLeft: 20
            },
            // level 5
            {
                bonusSymbol: 'apple',
                bonusPoints: 700,
                ghostMode: this.ghostModes[2],      // third configuration
                speedGroup: this.speedGroups[2],    // third configuration
                frightTime: 2000,
                frightFlashes: 5,
                elroy1DotsLeft: 40,
                elroy2DotsLeft: 20
            }
        ];
    }
}

let config = new Config();
module.exports = config;