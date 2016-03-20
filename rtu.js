/**
 * Created by shane on 3/9/15.
 */
//var CONFIG = require('./config/config.js');
//var CONFIG;
//var SETINGS;

global.__base = __dirname + '/';

var rtulog = require(__base + './script/rtulog.js');
var websvrcomms = require(__base + './script/websvrcomms.js');
var tcpClient = require(__base + './script/tcpclient.js');
var io = require(__base + './script/io.js');
var plc = require(__base + './script/plc.js');
var modbusslave = require(__base + './script/iomodbustcpslave.js');
//var rs232 = require(__base + './script/rs232.js');



//var myPlc = require('./script/plc.js');
var settings = require('./script/settings.js');
var express		= require('express'); 			// call express
var cors		= require('cors');				// call cors
var bodyParser 	= require('body-parser');		// call body-parser

try{
    var rtu = {

        initWeb: function(){
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
                app.use('/', express.static(__dirname + '/apps'));
                app.get('/', function(req, res){
                    res.sendFile('default.html',{ root: __dirname + '/apps'} );
                });

                // API ROUTES
                //=============================================================================
                // Get an instance of the express Router
                var router = express.Router();

                // Set up the main services at ROUTE_PARAM.API_RES / ROUTE_PARAM.WS_RESOURCE
                // The target is specified in the request parameters
                app.post('/api', function(req, res) {
                    var response={header:{result:{}},content:{}};
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Headers", "X-Requested-With");
                    try{
                        if(req.body.myData.reqOption == 'read'){
                            response.header.result = 'success';
                            var cs = mywebsvrComms.getIOStatus(1);
                            response.content = cs.Digitals;
                            res.json(response);
                        }else{
                            response.header.result = 'success';
                            mywebsvrComms.ControlModbusIO(req.body.myData.reqAddress,req.body.myData.reqIOToWrite,req.body.myData.reqWriteValue);
                            //mywebsvrComms.ControlModbusIO(1,'Counter0',vValue);
                            var cs = mywebsvrComms.getIOStatus(1);
                            response.content = cs.Digitals;
                            res.json(response);
                        }


                    }
                    catch(e){
                        response.header.result = 'failed';
                        response.content = e.message.toString();
                        res.json(response);
                    }
                });
                app.get('/api',function(req,res){
                    var response={header:{result:{}},content:{}};
                    console.log('here');
                    if(req.query.reqIOToWrite == 'DigOut'){
                        var cs = mywebsvrComms.getIOStatus(1);
                        response.content = cs.DigitalsExt;
                        if(cs.DigitalsExt == 0){
                            mywebsvrComms.ControlModbusIO(1,req.query.reqIOToWrite,255);
                        }else{
                            mywebsvrComms.ControlModbusIO(1,req.query.reqIOToWrite,0);
                        }
                    }else{
                        mywebsvrComms.ControlModbusIO(1,'DigOut',0);
                    }
                    //res.write('Done');
                    //response.content = 'Okay';
                    res.json(response);
                });

                //more routes for our API will happen here

                //REGISTER ROUTES
                //All of the routes will be prefixed with the value defined in the ROUTE_PARAM.API_RES parameter
                app.use('/api', router);

                app.listen(port);
                console.log('API connect on port ' + port);

            }
            catch(e){
                console.log(e.message.toString());
            }
        }


    }

    //rtu.readConfig();
    rtu.initWeb();

    var WebSvrIp = settings.searchSettings('ServerIP');
    var WebSvrPort = settings.searchSettings('Server Port');
    var Debug = 1;

    var myWebSvrTCPClient = new tcpClient.rmcTCP;
    myWebSvrTCPClient.init(WebSvrIp,WebSvrPort,Debug);


    var myIO = new io.rmcio;
    myIO.init();

    var myiomodbustcpslave = new modbusslave.ioModbusTCPSlave;
    myiomodbustcpslave.init(myIO,1);


    var myRTULog = new rtulog.rmcLog;
    myRTULog.init(myIO,1);

    var myPlc = new plc.rmcplc;
    myPlc.init(myIO,myRTULog,1);



    var mywebsvrComms = new websvrcomms.webSVRComms;
    mywebsvrComms.init(myWebSvrTCPClient,myRTULog,myIO,Debug);

    // console.log('RS232');
    // var myrs232 = new rs232.rmcRS232;
    // myrs232.init(1);





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