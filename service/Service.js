'use strict';

var debug = require('debug')('gifparty:service');

var PartyController = require('./PartyController');
var Receiver = require('./Receiver');

/**
 * Singleton.
 * Server needs to inject the {Socket.io} socket through {@link #setSocket}
 */
class Service {

    constructor () {

        this.parties = {};
    }

    createPartyPlace ( name ) {

        if ( ! this.hasPartyPlace( name ) ) {
            debug('creating party place', name );
            this.parties[ name ] = new PartyController( this.socket.of( '/'+ name ), name );
        }

        return this.parties[ name ];
    }

    getPartyPlace ( name ) {
        return this.parties[ name ];
    }

    hasPartyPlace ( name ) {

        return !! ( this.parties[ name ] );
    }

    setSocket ( socket ) {
        this.socket = socket;
    }
}

module.exports = new Service();