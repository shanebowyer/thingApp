
global.__base = __dirname + '/';
var settings = require(__base + '/script/settings.js');


var io = settings.io();
console.log('story');
console.log(io[1]);