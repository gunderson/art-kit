/* eslint-env es6 */
'use strict';
const gulp = require( 'gulp' );
const rename = require( 'gulp-rename' );
const ugilfy = require( 'gulp-uglify' );

gulp.task( 'process-scripts', () => {
	return gulp.src( './src/*.js' )
		.pipe( uglify() )
		.pipe( rename( ( n ) => {
			n.basename += '.min';
			return n;
		} ) )
		.pipe( gulp.dest( './min/*.min.js' ) );
} );

gulp.task( 'default', [ 'process-scripts' ] );
