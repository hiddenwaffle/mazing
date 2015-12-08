'use strict';

class LoadingScreen {

    constructor() {
        this._container = document.getElementById('loading');
    }

    signalLoaded(message) {
        if (this._container !== undefined) {
            let div = document.createElement('div');
            div.textContent = message;
            this._container.appendChild(div);
        }
    }

    signalPreloadComplete() {
        if (this._container !== undefined) {
            this._container.outerHTML = "";
            delete this._container;
        }
    }
}

module.exports = LoadingScreen;