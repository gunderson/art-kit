// for consistency all time is in milliseconds
export default class CuePoint {
	constructor( time, callback, name ) {
		this.name = name;
		this.time = time;
		this.callback = callback;
		this.reset();
	}

	execute() {
		this.runCount++;
		this.callback();
	}

	reset() {
		this.runCount = 0;
	}
}
