'use strict';

var debug = require('debug')('gifparty:receiver');

/**
 * The party place showing all the Gifs and listening to remotes
 */
class Receiver {

    /**
     * @param socket
     * @param initialized - For reconnected receivers that we're already partying
     */
    constructor ( socket, initialized ) {

        this.socket = socket;
        this.initialized = initialized || false;
    }

    getId () {
        return this.socket.id;
    }

    getSocket () {
        return this.socket;
    }

    isInitialized () {
        return this.initialized;
    }

    requestStatusUpdate () {
        debug('requesting status update from initialized receiver');
        this.socket.emit( 'statusrequest' );
    }
};

module.exports = Receiver;