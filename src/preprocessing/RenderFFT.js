#!/usr/bin/env node

// If you are running out of space, increase the max ram size (in MB):
// $ node --max_old_space_size=8192

let log = require( '../Util' )
	.log;
let fs = require( 'fs-extra-promise' );
let path = require( 'path' );
let yargs = require( 'yargs' );
let JSONStream = require( 'JSONStream' );
let wav = require( 'node-wav' );
let dsplib = require( 'dsp.js' );
let DSP = dsplib.DSP;
let FFT = dsplib.FFT;
let Midi = require( 'jsmidgen' );

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
			default: 64,
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
			default: 'bin',
			describe: 'midi|json|bin',
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
	log( `Reading file ${inputPath}` );
	fs.readFileAsync( inputPath )
		.then( ( buffer ) => wav.decode( buffer ) )
		.then( ( wav ) => {
			samplesPerFrame = wav.sampleRate / fps;
			// round up from samples per frame to the next power of 2
			bufferSize = Math.pow( 2, Math.ceil( Math.log2( samplesPerFrame ) ) );
			log( `Sample Rate: ${wav.sampleRate}` );
			log( `Buffer Size: ${bufferSize}` );
			fft = new FFT( bufferSize, wav.sampleRate );
			frameIndex = 0;
			return wav;
		} )
		.then( computeFFT )
		.then( smoothFFT )
		.then( saveToDisk )
		.then( () => {
			log( "Operation Complete!" );
		} )
		.catch( ( e ) => log( e ) );
}

function saveToDisk( compressedSpectrum ) {
	let maxPeak = compressedSpectrum.slice()
		.sort( ( a, b ) => b - a )[ 0 ];
	log( `Max Peak: ${maxPeak}` );
	let normalizedCompressedSpectrum = compressedSpectrum.map( ( v ) => Math.floor( outputResolution * v / maxPeak ) );
	let spectrumArrays = [];
	log( 'Normalize Compressed Spectrum' );
	let saveFilePromise, normalized;
	switch ( outputFormat ) {
		case 'png':
			break;
		case 'bin':
			saveFilePromise = saveBIN( normalizedCompressedSpectrum );
			break;
		case 'midi':
			saveFilePromise = saveMIDI( normalizedCompressedSpectrum );
			break;
		case 'json':
		default:
			for ( var i = 0; i < normalizedCompressedSpectrum.length; i++ ) {
				spectrumArrays[ i ] = normalizedCompressedSpectrum.slice( i * bufferSize, ( i + 1 ) * bufferSize );
			}
			saveFilePromise = saveJSON( spectrumArrays );
			break;
	}
	return saveFilePromise.then( () => {
		log( `Spectrum saved to ${outputPath}` );
	} );
}

function saveJSON( spectrumArrays ) {
	return new Promise( ( resolve, reject ) => {
		let transformStream = JSONStream.stringify();
		let outputStream = fs.createWriteStream( outputPath );
		transformStream.pipe( outputStream );
		spectrumArrays.forEach( transformStream.write );
		transformStream.end();
		outputStream.on(
			"finish",
			resolve
		);
	} )
}

function saveBIN( spectrumStream ) {
	return new Promise( ( resolve, reject ) => {
		// flatten the arrays for each frame
		let fileBytes = Uint16Array.from( spectrumStream );

		let filename = path.basename( outputPath )
			.split( '.' )[ 0 ] + '.fftbin';
		let fileAddress = path.join( path.dirname( outputPath ), filename );
		log( 'Writing Binary file', fileAddress );
		// write file
		return fs.writeFileAsync( fileAddress, Buffer.from( fileBytes.buffer ), {
			encoding: 'binary'
		} );
	} )
}

function saveMIDI( spectrumArrays ) {
	return new Promise( ( resolve, reject ) => {
		let midiFile = getMidiFile( spectrumArrays );
		log( 'Building MIDI. This may take a while...' );
		let fileBytes = Uint8Array.from( midiFile.toBytes() );

		log( 'opening:', fileBytes.slice( 4 ) );

		let filename = path.basename( outputPath )
			.split( '.' )[ 0 ] + '.mid';
		let fileAddress = path.join( path.dirname( outputPath ), filename );
		log( 'Writing MIDI file', fileAddress );
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
	log( 'smoothFFT', smoothingFactor );
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
	// log( `Rendering Frame ${frameIndex}` );
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

function getMidiFile( spectrumArrays ) {
	let ticksPerBeat = 128; // hard coded in jsmidgen
	let ticksPerMin = fps * 60;
	let bpm = ticksPerMin / ticksPerBeat;
	let file = new Midi.File();
	let track = new Midi.Track();
	file.addTrack( track );
	track.setTempo( bpm );

	for ( let tick = 0; tick < spectrumArrays.length; tick++ ) {
		if ( tick % 10000 == 0 ) {
			log( `${Math.floor(100 * tick / spectrumArrays.length)}% complete` )
		}
		track.addEvent(
			new Midi.MetaEvent( {
				time: 1,
				type: 0x7F, // custom event
				data: [ 0x00 ].concat( spectrumArrays[ tick ] ) // first byte is device mfg id, use 0x00 for generic
			} )
		);
	}
	return file;
}

function averageArrays( a, b ) {
	let c = new Float32Array( a.length );
	for ( let i = 0; i < c.length; i++ ) {
		c[ i ] = ( a[ i ] + b[ i ] ) / 2;
	}
	return c;
}
