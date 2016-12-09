import midpoint from './Point';
import lerp from '../math/Range';

export function length( path ) {}

export function smooth( path, resolution, flatPath = false ) {
	if ( flatPath ) path = toPoints( path );
	let midpoints = [];
	for ( let i = 0, endi = path.length - 1; i < endi; i += 1 ) {
		midpoints = midpoints.concat( midpoint( path[ i ].x, path[ i ].y, path[ i + 1 ].x, path[ i + 1 ].y ) );
	}
	let curves = [];
	for ( let i = 0, endi = midpoints.length - 1; i < endi; i += 1 ) {
		curves.push( cubicBezier( midpoints[ i ].x, midpoints[ i ].y, path[ i + 1 ].x, path[ i + 1 ].y, midpoints[ i + 1 ].x, midpoints[ i + 1 ].y, resolution ) );
	}
	// flatten bezier curves into one path
	let points = curves.reduce( ( arr, bez ) => arr.concat( toArray( bez ) ), [] );
	// add endpoints
	points.unshift( path[ 0 ] );
	points.push( path[ path.length - 1 ] );
	if ( flatPath ) return toArray( points );
	return points;
}

export function toArray( path ) {
	return path.reduce( ( arr, pt ) => arr.concat( pt.x, pt.y ), [] );
}

export function toPoints( path ) {
	let arr = [];
	for ( let i = 0, endi = path.length; i < endi; i += 2 ) {
		arr.push( { x: path[ i ], y: path[ i + 1 ] } );
	}
	return arr;
}

export function interpolate( x0, y0, x1, y1, resolution ) {
	resolution = Math.max( 1, resolution || 20 );
	let step = 0;
	let path = [];
	do {
		path.push( lerp( x1, x0, step / resolution ) );
		path.push( lerp( y1, y0, step / resolution ) );
	} while ( ++step <= resolution );
	return path;
}

export function cubicBezierPosition( x0, y0, x1, y1, x2, y2, t ) {
	let x = ( 1 - t ) * ( 1 - t ) * x0 + 2 * ( 1 - t ) * t * x1 + t * t * x2;
	let y = ( 1 - t ) * ( 1 - t ) * y0 + 2 * ( 1 - t ) * t * y1 + t * t * y2;
	return { x, y };
}

export function cubicBezier( x0, y0, cpX, cpY, x1, y1, resolution ) {
	// default resolution to 20
	resolution = Math.max( 1, resolution || 20 );
	let step = 0;
	let path = [];
	do {
		path.push( cubicBezierPosition( x0, y0, cpX, cpY, x1, y1, step / resolution ) );
	} while ( ++step <= resolution );
	return path;
}
