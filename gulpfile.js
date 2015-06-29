var gulp = require('gulp');
var webpack = require('webpack');
var gulpWebpack = require('webpack-stream');
var yaml = require('gulp-yaml');
var jeditor = require('gulp-json-editor');

/////////////
// Webpack //
/////////////
gulp.task('webpack:dev', function () {
	var config = Object.create(require('./webpack.config.js'));

	config.plugins.push(new webpack.DefinePlugin({
		DEBUG: true
	}));

	config.devtool = 'cheap-module-source-map';
	config.debug = true;
	config.watch = true;

	return gulp.src('index.js')
	.pipe(gulpWebpack(config))
	.pipe(gulp.dest('build/'));
});

////////////
// Locale //
////////////
var localePath = 'locales/**/messages.yml';
gulp.task('locale', function () {
	return gulp.src(localePath)
	.pipe(yaml())
	/**
	 * Transform to Chrome format
	 */
	.pipe(jeditor(function (inObj) {
		var outObj = {};

		for (var key in inObj) {
			outObj[key] = {
				message: inObj[key]
			};
		}

		return outObj;
	}))
	.pipe(gulp.dest('build/_locales'));
});
gulp.task('locale:watch', ['locale'], function () {
	gulp.watch(localePath, ['locale']);
});

gulp.task('default', ['webpack:dev', 'locale:watch']);
