


// var settings = require(__base + '/config.js');
// var settings    = require(__base + './script/settings.js').settings;

var EventEmitter = require( "events" ).EventEmitter;
var util = require('util');


var SerialPort = require("serialport")

var sbModule = function(err) {
    var self = this;

    var thisdebug = 0;

    var serialPort;
    // var serialPort = new SerialPort("COM3", {
    //   baudrate: 9600
    // }, false); // this is the openImmediately flag [default is true] 


    var pubRS232 = {


        init: function(commPort,baudrate,debug){
            thisdebug = debug;

            try{
              serialPort = new SerialPort(commPort, {"baudRate": baudrate, autoOpen: false}, function (err) {
                if (err) {
                  if(err.message != 'Port is opening'){
                      return console.log('RS232 Error: ', err.message);
                  }
                }
              });
          }
          catch(e){
              console.log('RS232 Error',e)
              __Logger.LogData('init clsRS232 err: ' + e)
          }
  
            console.log('Init RS232>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.');


            // serialPort.on("open", function () {
            //   serialPort.on('data', function(data) {
            //     // console.log('RS232 data received: ' + data);
            //     try {
            //         self.emit("data", data);
            //     }
            //     catch (e) {
            //         console.log('socket data error: ' + e);
            //         err(e);
            //     }

            //   });
            //   // serialPort.write("ls\n", function(err, results) {
            //   //   if(err){
            //   //       err('rs232 write error',e);
            //   //   }
            //   //   console.log('err ' + err);
            //   //   console.log('results ' + results);
            //   // });
            // });



            serialPort.open(function (error) {
              if ( error ) {
                console.log('failed to open: '+error);
              } else {
                console.log('open');
                serialPort.on('data', function(data) {
                  console.log('rs232 data received: ' + data);
                });
                serialPort.write("ls\n", function(err, results) {
                    if(err){
                      console.log('rs232 write error1 ' + err);
                    }
                });

                // setInterval(function(){
                //     serialPort.write("ls\n", function(err, results) {
                //         if(err){
                //           console.log('rs232 write error1 ' + err);
                //         }
                //     });
                // },1000)

              } 
            });            

        },
        SendData: function(strData){
            // console.log('Sending RS232 Data');
            // console.log(strData.toString());

            var i = 0;
            var strTemp = '';
            for(i=0;i<strData.length;i++){
                strTemp = strTemp + ' ' + strData[i];
            }
            //console.log(strTemp);

            try{
                serialPort.write(strData);
            }
            catch(ex){
                console.log('RS232 Error');
                // console.log(ex.message());
            }
        },
        on: function(strEvent,callbackFunction){
            self.on(strEvent,function(data){
                callbackFunction(data);
            })
        }
    }

    //setInterval(pubRS232.senddata,5000);

    return pubRS232;


}
util.inherits(sbModule, EventEmitter);
exports.rmcRS232 = sbModule;