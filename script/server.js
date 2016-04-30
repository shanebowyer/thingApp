


// var settings = require(__base + '/config.js');
// var settings    = require(__base + './script/settings.js').settings;


var EventEmitter = require( "events" ).EventEmitter;
var util = require('util');
var net = require('net');

var tcpSvr = require(__base + '/script/tcpsvr.js');

var ServerComms = new tcpSvr.rmcTCPSvr;


var sbModule = function() {
    var self = this;

    var thisdebug = 0;


    var pubServer = {

        init: function(){
            console.log('Initted server');
            thisdebug = 0;

            ServerComms.on('data', function(args){
                try{
                    var sock = args[0];
                    var data = args[1];
                    if(thisdebug == 1){
                        console.log('Server data: ' + sock.remoteAddress +':'+ sock.remotePort + ' Data: ' + data);
                    }

                    // self.emit("data",
                    //     {
                    //         'ResponseTo': 'ServerComms',
                    //         'IOType': 0,
                    //         'data': data
                    //     });

                    try{
                        //sock.write(data);
                        ServerComms.SendData(data);
                    }
                    catch (e) {
                        console.log('iomodbustcpslave sock.write data error: ' + e);
                    }


                }
                catch (e) {
                    console.log('iomodbustcpslave data error: ' + e);
                }

            });
        },

        on: function(strEvent,callbackFunction){
            self.on(strEvent,function(data){
                callbackFunction(data);
            })
        }
    }

    var webIP = __settings.value.localwebserver.ipAddress;
    var socketPort = __settings.value.localwebserver.socketPort;
    
    if(socketPort != 0){
        ServerComms.init(webIP,socketPort,1);
        console.log('Listening for ServerComms on: ' + socketPort);
    }

    return pubServer


}
util.inherits(sbModule, EventEmitter);
exports.rmcServer = sbModule;

