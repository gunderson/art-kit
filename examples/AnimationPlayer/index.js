import AnimationPlayer from '../../src/media/AnimationPlayer.js';
import Timeline from '../../src/media/Timeline.js';

let animationPlayer;
let transport, playPauseButton;
let timeline;

function setup() {
	animationPlayer = new AnimationPlayer( {
		update,
		draw,
		onPlay,
		onPause,
		duration: 60 * 1000
	} );
	timeline = new Timeline( [
		[ 1000, () => {
			document.querySelector( '.box-0' )
				.style.display = 'block';
		} ]
	] );
	transport = document.querySelector( '.transport' );
	playPauseButton = transport.querySelector( '.play-pause-button' );
	playPauseButton.addEventListener( 'click', onClickPlayPause );
	transport.querySelector( '.scrubber' )
		.addEventListener( 'mousedown', onScrubberDown );
	transport.querySelector( '.progress-bar' )
		.addEventListener( 'click', onClickProgressBar );


	update();
	draw();
}

function update() {
	timeline.update( animationPlayer.currentTime );
}

function draw() {
	let timeDisplay = transport.querySelector( '.time-display' );
	let currentTime = animationPlayer.currentTime;
	let mins = Math.floor( currentTime / 60000 );
	let secs = Math.floor( ( currentTime % 60000 ) / 1000 );
	timeDisplay.querySelector( '.current-time' )
		.textContent = `${mins}:${pad( secs, 2 )}`;

	if ( animationPlayer.duration > 0 ) {
		let totalTime = animationPlayer.duration;
		let mins = Math.floor( totalTime / 60000 );
		let secs = Math.floor( ( totalTime % 60000 ) / 1000 );
		timeDisplay.querySelector( '.total-time' )
			.textContent = `${mins}:${pad( secs, 2 )}`;
		timeDisplay.querySelector( '.total-time' )
			.style.display = 'inline';
		timeDisplay.querySelector( '.time-separator' )
			.style.display = 'inline';
		let completeBar = transport.querySelector( '.complete-bar' );
		let scrubber = transport.querySelector( '.scrubber' );
		let percentComplete = animationPlayer.percentComplete;
		completeBar.style.width = ( percentComplete * 100 ) + '%';
		scrubber.style.left = ( percentComplete * 100 ) + '%';
		completeBar.style.display = 'block';
		scrubber.style.display = 'block';
	}
}

function onPlay() {
	playPauseButton.querySelector( '.pause-button' )
		.style.display = 'block';
	playPauseButton.querySelector( '.play-button' )
		.style.display = 'none';
}

function onPause() {
	playPauseButton.querySelector( '.pause-button' )
		.style.display = 'none';
	playPauseButton.querySelector( '.play-button' )
		.style.display = 'block';
}

function onClickPlayPause() {
	if ( animationPlayer.playState === AnimationPlayer.PLAYING ) {
		animationPlayer.pause();
	} else {
		animationPlayer.play();
	}
}


function onClickProgressBar( event ) {
	whileScrubberDown( event );
}

let playState;

function onScrubberDown( event ) {
	event.stopImmediatePropagation();
	event.preventDefault();
	window.addEventListener( 'mouseup', onScrubberUp );
	window.addEventListener( 'mouseleave', onScrubberUp );
	window.addEventListener( 'mousemove', whileScrubberDown );
	playState = animationPlayer.playState;
	animationPlayer.pause();
	console.log( event );
}

function whileScrubberDown( event ) {
	event.stopImmediatePropagation();
	event.preventDefault();
	let parent = document.querySelector( '.progress-bar' );
	let parentWidth = parent.offsetWidth;
	let newX = event.pageX - parent.offsetLeft;
	if ( newX > parentWidth ) {
		newX = parentWidth;
	}
	if ( newX < 0 ) {
		newX = 0;
	}
	animationPlayer.percentComplete = newX / parentWidth;
	update();
	draw();
}

function onScrubberUp( event ) {
	window.removeEventListener( 'mouseup', onScrubberUp );
	window.removeEventListener( 'mouseleave', onScrubberUp );
	window.removeEventListener( 'mousemove', whileScrubberDown );
	if ( playState === AnimationPlayer.PLAYING ) {
		animationPlayer.play();
	}
}

function pad( text, minLength ) {
	text = text.toString();
	while ( text.length < minLength ) {
		text = '0' + text;
	}
	return text;
}

setup();
