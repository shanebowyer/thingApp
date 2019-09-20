


// var settings = require(__base + '/config.js');
// var settings    = require(__base + './script/settings.js').settings;

var EventEmitter = require("events").EventEmitter;
var util = require('util');


var SerialPort = require("serialport")

var sbModule = function (err) {
	var self = this;

	var thisdebug = 0;

	var serialPort;
	// var serialPort = new SerialPort("COM3", {
	//   baudrate: 9600
	// }, false); // this is the openImmediately flag [default is true] 


	var pubRS232 = {

		init: function (commPort, baudrate, debug) {
			thisdebug = debug;

			try {
				serialPort = new SerialPort(commPort, { "baudRate": baudrate, autoOpen: false }, function (err) {
					if (err) {
						if (err.message != 'Port is opening') {
							return console.log('RS232 Error: ', err.message);
						}
					}
				});
			}
			catch (e) {
				console.log('RS232 Error', e)
				__Logger.LogData('init clsRS232 err: ' + e)
			}

			console.log('Init RS232>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.');

			serialPort.open(function (error) {
				if (error) {
					console.log('failed to open: ' + error);
				} else {
					console.log('open');
					let bufdata = Buffer.alloc(0)
					setInterval(function () {
						let locbuf = bufdata
						bufdata = Buffer.alloc(0)
						if(locbuf.length > 0){
							console.log('data',locbuf)
							self.emit("data", locbuf);
						}
					}, 5000)					
					
					serialPort.on('data', function (data) {
						const totalLen = bufdata.length + data.length
						bufdata = Buffer.concat([bufdata, data], totalLen)
					});
					// serialPort.write("ls\n", function (err, results) {
					// 	if (err) {
					// 		console.log('rs232 write error1 ' + err);
					// 	}
					// });
				}
			});

			//Test event
			// setTimeout(function(){
			// 	const buf = Buffer.from([1,2,3,4,5,6,7,8,9,10,11,12])
			// 	self.emit("data",buf)
			// },1000)

		},
		SendData: function (strData) {
			var i = 0;
			var strTemp = '';
			for (i = 0; i < strData.length; i++) {
				strTemp = strTemp + ' ' + strData[i];
			}

			try {
				serialPort.write(strData);
			}
			catch (ex) {
				console.log('RS232 Error');
			}
		},
		on: function (strEvent, callbackFunction) {
			self.on(strEvent, function (data) {
				callbackFunction(data);
			})
		}
	}

	//setInterval(pubRS232.senddata,5000);

	return pubRS232;


}
util.inherits(sbModule, EventEmitter);
exports.rmcRS232 = sbModule;

