var express = require('express');
var router = express.Router();
var Service = require('../service/Service');

router.use( '/party/:party/remote', function ( req, res, next ) {

    // make sure the party place exists before people start connecting to it's namespaced socket
    Service.createPartyPlace( req.params.party );

    next();
} );

router.use( '/party/:party/remote', express.static( __dirname +'/../static/remote' ) );

module.exports = router;