export function buffer( buf, val, bufferLength = buf.length ) {
	if ( val ) {
		buf.unshift( val );
		while ( buf.length > bufferLength ) {
			buf.pop();
		}
	}
	return buf;
}

export function sampleFn( fn, period, numSamples ) {
	return new Array( numSamples )
		.map( ( n, i ) => fn( period * i / numSamples ) );
}
