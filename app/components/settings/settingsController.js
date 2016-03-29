global.__base = __dirname + '/';
var settings    = require(__base + './config.js');


angular.module('myApp')
.controller('settingsCtrl', function($scope,$state) {

    $scope.io = 'a';//settings.io;
});