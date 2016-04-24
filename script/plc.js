


// var settings = require(__base + '/config.js');
// var settings    = require(__base + './script/settings.js').settings;
var Q       = require('q');
var iomodbustcp = require(__base + '/script/iomodbustcp.js');
var tcpClient = require(__base + '/script/tcpclient.js');


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

        COFSSettingsTemplate: function(){
            COFS = {
                DigitalsMask: 0,
                DigitalsLastStatus: 0,
                DigitalsExtMask: 0,
                DigitalsExtLastStatus: 0,
                Counter0Mask: 0,
                Counter0LastStatus : 0
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
                io: io.makeSenseOfRawData(__settings.value.rtuId)
            };
            myLog.add(msgResponse,1,1);
            args[2] = msgResponse;
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

        processMessageIn: function(args){
            var deferred = new Q.defer();

            console.log('Processing PLC processMessageIn');

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
            console.log('Memory size', ObjectLength(io.currentStatus));

            var msgIn = args[2];
            console.log('msgIn',msgIn);
            var payLoad = msgIn.payLoad;
            console.log('payLoad',payLoad);

            if(__settings.value.rtuId === payLoad.sourceAddress){
                //dont chat this is echo from server
                deferred.reject(args);
                return deferred.promise;
            }
            console.log('rtuID',__settings.value.rtuId);
            console.log('destinationAddress',payLoad.destinationAddress);
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

            if(__settings.value.rtuId === payLoad.destinationAddress){
                if(msgIn.msgType === 'handshake'){
                    console.log('Handshake recieved');
                    myLog.processMessageIn(msgIn);
                    args[2] = io.makeSenseOfRawData(__settings.value.rtuId);
                    deferred.resolve(args);
                    //myLog.add(JSON.stringify(args),1,1);
                }
                else if(payLoad.msgType === 'control'){
                    console.log('doing Control');
                    io.writeRegister(payLoad.write.destinationIO,payLoad.write.io,payLoad.write.value);
                    debugger;
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
                        msgId: payLoad.msgId,
                        msgType: 'handshake',
                        io: io.makeSenseOfRawData(__settings.value.rtuId)
                    };
                    myLog.add(msgResponse,1,1);
                    args[2] = msgResponse;
                    deferred.resolve(args);
                }
                else if(payLoad.msgType === 'status'){
                    console.log('maiing sense of data');
                    var msgResponse2 = {
                        sourceAddress: __settings.value.rtuId,
                        destinationAddress: payLoad.sourceAddress,
                        msgId: msgIn.messageId,
                        msgType: 'status',
                        io: io.makeSenseOfRawData(__settings.value.rtuId)
                    };
                    args[2] = msgResponse2;
                    deferred.resolve(args);
                }
                else{
                    console.log('Ignored MessageIn');
                    args[2] = 'Ignored MessageIn';
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
                args[2] = 'The message in does not match this rtu address';
                deferred.reject(args);
            }

            return deferred.promise;
        },
        runPLCLogic: function(runSpeedMilliseconds){
            setInterval(function(){
                pubPLC.checkCOFS(function(COFS){
                    if(io.currentStatus[__settings.value.rtuId] != undefined){
                        //testDig += 1;
                        //if(testDig > 255){
                        //    testDig = 0;
                        //}
                        //var digVal = io.arrCurrentStatus[0].Digitals;
                        //io.writeRegister(1,'DigOut',testDig);
                        //io.writeRegister(1,'Counter0',testDig);


                        //if(io.arrCurrentStatus[0].Analog0 > 1000){
                        //    io.writeRegister(1,'DigOut',1);
                        //}else{
                        //    io.writeRegister(1,'DigOut',0);
                        //}
                        //if(io.arrCurrentStatus[0].Analog1 > 1000){
                        //    io.writeRegister(1,'DigOut',3);
                        //}else{
                        //    io.writeRegister(1,'DigOut',0);
                        //}

                    }
                });
            },runSpeedMilliseconds);
        },
        checkCOFS: function(done){
            var i = 0;
            var bCOFS = 0;
            var TxFlag = 0;

            // if(io.arrCurrentStatus[0] != undefined){
            //     if(arrCOFS != undefined){
            //         if(arrCOFS.length > 0){
            //             //console.log('DIGITAL: ' + io.arrCurrentStatus[0].Digitals);

            //             //DIGITALS
            //             if(arrCOFS[0].DigitalsMask > 0){
            //                 var CurrentDigitalStatusWithMask = io.arrCurrentStatus[0].Digitals & arrCOFS[0].DigitalsMask;
            //                 if(CurrentDigitalStatusWithMask != arrCOFS[0].DigitalsLastStatus){
            //                     arrCOFS[0].DigitalsLastStatus = io.arrCurrentStatus[0].Digitals  & arrCOFS[0].DigitalsMask;
            //                     TxFlag += Math.pow(2,1);
            //                     console.log('Digital COFS');
            //                     bCOFS = 1;
            //                 }
            //             }
            //             //DIGITALS EXT(Digital Outputs on tcp modmux unit)
            //             if(arrCOFS[0].DigitalsExtMask > 0){
            //                 var CurrentDigitalExtStatusWithMask = io.arrCurrentStatus[0].DigitalsExt & arrCOFS[0].DigitalsExtMask;
            //                 if(CurrentDigitalExtStatusWithMask != arrCOFS[0].DigitalsExtLastStatus){
            //                     arrCOFS[0].DigitalsExtLastStatus = io.arrCurrentStatus[0].DigitalsExt  & arrCOFS[0].DigitalsExtMask;
            //                     TxFlag += Math.pow(2,1);
            //                     console.log('DigitalExt COFS');
            //                     bCOFS = 1;
            //                 }
            //             }

            //             //COUNTER0
            //             if(arrCOFS[0].Counter0Mask > 0){
            //                 if((io.arrCurrentStatus[0].Counter0 - arrCOFS[0].Counter0LastStatus >= arrCOFS[0].Counter0Mask) || (arrCOFS[0].Counter0LastStatus - io.arrCurrentStatus[0].Counter0  >= arrCOFS[0].Counter0Mask)){
            //                     arrCOFS[0].Counter0LastStatus = io.arrCurrentStatus[0].Counter0;
            //                     TxFlag += Math.pow(2,2);
            //                     console.log('Counter0 COFS');
            //                     bCOFS = 1;
            //                 }
            //             }
            //         }
            //     }
            // }
            // if(bCOFS == 1){
            //     console.log('COFS TXFlag = ' + TxFlag);
            //     io.arrCurrentStatus[0].TxFlag = TxFlag;
            //     var jsonRecord = io.arrCurrentStatus[0];
            //     myLog.add(jsonRecord,1,1);
            // }
            done(bCOFS);
        },
        on: function(strEvent,callbackFunction){
            self.on(strEvent,function(data){
                callbackFunction(data);
            })
        }
    }

    var myCOFS = new pubPLC.COFSSettingsTemplate();
    myCOFS.DigitalsMask = 65535;
    myCOFS.DigitalsLastStatus = 0;
    myCOFS.DigitalsExtMask = 0;
    myCOFS.DigitalsExtLastStatus = 0;
    myCOFS.Counter0Mask = 10;
    myCOFS.Counter0LastStatus = 0;
    arrCOFS.push(myCOFS);

    pubPLC.runPLCLogic(1000);


    return pubPLC;


}
util.inherits(sbModule, EventEmitter);
exports.rmcplc = sbModule;