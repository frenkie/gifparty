function RGBA(r, g, b, a){
	this.r = typeof r != 'undefined' ? r : 0;
	this.g = typeof g != 'undefined' ? g : 0;
	this.b = typeof b != 'undefined' ? b : 0;
	this.a = typeof a != 'undefined' ? a : 1.0;

	this.getString = function(){
		return 'rgba('+this.r+','+this.g+','+this.b+','+this.a+')';
	}
}


var Party = function ( $visualizer, $controls, host, party ) {

    this.$visualizer = $visualizer;
    this.$controls = $controls;
    this.host = host;
    this.party = party;

    this.socket = io( this.host +'/'+ this.party );

    this.MAX_TAGS = 4;
    this.BEAT_HOLD_TIME = 0.1;

    this.beatHeldTime = 0.0;
    this.lastKickTime = 0.0;
    this.prevFrameTime = 0.0;

    this.tags = [];
    this.gifSources = {};

    if ( this.checkRequirements() ) {

        this.setupAudioHandler();
        this.bindVisualizerHandlers();
        this.bindControlsHandlers();
        this.bindSocketHandlers();

        this.renderControls();

        // temp, select default audio input, which makes reloading the page easy
        this.selectedAudioDeviceId = 'default';
        this.audioStream.chooseInput( 'default' );

        this.update();

        this.identify();
    }
};

Party.prototype = {

    bindControlsHandlers : function () {
        this.$controls.on('change', '.audio-input', this.handleAudioInputSelect.bind( this ) );
    },

    bindSocketHandlers : function () {

        this.socket.on( 'statusupdate', this.handleStatusUpdate.bind( this ) );
        this.socket.on( 'tagaddupdate', this.handleTagAddRequest.bind( this ) );
        this.socket.on( 'tagremoveupdate', this.handleTagRemoveRequest.bind( this ) );
        this.socket.on( 'disconnect', this.handleDisconnect.bind( this ) );
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
        this.dancer.setVolume(0);
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

        console.log('kick');

        if ( this.beatHeldTime <= 0 ) {

            console.log('giffing kick');

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

    handleDisconnect: function () {

        var reconnectMessage = 'Disconnected from party ' + this.party + ', do you want to reconnect?';

        if ( confirm( reconnectMessage ) ) {
            document.location.reload();
        }
    },

    handleStatusUpdate: function ( data ) {

        if ( data && data.tags ) {
            data.tags.forEach( function ( tag ) {

                this.handleTagAddRequest( tag );

            }.bind( this ) );
        }
    },

    handleTagAddRequest : function ( tag ) {
        if ( this.tags.length < this.MAX_TAGS ) {

            if ( ! this.gifSources[ tag ] ) {
                this.gifSources[ tag ] = new GifSource( tag );
            }

            this.gifSources[ tag ].setActive( true );

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

            if ( this.gifSources[ tag ] ) {
                this.gifSources[ tag ].setActive( false );
            }

            this.renderControls();

            return true;
        }

        return false;
    },

    identify: function () {

        this.socket.emit( 'identify', {
            type: 'receiver', partyPlace: this.party
        } );
    },

    renderControls: function () {

        if ( ! this.controlsTemplate ) {
            this.controlsTemplate = Handlebars.compile( this.$controls.find('[type="text/x-handlebars-template"]').html() );
        }

        var viewModel = {
            audioOptions: [],
            party: this.party,
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
        this.dancer = new Dancer();
        this.dancer.createKick({
            frequency: [0,10],
            decay: 0.02,
            threshold: 0.3,
            onKick: this.handleAudioKick.bind( this )
        }).on();
        this.audioStream.registerOnInputChange( this.handleAudioInputChange.bind( this ) );
    },

    update: function () {

        requestAnimationFrame( this.update.bind( this ) );

        var deltaFrameTime = (Date.now() - this.prevFrameTime) / 1000;
        this.beatHeldTime -= deltaFrameTime;

        if ( this.beatHeldTime < 0 ) {
            this.beatHeldTime = 0;
        }

        if ( this.dancer.isPlaying() ) {
            // Beat cheating
            if ( Date.now() - this.lastKickTime > 2400 ) {

                console.log('beat cheat');

                this.handleAudioKick();
            }

        }

        this.prevFrameTime = Date.now();
    }
};