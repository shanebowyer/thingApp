/**
 * Created by shane on 3/9/15.
 */
//var CONFIG = require('./config/config.js');
//var CONFIG;
//var SETINGS;

global.__base = __dirname + '/';

var Q       = require('q');

var Settings            = require(__base + './script/settings.js');
global.__settings       = new Settings.settings();

var Responder           = require(__base + './lib/apiResponder.js');
global.__apiResponder   = new Responder.module();

var logger              = require(__base + './lib/logger.js');
global.__Logger         = new logger.module();

var bllModule           = require('./bll/bll.js');
var thingserver         = require(__base + './script/server.js');
var rtulog              = require(__base + './script/rtulog.js');
var websvrcomms         = require(__base + './script/websvrcomms.js');
var tcpClient           = require(__base + './lib/tcpclient.js');
var io                  = require(__base + './script/io.js');
var plc                 = require(__base + './script/plc.js');
var modbusslave         = require(__base + './lib/iomodbustcpslave.js');
var express             = require('express');
var cors                = require('cors');
var bodyParser          = require('body-parser');
var http                = require('http');


try{
    var myPlc;
    var thingApp = {
        debug: 1,
        debugIO: 0,
        initAPI: function(args){
            var deferred = Q.defer();
            console.log('initAPI');
            try{
                var port = args.settings.value.localwebserver.port;
                var app = express();
                app.use(cors());
                app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
                app.use(bodyParser.json( {limit: '50mb'} ));

                app.use(function boltOnObjects(req, res, next) {
                    req.myPlc = myPlc;
                    req.settings = __settings;
                    req.logger = __Logger;
                    next();
                });

                app.use('/', express.static(__base + '/app'));
                app.get('/app', function(req, res){
                    res.sendFile('index.html',{ root: __base + '/app'} );
                });


                var rtu = require('./api/rtu');
                app.use('/api/rtu',rtu);

                var settings = require('./api/settings');
                app.use('/api/settings',settings);


                app.use(function(err, req, res, next) {
                    var myModule = new bllModule.module();
                    myModule.rtu.errorResponse.error.code = '500';
                    myModule.rtu.errorResponse.error.message = 'Something broke';
                    myModule.rtu.errorResponse.error.errors[0].code = '500';
                    myModule.rtu.errorResponse.error.errors[0].message = 'Something broke';
                    myModule.rtu.errorResponse.hiddenErrors.push(err.stack);
                    __apiResponder.errorResponse(req,res,myModule.rtu.errorResponse);

                });
                var server = http.createServer(app);
                server.listen(port);
                console.log('api listen port',port);

                args.server = server;
                deferred.resolve(args);

            }
            catch(e){
                console.log(e.message.toString());
            }
            return deferred.promise;
        },

        init: function(args){
            var deferred = Q.defer();
            __settings.getSettings(args)
            .then(thingApp.initLogger,null)
            .then(thingApp.initModbusSlave,null)
            .then(thingApp.initLog,null)
            .then(thingApp.initPLC,null)
            .then(thingApp.initRemoteServer,null)
            .then(thingApp.initAPI,null)
            .then(thingApp.initSockets,null)
            .then(function(args){
                deferred.resolve(args);
            },function(args){
                deferred.reject(args);
                console.log('promise error');
            });

            return deferred.promise;
        },
        initModbusSlave: function(args){
            var deferred = Q.defer();

            console.log('initModbusSlave');

            myIO = new io.rmcio;
            myIO.init(thingApp.debugIO);

            args.myIO = myIO;

            //---------------------------Modbus Slave---------------------------//
            var settingsModbusSlave = __settings.value.modbusslave;
            if(settingsModbusSlave.enabled == 1){
                var ioModbustcpslave = new modbusslave.ioModbusTCPSlave;
                ioModbustcpslave.init(myIO,0);
            }
            //---------------------------Modbus Slave---------------------------//

            deferred.resolve(args);

            return deferred.promise;
        },
        initLog: function(args){
            var deferred = Q.defer();
            console.log('initLog');

            //--------------------------- Log    ---------------------------//
            var myRTULog = new rtulog.rmcLog;
            myRTULog.init(args.myIO,1);
            args.myRTULog = myRTULog;
            //---------------------------End Log---------------------------//

            deferred.resolve(args);
            return deferred.promise;
        },
        initPLC: function(args){
            var deferred = Q.defer();
            console.log('initPLC');

            myPlc = new plc.rmcplc;
            myPlc.init(args.myIO,args.myRTULog,thingApp.debug);

            args.myPlc = myPlc;

            deferred.resolve(args);
            return deferred.promise;
        },
        initRemoteServer: function(args){
            var deferred = Q.defer();
            console.log('initRemoteServer');

            //---------------------------Remote Web Server---------------------------//
            var settingsRemoteWebserver = __settings.value.remotewebserver;
            var remoteServerTCPClient = new tcpClient.rmcTCP;
            remoteServerTCPClient.init(function(err){
                deferred.reject(args);
                console.log('remoteServerTCPClient error', err);
            },settingsRemoteWebserver.ipAddress,settingsRemoteWebserver.port,thingApp.debug);

            var mywebsvrComms = new websvrcomms.webSVRComms;
            mywebsvrComms.init(remoteServerTCPClient,args.myRTULog,args.myPlc,thingApp.debug);
            //---------------------------END Remote Web Server---------------------------//

            args.mywebsvrComms = mywebsvrComms;

            deferred.resolve(args);
            return deferred.promise;
        },
        initSockets: function(args){
            var deferred = Q.defer();
            console.log('initSockets');

            var thisServer = new thingserver.rmcServer;
            thisServer.initWebSocket(args.server);
            thisServer.initTCPSocket();
            args.thisServer = thisServer;

            deferred.resolve(args);
            return deferred.promise;
        },
        initLogger: function(args){
            var deferred = Q.defer();
            console.log('initLogger');
            global.__Logger = new logger.module();
            __Logger.init(__settings.value.LOG4JS);
            deferred.resolve(args);
            return deferred.promise;
        }
    };




    // var myIO;
    var x = {'settings': ''};
    thingApp.init(x);

}
catch(error){
    console.log('The following error has occurred: '+error.message);
}
