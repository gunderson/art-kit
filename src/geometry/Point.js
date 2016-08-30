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
