


// var settings = require(__base + '/config.js');
// var settings    = require(__base + './script/settings.js').settings;
var Q       = require('q');
var iomodbustcp = require(__base + '/lib/iomodbustcp.js');
var tcpClient = require(__base + '/lib/tcpclient.js');
var gcm = require('node-gcm');


var EventEmitter = require( "events" ).EventEmitter;
var util = require('util');
var net = require('net');


var sbModule = function() {
    var self = this;

    var thisdebug = 0;
    var io;
    var testDig = 0;
    var arrCOFS = [];
    var myLog;

    var pubPLC = {
        test: 0,
        COFSSettingsTemplate: function(){
            COFS = {
                digitalsInMask: 0,
                digitalsLastStatus: 0,
                digitalsExtMask: 0,
                digitalsExtLastStatus: 0,
                counter0Mask: 0,
                counter0LastStatus : 0
            }
        },
        init: function(ioPassedThrough,log,debug){
            thisdebug = debug;
            io = ioPassedThrough;
            myLog = log;
        },
        sendCurrentStatus: function(){
            var msgResponse = {
                sourceAddress: __settings.value.rtuId,
                destinationAddress: 0,
                msgId: payLoad.msgId,
                msgType: 'handshake',
                io: io.currentStatus[__settings.value.rtuId]
            };
            myLog.add(msgResponse,1,1);
            args.data = msgResponse;
            deferred.resolve(args);


        },
        testControl: function(){
            console.log('Loading test control');
            var msgOut = {
                sourceAddress: 2,
                destinationAddress: 1,
                msgType: 'control',
                write: {
                    destinationIO: 1,
                    io: 'digOut',
                    value: 255
                }
            };
            myLog.add(msgOut,1,1);
        },

        processMessageIn: function(args,isLocalControl){
            var deferred = new Q.defer();


            function ObjectLength( object ) {
                var length = 0;
                for( var key in object ) {
                    if( object.hasOwnProperty(key) ) {
                        console.log('key',key);
                        ++length;
                    }
                }
                return length;
            };
            // console.log('Memory size', ObjectLength(io.currentStatus));

            debugger;

            var msgIn = args.data;
            // console.log('msgIn',msgIn);
            var payLoad = msgIn.payLoad;
            console.log('payLoad',payLoad);

            if(__settings.value.rtuId === payLoad.sourceAddress && isLocalControl !== 1){
                //dont chat this is echo from server
                console.log('Ignored Echo Message From Server');
                args.data = 'Ignored Echo Message From Server';
                deferred.reject(args);
                return deferred.promise;
            }
            // console.log('rtuID',__settings.value.rtuId);
            // console.log('destinationAddress',payLoad.destinationAddress);
            if(payLoad.destinationAddress === 0){
                //the other rtu is sending a status broadcast. just save its status here
                if(typeof payLoad.io !== 'undefined'){
                    //Save the senders io to memory
                    var memIO = {
                        rtuAddress: payLoad.sourceAddress,
                        io: payLoad.io
                    }
                    io.currentStatus[payLoad.sourceAddress] = memIO;
                }
                deferred.reject(args);
                return deferred.promise;
            }


            if(__settings.value.rtuId == payLoad.destinationAddress){
                console.log('Processing PLC processMessageIn',msgIn);

                if(payLoad.msgType === 'handshake'){
                    //Use below to test handshake from simulatedevice.exe
                    //{"payLoad":{"sourceAddress":2,"destinationAddress":1,"msgId":2,"msgType":"handshake","io":{"rtuAddress":1,"io":{"1":{"id":1,"ioType":"TCP-MODMUX-DIO8","rawData":[],"data":{"id":1,"ioType":"TCP-MODMUX-DIO8","digitalsIn":0,"digitalsOut":0,"digitalsOutWriteValue":0,"DigitalsIn":null}},"2":{"id":2,"ioType":"TCP-MODMUX-AI8","rawData":[],"data":{"ioType":"TCP-MODMUX-AI8","AI1":null,"AI2":0,"AI3":0,"AI4":0,"AI5":0,"AI6":0,"AI7":0,"AI8":8}}}}}}
                    console.log('Handshake recieved');
                    myLog.processMessageIn(msgIn);
                    args.data = io.currentStatus[__settings.value.rtuId];
                    deferred.resolve(args);
                    if(typeof payLoad.io !== 'undefined'){
                        io.currentStatus[payLoad.sourceAddress] = payLoad.io;
                    }
                    //myLog.add(JSON.stringify(args),1,1);
                }
                else if(payLoad.msgType === 'control' && (typeof io.currentStatus[__settings.value.rtuId].ioDetails[payLoad.write.destinationIO-1].data.digitalsOut !== 'undefined')){
                    console.log('payLoad.write.io',payLoad.write.io);
                    var valueToWrite = 0;
                    if(payLoad.write.io == 'digOut'){
                        console.log('in here',io.currentStatus[__settings.value.rtuId].ioDetails[payLoad.write.destinationIO-1].data.digitalsOut);
                        var diff = parseInt(io.currentStatus[__settings.value.rtuId].ioDetails[payLoad.write.destinationIO-1].data.digitalsOut) - parseInt(payLoad.write.mask);
                        if(diff < 0){
                            diff = 0;
                        }
                        valueToWrite = (parseInt(payLoad.write.value) & parseInt(payLoad.write.mask)) + diff;
                    }
                    else{
                        valueToWrite = payLoad.write.value;
                    }
                    console.log('valueToWrite123',valueToWrite);
                    valueToWrite = payLoad.write.value;

                    io.writeRegister(payLoad.write.destinationIO,payLoad.write.io,valueToWrite);
                    if(typeof payLoad.io !== 'undefined'){
                        //Save the senders io to memory
                        var memIO = {
                            rtuAddress: payLoad.sourceAddress,
                            io: payLoad.io
                        }
                        io.currentStatus[payLoad.sourceAddress] = memIO;
                    }
                    var msgResponse = {
                        sourceAddress: __settings.value.rtuId,
                        destinationAddress: payLoad.sourceAddress,
                        msgId: msgIn.messageId,
                        msgType: 'handshake',
                        io: io.currentStatus[__settings.value.rtuId]
                    };
                    console.log('adding this to the log',msgResponse);
                    myLog.add(msgResponse,1,1);
                    args.data = msgResponse;
                    deferred.resolve(args);
                }
                else if(payLoad.msgType === 'status'){
                    // console.log('maiing sense of data');
                    var msgResponse2 = {
                        sourceAddress: __settings.value.rtuId,
                        destinationAddress: payLoad.sourceAddress,
                        msgId: msgIn.messageId,
                        msgType: 'status',
                        io: io.currentStatus[payLoad.subAddress]
                    };
                    args.data = msgResponse2;
                    deferred.resolve(args);
                }
                else{
                    console.log('Ignored MessageIn');
                    args.data = 'Ignored MessageIn';
                    deferred.reject(args);
                }
            }
            else{
                if(typeof payLoad.io !== 'undefined'){
                    console.log('Saving Other RTU io to memory');
                    var memIO = {
                        rtuAddress: payLoad.sourceAddress,
                        io: payLoad.io
                    }
                    io.currentStatus[payLoad.sourceAddress] = memIO;

                }
                args.data = 'The message in does not match this rtu address';
                deferred.reject(args);
            }

            return deferred.promise;
        },
        runPLCLogic: function(runSpeedMilliseconds){
            setInterval(function(){
                pubPLC.checkCOFS(function(COFS){
                    if(io.currentStatus[__settings.value.rtuId] != undefined){

                    }
                });
                if(typeof myControl == 'undefined'){
                    return;
                }
                myControl.forEach(function(item){
                    if(item.enabled){
                        switch(item.controlType){
                            case('Control'):
                                var ioMonitor;
                                for(var key in io.currentStatus[__settings.value.rtuId].ioDetails[item.setPoints.sourceIO-1].data){
                                    if(key == item.setPoints.io){
                                        ioMonitor = io.currentStatus[__settings.value.rtuId].ioDetails[item.setPoints.sourceIO-1].data[key];
                                        // console.log('value for ', item.setPoints.io + ':' + ioMonitor);
                                    }
                                }
                                if(typeof ioMonitor == 'undefined'){
                                    //It takes a few seconds to start getting comms from io devices so need to bail out here
                                    //SB! need to log this to detect a genuine issue
                                    console.log('Cannot Find ioMonitor');
                                }else{
                                    if(typeof myControlVariables[item.id] === 'undefined'){
                                        myControlVariables[item.id] = {};
                                    }
                                    myControlVariables[item.id].spHi = item.setPoints.hi;
                                    myControlVariables[item.id].spLow = item.setPoints.low;
                                    
                                    if(ioMonitor > myControlVariables[item.id].spHi && myControlVariables[item.id].spHiReached !== true){
                                        console.log('plc Hi Setpoint message loaded');
                                        myLog.add(item.msgOutSetPointHi,1,0);   //SB! Must change this to not be fireandforget. Like this for testing
                                        myControlVariables[item.id].spHiReached = true;
                                        myControlVariables[item.id].spLowReached = false;
                                    }
                                    if(ioMonitor < myControlVariables[item.id].spLow && myControlVariables[item.id].spLowReached !== true){
                                        console.log('plc Low Setpoint message loaded');
                                        myLog.add(item.msgOutSetPointLow,1,0);   //SB! Must change this to not be fireandforget. Like this for testing
                                        myControlVariables[item.id].spHiReached = false;
                                        myControlVariables[item.id].spLowReached = true;
                                    }
                                }
                                break;
                            default:
                                console.log('unhandled controlType');
                                break;
                        }                        
                    }

                });
            },runSpeedMilliseconds);
        },
        checkCOFS: function(done){
            var i = 0;
            var bCOFS = 0;
            var TxFlag = 0;

            var rtukey = __settings.value.rtuId;
            if(typeof io.currentStatus[rtukey] == 'undefined'){
                done(0);
                return;
            }
            // console.log('checkCOFS',io.currentStatus[rtukey]);
            pubPLC.test++;

            for(var itemIO of io.currentStatus[rtukey].ioDetails){
                // console.log('item',item);
                for(var itemCOFS of itemIO.cofs){
                    switch(itemCOFS.description){
                        case('digitalsIn'):

                            // console.log('cofs', itemIO.cofs);

                            if(typeof itemIO.data.digitalsIn != 'undefined'){
                                // console.log('pubPLC.test',pubPLC.test);
                                // if(pubPLC.test < 5){
                                //     itemIO.data.digitalsIn = 0;
                                // }
                                // else if(pubPLC.test < 10){
                                //     itemIO.data.digitalsIn = 1;
                                // }
                                // else{
                                //     itemIO.data.digitalsIn = 0;
                                //     pubPLC.test = 0;
                                // }
                                // io.currentStatus[rtukey].ioDetails[0] = itemIO; //Only for testing. Must delete this


                                // console.log('digitalsIn', itemIO.data.digitalsIn);
                                var currentDigitalStatusWithMask = itemIO.data.digitalsIn & arrCOFS[0].digitalsInMask;
                                if(currentDigitalStatusWithMask != arrCOFS[0].digitalsLastStatus){

                                    arrCOFS[0].digitalsLastStatus = itemIO.data.digitalsIn  & arrCOFS[0].digitalsInMask;
                                    TxFlag += Math.pow(2,1);
                                    console.log('Digital COFS');
                                    bCOFS = 1;

                                    if(bCOFS == 1){
                                        console.log('COFS TXFlag = ' + TxFlag + ' Status: ' + itemIO.data.digitalsIn);

                                        // if(__settings.value.localwebserver.ipAddress == '92.222.86.224'){
                                        //     var pushMessage = pubPLC.buildMessage('COFS TXFlag = ' + TxFlag + ' Status: ' + itemIO.data.digitalsIn);
                                        //     pubPLC.sendPushMessage(pushMessage);
                                        // }


                                        if(__settings.value.localwebserver.ipAddress != '92.222.86.224'){
                                            var msgResponse = {
                                                sourceAddress: __settings.value.rtuId,
                                                destinationAddress: 0,
                                                msgId: 999,
                                                msgType: 'status',
                                                io: io.currentStatus[rtukey]
                                            };
                                            console.log('adding this to the log',msgResponse);
                                            myLog.add(msgResponse,1,1);
                                        }
                                    }
                                }
                            }
                            break;
                        default:
                            break
                    }
                }
            }

            // for(var iokey in io.currentStatus[rtukey].io){
            //     // console.log('sb io.currentStatus[rtukey].io[iokey]',io.currentStatus[rtukey].io[iokey]);
            //     if(typeof io.currentStatus[rtukey].io[iokey] != 'undefined'){
            //         var itemIO = io.currentStatus[rtukey].io[iokey];

            //         if(typeof itemIO.cofs != 'undefined'){
            //             // console.log('cofs', itemIO.cofs);

            //             for(var cofskey in itemIO.cofs){
            //                 if(typeof itemIO.cofs[cofskey] != 'undefined'){
            //                     var itemCOFS = itemIO.cofs[cofskey];
            //                     switch(itemCOFS.description){
            //                         case('digitalsIn'):

            //                             // console.log('cofs', itemIO.cofs);

            //                             if(typeof itemIO.data.digitalsIn != 'undefined'){
            //                                 // console.log('digitalsIn', itemIO.data.digitalsIn);
            //                                 var currentDigitalStatusWithMask = itemIO.data.digitalsIn & arrCOFS[0].digitalsInMask;
            //                                 if(currentDigitalStatusWithMask != arrCOFS[0].digitalsLastStatus){

            //                                     arrCOFS[0].digitalsLastStatus = itemIO.data.digitalsIn  & arrCOFS[0].digitalsInMask;
            //                                     TxFlag += Math.pow(2,1);
            //                                     console.log('Digital COFS');
            //                                     bCOFS = 1;

            //                                     if(bCOFS == 1){
            //                                         console.log('COFS TXFlag = ' + TxFlag + ' Status: ' + itemIO.data.digitalsIn);

            //                                         if(__settings.value.localwebserver.ipAddress == '92.222.86.224'){
            //                                             var pushMessage = pubPLC.buildMessage('COFS TXFlag = ' + TxFlag + ' Status: ' + itemIO.data.digitalsIn);
            //                                             pubPLC.sendPushMessage(pushMessage);
            //                                         }


            //                                         if(__settings.value.localwebserver.ipAddress != '92.222.86.224'){
            //                                             var msgResponse = {
            //                                                 sourceAddress: __settings.value.rtuId,
            //                                                 destinationAddress: 0,
            //                                                 msgId: 999,
            //                                                 msgType: 'status',
            //                                                 io: io.currentStatus[rtukey]
            //                                             };
            //                                             console.log('adding this to the log',msgResponse);
            //                                             myLog.add(msgResponse,1,1);
            //                                         }
            //                                     }
            //                                 }
                                            
            //                             }



            //                             break;
            //                         default:
            //                             break

            //                     }
            //                 }
            //             }


            //         }                            
            //     }
            // }
                    
            done(bCOFS);
        },

        buildMessage: function(tag){
            var message = new gcm.Message({
                collapseKey: 'do_not_collapse',
                contentAvailable: true,
                vibrationPattern : [300, 150, 300], // Vibrate for 300ms then wait 150ms and then vibrate for 300ms.
                notification: {
                    vibrationPattern : [300, 150, 300], // Vibrate for 300ms then wait 150ms and then vibrate for 300ms.
                    title: "biTid - Alert",
                    message:"Scabanger at Gate",
                    sound: "sound.wav",
                    android: {
                        "content_available": 1,
                        "message": "Hello Android!",
                        "sound": "android-sound.wav",
                        //"icon": "ionitron.png",
                        "icon_color": "#FF0000",
                        "payload": {
                            "foo": "bar"
                        }
                    },
                    tag:tag
                }
            });
            return message;
        },

        sendPushMessage: function(message){
            //bitid
            var regTokens = ['f62eOOFJxH4:APA91bHt5ig0supytmo7UK3LNOWmV7GPM_XNNqiNcP3UOS3p-WgtKWphty-TKGQgQJwRipemzLH13v0RgTWc65ZShAPOxfiSqQtxevV9dBaJtVJ7UiMKsJDfBZOyLsz67aW3LaITMrnu'];
            //pauls
            // var regTokens = ['fjbDf00OnC4:APA91bE3KPULRHMIAdrXtX0-D9aACd2G6gnnTqg730HwXlUmCqEb_TTAYYXiuzT9bi2-QO5a-irukfjYEnMBSO86dvPrxZ29AYmq12hcZ2VrYAJOwTNrQv0j6hb0mRatiFNOBtZcX6DY'];
            //bitid
            // var sender = new gcm.Sender('AIzaSyBXG-rm8EijI--ODcW23rOLIIv57ijd7og');
            //pauls
            var sender = new gcm.Sender('AIzaSyAg2dtsPcxuMFwRtANjMHBzYPARd3W6MqI');
            
            sender.send(message, { registrationTokens: regTokens }, function (err, response) {
                if(err) {
                    console.error(err);
                }
                else {
                    console.log(response);
                }
            });
        },         
        on: function(strEvent,callbackFunction){
            self.on(strEvent,function(data){
                callbackFunction(data);
            })
        }
    }

    var myCOFS = new pubPLC.COFSSettingsTemplate();
    myCOFS.digitalsInMask = 65535;
    myCOFS.digitalsLastStatus = 0;
    myCOFS.digitalsExtMask = 0;
    myCOFS.digitalsExtLastStatus = 0;
    myCOFS.counter0Mask = 10;
    myCOFS.counter0LastStatus = 0;
    arrCOFS.push(myCOFS);

    var myControlVariables = {};
    var myControl = __settings.value.control;

    var myCOFS = __settings.value.io;


    pubPLC.runPLCLogic(1000);

    return pubPLC;


}
util.inherits(sbModule, EventEmitter);
exports.rmcplc = sbModule;