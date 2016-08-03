var Remote = {

    templates: {
        tag: '<span type="button" ' + ' class="tag btn btn-primary btn-sm" data-tag="{{tag}}">{{tag}} ' + ' <span class="tag-close glyphicon glyphicon-remove"></span></span>'
    },

    init: function ( host, party ) {

        Remote.host = host;
        Remote.party = party;
        Remote.socket = io( host + '/' + party );

        Remote.maxTagInput = 4;

        Remote.loader = $( '.loader' );

        Remote.partyPlace = $( '.party-place' );

        Remote.tagForm = $( '.tag-form' );
        Remote.tagInput = $( '#tag-input' );
        Remote.tagSubmit = Remote.tagForm.find( '.submit' );
        Remote.tagView = $( '.tags' );

        Remote.bindSocketEvents();
        Remote.bindViewEvents();

        Remote.identify();
    },

    bindSocketEvents: function () {
        Remote.socket.on( 'statusupdate', Remote.handleStatusUpdate );
        Remote.socket.on( 'tagupdate', Remote.handleTagUpdate );

        Remote.socket.on( 'clearloadingstates', Remote.handleClearLoadingStates );


        Remote.socket.on( 'disconnect', Remote.handleDisconnect );
    },

    bindViewEvents: function () {

        Remote.tagForm.on( 'submit', Remote.handleTagAddRequest );
        Remote.tagView.on( 'click', '.tag', Remote.handleTagRemoveRequest );
    },

    disableTagInput: function () {
        Remote.tagInput.prop( 'disabled', true );
        Remote.tagSubmit.prop( 'disabled', true );
    },

    disableTagRemoval: function () {
        Remote.tagView.addClass( 'disabled' );
    },

    enableTagInput: function () {
        Remote.tagInput.prop( 'disabled', false );
        Remote.tagSubmit.prop( 'disabled', false );
    },

    enableTagRemoval: function () {
        Remote.tagView.removeClass( 'disabled' );
    },

    handleClearLoadingStates: function () {
        Remote.setLoadingState( false );
    },

    handleDisconnect: function () {

        var reconnectMessage = 'Disconnected from party ' + Remote.party + ', do you want to reconnect?'

        if ( confirm( reconnectMessage ) ) {
            document.location.reload();
        }
    },

    handleStatusUpdate: function ( data ) {

        Remote.setLoadingState( false );

        if ( data.maxTags ) {
            Remote.maxTagInput = data.maxTags;
        }

        Remote.handleTagUpdate( data.tags || [] );
    },

    handleTagAddRequest: function ( e ) {

        var tag = Remote.tagInput.val();

        e.preventDefault();

        Remote.setLoadingState( true );

        if ( /^[a-z0-9]+$/i.test( tag ) ) {

            Remote.socket.emit( 'tagaddrequest', tag );

        } else {
            alert( 'You can only use letters and numbers for tag input!' );
            Remote.setLoadingState( false );
        }

        Remote.tagInput.val( '' );
    },

    handleTagRemoveRequest: function ( e ) {
        var tag = $( e.currentTarget );

        if ( !Remote.tagView.is( '.disabled' ) ) {
            Remote.setLoadingState( true );

            Remote.socket.emit( 'tagremoverequest', tag.data( 'tag' ) );
        }
    },

    handleTagUpdate: function ( tags ) {

        Remote.setTags( tags );

        if ( tags.length >= Remote.maxTagInput ) {

            Remote.disableTagInput();
        } else {
            Remote.enableTagInput();
        }

        if ( tags.length <= 1 ) {
            Remote.disableTagRemoval();
        } else {
            Remote.enableTagRemoval();
        }

        Remote.setLoadingState( false );
    },

    identify: function () {

        if ( Remote.party && Remote.party !== '' ) {

            Remote.socket.emit( 'identify', {
                type: 'remote', partyPlace: Remote.party
            } );

            Remote.partyPlace.removeClass( 'hidden' ).html( 'controlling <a href="/remote/party/' + Remote.party + '">' + Remote.party + '</a>' );

        }
    },

    /**
     * @param {Boolean} toggle
     */
    setLoadingState: function ( toggle ) {
        Remote.loader[ ( toggle ) ? 'addClass' : 'removeClass' ]( 'loading' );
    },

    setTags: function ( tags ) {

        Remote.tagView.empty();

        $.each( tags, function ( i, tag ) {

            Remote.tagView.append( Remote.templates.tag.replace( /\{\{tag\}\}/ig, tag ) );
        } );
    }
};