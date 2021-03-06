/**
 * Created by Clearives on 2015/11/23.
 */
'use strict';

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var shrink = require('gulp-cssshrink');
var webpack = require('webpack-stream');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var cache = require('gulp-cache');
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
var runSequence = require('run-sequence');
var config = require('./webpack.config');

gulp.task('js', function () {
    gulp.src('./webapp/src/js')
        .pipe(webpack(config))
        .pipe(gulp.dest('./webapp/dev/assets/js'));
});

gulp.task('css', function () {
    gulp.src(['./webapp/src/css/*.css'])
        .pipe(concat('app.css'))
        .pipe(gulp.dest('./webapp/dev/assets/css'));
});
gulp.task('images', function() {
    return gulp.src(['./webapp/src/images/***'])
        .pipe(gulp.dest('./webapp/dev/assets/images'))
});
gulp.task('html', function () {
    return gulp.src(['./webapp/src/index.html'])
        .pipe(gulp.dest('./webapp/dev'));
});

// clean
gulp.task('clean', function() {
    return gulp.src(['./webapp/dist'], {read: false})
        .pipe(clean());
});

gulp.task('publish-js', function () {
    return gulp.src(['./webapp/src/js'])
        .pipe(webpack(config))
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest('./webapp/dist/assets/js'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./webapp/dist/rev/js'));
});
gulp.task('publish-css', function () {
    return gulp.src(['./webapp/src/css/*.css'])
        .pipe(concat('app.css'))
        .pipe(shrink())
        .pipe(rev())
        .pipe(gulp.dest('./webapp/dist/assets/css'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./webapp/dist/rev/css'));
});
gulp.task('publish-images', function() {
    return gulp.src(['./webapp/src/images/*.{png,jpg,gif,ico}'])
        .pipe(cache(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('./webapp/dist/assets/images'))
});
gulp.task('publish-html', function () {
    return gulp.src(['./webapp/dist/rev/**/*.json', './webapp/src/index.html'])
        .pipe(revCollector({
            dirReplacements: {
                '': ''
            }
        }))
        .pipe(gulp.dest('./webapp/dist'));
});
gulp.task('watch', function () {
    gulp.watch('./webapp/src/*.html', ['html']);
    gulp.watch('./webapp/src/css/*.css', ['css']);
    gulp.watch('./webapp/src/js/**', ['js']);
});
gulp.task('dev', function() {
    gulp.start('html','images','css','js');
});
gulp.task('publish',['clean'], function (callback) {
    runSequence(
        ['publish-css','publish-js','publish-images'],
        'publish-html',
        callback);
});