'use strict';

const
    config = require('./config'),
    Util = require('./util');

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

        this._deathx = -1;
        this._deathy = -1;
    }

    start() {
        this._pacman.removeFrightIfAny();
        this._pacman.solid = false;
        this._pacman.visible = false;

        this._deathx = this._pacman.x;
        this._deathy = this._pacman.y;
    }

    respawn() {
        this._pacman.solid = true;
        this._pacman.visible = true;

        let spawnPoint = determineSpawnPointViability(
            this._ghosts,
            this._deathx,
            this._deathy,
            this._board.respawnPoints
        );

        this._pacman.x = spawnPoint.x * config.wallSize;
        this._pacman.y = spawnPoint.y * config.wallSize;

        this._pacman.ensureRequestedDirectionActive();
    }
}

exports.Ghost = GhostDeath;
exports.Pacman = PacmanDeath;

/**
 * Determine best spawn point based on the ghosts' proximities.
 *
 * @param ghosts
 * @param idealx real coordinate
 * @param idealy real coordinate
 * @returns {*} a spawn point in tile space
 */
function determineSpawnPointViability(ghosts, idealx, idealy, respawnPoints) {

    let spawnPoints = [];
    for (let respawnPoint of respawnPoints) {
        let spawnPoint = {
            x: respawnPoint.x,
            y: respawnPoint.y,
            ghostCount: 0
        };
        spawnPoints.push(spawnPoint);
    }

    let sweepBoxRadius = 7; // means +/- these tiles in each direction

    // Count ghosts near each spawn point
    for (let ghost of ghosts) {
        for (let spawnPoint of spawnPoints) {
            if (ghostOverlap(spawnPoint, sweepBoxRadius, ghost)) {
                spawnPoint.ghostCount++;
            }
        }
    }

    // Sort spawn points by location to where pacman was
    spawnPoints.sort((a, b) => {
        let dista = Util.qs(idealx - a.x, idealy - a.y);
        let distb = Util.qs(idealx - b.x, idealy - b.y);
        return distb - dista;
    });

    // Pick nearest one with no ghosts
    let pickedSpawnPoint = null;
    for (let spawnPoint of spawnPoints) {
        if (spawnPoint.ghostCount === 0) {
            pickedSpawnPoint = spawnPoint;
            break;
        }
    }

    // If they all have ghosts, pick the closest one.
    // This is okay because there would not be a high concentration of ghosts in this case.
    if (pickedSpawnPoint === null) {
        pickedSpawnPoint = spawnPoints[0];
    }

    return pickedSpawnPoint;
}

function ghostOverlap(spawnPoint, sweepBoxRadius, ghost) {
    let x = spawnPoint.x * config.wallSize;
    let y = spawnPoint.y * config.wallSize;

    let ax1 = x - (sweepBoxRadius       * config.wallSize);
    let ay1 = y - (sweepBoxRadius       * config.wallSize);
    let ax2 = x + ((sweepBoxRadius+1)   * config.wallSize);
    let ay2 = y + ((sweepBoxRadius+1)   * config.wallSize);

    let bx1 = ghost.x;
    let by1 = ghost.y;
    let bx2 = ghost.x + ghost.width;
    let by2 = ghost.y + ghost.height;

    return Util.overlap(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2);
}