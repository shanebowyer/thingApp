/**
 * Created by shane on 3/13/15.
 */

var CONFIG;
var SETINGS;


var settings = {
    readConfig: function(){
        var fs = require('fs');
        var file = __base + '/config/config.json';
        var obj = JSON.parse(fs.readFileSync(file,'utf8'));
        CONFIG = obj;
        SETINGS = CONFIG.settings;
    },
    searchSettings: function(search){
        settings.readConfig();
        var arrFound = SETINGS.filter(function(item) {
            return item.description == search;
        });
        return arrFound[0].value;
    }
}

module.exports = settings;