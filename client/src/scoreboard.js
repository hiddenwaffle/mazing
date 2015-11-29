'use strict';

const
    Util = require('./util');

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
        //
    }

    stop() {
        // TODO: Remove and destroy graphics?
    }

    _createRow(idx, name, icon) {
        let row = new Row(name, this._gfx, this._textStyle, icon);
        row.y = HEADER_Y + ((idx + 1) * ROW_Y_OFFSET);
    }
}

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

    reset() {
        this._kills = 0;
        this._killsGfx.text = '';

        this._deaths = 0;
        this._deathsGfx.text = '';
    }

    incrementKills() {
        this._kills += 1;
        this._killsGfx.text = this._kills;
    }

    decrementKills() {
        this._deaths += 1;
        this._deathsGfx.text = this._deaths;
    }

    get name() {
        return this._name;
    }

    /**
     * @returns {number} K/D, -1 means zero deaths
     */
    get ratio() {
        if (this._deaths !== 0) {
            return this._kills / this._deaths;
        } else {
            return -1;
        }
    }

    set y(value) {
        this._gfx.y = value;
    }
}

module.exports = Scoreboard;

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