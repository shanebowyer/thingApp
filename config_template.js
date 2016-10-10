var settings = 

{  
   "environmentDev": 1,
   "version":"0210.024",
   "rtuId":"000000000000000000000001",
   "authTelemetry":{
      "email":"thingappdemo@bitid.co.za",
      "clientIdAuth":"579745be55d00a0a92e4d118",
      "token":{"Bearer":"f3abf1ee2185f087970b6d5e56f641a4ca8fdf6ef4ed1645472d0c8512625ed5","scopes":[{"url":"*","role":"4"}],"expiry":1478689425049,"pushToken":"","tokenAddOn":{}},
      "host":"http://192.167.1.11",
      "port":"8000",
      "path":"/telemetry/rtu/writehistorical"
   },
   "description":"SiteOne1",
   "timeZone":2,
   "fixedTxTime":1,
   "commsTimeout":30,
   "localwebserver":{  
      "ipAddress":"192.167.1.251",
      "port":7000,
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
   "LOG4JS":{
    "appenders": [
      {
        "type": "console",
        "layout": {
          "type": "pattern",
          "pattern": "%m"
        },
        "category": "app"
      },{
        "category": "file-appender",
        "type": "file",
        "absolute": true,
        "filename": "./logs/thingapp.log",
        "maxLogSize": 102400,
        "backups": 10,
        "layout": {
          "type": "pattern",
          "pattern": "%d{dd/MM hh:mm} %-5p %m"
        }
      }
    ],
      "replaceConsole": false 
   },   
   "control":[  
      {  
         "id":1,
         "controlType":"reservoir",
         "description":"Control Pumps at site1",
         "setPoints":{  
            "low":"19",
            "hi":"30",
            "sourceIO":"2",
            "io":"AI1Scaled"
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
         "enabled":false
      }
   ],
   "io":[  
      {  
         "id":1,
         "ioType":"TCP-MODMUX-DIO8",
         "enabled":1,
         "ipAddress":"192.167.1.50",
         "port":502,
         "description":"Site1One DIO",
         "unitid":0,
         "registertype":"readCoils",
         "startAddress":10,
         "endAddress":10,
         "readMask":65535,
         "writeMask":0,
         "value":67,
         "scaling":[  
            {  
               "id":1,
               "description":"digOut",
               "rawHi":"255",
               "rawLow":0,
               "scaleHi":255,
               "scaleLow":0
            }
         ],
         "cofs":[
            {
              "description":"digitalsIn",
              "value":65535
            }
         ]
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
         "scaling":[  
            {  
               "id":1,
               "description":"AI1",
               "rawHi":"10001",
               "rawLow":0,
               "scaleHi":100,
               "scaleLow":0
            },
            {  
               "id":2,
               "description":"AI2",
               "rawHi":10000,
               "rawLow":0,
               "scaleHi":100,
               "scaleLow":0
            }
         ],
         "cofs":[  
            {  
               "description":"AI1",
               "value":5
            },
            {  
               "description":"AI2",
               "value":5
            }
         ]
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
}

