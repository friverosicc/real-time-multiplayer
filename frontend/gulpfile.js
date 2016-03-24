var gulp = require('gulp');
var rimraf = require('rimraf');
var connect = require('connect');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var stylish = require('jshint-stylish');
var htmlmin = require('gulp-htmlmin');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var historyApiFallback = require('connect-history-api-fallback');
var connect = require('gulp-connect');
var jshint = require('gulp-jshint');
var ngTemplate = require('gulp-ng-templates');

var debug = false;

var sassPaths = [
    'vendor/angular-material',
    'vendor/animate.css/'
];
var jsVendorPaths = [
    'vendor/socket.io.client/dist/socket.io-1.3.5.js',
    'vendor/angular/angular.js',
    'vendor/angular-animate/angular-animate.js',
    'vendor/angular-aria/angular-aria.js',
    'vendor/angular-material/angular-material.js',
    'vendor/angular-messages/angular-messages.js',
    'vendor/moment/moment.js',
    'vendor/angular-moment/angular-moment.js'
];

gulp.task('clean', function(cb) {
    rimraf('./dist', cb);
});

gulp.task('js', function() {
    var jsTask = gulp.src(['src/app/**/*.js']);

    if(!debug)
        jsTask.pipe(uglify());

    jsTask.pipe(concat('demo-app.js'))
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
});

gulp.task('js:vendor', function() {
    var jsVendorTask = gulp.src(jsVendorPaths);

    if(!debug)
        jsVendorTask.pipe(uglify());

    jsVendorTask.pipe(concat('vendor.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('lint', function() {
    gulp.src(['src/app/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('html', function() {
    gulp.src('src/*.html')
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
});

gulp.task('tpl', function() {
    var tplTask = gulp.src(['src/app/**/*.tpl.html']);

    tplTask.pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(ngTemplate('demo-app-tpl'))
    .pipe(concat('demo-app-tpl.js'))
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
});

gulp.task('css', ['css:config'], function() {
	var cssTask = gulp.src('src/style/main.scss');

	cssTask.pipe(sass({ includePaths : sassPaths }))
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write())
	.pipe(gulp.dest('./dist/css'))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(autoprefixer('last 2 version'))
    .pipe(sourcemaps.write('./'))
	.pipe(gulp.dest('./dist/css'))
    .pipe(connect.reload());

    return cssTask;
});

gulp.task('css:config', function(cb) {
    rimraf('./vendor/angular-material/angular-material.css', cb);
});

gulp.task('font', function() {
    gulp.src(['vendor/material-design-icons/iconfont/**.*'])
    .pipe(gulp.dest('dist/css/fonts'));
});

gulp.task('img', function() {
    gulp.src(['src/style/img/**.*'])
    .pipe(gulp.dest('dist/css/img'));
});

gulp.task('connect', function() {
	gulp.watch(['src/index.html'], function() {
		gulp.src(['src/index.html'])
		.pipe(connect.reload());
	});

	connect.server({
        root: 'dist',
		livereload: true,
		port: 8082,
        middleware: function(connect, opt) {
			return [ historyApiFallback() ];
		}
	});
});

gulp.task('watch-mode', function() {
	var jsWatcher = gulp.watch(['src/app/**/*.js'], ['js']);
	var cssWatcher = gulp.watch('src/style/**/*.scss', ['css']);
    var htmlWatcher = gulp.watch('src/index.html', ['html']);
    var tplWatcher = gulp.watch('src/app/**/*.tpl.html', ['tpl']);

	function changeNotification(event) {
		console.log('File', event.path, 'was', event.type, ', running tasks...');
	}

	jsWatcher.on('change', changeNotification);
	cssWatcher.on('change', changeNotification);
	htmlWatcher.on('change', changeNotification);
    tplWatcher.on('change', changeNotification);
});

gulp.task('debug', function() {
    debug = true;
});

gulp.task('build', ['img', 'css', 'font', 'js', 'js:vendor', 'lint', 'html', 'tpl']);
gulp.task('default', ['watch-mode', 'build']);
gulp.task('server', ['connect', 'debug', 'default']);
