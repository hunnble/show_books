var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var cleanCSS = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('scripts', function () {
    gulp.src('./public/javascripts/*.js')
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(rename('main.min.js'))
        .pipe(gulp.dest('./public/javascripts/'));
});

gulp.task('less2css', function () {
    gulp.src('./public/stylesheets/less/*.less')
        .pipe(less())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public/stylesheets/css/'))
});

gulp.task('minifyCSS', function () {
    gulp.src('./public/stylesheets/css/*.css')
        .pipe(sourcemaps.init())
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }))
        .pipe(sourcemaps.write())
        .pipe(rename(function (path) {
            path.basename += '.min'
        }))
        .pipe(gulp.dest('./public/stylesheets/dist/'))
});

gulp.task('watch', function () {
    //gulp.watch('./public/javascripts/*.js', ['scripts']);
    gulp.watch('./public/stylesheets/less/*.less', ['less2css']);
    gulp.watch('./public/stylesheets/css/*.css', ['minifyCSS']);
});

gulp.task('default', ['watch', 'less2css', 'minifyCSS']);