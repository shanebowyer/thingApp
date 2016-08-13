// app.controller('homeCtrl', ['$scope','$state',function($scope,$state) {
//     $scope.firstName= "John";
//     $scope.lastName= "Doe";
// }]);

angular.module('myApp')
.controller('homeCtrl', function($scope,$state,api) {
    $scope.firstName= "John";
    $scope.lastName= "Doe";
    $scope.address = 1;
    $scope.subAddress = 1;

    $scope.getRTUStatuses = function(){
        var msgOut = {
            dateTime: '2016/01/01',
            messageId: 789,
            payLoad: {
                sourceAddress: 0,
                destinationAddress: $scope.address,
                subAddress: $scope.subAddress,
                msgId: 999,
                msgType: 'status'
            }
        };
    	api.sendRTUMessage(msgOut, function(data){
    		$scope.rtuData = data.content;
    		console.log('sendRTUMessage response',data);
    	},function(err){
			console.log('Error sendRTUMessage response',err);
    	});
    };

    $scope.controlGate = function(){
        $scope.toggleGateOn(function(){

        }, function(){
            $scope.toggleGateOff(function(){

            },function(){

            })
        })
    };

    $scope.gateImg = './assets/img/button.jpg';

    $scope.toggleGateOn = function(err,done){
        var msgOut = {
            dateTime: '2016/01/01',
            messageId: 789,
            payLoad: {
                sourceAddress: 2,
                destinationAddress: 1,
                msgType: 'control',
                write: {
                    destinationIO: 1,
                    io: 'digOut',
                    value: 255
                }
            }
        };
        api.sendRTUMessage(msgOut, function(data){
            $scope.rtuData = data.content;
            console.log('sendRTUMessage response',data);
            done();
        },function(err){
            console.log('Error sendRTUMessage response',err);
        });
    }

    $scope.toggleGateOff = function(err,done){
        var msgOut = {
            dateTime: '2016/01/01',
            messageId: 789,
            payLoad: {
                sourceAddress: 2,
                destinationAddress: 1,
                msgType: 'control',
                write: {
                    destinationIO: 1,
                    io: 'digOut',
                    value: 0
                }
            }
        };
        api.sendRTUMessage(msgOut, function(data){
            $scope.rtuData = data.content;
            console.log('sendRTUMessage response',data);
            done();
        },function(err){
            console.log('Error sendRTUMessage response',err);
        });
    }



    $scope.controlIO = function(){
        var msgOut = {
            dateTime: '2016/01/01',
            messageId: 789,
            payLoad: {
                sourceAddress: 2,
                destinationAddress: 1,
                msgType: 'control',
                write: {
                    destinationIO: 1,
                    io: 'digOut',
                    value: $scope.valueToWrite
                }
            }
        };
        api.sendRTUMessage(msgOut, function(data){
            $scope.rtuData = data.content;
            console.log('sendRTUMessage response',data);
        },function(err){
            console.log('Error sendRTUMessage response',err);
        });
    };



});