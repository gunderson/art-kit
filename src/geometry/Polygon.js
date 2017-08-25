import Point from './Point';
import Path from './Path';
import {
	TAU
} from '../math/Constants';

const floor = Math.floor;
const sin = Math.sin;
const cos = Math.cos;

export default class Polygon {
	constructor( points, radius = 1, circumscribe = false ) {
		if ( typeof points === 'number' ) {
			points = makeRegularPolygon.apply( this, arguments );
		}
		this._points = points;
		this.path = new Path( points );
		this._translate = {
			x: 0,
			y: 0
		};
	}

	resetPosition() {
		this.translate( -this._translate.x, -this._translate.y );
		return this;
	}

	translate( x = 0, y = 0 ) {
		this._translate.x += x;
		this._translate.y += y;
		this.path.forEach( ( pt ) => {
			pt.x += x;
			pt.y += y;
		} );
		return this;
	}

	scale() {

	}

	get points() {
		return this._points;
	}
}

export function makeRegularPolygon( numVerts = 8, radius = 1, circumscribe = false ) {
	let points = [];
	numVerts = floor( numVerts );
	if ( circumscribe ) {
		radius = radius;
	}
	let segmentSweep = TAU / numVerts;
	for ( let i = 0; i < numVerts; i++ ) {
		points.push(
			radius * cos( i * segmentSweep ),
			radius * sin( i * segmentSweep ),
		)
	}
	points.push( points[ 0 ], points[ 1 ] );
	return points;
}
