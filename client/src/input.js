const pacman = require('./characters').pacman;

exports.start = function() {
    window.addEventListener('keydown', function (e) {
        switch (e.keyCode) {
            case 37: // left
                pacman.requestedDirection = 'left';
                e.preventDefault();
                break;
            case 38: // up
                pacman.requestedDirection = 'up';
                e.preventDefault();
                break;
            case 39: // right
                pacman.requestedDirection = 'right';
                e.preventDefault();
                break;
            case 40: // down
                pacman.requestedDirection = 'down';
                e.preventDefault();
                break;
            case 32: // space
            case 27: // escape
                // TODO: Pause the game
                e.preventDefault();
                break;
            default:
                // do nothing
                break;
        }
    });
};