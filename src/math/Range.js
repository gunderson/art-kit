export default function range( min, max, step = 1 ) {
	// allow single argument use
	if ( max === undefined ) {
		max = min;
		min = 0;
	}
	let a = [],
		i = min;
	do {
		a.push( i );
		i += step;
	} while ( i <= max );
	return a;
}

export function lerp( a, b, i ) {
	return b + ( b - a ) * i;
}

export function clamp( n, min, max ) {
	return Math.min( Math.max( min, n ), max );
}
