
var express 	= require('express');
var router 		= express.Router();
var bllModule 	= require('../bll/bll.js');


router.use(function timeLog(req, res, next) {
  	console.log('API rtu hit: ', Date.now());
  	next();
});


router.post('/read', function(req, res) {
    var myModule = new bllModule.module();
    myModule.settings.processReadSettings(req,res);
});

router.post('/save', function(req, res) {
    var myModule = new bllModule.module();
    myModule.settings.processSaveSettings(args)
});

module.exports = router;