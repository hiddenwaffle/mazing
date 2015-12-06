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

        this._survivalistRow = new Row(this._gfx, 'Survivalist');
        this._survivalistRow.y = 108;

        this._hotDogChampionRow = new Row(this._gfx, 'Hot Dog Champion');
        this._hotDogChampionRow.y = 108 + 42;

        this._flavorOfTheWeakRow = new Row(this._gfx, 'Flavor of the Weak');
        this._flavorOfTheWeakRow.y = 108 + 42 + 42;
    }

    start() {
        let survivalist = stats.calculateHighestAverageRatio();
        this._survivalistRow.awardIcon(survivalist.name);
        this._survivalistRow.notes = survivalist.ratio.toFixed(2) + ' Avg Ratio';

        let hotDogChampion = stats.calculateHighestKills();
        this._hotDogChampionRow.awardIcon(hotDogChampion.name);
        this._hotDogChampionRow.notes = 'Ate ' + hotDogChampion.kills + ' Snacks';

        let flavorOfTheWeak = stats.calculateHighestDeaths();
        this._flavorOfTheWeakRow.awardIcon(flavorOfTheWeak.name);
        this._flavorOfTheWeakRow.notes = 'Eaten ' + flavorOfTheWeak.deaths + ' Times';

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