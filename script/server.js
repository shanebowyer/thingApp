


// var settings = require(__base + '/config.js');
// var settings    = require(__base + './script/settings.js').settings;

var Q       = require('q');
var EventEmitter = require( "events" ).EventEmitter;
var util = require('util');
var net = require('net');
var http = require('http');
var https = require('https');

var tcpSvr = require(__base + '/lib/tcpsvr.js');
var tcpClient = require(__base + '/lib/tcpclient.js');

var ServerComms = new tcpSvr.rmcTCPSvr;


var sbModule = function() {
    var self = this;

    var thisdebug = 0;
    var wss;
    var wanData = '';

    //DEV
    var rtuIdGLOG = '57a03160949bcd64297bc459';
    var rtuIdUGU = '57a0713f5406b609e2f598f6';
    // //LIVE
    // var rtuIdGLOG = '579b7d10d467ad1ed87444eb';
    // var rtuIdUGU = '57c91e177b647c34ab8c8427';

    var pubServer = {

        initWanSlave: function(){
            var tcpWanSlave = new tcpClient.rmcTCP();
            tcpWanSlave.init(function(err){
                console.log('tcpWanSlave error', err);
            },'41.0.147.125',61114,0);

            tcpWanSlave.on('data', function (data) {
                var strData = data.toString('utf8');
                wanData = wanData + strData;
            })

            setInterval(function(){
                if(wanData != ''){
                    // var arrData = wanData.split(',');
                    var myData = pubServer.modelWanMasterData(wanData);
                    wanData = '';

                    try{
                        pubServer.wsBroadcast(JSON.parse(myData));
                    }
                    catch(e){
                        console.log('server wsBroadcast error: ' + e); 
                    }


                    try{
                        console.log('Writing Historical***************************************************** '); 
                        pubServer.writeHistorical(JSON.parse(myData));        
                        console.log('DONE Writing Historical***************************************************** '); 
                    }
                    catch(e){
                        console.log('*****************************************************server writehistorical error: ' + e); 
                    }


                    // console.log('string from wanMaster',strData);
                    // console.log('data from wanMaster',arrData);
                }

            },1000)

        },

        modelWanMasterData: function(data){
            var arrGlogData = data.split(',');
            var oneValue = arrGlogData[0].split('=');
            console.log('oneValue',oneValue);
            var glogData = {};
            glogData.dateTime = Date.now();
            glogData.payLoad = {};
            glogData.payLoad.sourceAddress = rtuIdUGU;
            glogData.payLoad.destinationAddress = 0;
            glogData.payLoad.msgId = 999;
            glogData.payLoad.msgType = 'status';
            glogData.payLoad.io = {};
            glogData.payLoad.io.rtuAddress = rtuIdUGU;
            
            var ioDetails = [];

            var objIO1 = {}
            objIO1.id = 1;
            objIO1.ioType = "TCP-MODMUX-DIO8";
            objIO1.rawData = {};
            objIO1.data = {};
            objIO1.data.id = 1;
            objIO1.data.ioType = "TCP-MODMUX-DIO8";
            objIO1.data.digitalsIn = 0;
            ioDetails.push(objIO1);
            // io["1"].data.digitalsIn = parseInt(oneValue[1]);

            var objIO2 = {}
            objIO2.id = 2;
            objIO2.ioType = "TCP-MODMUX-AI8";
            objIO2.rawData = {};
            objIO2.data = {};
            objIO2.data.id = 2;
            objIO2.data.ioType = "TCP-MODMUX-AI8";
            objIO2.data.AI1 = parseInt(oneValue[1]);
            ioDetails.push(objIO2);

            glogData.payLoad.io.ioDetails = ioDetails;

            console.log('modelWanMasterData', JSON.stringify(glogData));

            return JSON.stringify(glogData);

        },

        modelGlogData: function(data){

            var arrGlogData = data.toString('utf8').split(' ');
            var glogData = {};
            glogData.dateTime = arrGlogData[4];
            glogData.payLoad = {};
            glogData.payLoad.sourceAddress = rtuIdGLOG; //arrGlogData[2];
            glogData.payLoad.destinationAddress = 0;
            glogData.payLoad.msgId = 999;
            glogData.payLoad.msgType = 'status';
            glogData.payLoad.io = {};
            glogData.payLoad.io.rtuAddress = rtuIdGLOG; //arrGlogData[2];
            var ioDetails = [];
            var objIO1 = {}
            objIO1.id = 1;
            objIO1.ioType = "TCP-MODMUX-DIO8";
            objIO1.rawData = {};
            objIO1.data = {};
            objIO1.data.id = 1;
            objIO1.data.ioType = "TCP-MODMUX-DIO8";
            objIO1.data.digitalsIn = arrGlogData[6];
            ioDetails.push(objIO1);

            var objIO2 = {};
            objIO2.id = 2;
            objIO2.ioType = "TCP-MODMUX-AI8";
            objIO2.rawData = {};
            objIO2.data = {};
            objIO2.data.id = 2;
            objIO2.data.ioType = "TCP-MODMUX-AI8";
            objIO2.data.AI1 = arrGlogData[8];
            objIO2.data.CI1 = arrGlogData[17];
            ioDetails.push(objIO2);
            

            glogData.payLoad.io.ioDetails = ioDetails;

            console.log('modelGlogData', JSON.stringify(glogData));

            return JSON.stringify(glogData);
//Glog Data
//"%1 0210.030 6 0 1110215725 128 256 0 0 0 0 0 0 0 0 0 0 170 0 0 0 0 0 0 0 0 0 0 127 48 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 > 30021 *"


        },


        initTCPSocket: function(){
            console.log('Initted server');
            thisdebug = 1;

            ServerComms.on('data', function(args){
                try{
                    var dataType = '';
                    var sock = args[0];
                    var data = args[1];
                    if(thisdebug == 1){
                        debugger;
                        console.log('Server data: ' + sock.remoteAddress +':'+ sock.remotePort + ' Data: ' + data.toString('utf8'));
                    }

                    console.log('about to test %S');
                    try{
                        if(data.toString('utf8').indexOf('%S') > -1){
                            console.log('found %S----------------------------------------------------------------------------------------');
                            sock.write(data);
                            return;
                        }
                        else{

                            if(data.toString('utf8').indexOf('%') > -1){
                                console.log('identified glog data')
                                dataType = 'glog';
                                var arrGlogData = data.toString('utf8').split(' ');
                                data = pubServer.modelGlogData(data);
                            }
                            else{
                                //Manual testing below
                                data = JSON.parse(data);
                                data.payLoad.io.ioDetails[1].data.AI1 = 415;
                                data.payLoad.io.ioDetails[1].data.AI2 = 488;
                                // data.payLoad.io.io[1].data.digitalsIn = 0;
                                data = JSON.stringify(data);
                            }

                            try{
                                ServerComms.SendData(data);
                            }
                            catch (e) {
                                console.log('server sock.write data error: ' + e); 
                            }

                            try{
                                pubServer.wsBroadcast(JSON.parse(data));
                            }
                            catch(e){
                                console.log('server wsBroadcast error: ' + e); 
                            }


                            console.log('about to writehistorical >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
                            try{
                                pubServer.writeHistorical(JSON.parse(data));        
                                if(dataType == 'glog'){
                                    //Handshake the message
                                    sock.write('%1 ' + arrGlogData[3] + ' *');
                                }
                            }
                            catch(e){
                                console.log('server writehistorical error: ' + e); 
                            }
                            
                        }
                    }
                    catch(e){
                        console.log('error testing for %S',e);

                    }

                }
                catch (e) {
                    console.log('server data error: ' + e);
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

            // console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',data);

            var email = '';
            var clientIdAuth = '';
            var token = '';

            email = __settings.value.authTelemetry.email;
            clientIdAuth = __settings.value.authTelemetry.clientIdAuth;
            token = JSON.stringify(__settings.value.authTelemetry.token);


            var rtuId = data.payLoad.sourceAddress;
            var DTO = JSON.stringify({"email":email, "clientIdAuth": clientIdAuth, "serverDate":Date.now(), "rtuId":rtuId, "rtuData":data});


            var request = require('request');
            var url = __settings.value.authTelemetry.host + ':' + __settings.value.authTelemetry.port + __settings.value.authTelemetry.path;
            // console.log('CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCcc',DTO);
            // console.log('DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',token);

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
                    console.log('writehistorical error',error);
                    deferred.reject({'error':error});
                }
                else{
                    try{
                        var myResult = JSON.parse(response.body);
                        console.log('BBBBBBBBBBBBBBBBBBBBBBBBBBBB',myResult);
                        deferred.resolve(myResult);
                    }
                    catch(e){
                        deferred.reject(e);
                    }
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

    // pubServer.initWanSlave();

    return pubServer


}
util.inherits(sbModule, EventEmitter);
exports.rmcServer = sbModule;

