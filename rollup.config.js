import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
	entry : './src/index.js',
	dest : './min/art-kit.min.js',
	format : 'cjs',
	sourceMap : true,
	moduleName : 'art-kit',
	treeshake : false,
	plugins : [
		babel( ),
		uglify( )
	]
};
