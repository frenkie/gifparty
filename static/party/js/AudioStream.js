var AudioStream = function () {

    this.onInputChangeHandlers = [];
};


AudioStream.prototype = {

    chooseInput: function ( deviceId ) {

        if ( window.stream ) {
            window.stream.getTracks().forEach( function ( track ) {
                track.stop();
            } );
        }

        navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: {
                    exact: deviceId
                }
            },
            video: false
        }).then( this.broadcastInputChange.bind( this ), function () {
            console.log( 'error' );
        } );
    },

    broadcastInputChange: function ( stream ) {

        window.stream = stream;

        this.onInputChangeHandlers.forEach( function ( handler ) {
            handler( stream );
        });
    },

    getInputDevices : function () {

        var deferred = new $.Deferred();

        navigator.mediaDevices.enumerateDevices().then( deferred.resolve ).catch( deferred.reject );

        return deferred.promise();
    },

    registerOnInputChange: function ( handler ) {
        this.onInputChangeHandlers.push( handler );
    }
};