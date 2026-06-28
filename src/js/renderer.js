// Small holder so modules that need to rasterize graphics to textures
// (particle emitters) or snapshot the stage (level ending) can reach the
// renderer without it being threaded through every constructor.
let renderer = null;

export function setRenderer(value) {
    renderer = value;
}

export function getRenderer() {
    if (renderer === null) {
        throw new Error('Renderer has not been initialized yet');
    }
    return renderer;
}
