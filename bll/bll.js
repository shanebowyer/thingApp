var Q           = require('q');

var module = function(){
	var bllRTU = {
		errorResponse: 
		{
			"error": {
				"code":"401",
				"message":"RTU Error",
				"errors":[
					{
						"locationType":"body",
						"message":"RTU Error",
						"reason":"generalRTUError",
						"locaction":"bllRTU"
					}
				]

			},
			"hiddenErrors":[]
		},
        processRTUMessage: function(req,res){
            var deferred = new Q.defer();

            var apiResponse = {header:{result:{}},content:{}};
            var args = {};
            args.req = req;
            args.res = res;
            args.data = req.body.myData.data;
            args.myPlc = req.myPlc;
            args.settings = req.settings;

            args.myPlc.processMessageIn(args)
            .then(function(args){
                apiResponse.header.result = 'success';
                apiResponse.content = args.data;
                __apiResponder.successResponse(req,res,apiResponse);
                deferred.resolve(apiResponse);
            },function(args){
                apiResponse.header.result = 'error';
                apiResponse.content = args.data;
                __apiResponder.successResponse(req,res,apiResponse);
                deferred.reject(apiResponse);
            });
            return deferred.promise;
        },

        // processAPICall: function(args){
        //     var deferred = new Q.defer();

        //     var apiResponse = {header:{result:{}},content:{}};
        //     var req = args.req;
        //     var myPlc = args.myPlc;
        //     var settings = args.settings;
        //     console.log('api requestOption',req.body.myData.reqOption);
        //     switch(req.body.myData.reqOption){
        //         case('settingsSave'):
        //             debugger;
        //             __settings.saveSettings(args)
        //             .then(function(args){
        //                 apiRespone.header.result = 'success';
        //                 apiRespone.content = args.settings;
        //                 args.data = apiRespone;
        //                 console.log('okay here now');
        //                 deferred.resolve(args);
        //                 return deferred.promise;
        //             }, function(args){
        //                 apiRespone.header.result = 'error';
        //                 apiRespone.content = err;
        //                 args.data = apiRespone;
        //                 deferred.reject(args);
        //                 return deferred.promise;
        //             });
        //             break;
        //         default:
        //             apiRespone.header.result = 'error';
        //             apiRespone.content = 'Error. Not sure which io to read';
        //             args.data = apiRespone;
        //             deferred.reject(args);
        //     }
        //     return deferred.promise;
        // },		
	}

    var bllSettings = {
        errorResponse: 
        {
            "error": {
                "code":"401",
                "message":"RTU Error",
                "errors":[
                    {
                        "locationType":"body",
                        "message":"RTU Error",
                        "reason":"generalRTUError",
                        "locaction":"bllRTU"
                    }
                ]

            },
            "hiddenErrors":[]
        },
        processReadSettings: function(req,res){
            var deferred = new Q.defer();

            var apiResponse = {header:{result:{}},content:{}};

            apiResponse.header.result = 'success';
            apiResponse.content = req.settings;
            __apiResponder.successResponse(req,res,apiResponse);
            deferred.resolve(apiResponse);

            return deferred.promise;
        },
        processSaveSettings: function(req,res){
            var deferred = new Q.defer();

            var apiResponse = {header:{result:{}},content:{}};
            var args = {};
            args.req = req;
            args.res = res;
            args.settings = req.settings;

            __settings.saveSettings(args)
            .then(function(args){
                apiResponse.header.result = 'success';
                apiResponse.content = args.settings;
                __apiResponder.successResponse(req,res,apiResponse);
                deferred.resolve(apiResponse);
            },function(args){
                apiResponse.header.result = 'error';
                apiResponse.content = args.settings;
                __apiResponder.errorResponse(req,res,apiResponse);
                deferred.reject(apiResponse);
            })

            // apiResponse.header.result = 'success';
            // apiResponse.content = args.settings;
            // args.data = apiResponse;
            // deferred.resolve(args);

            return deferred.promise;
        }
    }

	return{
		"rtu":bllRTU,
        "settings":bllSettings
	}
}
exports.module = module;
