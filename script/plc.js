


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
            var msgOut = {
                sourceAddress: __settings.value.rtuId,
                destinationAddress: 0,
                msgId: 0,
                msgType: 'status',
                status: io.arrCurrentStatus[0]
            };
            myLog.add(msgOut,0,0);
        },
        processMessageIn: function(args){
            var deferred = new Q.defer();

            var msgIn = {

                dateTime: '2016/01/01',
                messageId: 789,
                payLoad: {
                    sourceAddress: 1,
                    destinationAddress: 2,
                    msgId: 123,
                    dateTime: '2016/01/01 12:13:14',
                    msgType: 'control',
                    write: {
                        destinationIO: 1,
                        io: 'digOut',
                        value: 1
                    }
                }
            };

            if(__settings.value.rtuId === msgIn.destinationAddress){
                if(msgIn.msgType === 'handshake'){
                    myLog.processMessageIn(msgIn);
                    args[2] = io.makeSenseOfRawData(msgIn.address);
                    deferred.resolve(args);
                }
                else if(msgIn.msgType === 'control'){
                    io.writeRegister(msgIn.write.destinationIO,msgIn.write.io,msgIn.write.value);
                    var msgResponse = {
                        sourceAddress: __settings.value.rtuId,
                        destinationAddress: msgIn.sourceAddress,
                        msgId: msgIn.msgId,
                        msgType: 'handshake'
                    };
                    myLog.add(msgResponse,1,1);
                    args[2] = io.makeSenseOfRawData(msgIn.address);
                    deferred.resolve(args);
                }
                else{
                    console.log('What should I do with this message. Sending status for shits and giggles');
                    var msgResponse1 = {
                        sourceAddress: __settings.value.rtuId,
                        destinationAddress: msgIn.sourceAddress,
                        msgId: msgIn.msgId,
                        msgType: 'status',
                        io: io.makeSenseOfRawData(msgIn.address)
                    };
                    args[2] = msgResponse1;
                    deferred.resolve(args);
                }
            }
            else{
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