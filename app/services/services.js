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

    return{
        getAbsolutePath:getAbsolutePath,
        getSettings:getSettings
    }

}]);