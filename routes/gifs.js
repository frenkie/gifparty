var express = require('express');
var debug = require('debug')('gifparty:route:gifs');
var request = require('request');
var router = express.Router();
var config = require('../config.json');

// test for now a getter
router.get('/gifs/apikey/:key', (req,res)=>{
    if ( req.params.key ) {
        config.settings.giphyApiKey = req.params.key;
        res.send(`updated to ${req.params.key}`);    
    } else {
        res.send('not updated');    
    }
});

router.get('/gifs/apikey', (req,res)=>{
    res.send(config.settings.giphyApiKey);
});

router.get('/gifs/:query', function (req, res) {

    var requestUrl;

    if ( req.params.query ) {

        requestUrl = 'https://api.giphy.com/v1/gifs/search?api_key='+ config.settings.giphyApiKey
                        +'&limit='+ ( req.query.limit || 100 ) +'&rating=g&lang=en&bundle=messaging_non_clips&offset='+ ( req.query.offset || 0 ) +'&q='+
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