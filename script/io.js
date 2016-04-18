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

    //var settings    = Settings.settings();


    var pubIO = {
        init: function(debug){
            thisdebug = debug;

            console.log('Starting io');
            // console.log('settings',settings.value);

            var myIO = settings.value.io;
            var i = 0;
            for(i=0;i<myIO.length;i++){
                if(myIO[i].enabled == 1){
                    if(myIO[i].ioType == 'TCP-MODMUX-AI8' || myIO[i].ioType == 'TCP-MODMUX-DIO8') 
                    {
                        var ioTCPClient = new tcpClient.rmcTCP;
                        ioTCPClient.init(function(err){
                            console.log('io error',err);
                        }, myIO[i].ipAddress,myIO[i].port,0);


                        var ioModbus = new iomodbustcp.ioModbus(myIO[i].ioType, myIO[i].id);
                        
                        ioModbus.init(ioTCPClient,0);

                        ioModbus.on('data',function(data){
                            pubIO.processData(data);
                        });
                        var ioItem = {'id': myIO[i].id, 'io': ioModbus};
                        arrIO.push(ioItem);

                    }

                    if(myIO[i].ioType == 'GAR-FEP')
                    {
                        var ioRS232 = new rs232.rmcRS232(function(err){
                            console.log('rs232 GAR-FEP error',err);
                        });
                        ioRS232.init(myIO[i].commPort,myIO[i].baudRate,1);

                        var ioGARFEP = new iomodbusserial.ioModbusSerial(myIO[i].ioType, myIO[i].id);
                        ioGARFEP.init(ioRS232,0);

                        ioGARFEP.on('data',function(data){
                            pubIO.processData(data);
                        });
                        var ioItem = {'id': myIO[i].id, 'io': ioGARFEP};
                        arrIO.push(ioItem);

                    }
                }
            }
        },        
        // processAPICall: function(args,done,err){
        //     var apiRespone = {header:{result:{}},content:{}};
        //     try{
        //         var req = args[0];
        //         var cs = pubIO.arrCurrentStatus[0];
        //         console.log('arrcs',pubIO.arrCurrentStatus[0]);

        //         switch(req.query.reqIOToWrite){
        //             case('DigOut'):
        //                 response.content = cs.DigitalsExt;
        //                 if(cs.DigitalsExt == 0){
        //                     pubIO.WriteRegister(req.query.reqModuleAddress,req.query.reqIOToWrite,255);
        //                 }else{
        //                     pubIO.WriteRegister(req.query.reqModuleAddress,req.query.reqIOToWrite,0);
        //                 }
        //                 apiRespone.header.result = 'success';
        //                 apiRespone.content = 'Done';
        //                 args[2] = apiRespone;

        //                 done(args);
        //             default:
        //                 // response.header.result = 'error';
        //                 // response.content = 'Error. Not sure which io to control';
        //                 // res.json(response);
        //                 break;
        //         }

        //         console.log('req.body.myData.reqOption',req.body.myData.reqOption);

        //         // switch(req.body.myData.reqOption){
        //         //     case('read'):
        //         //         // pubIO.arrCurrentStatus.forEach(function(item){
        //         //         //     console.log('CurrentStatuses', item);
        //         //         // });
        //         //         apiRespone.header.result = 'success';
        //         //         apiRespone.content = cs.DigitalsExt;
        //         //         done(args);
        //         //     case('settings'):
        //         //         apiRespone.header.result = 'success';
        //         //         apiRespone.content = settings;
        //         //         args[2] = apiRespone;
        //         //         done(args);
        //         //     case('settingsSave'):
        //         //         function doit(args){
        //         //             var deferred = Q.defer();

        //         //             console.log('line 3');
        //         //             var apiRespone = {};


        //         //             settings.saveSettings(args)
        //         //             .then(function(args){
        //         //                 console.log('line1');
        //         //                 apiRespone.header.result = 'success';
        //         //                 apiRespone.content = args.settings;
        //         //                 args[2] = apiRespone;
        //         //                 done(args);

        //         //             }, function(args){
        //         //                 console.log('line2');
        //         //                 apiRespone.header.result = 'error';
        //         //                 apiRespone.content = err;
        //         //                 args[2] = apiRespone;
        //         //                 done(args);

        //         //             })


        //         //             return deferred.promise;
        //         //         }
        //         //         //var args = {'reqres': [req,res] };
        //         //         doit(args);
                        
        //         //     default:
        //         //         apiRespone.header.result = 'error';
        //         //         apiRespone.content = 'Error. Not sure which io to read';
        //         //         args[2] = apiRespone;
        //         //         done(args);
        //         // }


        //     }
        //     catch(e){
        //         console.log('error1',e);
        //         apiRespone.header.result = 'error';
        //         apiRespone.content = e.message.toString();
        //         args[2] = apiRespone;
        //         err(args);
        //     }
        // },
        saveSettings: function(req,res,done,error){
            settings.writeSettings(req,res,function(req,res,data){
                done(req,res,data);
            });
        },
        arrCurrentStatus: [],
        ioTemplateStatus: function(){
            ioStatus = {
                'ID': 1,
                    'Start': '%1',
                    'VersionNumber': settings.value.version,
                    'SerialNumber': settings.value.rtuId,       //ModbusReg = 1
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
                        console.log('IO-myIOModbus AI8/DIO8 data: ' + data.ResponseTo);
                    }

                    if (data.data.length == 12 && data.data[7] == 16) {
                        return;
                    }
                    // var Address = data.data[6];
                    var Address = data.IOid;
                    var IOType = data.IOType;
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
                        //var newIO = {};
                        newIO.ID = Address;
                        newIO.ioType = IOType;
                        console.log('Address',Address);
                        pubIO.arrCurrentStatus.push(newIO);
                        i = pubIO.arrCurrentStatus.length;
                    }



                    pubIO.arrCurrentStatus[i].rawData = data.data;


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
            pubIO.makeSenseOfRawData(Address);
        },
        makeSenseOfRawData: function(address){
            pubIO.arrCurrentStatus.forEach(function(item){
                if(item.ID == address){
                    switch(item.ioType){
                        case('TCP-MODMUX-DIO8'):
                            var DigitalsExt = 0;
                            DigitalsExt = data.data[11];
                            DigitalsExt <<= 8;
                            DigitalsExt += data.data[12];

                            console.log('DigitalsExt', DigitalsExt);

                            break;

                        default:
                            // console.log('Unhandled ioType here5',item.ioType);
                            break;
                    }

                    return;
                }
            });
        },
        WriteRegister: function(ModuleAddress,IOToWrite,ValueToWrite){
            arrIO.forEach(function(item){
                if(typeof item != 'undefined'){
                    if(item.id == ModuleAddress){
                        item.io.WriteRegister(ModuleAddress,IOToWrite,ValueToWrite,0);
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


              // function stripper(arryPropsToKeep, arrToParse){
              //           var newArr = [];

              //           newArr = arrToParse.map(function(obj){
              //                   var tmp = {};

              //                   arryPropsToKeep.forEach(function(propertyName){
              //                           if(typeof obj[propertyName] !== 'undefined')
              //                           tmp[propertyName] = obj[propertyName];
              //                   });
              //                   return tmp;
              //           });
              //           return newArr;
              //   }

              //   args.data[0] = stripper(args.arrResponseFilter, args.data[0]);


    return pubIO;


};
util.inherits(sbModule, EventEmitter);
exports.rmcio = sbModule;

