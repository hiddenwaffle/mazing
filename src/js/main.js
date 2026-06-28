import { autoDetectRenderer, Container, TextureSource } from 'pixi.js';
import preload from './preload';
import Game from './game';
import { setRenderer } from './renderer';
import { applyScaling } from './scaling';

const NATIVE_WIDTH = 800;
const NATIVE_HEIGHT = 600;

// Retro pixel art: always sample textures with nearest-neighbour so nothing
// is blurred, neither inside the canvas nor when the canvas is scaled up.
TextureSource.defaultOptions.scaleMode = 'nearest';

preload.start(async () => {
    const renderer = await autoDetectRenderer({
        width: NATIVE_WIDTH,
        height: NATIVE_HEIGHT,
        background: 0x333333,
        resolution: 1,
        autoDensity: false,
        antialias: false,
    });
    setRenderer(renderer);

    const stage = new Container();
    stage.sortableChildren = true; // honour each layer's `zIndex`

    document.body.appendChild(renderer.canvas);
    applyScaling(renderer.canvas, NATIVE_WIDTH, NATIVE_HEIGHT);

    const game = new Game(stage, renderer);
    game.start();

    // Fixed-step logic loop (~60 Hz). The game measures real elapsed time itself.
    function loop() {
        setTimeout(loop, 16.66);
        game.step();
    }
    loop();

    // Render whenever the browser is ready to paint.
    function animate() {
        requestAnimationFrame(animate);
        game.draw();
    }
    animate();
});
