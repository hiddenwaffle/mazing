import LoadingScreen from './loading-screen';
import soundPreloader from './sound-preloader';
import { loadGraphics } from './assets';

class Preload {

    constructor() {
        this._sfxLoaded = false;
        this._gfxLoaded = false;
        this._afterFinished = null;
        this._success = true;

        this._loadingScreen = new LoadingScreen();
    }

    start(afterFinished) {
        this._afterFinished = afterFinished;

        loadGraphics()
            .then(() => {
                this._gfxLoaded = true;
                this._loadingScreen.signalLoaded(true, 'Sprites loaded');
                this._handleIfFinished(true);
            })
            .catch((err) => {
                console.error(err);
                this._loadingScreen.signalLoaded(false, 'Could not load sprites');
                this._success = false;
                this._handleIfFinished(false);
            });

        // NOTE: The rest of the sounds are loaded later on. These are needed in the beginning.
        soundPreloader.load(this._loadingScreen, [
            'assets/punch-v1.m4a',
            'assets/wham1-v1.m4a',
            'assets/wham2-v1.m4a',
            'assets/wham3-v1.m4a',
            'assets/energizer-v1.m4a',
            'assets/crackles-v1.m4a',
            'assets/cool-journey-v1.m4a'
        ], (success) => {
            this._sfxLoaded = true;
            this._handleIfFinished(success);
        });
    }

    _handleIfFinished(success) {
        if (success === false) {
            this._success = false;
        }

        if (this._success && this._gfxLoaded && this._sfxLoaded === true) {
            this._afterFinished();
        }
    }
}

const preload = new Preload();
export default preload;
