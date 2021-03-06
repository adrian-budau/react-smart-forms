'use strict';
let gulp = require('gulp');
let sourcemaps = require('gulp-sourcemaps');
let util = require('gulp-util');
let browserify = require('browserify');
let babelify = require('babelify');
let source = require('vinyl-source-stream');
let buffer = require('vinyl-buffer');
let uglify = require('gulp-uglify');
let watchify = require('watchify');
let _ = require('lodash');

gulp.task('js', function() {
  return browserify('./example/src/app.js', { debug : false, extensions: [".jsx"] })
    .transform(babelify.configure({
      optional: ["es7.objectRestSpread"]
    }))
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify({mangle:false}))
    .pipe(sourcemaps.write('.'))
    .on('error', util.log.bind(util, 'Browserify Error'))
    .pipe(gulp.dest('./example/'));
});

gulp.task('watch', function() {
  let watch = watchify(browserify('./example/src/app.js', _.merge({debug : true}, watchify.args)));
  watch
    .transform(babelify.configure({
      optional: ["es7.objectRestSpread"]
    }));
  let first = true;
  let rebundle = function(filepath) {
    var updateStart = Date.now();
    if (!first) {
      util.log('Bundling', util.colors.green(filepath) + '...');
    }
    return watch.bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify({mangle:false}))
    .pipe(sourcemaps.write('.'))
    .on('error', util.log.bind(util, 'Browserify Error'))
    .pipe(gulp.dest('./example/'))
    .on('end', function() {
      if (!first) {
        let prettyTime = (Date.now() - updateStart) + 'ms';
        util.log('Bundled', util.colors.green(filepath), 'in', util.colors.magenta(prettyTime));
      }
      first = false;
    });
  };

  watch.on('update', rebundle);
  return rebundle();
});
