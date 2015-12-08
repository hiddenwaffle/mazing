'use strict';

const
    config      = require('./config'),
    eventBus    = require('./event-bus');

class EntityStats {

    constructor(name) {
        this._name = name;
        this._rounds = [];

        for (let idx = 0; idx < config.levelSpecifications.length; idx++) {
            let stats = {
                kills: 0,
                deaths: 0
            };
            this._rounds.push(stats);
        }
    }

    incrementKills(roundNumber) {
        this._rounds[roundNumber].kills += 1;
    }

    incrementDeaths(roundNumber) {
        this._rounds[roundNumber].deaths += 1;
    }

    calculateAverageRatio() {
        let acc = 0;
        for (let round of this._rounds) {
            let kills = round.kills;

            let deaths;
            if (round.deaths === 0) {
                deaths = 1; // TODO: not really sure of a good way to do it otherwise
            } else {
                deaths = round.deaths;
            }

            acc += kills / deaths;
        }

        let averageRatio = acc / this._rounds.length;

        return averageRatio;
    }

    calculateTotalKills() {
        return this._rounds.reduce((acc, stats) => {
            return acc + stats.kills;
        }, 0);
    }

    calculateTotalDeaths() {
        return this._rounds.reduce((acc, stats) => {
            return acc + stats.deaths;
        }, 0);
    }

    get name() {
        return this._name;
    }
}

class Stats {

    constructor() {
        this.entityStats = new Map();
        this.entityStats.set('pacman', new EntityStats('pacman'));
        this.entityStats.set('blinky', new EntityStats('blinky'));
        this.entityStats.set('pinky', new EntityStats('pinky'));
        this.entityStats.set('inky', new EntityStats('inky'));
        this.entityStats.set('clyde', new EntityStats('clyde'));

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

    calculateHighestAverageRatio() {
        let stats = this._entityStatsToArray();
        let highest = stats.reduce((prev, curr) => {
            if (prev.calculateAverageRatio() > curr.calculateAverageRatio()) {
                return prev;
            } else {
                return curr;
            }
        }, stats[0]);

        return {
            name: highest.name,
            ratio: highest.calculateAverageRatio()
        };
    }

    calculateHighestKills() {
        let stats = this._entityStatsToArray();
        let highest = stats.reduce((prev, curr) => {
            if (prev.calculateTotalKills() > curr.calculateTotalKills()) {
                return prev;
            } else {
                return curr;
            }
        }, stats[0]);

        return {
            name: highest.name,
            kills: highest.calculateTotalKills()
        };
    }

    calculateHighestDeaths() {
        let stats = this._entityStatsToArray();
        let highest = stats.reduce((prev, curr) => {
            if (prev.calculateTotalDeaths() > curr.calculateTotalDeaths()) {
                return prev;
            } else {
                return curr;
            }
        }, stats[0]);

        return {
            name: highest.name,
            deaths: highest.calculateTotalDeaths()
        }
    }

    _entityStatsToArray() {
        let values = [];
        for (let value of this.entityStats.values()) {
            values.push(value);
        }
        return values;
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