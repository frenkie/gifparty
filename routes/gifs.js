var express = require('express');
var request = require('request');
var router = express.Router();
var config = require('../config.json');

router.get('/gifs/:query', function (req, res) {

    if ( req.params.query ) {

        request.get({
            url: 'https://api.giphy.com/v1/gifs/search?api_key='+ config.settings.giphyApiKey
                +'&limit='+ ( req.params.limit || 100 ) +'&offset='+ ( req.params.offset || 0 ) +'&q='+
                    req.params.query.replace( /[-]+/ig, '+'),
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