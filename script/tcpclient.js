
var EventEmitter = require( "events" ).EventEmitter;
var util = require('util');
var net = require('net');


var sbModule = function() {
    var self = this;

    var RMCSocket = {
        Status: 'DISCONNECTED'
    };

    var thisclient;
    var thisServer;
    var thisPort;
    var thisdebug;


    var pubTCP = {
        init: function (retErr,Server, Port, Debug) {
            thisServer = Server;
            thisPort = Port;
            thisdebug = Debug;
            pubTCP.connect(retErr);
        },
        connect: function (retErr) {

            //Establish TCP socket connection to RMC and listen for Data from RTU. We subscribe to messages we want to hear.

            if (RMCSocket.Status == 'DISCONNECTED') {
                self.emit("RMCSocket", RMCSocket.Status);

                RMCSocket.Status = 'CONNECTING';
                if (thisdebug == 1) {
                    console.log('RMCSocket - CONNECTING');
                }

                var newclient = new net.Socket();
                newclient.connect(thisPort, thisServer, function () {
                    RMCSocket.Status = 'CONNECTED';
                    if (thisdebug == 1) {
                        console.log('RMCSocket - CONNECTED');
                    }

                    thisclient = newclient;

                    newclient.setKeepAlive(true);


                    //Establish an async function to handle data from RTU
                    newclient.on('data', function (data) {
                        if (thisdebug == 1) {
                            console.log('clientRMC - Received: ');
                        }

                        try {
                            self.emit("data", data);
                        }
                        catch (e) {
                            console.log('socket data error: ' + e);
                        }
                    });

                    //clientRMC.write("Got Some Data");

                });

                newclient.on('error', function () {
                    RMCSocket.Status = 'DISCONNECTED';
                    if (thisdebug == 1) {
                        console.log("RMCSocket - DISCONNECTED-error");
                        retErr("retErr: RMCSocket - DISCONNECTED-error");
                    }
                    newclient.destroy();
                });
                newclient.on('end', function () {
                    RMCSocket.Status = 'DISCONNECTED';
                    if (thisdebug == 1) {
                        console.log("RMCSocket - DISCONNECTED-end");
                    }
                    newclient.destroy();
                });
                newclient.on('timeout', function () {
                    RMCSocket.Status = 'DISCONNECTED';
                    if (thisdebug == 1) {
                        console.log("RMCSocket - DISCONNECTED-timeout");
                    }
                    newclient.destroy();
                });
                newclient.on('close', function () {
                    RMCSocket.Status = 'DISCONNECTED';
                    if (thisdebug == 1) {
                        console.log("RMCSocket - DISCONNECTED-close");
                    }
                    newclient.destroy();
                });


            }
        },
        SendData: function (strData) {
            try {
                if(thisclient != undefined){
                    thisclient.write(strData);
                }
            }
            catch (e) {
                console.log('tcpclient error: ' + e.message);

            }

        },
        on: function(strEvent,callbackFunction){
            self.on(strEvent,function(data){
                callbackFunction(data);
            })
        }
    }

    setInterval(pubTCP.connect,1000);

    return pubTCP


}
util.inherits(sbModule, EventEmitter);
exports.rmcTCP = sbModule;




/**
 * Created by shane on 3/9/15.
 */

    /*
var net = require('net');

var EventEmitter = require( "events" ).EventEmitter;
var controller = new EventEmitter();

var RMCSocket = {
    Status: 'DISCONNECTED'
};

var thisclient;
var thisServer;
var thisPort;
var thisdebug;
//var tickListener;

controller.handle = {

    init: function(Server,Port,Debug){
        thisServer = Server;
        thisPort = Port;
        thisdebug = Debug;
        controller.handle.connect();
    },
    connect: function(){

        //Establish TCP socket connection to RMC and listen for Data from RTU. We subscribe to messages we want to hear.

        if (RMCSocket.Status == 'DISCONNECTED') {
            controller.emit("RMCSocket", RMCSocket.Status);

            RMCSocket.Status = 'CONNECTING';
            if(thisdebug == 1){
                console.log('RMCSocket - CONNECTING');
            }

            var newclient = new net.Socket();
            newclient.connect(thisPort, thisServer, function () {
                RMCSocket.Status = 'CONNECTED';
                if(thisdebug == 1){
                    console.log('RMCSocket - CONNECTED');
                }

                thisclient = newclient;

                newclient.setKeepAlive(true);




                //Establish an async function to handle data from RTU
                newclient.on('data', function (data) {
                        if(thisdebug == 1){
                            console.log('clientRMC - Received: ' + data);
                        }

                        try {
                            controller.emit("data", data);
                        }
                        catch (e) {
                            console.log('socket data error: ' + e);
                        }
                    });

                //clientRMC.write("Got Some Data");

            });

            newclient.on('error', function () {
                RMCSocket.Status = 'DISCONNECTED';
                if(thisdebug == 1){
                    console.log("RMCSocket - DISCONNECTED-error");
                }
                newclient.destroy();
            });
            newclient.on('end', function () {
                RMCSocket.Status = 'DISCONNECTED';
                if(thisdebug == 1){
                    console.log("RMCSocket - DISCONNECTED-end");
                }
                newclient.destroy();
            });
            newclient.on('timeout', function () {
                RMCSocket.Status = 'DISCONNECTED';
                if(thisdebug == 1){
                    console.log("RMCSocket - DISCONNECTED-timeout");
                }
                newclient.destroy();
            });
            newclient.on('close', function () {
                RMCSocket.Status = 'DISCONNECTED';
                if(thisdebug == 1){
                    console.log("RMCSocket - DISCONNECTED-close");
                }
                newclient.destroy();
            });


        }
    },
    SendData: function(strData) {
        try{
            thisclient.write(strData);
        }
        catch(e){

        }

    }
}


setInterval(controller.handle.connect,1000);

module.exports = controller;

*/