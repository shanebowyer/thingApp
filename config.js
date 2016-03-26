var settings = {
  "version": "0210.024",
  "rtuId": 1,
  "description": "Site1",
  "timeZone": 2,
  "fixedTxTime": 2,
  "commsTimeout": 30,

  "localwebserver":{
    "ipAddress": "127.0.0.1",
    "port": 8000,
    "defaultHtmlPage": "default.html"
  },
  "modbusslave":{
      "enabled": 1,
      "port": 2030
  },
  "remotewebserver": {
      "ipAddress": "192.168.1.95",
      "port": 2344
  },
  "io": [
    {
      "ioType": "TCP-MODMUX-DIO8",
      "enabled": 1,
      "ipAddress": "192.168.1.198",
      "port": 12345,
      "description": "Reservoir Level",
      "unitid": 0,
      "registertype": "readCoils",
      "startAddress": 10,
      "endAddress": 10,
      "readMask": 65535,
      "writeMask": 0,
      "value": 67
    },
    {
      "ioType": "TCP-MODMUX-AI8",
      "enabled": 1,
      "ipAddress": "192.168.1.198",
      "port": 12346,
      "description": "Pump1 status",
      "unitid": 0,
      "registertype": "readCoils",
      "startAddress": 11,
      "endAddress": 11,
      "readMask": 1,
      "writeMask": 0,
      "value": 65535
  },
    {
      "ioType": "GAR-FEP",
      "enabled": 0,
      "commPort": "COM33",
      "baudRate": 9600,
      "description": "GAR Front End Processor",
      "unitid": 0
  }
  ]
}

module.exports = settings;