// Scale the game canvas to fill the window's height, leaving roughly one tile
// of margin at the top and bottom. The canvas keeps its native pixel
// resolution; CSS does the upscaling, and `image-rendering: pixelated` (set in
// index.html) keeps that upscale crisp (nearest-neighbour) rather than blurry.

const TILE = 16;          // native px per maze tile (matches config.wallSize)
const MARGIN_TILES = 1;   // desired margin above and below the game, in tiles

/**
 * Size the canvas element to the window and keep it sized on resize.
 *
 * @param {HTMLCanvasElement} canvas    the renderer's canvas
 * @param {number} nativeWidth          internal render width (px)
 * @param {number} nativeHeight         internal render height (px)
 */
export function applyScaling(canvas, nativeWidth, nativeHeight) {
    const margin = MARGIN_TILES * TILE;

    const resize = () => {
        // Largest scale that fits the height with one tile of margin top+bottom.
        const scaleForHeight = window.innerHeight / (nativeHeight + 2 * margin);
        // Don't let an extremely narrow window push the maze off the sides.
        const scaleForWidth = window.innerWidth / (nativeWidth + 2 * margin);

        const scale = Math.max(0.01, Math.min(scaleForHeight, scaleForWidth));

        canvas.style.width = Math.round(nativeWidth * scale) + 'px';
        canvas.style.height = Math.round(nativeHeight * scale) + 'px';
    };

    resize();
    window.addEventListener('resize', resize);
}
