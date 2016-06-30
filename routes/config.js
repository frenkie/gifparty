var config = require( __dirname +'/../config.json' );
var express = require('express');
var router = express.Router();


var respond = function ( party ) {
    var config = 'var gifPartyConfig = { ';

    if ( party ) {
        config += 'party: "'+ party +'" }';
    } else {
        config += '}';
    }

    return config;
};

router.get( '/party/:party/remote/config.js', function ( req, res ) {

    res.type('application/javascript');
    res.send( respond( req.params.party ) );
});


module.exports = router;