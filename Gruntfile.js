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
                    'dist/client.js': ['src/js/main.js']
                }
            }
        },
        bowercopy: {
            dist: {
                options: {
                    srcPrefix: 'bower_components',
                    destPrefix: 'dist'
                },
                files: {
                    'pixi.js':          'pixi.js/bin/pixi.js',
                    'pixi.min.js':      'pixi.js/bin/pixi.min.js',
                    'howler.js':        'howler.js/howler.js',
                    'howler.min.js':    'howler.js/howler.min.js'
                }
            }
        },
        copy: {
            index: {
                src: 'src/index.html',
                dest: 'dist/index.html'
            },
            media: {
                src: 'media/assets/*',
                dest: 'dist/assets/'
            }
        },
        watch: {
            js: {
                files: ['src/js/**/*.js'],
                tasks: ['browserify']
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
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bowercopy');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['browserify', 'bowercopy', 'copy', 'connect', 'watch']);
};
