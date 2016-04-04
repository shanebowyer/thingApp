/**
 * Created by shane on 3/9/15.
 */
//var CONFIG = require('./config/config.js');
//var CONFIG;
//var SETINGS;

global.__base = __dirname + '/';

var Q       = require('q');

var Settings    = require(__base + './script/settings.js');
global.settings = new Settings.settings();

var rtulog = require(__base + './script/rtulog.js');
var websvrcomms = require(__base + './script/websvrcomms.js');
var tcpClient = require(__base + './script/tcpclient.js');
var io = require(__base + './script/io.js');
var plc = require(__base + './script/plc.js');
var modbusslave = require(__base + './script/iomodbustcpslave.js');

//var rs232 = require(__base + './script/rs232.js');



//var myPlc = require('./script/plc.js');
//var settings    = require(__base + './config.js');
var express		= require('express'); 			// call express
var cors		= require('cors');				// call cors
var bodyParser 	= require('body-parser');		// call body-parser
var http        = require('http');


try{
    //var settings = new Settings.settings();
    var rtu = {

        initWeb: function(retErr){
            try{
                var app	= express();
                // Allow cross domain for AJAX queries
                app.use(cors());
                // Use parsing to extract JSON object from POST requests
                app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
                app.use(bodyParser.json( {limit: '50mb'} ));

                // Set the connection port
                var port = 8000; 		// set our port
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
                    // try{
                        // if(req.body.myData.reqOption == 'read'){
                        //     response.header.result = 'success';
                        //     var cs = mywebsvrComms.getIOStatus(1);
                        //     response.content = cs.Digitals;
                        //     res.json(response);
                        // }else{
                        //     response.header.result = 'success';
                        //     mywebsvrComms.ControlModbusIO(req.body.myData.reqAddress,req.body.myData.reqIOToWrite,req.body.myData.reqWriteValue);
                        //     //mywebsvrComms.ControlModbusIO(1,'Counter0',vValue);
                        //     var cs = mywebsvrComms.getIOStatus(1);
                        //     response.content = cs.Digitals;
                        //     res.json(response);
                        // }
                        myIO.processAPICall(req,res);
                    // }
                    // catch(e){
                    //     response.header.result = 'failed';
                    //     response.content = e.message.toString();
                    //     res.json(response);
                    // }
                });
                app.get('/api',function(req,res){

                    myIO.processAPICall(req,res);
                    
                    // var response={header:{result:{}},content:{}};
                    // if(req.query.reqIOToWrite == 'DigOut'){
                    //     var cs = mywebsvrComms.getIOStatus(1);
                    //     response.content = cs.DigitalsExt;
                    //     if(cs.DigitalsExt == 0){
                    //         mywebsvrComms.ControlModbusIO(1,req.query.reqIOToWrite,255);
                    //     }else{
                    //         mywebsvrComms.ControlModbusIO(1,req.query.reqIOToWrite,0);
                    //     }
                    // }else{
                    //     mywebsvrComms.ControlModbusIO(1,'DigOut',0);
                    // }
                    // //res.write('Done');
                    // //response.content = 'Okay';
                    // res.json(response);
                });

                //more routes for our API will happen here

                //REGISTER ROUTES
                //All of the routes will be prefixed with the value defined in the ROUTE_PARAM.API_RES parameter
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


                var server = http.createServer(app);
                var websockio = require('socket.io').listen(server);
                server.listen(port);


                websockio.sockets.on('connection', function (socket) {
                    console.log('websockio connection made:');

                    setInterval(function(data){
                        console.log('sending socketio data to client');
                        socket.emit('message','test');
                    },10000);

                    socket.on('message', function(data){
                        var resData = {
                            message: data
                        }
                        console.log('Server recieved client socketio data',data);
                    });
                });

                console.log('connecting story');
                var test = require('socket.io-client').connect('http://localhost:8000');
                console.log('connecting story1');
                test.on('connect',function(data){
                    console.log('test Client Connected to Server socketio');
                    test.on('message',function(data){
                        console.log('test socketio server data reveived',data);
                    });
                });



                console.log('API connect on port ' + port);

            }
            catch(e){
                //next1(e);
                console.log(e.message.toString());
            }
        }


    }




    // function readSetting(args){
    //     var deferred = Q.defer();

    //     // settings.readSetting(function(){
    //     //     deferred.resolve(args);
    //     // });
    //     deferred.resolve(args);

        
    //     return deferred.promise;

    // }

    function init(args){
        var deferred = Q.defer();

        settings.getSettings(args)
        .then(otherInit,null)
        .then(function(args){
            // console.log('args',args);
            deferred.resolve(args);
        },function(args){
            // console.log('args error',args);
            deferred.reject(args);
            console.log('promise error');
        })

        return deferred.promise;
    }
    function otherInit(args){
        var deferred = Q.defer();

        settings = args.settings;

        rtu.initWeb(function(err){
            console.log('rtu error: ', err);
        });

        var Debug = 1;



        myIO = new io.rmcio;
        myIO.init(0);

        //---------------------------Modbus Slave---------------------------//
        var settingsModbusSlave = settings.value.modbusslave;
        if(settingsModbusSlave.enabled == 1){
            var ioModbustcpslave = new modbusslave.ioModbusTCPSlave;
            ioModbustcpslave.init(myIO,1);
        }
        //---------------------------Modbus Slave---------------------------//


        //--------------------------- Log    ---------------------------//
        var myRTULog = new rtulog.rmcLog;
        myRTULog.init(myIO,1);
        //---------------------------End Log---------------------------//



        //---------------------------Remote Web Server---------------------------//
        var settingsRemoteWebserver = settings.value.remotewebserver;
        var remoteServerTCPClient = new tcpClient.rmcTCP;
        remoteServerTCPClient.init(function(err){
            console.log('remoteServerTCPClient error', err);
        },settingsRemoteWebserver.ipAddress,settingsRemoteWebserver.port,Debug);

        var mywebsvrComms = new websvrcomms.webSVRComms;
        mywebsvrComms.init(remoteServerTCPClient,myRTULog,myIO,Debug);
        //---------------------------END Remote Web Server---------------------------//


        var myPlc = new plc.rmcplc;
        myPlc.init(myIO,myRTULog,1);


        // console.log('RS232');
        // var myrs232 = new rs232.rmcRS232;
        // myrs232.init(1);

        //deferred.resolve(args);

        return deferred.promise;
    }

    var myIO;
    var x = {'settings': ''};
    init(x);









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