export class Colormap {
	constructor( img, colormapSize = 255 ) {
		this.image = null;
		this.colormapData = null;
		this.colormap = null;
		this.colormapCtx = null;
		this._colormapSize = colormapSize;
		if ( img instanceof Image ) {
			// create and parse a canvas element
			this.image = img;
			this.createCanvas();
		} else if ( typeof img === 'object' && img.getContext !== undefined ) {
			// we just got passed a canvas element
			this.image = img;
			this.createCanvas();
		} else if ( typeof img === 'string' ) {
			// prep loading colormap
			this.loadColormap( img );
		}
	}

	set colormapSize( val ) {
		this._colormapSize = val;
		if ( this.image && this.colormapCtx ) {
			this.colormap.height = this.colormap.width = this._colormapSize;
			this.colormapData = drawToCtx( this.image, this.colormapCtx, this._colormapSize );
		}
		return val;
	}

	onLoad() {}
	onError() {}
	onProgress() {};

	getPixel( x, y ) {
		var data = this.colormapData.data;
		var propX = Math.abs( x );
		var propY = Math.abs( y );
		propX %= 1;
		propY %= 1;
		var col = ( propX * this._colormapSize ) << 2; // multiply by 4 per pixel to account for [r,g,b,a] order
		var row = ( propY * this._colormapSize ) >> 0; // math.floor
		var rowWidth = this.colormapData.width << 2; // values per row
		var pixelIndex = col + ( row * rowWidth );
		return ( data[ pixelIndex ] << 16 ) | ( data[ pixelIndex + 1 ] << 8 ) | data[ pixelIndex + 2 ];
	}

	loadColormap( src ) {
		this.image = new Image();
		this.image.crossOrigin = 'anonymous';
		this.image.src = src;
		this.image.onload = this.createCanvas.bind( this );
		this.image.onerror = this.onError.bind( this );
		this.image.onProgress = this.onProgress.bind( this );
	}

	createCanvas() {
		this.colormap = document.createElement( 'canvas' );
		this.colormapCtx = this.colormap.getContext( '2d' );
		this.colormap.height = this.colormap.width = this._colormapSize;
		this.colormapData = drawToCtx( this.image, this.colormapCtx, this._colormapSize );
	}

	dispose() {
		this.image.onLoad = this.image.onerror = this.image.onprogress = null;
	}
}

function drawToCtx( img, ctx ) {
	ctx.drawImage( img, 0, 0, ctx.width, ctx.height );
	return ctx.getImageData( 0, 0, ctx.width, ctx.height );
}
