var Q = require("q");

var Colormap = function(imgSrc) {
	this.deferred = Q.defer();
	this.colormapData = null;
	this.colormap = null;

	if (imgSrc) {
		this.loadColormap(imgSrc);
	}

	return this;
};

Colormap.prototype.loadColormap = loadColormap;
Colormap.prototype.getRGB = getRGB;


function loadColormap(imgSrc) {
	this.colormap = new Image();
	this.colormap.crossOrigin = "anonymous";
	this.colormap.src = imgSrc;
	this.colormap.onload = onColormapLoadComplete.bind(this);
	this.colormap.onerror = this.deferred.reject;
	return this.deferred.promise;
}

function onColormapLoadComplete() {
	var colormapCanvas = document.createElement("canvas");
	colormapCanvas.attributes.height = colormapCanvas.attributes.width = 256;
	var colormapCtx = colormapCanvas.getContext("2d");
	colormapCtx.drawImage(this.colormap, 0, 0, 256, 256);
	this.colormapData = colormapCtx.getImageData(0, 0, 256, 256);
	this.deferred.resolve(this);
}

function getRGB(x, y, colormapOffset) {
	var data = this.colormapData.data;
	var propX = Math.abs(x) + colormapOffset.x;
	var propY = Math.abs(y) + colormapOffset.y;
	propX %= 1;
	propY %= 1;
	var col = (propX * this.colormapData.width) << 2; // multiply by 4 per pixel to account for [r,g,b,a] order
	var row = (propY * this.colormapData.height) >> 0; // math.floor
	var rowWidth = this.colormapData.width << 2; // values per row
	return (data[col + (row * rowWidth) + 0] << 16) | (data[col + (row * rowWidth) + 1] << 8) | data[col + (row * rowWidth) + 2];
}

module.exports = Colormap;
