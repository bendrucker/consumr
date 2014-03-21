'use strict';

var gulp    = require('gulp');
var gutil   = require('gulp-util');
var plugins = require('gulp-load-plugins')();

var logIfWatch = function (err) {
  if (watch) {
    gutil.log(err.toString());
    this.emit('end');
  } else {
    throw err;
  }
};

var files = {
  src: 'src/*.js',
  test: ['test/unit/*.js', 'test/integration/*.js']
};

files.all = [files.src].concat(files.test);

gulp.task('lint', function () {
  return gulp.src(files.all)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'))
    .pipe(plugins.jshint.reporter('fail'))
    .on('error', logIfWatch);
});

gulp.task('test', ['lint'], function (done) {
  require('test-setup');
  gulp.src(files.src)
    .pipe(plugins.istanbul())
    .on('end', function () {
      gulp.src(files.test)
        .pipe(plugins.mocha())
        .on('error', logIfWatch)
        .pipe(plugins.istanbul.writeReports())
        .on('end', done);
    });
});

var watch;
gulp.task('watch', function () {
  watch = true;
  return gulp.watch(files.all, ['test']);
});