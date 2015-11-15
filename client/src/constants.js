let constants = {
    wallSize:   16,         // must be even
    dotSize:    4,          // must be even
    topSpeed:   0.16,       // px/ms (might try 0.19375)

    init: function() {
        this.startpacmanx = 13 * this.wallSize + Math.floor(this.wallSize / 2);
        this.startpacmany = 23 * this.wallSize;

        this.startghostx = 13 * this.wallSize + Math.floor(this.wallSize / 2);
        this.startghosty = 11 * this.wallSize;
    }
};

constants.init();
module.exports = constants;