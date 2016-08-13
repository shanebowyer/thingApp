
var express 	= require('express');
var router 		= express.Router();
var bllModule 	= require('../bll/bll.js');


router.use(function timeLog(req, res, next) {
  	console.log('API rtu hit: ', Date.now());
  	next();
});


router.post('/message', function(req, res) {
    var myModule = new bllModule.module();
    myModule.rtu.processRTUMessage(req,res)
});

router.post('/readsettings', function(req, res) {
    var myModule = new bllModule.module();
    myModule.rtu.processReadSettings(args)
});

router.post('/savesettings', function(req, res) {
    var myModule = new bllModule.module();
    myModule.rtu.processSaveSettings(args)
});

module.exports = router;