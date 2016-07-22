


// var settings = require(__base + '/config.js');
// var settings    = require(__base + './script/settings.js').settings;

var Q       = require('q');
var EventEmitter = require( "events" ).EventEmitter;
var util = require('util');
var net = require('net');
var http = require('http');

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

                    pubServer.writeHistorical(data);

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

        writeHistorical: function(data){
            var deferred = Q.defer();

            var email = 'shane@bitid.co.za';
            var clientIdAuth = '578ddb40f3f1047b670f9a6b';
            var token = '{"Bearer":"c24869ca0861243e9746f74fef2b30238765d85da30db4aa277af79b3f752d80","scopes":[{"url":"/users/list","role":"1"},{"url":"/users/update","role":"1"},{"url":"/rtu/writehistorical","role":"2"}],"expiry":1471774538010}';
            // console.log('token',token);

            var DTO = JSON.stringify({"email":email, "clientIdAuth": clientIdAuth, "serverDate":Date.now(), "rtuId":"000000000000000000000001", "rtuData":{}});
            // console.log('DTO',DTO);

            var options = {
                host: '127.0.0.1',
                port: 8000,
                path: '/rtu/writehistorical',
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json; charset=utf-8',
                    'Content-Length': DTO.length,
                    'accept': '*/*'
                }
            };

            var myReq = http.request(options, function(res) {
                    var msg = '';

                    res.setEncoding('utf8');
                    res.on('data', function(chunk) {
                        msg += chunk;
                    });
                    res.on('end', function() {
                        if(msg != ''){
                            console.log('msg', msg);
                            // var result = JSON.parse(msg);
                            // if(typeof result.error == 'undefined'){
                                deferred.resolve('result');
                            // }
                            // else{
                            //     deferred.reject(result);
                            // }
                            
                        }else{
                            deferred.reject(portal.errorResponse);
                        }

                    });

                    res.on('error', function(e) {
                        console.log('authenticate error',e);
                        deferred.reject(error);
                    });
                });

                myReq.write(DTO);
                myReq.end();

            return deferred.promise;
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

