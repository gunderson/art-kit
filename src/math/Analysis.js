export function mean( arr ) {
	return arr.reduce( sum ) / arr.length;
}

export function easedMean( arr, direction = -1, easing = 1 ) {
	let easeFn,
		steps = arr.length;
	if ( typeof easing === 'number' ) {
		if ( easing === 0 ) return mean( arr );
		easeFn = ( i ) => Math.pow( i, easing );
	} else {
		easeFn = easing;
	}

	let weights = new Array( arr.length )
		.map( ( n, i ) => easeFn( ( i + 1 ) / steps ) );

	if ( direction < 0 ) weights = weights.reverse();
	return weightedAverage( arr, weights );
}

export function weightedAverage( values, weights ) {
	let sumWeight = weights.reduce( sum );
	let weighted = values.map( ( val, i ) => val * weights[ i ] );
	let sumWeighted = weighted.reduce( sum );
	return sumWeighted / ( values.length * sumWeight );
}

export function sum( a, b ) {
	return a + b;
}

export function normalize( arr ) {
	let max = Math.max( ...arr );
	return arr.map( ( v ) => v / max );
}
