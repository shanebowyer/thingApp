angular.module('myApp')
.controller('settingsCtrl', function($scope,$rootScope,$timeout,$state,api,io,$location, $anchorScroll) {
	console.log('gettingio');
	api.getAbsolutePath();
	$scope.gotoAnchor = function(section){
		console.log('clicked');
		$location.hash(section);
		$anchorScroll();
	};

	$scope.init = function(){
		api.getSettings(function(data){
			console.log('done',data);
			$scope.optionsIOModules = [
				{
					ioType: 'TCP-MODMUX-DIO8'
				},
				{
					ioType: 'TCP-MODMUX-AI8'
				},
				{
					ioType: 'GAR-FEP'
				}
			];

			$scope.optionsControl = [
				{
					controlType: 'reservoir'
				},
				{
					controlType: 'sewagesump'
				},
				{
					controlType: 'other'
				}
			];

			$scope.optionsIO = [
				{
					description: 'digOut'
				},
				{
					description: 'AI1'
				},
				{
					description: 'AI1Scaled'
				},
				{
					description: 'AI2'
				},
				{
					description: 'AI2Scaled'
				}
			];


			$rootScope.settings = data.content.value;
			$scope.io = data.content.value.io;
			$scope.control = data.content.value.control;
			$scope.localwebserver = data.content.value.localwebserver;

			$scope.selectedSite = {
				description: data.content.value.description,
				id: data.content.value.rtuId,
				ipAddress: $scope.localwebserver.ipAddress,
				port: $scope.localwebserver.port,
				socketPort: $scope.localwebserver.socketPort,
				defaultHtmlPage: $scope.localwebserver.defaultHtmlPage
			};

			$scope.selectedIO = {
				item: '',
				id: '',
				description: '',
				ioType: '',
				ipAddress: '',
				port: '',
				enabled: ''
			};

			$scope.selectedControl = {
				img: '',
				controlType: '',
				description: '',
				enabled: false,
				reservoirSPLow: 0,
				reservoirSPHi: 0,
				reservoirSPSourceIO: 0,
				reservoirSPIO: 0,
				reservoirMsgOutSPLowSourceAddress: 0,
				reservoirMsgOutSPLowDestinationAddress: 0,
				reservoirMsgOutSPLowDestinationIO: 0,
				reservoirMsgOutSPLowIO: 0,
				reservoirMsgOutSPLowWriteMask: 0,
				reservoirMsgOutSPLowWriteValue: 0,
				reservoirMsgOutSPHiSourceAddress: 0,
				reservoirMsgOutSPHiDestinationAddress: 0,
				reservoirMsgOutSPHiDestinationIO: 0,
				reservoirMsgOutSPHiIO: 0,
				reservoirMsgOutSPHiWriteMask: 0,
				reservoirMsgOutSPHiWriteValue: 0
			};

		},function(data){
			console.log('error',data);
		});
	};


	$scope.siteUpdate = function(){
		$scope.localwebserver.ipAddress = $scope.selectedSite.ipAddress;
		$scope.localwebserver.port = $scope.selectedSite.port;
		$scope.localwebserver.socketPort = $scope.selectedSite.socketPort;
		$scope.localwebserver.defaultHtmlPage = $scope.selectedSite.defaultHtmlPage;
	};


	$scope.selectTable = function(item,button){
		if(button == 'edit'){
			$scope.selectedIO.item = item;
			$scope.selectedIO.id = item.id;
			$scope.selectedIO.description = item.description;
			$scope.selectedIO.ioType = item.ioType;
			$scope.selectedIO.ipAddress = item.ipAddress;
			$scope.selectedIO.port = item.port;
			$scope.selectedIO.enabled = item.enabled;
		}
	}

	$scope.ioAdd = function(){
		var IO = {
			'description': 	$scope.selectedIO.description,
			'ioType': 		$scope.selectedIO.ioType,
			'ipAddress': 	$scope.selectedIO.ipAddress,
			'port': 		$scope.selectedIO.port,
			'enabled': 		$scope.selectedIO.enabled
		}
		$scope.io.push(IO);
		console.log($scope.io);
	}

	$scope.ioUpdate = function(){
		for(i=0;i<$scope.io.length;i++){
			if($scope.io[i].id == $scope.selectedIO.item.id){
				// $scope.io[i].id = $scope.selectedIO.description;
				$scope.io[i].description = $scope.selectedIO.description;
				$scope.io[i].ioType = $scope.selectedIO.ioType;
				$scope.io[i].ipAddress = $scope.selectedIO.ipAddress;
				$scope.io[i].port = $scope.selectedIO.port;
				$scope.io[i].enabled = $scope.selectedIO.enabled;
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
			$scope.selectedControl.description = item.description;
			$scope.selectedControl.controlType = item.controlType;
			$scope.selectedControl.enabled = item.enabled;
			if(item.controlType === 'reservoir'){
				$scope.selectedControl.img = './assets/img/reservoir.png';
				$scope.controlUI.divSetPointsReservoirVisible = true;
				$scope.selectedControl.reservoirSPLow = item.setPoints.low;
				$scope.selectedControl.reservoirSPHi = item.setPoints.hi;
				$scope.selectedControl.reservoirSPSourceIO = item.setPoints.sourceIO.toString();
				$scope.selectedControl.reservoirSPIO = item.setPoints.io;
				$scope.selectedControl.reservoirMsgOutSPLowSourceAddress = item.msgOutSetPointLow.sourceAddress;
				$scope.selectedControl.reservoirMsgOutSPLowDestinationAddress = item.msgOutSetPointLow.destinationAddress;
				$scope.selectedControl.reservoirMsgOutSPLowDestinationIO = item.msgOutSetPointLow.write.destinationIO.toString();
				$scope.selectedControl.reservoirMsgOutSPLowIO = item.msgOutSetPointLow.write.io;
				$scope.selectedControl.reservoirMsgOutSPLowWriteMask = item.msgOutSetPointLow.write.mask;
				$scope.selectedControl.reservoirMsgOutSPLowWriteValue = item.msgOutSetPointLow.write.value;
				$scope.selectedControl.reservoirMsgOutSPHiSourceAddress = item.msgOutSetPointHi.sourceAddress;
				$scope.selectedControl.reservoirMsgOutSPHiDestinationAddress = item.msgOutSetPointHi.destinationAddress;
				$scope.selectedControl.reservoirMsgOutSPHiDestinationIO = item.msgOutSetPointHi.write.destinationIO.toString();
				$scope.selectedControl.reservoirMsgOutSPHiIO = item.msgOutSetPointHi.write.io;
				$scope.selectedControl.reservoirMsgOutSPHiWriteMask = item.msgOutSetPointHi.write.mask;
				$scope.selectedControl.reservoirMsgOutSPHiWriteValue = item.msgOutSetPointHi.write.value;
			}

		}
	};

	$scope.controlUpdate = function(){
		for(i=0;i<$scope.control.length;i++){
			if($scope.control[i].id == $scope.controlItem.id){
				$scope.control[i].description = $scope.selectedControl.description;
				$scope.control[i].controlType = $scope.selectedControl.controlType;
				$scope.control[i].enabled = $scope.selectedControl.enabled;

				$scope.control[i].setPoints.low = $scope.selectedControl.reservoirSPLow;
				$scope.control[i].setPoints.hi = $scope.selectedControl.reservoirSPHi;
				$scope.control[i].setPoints.sourceIO = $scope.selectedControl.reservoirSPSourceIO;
				$scope.control[i].setPoints.io = $scope.selectedControl.reservoirSPIO;
				$scope.control[i].msgOutSetPointLow.sourceAddress = $scope.selectedControl.reservoirMsgOutSPLowSourceAddress;
				$scope.control[i].msgOutSetPointLow.destinationAddress = $scope.selectedControl.reservoirMsgOutSPLowDestinationAddress;
				$scope.control[i].msgOutSetPointLow.msgType = 'control';
 				$scope.control[i].msgOutSetPointLow.write.destinationIO = $scope.selectedControl.reservoirMsgOutSPLowDestinationIO;
				$scope.control[i].msgOutSetPointLow.write.io = $scope.selectedControl.reservoirMsgOutSPLowIO;
				$scope.control[i].msgOutSetPointLow.write.mask = $scope.selectedControl.reservoirMsgOutSPLowWriteMask;
				$scope.control[i].msgOutSetPointLow.write.value = $scope.selectedControl.reservoirMsgOutSPLowWriteValue;
				$scope.control[i].msgOutSetPointHi.sourceAddress = $scope.selectedControl.reservoirMsgOutSPHiSourceAddress;
				$scope.control[i].msgOutSetPointHi.destinationAddress = $scope.selectedControl.reservoirMsgOutSPHiDestinationAddress;
				$scope.control[i].msgOutSetPointHi.msgType = 'control';
 				$scope.control[i].msgOutSetPointHi.write.destinationIO = $scope.selectedControl.reservoirMsgOutSPHiDestinationIO;
				$scope.control[i].msgOutSetPointHi.write.io = $scope.selectedControl.reservoirMsgOutSPHiIO;
				$scope.control[i].msgOutSetPointHi.write.mask = $scope.selectedControl.reservoirMsgOutSPHiWriteMask;
				$scope.control[i].msgOutSetPointHi.write.value = $scope.selectedControl.reservoirMsgOutSPHiWriteValue;


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
		         "controlType":$scope.selectedControl.controlType,
		         "description":$scope.selectedControl.description,
		         "enabled":$scope.selectedControl.enabled,
		         "setPoints":{
		            "low":$scope.selectedControl.reservoirSPLow,
		            "hi":$scope.selectedControl.reservoirSPHi,
		            "sourceIO":$scope.selectedControl.reservoirSPSourceIO,
		            "io":$scope.selectedControl.reservoirSPIO
		         },
		         "msgOutSetPointLow":{
		            "sourceAddress":$scope.selectedControl.reservoirMsgOutSPLowSourceAddress,
		            "destinationAddress":$scope.selectedControl.reservoirMsgOutSPLowDestinationAddress,
		            "msgType":"control",
		            "write":{
		               "destinationIO":$scope.selectedControl.reservoirMsgOutSPLowDestinationIO,
		               "io":$scope.selectedControl.reservoirMsgOutSPLowIO,
		               "mask":$scope.selectedControl.reservoirMsgOutSPLowWriteMask,
		               "value":$scope.selectedControl.reservoirMsgOutSPLowWriteValue
		            }
		         },
		         "msgOutSetPointHi":{
		            "sourceAddress":$scope.selectedControl.reservoirMsgOutSPHiSourceAddress,
		            "destinationAddress":$scope.selectedControl.reservoirMsgOutSPHiDestinationAddress,
		            "msgType":"control",
		            "write":{
		               "destinationIO":$scope.selectedControl.reservoirMsgOutSPHiDestinationIO,
		               "io":$scope.selectedControl.reservoirMsgOutSPHiIO,
		               "mask":$scope.selectedControl.reservoirMsgOutSPHiWriteMask,
		               "value":$scope.selectedControl.reservoirMsgOutSPHiWriteValue
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
		$rootScope.settings.description = $scope.selectedSite.description;
		$rootScope.settings.rtuId = $scope.selectedSite.id;

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