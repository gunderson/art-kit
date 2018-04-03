const chalk = require( 'chalk' );
const path = require( 'path' );

function buffer( buf, val, bufferLength = buf.length ) {
	if ( val ) {
		buf.unshift( val );
		while ( buf.length > bufferLength ) {
			buf.pop();
		}
	}
	return buf;
}

function sampleFn( fn, period, numSamples ) {
	return new Array( numSamples )
		.map( ( n, i ) => fn( period * i / numSamples ) );
}


function log() {
	return console.log.apply( console, [ `[ ${chalk.cyan(path.basename(require.main.filename))} ${chalk.gray(process.uptime())} ]` ].concat( arguments ) );
}

module.exports = {
	buffer,
	sampleFn,
	log
}
