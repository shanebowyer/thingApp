var Q       = require('q');


var settings = function(){



	var pubIO = {
		value: '',
		readSettings: function(args){
			var deferred = Q.defer();
			var fs = require('fs');
			var obj;

			// var data = fs.readFileSync(__base + '/config.js', 'utf8');
			//   data = data.replace('var settings = ','');
			//   obj = JSON.parse(data);
			//   pubIO.value = obj;
			//   console.log('init settings');
			//   done();

			fs.readFile(__base + '/config.js', 'utf8', function (err, data) {
			  if (err){
			  	deferred.resolve(args);
			  	return deferred.promise;
			  }
			  data = data.replace('var settings = ','');
			  obj = JSON.parse(data);
			  pubIO.value = obj;
			  console.log('init settings');
			  deferred.resolve(args);
			  // return deferred.promise;
			});

			return deferred.promise;

		},
		writeSettings: function(args){
	        var deferred = Q.defer();
	        var req = args[0];

			var mysettings = req.body.myData.settings;
            var fs = require('fs');
            fs.writeFile(__base + "/config.js", 'var settings = ' + JSON.stringify(mysettings), function(err) {
                if(err) {
                	console.log('error writing settings file');
                    deferred.reject(args);
                    return deferred.promise;
                }
                console.log('finishded saving settings');
                deferred.resolve(args);
            });             
            return deferred.promise;

		},
		getSettings: function(args){
	        var deferred;
    		if(typeof args[3] == 'undefined'){
		        deferred = Q.defer();
    		}
    		else{
				deferred = args[3];
    		}

	        console.log('getSettings');

	        pubIO.readSettings(args)
	        .then(function(args){
				console.log('getSettings1');
        		args.settings = pubIO;
    			deferred.resolve(args);		
	        }, function(args){
	        	console.log('getSettings2');
        		args.settings = pubIO;
    			deferred.reject(args);
	        });
			return deferred.promise;
		},
		backpupSettings: function(args){
			var deferred = Q.defer();

			var fs = require('fs');
			fs.readFile(__base + '/config.js', 'utf8', function (err, data) {
				if (err){
					deferred.resolve(args);
					return deferred.promise;
				}
				console.log('backing up settings');

				var date = new Date();

				var fs1 = require('fs');
				fs1.writeFile(__base + "/config_" + date +".bak", data, function(err) {
				    if(err) {
				    	console.log('error writing settings file');
				        deferred.reject(args);
				        return deferred.promise;
				    }
				    console.log('finishded1 saving settings');
				    deferred.resolve(args);
				});             
			});
		    return deferred.promise;

		},
		saveSettings: function(args){
	        var deferred = Q.defer();
	        args[3] = deferred;
	        pubIO.backpupSettings(args)
	        .then(pubIO.writeSettings,null)
	        .then(pubIO.getSettings,null)
	        .then(function(args){
	    			deferred.resolve(args);		
	        }, function(args){
	    			deferred.reject(args);
	        });
			return deferred.promise;
		}

	};

	//pubIO.getSettings(null,null,null);

	return pubIO;

};

exports.settings = settings;
//module.exports = settings;