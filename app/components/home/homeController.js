// app.controller('homeCtrl', ['$scope','$state',function($scope,$state) {
//     $scope.firstName= "John";
//     $scope.lastName= "Doe";
// }]);

angular.module('myApp')
.controller('homeCtrl', function($scope,$state,api) {
    $scope.firstName= "John";
    $scope.lastName= "Doe";

    $scope.getRTUStatuses = function(){
    	api.sendRTUMessage(function(data){
    		$scope.rtuData = data.content;
    		console.log('sendRTUMessage response',data);
    	},function(err){
			console.log('Error sendRTUMessage response',err);
    	});
    };


});