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
      templates: {
        files: ['app/templates/*.hbs'],
        tasks: ['handlebars']
      },
      scripts: {
        files: ['app/app.coffee'],
        tasks: ['coffee']
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
    handlebars: {
      compile: {
        options: {
          namespace: 'JST'
        },
        files: {
          'public/templates.js': 'app/templates/*.hbs'
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
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-develop');

  grunt.registerTask('default', ['handlebars', 'jade', 'stylus' , 'connect', 'develop', 'watch']);
};
