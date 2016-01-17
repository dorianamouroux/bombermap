var gulp = require('gulp'),
    less = require('gulp-less'),
    nodemon = require('gulp-nodemon'),
    concat = require('gulp-concat'),
    minifyCSS = require('gulp-minify-css'),
    LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    autoprefix = new LessPluginAutoPrefix({ browsers: ["last 2 versions"] }),
    exec = require('child_process').exec,
    order = require("gulp-order"),
    combiner = require('stream-combiner2');

exec('pkill -2 node ; pkill -2 nodejs', function (error, stdout, stderr){});

// convert .less to .css and merge into one file
gulp.task('less', function() {

    var combined = combiner.obj([
        gulp.src('./ressources/less/**/*.less'),
        less({plugins: [autoprefix]}),
        concat('style.css'),
        minifyCSS(),
        gulp.dest('./public/stylesheets/')
    ]);

    combined.on('error', function(e) {});

    return (combined);

});

// start node.js
gulp.task('server', function () {

    var nodemonTask = nodemon({
        script: './bin/www.js',
        ext: 'js json',
        ignore: [
            'gulpfile.js',
            './public/js/*.js',
            './node_modules/**/*.json',
            './node_modules',
            './node_modules/**/*.js'
        ],
        env: { 'NODE_ENV': 'development'}
    });

    return (nodemonTask);
});

// default task
gulp.task('default', ['less', 'server'], function() {});

// watcher
gulp.task('watch', ['default'], function() {
    gulp.watch('./ressources/less/**/*.less', ['less']);
});
