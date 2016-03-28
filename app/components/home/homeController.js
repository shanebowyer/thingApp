// app.controller('homeCtrl', ['$scope','$state',function($scope,$state) {
//     $scope.firstName= "John";
//     $scope.lastName= "Doe";
// }]);

angular.module('myApp')
.controller('homeCtrl', function($scope,$state) {
    $scope.firstName= "John";
    $scope.lastName= "Doe";
});