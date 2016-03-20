/**
 * Created by shane on 5/26/15.
 */

var EventEmitter = require( "events" ).EventEmitter;
var util = require('util');
var net = require('net');
var server = net.createServer();


var sbModule = function() {
    var self = this;

    var RMCSocket = {
        Status: 'DISCONNECTED'
    };

    var thisServer;
    var thisPort;
    //var thisdebug;
    var mySocks = [];


    var pubTCP = {
        init: function (Server, Port, Debug) {
            thisServer = Server;
            thisPort = Port;
            thisdebug = Debug;
            pubTCP.doListen();
        },
        doListen: function () {
            try{
                var newserver = new net.createServer();
                newserver.listen(thisPort, thisServer);
                console.log('Server listening on ' + newserver.address.address +':'+ newserver.address.port);
                newserver.on('connection', function(sock) {
                    mySocks.push(sock);
                    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
                    sock.on('data', function(data) {
                        self.emit("data",[sock, data]);
                    });
                    sock.on('close', function(data) {
                        self.emit("close",[sock, data]);
                        var i;
                        for(i=0;i<mySocks.length;i++){
                            if(mySocks[i].remotePort == sock.remotePort){
                                mySocks.splice(i,1);
                                break;
                            }
                        }
                    });
                    sock.on('error', function () {
                        if (thisdebug == 1) {
                            console.log("tcpsvr on error");
                        }
                    });


                });
            }
            catch(e){
                console.log('Listen Error: ' + e);
            }


        },
        SendData: function (strData) {
            try {
                var i;
                for(i=0;i<mySocks.length;i++){
                    var thissock = mySocks[i];
                    thissock.write(strData);
                }
            }
            catch (e) {
                console.log('tcpsvr error: ' + e.message);
            }

        },
        on: function(strEvent,callbackFunction){
            self.on(strEvent,function(data){
                callbackFunction(data);
            })
        }
    }

    //setInterval(pubTCP.connect,1000);

    return pubTCP


}
util.inherits(sbModule, EventEmitter);
exports.rmcTCPSvr = sbModule;
