module.exports = (grunt) ->

  grunt.initConfig
    connect:
      app:
        options:
          port: 8000
          hostname: '*'
          livereload: true

    watch:
      templates:
        files: ['index.jade']
        tasks: ['jade']
      scripts:
        files: ['app.coffee']
        tasks: ['coffee']
      styles:
        files: ['screen.styl']
        tasks: ['stylus']
      livereload:
        files: ['tmp/index.html', 'tmp/app.js', 'tmp/screen.css']
        options:
          livereload: true

    jade:
      compile:
        files:
          'tmp/index.html': 'index.jade'

    coffee:
      compile:
        files:
          'tmp/app.js': 'app.coffee'
        options:
          sourceMap: true
    stylus:
      compile:
        files:
          'tmp/screen.css': 'screen.styl'

  grunt.loadNpmTasks 'grunt-contrib-connect'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-jade'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-stylus'

  grunt.registerTask 'default', ['jade', 'coffee', 'stylus' , 'connect', 'watch']
