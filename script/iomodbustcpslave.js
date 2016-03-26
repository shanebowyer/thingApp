


var settings = require(__base + '/config.js');


var EventEmitter = require( "events" ).EventEmitter;
var util = require('util');
var net = require('net');

var tcpSvr = require(__base + '/script/tcpsvr.js');

var ModbusComms = new tcpSvr.rmcTCPSvr;


var sbModule = function() {
    var self = this;

    var thisdebug = 0;
    var thisIO;


    var pubIOModbusTCPSlave = {

        init: function(io,debug){
            thisdebug = debug;
            thisIO = io;

            ModbusComms.on('data', function(args){
                try{
                    var sock = args[0];
                    var data = args[1];
                    var debug = args[2];
                    if(debug == 1){
                        console.log('MODBUS data: ' + sock.remoteAddress +':'+ sock.remotePort + ' Data: ' + data);
                    }

                    self.emit("data",
                        {
                            'ResponseTo': 'Modbus Master Poll',
                            'IOType': 0,
                            'data': data
                        });

                    try{
                        sock.write(pubIOModbusTCPSlave.BuildModbusResponse(data));
                    }
                    catch (e) {
                        console.log('iomodbustcpslave sock.write data error: ' + e);
                    }


                }
                catch (e) {
                    console.log('iomodbustcpslave data error: ' + e);
                }

            });
        },
        BuildModbusResponse: function(mybytes){

            //var myCRC = pubIOModbusTCPSlave.CalculateCRC(mybytes);

            var Address = mybytes[6];
            var FirstReg = (mybytes[8]*256) + mybytes[9];
            var RegCount = (mybytes[10]*256) + mybytes[11];
            //RegCount = 1;

            console.log('Address: ' + Address + ' FirstReg: ' + FirstReg + ' RegCount: ' + RegCount);

            var reply = new Buffer(9 + (RegCount * 2));

            //var bytezero = new Buffer[1];
            //bytezero[0] = 0;

            reply[0] = mybytes[0];
            reply[1] = mybytes[1];
            reply[2] = mybytes[2];
            reply[3] = mybytes[3];
            reply[4] = mybytes[4];
            reply[5] = 3 + (RegCount * 2) ;              //MessageLength

            reply[6] = mybytes[6];      //Address
            reply[7] = mybytes[7];      //FunctionCode
            reply[8] = (RegCount * 2)   //ByteCountToFollow

            for(i=0;i<RegCount;i+=2){
                var myVal = thisIO.getModBusRegisterValue(Address, FirstReg + i);
                //myVal = 23;
                reply[i + 9] = (myVal / 256) & 255;
                reply[i + 10] = myVal & 255;
            }

            //console.log('req: ' + mybytes[0] +  ' req: ' + mybytes[1]);
            return reply;


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

    ModbusComms.init(settings.localwebserver.ipAddress,settings.modbusslave.port,1);
    console.log('Listening for MODBUS on: ' + settings.modbusslave.port);

    return pubIOModbusTCPSlave


}
util.inherits(sbModule, EventEmitter);
exports.ioModbusTCPSlave = sbModule;

