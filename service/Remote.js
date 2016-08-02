'use strict';

var debug = require('debug')('gifparty:remote');


class Remote {

    constructor ( socket ) {
        this.socket = socket;
    }

    getId () {
        return this.socket.id;
    }

    getSocket () {
        return this.socket;
    }
};

module.exports = Remote;