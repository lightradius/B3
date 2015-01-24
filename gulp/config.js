/* global module */

var debug = true,
  src     = "app/",
  dest    = "dist/",
  lib     = "lib/";

module.exports = {
  debug: debug,
  src:   src,
  dest:  dest,
  lib:   lib,

  browserSync: {
    notify:   true,
    proxy:    "b3.dev",
    port:     8080,
    logLevel: "debug"
  },

  test: {
    browserSync: {
      notify: true,
      server: "./",
      logLevel: "debug"
    }
  },

  scripts: {
    src:  src + "scripts/**/*.js",
    dest: dest + "scripts/"
  },

  dust: {
    src:  src + "templates/**/*.{html,dust}",
    dest: src + "scripts/templates/"
  },

  less: {
    src:    src + "styles/less/style.less",
    dest:   dest + "assets/styles/",
    concat: "style.css"
  },

  images: {
    src:  src + "assets/images/**/*",
    dest: dest + "assets/images/"
  },

  fonts: {
    src:  [
      src + "assets/fonts/**/*.{eot,svg,ttf,woff}",
      lib + "fonts/**/*.{eot,svg,ttf,woff}"
    ],
    dest: dest + "assets/fonts/"
  },

  jasmine: {
    runner: "test/jasmine/config/test-init.js",
    specs:  "test/jasmine/specs/**/*.spec.js"
  },

  phpunit: {
    src: "test/phpunit/**/test*.php"
  },

  coverage: {
    instrument: {
      pattern: ["**/*.spec.js"],
      debugDirectory: "debug"
    },
    report: {
      outFile: "test/jasmine/coverage.html"
    }
  },

  jshint: {
    src: [
      src + "scripts/**/*.js",
      "!" + src + "scripts/templates/**/*"
    ],
    reporter: "jshint-stylish"
  },

  autoprefixer: {
    browsers: [
      "last 2 version",
      "ie >= 9",
      "ie_mob >= 10",
      "ff >= 30",
      "chrome >= 34",
      "safari >= 7",
      "opera >= 23",
      "ios >= 7",
      "android >= 4.4",
      "bb >= 10"
    ]
  },
};