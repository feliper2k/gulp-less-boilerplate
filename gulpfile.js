// Load Gulp
var gulp    = require('gulp'),
    gutil   = require('gulp-util'),
    http = require('http'),
    express = require('express'),
    plugins = require('gulp-load-plugins')({
        rename: {
            'gulp-uglifyjs': 'uglify'
        }
    });

var app = express();
app.use(express.static('build'));

// Start Watching: Run "gulp"
gulp.task('default', ['watch']);

// Minify jQuery Plugins: Run manually with: "gulp squish-jquery"
gulp.task('squish-jquery', function() {
  return gulp.src('assets/js/libs/**/*.js')
    .pipe(plugins.uglify('jquery.plugins.min.js'))
    .pipe(gulp.dest('build'))
    .pipe(plugins.livereload());
});

gulp.task('refresh', function () {
    return gulp.src('!{node_modules}/**/*.{htm,html}')
    .pipe(plugins.livereload());
    plugins.livereload.changed('index.html');
});

// Minify Custom JS: Run manually with: "gulp build-js"
gulp.task('build-js', function() {
  return gulp.src('assets/js/*.js')
    .pipe(plugins.uglify('scripts.min.js', {
        outSourceMap: true
    }))
    .pipe(gulp.dest('build'))
    .pipe(plugins.livereload());
});

// Less to CSS: Run manually with: "gulp build-css"
gulp.task('build-css', function() {
    return gulp.src('assets/less/*.less')
        .pipe(plugins.plumber())
        .pipe(plugins.less())
        .on('error', function (err) {
            gutil.log(err);
            this.emit('end');
        })
        .pipe(plugins.autoprefixer(
            {
                browsers: [
                    '> 1%',
                    'last 2 versions',
                    'firefox >= 4',
                    'safari 7',
                    'safari 8',
                    'IE 8',
                    'IE 9',
                    'IE 10',
                    'IE 11'
                ],
                cascade: false
            }
        ))
        .pipe(plugins.cssmin())
        .pipe(gulp.dest('build'))
        .pipe(plugins.livereload())
        .on('error', gutil.log);
});

gulp.task('copy-assets', function () {
    return gulp.src('assets/images/**/*')
    .pipe(gulp.dest('build/images'));
});

gulp.task('copy-index', function () {
    return gulp.src('index.html')
    .pipe(gulp.dest('build/'));
});

gulp.task('server', function(done) {
    app.listen(8080, function () {
        console.log('Serving from build/');
        done();
    });
});

// Default task
gulp.task('watch', ['server','squish-jquery','build-js','build-css','copy-assets','copy-index'], function() {
    plugins.livereload.listen({
        start: true,
        reloadPage: 'index.html'
    });
    gulp.watch('assets/js/libs/**/*.js', ['squish-jquery']);
    gulp.watch('assets/js/*.js', ['build-js']);
    gulp.watch('assets/less/**/*.less', ['build-css']);
    gulp.watch('assets/images/**/*', ['copy-assets']);
    gulp.watch('!{node_modules}/**/*.{htm,html}', ['refresh']);
    gulp.watch('index.html', ['copy-index']);
});
