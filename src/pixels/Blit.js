export function blit() {
	constructor( canvas, x = 0, y = 0, width, height ) {
		width = width || canvas.width;
		height = height || canvas.height;
		this.canvas = document.createElement( 'canvas' );
		this.canvas.width = width;
		this.canvas.height = height;
		this.ctx = this.canvas.getContext( '2d' );
		this.ctx.drawImage( canvas, x, y, width, height, 0, 0, width, height );
	}

	getImageData() {
		return this.ctx.getImageData( 0, 0, this.canvas.width, this.canvas.height );
	}
}
