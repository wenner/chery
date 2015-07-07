'use strict';
angular
    .module('chery.services')
    .factory('Storage', function ($log) {
        return {
            exists: function(key){
                return !!window.localStorage.getItem(key);
            } ,
            set: function (key, data , isString) {
                return window.localStorage.setItem(key, isString === true ? data : window.JSON.stringify(data));
            },
            get: function (key , isString) {
                var item = window.localStorage.getItem(key);
                return isString === true ? item : (item ? window.JSON.parse(item) : {});
            },
            remove: function (key) {
                return window.localStorage.removeItem(key);
            }
        };
    });

