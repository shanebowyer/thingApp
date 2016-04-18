/**
 * Created by shane on 3/10/15.
 */


// var settings = require(__base + '/config.js');
// var settings    = require(__base + './script/settings.js').settings;
var rtulog = require(__base + '/script/rtulog.js');
var tcpClient = require(__base + '/script/tcpclient.js');



var EventEmitter = require( "events" ).EventEmitter;
var util = require('util');
var net = require('net');


var sbModule = function() {
    var self = this;

    var thisMessageID = 0;
    var thisAnalog0 = 0;
    var thismyWebSvrTCPClient;
    var SETINGS;
    var LoggedOnToWebServer = false;
    var thisdebug;
    var myIO;
    var myRTULog;


    var pubWebSVR = {

        init: function(myWebSvrTCPClient,rtulog,io,debug){
            thismyWebSvrTCPClient = myWebSvrTCPClient;
            myRTULog = rtulog;
            thisdebug = debug;
            myIO = io;

            thismyWebSvrTCPClient.on('data', function (data) {
                try {
                    if(thisdebug == 1){
                        console.log('plc websvrcomms received: '+ data);
                    }

                    if(data.toString() == '%S *'){
                        LoggedOnToWebServer = true;
                        if(thisdebug == 1){
                            console.log('plc Unit Logged Onto WebServer');
                        }
                    }
                    if(data.toString() == '%5 *'){
                        LoggedOnToWebServer = true;
                        if(thisdebug == 1){
                            console.log('plc Unit Poll recieved from Server');
                        }
                        myRTULog.processMessageIn(data.toString());
                    }
                    if(data.toString().indexOf('%1') >= 0){
                        if(thisdebug == 1){
                            console.log('plc message from Server');
                        }
                        myRTULog.processMessageIn(data.toString());
                    }

                    var dataReq = {
                        
                    }



                }
                catch (e) {
                    console.log('thismyWebSvrTCPClient data error: ' + e);
                }
            });
            thismyWebSvrTCPClient.on('RMCSocket', function (data) {
                try {
                    if(thisdebug == 1){
                        console.log('plc websvrcomms Socket: '+ data);
                    }

                    if(data.toString() != 'CONNECTED'){
                        LoggedOnToWebServer = false;
                    }

                }
                catch (e) {
                    console.log('socket data error: ' + e);
                }
            });

        },

        //readConfig: function(){
        //    var fs = require('fs');
        //    var file = './config/config.json';
        //    var obj = JSON.parse(fs.readFileSync(file,'utf8'));
        //    CONFIG = obj;
        //    SETINGS = CONFIG.settings;
        //},
        //searchSettings: function(search){
        //    var arrFound = SETINGS.filter(function(item) {
        //        return item.description == search;
        //    });
        //    return arrFound[0].value;
        //},
        fixedTxTime: function(){
            if(LoggedOnToWebServer == false){
                return;
            }

            var jsonOutput = myIO.getIOStatus(1);
            jsonOutput.TxFlag = 128;
            myRTULog.add(jsonOutput,0,0);

            console.log('plc - FixTxTime Message inserted to log');
            //thismyWebSvrTCPClient.handle.SendData(strOutput);
            thismyWebSvrTCPClient.SendData(jsonOutput);

        },
        SendWebSvrLogon: function(){
            if(LoggedOnToWebServer == true){
                return;
            }
            var Start = '%S';
            var SerialNumber = settings.value.rtuId;
            var End = '*';
            var strOutput = ''
                + Start
                + ' ' + SerialNumber
                + ' ' + End;

            thismyWebSvrTCPClient.SendData(strOutput);
        },
        checkRTULogForMessagesToSend: function(){
            if(LoggedOnToWebServer == false){
                return;
            }

            strOutput = myRTULog.readLog();
            if(strOutput != ''){
                thismyWebSvrTCPClient.SendData(strOutput);
            }
        },
        getIOStatus: function(Address){
            return myIO.getIOStatus(Address);
        },
        ControlModbusIO: function(RTUAddress, IOToWrite, vValue){
            myIO.WriteRegister(RTUAddress, IOToWrite, vValue);
        },
        on: function(strEvent,callbackFunction){
            self.on(strEvent,function(data){
                callbackFunction(data);
            })
        }
    }



    //pubWebSVR.readConfig();

    setInterval(pubWebSVR.SendWebSvrLogon,5000);

    var FixedTxTime = settings.value.fixedTxTime;
    pubWebSVR.fixedTxTime;

    setInterval(pubWebSVR.checkRTULogForMessagesToSend,(1000));


    return pubWebSVR


}
util.inherits(sbModule, EventEmitter);
exports.webSVRComms = sbModule;







