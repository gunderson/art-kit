#!/usr/bin/env node

let log = require( '../Util' );
let fs = require( 'fs-extra-promise' );
let path = require( 'path' );
let yargs = require( 'yargs' );
let JSONStream = require( 'JSONStream' );
let wav = require( 'node-wav' );
let dsplib = require( 'dsp.js' );
let DSP = dsplib.DSP;
let FFT = dsplib.FFT;

// -----------------------------------------------------------------------
// CLI

let argv = yargs.usage( '$0 [args]' )
	.options( {
		'input': {
			alias: 'i',
			demandOption: true,
			default: 'audio.wav',
			describe: 'input file path',
			type: 'string'
		},
		'output': {
			alias: 'o',
			default: 'fft.json',
			describe: 'output file path',
			type: 'string'
		},
		'fps': {
			alias: 'fps',
			default: 60,
			describe: 'output file path',
			type: 'number'
		},
		'outputResolution': {
			alias: 'r',
			default: 2048,
			describe: 'max value to scale outputs',
			type: 'number'
		},
		'smoothingFactor': {
			alias: 's',
			default: 5,
			describe: 'number of frames to smooth against',
			type: 'number'
		},
		'channel': {
			alias: 'c',
			default: 0,
			describe: 'channel to analyze, 0:left, 1:right, 2:both',
			type: 'number'
		},
		'outputFormat': {
			alias: 'f',
			default: 'json',
			describe: 'json|bin',
			type: 'string'
		}

	} )
	.help()
	.argv

var inputPath = path.resolve( argv.input );
var outputPath = path.resolve( argv.output );
var fps = argv.fps;
var outputResolution = argv.outputResolution;
var smoothingFactor = argv.smoothingFactor;
var channel = argv.channel;
var outputFormat = argv.outputFormat;

// -----------------------------------------------------------------------
// Variables

var samplesPerFrame, bufferSize, fft, frameIndex;

// -----------------------------------------------------------------------
// Run Program

init();

// -----------------------------------------------------------------------
// Functions

function init() {
	console.log( `Reading file ${inputPath}` );
	fs.readFileAsync( inputPath )
		.then( ( buffer ) => wav.decode( buffer ) )
		.then( ( wav ) => {
			samplesPerFrame = wav.sampleRate / fps;
			// round up from samples per frame to the next power of 2
			bufferSize = Math.pow( 2, Math.ceil( Math.log2( samplesPerFrame ) ) );
			console.log( `Sample Rate: ${wav.sampleRate}` );
			console.log( `Buffer Size: ${bufferSize}` );
			fft = new FFT( bufferSize, wav.sampleRate );
			frameIndex = 0;
			return wav;
		} )
		.then( computeFFT )
		.then( smoothFFT )
		.then( saveToDisk )
		.then( () => {
			console.log( "Operation Complete!" );
		} )
		.catch( ( e ) => console.log( e ) );
}

function saveToDisk( compressedSpectrum ) {
	let maxPeak = compressedSpectrum.slice()
		.sort( ( a, b ) => b - a )[ 0 ];
	console.log( `Max Peak: ${maxPeak}` );
	let normalizedCompressedSpectrum = compressedSpectrum.map( ( v ) => Math.floor( outputResolution * v / maxPeak ) );
	console.log( 'Normalize Compressed Spectrum' )
	let saveFilePromise, normalized;
	switch ( outputFormat ) {
		case 'png':
			break;
		case 'bin':
			saveFilePromise = saveBinary( normalizedCompressedSpectrum );
			break;
		case 'json':
		default:
			let spectrumArrays = [];
			for ( var i = 0; i < normalizedCompressedSpectrum.length; i++ ) {
				spectrumArrays[ i ] = normalizedCompressedSpectrum.slice( i * bufferSize, ( i + 1 ) * bufferSize );
			}
			saveFilePromise = saveJSON( spectrumArrays );
			break;
	}
	return saveFilePromise.then( () => {
		console.log( `Spectrum saved to ${outputPath}` );
	} );
}

function saveJSON( normalizedSpectrum ) {
	return new Promise( ( resolve, reject ) => {
		let transformStream = JSONStream.stringify();
		let outputStream = fs.createWriteStream( outputPath );
		transformStream.pipe( outputStream );
		normalizedSpectrum.forEach( transformStream.write );
		transformStream.end();
		outputStream.on(
			"finish",
			resolve
		);
	} )
}

function saveBinary( normalizedCompressedSpectrum ) {
	return new Promise( ( resolve, reject ) => {
		/*
		// meta byte order:
		metaByteOrder = [ {
			startIndex: 0,
			length: 8,
			type: 'fileType'
		}, {
			startIndex: 8,
			length: 2,
			type: 'total meta bytes'
		},{
			startIndex: 10,
			length: 2,
			type: 'output resolution'
		},{
			startIndex: 12,
			length: 2,
			type: 'total frames'
		},{
			startIndex: 14,
			length: 2,
			type: 'bins per frame'
		},{
			startIndex: 16,
			length: 2,
			type: 'frames per second'
		},{
			startIndex: 18,
			length: 'up to 65518',
			type: 'unused'
		} ]
		*/

		console.log( 'Saving Binary' )

		let fileType = str2codes( 'FTHd' );
		let meta = [];
		meta[ 0 ] = meta.length * 2;
		meta[ 1 ] = outputResolution;
		meta[ 2 ] = normalizedCompressedSpectrum.length / bufferSize;
		meta[ 3 ] = bufferSize;
		meta[ 4 ] = fps;

		console.log( 'create file array', fileType.length * 2, meta.length * 2, normalizedCompressedSpectrum.length * 2 )
		let fileBytes = new Uint8Array( fileType.length * 2 + meta.length * 2 + normalizedCompressedSpectrum.length * 2 );
		// copy the values
		let byteIndex = 0;
		// header
		console.log( 'copy header' )
		let fileType8 = new Uint8Array( Uint16Array.from( fileType )
			.buffer );
		console.log( fileBytes.length, fileType8.length )

		fileBytes.set( fileType8, byteIndex );
		byteIndex += fileType8.length;
		// meta
		console.log( 'copy meta' )
		let meta8 = new Uint8Array( Uint16Array.from( meta )
			.buffer );
		fileBytes.set( meta8, byteIndex );
		byteIndex += meta8.length;
		// spectrum
		console.log( 'copy dataset' )
		let spectrum8 = new Uint8Array( Uint16Array.from( normalizedCompressedSpectrum )
			.buffer );
		fileBytes.set( spectrum8, byteIndex );

		let filename = path.basename( outputPath )
			.split( '.' )[ 0 ] + '.ft';
		let fileAddress = path.join( path.dirname( outputPath ), filename );
		console.log( 'Writing binary file', fileAddress );
		// write file
		return fs.writeFileAsync( fileAddress, Buffer.from( fileBytes.buffer ), {
			encoding: 'binary'
		} );

	} )
}

function str2codes( str ) {
	return str.split( '' )
		.map( c => c.charCodeAt( 0 ) );
}

function computeFFT( wav ) {
	let spectrum = [];
	return new Promise( ( resolve, reject ) => {
		while ( frameIndex * samplesPerFrame < wav.channelData[ 0 ].length ) {
			let frameSpectrum = computeFFTFrame( getNextFrameBuffer( wav, frameIndex++ ) );
			// spectrum = spectrum.concat( Array.from( frameSpectrum ) );
			spectrum.push.apply( spectrum, Array.from( frameSpectrum ) );
		}
		resolve( spectrum );
	} )
}

function smoothFFT( spectrum ) {
	console.log( 'smoothFFT', smoothingFactor );
	return spectrum.map( ( value, i ) => {
		let frame_offset = 0;
		while ( ++frame_offset < smoothingFactor && i - ( frame_offset * bufferSize ) >= 0 ) {
			// take the same bin from previous frames and add them together, reducing significance the further away the frame is
			value += spectrum[ i - ( frame_offset * bufferSize ) ] / ( frame_offset + 1 );
		}
		return value;
	} );
}

function getNextFrameBuffer( wav, frameIndex = 0 ) {
	// console.log( `Rendering Frame ${frameIndex}` );
	var startIndex = frameIndex * samplesPerFrame;
	return [
		wav.channelData[ 0 ].slice( startIndex, startIndex + bufferSize ),
		wav.channelData[ 1 ].slice( startIndex, startIndex + bufferSize )
	];
}

function computeFFTFrame( channelSignals ) {
	let signal;
	switch ( channel ) {
		case 0:
			signal = channelSignals[ 0 ];
			break;
		case 1:
			signal = channelSignals[ 1 ];
			break;
		case 2:
			signal = averageArrays( channelSignals[ 0 ], channelSignals[ 1 ] );
			break;
	}
	// catch the last frame
	if ( signal.length < bufferSize ) {
		let _signal = new Float32Array( bufferSize );
		_signal.set( signal );
		signal = _signal;
	}
	fft.forward( signal );

	return fft.spectrum;
}

function averageArrays( a, b ) {
	let c = new Float32Array( a.length );
	for ( let i = 0; i < c.length; i++ ) {
		c[ i ] = ( a[ i ] + b[ i ] ) / 2;
	}
	return c;
}
