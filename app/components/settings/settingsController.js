angular.module('myApp')
.controller('settingsCtrl', function($scope,$state,api,io) {
	console.log('gettingio');
	$scope.io = api.getAbsolutePath();
	// api.getSettings(function(data){
	// 	console.log('done',data);

	// },function(data){
	// 	console.log('error',data);
	// })

	$scope.SendWebSocketData = function(){
		io.sendData();
	};
});