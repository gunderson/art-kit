import {
	mean
} from '../math/Analysis';
import {
	buffer
} from '../Util';
import {
	delta,
	dist,
	angle
} from '../position/Telemetrics';

export default class MouseTelemetrics {
	constructor( options ) {
		options = options || {};
		this.el = options.el || window;
		this.bufferLength = options.bufferLength || 4;

		this._state = {
			event: null,
			buffer: [],
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			angle: 0,
			speed: 0,
			averageAngle: 0,
			averageSpeed: 0
		};
		this.buffer = [];
	};

	updateBounds() {
		if ( this.el !== window ) {
			return ( this.bounds = this.el.getBoundingClientRect() );
		} else {
			return ( this.bounds = {
				top: 0,
				left: 0,
				width: window.innerWidth,
				height: window.innerHeight
			} );
		}
	}

	update( e ) {
		var state = {
			event: e,
			x: e.pageX,
			y: e.pageY
		};

		if ( this.el !== window ) {
			state.x -= this.bounds.left - window.pageXOffset;
			state.y -= this.bounds.top - window.pageYOffset;
		}

		state.ratioX = state.x / this.bounds.width;
		state.ratioY = state.y / this.bounds.height;

		state.ratioCenterX = 2 * ( state.ratioX - 0.5 );
		state.ratioCenterY = 2 * ( state.ratioY - 0.5 );

		if ( this.buffer.length > 1 ) {
			let [ dx, dy ] = delta( this.buffer[ 0 ].x, this.buffer[ 0 ].y, state.x, state.y );
			state.dx = dx;
			state.dy = dy;
			state.angle = angle( this.buffer[ 0 ].x, this.buffer[ 0 ].y, state.x, state.y );
			state.speed = dist( this.buffer[ 0 ].x, this.buffer[ 0 ].y, state.x, state.y );
		}

		buffer( this.buffer, state, this.bufferLength );
		return ( this._state = state );
	};

	// -----------------------------------------------------
	// Getters & Setters

	set el( el ) {
		this._el = el;
		this.bounds = this.updateBounds();
	}

	get el() {
		return this._el;
	}

	get state() {
		return this._state;
	};

	get averageSpeed() {
		return mean( this.buffer.map( ( state ) => state.speed ) );
	};

	get averageAngle() {
		return mean( this.buffer.map( ( state ) => state.angle ) );
	};
}
