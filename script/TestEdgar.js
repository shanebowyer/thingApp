/**
 * Created by shane on 9/30/15.
 */
/**
 * Created by shane on 9/30/15.
 */

var TCPClient = require('./tcpClient.js');

var myClient;
var bContinue = 0;
var thisVoucherRequestData;

function doTesting(){
    myClient = new TCPClient.rmcTCP();
    myClient.init('127.0.0.1',5001,1);

    myClient.on('data',function(data){
        console.log('tcpClientData ' + data);
        if(bContinue == 0){
            bContinue = 1;
            thisVoucherRequestData = data;
        }
        setTimeout(function(){
            myClient.SendData(thisVoucherRequestData);
        },10000);

    });
}

function sendVoucherReq(){
    //Send opCode 254 with SerialNumber 80004 to get a string back to start simulate vend voucher
    myClient.SendData('#3830303034000000000000010002000109FE0114C5EA189E3DE5D5E3DF4889580B50759C82C286AADBCA605825D2C28AC8FA10AA9C35CC9FEC83623E8602461AC0C63F8392C7265C076059D7AD310A8DF7712D20B0F6FF1D7C8F97A9FE2A4134219DDAF6CD9C4AA6E5203DAF81177F404B5476B8*');
}


doTesting();

setTimeout(sendVoucherReq,5000);