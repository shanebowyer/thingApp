


// var settings = require(__base + '/config.js');
// var settings    = require(__base + './script/settings.js').settings;

var Q       = require('q');
var EventEmitter = require( "events" ).EventEmitter;
var util = require('util');
var net = require('net');
var http = require('http');
var https = require('https');

var tcpSvr = require(__base + '/lib/tcpsvr.js');

var ServerComms = new tcpSvr.rmcTCPSvr;


var sbModule = function() {
    var self = this;

    var thisdebug = 0;
    var wss;

    var pubServer = {

        initTCPSocket: function(){
            console.log('Initted server');
            thisdebug = 1;

            ServerComms.on('data', function(args){
                try{
                    var sock = args[0];
                    var data = args[1];
                    if(thisdebug == 1){
                        console.log('Server data: ' + sock.remoteAddress +':'+ sock.remotePort + ' Data: ' + data);
                    }


                    pubServer.wsBroadcast(JSON.parse(data));

                    try{
                        ServerComms.SendData(data);
                    }
                    catch (e) {
                        console.log('iomodbustcpslave sock.write data error: ' + e); 
                    }

                    if(typeof data == 'object'){
                        var testData = JSON.parse(data);
                        console.log('testData',testData);
                        // if(testData.indexOf('%S')>-1){
                        //     console.log('ignore writeHistorical for %S');
                        // }
                        // else{
                            pubServer.writeHistorical(JSON.parse(data));        
                        // }
                        
                    }
                    


                }
                catch (e) {
                    console.log('iomodbustcpslave data error: ' + e);
                }

            });
        },

        initWebSocket: function(server){
            console.log('initWebSocket');
            var userId;
            var WebSocketServer = require("ws").Server;
            wss = new WebSocketServer({server: server});
            var vValue = 0;
            wss.on("connection", function (ws) {
                console.info("websocket connection open");
                var timestamp = new Date().getTime();
                userId = timestamp;
                ws.userId = userId;

                ws.on("message", function (data) {
                    console.log("websocket data in",data);
                    ServerComms.SendData(data);
                    console.log('server broadcast done');
                });

                ws.on("close", function () {
                    console.log("websocket connection close");
                });
            });
            console.log("websocket server created");


            // setInterval(function(){
            //     vValue += 5;
            //     if(vValue > 100){
            //         vValue = 0;
            //     }
            //     pubServer.wsBroadcast({value:vValue});
            // },1000);

        },

        wsBroadcast: function(data){
            wss.clients.forEach(function each(client) {
                // console.log('broadcast to',client.userId);
                client.send(JSON.stringify(data));
                // client.send(data);
            });
        },

        writeHistorical: function(data){
            var deferred = Q.defer();

            var email = 'thingappdemo@bitid.co.za';
            var clientIdAuth = '579745be55d00a0a92e4d118';
            var token = '{"Bearer":"2cb5ca7dbe56995ef168242fe022f8693dfa284a6ab1c12c4523d60ee76fb453","scopes":[{"url":"/telemetry/rtu/list","role":"4"},{"url":"/telemetry/rtu/add","role":"4"},{"url":"/telemetry/rtu/update","role":"4"},{"url":"/telemetry/rtu/delete","role":"4"},{"url":"/telemetry/rtu/writehistorical","role":"4"},{"url":"/telemetry/report/rtu","role":"4"},{"url":"/telemetry/mimic/list","role":"4"},{"url":"/telemetry/mimic/add","role":"4"},{"url":"/telemetry/mimic/update","role":"4"},{"url":"/telemetry/mimic/delete","role":"4"}],"expiry":1473830862985,"tokenAddOn":{"name":"Test"}}';
            // console.log('token',token);

            var rtuId = data.rtuId;

            // var DTO = JSON.stringify({"email":email, "clientIdAuth": clientIdAuth, "serverDate":Date.now(), "rtuId":"5798acae85adb10cfc733503", "rtuData":data});
            var DTO = JSON.stringify({"email":email, "clientIdAuth": clientIdAuth, "serverDate":Date.now(), "rtuId":rtuId, "rtuData":data});
            console.log('DTO',DTO);

            var options = {
                host: 'telemetry.bitid.co.za',
                port: 443,
                path: '/telemetry/rtu/writehistorical',
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json; charset=utf-8',
                    'Content-Length': DTO.length,
                    'accept': '*/*'
                }
            };

            var myReq = https.request(options, function(res) {
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

