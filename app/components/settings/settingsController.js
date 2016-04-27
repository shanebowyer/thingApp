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
			$scope.control = data.content.value.control;

			$scope.item = '';
			$scope.selectedid = '';
			$scope.selecteddescription = '';
			$scope.selectedioType = '';
			$scope.selectedipAddress = '';
			$scope.selectedport = '';
			$scope.selectedenabled = '';

			$scope.selectedControlDescription = '';
			$scope.selectedControlType = '';
			$scope.selectedControlSPLow = 0;
			$scope.selectedControlSPHi = 0;
			$scope.selectedControlselectedControlSPSourceIO = 0;
			$scope.selectedControlSPIO = '';

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
	};

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
	};


	$scope.selectControlTable = function(item,button){
		if(button == 'edit'){
			$scope.controlItem = item;
			$scope.selectedControlDescription = item.description;
			$scope.selectedControlType = item.controlType;
			$scope.selectedControlSPLow = item.setPoints.low;
			$scope.selectedControlSPHi = item.setPoints.hi;
			$scope.selectedControlSPSourceIO = item.setPoints.sourceIO;
			$scope.selectedControlSPIO = item.setPoints.io;

			$scope.selectedControlMsgOutSPLowSourceAddress = item.msgOutSetPointLow.sourceAddress;
			$scope.selectedControlMsgOutSPLowDestinationAddress = item.msgOutSetPointLow.destinationAddress;
			$scope.selectedControlMsgOutSPLowDestinationIO = item.msgOutSetPointLow.write.destinationIO;
			$scope.selectedControlMsgOutSPLowIO = item.msgOutSetPointLow.write.io;
			$scope.selectedControlMsgOutSPLowWriteMask = item.msgOutSetPointLow.write.mask;
			$scope.selectedControlMsgOutSPLowWriteValue = item.msgOutSetPointLow.write.value;

			$scope.selectedControlMsgOutSPHiSourceAddress = item.msgOutSetPointHi.sourceAddress;
			$scope.selectedControlMsgOutSPHiDestinationAddress = item.msgOutSetPointHi.destinationAddress;
			$scope.selectedControlMsgOutSPHiDestinationIO = item.msgOutSetPointHi.write.destinationIO;
			$scope.selectedControlMsgOutSPHiIO = item.msgOutSetPointHi.write.io;
			$scope.selectedControlMsgOutSPHiWriteMask = item.msgOutSetPointHi.write.mask;
			$scope.selectedControlMsgOutSPHiWriteValue = item.msgOutSetPointHi.write.value;

		}
	};

	$scope.controlUpdate = function(){
		for(i=0;i<$scope.control.length;i++){
			if($scope.control[i].id == $scope.controlItem.id){
				$scope.control[i].description = $scope.selectedControlDescription;
				$scope.control[i].controlType = $scope.selectedControlType;
				$scope.control[i].setPoints.low = $scope.selectedControlSPLow;
				$scope.control[i].setPoints.hi = $scope.selectedControlSPHi;
				$scope.control[i].setPoints.sourceIO = $scope.selectedControlSPSourceIO;
				$scope.control[i].setPoints.io = $scope.selectedControlSPIO;
				$scope.control[i].enabled = $scope.selectedenabled;

				$scope.control[i].msgOutSetPointLow.sourceAddress = $scope.selectedControlMsgOutSPLowSourceAddress;
				$scope.control[i].msgOutSetPointLow.destinationAddress = $scope.selectedControlMsgOutSPLowDestinationAddress;
				$scope.control[i].msgOutSetPointLow.msgType = $scope.
 
				$scope.control[i].write.destinationIO = $scope.selectedControlMsgOutSPLowDestinationIO
				$scope.control[i].write.io = $scope.selectedControlMsgOutSPLowIO
				$scope.control[i].write.mask = $scope.selectedControlMsgOutSPLowWriteMask
				$scope.control[i].write.value = $scope.selectedControlMsgOutSPLowWriteValue

				break;
			}
		}
		console.log($scope.io);
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



	// $scope.SendWebSocketData = function(){
	// 	io.sendData();
	// };
});