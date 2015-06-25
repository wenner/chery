'use strict';
angular.module('chery.services')
    .factory('Cache', function ($resource, $log, $http , $q, Storage , ENV) {
        var cache = {
            caches: {
                storaged: false
            }
        };
        cache.getFromRemote = function (force) {
            var defer = $q.defer() ,
                hasCache = Storage.exists('cache');
            if (hasCache && !force){
                cache.caches = Storage.get("cache");
                cache.storaged = true;
                defer.resolve();
            }else{
                $http
                    .get(ENV.api + 'chery/mobilecache')
                    .success(function (result) {
                        if (!result.isok) {
                            defer.reject(result.message);
                        } else {
                            cache.caches = result.data;
                            Storage.set("cache", result.data);
                            defer.resolve(true);
                        }
                    })
                    .error(function (err, status) {
                        defer.reject(err ? err.error : err, status);
                    });
            }
            return defer.promise;
        };
        cache.get = function(key){
            return cache.caches[key];
        };
        cache.has = function(){
            return cache.storaged;
        }
        return cache;
    });
