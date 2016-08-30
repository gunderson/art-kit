import CuePoint from 'CuePoint';
import CrossedForward from '../position/RelativePosition';

// for consistency all time is in milliseconds
export default class Timeline {
	constructor() {
		this._cuePoints = [];
		this._time = 0;
		this._prevTime = 0;
		this.active = true;
		this.duration = 0;
	}

	add( time, callback ) {
		let cp = time instanceof CuePoint ? time : new CuePoint( time, callback );
		this._cuePoints.push( cp );
		this._cuePoints.sort( sortByTime );
	}

	reset() {
		this._cuePoints
			.forEach( ( cp ) => cp.reset() );
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
}

function sortByTime( a, b ) {
	return a.time - b.time;
}
