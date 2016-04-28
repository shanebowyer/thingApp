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

	$scope.controlUI = {
		divSetPointsReservoirVisible: false
	};

	$scope.controlChange = function(){
		switch($scope.selectedControlType){
			case('reservoir'):
				$scope.controlUI.divSetPointsReservoirVisible = true;
				break;
			case('sewagesump'):
				$scope.controlUI.divSetPointsReservoirVisible = false;
				break;
			default:
				break;
		}
	};

	$scope.selectControlTable = function(item,button){
		if(button == 'edit'){
			$scope.controlItem = item;
			$scope.selectedControlDescription = item.description;
			$scope.selectedControlType = item.controlType;
			if(item.controlType === 'reservoir'){
				$scope.selectedControlImg = './assets/img/reservoir.png';
				$scope.controlUI.divSetPointsReservoirVisible = true;
				$scope.selectedControlReservoirSPLow = item.setPoints.low;
				$scope.selectedControlReservoirSPHi = item.setPoints.hi;
				$scope.selectedControlReservoirSPSourceIO = item.setPoints.sourceIO;
				$scope.selectedControlReservoirSPIO = item.setPoints.io;

				$scope.selectedControlReservoirMsgOutSPLowSourceAddress = item.msgOutSetPointLow.sourceAddress;
				$scope.selectedControlReservoirMsgOutSPLowDestinationAddress = item.msgOutSetPointLow.destinationAddress;
				$scope.selectedControlReservoirMsgOutSPLowDestinationIO = item.msgOutSetPointLow.write.destinationIO;
				$scope.selectedControlReservoirMsgOutSPLowIO = item.msgOutSetPointLow.write.io;
				$scope.selectedControlReservoirMsgOutSPLowWriteMask = item.msgOutSetPointLow.write.mask;
				$scope.selectedControlReservoirMsgOutSPLowWriteValue = item.msgOutSetPointLow.write.value;

				$scope.selectedControlReservoirMsgOutSPHiSourceAddress = item.msgOutSetPointHi.sourceAddress;
				$scope.selectedControlReservoirMsgOutSPHiDestinationAddress = item.msgOutSetPointHi.destinationAddress;
				$scope.selectedControlReservoirMsgOutSPHiDestinationIO = item.msgOutSetPointHi.write.destinationIO;
				$scope.selectedControlReservoirMsgOutSPHiIO = item.msgOutSetPointHi.write.io;
				$scope.selectedControlReservoirMsgOutSPHiWriteMask = item.msgOutSetPointHi.write.mask;
				$scope.selectedControlReservoirMsgOutSPHiWriteValue = item.msgOutSetPointHi.write.value;
			}

		}
	};

	$scope.controlUpdate = function(){
		for(i=0;i<$scope.control.length;i++){
			if($scope.control[i].id == $scope.controlItem.id){
				$scope.control[i].description = $scope.selectedControlDescription;
				$scope.control[i].controlType = $scope.selectedControlType;
				$scope.control[i].enabled = $scope.selectedenabled;

				$scope.control[i].setPoints.low = $scope.selectedControlReservoirSPLow;
				$scope.control[i].setPoints.hi = $scope.selectedControlReservoirSPHi;
				$scope.control[i].setPoints.sourceIO = $scope.selectedControlReservoirSPSourceIO;
				$scope.control[i].setPoints.io = $scope.selectedControlReservoirSPIO;
				

				$scope.control[i].msgOutSetPointLow.sourceAddress = $scope.selectedControlReservoirMsgOutSPLowSourceAddress;
				$scope.control[i].msgOutSetPointLow.destinationAddress = $scope.selectedControlReservoirMsgOutSPLowDestinationAddress;
				$scope.control[i].msgOutSetPointLow.msgType = 'control';
 				$scope.control[i].msgOutSetPointLow.write.destinationIO = $scope.selectedControlReservoirMsgOutSPLowDestinationIO;
				$scope.control[i].msgOutSetPointLow.write.io = $scope.selectedControlReservoirMsgOutSPLowIO;
				$scope.control[i].msgOutSetPointLow.write.mask = $scope.selectedControlReservoirMsgOutSPLowWriteMask;
				$scope.control[i].msgOutSetPointLow.write.value = $scope.selectedControlReservoirMsgOutSPLowWriteValue;

				$scope.control[i].msgOutSetPointHi.sourceAddress = $scope.selectedControlReservoirMsgOutSPHiSourceAddress;
				$scope.control[i].msgOutSetPointHi.destinationAddress = $scope.selectedControlReservoirMsgOutSPHiDestinationAddress;
				$scope.control[i].msgOutSetPointHi.msgType = 'control';
 				$scope.control[i].msgOutSetPointHi.write.destinationIO = $scope.selectedControlReservoirMsgOutSPHiDestinationIO;
				$scope.control[i].msgOutSetPointHi.write.io = $scope.selectedControlReservoirMsgOutSPHiIO;
				$scope.control[i].msgOutSetPointHi.write.mask = $scope.selectedControlReservoirMsgOutSPHiWriteMask;
				$scope.control[i].msgOutSetPointHi.write.value = $scope.selectedControlReservoirMsgOutSPHiWriteValue;


				break;
			}
		}
		console.log($scope.io);
	};



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