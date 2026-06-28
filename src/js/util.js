import { Sprite, ColorMatrixFilter } from 'pixi.js';
import config from './config';
import { getTexture } from './assets';

// Ghost tint tuning. The ghosts are a green base sprite recoloured via a
// ColorMatrixFilter; these control how opaque and saturated the result is.
const GHOST_OPACITY = 0.88;     // alpha of the recoloured ghost (1 = fully opaque)
const GHOST_SATURATION = 0.6;   // extra saturation applied after recolouring

export function convertToTileSpace(v) {
    return Math.floor(v / config.wallSize);
}

/**
 * @param ax1 first rectangle, upper left x-coordinate
 * @param ay1 first rectangle, upper left y-coordinate
 * @param ax2 first rectangle, bottom right x-coordinate
 * @param ay2 first rectangle, bottom right y-coordinate
 * @param bx1 second rectangle, upper left x-coordinate
 * @param by1 second rectangle, upper left y-coordinate
 * @param bx2 second rectangle, bottom right x-coordinate
 * @param by2 second rectangle, bottom right y-coordinate
 *
 * @returns {boolean}
 */
export function overlap(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
    return (ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1);
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 */
export function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Distance formula without the square root.
 * Intended for finding the order of distances without needing the actual distance of each.
 */
export function qs(a, b) {
    return (a * a) + (b * b);
}

/**
 * Recolour matrices for the green ghost sprite. Each RGB row sums to 1 so the
 * grey axis is preserved — the white eyes stay white and the black outline/pupils
 * stay black — while the green body maps to the target colour (the same body
 * colours as before; only the eyes are fixed). The alpha row sets opacity.
 */
export function generateColorMatrixValue(input) {

    if (input === 'red') {        // green body -> (1, 0, 0)
        return [
            0,   1, 0,   0, 0,
            0.5, 0, 0.5, 0, 0,
            0.5, 0, 0.5, 0, 0,
            0,   0, 0,   GHOST_OPACITY, 0
        ];

    } else if (input === 'pink') {   // green body -> (1, 0.72, 1)
        return [
            0,    1,    0,    0, 0,
            0.14, 0.72, 0.14, 0, 0,
            0,    1,    0,    0, 0,
            0,    0,    0,    GHOST_OPACITY, 0
        ];

    } else if (input === 'blue') {   // green body -> (0, 1, 1)
        return [
            0.5, 0, 0.5, 0, 0,
            0,   1, 0,   0, 0,
            0,   1, 0,   0, 0,
            0,   0, 0,   GHOST_OPACITY, 0
        ];

    } else if (input === 'orange') { // green body -> (1, 0.73, 0.31)
        return [
            0,     1,    0,     0, 0,
            0.135, 0.73, 0.135, 0, 0,
            0.345, 0.31, 0.345, 0, 0,
            0,     0,    0,     GHOST_OPACITY, 0
        ];

    } else { // green (developer ghost): identity already preserves white eyes
        return [
            1, 0, 0, 0, 0,
            0, 1, 0, 0, 0,
            0, 0, 1, 0, 0,
            0, 0, 0, GHOST_OPACITY, 0
        ];
    }
}

/**
 * Multiply two 5x4 colour matrices (row-major). Returns a·b: the transform that
 * applies b first, then a.
 */
function multiplyColorMatrix(a, b) {
    const out = new Array(20);
    for (let r = 0; r < 4; r++) {
        const o = r * 5;
        for (let c = 0; c < 4; c++) {
            out[o + c] = a[o] * b[c] + a[o + 1] * b[5 + c] + a[o + 2] * b[10 + c] + a[o + 3] * b[15 + c];
        }
        out[o + 4] = a[o] * b[4] + a[o + 1] * b[9] + a[o + 2] * b[14] + a[o + 3] * b[19] + a[o + 4];
    }
    return out;
}

/**
 * Standard saturation matrix. amount 0 leaves colours unchanged; >0 boosts saturation.
 */
function saturationMatrix(amount) {
    const x = (amount * 2 / 3) + 1;
    const y = (x - 1) * -0.5;
    return [
        x, y, y, 0, 0,
        y, x, y, 0, 0,
        y, y, x, 0, 0,
        0, 0, 0, 1, 0
    ];
}

/**
 * Build the ColorMatrixFilter for a ghost: recolour the green base, then boost
 * saturation (applied after the recolour so it's the final colour that's saturated,
 * not the green base). Opacity comes from the alpha row of the recolour matrix.
 */
export function createGhostColorMatrix(color) {
    const cm = new ColorMatrixFilter();
    cm.matrix = multiplyColorMatrix(saturationMatrix(GHOST_SATURATION), generateColorMatrixValue(color));
    return cm;
}

export function createPacmanIcon(scale) {
    let pacmanIcon = new Sprite(getTexture('player2.png'));
    pacmanIcon.scale.set(scale);

    return pacmanIcon;
}

export function createGhostIcon(color, scale) {
    let ghostIcon = new Sprite(getTexture('shade-green-right1.png'));
    ghostIcon.scale.set(scale);
    ghostIcon.filters = [createGhostColorMatrix(color)];

    return ghostIcon;
}
