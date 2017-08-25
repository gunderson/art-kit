import {
	midpoint
} from './Point';
import {
	dist
} from '../position/Telemetrics';
import {
	lerp
} from '../math/Range';

export default class Path {
	constuctor( points = [] ) {
		if ( points.length > 0 && typeof points[ 0 ] === 'number' ) {
			points = toPoints( points );
		}
		this.points = points;
	}

	[ Symbol.iterator ]() {
		return this.points.values()
	}

	toJSON() {
		return this.points;
	}

	toArray() {
		return toArray( this.points );
	}

	toString() {
		return JSON.stringify( this.toArray() );
	}

	interpolate( resolution = 2, returnFlat = false ) {
		let pA = this.toArray();
		let interpolatedPointArray = [];
		for ( let i = 0; i < pA.length; i += 4 ) {
			interpolatedPointArray.push.apply( interpolatedPointArray, interpolate( pA[ 0 ], pA[ 1 ], pA[ 2 ], pA[ 3 ], resolution ) );
		}
		return returnFlat ? interpolatedPointArray : toPoints( interpolatedPointArray );
	}

	concat( points = [] ) {
		this.points = this.points.concat( points.obj );
		return this;
	}
}

export function length( path ) {
	return path.reduce( ( m, p0, i, path ) => {
		if ( i >= path.length - 1 ) return 0;
		let p1 = path[ i + 1 ];
		return dist( p0.x, p0.y, p1.x, p1.y );
	}, 0 );
}

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

export function toArray( flat ) {
	return flat.reduce( ( arr, pt ) => arr.concat( pt.x, pt.y ), [] );
}

export function toPoints( path ) {
	let arr = [];
	for ( let i = 0, endi = path.length; i < endi; i += 2 ) {
		arr.push( {
			x: path[ i ],
			y: path[ i + 1 ]
		} );
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
	return {
		x,
		y
	};
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
