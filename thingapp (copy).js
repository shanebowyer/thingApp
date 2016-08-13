/**
 * Created by shane on 3/9/15.
 */
//var CONFIG = require('./config/config.js');
//var CONFIG;
//var SETINGS;

global.__base = __dirname + '/';

var Q       = require('q');

var Settings    = require(__base + './script/settings.js');
global.__settings = new Settings.settings();

var thingserver = require(__base + './script/server.js');
var rtulog = require(__base + './script/rtulog.js');
var websvrcomms = require(__base + './script/websvrcomms.js');
var tcpClient = require(__base + './lib/tcpclient.js');
var io = require(__base + './script/io.js');
var plc = require(__base + './script/plc.js');
var modbusslave = require(__base + './lib/iomodbustcpslave.js');
// var socketserver = require(__base + './script/server.js');

//var rs232 = require(__base + './script/rs232.js');




//var myPlc = require('./script/plc.js');
//var settings    = require(__base + './config.js');
var express		= require('express'); 			// call express
var cors		= require('cors');				// call cors
var bodyParser 	= require('body-parser');		// call body-parser
var http        = require('http');


try{
    //var settings = new Settings.settings();
    var myPlc;
    
    var rtu = {

        initWeb: function(port,retServer,retErr){
            try{
                var app	= express();
                // Allow cross domain for AJAX queries
                app.use(cors());
                // Use parsing to extract JSON object from POST requests
                app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
                app.use(bodyParser.json( {limit: '50mb'} ));

                // Set the connection port
                //var port = 8000; 		// set our port

                // Setup processing at the base URL to retrieve static assets
                app.use('/', express.static(__dirname + '/app'));
                app.get('/', function(req, res){
                    res.sendFile('index.html',{ root: __dirname + '/apps'} );
                });

                // API ROUTES
                //=============================================================================
                // Get an instance of the express Router
                var router = express.Router();

                // Set up the main services at ROUTE_PARAM.API_RES / ROUTE_PARAM.WS_RESOURCE
                // The target is specified in the request parameters
                app.post('/api', function(req, res) {
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Headers", "X-Requested-With");

                    // console.log('api req',req);
                    var data = req.body.myData.data;
                    var args = [req,res,data];
                    rtu.processAPICall(args)
                    .then(function(args){
                        console.log('success');
                        args[1].json(args[2]);
                    },function(args){
                        console.log('fail');
                        args[1].json(args[2]);
                    });
                });
                app.get('/api',function(req,res){
                        var data = {};
                        var args = [req,res,data];
                        rtu.processAPICall(args)
                        .then(function(args){
                            args[1].json(args[2]);
                        },function(args){
                            args[1].json(args[2]);
                        });
                });

                app.use('/api', router);

                //ErrorHandler
                app.use(function(err, req, res, next) {
                    //console.log('router error: ', err);
                    var response={header:{result:{}},content:{}};
                    response.header.result = 'failed';
                    response.content = err.message.toString();
                    retErr(err);
                    res.json(response);
                });                


                console.log('API connect on port ' + port);

                var server = http.createServer(app);
                server.listen(port);

                retServer(server);

            }
            catch(e){
                //next1(e);
                console.log(e.message.toString());
            }
        },
        processAPICall: function(args){
            var deferred = new Q.defer();
            var apiRespone = {header:{result:{}},content:{}};
            var req = args[0];
            console.log('api requestOption',req.body.myData.reqOption);
            switch(req.body.myData.reqOption){
                case('rtuMessage'):
                    myPlc.processMessageIn(args)
                    .then(function(args){
                        apiRespone.header.result = 'success';
                        apiRespone.content = args[2];
                        args[2] = apiRespone;
                        deferred.resolve(args);
                    },function(args){
                        apiRespone.header.result = 'fail';
                        apiRespone.content = args[2];
                        args[2] = apiRespone;
                        deferred.reject(args);
                    });
                    break;
                case('settings'):
                    apiRespone.header.result = 'success';
                    apiRespone.content = settings;
                    args[2] = apiRespone;
                    deferred.resolve(args);
                    break;
                case('settingsSave'):
                    debugger;
                    __settings.saveSettings(args)
                    .then(function(args){
                        apiRespone.header.result = 'success';
                        apiRespone.content = args.settings;
                        args[2] = apiRespone;
                        console.log('okay here now');
                        deferred.resolve(args);
                        return deferred.promise;
                    }, function(args){
                        apiRespone.header.result = 'error';
                        apiRespone.content = err;
                        args[2] = apiRespone;
                        deferred.reject(args);
                        return deferred.promise;
                    });
                    break;
                default:
                    apiRespone.header.result = 'error';
                    apiRespone.content = 'Error. Not sure which io to read';
                    args[2] = apiRespone;
                    deferred.reject(args);
            }
            return deferred.promise;
        },
        init: function(args){
            var deferred = Q.defer();
            __settings.getSettings(args)
            .then(rtu.otherInit,null)
            .then(function(args){
                // console.log('args',args);

                deferred.resolve(args);
            },function(args){
                // console.log('args error',args);
                deferred.reject(args);
                console.log('promise error');
            });

            return deferred.promise;
        },
        otherInit: function(args){
            var deferred = Q.defer();

            console.log('other init');
            settings = args.settings;

            // var myServer = new server.rmcServer;
            // myServer.init();

            var webPort = __settings.value.localwebserver.port;
            console.log('webPort',webPort);
            rtu.initWeb(webPort,function(server){
                var thisServer = new thingserver.rmcServer;
                thisServer.initWebSocket(server);
                thisServer.initTCPSocket();
            },function(err){
                console.log('rtu error: ', err);
            });

            var Debug = 1;

            console.log('settings rtuid',__settings.value.rtuId);



            myIO = new io.rmcio;
            myIO.init(0);

            //---------------------------Modbus Slave---------------------------//
            var settingsModbusSlave = __settings.value.modbusslave;
            if(settingsModbusSlave.enabled == 1){
                var ioModbustcpslave = new modbusslave.ioModbusTCPSlave;
                ioModbustcpslave.init(myIO,0);
            }
            //---------------------------Modbus Slave---------------------------//


            //--------------------------- Log    ---------------------------//
            var myRTULog = new rtulog.rmcLog;
            myRTULog.init(myIO,1);
            //---------------------------End Log---------------------------//


            myPlc = new plc.rmcplc;
            myPlc.init(myIO,myRTULog,0);

            //---------------------------Remote Web Server---------------------------//
            var settingsRemoteWebserver = __settings.value.remotewebserver;
            var remoteServerTCPClient = new tcpClient.rmcTCP;
            remoteServerTCPClient.init(function(err){
                console.log('remoteServerTCPClient error', err);
            },settingsRemoteWebserver.ipAddress,settingsRemoteWebserver.port,Debug);

            var mywebsvrComms = new websvrcomms.webSVRComms;
            mywebsvrComms.init(remoteServerTCPClient,myRTULog,myPlc,0);
            //---------------------------END Remote Web Server---------------------------//




            // console.log('RS232');
            // var myrs232 = new rs232.rmcRS232;
            // myrs232.init(1);

            //deferred.resolve(args);

            return deferred.promise;
        }


    };




    // var myIO;
    var x = {'settings': ''};
    rtu.init(x);









}
catch(error){
    console.log('The following error has occurred: '+error.message);
}



/*
 readConfig: function(){
 var fs = require('fs');
 var file = './config/config.json';
 var obj = JSON.parse(fs.readFileSync(file,'utf8'));
 CONFIG = obj;
 SETINGS = CONFIG.settings;
 },
 searchSettings: function(search){
 var arrFound = SETINGS.filter(function(item) {
 return item.description == search;
 });
 return arrFound[0].value;
 },

 */