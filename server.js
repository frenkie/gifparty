var debug = require('debug')('gifparty');
var fs = require('fs');


fs.stat('./config.json', function ( err, stats ) {

    if ( err || ! stats.isFile() ) {

        debug('Required config.json missing! Create one according to the docs.');

    } else {

        var express = require('express'); // Docs http://expressjs.com/
        var app = express();
        var server = require('http').Server( app );

        // binding to 0.0.0.0 allows connections from any other computer in the network
        // to your ip address
        var ipAddress = process.env.IP || '0.0.0.0';
        var port = process.env.PORT || 8080;

        server.listen( port, ipAddress, function () {

            var socketIo = require('socket.io'); // Docs http://socket.io/
            var io = socketIo( server );
            var Service = require('./service/Service').setSocket( io );

            app.use( require('./routes/vendor') );
            app.use( require('./routes/config') );
            app.use( require('./routes/remote') );
            app.use( require('./routes/party') );
            app.use( require('./routes/gifs') );
            app.use( require('./routes/index') );

            debug( 'started on localhost:' + port );
        } );
    }
});