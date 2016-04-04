angular.module('myApp')
.factory('api', ['$rootScope', '$http', '$timeout', function api($rootScope, $http, $timeout){        
    //var url = getAbsolutePath() + 'api';
    var url = 'http://127.0.0.1:8000/' + 'api';
    
    function getAbsolutePath() {
        var loc = window.location;
        var pathName = loc.pathname.substring(0, loc.pathname.lastIndexOf('/') + 1);
        return(loc.href.substring(0, loc.href.length - ((loc.pathname + loc.search + loc.hash).length - pathName.length)));
    }

    function getSettings(done, error){
        var DTO = { 'myData': {'reqOption': 'settings'} };
        $http.post(url, DTO)
        .success(function(data){
            // $rootScope.settings = data;
            done(data);
        })
        .error(function(reason){
            // $rootScope.settings = {};
            error(reason);
        });
    };
    function saveSettings(done, error){
        console.log('saving')
        var DTO = { 'myData': {'reqOption': 'settingsSave', 'settings': $rootScope.settings} };
        $http.post(url, DTO)
        .success(function(data){
            // $rootScope.settings = data;
            done(data);
        })
        .error(function(reason){
            // $rootScope.settings = {};
            error(reason);
        });
    };
    function readIO(done, error){
        console.log('reading io')
        var DTO = { 'myData': {'reqOption': 'read'} };
        $http.post(url, DTO)
        .success(function(data){
            // $rootScope.settings = data;
            done(data);
        })
        .error(function(reason){
            // $rootScope.settings = {};
            error(reason);
        });
    };    

    function sendWebSocketData(err,done){
        var data = {
            clientData: 'From Client'
        };

    };

    function showMessage(message,isError){
        if(isError){
            $rootScope.diverror = message;
            $rootScope.showdiverror = true;
            $timeout(function() {
                $rootScope.diverror = '';
                $rootScope.showdiverror = false;
            }, $rootScope.divErrorTimeout);
        }
        else
        {
            $rootScope.divMsg = message;
            $rootScope.showdivmsg = true;
            $timeout(function() {
                $rootScope.diverror = '';
                $rootScope.showdivmsg = false;
            }, $rootScope.divErrorTimeout);
        }
    }

    return{
        getAbsolutePath:getAbsolutePath,
        getSettings:getSettings,
        showMessage:showMessage,
        saveSettings:saveSettings,
        readIO:readIO
    }

}])
angular.module('myApp')
.factory('io', ['$rootScope', '$http', function io($rootScope, $http){
    function sendData(){
        var data = {
            message: 'triggered'
        };
        $rootScope.io.emit('message',data);
    };

    return{
        sendData:sendData,
    }

}]);

