


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


                    console.log('about to test %S');
                    try{
                        if(data.indexOf('%S') > -1){
                            console.log('found %S----------------------------------------------------------------------------------------');
                        }
                        else{
                            console.log('about to writehistorical >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
                            pubServer.writeHistorical(JSON.parse(data));        
                        }
                    }
                    catch(e){
                        console.log('error testing for %S',e);

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

            //live rtuId 5798acae85adb10cfc733503
            //dev rtuId 57a03160949bcd64297bc459 or 57a363c22f8bc54d228c275b

            // // Live
            // var email = 'thingappdemo@bitid.co.za';
            // var clientIdAuth = '579745be55d00a0a92e4d118';
            // var token = JSON.stringify(__settings.value.bitidTelemetryToken);
            // console.log('token>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',token);


            // //DEV
            // var email = 'shane@bitid.co.za';
            // var clientIdAuth = '000000000000000000000002';
            // var token = '{"Bearer":"eba33b255870fcfbd12dd137e7f9174f901d950c8f85350f1b7093f15ed6c3c0","scopes":[{"url":"/telemetry/rtu/list","role":"4"},{"url":"/telemetry/rtu/add","role":"4"},{"url":"/telemetry/rtu/update","role":"4"},{"url":"/telemetry/rtu/delete","role":"4"},{"url":"/telemetry/rtu/writehistorical","role":"4"},{"url":"/telemetry/rtu/gethistorical","role":"4"},{"url":"/telemetry/report/rtu","role":"4"},{"url":"/telemetry/mimic/list","role":"4"},{"url":"/telemetry/mimic/add","role":"4"},{"url":"/telemetry/mimic/update","role":"4"},{"url":"/telemetry/mimic/delete","role":"4"}],"expiry":1473958965938,"tokenAddOn":{"name":"Test"}}';

            console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',data);

            var email = '';
            var clientIdAuth = '';
            var token = '';

            if(__settings.value.environmentDev == 1){
                email = __settings.value.authTelemetry.emailDev;
                clientIdAuth = __settings.value.authTelemetry.clientIdAuthDev;
                token = JSON.stringify(__settings.value.authTelemetry.tokenDev);
            }
            else{
                email = __settings.value.authTelemetry.email;
                clientIdAuth = __settings.value.authTelemetry.clientIdAuth;
                token = JSON.stringify(__settings.value.authTelemetry.token);
            }


            var rtuId = data.payLoad.sourceAddress;
            var DTO = JSON.stringify({"email":email, "clientIdAuth": clientIdAuth, "serverDate":Date.now(), "rtuId":rtuId, "rtuData":data});


            var request = require('request');
            var url = __settings.value.authTelemetry.host + ':' + __settings.value.authTelemetry.port + __settings.value.authTelemetry.path;
            console.log('CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCcc',DTO);
            console.log('DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',token);

            request({
                url: url,
                method: "POST",
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json; charset=utf-8',
                    'Content-Length': DTO.length,
                    'accept': '*/*'
                },
                body: DTO
            }, function (error, response, body){
                if(error){
                    console.log('writehistorical error');
                    deferred.reject({'error':error});
                }
                else{
                    var myResult = JSON.parse(response.body);
                    console.log('BBBBBBBBBBBBBBBBBBBBBBBBBBBB',myResult);
                    deferred.resolve(myResult);
                }
            });

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

