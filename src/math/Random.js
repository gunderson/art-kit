// PSEUDO RANDOM GENERATOR
// taken from wikipedia
var _m_ = 4294967296,
	// a - 1 should be divisible by m's prime factors
	_a_ = 1664525,
	// c and m should be co-prime
	_c_ = 1013904223;
// Setting the seed
var _z_ = 123456789;

export default function random( min = 0, max, seed ) {
	// seed is optional
	if ( typeof seed === 'number' ) {
		random.setSeed( seed );
	}
	// make max optional
	if ( min !== undefined && max === undefined ) {
		max = min;
		min = 0;
	} else {
		max = max || 1;
	}
	let range = max - min;
	_z_ = ( _a_ * _z_ + _c_ ) % _m_;
	return min + ( range * _z_ / _m_ );
}

random.setSeed = ( seed ) => ( _z_ = seed );
