const gulp = require('gulp');

const browserSync = require('browser-sync').create();

const sourcemaps = require('gulp-sourcemaps');

const sass = require('gulp-sass');

// use the latest css syntax
const postcss = require('gulp-postcss');
const cssnext = require('postcss-preset-env');

// minify css styles
const cleanCSS = require('gulp-clean-css');

// minify javascript
const uglify = require('gulp-uglify');
const pump = require('pump');

// static asset revisioning by appending content hash to filenames
const rev = require('gulp-rev');
const revCollector = require('gulp-rev-collector');

///////////////////////////////////////////////
/*              npm run dev                  */
///////////////////////////////////////////////
gulp.task('dev', ['sass', 'js'], function() {
  browserSync.init({
    server: './app'
  });

  gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch('app/js/**/*.js', ['js']);
  gulp.watch('app/*.html').on('change', browserSync.reload);
});

gulp.task('sass', function() {
  return gulp
    .src('app/scss/**/*.scss')
    .pipe(sass())
    .pipe(postcss([cssnext()]))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.stream());
});

gulp.task('js', function() {
  return gulp.src('app/js/**/*.js').pipe(browserSync.stream());
});

///////////////////////////////////////////////
/*              npm run build                */
///////////////////////////////////////////////
gulp.task('build', ['sass-prod', 'js-prod'], function() {
  return gulp
    .src(['dist/rev/**/*.json', 'app/*.html'])
    .pipe(
      revCollector({
        replaceReved: true
      })
    )
    .pipe(gulp.dest('dist'));
});

gulp.task('sass-prod', function() {
  return gulp
    .src('app/scss/**/*.scss')
    .pipe(sass())
    .pipe(sourcemaps.init())
    .pipe(postcss([cssnext()]))
    .pipe(
      cleanCSS({
        compatibility: 'ie8'
      })
    )
    .pipe(rev())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/css'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('dist/rev/css'));
});

gulp.task('js-prod', function(cb) {
  pump(
    [
      gulp.src('app/js/**/*.js'),
      sourcemaps.init(),
      uglify(),
      rev(),
      sourcemaps.write('.'),
      gulp.dest('dist/js'),
      rev.manifest(),
      gulp.dest('dist/rev/js')
    ],
    cb
  );
});
