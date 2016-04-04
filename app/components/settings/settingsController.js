angular.module('myApp')
.controller('settingsCtrl', function($scope,$rootScope,$timeout,$state,api,io) {
	console.log('gettingio');
	api.getAbsolutePath();
	$scope.init = function(){
		api.getSettings(function(data){
			console.log('done',data);
			$rootScope.settings = data.content.value;
			$scope.description = data.content.value.description;
			$scope.io = data.content.value.io;

			$scope.item = '';
			$scope.selectedid = '';
			$scope.selecteddescription = '';
			$scope.selectedioType = '';
			$scope.selectedipAddress = '';
			$scope.selectedport = '';
			$scope.selectedenabled = ''
		},function(data){
			console.log('error',data);
		})
	} 

	$scope.selectTable = function(item,button){
		if(button == 'edit'){
			$scope.item = item;
			$scope.selectedid = item.id;
			$scope.selecteddescription = item.description;
			$scope.selectedioType = item.ioType;
			$scope.selectedipAddress = item.ipAddress;
			$scope.selectedport = item.port;
			$scope.selectedenabled = item.enabled;
		}
	}

	$scope.ioAdd = function(){
		var IO = {
			'description': 	$scope.selecteddescription,
			'ioType': 		$scope.selectedioType,
			'ipAddress': 	$scope.selectedipAddress,
			'port': 		$scope.selectedport,
			'enabled': 		$scope.selectedenabled
		}
		$scope.io.push(IO);
		console.log($scope.io);
	}

	$scope.ioUpdate = function(){
		for(i=0;i<$scope.io.length;i++){
			if($scope.io[i].id == $scope.item.id){
				$scope.io[i].description = $scope.selecteddescription;
				$scope.io[i].ioType = $scope.selectedioType;
				$scope.io[i].ipAddress = $scope.selectedipAddress;
				$scope.io[i].port = $scope.selectedport;
				$scope.io[i].enabled = $scope.selectedenabled;
				break;
			}
		}
		console.log($scope.io);
	}

	$scope.ioDelete = function(item,button){
		if(button == 'delete'){
			try{
				var i = 0;
				$scope.io.forEach(function(entry){
					if(entry.id == item.id){
						$scope.io.splice(i, 1);
						console.log('deleted',$scope.io);
						throw BreakException;
					}
					i++;
				})
			}
			catch(e){

			}
		}
	}

	$scope.save = function(){
		$rootScope.settings.description = $scope.description;
		$rootScope.io = $scope.io;

		api.saveSettings(function(done){
			api.showMessage('Settings Saved',false);
			$scope.init();
		}, function(err){
			console.log('error',err);
			api.showMessage('Error Saving Settings',true);
		});
	}

	$scope.readIO = function(){
		api.readIO(function(done){
			console.log('readIO res',done.content);
		}, function(err){
			console.log('error',err);
			api.showMessage('Error readIO',true);
		});
	}


	// $scope.SendWebSocketData = function(){
	// 	io.sendData();
	// };
});