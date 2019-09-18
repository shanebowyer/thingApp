var moment      = require('moment');

var module = function(){
	var date = {
    toDate: function(aDate){
      return new Date(aDate);
    },

    toIsoDate(aDate) {
      if (typeof aDate == "undefined") {
        var myDate = new Date();
      } else {
        var myDate = aDate;
      };
      var isoDate = new Date(myDate).toISOString();
          isoDate = moment(isoDate).toDate();
      return isoDate;
    },


    stringDate: function(aDate,seperator) {
      seperator = seperator || '-'
      var a = moment(aDate).format();
      var b = moment(a).utc()

      var year = b.year();

      var month = (b.month()+1).toString();
      if(month.length == 1){
        month = '0' + month;
      }

      var day = (b.date()).toString();
      if(day.length == 1){
        day = '0' + day;
      }

      var hour = (b.hour()).toString();
      if(hour.length == 1){
        hour = '0' + hour;
      }

      var minute = (b.minute()).toString();
      if(minute.length == 1){
        minute = '0' + minute;
      }

      var second = (b.second()).toString();
      if(second.length == 1){
        second = '0' + second;
      }


      // return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
      return year + seperator + month + seperator + day + ' ' + hour + ':' + minute + ':' + second;
    },

    stringDateMidnight: function(aDate) {
      var a = moment(aDate).format();
      var b = moment(a).utc()

      var year = b.year();

      var month = (b.month()+1).toString();
      if(month.length == 1){
        month = '0' + month;
      }

      var day = (b.date()).toString();
      if(day.length == 1){
        day = '0' + day;
      }

      var hour = '00';
      var minute = '00';
      var second = '00';

      return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
    },

    fixServerDate: function(reqDate){
      var a = reqDate;
      var b = moment(a).add((a.getTimezoneOffset()/60*-1),'hours');
      var c = b._d;
      var d = c.toUTCString();
      return d;
    },
    applyTimezone: function(reqDate,reqOffset){
      var myDate = new Date(reqDate);
      myDate.setHours(myDate.getHours()+parseInt(reqOffset));
      return myDate;
    },
    getUTC: function(aDate){
      var dateToUse = null;
      if(typeof aDate == 'undefined'){
        dateToUse = new Date();
      } else {
        dateToUse = aDate;
      }
      var serverDate = new Date(dateToUse.valueOf() + dateToUse.getTimezoneOffset() * 60000);
      return serverDate;
    },
    compressDateGlog: function(aDate,aTimezone){
          var vDateValue = 0;


          // console.log('aDate',aDate)
          // console.log('aTimezone',aTimezone)

          var date;
          var timezone = aTimezone || 2;
          // console.log('timezone',timezone)
          // if(typeof(aDate) == 'undefined'){
          //   date = new Date().addHours(timezone);
          // }else{
          //   // date = new Date(aDate).addHours(timezone);
          //   date = new Date().addHours(timezone);
          // }

          var dateNow = new Date();
          var date = aDate || dateNow;
          // console.log('date>>>>>>>>>>>>>>>>>>>>>>>>',date)

          var hour = 0;
          hour = date.getHours();
          hour = (hour < 10 ? "0" : "") + hour;

          var min = 0;
          min  = date.getMinutes();
          min = (min < 10 ? "0" : "") + min;

          var sec = 0;
          sec  = date.getSeconds();
          sec = (sec < 10 ? "0" : "") + sec;

          var year = 0;
          year = date.getFullYear() - 2000;

          var month = 0;
          month = date.getMonth() + 1;
          month = (month < 10 ? "0" : "") + month;

          var day = 0;
          day  = date.getDate();
          day = (day < 10 ? "0" : "") + day;

          vDateValue = year * (Math.pow(2,26));
          vDateValue = vDateValue + (month * (Math.pow(2,22)));
          vDateValue = vDateValue + (day * (Math.pow(2,17)));
          vDateValue = vDateValue + (hour * (Math.pow(2,12)));
          vDateValue = vDateValue + (min * (Math.pow(2,6)));
          vDateValue = vDateValue + (sec * 1);
          // console.log('vDateValue>>>>>>>>>>>',vDateValue)
          return vDateValue;
    },

    unCompressDateGlog: function(timeStamp){
        var tmp, result;

        tmp = (timeStamp >> 26) & 63;
        result = String(tmp + 2000);
        result += '/';

        tmp = (timeStamp >> 22) & 15;
        if (tmp < 10) result += '0';
        result += tmp;
        result += '/';

        tmp = (timeStamp >> 17) & 31;
        if (tmp < 10) result += '0';
        result += tmp;
        result += ' ';

        tmp = (timeStamp >> 12) & 31;
        if (tmp < 10) result += '0';
        result += tmp;
        result += ':';

        tmp = (timeStamp >> 6) & 63;
        if (tmp < 10) result += '0';
        result += tmp;
        result += ':';

        tmp = timeStamp & 63;
        if (tmp < 10) result += '0';
        result += tmp;

        return result;
    },
    unCompressDateGlogOld: function(DateBytes){
          var strYear = '20';
          if(DateBytes[0] < 10){
              strYear = strYear + '0' + DateBytes[0];
          }else{
              strYear = strYear + DateBytes[0];
          }

          var strMonth = '';
          if(DateBytes[1] < 10){
              strMonth = '0' + DateBytes[1];
          }else{
              strMonth = DateBytes[1];
          }

          var strDay = '';
          if(DateBytes[2] < 10){
              strDay = '0' + DateBytes[2];
          }else{
              strDay = DateBytes[2];
          }

          var strHour = '';
          if(DateBytes[3] < 10){
              strHour = '0' + DateBytes[3];
          }else{
              strHour = DateBytes[3];
          }

          var strMinute = '';
          if(DateBytes[4] < 10){
              strMinute = '0' + DateBytes[4];
          }else{
              strMinute = DateBytes[4];
          }

          var strSecond = '';
          if(DateBytes[5] < 10){
              strSecond = '0' + DateBytes[5];
          }else{
              strSecond = DateBytes[5];
          }
          // console.log('strMonth',strMonth)
          if(strMonth == '255'){
              strYear = '2001';
              strMonth = '01';
              strDay = '01';
              strHour = '00';
              strMinute = '00';
              strSecond = '00';
          }

          return (strYear + "/" + strMonth + "/" + strDay + " " + strHour + ":" + strMinute + ":" + strSecond);

    },
	}
	return date;
}
exports.module = module;