import { Assets } from 'pixi.js';

// The texture atlas (TexturePacker JSON + PNG) lives in public/assets and is
// served at /assets. Pixi's Assets loader parses the spritesheet and exposes
// each frame by its original filename via `sheet.textures`.
const ATLAS_URL = 'assets/mazing-v1.json';

let sheet = null;

/**
 * Load the sprite atlas. Resolves once every frame texture is available.
 */
export async function loadGraphics() {
    sheet = await Assets.load(ATLAS_URL);
    return sheet;
}

/**
 * Look up a frame texture by its atlas filename, e.g. 'player2.png'.
 * Replaces the old PIXI.Texture.fromFrame(...).
 */
export function getTexture(frameName) {
    if (sheet === null) {
        throw new Error('Graphics assets not loaded yet: ' + frameName);
    }
    const texture = sheet.textures[frameName];
    if (texture === undefined) {
        throw new Error('Unknown texture frame: ' + frameName);
    }
    return texture;
}
