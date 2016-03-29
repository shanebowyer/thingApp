/**
 * Created by shane on 6/2/15.
 */




var settings = require(__base + '/config.js');
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


    var pubIO = {
        arrCurrentStatus: [],
        ioTemplateStatus: function(){
            ioStatus = {
                'ID': 1,
                    'Start': '%1',
                    'VersionNumber': settings.version,
                    'SerialNumber': settings.rtuId,       //ModbusReg = 1
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

        init: function(debug){
            thisdebug = debug;
        },
        getIOStatus: function(Address){
            var i = 0;
            for(i=0;i<pubIO.arrCurrentStatus.length;i++){
                if(pubIO.arrCurrentStatus[i].ID == Address){
                    return pubIO.arrCurrentStatus[i];
                }
            }
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
                    if(thisdebug == 1){
                        console.log('IO-myIOModbus data: ' + data.ResponseTo);
                    }

                    if (data.data.length == 12 && data.data[7] == 16) {
                        //console.log('response to modbus write');
                        return;
                    }
                    var Address = data.data[6];
                    var i = 0;
                    var bFound = 0;
                    for (i = 0; i < pubIO.arrCurrentStatus.length; i++) {
                        if (pubIO.arrCurrentStatus[i].ID == Address) {
                            bFound = 1;
                            break;
                        }
                    }
                    if (bFound == 0) {
                        var newIO = new pubIO.ioTemplateStatus();
                        newIO.ID = Address;
                        pubIO.arrCurrentStatus.push(newIO);
                        i = pubIO.arrCurrentStatus.length;
                    }

                    pubIO.arrCurrentStatus[i].Digitals = data.data[9];
                    pubIO.arrCurrentStatus[i].Digitals <<= 8;
                    pubIO.arrCurrentStatus[i].Digitals += data.data[10];

                    pubIO.arrCurrentStatus[i].DigitalsExt = data.data[11];
                    pubIO.arrCurrentStatus[i].DigitalsExt <<= 8;
                    pubIO.arrCurrentStatus[i].DigitalsExt += data.data[12];

                    //console.log('Digitals: ' + pubIO.arrCurrentStatus[i].Digitals);


                    pubIO.arrCurrentStatus[i].Counter0 = data.data[13];
                    pubIO.arrCurrentStatus[i].Counter0 <<= 8;
                    pubIO.arrCurrentStatus[i].Counter0 += data.data[14];
                    pubIO.arrCurrentStatus[i].Counter0 <<= 8;
                    pubIO.arrCurrentStatus[i].Counter0 += data.data[15];
                    pubIO.arrCurrentStatus[i].Counter0 <<= 8;
                    pubIO.arrCurrentStatus[i].Counter0 += data.data[16];

                    pubIO.arrCurrentStatus[i].Counter1 = data.data[17];
                    pubIO.arrCurrentStatus[i].Counter1 <<= 8;
                    pubIO.arrCurrentStatus[i].Counter1 += data.data[18];
                    pubIO.arrCurrentStatus[i].Counter1 <<= 8;
                    pubIO.arrCurrentStatus[i].Counter1 += data.data[19];
                    pubIO.arrCurrentStatus[i].Counter1 <<= 8;
                    pubIO.arrCurrentStatus[i].Counter1 += data.data[20];
                    break;
                case('TCP-MODMUX-AI8'):

                    if(thisdebug == 1){
                        console.log('IO-myIOModbusTCP_AI8 data: ' + data.ResponseTo);
                    }

                    //if (data.data.length == 12 && data.data[7] == 16) {
                    //    //console.log('response to modbus write');
                    //    return;
                    //}
                    var Address = data.data[6];
                    var i = 0;
                    var bFound = 0;
                    for (i = 0; i < pubIO.arrCurrentStatus.length; i++) {
                        if (pubIO.arrCurrentStatus[i].ID == Address) {
                            bFound = 1;
                            break;
                        }
                    }
                    if (bFound == 0) {
                        var newIO = new pubIO.ioTemplateStatus();
                        newIO.ID = Address;
                        pubIO.arrCurrentStatus.push(newIO);
                        i = pubIO.arrCurrentStatus.length;
                    }


                    pubIO.arrCurrentStatus[i].Analog0 = data.data[9];
                    pubIO.arrCurrentStatus[i].Analog0 <<= 8;
                    pubIO.arrCurrentStatus[i].Analog0 += data.data[10];

                    pubIO.arrCurrentStatus[i].Analog1 = data.data[11];
                    pubIO.arrCurrentStatus[i].Analog1 <<= 8;
                    pubIO.arrCurrentStatus[i].Analog1 += data.data[12];

                    break;
                case('GAR-FEP'):
                    if(thisdebug == 1){
                        console.log('IO-myIOModbusSerial_GARFEP data: ' + data.ResponseTo);
                    }

                    //if (data.data.length == 12 && data.data[7] == 16) {
                    //    //console.log('response to modbus write');
                    //    return;
                    //}
                    var Address = data.data[3];
                    var i = 0;
                    var bFound = 0;
                    for (i = 0; i < pubIO.arrCurrentStatus.length; i++) {
                        if (pubIO.arrCurrentStatus[i].ID == Address) {
                            bFound = 1;
                            break;
                        }
                    }
                    if (bFound == 0) {
                        var newIO = new pubIO.ioTemplateStatus();
                        newIO.ID = Address;
                        pubIO.arrCurrentStatus.push(newIO);
                        i = pubIO.arrCurrentStatus.length - 1;
                    }

                    pubIO.arrCurrentStatus[i].Digitals = data.data[74];
                    pubIO.arrCurrentStatus[i].DigitalsExt = data.data[76];

                    // console.log(pubIO.arrCurrentStatus[i].Digitals);
                    // console.log(pubIO.arrCurrentStatus[i].DigitalsExt);

                    pubIO.arrCurrentStatus[i].Analog0 = data.data[51];
                    pubIO.arrCurrentStatus[i].Analog0 <<= 8;
                    pubIO.arrCurrentStatus[i].Analog0 += data.data[50];
                    // console.log(pubIO.arrCurrentStatus[i].Analog0);


                    pubIO.arrCurrentStatus[i].Analog1 = data.data[53];
                    pubIO.arrCurrentStatus[i].Analog1 <<= 8;
                    pubIO.arrCurrentStatus[i].Analog1 += data.data[52];
                    // console.log(pubIO.arrCurrentStatus[i].Analog1);

                    //arrCurrentStatus[i].Counter0 = (data.data[11]*256)+data.data[12];
                    //pubIO.arrCurrentStatus[i].Counter2 = (data.data[13]*256)+data.data[14];
                    break;
                default:
                    console.log('io-Unknown IOType');
                    break;

            }

        },
        WriteRegister: function(ModuleAddress,IOToWrite,ValueToWrite){
            myIOModbusTCP_DIO8.WriteRegister(ModuleAddress,IOToWrite,ValueToWrite,0);   //0 = Not permamnent
        },
        on: function(strEvent,callbackFunction){
            self.on(strEvent,function(data){
                callbackFunction(data);
            })
        }
    }

    console.log('Starting io');


    var myIO = settings.io;
    var i = 0;
    for(i=0;i<myIO.length;i++){
        if(myIO[i].enabled == 1){
            if(myIO[i].ioType == 'TCP-MODMUX-AI8' || myIO[i].ioType == 'TCP-MODMUX-DIO8') 
            {
                var ioTCPClient = new tcpClient.rmcTCP;
                ioTCPClient.init(function(err){
                    console.log('io error',err);
                }, myIO[i].ipAddress,myIO[i].port,0);

                var ioModbus = new iomodbustcp.ioModbus('TCP-MODMUX-AI8');
                ioModbus.init(ioTCPClient,0);

                ioModbus.on('data',function(data){
                    pubIO.processData(data);
                });
            }

            if(myIO[i].ioType == 'GAR-FEP')
            {
                var ioRS232 = new rs232.rmcRS232(function(err){
                    console.log('rs232 GAR-FEP error',err);
                });
                ioRS232.init(myIO[i].commPort,myIO[i].baudRate,1);

                var ioGARFEP = new iomodbusserial.ioModbusSerial('GAR-FEP');
                ioGARFEP.init(ioRS232,0);

                ioGARFEP.on('data',function(data){
                    pubIO.processData(data);
                });
            }
        }
    }


    return pubIO;


}
util.inherits(sbModule, EventEmitter);
exports.rmcio = sbModule;

