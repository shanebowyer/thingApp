var _ = require('underscore');

var settings = 
{
   "version":"0210.024",
   "rtuId":1,
   "description":"SiteOne",
   "timeZone":2,
   "fixedTxTime":2,
   "commsTimeout":30,
   "localwebserver":{
      "ipAddress":"192.167.1.251",
      "port":8000,
      "socketPort":12345,
      "defaultHtmlPage":"index.html"
   },
   "modbusslave":{
      "enabled":1,
      "port":2030
   },
   "remotewebserver":{
      "ipAddress":"192.167.1.251",
      "port":12345
   },
   "control":[
      {
         "id":1,
         "controlType":"reservoir",
         "description":"Control Pumps at site11",
         "setPoints":{
            "low":"19",
            "hi":"30",
            "sourceIO":"2",
            "io":"AI1"
         },
         "msgOutSetPointLow":{
            "sourceAddress":1,
            "destinationAddress":2,
            "msgType":"control",
            "write":{
               "destinationIO":"1",
               "io":"digOut",
               "mask":"1",
               "value":"255"
            }
         },
         "msgOutSetPointHi":{
            "sourceAddress":1,
            "destinationAddress":2,
            "msgType":"control",
            "write":{
               "destinationIO":"1",
               "io":"digOut",
               "mask":"1",
               "value":"0"
            }
         },
         "enabled":true
      }
   ],
   "io":[
      {
         "id":1,
         "ioType":"TCP-MODMUX-DIO8",
         "enabled":1,
         "ipAddress":"192.168.1.9",
         "port":502,
         "description":"Site1 DIO",
         "unitid":0,
         "registertype":"readCoils",
         "startAddress":10,
         "endAddress":10,
         "readMask":65535,
         "writeMask":0,
         "value":67
      },
      {
         "id":2,
         "ioType":"TCP-MODMUX-AI8",
         "enabled":1,
         "ipAddress":"192.168.1.8",
         "port":502,
         "description":"Site1 AI",
         "unitid":0,
         "registertype":"readCoils",
         "startAddress":11,
         "endAddress":11,
         "readMask":1,
         "writeMask":0,
         "value":65535,
         "scaling":{
            "AI1":{
               "rawHi":10000,
               "rawLow":0,
               "scaleHi":100,
               "scaleLow":0
            }
         },
         "cofs": {
         	"AI1": 5
         }
      },
      {
         "id":3,
         "ioType":"GAR-FEP",
         "enabled":0,
         "commPort":"COM33",
         "baudRate":9600,
         "description":"GAR Front End",
         "unitid":0
      }
   ]
};

var io = {
    id: 0,
    ioType: 'TCP-MODMUX-AI8',
    AI1: 0,
    AI1Scaled: 1,
    AI2: 0,
    AI3: 0,
    AI4: 0,
    AI5: 0,
    AI6: 0,
    AI7: 0,
    AI8: 0
};


function doit(strIO){
   console.log('here');
   for (var key in io) {
      if(key == strIO){
         console.log(io[key]);   
      }
   }
}

doit('AI1Scaled');



