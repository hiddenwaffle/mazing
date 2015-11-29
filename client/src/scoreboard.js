'use strict';

const
    eventBus    = require('./event-bus'),
    Util        = require('./util');

const
    HEADER_Y = 10,
    ROW_Y_OFFSET = 25,
    RATIO_COLUMN_X = 35,
    KILLS_COLUMN_X = 90,
    DEATHS_COLUMN_X = 145;

class Scoreboard {

    constructor(stage) {
        this._stage = stage;

        this._gfx = new PIXI.Container();
        this._gfx.x = 540;
        this._gfx.y = 350;
        stage.addChild(this._gfx);

        this._textStyle = {
            font: '14px Arial',
            fill: '#eeeeee',
            align: 'center' // TODO: Not working?
        };

        this._headerRatio = new PIXI.Text('Ratio', this._textStyle);
        this._headerRatio.x = RATIO_COLUMN_X;
        this._headerRatio.y = HEADER_Y;
        this._gfx.addChild(this._headerRatio);

        this._headerKills = new PIXI.Text('Eater', this._textStyle);
        this._headerKills.x = KILLS_COLUMN_X;
        this._headerKills.y = HEADER_Y;
        this._gfx.addChild(this._headerKills);

        this._headerDeaths= new PIXI.Text('Eaten', this._textStyle);
        this._headerDeaths.x = DEATHS_COLUMN_X;
        this._headerDeaths.y = HEADER_Y;
        this._gfx.addChild(this._headerDeaths);

        this._rows = [];
        this._rows.push(this._createRow(0, 'pacman',    createPacmanIcon()));
        this._rows.push(this._createRow(1, 'blinky',    createGhostIcon('red')));
        this._rows.push(this._createRow(2, 'pinky',     createGhostIcon('pink')));
        this._rows.push(this._createRow(3, 'inky',      createGhostIcon('blue')));
        this._rows.push(this._createRow(4, 'clyde',     createGhostIcon('orange')));
    }

    start() {
        this._pacmanDeathListener = (args) => {
            this._handlePacmanDeath(args.ghostName);
        };
        eventBus.register('event.action.death.pacman', this._pacmanDeathListener);

        this._ghostDeathListener = (args) => {
            this._handleGhostDeath(args.ghostName);
        };
        eventBus.register('event.action.death.ghost', this._ghostDeathListener);
    }

    stop() {
        eventBus.unregister('event.action.death.pacman', this._pacmanDeathListener);
        eventBus.unregister('event.action.death.ghost', this._ghostDeathListener);

        // Clean up after graphics
        let idx = this._stage.getChildIndex(this._gfx);
        this._stage.removeChildAt(idx);
        this._gfx.destroy();
    }

    _createRow(idx, name, icon) {
        let row = new Row(name, this._gfx, this._textStyle, icon);
        row.y = calculateRowY(idx);

        return row;
    }

    _handlePacmanDeath(ghostName) {
        for (let row of this._rows) {
            if (row.name === 'pacman') {
                row.incrementDeaths();

            } else if (row.name === ghostName) {
                row.incrementKills();
            }
        }

        this._resortRows();
    }

    _handleGhostDeath(ghostName) {
        for (let row of this._rows) {
            if (row.name === 'pacman') {
                row.incrementKills();

            } else if (row.name === ghostName) {
                row.incrementDeaths();
            }
        }

        this._resortRows();
    }

    _resortRows() {
        this._rows.sort(sortByStanding);

        // TODO: Animate this
        for (let idx = 0; idx < this._rows.length; idx++) {
            let row = this._rows[idx];
            row.y = calculateRowY(idx);
        }
    }
}

module.exports = Scoreboard;

class Row {

    constructor(name, parentGfx, textStyle, icon) {
        this._name = name;
        this._parentGfx = parentGfx;

        this._gfx = new PIXI.Container();
        this._parentGfx.addChild(this._gfx);

        this._ratioGfx = new PIXI.Text('', textStyle);
        this._ratioGfx.x = RATIO_COLUMN_X;
        this._gfx.addChild(this._ratioGfx);

        this._kills = 0;
        this._killsGfx = new PIXI.Text('', textStyle);
        this._killsGfx.x = KILLS_COLUMN_X;
        this._gfx.addChild(this._killsGfx);

        this._deaths = 0;
        this._deathsGfx = new PIXI.Text('', textStyle);
        this._deathsGfx.x = DEATHS_COLUMN_X;
        this._gfx.addChild(this._deathsGfx);

        this._gfx.addChild(icon);
    }

    incrementKills() {
        this._kills += 1;
        this._killsGfx.text = this._kills;
        this._updateRatioGfx();
    }

    incrementDeaths() {
        this._deaths += 1;
        this._deathsGfx.text = this._deaths;
        this._updateRatioGfx();
    }

    get name() {
        return this._name;
    }

    /**
     * @returns {number} K/D, Number.MAX_SAFE_INTEGER means zero deaths
     */
    get ratio() {
        if (this._deaths !== 0) {
            return this._kills / this._deaths;
        } else {
            return Number.MAX_SAFE_INTEGER;
        }
    }

    get kills() {
        return this._kills;
    }

    get deaths() {
        return this._deaths;
    }

    set y(value) {
        this._gfx.y = value;
    }

    _updateRatioGfx() {
        let ratio = this.ratio;
        if (ratio !== Number.MAX_SAFE_INTEGER) { // means zero deaths
            this._ratioGfx.text = ratio.toFixed(2);
        }
    }
}

function createPacmanIcon() {
    let texture = PIXI.Texture.fromFrame('pacman2.png');
    let pacmanIcon = new PIXI.Sprite(texture);
    pacmanIcon.scale.x = 0.5;
    pacmanIcon.scale.y = 0.5;

    return pacmanIcon;
}

function createGhostIcon(color) {
    let texture = PIXI.Texture.fromFrame('ghost-green-right1.png');
    let ghostIcon = new PIXI.Sprite(texture);
    ghostIcon.scale.x = 0.5;
    ghostIcon.scale.y = 0.5;

    let colorMatrix = new PIXI.filters.ColorMatrixFilter();
    colorMatrix.matrix = Util.generateColorMatrixValue(color);
    ghostIcon.filters = [colorMatrix];

    return ghostIcon;
}

function calculateRowY(idx) {
    return HEADER_Y + ((idx + 1) * ROW_Y_OFFSET);
}

Window.testThing = function() {
    let array = [
        { name: 'pacman',  ratio:                       0, kills: 0, deaths:  1 },
        { name: 'blinky',  ratio: Number.MAX_SAFE_INTEGER, kills: 2, deaths:  0 },
        { name: 'inky  ',  ratio: Number.MAX_SAFE_INTEGER, kills: 0, deaths:  0 },
        { name: 'clyde ',  ratio: Number.MAX_SAFE_INTEGER, kills: 0, deaths:  0 },
        { name: 'pinky ',  ratio: Number.MAX_SAFE_INTEGER, kills: 1, deaths:  0 },
    ];

    array.sort(sortByStanding);

    for (let e of array) {
        console.log(e.name + ' ' + e.ratio + ' ' + e.kills + ' ' + e.deaths);
    }
};

/**
 * Sort by highest ratio first, most kills second, fewest deaths last.
 * Any rows without Ks or Ds should appear last.
 */
function sortByStanding(a, b) {
    let aRatio, bRatio;

    if (a.kills === 0 && a.deaths === 0) {
        aRatio = -1;
    } else {
        aRatio = a.ratio;
    }

    if (b.kills === 0 && b.deaths === 0) {
        bRatio = -1;
    } else {
        bRatio = b.ratio;
    }

    if (aRatio !== bRatio) {
        return bRatio - aRatio;
    } else {
        if (a.kills !== b.kills) {
            return b.kills - a.kills;
        } else {
            return a.deaths - b.deaths;
        }
    }
}