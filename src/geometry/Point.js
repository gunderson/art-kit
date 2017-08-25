import {
	mean
} from '../math/Analysis';
import {
	buffer
} from '../Util';

export default class Point {
	constructor( x = 0, y = 0, z = 0, bufferLength = 1 ) {
		this.bufferLength = bufferLength;
		this.bufferX = [];
		this.bufferY = [];
		this.bufferZ = [];
		this.x = x;
		this.y = y;
		this.y = z;
		this.angle = 0;
		this.speed = 0;
	}

	set x( val ) {
		buffer( this.bufferX, val, this.bufferLength );
		this._x = val;
	}

	set y( val ) {
		buffer( this.bufferY, val, this.bufferLength );
		this._y = val;
	}

	set z( val ) {
		buffer( this.bufferZ, val, this.bufferLength );
		this._z = val;
	}

	get x() {
		return this._x;
	}

	get y() {
		return this._y;
	}

	get z() {
		return this._z;
	}

	get smoothX() {
		return mean( this.bufferX );
	}

	get smoothY() {
		return mean( this.bufferY );
	}

	get smoothZ() {
		return mean( this.bufferZ );
	}
}

export function midpoint( x0, y0, z0, x1, y1, z1 ) {
	// z values are optional
	if ( typeof y1 === 'undefined' && typeof z1 === 'undefined' ) {
		// shift values for optional z argument
		y1 = x1;
		x1 = z0;
		z0 = z1 = 0;
	}
	let halfdx = 0.5 * ( x1 - x0 );
	let halfdy = 0.5 * ( y1 - y0 );
	let halfdz = 0.5 * ( z1 - z0 );
	return {
		x: x0 + halfdx,
		y: y0 + halfdy,
		z: z0 + halfdz,
	};
}
