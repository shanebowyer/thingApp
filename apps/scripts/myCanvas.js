/**
 * Created by shane on 3/15/15.
 */



var nodeIpAddress = '1.2.3.4';
var _rt_diag_NodePort = 843;

//var strUrl = 'http://192.168.1.198:8000';
//var strUrl = 'http://192.168.1.7:8000';

var strUrl = 'http://192.168.1.7:8000';

function processAjax(strUrl, DTO, pass, fail) {
    $('#overlay').show();
    //$("#overlay").fadeIn();

    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: strUrl,
        data: JSON.stringify(DTO),
        dataType: "json",
        success: function (data) {
            $('#overlay').hide();
            //$("#overlay").fadeOut();
            pass(data);
        },
        error: function (data) {
            ajaxFail(data);
        }
    });

    return (false);

}



function ajaxPass(data){
    $("#txtValue").val(data.content);
    DoDraw('Canvas1',data.content);
}
function ajaxFail(data){
    console.log('ajax failed');
}

function DoDraw(Canvas, vFill, vLeft) {
    var canvas = document.getElementById(Canvas);
    var context = canvas.getContext('2d');
    //context.drawImage(images["sbScada"], 0, 0);
    var vWidth, vHeight, vTop;
    vWidth = 30;
    vHeight = 52;
    //vLeft = 25;
    vTop = 63;
    vFill = (vHeight * vFill) / 100;
    vFill = 0 - vFill;
    context.beginPath();
    context.rect(vLeft, vTop, vWidth, vHeight);
    context.fillStyle = 'white';
    context.fill();
    context.fillStyle = 'blue';
    context.fillRect(vLeft, vTop + vHeight, vWidth, vFill);

    context.lineWidth = 1;
    context.strokeStyle = 'black';
    context.stroke();
}

 function sendCommand_onclick(strData) {
     var strCommand = strUrl + "/api";
     var DTO = { 'myData': 'shane' };
     processAjax(strCommand, DTO, ajaxPass, ajaxFail);

 }
function ControlIO_onclick(IOToWrite,vValue){
    if(vValue == -1){
        vValue = $("#txtValueWrite").val();
    }

    var myDataContent = {
        reqOption: 'write',
        reqAddress: 1,
        reqIOToWrite: IOToWrite,
        reqWriteValue: vValue
    }
    var strCommand = strUrl + "/api";
    var DTO = { 'myData': myDataContent };
    processAjax(strCommand, DTO, ajaxPass, ajaxFail);
}
function ReadIO_onclick(){
    var myDataContent = {
        reqOption: 'read',
        reqAddress: 1,
        reqWriteValue: 0
    }
    var strCommand = strUrl + "/api";
    var DTO = { 'myData': myDataContent };
    processAjax(strCommand, DTO, ajaxPass, ajaxFail);
}

var stuff = {
    GetCurrentStatus: function(){
        var myDataContent = {
            reqOption: 'write',
            reqWriteValue: 0
        }
        var strCommand = strUrl + "/api";
        var DTO = { 'myData': myDataContent };
        processAjax(strCommand, DTO, ajaxPass, ajaxFail);
    }
}

//alert('hither');
function processData(data){
    var arrData = [];
    arrData = data.packet.split('*');
    var arrRec = [];
    arrRec = arrData[0].split(' ');

    if(arrRec.length>10){
        if(arrRec[1] == '%1'){
            if(arrRec[10] > 100){
                arrRec[10] = 100;
            }
            DoDraw("Canvas1",arrRec[10],25);
            DoDraw("Canvas2",arrRec[10],75);
        }
    }
}

function doGet_onclick(vValue){
    var strgetUrl = strUrl + '/api?reqIOToWrite=DigOut&reqWriteValue=' + vValue;
    $.get(strgetUrl,function(data,status){
        alert(status);
    });
}

function LoadApp(){

    //DoDraw("Canvas1", 5);

    //setInterval(stuff.GetCurrentStatus,(1000));

    //_rt_diag_socket = io.connect(nodeIpAddress, { port: _rt_diag_NodePort });
    //_rt_diag_socket.on('serverData', function (data) { processData(data) });

}

function TestFMX(){
    var strCommand = strUrl + "/FMXV5_API/wsFMXV5.asmx/SelectUsersRTUs";

    var Header = {
        UserName: 'shane@realtimesolutions.co.za',
        Password: 'password'
    }


    var DTO = { 'Header': Header, 'ID': 1 };
    processAjax(strCommand, DTO, ajaxPass, ajaxFail);
}

