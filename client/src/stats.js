'use strict';

const
    eventBus = require('./event-bus');

class EntityStats {

    constructor() {
        this.round = [];

        for (let idx = 0; idx < 5; idx++) { // TODO: Magic number 5
            let stats = {
                kills: 0,
                deaths: 0
            };
            this.round.push(stats);
        }
    }

    incrementKills(roundNumber) {
        this.round[roundNumber].kills += 1;
    }

    incrementDeaths(roundNumber) {
        this.round[roundNumber].deaths += 1;
    }
}

class Stats {

    constructor() {
        eventBus.register('event.action.death.ghost', this._ghostDeathListener);

        this.entityStats = new Map();
        this.entityStats.set('pacman', new EntityStats());
        this.entityStats.set('blinky', new EntityStats());
        this.entityStats.set('pinky', new EntityStats());
        this.entityStats.set('inky', new EntityStats());
        this.entityStats.set('clyde', new EntityStats());

        this._currentRound = 0;
    }

    start() {
        this._levelChangeListener = (args) => {
            this._currentRound = args.levelNumber;
        };
        eventBus.register('event.level.start', this._levelChangeListener);

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
        // TODO: unregister events listeners
    }

    _handlePacmanDeath(ghostName) {
        let pacmanStats = this.entityStats.get('pacman');
        pacmanStats.incrementDeaths(this._currentRound);

        let ghostStats = this.entityStats.get(ghostName);
        ghostStats.incrementKills(this._currentRound);
    }

    _handleGhostDeath(ghostName) {
        let pacmanStats = this.entityStats.get('pacman');
        pacmanStats.incrementKills(this._currentRound);

        let ghostStats = this.entityStats.get(ghostName);
        ghostStats.incrementDeaths(this._currentRound);
    }
}

let stats = new Stats();
module.exports = stats;