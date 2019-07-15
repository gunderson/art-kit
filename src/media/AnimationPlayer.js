// for consistency all time is in milliseconds by default
export default class AnimationPlayer {
	constructor( options ) {
		this.timeout = null;
		this.raf = null;
		this.currentTime = 0;
		this.fps = 60;
		this.lastTickTime = -1;
		this.deltaTime = 0;
		this.playState = AnimationPlayer.PAUSED;

		this._update = options.update || this._update;
		this._draw = options.draw || this._draw;
		this.duration = options.duration || 0;
		this.loop = options.loop || false;
		this.onPlay = options.onPlay || this.onPlay;
		this.onPause = options.onPause || this.onPause;
		this.onStart = options.onStart || this.onStart;
		this.onEnd = options.onEnd || this.onEnd;
		this.onReset = options.onReset || this.onReset;

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
		if ( this.duration > -1 ) {
			return this.currentTime / this.duration;
		}
		console.warn( 'duration must be set to find percentComplete' );
		return undefined;
	}

	set percentComplete( val ) {
		if ( this.duration > -1 ) {
			this.currentTime = val * this.duration;
		} else {
			console.warn( 'duration must be set to set percentComplete' );
		}
		return val;
	}

	get fps() {
		return this._fps;
	}

	set fps( val ) {
		this._fps = val;
		this.tickIntervalMillis = 1000 / this._fps;
	}

	play() {
		if ( this.playState === AnimationPlayer.PLAYING ) return;
		this.lastTickTime = Date.now();
		this.playState = AnimationPlayer.PLAYING;
		this.onPlay();
		this.update();
		this.draw();
	}

	pause() {
		this.playState = AnimationPlayer.PAUSED;
		clearTimeout( this.timeout );
		cancelAnimationFrame( this.raf );
		this.raf = null;
		this.timeout = null;
		this.onPause();
	}

	reset() {
		this.pause();
		this.currentTime = 0;
		this.deltaTime = 0;
		this.onReset();
	}

	update() {
		var now = Date.now();
		this.deltaTime = now - this.lastTickTime;

		this.currentTime += this.deltaTime;
		this.currentTick = Math.round( this.currentTime / this.tickIntervalMillis );

		var nextTickTime = ( this.currentTick + 1 ) * this.tickIntervalMillis;
		var timeToNextTick = nextTickTime - this.currentTime;

		this.lastTickTime = now;

		if ( this.currentTime === 0 ) {
			this.onStart();
		}
		if ( this.duration && this.currentTime >= this.duration ) {
			if ( this.loop ) {
				this.reset();
				this.play();
			} else {
				this.currentTime = this.duration;
				this.pause();
			}
			this.onEnd();
		}
		this._update( {
			currentTime: this.currentTime,
			currentTick: this.currentTick
		} );

		if ( this.playState === AnimationPlayer.PLAYING ) {
			this.timeout = setTimeout( this.update, timeToNextTick );
		}
	}

	draw() {
		this._draw();
		this.raf = requestAnimationFrame( this.draw );
	}

	onPlay() {}
	onPause() {}
	onStart() {}
	onEnd() {}
	onReset() {}

	_update( data ) {}
	_draw() {}
}

AnimationPlayer.PLAYING = 'PLAYING';
AnimationPlayer.PAUSED = 'PAUSED';
