import {
	mean
} from '../math/Analysis';
import {
	buffer
} from '../Util';

export default class Point {
	constructor( x, y, bufferLength = 1 ) {
		this.bufferLength = bufferLength;
		this.bufferX = [];
		this.bufferY = [];
		this.x = x;
		this.y = y;
		this.angle = 0;
		this.speed = 0;
	}

	set x( val ) {
		buffer( this.bufferX, this._x, this.bufferLength );
		this._x = val;
	}

	set y( val ) {
		buffer( this.bufferY, this._y, this.bufferLength );
		this._y = val;
	}

	get x() {
		return this._x;
	}

	get y() {
		return this._y;
	}

	get smoothX() {
		return mean( this.bufferX );
	}

	get smoothY() {
		return mean( this.bufferY );
	}
}

export function midpoint( x0, y0, x1, y1 ) {
	let halfdx = 0.5 * ( x1 - x0 );
	let halfdy = 0.5 * ( y1 - y0 );
	return {
		x: x0 + halfdx,
		y: y0 + halfdy
	};
}
