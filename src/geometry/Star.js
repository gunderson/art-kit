import Point from './Point';
import Path from './Path';
import Polygon from './Polygon';
import {
	TAU
} from '../math/Constants';

const floor = Math.floor;
const sin = Math.sin;
const cos = Math.cos;

export default class Star extends Polygon {
	constructor( numPoints = 8, outerRadius = 1, innerRadius = 0.5 ) {
		let pts = [];
		numPoints = floor( numPoints );
		let segmentSweep = TAU / numPoints;
		for ( let i = 0; i < numPoints * 2; i += 1 ) {
			let radius = ( i % 2 ) ? innerRadius : outerRadius;
			pts.push(
				radius * cos( i * segmentSweep ),
				radius * sin( i * segmentSweep ),
			);
		}
		// loop back
		pts.push(
			pts[ 0 ],
			pts[ 1 ],
		);
		super( pts );
	}
}
