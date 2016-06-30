var EventEmitter = require('events').EventEmitter;
var util = require('util');
var extend = require('extend');
var debug = require('debug')('gifparty:partycontrol');

var MessageEngine = require('./MessageEngine');
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
    this.messageEngine = new MessageEngine( this.broadcaster, messages );

    this.status = {
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

    addRemote : function ( remoteSocket ) {

        this.broadcaster.to( remoteSocket.id ).emit( 'statusupdate', this.status );
    },

    bindBroadcasterEvents () {

        this.broadcaster.on('connection', function ( client ) {

            client.on('identify', this.handleClientIdentification.bind( this, client ) );

        }.bind(this) );
    },

    bindReceiverEvents : function ( receiver ) {

        var receiverSocket = receiver.getSocket();

        // handle the messages that cannot be freely passed on through MessageEngine
        receiverSocket.on('disconnect', this.handleReceiverDisconnect.bind(this) );
        receiverSocket.on('statusupdate', this.handleReceiverStatus.bind(this) );
        receiverSocket.on('tagupdate', this.handleReceiverTagUpdate.bind(this) );
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
                    this.addRemote( client );
                    break;
            }
        } else {

            debug( 'incomplete identification request' );
        }

    },

    handleReceiverDisconnect : function () {
        // ...
    },

    handleReceiverStatus : function ( status ) {

        if ( status.tags ) {
            this.status.tags = status.tags;
        } else {
            this.status.tags = [];
        }

        debug('broadcasting status update');
        this.broadcaster.emit( 'statusupdate', this.status );
    },

    handleReceiverTagUpdate : function ( tags ) {

        tags = tags || [];

        var currentTags = this.status.tags || [];
        var tagsAreEqual = ( tags.length == currentTags.length &&
                        tags.every(function ( tag, i ) { return ( currentTags.indexOf( tag ) > -1 ) }) );

        if ( ! tagsAreEqual ) {
            debug( 'broadcasting tag update' );

            this.status.tags = tags;

            this.broadcaster.emit( 'tagupdate', tags );
        } else {
            debug( 'tags are unchanged' );
        }
    }
});

module.exports = PartyController;