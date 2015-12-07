'use strict';

const
    RELOAD_KEY = 'safari-reload-193289123',
    WAIT_TIME = 100; // Does it matter how long to wait?

/**
 * Safari desktop audio is being dumb and won't play until a second page loads an audio file within a session.
 * Uses browser detection: http://stackoverflow.com/a/23522755
 */
exports.check = function () {
    let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
        if (navigator.cookieEnabled === false) {
            showError(1);
        } else {
            if (sessionStorage !== undefined && sessionStorage.getItem(RELOAD_KEY) !== 'y') {
                sessionStorage.setItem(RELOAD_KEY, 'y');
                if (sessionStorage.getItem(RELOAD_KEY) === 'y') {
                    setTimeout(() => { document.location.reload(false); }, WAIT_TIME);
                } else {
                    showError(2);
                }
            } else {
                showError(3);
            }
        }
    }
};

function showError(code) {
    console.error('Cannot set Safari reload key - sound might not work until reloaded manually: ' + code);
}