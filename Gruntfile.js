'use strict';

module.exports = function(grunt) {

    const clientFile = 'dist/client-1.0.0.js'; // Should match index.html's reference

    const intermediateBrowserifyFile = 'dist/tmp-browserified.js'; // Used by Uglify

    const browserifyOptions = {
        transform: [
            ['babelify', { presets: 'es2015' } ]
        ]
    };

    const bowerOptions = {
        srcPrefix: 'bower_components',
        destPrefix: 'dist'
    };

    grunt.initConfig({
        browserify: {
            dev: {
                options: browserifyOptions,
                src: ['src/js/main.js'],
                dest: clientFile
            },
            prod: {
                options: browserifyOptions,
                src: ['src/js/main.js'],
                dest: intermediateBrowserifyFile
            }
        },
        bowercopy: {
            dev: {
                options: bowerOptions,
                files: {
                    'pixi-3.0.8.js':    'pixi.js/bin/pixi.js',
                    'howler-1.1.28.js': 'howler.js/howler.js'
                }
            },
            prod: {
                options: bowerOptions,
                files: {
                    'pixi-3.0.8.js':    'pixi.js/bin/pixi.min.js',
                    'howler-1.1.28.js': 'howler.js/howler.min.js'
                }
            }
        },
        copy: {
            index: {
                src: 'src/index.html',
                dest: 'dist/index.html'
            },
            media: {
                expand: true,           // I wonder what this does?
                cwd: 'media/assets/',
                src: '**/*',
                dest: 'dist/assets/'
            }
        },
        watch: {
            js: {
                files: ['src/js/**/*.js'],
                tasks: ['browserify:dev']
            },
            index: {
                files: ['src/index.html'],
                tasks: ['copy:index']
            },
            media: {
                files: ['media/assets/*'],
                tasks: ['copy:media'] // TODO: This could be modified to copy only the modified file(s)
            }
        },
        connect: {
            server: {
                options: {
                    port: 8080,
                    base: 'dist'
                }
            }
        },
        uglify: {
            client: {
                src: [intermediateBrowserifyFile],
                dest: clientFile
            }
        },
        clean: {
            all: ['dist'],
            'after-uglify': [intermediateBrowserifyFile]
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bowercopy');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Standard dev workflow.
    grunt.registerTask('default', [
        'browserify:dev',
        'bowercopy:dev',
        'copy',
        'connect',
        'watch'
    ]);

    // Prepare for production.
    grunt.registerTask('finalize', [
        'clean:all',
        'browserify:prod',
        'uglify',
        'clean:after-uglify',
        'bowercopy:prod',
        'copy'
    ]);

    // Start a server quickly without building anything.
    grunt.registerTask('server', [
        'connect',
        'watch'
    ]);
};
