# Mazing

The purpose of this project was to reinterpret a retro game. It was originally
written in 2015 and modernized in 2026.

The game renders with [Pixi.js](https://pixijs.com/) (WebGL/WebGPU), plays audio
through [howler.js](https://github.com/goldfire/howler.js/), and is built with
[Vite](https://vite.dev/). The pixel art and animation were made with
[Aseprite](https://www.aseprite.org/) and packed with
[TexturePacker](https://www.codeandweb.com/texturepacker); the packed atlas in
`public/assets` is what the game loads at runtime, so neither art tool is needed
to build or run.

The game view scales to the height of the browser window (leaving about one tile
of margin top and bottom) and is rendered with nearest-neighbour scaling, so the
pixel art stays crisp at any size.

## Running

Requires [Node.js](https://nodejs.org/) (18+).

Install dependencies:
<pre>
npm install
</pre>

Start the dev server (with hot reload) at http://localhost:5173:
<pre>
npm run dev
</pre>

Build the production bundle into `./dist`:
<pre>
npm run build
</pre>

Preview the production build locally:
<pre>
npm run preview
</pre>

## Controls

* Arrow keys or `WASD` to move
* `Enter` (or `Space` / `P` / `Esc`) to pause; any key to resume
* `F` to toggle the FPS counter

## Credits

Sound and music are CC0 and were acquired from freesound.org.
* [Punch](http://www.freesound.org/people/Ekokubza123/sounds/104183/)
* [60s-style punches](http://www.freesound.org/people/karjo238/sounds/278210/)
* [Bass Drop](http://www.freesound.org/people/Stereo%20Surgeon/sounds/261205/)
* [Level End](http://www.freesound.org/people/bombstu/sounds/159081/)
* [Track 1](http://www.freesound.org/people/DraKounet/sounds/324379/)
* [Track 2](http://www.freesound.org/people/DraKounet/sounds/324377/)
* [Crackling](http://www.freesound.org/people/painmooser/sounds/168949/)
