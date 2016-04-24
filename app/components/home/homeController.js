// app.controller('homeCtrl', ['$scope','$state',function($scope,$state) {
//     $scope.firstName= "John";
//     $scope.lastName= "Doe";
// }]);

angular.module('myApp')
.controller('homeCtrl', function($scope,$state,api) {
    $scope.firstName= "John";
    $scope.lastName= "Doe";

    $scope.getRTUStatuses = function(){
        var msgOut = {
            dateTime: '2016/01/01',
            messageId: 789,
            payLoad: {
                sourceAddress: 2,
                destinationAddress: 1,
                msgId: 123,
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