/* eslint-env es6 */
Math.TAU = Math.PI * 2;

class MouseTelemetrics {
	constructor( options ) {
		options = options || {};
		this.el = options.el || window;
		this.bufferLength = options.bufferLength || 4;

		this.bounds = this.updateBounds();

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
		}
	};

	updateBounds() {
		if ( this.el !== window ) {
			return this.bounds = this.el.getClientBoundingRect();
		} else {
			return this.bounds = {
				top: 0,
				left: 0,
				width: window.innerWidth,
				height: window.innerHeight
			}
		}
	}

	update( e ) {
		var state = {
			event: e,
			buffer: this.buffer,
			x: e.clientX,
			y: e.clientY
		};

		if ( this.el !== window ) {
			state.x += this.bounds.top - window.pageYOffset;
			state.y += this.bounds.left - window.pageXOffset;
		}

		state.ratioX = state.x / this.bounds.width;
		state.ratioY = state.y / this.bounds.height;

		state.ratioCenterX = 2 * ( state.ratioX - 0.5 );
		state.ratioCenterY = 2 * ( state.ratioY - 0.5 );

		if ( buffer.length > 1 ) {
			var dx = state.dx = MouseTelemetrics.delta( state.x, this.buffer[ 0 ].x );
			var dy = state.dy = MouseTelemetrics.delta( state.y, this.buffer[ 0 ].y );

			state.angle = MouseTelemetrics.angle( dx, dy );
			state.speed = MouseTelemetrics.speed( dx, dy );;
		}

		this.buffer.unshift( state );
		if ( buffer.length > this.bufferLength ) {
			this.buffer.pop();
		}
		return this._state = state;
	};

	static delta( x1, x0 ) {
		if ( typeof x1 !== 'number' || typeof x0 !== 'number' ) return 0;
		return x1 - x0;
	};

	static speed( dx, dy ) {
		return Math.sqrt( ( dx * dx ) + ( dy * dy ) );
	};

	static angle( dx, dy ) {
		return Math.atan2( dy, dx );
	};

	static normalizeAngle( rad ) {
		return Math.TAU + ( rad % Math.TAU );
	}

	static average( ...args ) {
		return args.reduce( ( m, a ) => m + a ) / args.length;
	};

	// -----------------------------------------------------
	// Getters & Setters

	get state() {
		return this._state;
	};

	get averageSpeed() {
		return MouseTelemetrics.average( this.buffer.map( ( state ) => state.speed ) );
	};

	get averageAngle() {
		return MouseTelemetrics.average( this.buffer.map( ( state ) => state.angle ) );
	};
}

module.exports = MouseTelemetrics;
