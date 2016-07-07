/*eslint-env node */

var gulp = require('gulp');
var gutil = require('gulp-util');


/* *************
	CSS
************* */

var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var scss = require('postcss-scss');
var autoprefixer = require('autoprefixer');

var postcssProcessors = [
	autoprefixer( {
		browsers: 'last 2 versions'
	} )
];

var sassMainFile = 'src/sass/main.scss';
var sassFiles = 'src/sass/**/*.scss';

gulp.task('css', function() {
	gulp.src(sassMainFile)
		// PostCSS 
		.pipe(
			postcss(postcssProcessors, {syntax: scss})
		)
		// SASS to CSS
		.pipe(
			sass({ outputStyle: 'compressed' })
			.on('error', gutil.log)
		)
		.pipe(gulp.dest('dist/assets/css'));
});



/* *************
	JS
************* */
var uglify = require('gulp-uglify');
var jsFiles = 'src/scripts/**/*.js';

var jsMainFiles = 'src/scripts/main/*.js';
var jsSWFile = 'src/scripts/sw/service-worker.js';


gulp.task('js', function() {
	gulp.src(jsMainFiles)
		.pipe(uglify())
		.pipe(gulp.dest('dist/assets/js'));
	gulp.src(jsSWFile)
		.pipe(uglify())
		.pipe(gulp.dest('dist/'));
});




/* *************
  TEMPLATING
************* */

var fileinclude = require('gulp-file-include');

gulp.task('fileinclude', function() {
  gulp.src(['src/views/index.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('dist/'));
});


var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var concat = require('gulp-concat');

gulp.task('templates', function () {
    gulp.src('src/views/templates/*.hbs')
      .pipe(handlebars())
      .pipe(wrap('Handlebars.template(<%= contents %>)'))
      .pipe(declare({
          namespace: 'MyApp.templates',
          noRedeclare: true, // Avoid duplicate declarations
      }))
      .pipe(concat('templates.js'))
      .pipe(gulp.dest('dist/assets/js/'));
});




/* *************
	SERVER with BrowserSync
************* */

var browserSync = require('browser-sync');
gulp.task('connectWithBrowserSync', function() {
	browserSync.create();
	browserSync.init({
		server: './dist'
	});
});



	

/* *************
	WATCH
************* */

gulp.task('watch', function() {
	gulp.watch(sassFiles,['css']).on('change', browserSync.reload); 
	gulp.watch(jsFiles,['js']).on('change', browserSync.reload);
	gulp.watch(['src/views/*.html', 'src/views/templates/*.hbs'], ['fileinclude', 'templates']).on('change', browserSync.reload);
});



/* *************
	DEFAULT
************* */

gulp.task('default', ['connectWithBrowserSync', 'css', 'js', 'fileinclude', 'templates', 'watch']);
