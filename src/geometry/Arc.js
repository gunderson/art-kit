import Point from './Point';
import Path from './Path';
import Polygon from './Polygon';
import {
	TAU
} from '../math/Constants';

export default class Arc extends Polygon {
	constructor( radius = 1, resolution = 8, close = true, startAngle = 0, endAngle = TAU, direction = 1 ) {
		let pts = this._points = [];
		let totalSweep = ( endAngle - startAngle ) % TAU;
		let segmentSweep = totalSweep / resolution;
		resolution = close ? resolution + 1 : resolution;
		let i = 0;
		while ( i < resolution ) {
			pts.push( new Point(
				radius * Math.cos( startAngle + direction * i * segmentSweep ),
				radius * Math.sin( startAngle + direction * i * segmentSweep )
			) );
			i++;
		}
		if ( close ) {
			pts.push( pts[ 0 ] );
		}
		super( pts );
	}
}
