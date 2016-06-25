/* eslint-env es6 */
'use strict';

class AnimationPlayer {
	constructor( update, draw ) {
		this.timeout = null;
		this.raf = null;
		this.currentTime = 0;
		this.fps = 60;
		this._update = update || this._update;
		this._draw = draw || this._draw;

		this.update = this.update.bind( this );
		this.draw = this.draw.bind( this );
	}

	set fps( val ) {
		this._fps = val;
		this.tickIntervalMillis = 1000 / this._fps;
	}

	play() {
		if ( this.timeout ) return;
		this.lastTickTime = Date.now();
		this.update();
		this.draw();
	}

	stop() {
		clearTimeout( this.timeout );
		cancelAnimtionFrame( this.raf );
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
		this.currentTick = Math.floor( this.currentTime / this.tickIntervalMillis );

		var nextTickTime = ( this.currentTick + 1 ) * this.tickIntervalMillis;
		var timeToNextTick = nextTickTime - this.currentTime;

		this.lastLoopTime = now;

		this.timeout = setTimeout( this.update, timeToNextTick );
		this._update();
	}

	draw() {
		this._draw();
		this.raf = requestAnimationFrame( this.draw );
	}

	_update() {}
	_draw() {}
}

module.exports = AnimationPlayer;
