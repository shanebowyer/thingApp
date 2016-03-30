angular.module('myApp')
.controller('settingsCtrl', function($scope,$state,api) {
	console.log('gettingio');
	$scope.io = api.getAbsolutePath();
	api.getSettings(function(data){
		console.log('done',data);

	},function(data){
		console.log('error',data);
	})
});