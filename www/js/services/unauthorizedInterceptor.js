angular.module("chery")
    .factory("UnauthorizedInterceptor", function ($q, $injector) {
        return {
            responseError: function (rejection) {
                var state = $injector.get("$state");
                console.log("Response error", rejection, state);
                //返回500
                console.log(rejection.status , rejection.data)
                if (500 == rejection.status && rejection.data.indexOf("System.NullReferenceException: 未将对象引用设置到对象的实例") >-1){
                    alert("登录认证已过期,请重新登录!")
                    state.go("login")
                }
                //如果没有验证 但是 当前有过登录
                if (401 === rejection.status && state.current.authenticated){
                    state.go("login")
                }
                return $q.reject(rejection)
            }
        }
    });
