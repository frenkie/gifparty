var EventEmitter = require('events').EventEmitter;
var util = require('util');
var extend = require('extend');
var debug = require('debug')('gifparty:partycontrol');

var Receiver = require('./Receiver');
var Remote = require('./Remote');

var messages = require('../config.json').messages; // messages that may be freely passed on

/**
 * Handle all the communication in the party place between receiver and remotes
 *
 * @param {Socket.io} broadcaster - Namespaced Socket.io for this partyPlace
 * @param {string} partyPlace - the name of this party place (for informational purpose)
 * @constructor
 */
var PartyController = function ( broadcaster, partyPlace ) {

    EventEmitter.call(this);

    this.broadcaster = broadcaster;
    this.partyPlace = partyPlace;

    /**
     * After adding minTags, we don't allow removing more than minTags
     * @type {{tags: Array, minTags: number, maxTags: number}}
     */
    this.status = {
        tags: [],
        minTags : 1,
        maxTags : 4
    };

    this.bindBroadcasterEvents();
};

util.inherits( PartyController, EventEmitter );

extend( PartyController.prototype, {

    addReceiver : function ( receiver ) {

        this.bindReceiverEvents( receiver );

        if ( receiver.isInitialized() ) {
            receiver.requestStatusUpdate();
        } else {
            this.broadcaster.to( receiver.getId() ).emit( 'statusupdate', this.status );
        }
    },

    addRemote : function ( remote ) {

        this.bindRemoteEvents( remote );

        this.broadcaster.to( remote.getId() ).emit( 'statusupdate', this.status );
    },

    bindBroadcasterEvents () {

        this.broadcaster.on('connection', function ( client ) {

            client.on('identify', this.handleClientIdentification.bind( this, client ) );

        }.bind(this) );
    },

    bindReceiverEvents : function ( receiver ) {

        var receiverSocket = receiver.getSocket();

        receiverSocket.on('disconnect', this.handleReceiverDisconnect.bind(this) );
    },

    bindRemoteEvents : function ( remote ) {

        var remoteSocket = remote.getSocket();

        remoteSocket.on('statusrequest', function () {

            this.handleStatusRequest( remoteSocket );

        }.bind(this) );

        remoteSocket.on('tagaddrequest', function ( tag ) {

            this.handleTagAddRequest( tag, remoteSocket );

        }.bind(this) );

        remoteSocket.on('tagremoverequest', function ( tag ) {

            this.handleTagRemoveRequest( tag, remoteSocket );

        }.bind(this) );
    },

    handleClientIdentification: function ( client, identity ) {

        if ( identity && identity.type && identity.partyPlace && identity.partyPlace === this.partyPlace ) {

            debug( 'identification request' );

            switch ( identity.type ) {

                case 'receiver':
                    debug( 'receiver identified' );
                    this.addReceiver( new Receiver( client, identity.initialized || false ) );
                    break;

                case 'remote':
                    debug( 'remote identified' );
                    this.addRemote( new Remote( client ) );
                    break;
            }
        } else {

            debug( 'incomplete identification request' );
        }

    },

    handleReceiverDisconnect : function () {
        // ...
    },

    handleStatusRequest: function ( requestSocket ) {
        requestSocket.emit( 'statusupdate', this.status );
    },

    handleTagAddRequest : function ( tag, requestSocket ) {

        if ( this.status.tags.indexOf( tag ) == -1 &&
            this.status.tags.length < this.status.maxTags ) {

            debug( 'broadcasting tag update, tag added', tag );

            this.status.tags.push( tag );
            this.broadcaster.emit( 'tagupdate', this.status.tags );

        } else {
            debug( 'tags are unchanged, nothing added' );
            requestSocket.emit( 'tagupdate', this.status.tags );
        }
    },

    handleTagRemoveRequest : function ( tag, requestSocket ) {

        var indexOfTag = this.status.tags.indexOf( tag );

        if ( indexOfTag > -1 && this.status.tags.length > this.status.minTags ) {

            debug( 'broadcasting tag update, tag removed', tag );

            this.status.tags.splice( indexOfTag, 1 );
            this.broadcaster.emit( 'tagupdate', this.status.tags );

        } else {
            debug( 'tags are unchanged, nothing removed' );
            requestSocket.emit( 'tagupdate', this.status.tags );
        }
    }
});

module.exports = PartyController;