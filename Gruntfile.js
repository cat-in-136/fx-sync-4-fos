"use strict";

module.exports = function (grunt) {
  grunt.initConfig({
    clean: {
      build: { src: ["assets"] }
    },
    copy: {
      install: {
        files: [
          {
            expand: true, flatten: true,
            src: [
              'bower_components/jquery/dist/jquery.js',
              'bower_components/fos-fx-sync/**/fx-sync.js',
            ],
            dest: "assets/js/"
          },
          {
            expand: true, flatten: true,
            cwd: 'bower_components/building-blocks/',
            src: ['js/*.js'],
            dest: "assets/js/building-blocks/"
          },
          {
            expand: true, flatten: false,
            cwd: 'bower_components/building-blocks/',
            src: ['cross_browser.css', 'transitions.css', 'util.css', 'icons/**/*.{css,png,svg}', 'style/**/*.{css,png,svg}'],
            dest: "assets/css/building-blocks/"
          },
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask("build", ["clean:build", "copy:install"]);
  grunt.registerTask("default", ["build"]);
}
