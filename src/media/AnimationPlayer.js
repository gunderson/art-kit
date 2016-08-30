// for consistency all time is in milliseconds by default
export default class AnimationPlayer {
	constructor( update, draw ) {
		this.timeout = null;
		this.raf = null;
		this.currentTime = 0;
		this.fps = 60;
		this._update = update || this._update;
		this._draw = draw || this._draw;
		this.duration = null;
		this.lastLoopTime = -1;
		this.update = this.update.bind( this );
		this.draw = this.draw.bind( this );
	}

	get timeRemaining() {
		if ( this.duration ) {
			return this.duration - this.currentTime;
		}
		console.warn( 'duration must be set to find timeRemaining' );
		return undefined;
	}

	get percentComplete() {
		if ( this.duration ) {
			return this.currentTime / this.duration;
		}
		console.warn( 'duration must be set to find percentComplete' );
		return undefined;
	}

	get fps() {
		return this._fps;
	}

	set fps( val ) {
		this._fps = val;
		this.tickIntervalMillis = 1000 / this._fps;
	}

	play() {
		if ( this.timeout ) return;
		this.lastLoopTime = this.lastTickTime = Date.now();
		this.update();
		this.draw();
	}

	stop() {
		clearTimeout( this.timeout );
		cancelAnimationFrame( this.raf );
		this.timeout = null;
	}

	reset() {
		this.stop();
		this.currentTime = 0;
	}

	update() {
		var now = Date.now();
		var loopTime = now - this.lastLoopTime;

		this.currentTime += loopTime;
		this.currentTick = Math.round( this.currentTime / this.tickIntervalMillis );

		var nextTickTime = ( this.currentTick + 1 ) * this.tickIntervalMillis;
		var timeToNextTick = nextTickTime - this.currentTime;

		this.lastLoopTime = now;

		this.timeout = setTimeout( this.update, timeToNextTick );
		this._update( {
			currentTime: this.currentTime,
			currentTick: this.currentTick
		} );
	}

	draw() {
		this._draw();
		this.raf = requestAnimationFrame( this.draw );
	}

	_update( data ) {}
	_draw() {}
}
