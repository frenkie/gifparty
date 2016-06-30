window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
		  window.webkitRequestAnimationFrame ||
		  window.mozRequestAnimationFrame    ||
		  function( callback ){
			window.setTimeout(callback, 1000 / 60);
		  };
})();

function RGBA(r, g, b, a){
	this.r = typeof r != 'undefined' ? r : 0;
	this.g = typeof g != 'undefined' ? g : 0;
	this.b = typeof b != 'undefined' ? b : 0;
	this.a = typeof a != 'undefined' ? a : 1.0;

	this.getString = function(){
		return 'rgba('+this.r+','+this.g+','+this.b+','+this.a+')';
	}
}


var Party = function ( $visualizer, $controls ) {

    this.$visualizer = $visualizer;
    this.$controls = $controls;

    this.MAX_TAGS = 4;
    this.BEAT_HOLD_TIME = 0.075;

    this.beatHeldTime = 0.0;
    this.lastKickTime = 0.0;
    this.prevFrameTime = 0.0;

    this.tags = [];
    this.gifSources = {};

    if ( this.checkRequirements() ) {

        this.setupAudioHandler();
        this.bindVisualizerHandlers();
        this.bindControlsHandlers();

        // for testing purposes
        this.handleTagAddRequest( 'cats' );
        this.handleTagAddRequest( 'rainbows' );

        this.renderControls();

        this.update();
    }
};

Party.prototype = {

    bindControlsHandlers : function () {
        this.$controls.on('change', '.audio-input', this.handleAudioInputSelect.bind( this ) );
    },

    bindVisualizerHandlers: function () {
        this.$visualizer.on( 'mouseenter', function () {
            this.$controls.show();
        }.bind( this ) );

        this.$visualizer.on( 'mouseleave', function () {
            this.$controls.hide();
        }.bind( this ) );
    },

    checkRequirements : function () {
        return true;
    },

    getRandomGifSource: function () {

        var tag = this.tags[ Math.round( Math.random() * (this.tags.length-1) ) ];

        if ( this.gifSources[ tag ] ) {
            return this.gifSources[ tag ];
        }
    },

    handleAudioInputChange: function ( inputStream ) {

        this.audio.srcObject = inputStream;
        this.dancer.load( this.audio );
        this.dancer.play();
    },

    handleAudioInputSelect: function ( e ) {
        var $select = $( e.currentTarget );

        if ( $select.val() ) {
            this.selectedAudioDeviceId = $select.val();
            this.audioStream.chooseInput( this.selectedAudioDeviceId );
        }
    },

    handleAudioKick: function () {

        var visualizerBgColor = new RGBA();
        var gifSource;

        if ( this.beatHeldTime <= 0 ) {

            this.lastKickTime = Date.now();

            this.beatHeldTime = this.BEAT_HOLD_TIME;

            gifSource = this.getRandomGifSource();

            if ( gifSource ) {
                gifSource.displayRandomGif( this.$visualizer );
            }

            visualizerBgColor.r = Math.floor( 255 - Math.random() * 200 );
            visualizerBgColor.g = Math.floor( 255 - Math.random() * 200 );
            visualizerBgColor.b = Math.floor( 255 - Math.random() * 200 );

            this.$visualizer.css( {
                'background-color': visualizerBgColor.getString()
            } );
        }
    },

    handleTagAddRequest : function ( tag ) {
        if ( this.tags.length < this.MAX_TAGS ) {

            if ( ! this.gifSources[ tag ] ) {
                this.gifSources[ tag ] = new GifSource( tag );
            }

            this.tags.push( tag );
            this.renderControls();

            return true;
        }

        return false;
    },

    handleTagRemoveRequest : function ( tag ) {
        var idx = this.tags.indexOf( tag );
        if ( idx > -1 ) {

            this.tags.splice( idx, 1 );
            this.renderControls();

            return true;
        }

        return false;
    },

    renderControls: function () {

        if ( ! this.controlsTemplate ) {
            this.controlsTemplate = Handlebars.compile( this.$controls.find('[type="text/x-handlebars-template"]').html() );
        }

        var viewModel = {
            audioOptions: [],
            tags: this.tags
        };

        var selectedAudioInput = this.selectedAudioDeviceId;

        this.audioStream.getInputDevices().then( function ( deviceInfo ) {

            deviceInfo.forEach( function ( device, i ) {
                if ( device.kind === 'audioinput' ) {
                    viewModel.audioOptions.push({
                        selected: device.deviceId === selectedAudioInput,
                        value: device.deviceId,
                        label: device.label || 'microphone ('+ ( i+1 ) +')'
                    });
                }
            } );

            this.$controls.html( this.controlsTemplate( viewModel ) );

        }.bind( this ) ).catch(function () {
            console.log('error getting input devices');
        });
    },

    setupAudioHandler: function () {
        this.audioStream = new AudioStream();

        this.audio = document.createElement( 'audio' );
        this.audio.volume = 0; // use the volume of the audio stream, otherwise we'll get it double
        this.dancer = new Dancer();
        this.dancer.createKick({
            frequency: [0, 10],
            decay: 0.02,
            threshold: 0.3,
            onKick: this.handleAudioKick.bind( this )
        }).on();

        this.audioStream.registerOnInputChange( this.handleAudioInputChange.bind( this ) );
    },

    update: function () {

        requestAnimFrame( this.update.bind( this ) );

        var deltaFrameTime = (Date.now() - this.prevFrameTime) / 1000;
        this.beatHeldTime -= deltaFrameTime;

        if ( this.beatHeldTime < 0 ) {
            this.beatHeldTime = 0;
        }

        if ( this.dancer.isPlaying() ) {
            // Beat cheating
            if ( Date.now() - this.lastKickTime > 2400 ) {
               this.handleAudioKick();
            }

        }

        this.prevFrameTime = Date.now();
    }
};