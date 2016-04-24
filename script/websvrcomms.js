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
    var myPLC;
    var myRTULog;


    var pubWebSVR = {

        init: function(myWebSvrTCPClient,rtulog,plc,debug){
            thismyWebSvrTCPClient = myWebSvrTCPClient;
            myRTULog = rtulog;
            thisdebug = debug;
            myPLC = plc;

            thismyWebSvrTCPClient.on('data', function (data) {
                try {
                    LoggedOnToWebServer = true;
                    if(thisdebug == 1){
                        console.log('websvrcomms received: '+ data);
                    }

//{"dateTime":"2016/01/01","messageId":2,"payLoad":{"sourceAddress":2,"destinationAddress":1,"msgType":"control","write":{"destinationIO":1,"io":"digOut","value":255},"io":{"rtuAddress":1,"io":{"1":{"id":1,"ioType":"TCP-MODMUX-DIO8","rawData":[],"data":{"id":1,"ioType":"TCP-MODMUX-DIO8","digitalsIn":0,"digitalsOut":0,"digitalsOutWriteValue":0,"DigitalsIn":null}},"2":{"id":2,"ioType":"TCP-MODMUX-AI8","rawData":[],"data":{"ioType":"TCP-MODMUX-AI8","AI1":null,"AI2":0,"AI3":0,"AI4":0,"AI5":0,"AI6":0,"AI7":0,"AI8":0}}}}}}


//{"dateTime":"2016/01/01","messageId":3,"payLoad":{"sourceAddress":1,"destinationAddress":2,"msgType":"handshake","io":{"rtuAddress":1,"io":{"1":{"id":1,"ioType":"TCP-MODMUX-DIO8","rawData":[],"data":{"id":1,"ioType":"TCP-MODMUX-DIO8","digitalsIn":0,"digitalsOut":0,"digitalsOutWriteValue":0,"DigitalsIn":null}},"2":{"id":2,"ioType":"TCP-MODMUX-AI8","rawData":[],"data":{"ioType":"TCP-MODMUX-AI8","AI1":null,"AI2":0,"AI3":0,"AI4":0,"AI5":0,"AI6":0,"AI7":0,"AI8":0}}}}
//"io":{"rtuAddress":1,"io":{"1":{"id":1,"ioType":"TCP-MODMUX-DIO8","rawData":[],"data":{"id":1,"ioType":"TCP-MODMUX-DIO8","digitalsIn":0,"digitalsOut":0,"digitalsOutWriteValue":0,"DigitalsIn":null}},"2":{"id":2,"ioType":"TCP-MODMUX-AI8","rawData":[],"data":{"ioType":"TCP-MODMUX-AI8","AI1":null,"AI2":0,"AI3":0,"AI4":0,"AI5":0,"AI6":0,"AI7":0,"AI8":0}}}}

                    var msgIn = JSON.parse(data);
                    var args = [null,null,msgIn];
                    myPLC.processMessageIn(args)
                    .then(function(data){
                        // console.log('We do not respond here. We load the response into the myRTULog.');
                    },function(err){
                        // console.log('Not responding for a reason. Response would cause noise',err);
                    });
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
            var SerialNumber = __settings.value.rtuId;
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
        on: function(strEvent,callbackFunction){
            self.on(strEvent,function(data){
                callbackFunction(data);
            })
        }
    }


    LoggedOnToWebServer = true;
    //pubWebSVR.readConfig();

    // setInterval(pubWebSVR.SendWebSvrLogon,5000);
    // setTimeout(function(){
    //     console.log('about to test');
    //     myPLC.testControl();
    // },5000);

    var FixedTxTime = __settings.value.fixedTxTime;
    pubWebSVR.fixedTxTime;

    setInterval(pubWebSVR.checkRTULogForMessagesToSend,(1000));


    return pubWebSVR;


};
util.inherits(sbModule, EventEmitter);
exports.webSVRComms = sbModule;



















                    // if(data.toString() == '%S 1 *'){
                    //     LoggedOnToWebServer = true;
                    //     if(thisdebug == 1){
                    //         console.log('Unit Logged Onto WebServer');
                    //     }
                    //     return;
                    // }
                    // if(data.toString() == '%5 *'){
                    //     LoggedOnToWebServer = true;
                    //     if(thisdebug == 1){
                    //         console.log('Unit Poll recieved from Server');
                    //     }
                    //     myRTULog.processMessageIn(data.toString());
                    //     return;
                    // }
                    // if(data.toString().indexOf('%1') >= 0){
                    //     if(thisdebug == 1){
                    //         console.log('message from Server');
                    //     }
                    //     myRTULog.processMessageIn(data.toString());
                    //     return;
                    // }



        //readConfig: function(){
        //    var fs = require('fs');
        //    var file = './config/config.json';
        //    var obj = JSON.parse(fs.readFileSync(file,'utf8'));
        //    CONFIG = obj;
        //    SETINGS = CONFIG.settings;
        //},
        //searchSettings: function(search){
        //    var arrFound = SETINGS.filter(function(item) {
        //        return item.description == search;                    console.log('about to json');
                    // var msgIn = JSON.parse(data);
                    // console.log('done json');
                    // var args = [null,null,msgIn];
                    // myPLC.processMessageIn(args)
                    // .then(function(data){
                    //     console.log('We do not respond here. We load the response into the myRTULog. The following response was loaded for sending',data);
                    // },function(err){
                    //     console.log('Not responding for a reason. Response would cause noise',err);
                    // });
        //    });
        //    return arrFound[0].value;
        //},
