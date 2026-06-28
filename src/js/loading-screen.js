const
    EXPECTED_NUMBER_OF_CALLS = 8;

class LoadingScreen {

    constructor() {
        this._container = document.getElementById('loading');
        this._message = document.getElementById('loadingMessage');
        this._error = document.getElementById('loadingError');

        this._progress = document.getElementById('loadingBar');
        if (this._progress) {
            this._progress.setAttribute('max', EXPECTED_NUMBER_OF_CALLS);
        }

        this._loadedCount = 0;
        this._success = true;
    }

    signalLoaded(success, message) {
        if (this._container) {
            this._container.style.visibility = 'visible';

            this._loadedCount += 1;
            this._progress.setAttribute('value', this._loadedCount);

            if (success) {
                this._message.textContent = message;
            } else {
                this._success = false;
                let div = document.createElement('div');
                div.textContent = message; // OK to only have one visible error - console logs all of them.
                this._error.appendChild(div);
                console.error(message);
            }
        }
    }

    signalPreloadComplete() {
        if (this._container && this._success) {
            this._container.outerHTML = '';
            this._container = null;
        }
    }
}

export default LoadingScreen;
