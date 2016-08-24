var express = require('express');
var debug = require('debug')('gifparty:route:gifs');
var request = require('request');
var router = express.Router();
var config = require('../config.json');

router.get('/gifs/:query', function (req, res) {

    var requestUrl;

    if ( req.params.query ) {

        requestUrl = 'https://api.giphy.com/v1/gifs/search?api_key='+ config.settings.giphyApiKey
                        +'&limit='+ ( req.query.limit || 100 ) +'&offset='+ ( req.query.offset || 0 ) +'&q='+
                            req.params.query.replace( /[-]+/ig, '+');

        debug( requestUrl );

        request.get({
            url: requestUrl,
            json: true
        }, function ( error, response, body ) {

            if ( ! error && response.statusCode == 200 ) {

                res.send( body );

            } else {
                res.end({});
            }
        });

    } else {
        res.end({});
    }
});

module.exports = router;