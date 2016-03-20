/**
 * Created by shane on 3/11/15.
 */

var EventEmitter = require( "events" ).EventEmitter;

var controller = new EventEmitter();

controller.handle = function( client ){

    client.connect(1337, '127.0.0.1', function() {

        client.on('data', function (data) {
            console.log('clientRMC - Received: ' + data);
            try {
                controller.emit( "data", "shane story" );
            }
            catch (e) {
                console.log('socket data error: ' + e);
            }
        });
    })
};

module.exports = controller;
