// Scale the game to fill the window's height, leaving about one tile of margin
// at the top and bottom.
//
// Rather than rendering into a tiny native-size buffer and CSS-upscaling the
// whole canvas (which forces EVERYTHING — vector maze, text, UI icons — to be
// nearest-neighbour and look chunky), we render at the real displayed
// resolution and scale the game world up *inside* Pixi. The maze (vector
// Graphics) and the text stay crisp; only the pixel-art atlas sprites use
// nearest-neighbour sampling, so they stay chunky-crisp instead of fuzzy.

const TILE = 16;          // native px per maze tile (matches config.wallSize)
const MARGIN_TILES = 1;   // desired margin above and below the game, in tiles

/**
 * @param renderer      the Pixi renderer (resized to the displayed size)
 * @param stage         the root container (scaled to fill that size)
 * @param nativeWidth   the game's logical width (px)
 * @param nativeHeight  the game's logical height (px)
 */
export function applyScaling(renderer, stage, nativeWidth, nativeHeight) {
    const margin = MARGIN_TILES * TILE;

    const resize = () => {
        // Largest scale that fits the height with one tile of margin top+bottom.
        const scaleForHeight = window.innerHeight / (nativeHeight + 2 * margin);
        // Don't let a very narrow window push the maze off the sides.
        const scaleForWidth = window.innerWidth / (nativeWidth + 2 * margin);

        const scale = Math.max(0.01, Math.min(scaleForHeight, scaleForWidth));

        // Resize the renderer to the displayed (CSS) size. With autoDensity +
        // resolution = devicePixelRatio, the backing store is this size times
        // the device pixel ratio, so everything renders at full sharpness.
        renderer.resize(nativeWidth * scale, nativeHeight * scale);

        // Scale the whole game world up to fill that size.
        stage.scale.set(scale);
    };

    resize();
    window.addEventListener('resize', resize);
}
