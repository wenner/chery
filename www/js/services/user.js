angular.module('chery.services')
    .factory('User', function($log, $resource , $http , $q, Storage , ENV) {
        var userDefer = $q.defer();
        var user = {
            loadingPromise: userDefer.promise,
            info: {},
            notis: {},
            favoritesCount: 0
        };
        user.login = function(userInfo) {
            var defer = $q.defer();
            var loginParams = {
                u_name: userInfo.name ,
                u_pass: userInfo.password
            };

            $http
                .post(ENV.api + 'admin.asmx/CheckLogin', loginParams)
                .success(function(result){
                    console.log(result)
                    if (!result.isok){
                        defer.reject(result.message);
                    }else{
                        user.info = result.data.user.RowSet.R;
                        Storage.set("user" , user.info);
                        defer.resolve(user.info);
                    }
                })
                .error(function(err , status){
                    alert("error")
                    defer.reject(err ? err.error : err, status);
                });
            return defer.promise;
        };
        user.loadStorage = function(){
            if (Storage.exists("user")) user.info = Storage.get("user");
        };

        return user;
    });
