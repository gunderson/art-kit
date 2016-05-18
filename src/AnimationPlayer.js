/* eslint-env es6 */
'use strict';

class AnimationPlayer {
	constructor( update ) {
		this.timeout = null;
		this.currentTime = 0;
		this.fps = 60;
		this.update = update || this.update;
	}

	set fps( val ) {
		this._fps = val;
		this.tickIntervalMillis = 1000 / this._fps;
	}

	play() {
		if ( this.timeout ) return;
		this.lastTickTime = Date.now();
		this.loop();
	}

	stop() {
		clearTimeout( this.timeout );
		this.timeout = null;
	}

	reset() {
		this.stop();
		this.currentTime = 0;
	}

	loop() {
		var now = Date.now();
		var loopTime = now - this.lastLoopTime;

		this.currentTime += loopTime;
		this.currentTick = Math.floor( this.currentTime / this.tickIntervalMillis );

		var nextTickTime = ( this.currentTick + 1 ) * this.tickIntervalMillis;
		var timeToNextTick = nextTickTime - this.currentTime;

		this.lastLoopTime = now;

		this.timeout = setTimeout( this.loop.bind( this ), timeToNextTick );
		this.update();
	}

	update() {}
}

module && module.exports && module.exports = AnimationPlayer;
return AnimationPlayer;
