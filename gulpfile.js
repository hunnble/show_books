var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

gulp.task('scripts', function () {
    gulp.src('./public/javascripts/*.js')
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(rename('main.min.js'))
        .pipe(gulp.dest('./public/javascripts/'));
});

gulp.task('watch', function () {
    gulp.watch('./public/javascripts/*.js', ['scripts']);
});

gulp.task('default', ['watch', 'scripts']);