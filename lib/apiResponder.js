var Q       		= require('q');
var util			= require('util');


var module = function(){
	var responder = {
		errorObject: 
		{
			"error": {
				"code":"401",
				"message":"Error",
				"errors":[
					{
						"code": "1",
						"locationType":"db",
						"message":"error in Responder",
						"reason":"generalError",
						"locaction":"Responder"
					}
				]
			}

		},
		modelData: function(req,result){
			var deferred = Q.defer();
			var scopeUrl = req.originalUrl;
			console.log('scopeUrl',scopeUrl);
			// console.log('modelData',result.result);

			scopeUrl = '*';	//This is for testing only
			switch(scopeUrl){
				case('*'):
					deferred.resolve(result);
					break;
				case('/telemetry/mimic/list'):
					responder.mimiclistResponse(result)
					.then(function(result){
						deferred.resolve(result);
					},function(err){
						deferred.reject(err);
					});
					break;

				default:
					deferred.resolve({'success': {'details': 'your request resolved successfully but this payload is not modeled'}});

			}


			return deferred.promise;
		},				
		successResponse: function(req,res,result){
			console.log('out',req.logger);
			req.logger.LogData('',JSON.stringify({"responder":result}));
			console.log('in responder');

			responder.modelData(req,result)
			.then(function(result){

				if(typeof result[0] !== 'undefined'){
					if(typeof result[0].error !== 'undefined'){
						console.log('No records');
						if(result[0].error == 'No records found'){
							responder.errorObject.error.code = 401;
							responder.errorObject.error.message = 'No records found1';
						}
						responder.errorResponse(req,res,responder.errorObject);
						return;				
					}
				}
				res.json(result);


			},function(err){
				console.log('in successResponder error');
				responder.errorObject.error.code = 401;
				responder.errorObject.error.message = err;
				responder.errorResponse(req,res,responder.errorObject);
			})





		},
		errorResponse: function(req,res,err){
			console.log('in errorResponse');
			console.log('in errorResponse', JSON.stringify(err.hiddenErrors));
			console.log('in errorResponse', JSON.stringify(err));
			if(typeof err == 'object'){
				try{
					// __Logger.LogData(util.inspect(err),'');
					// __Logger.LogData(JSON.stringify(err),'');
				}
				catch(e){
					console.log('error writing to Logger',e);
					// __Logger.LogData('Skipped writing an Error. Could not stringify the err object','');
				}
			}
			else{
				// __Logger.LogData(err,'');	
			}

			
			res.status(err.error.code).json(err.error);
		}
	}
	return responder;
}
exports.module = module;