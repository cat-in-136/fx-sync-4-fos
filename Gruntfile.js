"use strict";

module.exports = function (grunt) {
  grunt.initConfig({
    clean: {
      build: { src: ["assets", "*.zip"] }
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
    },
    zip: {
      "package": {
        dest: "fx-sync-4-fos.zip",
        src: [
          "assets/**/*",
          "data/**/*",
          "img/**/*",
          "js/**/*",
          "index.*",
          "LICENSE",
          "manifest.webapp"
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-zip');

  grunt.registerTask("build", ["clean:build", "copy:install", "zip:package"]);
  grunt.registerTask("default", ["build"]);
}
