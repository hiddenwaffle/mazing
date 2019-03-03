# Mazing

**Play Here: [https://unremarkable.app/mazing](https://unremarkable.app/mazing)**

The purpose of this project was to reinterpret a retro game, and to learn several tools:
* ES6 a.k.a. ES2015 via [Babel](https://babeljs.io/)
* [Pixi.js](http://www.pixijs.com/) for WebGL rendering
* [howler.js](https://github.com/goldfire/howler.js/) to interface with the Web Audio API
* [Grunt](http://gruntjs.com/) to organize JavaScript tasks
* [Bower](http://bower.io/) to organize front-end dependencies
* [Aseprite](http://www.aseprite.org/) for pixel art and animation
* [TexturePacker](https://www.codeandweb.com/texturepacker) for sprite management
* [WebStorm](https://www.jetbrains.com/webstorm/) as a JavaScript IDE

## Building

Install Bower and Grunt if not already installed.
<pre>
npm install -g grunt-cli
npm install -g bower
</pre>

Clone and prepare
<pre>
git clone https://github.com/hiddenwaffle/mazing.git
npm install
bower install
</pre>

Build ./dist for development (unminified) and start local server and watcher
<pre>
grunt
</pre>

Clean and build ./dist for production (minified)
<pre>
grunt finalize
</pre>

Other tasks
<pre>
grunt server # start server and watcher without building
grunt clean  # remove the dist directory
</pre>

## Credits

Sound and music are CC0 and were acquired from freesound.org.
* [Punch](http://www.freesound.org/people/Ekokubza123/sounds/104183/)
* [60s-style punches](http://www.freesound.org/people/karjo238/sounds/278210/)
* [Bass Drop](http://www.freesound.org/people/Stereo%20Surgeon/sounds/261205/)
* [Level End](http://www.freesound.org/people/bombstu/sounds/159081/)
* [Track 1](http://www.freesound.org/people/DraKounet/sounds/324379/)
* [Track 2](http://www.freesound.org/people/DraKounet/sounds/324377/)
* [Crackling](http://www.freesound.org/people/painmooser/sounds/168949/)
