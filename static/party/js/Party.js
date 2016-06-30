var Party = function ( $visualizer, $controls ) {

    this.$visualizer = $visualizer;
    this.$controls = $controls;

    this.MAX_TAGS = 4;
    this.tags = ['cats', 'rainbows'];
    this.gifSources = {};

    if ( this.checkRequirements() ) {

        this.setupAudioHandler();
        this.bindVisualizerHandlers();
        this.bindControlsHandlers();
        this.renderControls();
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

    handleAudioInputChange: function ( inputStream ) {

        this.audio.srcObject = inputStream;
        this.dancer.load( this.audio );
        this.dancer.play();
    },

    handleAudioInputSelect: function ( e ) {
        var $select = $( e.currentTarget );

        if ( $select.val() ) {
            this.audioStream.chooseInput( $select.val() );
        }
    },

    handleAudioKick: function () {
        console.log( 'kick' );
    },

    handleTagAddRequest : function () {

    },

    handleTagRemoveRequest : function () {

    },

    renderControls: function () {

        if ( ! this.controlsTemplate ) {
            this.controlsTemplate = Handlebars.compile( this.$controls.find('[type="text/x-handlebars-template"]').html() );
        }

        var viewModel = {
            audioOptions: []
        };

        this.audioStream.getInputDevices().then( function ( deviceInfo ) {

            deviceInfo.forEach( function ( device, i ) {
                if ( device.kind === 'audioinput' ) {
                    viewModel.audioOptions.push({
                        value: device.deviceId,
                        label: device.label || 'microphone ('+ ( i+1 ) +')'
                    });
                }
            } );

            this.$controls.html( this.controlsTemplate( viewModel ) );
        }.bind( this ) );
    },

    setupAudioHandler: function () {
        this.audioStream = new AudioStream();

        this.audio = document.createElement( 'audio' );
        this.dancer = new Dancer();
        this.dancer.createKick({
            onKick: this.handleAudioKick.bind( this )
        }).on();

        this.audioStream.registerOnInputChange( this.handleAudioInputChange.bind( this ) );
    }
};

/*

    handles tag add and remove requests
    handles active tags

    maintains GifSources for tags

    displays random gifs from a random tag on the kick of the music


 */
