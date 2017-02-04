import Point from './Point';
import {
	TAU
} from '../math/Constants';

export default class Arc {
	constructor( radius, segments, close = true, startAngle = 0, endAngle = TAU, direction = 1 ) {
		this._points = [];
		let sweep = endAngle - startAngle;
		let segmentSweep = sweep / segments;
		segments = close ? segments + 1 : segments;
		let i = 0;
		while ( i < segments ) {
			this._points.push( new Point(
				radius * Math.cos( startAngle + direction * i * segmentSweep ),
				radius * Math.sin( startAngle + direction * i * segmentSweep )
			) );
			i++;
		}
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
		this._points.forEach( ( pt ) => {
			pt.x += x;
			pt.y += y;
		} );
		return this;
	}

	get points() {
		return this._points;
	}
}
