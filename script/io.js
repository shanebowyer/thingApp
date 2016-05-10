/**
 * Created by shane on 6/2/15.
 */




//var settings = new require(__base + '/config.js');
//var Settings    = require(__base + './script/settings.js');
var Q       = require('q');

var iomodbustcp = require(__base + '/script/iomodbustcp.js');
var iomodbusserial = require(__base + '/script/iomodbusserial.js');
var tcpClient = require(__base + '/script/tcpclient.js');
var rs232 = require(__base + './script/rs232.js');


var EventEmitter = require( "events" ).EventEmitter;
var util = require('util');
var net = require('net');


var sbModule = function() {
    var self = this;

    var thisdebug = 0;
    var myTCPClient;
    var arrIO = [];

    var pubIO = {
        init: function(debug){
            thisdebug = debug;
            // thisdebug = 1;

            console.log('Starting io');

            if(typeof __settings === 'undefined'){
                console.log('settings undefined');
            }
            // console.log('settings',settings.value);

            var myIO = __settings.value.io;
            var i = 0;
            for(i=0;i<myIO.length;i++){
                if(myIO[i].enabled == 1){
                    if(myIO[i].ioType == 'TCP-MODMUX-AI8' || myIO[i].ioType == 'TCP-MODMUX-DIO8') 
                    {
                        var ioTCPClient = new tcpClient.rmcTCP;
                        ioTCPClient.init(function(err){
                            console.log('io error',err);
                        }, myIO[i].ipAddress,myIO[i].port,0);

                        console.log('loaded ioType',myIO[i].ioType);
                        var ioModbus = new iomodbustcp.ioModbus(myIO[i].ioType, myIO[i].id);
                        
                        ioModbus.init(ioTCPClient,0);

                        ioModbus.on('data',function(data){
                            pubIO.processData(data);
                        });
                        var ioItem = {'id': myIO[i].id, 'io': ioModbus};
                        arrIO.push(ioItem);


                        if(typeof pubIO.currentStatus[__settings.value.rtuId] === 'undefined'){
                            var currentStatus = {};
                            currentStatus.rtuAddress = __settings.value.rtuId;
                            var id = myIO[i].id;
                            // var obj = { id: myIO[i].id, ioType: myIO[i].ioType, rawData: '', data: {} };
                            currentStatus.io = {};
                            // currentStatus.io[id] = obj;
                            pubIO.currentStatus[__settings.value.rtuId] = currentStatus;
                        }

                        if(typeof pubIO.currentStatus[__settings.value.rtuId].io[myIO[i].IOid] === 'undefined'){
                            var id = myIO[i].id;
                            var obj = { id: myIO[i].id, ioType: myIO[i].ioType, rawData: [], data: {}, scaling: myIO[i].scaling, cofs: myIO[i].cofs };
                            // console.log('myIO[i]',myIO[i]);
                            var io = {};
                            pubIO.currentStatus[__settings.value.rtuId].io[id] = obj;
                        }

                    }

                    // if(myIO[i].ioType == 'GAR-FEP')
                    // {
                    //     var ioRS232 = new rs232.rmcRS232(function(err){
                    //         console.log('rs232 GAR-FEP error',err);
                    //     });
                    //     ioRS232.init(myIO[i].commPort,myIO[i].baudRate,1);

                    //     var ioGARFEP = new iomodbusserial.ioModbusSerial(myIO[i].ioType, myIO[i].id);
                    //     ioGARFEP.init(ioRS232,0);

                    //     ioGARFEP.on('data',function(data){
                    //         pubIO.processData(data);
                    //     });
                    //     var ioItem = {'id': myIO[i].id, 'io': ioGARFEP};
                    //     arrIO.push(ioItem);

                    // }
                }
            }
        },        
        saveSettings: function(req,res,done,error){
            __settings.writeSettings(req,res,function(req,res,data){
                done(req,res,data);
            });
        },
        currentStatus: {
            rtuAddress: 0,
            io: {}  //{ id: myIO[i].id, ioType: '', rawData: [], data: {} }
        },
        ioTemplateTCPMODMUXDIO8: function(){
            return {
                id: 0,
                ioType: 'TCP-MODMUX-DIO8',
                digitalsIn: 0,
                digitalsOut: 0,
                digitalsOutWriteValue: 0
            };
        },
        ioTemplateTCPMODMUXAI8: function(){
            return {
                id: 0,
                ioType: 'TCP-MODMUX-AI8',
                AI1: 0,
                AI1Scaled: 0,
                AI2: 0,
                AI3: 0,
                AI4: 0,
                AI5: 0,
                AI6: 0,
                AI7: 0,
                AI8: 0
            };
        },
        ioTemplateStatus: function(){
            ioStatus = {
                'ID': 1,
                    'Start': '%1',
                    'VersionNumber': __settings.value.version,
                    'SerialNumber': __settings.value.rtuId,       //ModbusReg = 1
                    'rawData': [],
                    'ioType': '',
                    'MessageID': 0,                                         //ModbusReg = 2
                    'DateTime': 22351140,                                         //ModbusReg = 3
                    'TxFlag': 1,                                         //ModbusReg = 4
                    'Digitals': 0,                                         //ModbusReg = 5
                    'DigitalsExt': 0,                                         //ModbusReg = 6
                    'Analog0': 0,                                         //ModbusReg = 7
                    'Analog1': 0,                                         //ModbusReg = 8
                    'Analog2': 0,                                         //ModbusReg = 9
                    'Analog3': 0,                                         //ModbusReg = 10
                    'AnalogExt0': 0,                                         //ModbusReg = 11
                    'AnalogExt1': 0,                                         //ModbusReg = 12
                    'AnalogExt2': 0,                                         //ModbusReg = 13
                    'AnalogExt3': 0,                                         //ModbusReg = 14
                    'AnalogExt4': 0,                                         //ModbusReg = 15
                    'AnalogExt5': 0,                                         //ModbusReg = 16
                    'AnalogExt6': 0,                                         //ModbusReg = 17
                    'AnalogExt7': 0,                                         //ModbusReg = 18
                    'Counter0': 0,                                         //ModbusReg = 19
                    'Counter1': 0,                                         //ModbusReg = 20
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
            return ioStatus;
        },
        getIOStatus: function(Address){
            var i = 0;
            for(i=0;i<pubIO.arrCurrentStatus.length;i++){
                if(pubIO.arrCurrentStatus[i].ID == Address){
                    return pubIO.arrCurrentStatus[i];
                }
            }
            return -999;
        },
        getModBusRegisterValue: function(Address,ModBusPos){
            //console.log('Before ' + Address + '   ' + ModBusPos);

            var i = 0;
            for(i=0;i<pubIO.arrCurrentStatus.length;i++){

                var ModbusAddress = parseInt(ModBusPos/100);
                ModBusPos = ModBusPos - (ModbusAddress *100);
                ModbusAddress++;


                //console.log('After: ' + ModbusAddress + '   ' + ModBusPos);

                if(pubIO.arrCurrentStatus[i].ID == ModbusAddress){
                    switch(ModBusPos){
                        case(0):
                            //return 8;
                            return pubIO.arrCurrentStatus[i].Digitals;
                        case(2):
                            return 88;
                            //return pubIO.arrCurrentStatus[i].DigitalsExt;
                        case(4):
                            return 9;
                            //return pubIO.arrCurrentStatus[i].Analog0;
                        case(6):
                            return 99;
                            //return pubIO.arrCurrentStatus[i].Analog1;
                        default :
                            return 55;
                            break;
                    }

                    return 75;

                    //return pubIO.arrCurrentStatus[i];
                }
            }
        },
        processData: function(data){
            switch(data.IOType){
                case('TCP-MODMUX-DIO8'):
                case('TCP-MODMUX-AI8'):



                    if(thisdebug == 1){
                        console.log('IO-myIOModbus AI8/DIO8 data: ' + data.IOType);
                    }

                    if (data.data.length == 12 && data.data[7] == 16) {
                        return;
                    }
                    var Address = data.IOid;
                    var IOType = data.IOType;


                    pubIO.currentStatus[__settings.value.rtuId].io[data.IOid].rawData = data.data;
                    // debugger;
                    pubIO.makeSenseOfRawData();



                    break;
                case('GAR-FEP'):
                    // if(thisdebug == 1){
                    //     console.log('IO-myIOModbusSerial_GARFEP data: ' + data.ResponseTo);
                    // }

                    // //if (data.data.length == 12 && data.data[7] == 16) {
                    // //    //console.log('response to modbus write');
                    // //    return;
                    // //}
                    // var Address = data.data[3];
                    // var i = 0;
                    // var bFound = 0;
                    // for (i = 0; i < pubIO.arrCurrentStatus.length; i++) {
                    //     if (pubIO.arrCurrentStatus[i].ID == Address) {
                    //         bFound = 1;
                    //         break;
                    //     }
                    // }
                    // if (bFound == 0) {
                    //     var newIO = new pubIO.ioTemplateStatus();
                    //     newIO.ID = Address;
                    //     pubIO.arrCurrentStatus.push(newIO);
                    //     i = pubIO.arrCurrentStatus.length - 1;
                    // }

                    // pubIO.arrCurrentStatus[i].Digitals = data.data[74];
                    // pubIO.arrCurrentStatus[i].DigitalsExt = data.data[76];

                    // // console.log(pubIO.arrCurrentStatus[i].Digitals);
                    // // console.log(pubIO.arrCurrentStatus[i].DigitalsExt);

                    // pubIO.arrCurrentStatus[i].Analog0 = data.data[51];
                    // pubIO.arrCurrentStatus[i].Analog0 <<= 8;
                    // pubIO.arrCurrentStatus[i].Analog0 += data.data[50];
                    // // console.log(pubIO.arrCurrentStatus[i].Analog0);


                    // pubIO.arrCurrentStatus[i].Analog1 = data.data[53];
                    // pubIO.arrCurrentStatus[i].Analog1 <<= 8;
                    // pubIO.arrCurrentStatus[i].Analog1 += data.data[52];
                    // // console.log(pubIO.arrCurrentStatus[i].Analog1);

                    // //arrCurrentStatus[i].Counter0 = (data.data[11]*256)+data.data[12];
                    // //pubIO.arrCurrentStatus[i].Counter2 = (data.data[13]*256)+data.data[14];
                    break;
                default:
                    console.log('io-Unknown IOType');
                    break;

            }
            // pubIO.makeSenseOfRawData(Address);
        },
        makeSenseOfRawData: function(){
            for (var key in pubIO.currentStatus[__settings.value.rtuId].io) {
                if (pubIO.currentStatus[__settings.value.rtuId].io.hasOwnProperty(key)) {
                    var item = pubIO.currentStatus[__settings.value.rtuId].io[key];
                    // console.log('item',item);
                    switch(item.ioType){
                        case('TCP-MODMUX-DIO8'):
                            var TCPMODMUXDIO8 = pubIO.ioTemplateTCPMODMUXDIO8();
                            TCPMODMUXDIO8.id = item.id;
                            TCPMODMUXDIO8.ioType = item.ioType;
                            TCPMODMUXDIO8.digitalsIn = item.rawData[11];
                            TCPMODMUXDIO8.digitalsIn <<= 8;
                            TCPMODMUXDIO8.digitalsIn += item.rawData[12];
                            pubIO.currentStatus[__settings.value.rtuId].io[item.id].data = TCPMODMUXDIO8;
                            break;
                        case('TCP-MODMUX-AI8'):
                            var TCPMODMUXAI8 = pubIO.ioTemplateTCPMODMUXAI8();
                            TCPMODMUXAI8.id = item.ID;
                            TCPMODMUXAI8.ioType = item.ioType;
                            
                            TCPMODMUXAI8.AI1 = item.rawData[9];
                            TCPMODMUXAI8.AI1 <<= 8;
                            TCPMODMUXAI8.AI1 += item.rawData[10];
                            TCPMODMUXAI8.AI1Scaled = parseInt((TCPMODMUXAI8.AI1 / (item.scaling[0].rawHi - item.scaling[0].rawLow)) * ((item.scaling[0].scaleHi - item.scaling[0].scaleLow)));

                            TCPMODMUXAI8.AI2 = item.rawData[11];
                            TCPMODMUXAI8.AI2 <<= 8;
                            TCPMODMUXAI8.AI2 += item.rawData[12];
                            TCPMODMUXAI8.AI2Scaled = parseInt((TCPMODMUXAI8.AI2 / (item.scaling[0].rawHi - item.scaling[0].rawLow)) * ((item.scaling[0].scaleHi - item.scaling[0].scaleLow)));
                            
                            pubIO.currentStatus[__settings.value.rtuId].io[item.id].data = TCPMODMUXAI8;
                            break;
                        default:
                            break;
                            // console.log('Unhandled ioType here5',item.ioType);
                            // return  null;
                    }
                }
            }            
            // console.log('makeSenseOfRawData pubIO.currentStatus[__settings.value.rtuId]', pubIO.currentStatus[__settings.value.rtuId]);
            return pubIO.currentStatus[__settings.value.rtuId];
        },
        writeRegister: function(ModuleAddress,IOToWrite,ValueToWrite){
            arrIO.forEach(function(item){
                if(typeof item != 'undefined'){
                    if(item.id == ModuleAddress){
                        item.io.writeRegister(ModuleAddress,IOToWrite,ValueToWrite,0);
                    }                    
                }

            });
        },
        on: function(strEvent,callbackFunction){
            self.on(strEvent,function(data){
                callbackFunction(data);
            });
        }
    };

    return pubIO;
};
util.inherits(sbModule, EventEmitter);
exports.rmcio = sbModule;








                    // pubIO.arrCurrentStatus[i].Digitals = data.data[9];
                    // pubIO.arrCurrentStatus[i].Digitals <<= 8;
                    // pubIO.arrCurrentStatus[i].Digitals += data.data[10];

                    // pubIO.arrCurrentStatus[i].DigitalsExt = data.data[11];
                    // pubIO.arrCurrentStatus[i].DigitalsExt <<= 8;
                    // pubIO.arrCurrentStatus[i].DigitalsExt += data.data[12];

                    // pubIO.arrCurrentStatus[i].Counter0 = data.data[13];
                    // pubIO.arrCurrentStatus[i].Counter0 <<= 8;
                    // pubIO.arrCurrentStatus[i].Counter0 += data.data[14];
                    // pubIO.arrCurrentStatus[i].Counter0 <<= 8;
                    // pubIO.arrCurrentStatus[i].Counter0 += data.data[15];
                    // pubIO.arrCurrentStatus[i].Counter0 <<= 8;
                    // pubIO.arrCurrentStatus[i].Counter0 += data.data[16];

                    // pubIO.arrCurrentStatus[i].Counter1 = data.data[17];
                    // pubIO.arrCurrentStatus[i].Counter1 <<= 8;
                    // pubIO.arrCurrentStatus[i].Counter1 += data.data[18];
                    // pubIO.arrCurrentStatus[i].Counter1 <<= 8;
                    // pubIO.arrCurrentStatus[i].Counter1 += data.data[19];
                    // pubIO.arrCurrentStatus[i].Counter1 <<= 8;
                    // pubIO.arrCurrentStatus[i].Counter1 += data.data[20];

                    // break;
                // case('TCP-MODMUX-AI8'):

                //     if(thisdebug == 1){
                //         console.log('IO-myIOModbusTCP_AI8 data: ' + data.ResponseTo);
                //     }

                //     //if (data.data.length == 12 && data.data[7] == 16) {
                //     //    //console.log('response to modbus write');
                //     //    return;
                //     //}
                //     var Address = data.data[6];
                //     var i = 0;
                //     var bFound = 0;
                //     for (i = 0; i < pubIO.arrCurrentStatus.length; i++) {
                //         if (pubIO.arrCurrentStatus[i].ID == Address) {
                //             bFound = 1;
                //             break;
                //         }
                //     }
                //     if (bFound == 0) {
                //         var newIO = new pubIO.ioTemplateStatus();
                //         newIO.ID = Address;
                //         pubIO.arrCurrentStatus.push(newIO);
                //         i = pubIO.arrCurrentStatus.length;
                //     }


                //     pubIO.arrCurrentStatus[i].Analog0 = data.data[9];
                //     pubIO.arrCurrentStatus[i].Analog0 <<= 8;
                //     pubIO.arrCurrentStatus[i].Analog0 += data.data[10];

                //     pubIO.arrCurrentStatus[i].Analog1 = data.data[11];
                //     pubIO.arrCurrentStatus[i].Analog1 <<= 8;
                //     pubIO.arrCurrentStatus[i].Analog1 += data.data[12];