// const iButton = require('ibutton')
// let button
// button = iButton.from('C400001759DDB101') // same as Buffer.from('C400001759DDB101')
// console.log(button);


var ow = require('1-wire-js');

// ow.permission.request().then(success, failure);

function success(){
	console.log('success');
}

function failure(){
	console.log('failure');
}