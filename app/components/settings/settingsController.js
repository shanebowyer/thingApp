angular.module('myApp')
.controller('settingsCtrl', function($scope,$rootScope,$timeout,$state,api,io) {
	console.log('gettingio');
	api.getAbsolutePath();
	$scope.init = function(){
		api.getSettings(function(data){
			console.log('done',data);
			$rootScope.settings = data.content.value;
			$scope.selectedSiteDescription = data.content.value.description;
			$scope.selectedSiteID = data.content.value.rtuId;
			$scope.io = data.content.value.io;
			$scope.control = data.content.value.control;
			$scope.localwebserver = data.content.value.localwebserver;

			$scope.selectedSiteIpAddress = $scope.localwebserver.ipAddress;
			$scope.selectedSitePort = $scope.localwebserver.port;
			$scope.selectedSiteSocketPort = $scope.localwebserver.socketPort;
			$scope.selectedSiteDefaultHtmlPage = $scope.localwebserver.defaultHtmlPage;



			$scope.item = '';
			$scope.selectedid = '';
			$scope.selecteddescription = '';
			$scope.selectedioType = '';
			$scope.selectedipAddress = '';
			$scope.selectedport = '';
			$scope.selectedenabled = '';


			$scope.selectedControlImg = '';
			$scope.selectedControlType = '';
			$scope.selectedControlDescription = '';
			$scope.selectedControlEnabled = false;
			$scope.selectedControlReservoirSPLow = 0;
			$scope.selectedControlReservoirSPHi = 0;
			$scope.selectedControlReservoirSPSourceIO = 0;
			$scope.selectedControlReservoirSPIO = 0;
			$scope.selectedControlReservoirMsgOutSPLowSourceAddress = 0;
			$scope.selectedControlReservoirMsgOutSPLowDestinationAddress = 0;
			$scope.selectedControlReservoirMsgOutSPLowDestinationIO = 0;
			$scope.selectedControlReservoirMsgOutSPLowIO = 0;
			$scope.selectedControlReservoirMsgOutSPLowWriteMask = 0;
			$scope.selectedControlReservoirMsgOutSPLowWriteValue = 0;
			$scope.selectedControlReservoirMsgOutSPHiSourceAddress = 0;
			$scope.selectedControlReservoirMsgOutSPHiDestinationAddress = 0;
			$scope.selectedControlReservoirMsgOutSPHiDestinationIO = 0;
			$scope.selectedControlReservoirMsgOutSPHiIO = 0;
			$scope.selectedControlReservoirMsgOutSPHiWriteMask = 0;
			$scope.selectedControlReservoirMsgOutSPHiWriteValue = 0;



		},function(data){
			console.log('error',data);
		})
	} 


	$scope.siteUpdate = function(){
		$scope.localwebserver.ipAddress = $scope.selectedSiteIpAddress;
		$scope.localwebserver.port = $scope.selectedSitePort;
		$scope.localwebserver.socketPort = $scope.selectedSiteSocketPort;
		$scope.localwebserver.defaultHtmlPage = $scope.selectedSiteDefaultHtmlPage;
	};


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
			$scope.selectedControlEnabled = item.enabled;
			if(item.controlType === 'reservoir'){
				$scope.selectedControlImg = './assets/img/reservoir.png';
				$scope.controlUI.divSetPointsReservoirVisible = true;
				$scope.selectedControlReservoirSPLow = item.setPoints.low;
				$scope.selectedControlReservoirSPHi = item.setPoints.hi;
				$scope.selectedControlReservoirSPSourceIO = item.setPoints.sourceIO.toString();
				$scope.selectedControlReservoirSPIO = item.setPoints.io;

				$scope.selectedControlReservoirMsgOutSPLowSourceAddress = item.msgOutSetPointLow.sourceAddress;
				$scope.selectedControlReservoirMsgOutSPLowDestinationAddress = item.msgOutSetPointLow.destinationAddress;
				$scope.selectedControlReservoirMsgOutSPLowDestinationIO = item.msgOutSetPointLow.write.destinationIO.toString();
				$scope.selectedControlReservoirMsgOutSPLowIO = item.msgOutSetPointLow.write.io;
				$scope.selectedControlReservoirMsgOutSPLowWriteMask = item.msgOutSetPointLow.write.mask;
				$scope.selectedControlReservoirMsgOutSPLowWriteValue = item.msgOutSetPointLow.write.value;

				$scope.selectedControlReservoirMsgOutSPHiSourceAddress = item.msgOutSetPointHi.sourceAddress;
				$scope.selectedControlReservoirMsgOutSPHiDestinationAddress = item.msgOutSetPointHi.destinationAddress;
				$scope.selectedControlReservoirMsgOutSPHiDestinationIO = item.msgOutSetPointHi.write.destinationIO.toString();
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
				$scope.control[i].enabled = $scope.selectedControlEnabled;

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
		console.log($scope.control);
	};


	$scope.controlAdd = function(){
		if($scope.selectedControlType === 'reservoir'){
			var control = 
		      {
		         // "id":1,
		         "controlType":$scope.selectedControlType,
		         "description":$scope.selectedControlDescription,
		         "enabled":$scope.selectedControlEnabled,
		         "setPoints":{
		            "low":$scope.selectedControlReservoirSPLow,
		            "hi":$scope.selectedControlReservoirSPHi,
		            "sourceIO":$scope.selectedControlReservoirSPSourceIO,
		            "io":$scope.selectedControlReservoirSPIO
		         },
		         "msgOutSetPointLow":{
		            "sourceAddress":$scope.selectedControlReservoirMsgOutSPLowSourceAddress,
		            "destinationAddress":$scope.selectedControlReservoirMsgOutSPLowDestinationAddress,
		            "msgType":"control",
		            "write":{
		               "destinationIO":$scope.selectedControlReservoirMsgOutSPLowDestinationIO,
		               "io":$scope.selectedControlReservoirMsgOutSPLowIO,
		               "mask":$scope.selectedControlReservoirMsgOutSPLowWriteMask,
		               "value":$scope.selectedControlReservoirMsgOutSPLowWriteValue
		            }
		         },
		         "msgOutSetPointHi":{
		            "sourceAddress":$scope.selectedControlReservoirMsgOutSPHiSourceAddress,
		            "destinationAddress":$scope.selectedControlReservoirMsgOutSPHiDestinationAddress,
		            "msgType":"control",
		            "write":{
		               "destinationIO":$scope.selectedControlReservoirMsgOutSPHiDestinationIO,
		               "io":$scope.selectedControlReservoirMsgOutSPHiIO,
		               "mask":$scope.selectedControlReservoirMsgOutSPHiWriteMask,
		               "value":$scope.selectedControlReservoirMsgOutSPHiWriteValue
		            }
		        }
		      };				
		}


		$scope.control.push(control);
		console.log($scope.control);
	};

	$scope.controlDelete = function(item,button){
		if(button == 'delete'){
			try{
				var i = 0;
				$scope.control.forEach(function(entry){
					if(entry.id == item.id){
						$scope.control.splice(i, 1);
						console.log('deleted control',$scope.control);
						throw BreakException;
					}
					i++;
				});
			}
			catch(e){

			}
		}
	};



	$scope.save = function(){
		$rootScope.settings.description = $scope.selectedSiteDescription;
		$rootScope.settings.rtuId = $scope.selectedSiteID;

		$rootScope.io = $scope.io;
		$rootScope.control = $scope.control;
		$rootScope.localwebserver = $scope.localwebserver;

		api.saveSettings(function(done){
			api.showMessage('Settings Saved',false);
			$scope.init();
		}, function(err){
			console.log('error',err);
			api.showMessage('Error Saving Settings',true);
		});
	};



	// $scope.SendWebSocketData = function(){
	// 	io.sendData();
	// };
});