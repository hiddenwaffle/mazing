'use strict';

const
    config = require('./config');

class GhostDeath {

    constructor(ghost) {
        this._ghost = ghost;
    }

    start() {
        this._ghost.removeFrightIfAny();
        this._ghost.solid = false;
        this._ghost.visible = false;
    }

    respawn() {
        this._ghost.solid = true;
        this._ghost.visible = true;
        this._ghost.x = config.startghostx;
        this._ghost.y = config.startghosty;
    }
}

class PacmanDeath {

    constructor(pacman, ghosts, board) {
        this._pacman = pacman;
        this._ghosts = ghosts;
        this._board = board;
    }

    start() {
        this._pacman.removeFrightIfAny();
        this._pacman.solid = false;
        this._pacman.visible = false;
    }

    respawn() {
        this._pacman.solid = true;
        this._pacman.visible = true;

        let respawnx = config.startpacmanx;
        let respawny = config.startpacmany;

        // TODO: Determine best spawn point based on ghost locations and remaining dot locations

        this._pacman.x = respawnx;
        this._pacman.y = respawny;
    }
}

exports.Ghost = GhostDeath;
exports.Pacman = PacmanDeath;