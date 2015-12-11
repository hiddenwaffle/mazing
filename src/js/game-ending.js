'use strict';

const
    Util        = require('./util');

const
    config      = require('./config'),
    eventBus    = require('./event-bus'),
    stats       = require('./stats');

class GameEnding {

    constructor(stage) {
        this._stage = stage;

        this._gfx = new PIXI.Container();
        this._gfx.z = 11; // custom property
        this._gfx.x = 200;
        this._gfx.y = 140;
        this._gfx.visible = false;
        this._stage.addChild(this._gfx);

        let background = new PIXI.Graphics();
        background.beginFill(0x444444, 1);
        background.drawRect(0, 0, 400, 310);
        this._gfx.addChild(background);

        let textStyle = {
            font: '36px Arial',
            fill: '#eeeeee'
        };
        let title = new PIXI.Text('End of Game', textStyle);
        title.x = 96;
        title.y = 28;
        this._gfx.addChild(title);

        this._playerRow = new Row(this._gfx, "Player Avg Ratio");
        this._playerRow.y = 108;

        this._ghostsRow = new Row(this._gfx, 'Top Ghost Avg Ratio');
        this._ghostsRow.y = 108 + 42;

        this._developerRow = new Row(this._gfx, "Developer Best");
        this._developerRow.y = 108 + 42 + 42;
    }

    start() {
        let playerRatio = stats.calculatePlayerAverageRatio();
        this._playerRow.awardIcon('pacman');
        this._playerRow.notes = playerRatio.toFixed(2);

        let ghost = stats.calculateTopGhostAverageRatio();
        this._ghostsRow.awardIcon(ghost.name);
        this._ghostsRow.notes = ghost.ratio.toFixed(2);

        this._developerRow.awardIcon('reptile');
        this._developerRow.notes = '6.11     2015-12-10';

        this._gfx.visible = true;
    }

    step(elapsed) {
        //
    }
}

module.exports = GameEnding;

class Row {

    constructor(parentGfx, text) {
        this._parentGfx = parentGfx;

        this._gfx = new PIXI.Container();
        this._gfx.x = 40;
        this._parentGfx.addChild(this._gfx);

        this._iconContainer = new PIXI.Container();
        this._parentGfx.addChild(this._iconContainer);

        let textStyle = {
            font: '16px Arial',
            fill: '#eeeeee'
        };
        let textSprite = new PIXI.Text(text, textStyle);
        textSprite.x = 32 + 16;
        textSprite.y = 6;
        this._gfx.addChild(textSprite);

        let statsStyle = {
            font: '12px Arial',
            fill: '#ffffff'
        };
        this._statsSprite = new PIXI.Text('', statsStyle);
        this._statsSprite.x = 32 + 16 + 192;
        this._statsSprite.y = 8;
        this._gfx.addChild(this._statsSprite);
    }

    awardIcon(name) {
        let icon;

        switch (name) {
            case 'pacman':
                icon = Util.createPacmanIcon(1);
                break;
            case 'blinky':
                icon = Util.createGhostIcon('red', 1);
                break;
            case 'pinky':
                icon = Util.createGhostIcon('pink', 1);
                break;
            case 'inky':
                icon = Util.createGhostIcon('blue', 1);
                break;
            case 'clyde':
                icon = Util.createGhostIcon('orange', 1);
                break;
            case 'reptile':
                icon = Util.createGhostIcon('green', 1);
        }

        this._gfx.addChild(icon);
    }

    set notes(value) {
        this._statsSprite.text = value;
    }

    set y(value) {
        this._gfx.y = value;
    }
}