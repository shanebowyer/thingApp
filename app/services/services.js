angular.module('myApp')
.factory('api', ['$rootScope', '$http', function api($rootScope, $http){        
    var url = getAbsolutePath() + 'api';
    
    function getAbsolutePath() {
        var loc = window.location;
        var pathName = loc.pathname.substring(0, loc.pathname.lastIndexOf('/') + 1);
        return(loc.href.substring(0, loc.href.length - ((loc.pathname + loc.search + loc.hash).length - pathName.length)));
    }

    function getSettings(done, error){
        var DTO = { 'myData': {'reqOption': 'read'} };
        $http.post(url, DTO)
        .success(function(data){
            console.log('data',data);
            if (data.ErrorCode == 0){
                done(data.Data);
            }
            else {
                error(data.Error);
            }
        })
        .error(function(reason){
            error(reason);
        });
    };
    function sendWebSocketData(err,done){
        var data = {
            clientData: 'From Client'
        };

    };

    return{
        getAbsolutePath:getAbsolutePath,
        getSettings:getSettings
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

