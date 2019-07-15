import CuePoint from './CuePoint.js';
import {
	CrossedForward
} from '../position/RelativePosition.js';

// for consistency all time is in milliseconds
export default class Timeline {
	constructor( cuePoints ) {
		this._cuePoints = [];
		if ( cuePoints && cuePoints.length > 0 ) {
			cuePoints.forEach( ( arr ) => this.addCuePoint.apply( this, arr ) );
		}
		this._time = 0;
		this._prevTime = 0;
		this.active = true;
		this.duration = 1000;
	}

	addCuePoint( time, callback, name ) {
		let cp = time instanceof CuePoint ? time : new CuePoint( time, callback, name );
		this._cuePoints.push( cp );
		this._cuePoints.sort( sortByTime );
		return this;
	}

	removeCuePoint( name ) {
		this._cuePoints = this._cuePoints.filter( ( cp ) => cp !== name && cp.name !== name );
		return this;
	}

	addDuration( startTime, duration, callback, name ) {

	}

	reset() {
		this._cuePoints
			.forEach( ( cp ) => cp.reset() );
		return this;
	}

	set time( val ) {
		this._prevTime = this._time;
		this._time = val;
		if ( !this.active ) return val;
		this._cuePoints
			.filter( ( cp ) => CrossedForward( this._time, this._prevTime, cp.time ) )
			.forEach( ( cp ) => cp.execute() );
		return val;
	}

	get time() {
		return this._time;
	}

	get percentComplete() {
		return this.time / this.duration;
	}

	set percentComplete( val ) {
		this.time = val * this.duration;
		return val;
	}

	update( time ) {
		this.time = time;
		return this;
	}
}

function sortByTime( a, b ) {
	return a.time - b.time;
}
