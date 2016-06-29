var config = require( __dirname +'/../config.json' );
var express = require('express');
var router = express.Router();

router.use('/config.js', function ( req, res ) {

    res.type('application/javascript');
    res.send( 'var config = '+ JSON.stringify( config ) +';' );
});

module.exports = router;