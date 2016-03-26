


var settings = require(__base + '/config.js');


var EventEmitter = require( "events" ).EventEmitter;
var util = require('util');
var net = require('net');


var sbModule = function(IOType) {
    var self = this;

    var thisdebug = 0;
    var thisIOType = IOType;
    var myTCPClient;
    var thisIdentifier = 0;
    var toSendIndex = 0;
    var cCommsTimeOut = 10; //Constant Number in seconds to detect Modbus timeout
    var vCommsTimeOut = cCommsTimeOut;

    var pubIOModbus = {

        arrToSend: [],

        templatearrToSend: function(){
            var ToSend = {
                BytesOut: [],
                Permanent: 1
            }
            return ToSend;
        },


        init: function(TCPClient,debug){
            thisdebug = debug;
            myTCPClient = TCPClient;


            myTCPClient.on('data', function (data) {
                try {
                    vCommsTimeOut = cCommsTimeOut;
                    bCommsTimedOut = 0;
                    if(thisdebug == 1){
                        console.log('iomodbustcp received: ');
                    }

                    self.emit("data",
                        {
                            'ResponseTo': 'Read',
                            'IOType': thisIOType,
                            'data': data
                        });

                    pubIOModbus.Start(); //SB! Add this back

                }
                catch (e) {
                    console.log('iomodbustcp data error: ' + e);
                }
            });

            setTimeout(pubIOModbus.Start,3000);

        },
        Start: function(){
            var i = 0;

            for(i=0;i<pubIOModbus.arrToSend.length;i++){
                var toSend;
                if(pubIOModbus.arrToSend[i].Permanent == 0){
                    toSend = pubIOModbus.arrToSend[i].BytesOut[0];
                    pubIOModbus.arrToSend.splice(i,1);
                }else{
                    toSendIndex += 1;
                    if(toSendIndex >= pubIOModbus.arrToSend.length){
                        toSendIndex = 0;
                    }
                    toSend = pubIOModbus.arrToSend[toSendIndex].BytesOut[0];
                }

                if(myTCPClient != undefined && toSend != undefined){
                    try{
                        myTCPClient.SendData(toSend);
                    }
                    catch(e){

                    }
                }
                break;
            }
            //pubIOModbus.Start();

        },

        ReadRegister: function(Permanent) {
            console.log('ReadModbus Sent');
            var arrayReturn;
            //arrayReturn = pubIOModbus.BuildModbusRegisterToRead(1,3,1,1);
            if(thisIOType == 'TCP-MODMUX-DIO8') {
                arrayReturn = pubIOModbus.BuildModbusRegisterToRead(1, 3, 1, 20);
            }else if(thisIOType == 'TCP-MODMUX-AI8'){
                arrayReturn = pubIOModbus.BuildModbusRegisterToRead(1, 3, 1, 9);
            }else{
                arrayReturn = pubIOModbus.BuildModbusRegisterToRead(1,3,2,1);
            }

            var doRead = new pubIOModbus.templatearrToSend;
            doRead.BytesOut.push(arrayReturn);
            doRead.Permanent = Permanent;
            //Put non permanent at top of array
            if(Permanent == 0){
                pubIOModbus.arrToSend.unshift(doRead);
            }else{
                pubIOModbus.arrToSend.push(doRead);
            }


            return;
        },
        WriteRegister: function(ModuleAddress,IOToWrite,ValueToWrite,Permanent){
            var arrayReturn;
            var StartRegister = 0;
            var NumberOfRegisters;
            if(thisIOType == 'TCP-MODMUX-DIO8'){
                if(IOToWrite == 'DigOut'){
                    StartRegister = 2;
                    NumberOfRegisters = 1;
                }else if(IOToWrite.substring(0,7) == 'Counter'){
                    var counterNumber = 0;
                    counterNumber = IOToWrite.substring(7,IOToWrite.length);
                    StartRegister = (Number(counterNumber)*2) + 3;
                    NumberOfRegisters = 2
                }else if(IOToWrite == 'Counter1'){
                    StartRegister = 4;
                    NumberOfRegisters = 2
                }else
                {
                    console.log('iomodbustcp-WriteRegister IOToWrite invalid');
                    return;
                }

                arrayReturn = pubIOModbus.BuildModbusRegisterToWrite(ModuleAddress,16,StartRegister, NumberOfRegisters,ValueToWrite);
            }else{
                //arrayReturn = pubIOModbus.BuildModbusRegisterToWrite(ModuleAddress,16,StartRegister,ValueToWrite);
                console.log('iomodbustcp-WriteRegister IOType invalid');
                return;
            }

            var doWrite = new pubIOModbus.templatearrToSend;
            doWrite.BytesOut.push(arrayReturn);
            doWrite.Permanent = Permanent;
            //Put non permanent at top of array
            if(Permanent == 0){
                pubIOModbus.arrToSend.unshift(doWrite);
            }else{
                pubIOModbus.arrToSend.push(doWrite);
            }


        },
        BuildModbusRegisterToWrite: function(RTUAddress, FunctionCode, StartModbusAddress, NumberOfRegisters, vValue){
            var arrayReturn;
            var ByteCount;
            var x = 0;
            var msgLength = 0;
            if(NumberOfRegisters == 1) {
                arrayReturn = new Buffer(15);
                ByteCount = 2;
                msgLength = 9;
            }else if(NumberOfRegisters == 2){
                arrayReturn = new Buffer(17);
                ByteCount = 4;
                msgLength = 11;
            }else{
                console.log('iomodbustcp-BuildModbusRegisterToWrite NumberOfRegisters invalid');
                return;
            }

            x = 0;
            arrayReturn[x] = 0;
            x += 1;
            arrayReturn[x] = 1;
            x += 1;
            arrayReturn[x] = 0;
            x += 1;
            arrayReturn[x] = 0;
            x += 1;
            arrayReturn[x] = 0;
            x += 1;
            arrayReturn[x] = msgLength;
            x += 1;
            arrayReturn[x] = RTUAddress;
            x += 1;
            arrayReturn[x] = FunctionCode;
            x += 1;
            arrayReturn[x] = (StartModbusAddress / 256) & 255;
            x += 1;
            arrayReturn[x] = StartModbusAddress & 255;
            x += 1;
            //NumberOfRegisters
            arrayReturn[x] = (NumberOfRegisters / 256) & 255;
            x += 1;
            arrayReturn[x] = NumberOfRegisters & 255;
            x += 1;

            //ByteCount
            arrayReturn[x] = ByteCount;
            x += 1;
            //ValueToWrite
            if (ByteCount == 2) {
                arrayReturn[x] = ((vValue >> 8) & 255);
                x += 1;
                arrayReturn[x] = (vValue & 255);
                x += 1;
            } else {
                arrayReturn[x] = ((vValue >> 24) & 255);
                x += 1;
                arrayReturn[x] = ((vValue >> 16) & 255);
                x += 1;
                arrayReturn[x] = ((vValue >> 8) & 255);
                x += 1;
                arrayReturn[x] = (vValue & 255);
                x += 1;
            }
            return arrayReturn;
        },

        BuildModbusRegisterToRead: function(RTUAddress, FunctionCode, StartModbusAddress, ModbusLength){
            var arrayReturn = new Buffer(12);

            thisIdentifier += 1;

            arrayReturn[0] = thisIdentifier;
            arrayReturn[1] = 1;
            arrayReturn[2] = 0;
            arrayReturn[3] = 0;
            arrayReturn[4] = 0;
            arrayReturn[5] = 6;
            arrayReturn[6] = RTUAddress;
            arrayReturn[7] = FunctionCode;
            arrayReturn[8] = (StartModbusAddress / 256) & 255;
            arrayReturn[9] = StartModbusAddress & 255;
            arrayReturn[10] = (ModbusLength / 256) & 255;
            arrayReturn[11] = ModbusLength & 255;
            return arrayReturn;
        },

        CalculateCRC: function(ByteData){
            var x;
            var crc;
            var y;
            var tmp;
            crc = 65535;
            for (x = 0; x < ByteData.length; x++)
            {
                crc ^= ByteData[x];
                for (y = 0; y < 8; y++)
                {
                    tmp = (crc & 1);
                    crc >>= 1;
                    if (tmp != 0)
                    {
                        crc ^= 40961;
                    }
                }
            }
            return crc;
        },

        on: function(strEvent,callbackFunction){
            self.on(strEvent,function(data){
                callbackFunction(data);
            })
        }
    }

    setInterval(function(){
        vCommsTimeOut -= 1;
        if(vCommsTimeOut <= 0){
            pubIOModbus.Start();
        }
    },1000);

    //pubIOModbus.ReadRegister(0);
    pubIOModbus.ReadRegister(1);

    return pubIOModbus


}
util.inherits(sbModule, EventEmitter);
exports.ioModbus = sbModule;

