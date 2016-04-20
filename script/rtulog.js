/**
 * Created by shane on 3/13/15.
 */




// var settings = require(__base + '/config.js').settings;


var EventEmitter = require( "events" ).EventEmitter;
var util = require('util');

Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}


var sbModule = function() {
    try{
        var self = this;
        var thisMessageID = 1;

        var thisdebug = 0;
        var currentLogIndex = 0;
        var myIO;

        var timezone = settings.value.timeZone;

        var pubRTULog = {
            log: [],
            jsonLogTemplate: function(){
                template = {
                    'Sent': 0,
                    'ID': 1,
                    'Start': '%1',
                    'VersionNumber': settings.value.version,
                    'SerialNumber': settings.value.localwebserver.rtuId,
                    'MessageID': thisMessageID,
                    'DateTime': 22351140,
                    'TxFlag': 1,
                    'Digitals': 65535,
                    'DigitalsExt': 0,
                    'Analog0': 1,
                    'Analog1': 0,
                    'Analog2': 0,
                    'Analog3': 0,
                    'AnalogExt0': 0,
                    'AnalogExt1': 0,
                    'AnalogExt2': 0,
                    'AnalogExt3': 0,
                    'AnalogExt4': 0,
                    'AnalogExt5': 0,
                    'AnalogExt6': 0,
                    'AnalogExt7': 0,
                    'Counter0': 0,
                    'Counter1': 0,
                    'Counter2': 0,
                    'Counter3': 0,
                    'Counter4': 0,
                    'Counter5': 0,
                    'Counter6': 0,
                    'Counter7': 0,
                    'Battery': 0,
                    'Signal': 0,
                    'End': '*'
                }
            },
            init: function(io,debug){
                myIO = io;
                thisdebug = debug;
            },
            add: function(payLoad,sendImmediatly,fireAndForget) {
                if(thisMessageID > 999){
                    thisMessageID = 0;
                }
                thisMessageID += 1;
                if (pubRTULog.log.length > thisMessageID){
                    pubRTULog.log.splice(thisMessageID, 1);
                }

                var msgOut = {
                    dateTime: '2016/01/01',
                    messageId: thisMessageID,
                    payLoad: payLoad
                };
                // jsonRecord.DateTime = pubRTULog.compressDate();

                var logEntry = {
                    'Sent': 0,
                    'fireAndForget': fireAndForget,
                    'retries': 5,
                    'DateAndTime': '2015-01-01',
                    'msgOut': msgOut
                };
                    // 'strMessage': pubRTULog.convertJsonToOutput(jsonRecord)

                if(sendImmediatly == 1){
                    pubRTULog.log.unshift(logEntry);
                    console.log('added rtulog to beggining');
                }else{
                    pubRTULog.log.push(logEntry);
                    console.log('added rtulog to end');
                }

            },
            processMessageIn: function(msgIn){
                if(msgIn.msgType === 'handshake'){
                    for(var i=0;i<pubRTULog.length;i++){
                        if(pubRTULog[i].msgOut.messageId === msgIn.payLoad.msgId){
                            pubRTULog[i].Sent = 1;
                            return;
                        }
                    }
                }







                // var thisData = data;
                // var arrIn = [];
                // arrIn = thisData.split([' ']);
                // if(arrIn[0] == '%1'){
                //     if(currentLogIndex > -1){
                //         console.log('Log Marked As Sent');
                //         pubRTULog.log[currentLogIndex].Sent = 1;
                //     }

                // }
                // if(arrIn[0] == '%5'){
                //     //rtulog.currentstatus.Start = '%2';
                //     pubRTULog.add(myIO.getIOStatus(1),1,1);
                // }

            },
            readLog: function() {
                var i = 0;
                var RTUMessages = pubRTULog.log;
                for(i=0;i<RTUMessages.length;i++){
                    if(RTUMessages[i].Sent == 0){
                        currentLogIndex = i;
                        if(RTUMessages[i].fireAndForget == 1){
                            RTUMessages[i].Sent = 1;
                            currentLogIndex = -1;
                        }
                        return RTUMessages[i].strMessage;
                    }

                }
                return '';
            },
            compressDate: function(){
                var vDateValue = 0;
                var date = new Date().addHours(timezone);
                //new Date();


                var hour = 0;
                hour = date.getHours();
                hour = (hour < 10 ? "0" : "") + hour;

                var min = 0;
                min  = date.getMinutes();
                min = (min < 10 ? "0" : "") + min;

                var sec = 0;
                sec  = date.getSeconds();
                sec = (sec < 10 ? "0" : "") + sec;

                var year = 0;
                year = date.getFullYear() - 2000;

                var month = 0;
                month = date.getMonth() + 1;
                month = (month < 10 ? "0" : "") + month;

                var day = 0;
                day  = date.getDate();
                day = (day < 10 ? "0" : "") + day;

                vDateValue = year * (Math.pow(2,26));
                vDateValue = vDateValue + (month * (Math.pow(2,22)));
                vDateValue = vDateValue + (day * (Math.pow(2,17)));
                vDateValue = vDateValue + (hour * (Math.pow(2,12)));
                vDateValue = vDateValue + (min * (Math.pow(2,6)));
                vDateValue = vDateValue + (sec * 1);
                return vDateValue;
            },
            convertJsonToOutput: function(jsonData){
                jsonData.VersionNumber = settings.value.version;
                jsonData.SerialNumber = settings.value.rtuId;
                var strOutput = ''
                    + jsonData.Start
                    + ' ' + jsonData.VersionNumber
                    + ' ' + jsonData.SerialNumber
                    + ' ' + jsonData.MessageID
                    + ' ' + jsonData.DateTime
                    + ' ' + jsonData.TxFlag
                    + ' ' + jsonData.Digitals
                    + ' ' + jsonData.DigitalsExt
                    + ' ' + jsonData.Analog0
                    + ' ' + jsonData.Analog1
                    + ' ' + jsonData.Analog2
                    + ' ' + jsonData.Analog3
                    + ' ' + jsonData.AnalogExt0
                    + ' ' + jsonData.AnalogExt1
                    + ' ' + jsonData.AnalogExt2
                    + ' ' + jsonData.AnalogExt3
                    + ' ' + jsonData.AnalogExt4
                    + ' ' + jsonData.AnalogExt5
                    + ' ' + jsonData.AnalogExt6
                    + ' ' + jsonData.AnalogExt7
                    + ' ' + jsonData.Counter0
                    + ' ' + jsonData.Counter1
                    + ' ' + jsonData.Counter2
                    + ' ' + jsonData.Counter3
                    + ' ' + jsonData.Counter4
                    + ' ' + jsonData.Counter5
                    + ' ' + jsonData.Counter6
                    + ' ' + jsonData.Counter7
                    + ' ' + jsonData.Battery
                    + ' ' + jsonData.Signal
                    + ' ' + jsonData.End;
                return strOutput;

            },


            on: function(strEvent,callbackFunction){
                self.on(strEvent,function(data){
                    callbackFunction(data);
                })
            }
        }

        return pubRTULog
    }
    catch(error){
        console.log('rtulog The following error has occurred: ', error);
    }


}
util.inherits(sbModule, EventEmitter);
exports.rmcLog = sbModule;



