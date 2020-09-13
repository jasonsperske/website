const gulp = require('gulp');
const babel = require('gulp-babel');
const terser = require('gulp-terser');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const flatten = require('gulp-flatten');
const concat = require('gulp-concat');
const rename = require('gulp-rename');

function javascript() {
  return gulp.src([
      'node_modules/jquery/dist/jquery.js',
      'node_modules/popper.js/dist/umd/popper.js',
      'node_modules/bootstrap/dist/js/bootstrap.js',
      'node_modules/lity/dist/lity.js'
    ], {
      base: '.'
    })
    .pipe(babel())
    .pipe(terser())
    .pipe(concat('sperske.min.js'))
    .pipe(gulp.dest('static/js/'));
}

function css() {
  return gulp.src('src/css/sperske.scss')
    .pipe(sass({
      paths: ['.']
    }))
    .pipe(cleanCSS())
    .pipe(rename('sperske.min.css'))
    .pipe(gulp.dest('static/css/'));
}

function fonts() {
  return gulp.src(['node_modules/font-awesome/fonts/*'], {
      base: './'
    })
    .pipe(flatten())
    .pipe(gulp.dest('static/fonts/'));
}

exports.default = gulp.series(javascript, css, fonts);
exports.watch = function() {
  gulp.watch(['src/js/*.js', 'src/css/*.scss'], gulp.series(javascript, css, fonts));
}
