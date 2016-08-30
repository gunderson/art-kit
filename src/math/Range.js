export function lerp( a, b, i ) {
	return b + ( b - a ) * i;
}

export function clamp( n, min, max ) {
	return Math.min( Math.max( min, n ), max );
}
