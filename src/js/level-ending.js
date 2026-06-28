import { Container, Graphics, Text } from 'pixi.js';
import eventBus from './event-bus';
import config from './config';
import * as Util from './util';

const FADE_TIME = 500; // ms for the dialog to fade in

const PANEL_W = 390;
const PANEL_H = 320;

// Column layout inside the panel.
const ICON_X = 70;
const RATIO_X = 110;
const EATER_X = 215;
const EATEN_X = 300;
const HEADER_Y = 104;
const ROW_Y = 134;
const ROW_STEP = 26;

class LevelEnding {

    constructor(stage, input) {
        this._stage = stage;
        this._input = input;

        this._fadeTimeLeft = 0;
        this._ready = false;
        this._standingNodes = [];

        // Full-screen dim behind the dialog (a real modal backdrop instead of a
        // blurred render-texture snapshot).
        this._backdrop = new Graphics();
        this._backdrop.rect(0, 0, 800, 600).fill({ color: 0x000000, alpha: 1 });
        this._backdrop.zIndex = 9;
        this._backdrop.visible = false;
        this._stage.addChild(this._backdrop);

        this._gfx = new Container();
        this._gfx.zIndex = 10;
        this._gfx.x = (800 - PANEL_W) / 2;
        this._gfx.y = 96;
        this._gfx.visible = false;
        this._stage.addChild(this._gfx);

        // Panel: lighter than the game background so it reads as a dialog.
        let background = new Graphics();
        background
            .rect(0, 0, PANEL_W, PANEL_H)
            .fill({ color: 0x3d3d3d, alpha: 1 })
            .stroke({ width: 2, color: 0x666666, alpha: 1 });
        this._gfx.addChild(background);

        this._title = new Text({
            text: '',
            style: { fontFamily: 'Arial', fontSize: 28, fill: '#eeeeee', align: 'center' }
        });
        this._title.anchor.set(0.5, 0);
        this._title.x = PANEL_W / 2;
        this._title.y = 34;
        this._gfx.addChild(this._title);

        this._footer = new Text({
            text: '',
            style: { fontFamily: 'Arial', fontSize: 16, fill: '#e0e0e0', align: 'center' }
        });
        this._footer.anchor.set(0.5, 0);
        this._footer.x = PANEL_W / 2;
        this._footer.y = 280;
        this._gfx.addChild(this._footer);

        this._scoreboard = null;
    }

    start(levelNumber) {
        this._levelNumber = levelNumber;
        this._title.text = 'Level ' + (levelNumber + 1) + ' Final Score';
        this._updateFooter(levelNumber);

        // Render this level's standings fresh (the live scoreboard is still
        // alive at this point; the game tears the level down right after).
        this._renderStandings();

        this._backdrop.alpha = 0;
        this._backdrop.visible = true;
        this._gfx.alpha = 0;
        this._gfx.visible = true;
        this._fadeTimeLeft = FADE_TIME;
        this._ready = false;
    }

    step(elapsed) {
        if (this._fadeTimeLeft > 0) {
            this._fadeTimeLeft -= elapsed;
            let progress = Math.min(1, 1 - (this._fadeTimeLeft / FADE_TIME));
            this._gfx.alpha = progress;
            this._backdrop.alpha = progress * 0.55;

            if (this._fadeTimeLeft <= 0) {
                this._fadeTimeLeft = 0;
                this._gfx.alpha = 1;
                this._backdrop.alpha = 0.55;
                this._ready = true;
            }
        }

        if (this._ready && this._input.isAnyKeyDownAndUnhandled()) {
            this._stop();
        }
    }

    set scoreboard(value) {
        this._scoreboard = value;
    }

    _renderStandings() {
        let standings = this._scoreboard ? this._scoreboard.getStandings() : [];

        let headerStyle = { fontFamily: 'Arial', fontSize: 14, fill: '#bbbbbb' };
        for (let [label, x] of [['Ratio', RATIO_X], ['Eater', EATER_X], ['Eaten', EATEN_X]]) {
            let header = new Text({ text: label, style: headerStyle });
            header.x = x;
            header.y = HEADER_Y;
            this._gfx.addChild(header);
            this._standingNodes.push(header);
        }

        let rowStyle = { fontFamily: 'Arial', fontSize: 16, fill: '#eeeeee' };
        standings.forEach((standing, idx) => {
            let y = ROW_Y + (idx * ROW_STEP);

            let icon = createIconFor(standing.name);
            icon.x = ICON_X;
            icon.y = y - 1;
            this._gfx.addChild(icon);
            this._standingNodes.push(icon);

            this._addColumn(standing.ratioText, RATIO_X, y, rowStyle);
            this._addColumn(String(standing.kills), EATER_X, y, rowStyle);
            this._addColumn(String(standing.deaths), EATEN_X, y, rowStyle);
        });
    }

    _addColumn(text, x, y, style) {
        let node = new Text({ text: text, style: style });
        node.x = x;
        node.y = y;
        this._gfx.addChild(node);
        this._standingNodes.push(node);
    }

    _stop() {
        this._gfx.visible = false;
        this._backdrop.visible = false;
        this._ready = false;

        for (let node of this._standingNodes) {
            this._gfx.removeChild(node);
            node.destroy();
        }
        this._standingNodes = [];

        if (this._isFinalLevel()) {
            eventBus.fire({ name: 'event.level.ending.lastlevel' });
        } else {
            eventBus.fire({ name: 'event.level.ending.readyfornext' });
        }
    }

    _isFinalLevel() {
        return this._levelNumber === config.lastLevelIndex();
    }

    _updateFooter(levelNumber) {
        let value;

        if (this._isFinalLevel()) {
            value = '';
        } else {
            let remaining = config.levelSpecifications.length - (levelNumber + 1);
            if (remaining === 1) {
                value = 'The final level remains...';
            } else {
                value = remaining + ' more levels remain...';
            }
        }

        this._footer.text = value;
    }
}

export default LevelEnding;

function createIconFor(name) {
    switch (name) {
        case 'pacman': return Util.createPacmanIcon(0.5);
        case 'blinky': return Util.createGhostIcon('red', 0.5);
        case 'pinky':  return Util.createGhostIcon('pink', 0.5);
        case 'inky':   return Util.createGhostIcon('blue', 0.5);
        case 'clyde':  return Util.createGhostIcon('orange', 0.5);
        default:       return Util.createGhostIcon('green', 0.5);
    }
}
