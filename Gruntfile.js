module.exports = function(grunt) {

    grunt.initConfig({
        browserify: {
            dist: {
                options: {
                    transform: [
                        ['babelify', { presets: 'es2015' } ]
                    ]
                },
                files: {
                    'client/client.js': ['client/src/main.js']
                }
            }
        },
        bowercopy: {
            dist: {
                options: {
                    srcPrefix: 'bower_components',
                    destPrefix: 'client'
                },
                files: {
                    'pixi.js':          'pixi.js/bin/pixi.js',
                    'pixi.min.js':      'pixi.js/bin/pixi.min.js',
                    'howler.js':        'howler.js/howler.js',
                    'howler.min.js':    'howler.js/howler.min.js'
                }
            }
        },
        watch: {
            js: {
                files: ['client/src/**/*.js'],
                tasks: ['browserify']
            }
        },
        connect: {
            server: {
                options: {
                    port: 8080,
                    base: 'client'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bowercopy');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('default', ['browserify', 'bowercopy', 'connect', 'watch']);
};
