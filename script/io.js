/**
 * Created by shane on 6/2/15.
 */




//var settings = new require(__base + '/config.js');
//var Settings    = require(__base + './script/settings.js');
var Q       = require('q');

var iomodbustcp         = require(__base + '/lib/iomodbustcp.js');
var iomodbusserial      = require(__base + '/lib/iomodbusserial.js');
var tcpClient           = require(__base + '/lib/tcpclient.js');
var rs232               = require(__base + './lib/rs232.js');
var dates 			    = require(__base + './lib/dates.js');


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
            var ioDetails = [];
            var i = 0;
            for(i=0;i<myIO.length;i++){
                if(myIO[i].enabled == 1){
                    switch(myIO[i].ioType){
                        case('TCP-MODMUX-AI8'):
                        case('TCP-MODMUX-DIO8'):
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
                                // currentStatus.io = {};
                                pubIO.currentStatus[__settings.value.rtuId] = currentStatus;
                            }

                            var id = myIO[i].id;
                            var obj = { id: myIO[i].id, ioType: myIO[i].ioType, rawData: [], data: {}, scaling: myIO[i].scaling, cofs: myIO[i].cofs };
                            ioDetails.push(obj);
                            break;
                        case('GAR-FEP'):
                            console.log('RS232');
                            // var myrs232 = new rs232.rmcRS232;
                            // myrs232.init(1);
                            var myrs232 = new rs232.rmcRS232;
                            myrs232.init("/dev/ttyUSB0",19200,1);                

                            var myIOModbusSerial_GARFEP = new iomodbusserial.ioModbusSerial(myIO[i].ioType, myIO[i].id);
                            console.log('here2');
                            myIOModbusSerial_GARFEP.init(myrs232,0);
                            myIOModbusSerial_GARFEP.on('data',function(data){
                                pubIO.processData(data);
                            });

                            var ioItem = {'id': myIO[i].id, 'io': myIOModbusSerial_GARFEP};
                            arrIO.push(ioItem);

                            if(typeof pubIO.currentStatus[__settings.value.rtuId] === 'undefined'){
                                var currentStatus = {};
                                currentStatus.rtuAddress = __settings.value.rtuId;
                                var id = myIO[i].id;
                                // currentStatus.io = {};
                                pubIO.currentStatus[__settings.value.rtuId] = currentStatus;
                            }

                            var id = myIO[i].id;
                            var obj = { id: myIO[i].id, ioType: myIO[i].ioType, rawData: [], data: {}, scaling: myIO[i].scaling, cofs: myIO[i].cofs };
                            ioDetails.push(obj);

                            break
                    }
                }
            }
            if(ioDetails.length > 0){
                pubIO.currentStatus[__settings.value.rtuId].ioDetails = ioDetails;    
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
        ioTemplateGlog: function(){
            return {
                rtuId: parseFloat(__settings.value.rtuId),
				time: 0,
				TxFlag: 0,
				digitalsIn: 0,
				AI1: 0,
				AI2: 0,
				AI3: 0,
				AI4: 0,
				AIExt1: 0,
				AIExt2: 0,
				AIExt3: 0,
				AIExt4: 0,
				AIExt5: 0,
				AIExt6: 0,
				AIExt7: 0,
				AIExt8: 0,
				CI1: 0,
				CI2: 0,
				CI3: 0,
				CI4: 0,
				CI5: 0,
				CI6: 0,
				CI7: 0,
				CI8: 0,
				BATT: 0,
				SIG: 0,
                rawData: []
            }
        },
        getIOStatus: function(Address){
            // var i = 0;
            // for(i=0;i<pubIO.arrCurrentStatus.length;i++){
            //     if(pubIO.arrCurrentStatus[i].ID == Address){
            //         return pubIO.arrCurrentStatus[i];
            //     }
            // }
            // return -999;

            return pubIO.currentStatus[Address];
        },

        getModBusRegisterValue: function(Address,ModBusPos){
            var i = 0;
            for(i=0;i<pubIO.arrCurrentStatus.length;i++){
                var ModbusAddress = parseInt(ModBusPos/100);
                ModBusPos = ModBusPos - (ModbusAddress *100);
                ModbusAddress++;
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
                }
            }
        },
        processData: function(data){
            var Address = data.IOid;
            var IOType = data.IOType;
            pubIO.currentStatus[__settings.value.rtuId].ioDetails[data.IOid-1].rawData = data.data;
            switch(data.IOType){
                case('TCP-MODMUX-DIO8'):
                case('TCP-MODMUX-AI8'):
                    if(thisdebug == 1){
                        console.log('IO-myIOModbus AI8/DIO8 data: ' + data.IOType);
                    }
                    if (data.data.length == 12 && data.data[7] == 16) {
                        return;
                    }
                    pubIO.makeSenseOfRawData();
                    break;
                case('GAR-FEP'):
                    if(thisdebug == 1){
                        // console.log('GAR-FEP: ' + data.IOType);
                    }
                    if (data.data.length == 12 && data.data[7] == 16) {
                        return;
                    }
                    // let tmp = data.data[9]
                    // tmp <<= 8;
                    // tmp += data.data[10];
                    pubIO.makeSenseOfRawData();
                    break;
                default:
                    console.log('io-Unknown IOType');
                    break;

            }
        },
        makeSenseOfRawData: function(){
            for(var item of pubIO.currentStatus[__settings.value.rtuId].ioDetails){
                switch(item.ioType){
                    case('TCP-MODMUX-DIO8'):
                        var TCPMODMUXDIO8 = pubIO.ioTemplateTCPMODMUXDIO8();
                        TCPMODMUXDIO8.id = item.id;
                        TCPMODMUXDIO8.ioType = item.ioType;
                        TCPMODMUXDIO8.digitalsIn = item.rawData[9];    //was 11
                        TCPMODMUXDIO8.digitalsIn <<= 8;
                        TCPMODMUXDIO8.digitalsIn += item.rawData[10];   //was 12
                        pubIO.currentStatus[__settings.value.rtuId].ioDetails[item.id-1].data = TCPMODMUXDIO8;
                        break;
                    case('TCP-MODMUX-AI8'):
                        var TCPMODMUXAI8 = pubIO.ioTemplateTCPMODMUXAI8();
                        TCPMODMUXAI8.id = item.ID;
                        TCPMODMUXAI8.ioType = item.ioType;
                        
                        TCPMODMUXAI8.AI1 = item.rawData[9];
                        TCPMODMUXAI8.AI1 <<= 8;
                        TCPMODMUXAI8.AI1 += item.rawData[10];
                        TCPMODMUXAI8.AI1Scaled = parseInt(((TCPMODMUXAI8.AI1 - item.scaling[0].rawLow) / (item.scaling[0].rawHi - item.scaling[0].rawLow)) * ((item.scaling[0].scaleHi - item.scaling[0].scaleLow)));

                        TCPMODMUXAI8.AI2 = item.rawData[11];
                        TCPMODMUXAI8.AI2 <<= 8;
                        TCPMODMUXAI8.AI2 += item.rawData[12];
                        TCPMODMUXAI8.AI2Scaled = parseInt(((TCPMODMUXAI8.AI2 - item.scaling[1].rawLow) / (item.scaling[1].rawHi - item.scaling[1].rawLow)) * ((item.scaling[1].scaleHi - item.scaling[1].scaleLow)));
                        
                        pubIO.currentStatus[__settings.value.rtuId].ioDetails[item.id-1].data = TCPMODMUXAI8;
                        break;
                    case('GAR-FEP'):
                        var MODBUSDATA = pubIO.ioTemplateGlog();
                        // MODBUSDATA.id = item.ID;
                        // MODBUSDATA.ioType = item.ioType;
                        
                        MODBUSDATA.AI1 = item.rawData[9];
                        MODBUSDATA.AI1 <<= 8;
                        MODBUSDATA.AI1 += item.rawData[10];

                        var deviceTime = parseInt(new Date().getTime() / 1000|0);
                        var time = new dates.module().compressDateGlog(new Date(deviceTime * 1000),2);
                        MODBUSDATA.time = time

                        pubIO.currentStatus[__settings.value.rtuId].glogData = '%1 0210.030 ' + MODBUSDATA.rtuId + ' 800 ' + MODBUSDATA.time + ' '+MODBUSDATA.TxFlag+' '+MODBUSDATA.digitalsIn+' 0 '+MODBUSDATA.AI1+' '+MODBUSDATA.AI2+' '+MODBUSDATA.AI3+' '+MODBUSDATA.AI4+' '+MODBUSDATA.AIExt1+' '+MODBUSDATA.AIExt2+' '+MODBUSDATA.AIExt3+' '+MODBUSDATA.AIExt4+' '+MODBUSDATA.AIExt5+' '+MODBUSDATA.AIExt6+' '+MODBUSDATA.AIExt7+' '+MODBUSDATA.AIExt8+' '+MODBUSDATA.CI1+' '+MODBUSDATA.CI2+' '+MODBUSDATA.CI3+' '+MODBUSDATA.CI4+' '+MODBUSDATA.CI5+' '+MODBUSDATA.CI6+' '+MODBUSDATA.CI7+' '+MODBUSDATA.CI8+' '+MODBUSDATA.BATT+' '+MODBUSDATA.SIG+' 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 > 8220 *';
                        pubIO.currentStatus[__settings.value.rtuId].ioDetails[item.id-1].data = MODBUSDATA;


                        break
                    default:
                        console.log('Unhandled ioType here5');
                        break;
                        // return  null;
                }


            }
            return pubIO.currentStatus[__settings.value.rtuId];
        },
        writeRegister: function(ModuleAddress,IOToWrite,ValueToWrite){
            arrIO.forEach(function(item){
                if(typeof item != 'undefined'){
                    if(item.id == ModuleAddress){
                        console.log('writeRegister',IOToWrite);
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
