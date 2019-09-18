// // const iButton = require('ibutton')
// // let button
// // button = iButton.from('C400001759DDB101') // same as Buffer.from('C400001759DDB101')
// // console.log(button);


// var ow = require('1-wire-js');

// // ow.permission.request().then(success, failure);

// function success(){
// 	console.log('success');
// }

// function failure(){
// 	console.log('failure');
// }

let bufdata = Buffer.alloc(0)
const data = Buffer.from('shane')
const totalLen = bufdata.length + data.length
bufdata = Buffer.concat([bufdata, data], totalLen)

const data1 = Buffer.from('bowyer')
const totalLen1 = bufdata.length + data1.length
bufdata = Buffer.concat([bufdata, data1], totalLen1)


setTimeout(function () {
	// self.emit("data", bufdata);
	console.log('bufdata',bufdata.toString())
	bufdata = Buffer.alloc(0)
}, 500)
