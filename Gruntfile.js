module.exports = function(grunt){

  grunt.initConfig({
    connect: {
      app: {
        options: {
          port: 8000,
          hostname: '*',
          livereload: true,
          base: 'public'
        }
      }
    },
    watch: {
      index: {
        files: ['app/index.jade'],
        tasks: ['jade']
      },
      scripts: {
        files: ['app/**/*.js', 'lib/**/*.js'],
        tasks: ['browserify']
      },
      styles: {
        files: ['app/screen.styl'],
        tasks: ['stylus']
      },
      livereload: {
        files: ['public/index.html', 'public/app.js', 'public/screen.css', 'public/templates.js'],
        options: {
          livereload: true
        }
      },
      daemon: {
        files: ['daemon/daemon.js'],
        tasks: ['develop'],
        options: {
          nospawn: true
        }
      }
    },
    jade: {
      compile: {
        files: {
          'public/index.html': 'app/index.jade'
        }
      }
    },
    stylus: {
      compile: {
        files: {
          'public/screen.css': 'app/screen.styl'
        }
      }
    },
    develop: {
      daemon: {
        file: 'daemon/daemon.js',
        cmd: 'node'
      }
    },
    browserify: {
      app: {
        src: ['app/app.js'],
        dest: 'public/bundle.js',
        options: {
          transform: ['hbsfy']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-develop');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('default', ['browserify', 'jade', 'stylus' , 'connect', 'develop', 'watch']);
};
