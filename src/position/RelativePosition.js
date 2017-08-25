/* eslint-env es6 */
module.exports = {
	Crossed,
	CrossedForward,
	CrossedReverse,
	Entered,
	Hopped,
	IsBetween,
	Left,
	TriggerBetween
};

export function TriggerBetween( x, px, start, end, onEntered, onLeft ) {
	onEntered = onEntered || noop;
	onLeft = onLeft || noop;
	if ( Entered( x, px, start, end ) ) {
		onEntered();
		return 1;
	} else if ( Left( x, px, start, end ) || Hopped( x, px, start, end ) ) {
		onLeft();
		return -1;
	}
	return false;
}

export function IsBetween( x, start, end ) {
	// flip if moving in reverse
	if ( end < start ) {
		var t = start;
		start = end;
		end = t;
	}
	return x >= start && x < end;
}

export function Entered( x, px, start, end ) {
	start = start || 0;
	end = end || 1;
	// if it is now between and was not between
	return IsBetween( x, start, end ) && !IsBetween( px, start, end );
}

export function Left( x, px, start, end ) {
	start = start || 0;
	end = end || 1;
	// if it was between and is now not between
	return IsBetween( px, start, end ) && !IsBetween( x, start, end );
}

export function Hopped( x, px, start, end ) {
	start = start || 0;
	end = end || 1;
	// if px is below the range and x is above the range
	// or
	// if px is above the range and x is below the range
	return ( px < start && x >= end ) || ( px >= end && x < start );
}

export function Crossed( x, px, target ) {
	if ( CrossedForward( x, px, target ) || CrossedReverse( x, px, target ) ) {
		return true;
	}
	return false;
}

export function CrossedForward( x, px, target ) {
	// was below and now above
	if ( x > target && px <= target ) {
		return true;
	}
	return false;
}

export function CrossedReverse( x, px, target ) {
	// was above and now below
	if ( x <= target && px > target ) {
		return true;
	}
	return false;
}

function noop() {}
