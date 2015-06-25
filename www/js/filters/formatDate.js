'use strict';
angular.module('chery')
.filter("formatDate" , function(){
    return function(date, format , atlFormat){
        format = format || "YYYY-MM-DD";
        atlFormat = atlFormat || "YYYY-MM-DD HH:mm:ss";
        if (_.isString(date)){
            if (date == "0-00-00 00:00:00") return null;
            date = moment(date, atlFormat);
        }
        if (_.isDate(date)){
            date = moment(date);
        }
        if (_.isBoolean(format)) return date;
        return date.format(format);
    };
})