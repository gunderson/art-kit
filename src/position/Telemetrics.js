import {
	PI,
	TAU
} from '../math/Constants';

export function angle( x0, y0, x1, y1, pos ) {
	let [ dx, dy ] = delta( x0, y0, x1, y1 );
	let ang = Math.atan2( dy, dx );
	return pos ? ( ang + TAU ) % TAU : ang;
}

export function dist( x0, y0, x1, y1 ) {
	let [ dx, dy ] = delta( x0, y0, x1, y1 );
	return Math.sqrt( ( dx * dx ) + ( dy * dy ) );
}

export function delta( x0, y0, x1, y1 ) {
	return [ x1 - x0, y1 - y0 ];
}

export function normalizeAngle( rad ) {
	return ( TAU + rad ) % TAU;
}

export function d2r( deg ) {
	return TAU * deg / 360;
}

export function r2d( rad ) {
	return rad * 360 / TAU;
}
