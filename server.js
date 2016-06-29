var debug = require('debug')('sockit');
var fs = require('fs');


fs.stat('./config.json', function ( err, stats ) {

    if ( err || ! stats.isFile() ) {

        debug('Required config.json missing! Create one according to the docs.');

    } else {

        var express = require('express'); // Docs http://expressjs.com/
        var MessageEngine = require('./MessageEngine');
        var socketIo = require('socket.io'); // Docs http://socket.io/

        var app = express();
        var server = require('http').Server( app );
        var io = socketIo( server );

        // binding to 0.0.0.0 allows connections from any other computer in the network
        // to your ip address
        var ipAddress = process.env.IP || '0.0.0.0';
        var port = process.env.PORT || 8080;


        var vendorRouter = require('./routes/vendor');
        var configRouter = require('./routes/config');

        app.use( adminRouter );
        app.use( vendorRouter );
        app.use( configRouter );


        server.listen( port, ipAddress, function () {

            debug( 'started on localhost:' + port );

            new MessageEngine( io, require('./config.json').messages || {} );
        } );
    }
});