angular.module('myApp')
.controller('appCtrl', function($scope, $state, $rootScope) {
		$scope.settings = function(){
			$state.go('app.settings');
		}
		$scope.home = function(){
			$state.go('app.home');
		}		
});

