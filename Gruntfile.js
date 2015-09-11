var pkg = require( './package.json' );
var currentTime = +new Date();
var assetPath = 'build/assets-' + currentTime;

module.exports = function ( grunt ) {

  var isDev = !(grunt.cli.tasks && grunt.cli.tasks[0] === 'deploy');

  grunt.initConfig( {
    connect: {
      server: {
        options: {
          port: pkg.config.port,
          hostname: '*',
//          livereload: true,
          base: './',
          middleware: function ( connect, options, middlewares ) {
            // inject a custom middleware http://stackoverflow.com/a/24508523 
            middlewares.unshift( function ( req, res, next ) {
              res.setHeader( 'Access-Control-Allow-Origin', '*' );
              res.setHeader( 'Access-Control-Allow-Methods', '*' );
              return next();
            } );
            return middlewares;
          }
        }
      }
    },

    sass: {
      options: {
        //includePaths: ['bower_components/'],
        style: (isDev) ? 'expanded' : 'compressed',
        sourcemap: (isDev) ? 'inline' : 'none'
      },
      build: {
        files: { 'build/assets/css/main.css': 'src/css/main.scss' }
      }
    },

    autoprefixer: {
      options: { map: true },
      prefix: { src: 'build/assets/css/*.css' }
    },

    clean: {
      clean: ['build/']
    },

    jshint: {
      options: {
        jshintrc: true,
        force: true
      },
      files: ['Gruntfile.js', 'src/*.js', 'src/js/*.js', 'src/js/app/**/*.js']
    },

    requirejs: {
      prod: {
        options: {
          baseUrl: './src/js/app/',
          mainConfigFile: './src/js/libs/configPaths.js',
          optimize: (isDev) ? 'none' : 'uglify2',
          inlineText: true,
          name: '../libs/almond',
          out: 'build/assets/js/main.js',
          generateSourceMaps: true,
          preserveLicenseComments: false,
          include: ['main'],
          wrap: {
            start: 'define(["require"],function(require){var req=(function(){',
            end: 'return require; }()); return req; });'
          }

        }
      }
    },

    replace: {
      build: {
        options: {
          patterns: [
            {
              match: /{{local-root}}/g,
              replacement: ''
            },
            {
              match: /{{remote-root}}/g,
              replacement: '//labs.theguardian.com/2015/aug/silent-circle-video/'
            }
          ]
        },
        files: [
          {
            src: ['build/*.html', 'build/**/*.js', 'build/**/*.css'],
            dest: './'
          }
        ]
      }
    },

    watch: {
      scripts: {
        files: [
          'src/**/*.js',
          'src/boot.js',
          'src/**/*.json',
          'src/js/app/templates/*.html'
        ],
        tasks: ['requirejs', 'replace'],
        options: {
          spawn: false,
//          livereload: true
        }
      },
      html: {
        files: ['src/*.html', 'src/**/*.html'],
        tasks: ['copy', 'replace'],
        options: {
          spawn: false,
//          livereload: true
        }
      },
      css: {
        files: ['src/css/**/*.*'],
        tasks: ['sass', 'autoprefixer', 'replace'],
        options: {
          spawn: false,
//          livereload: true
        }
      }
    },

    copy: {
      build: {
        files: [
          { src: 'src/index.html', dest: 'build/index.html' },
          { src: 'src/form.html', dest: 'build/form.html' },
          { src: 'src/thanks.html', dest: 'build/thanks.html' },
          { src: 'src/boot.js', dest: 'build/boot.js' },
          { cwd: 'src/', src: 'imgs/**', dest: 'build/assets/', expand: true},

          { src: 'src/data/coming-soon.json', dest: 'build/assets/data/coming-soon.json' },
          { cwd: 'src/', src: 'fonts/**', dest: 'build/assets/', expand: true },

          { src: 'src/js/libs/require.js', dest: 'build/assets/js/require.js' }
        ]
      }
    },

    s3: {
      options: {
        access: 'public-read',
        bucket: 'gdn-cdn',
        maxOperations: 20,
        dryRun: (grunt.option( 'test' )) ? true : false,
        headers: {
          CacheControl: 180,
        },
        gzip: true,
        gzipExclude: ['.jpg', '.gif', '.jpeg', '.png']
      },
      base: {
        files: [
          {
            cwd: 'build',
            src: '*.*',
            dest: pkg.config.s3_folder
          }
        ]
      },
      assets: {
        options: {
          headers: {
            CacheControl: 3600,
          }
        },
        files: [
          {
            cwd: 'build',
            src: 'assets-' + currentTime + '/**/*.*',
            dest: pkg.config.s3_folder
          }
        ]
      }
    },

    rename: {
      main: {
        files: [
          { src: 'build/assets', dest: assetPath }
        ]
      }
    }

  } );

  // Task pluginsk
  grunt.loadNpmTasks( 'grunt-contrib-jshint' );
  grunt.loadNpmTasks( 'grunt-contrib-connect' );
  grunt.loadNpmTasks( 'grunt-contrib-requirejs' );
  grunt.loadNpmTasks( 'grunt-contrib-sass' );
  grunt.loadNpmTasks( 'grunt-contrib-watch' );
  grunt.loadNpmTasks( 'grunt-contrib-clean' );
  grunt.loadNpmTasks( 'grunt-contrib-copy' );
  grunt.loadNpmTasks( 'grunt-aws' );
  grunt.loadNpmTasks( 'grunt-autoprefixer' );
  grunt.loadNpmTasks( 'grunt-replace' );
  grunt.loadNpmTasks( 'grunt-contrib-rename' );

  // Tasks
  grunt.registerTask( 'build', [
    'clean',
    'sass',
    'autoprefixer',
    'requirejs',
    'copy',
    'replace'
  ] );

  grunt.registerTask( 'default', ['build', 'connect', 'watch'] );

  grunt.registerTask( 'deploy', [
    'build',
    'rename',
    'replace:prod',
    's3'
  ] );
};

