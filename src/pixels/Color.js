// supports 16bit color
// tracks color in the RGB space

// FIXME: this class doesn't do much yet.

export default class Color {
	constructor( r, g, b, a, mode = 'rgb' ) {
		this.r = 0xff;
		this.g = 0xff;
		this.b = 0xff;
		this.a = 1;

		if ( r === undefined ) return this;

		if ( r && g === undefined && b === undefined ) {
			let c = Color.parseColor( r );
			r = c.r;
			g = c.g;
			b = c.b;
		}

		switch ( mode ) {
			case 'hsl':
				this.setHSL( r, g, b );
				break;
			case 'rgb':
			default:
				this.setRGB( r, g, b, a );
		}
	}

	setHSL( h, s, l, a ) {
		return this;
	}
	setRGB( r, g, b, a ) {
		return this;
	}

	get int() {
		return ( this.r << 16 ) | ( this.g << 8 ) | this.b;
	}

	get hex() {
		return `#${this.int}`;
	}

	get hsl() {}
	get h() {}
	get s() {}
	get l() {}

	set h( val ) {
		this.setHSL( val, s, l );
		return val;
	}

	set s( val ) {
		this.setHSL( h, val, l );
		return val;
	}

	set l( val ) {
		this.setHSL( h, s, val );
		return val;
	}

	static parseColor( input ) {
		if ( input instanceof Color ) return Color;
		if ( typeof input === 'string' ) {
			input = parseInt( input, 16 );
		}
		if ( typeof input === 'number' ) {
			return {
				r: input >> 16 & 0xff,
				g: input >> 8 & 0xff,
				b: input & 0xff
			}
		}
		return undefined;
	}
}
