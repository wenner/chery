angular.module('chery')
    .controller('AuthCtrl', function ($scope, $rootScope, $state, $log, $timeout, $ionicLoading , User , Storage) {
        angular.extend($scope , {
            user: {password:111} ,
            users: [
                {name:'王翔宇' , code:'wangxiangyu'} ,
                {name:'奇瑞国际部' , code:'chery-gj'} ,
                {name:'奇瑞生产部' , code:'chery-sc'} ,
                {name:'芜湖外代' , code:'whwd'}
            ] ,
            login: function () {
                var name = this.user.name ,
                    password = this.user.password;
                if (!name || !password) {
                    navigator.notification.alert('请填写用户名和密码!');
                    return;
                }
                var user = {
                    name: name,
                    password: password
                };
                $ionicLoading.show({template:"登录验证..."});
                User.login(user).
                    then(function (data) {
                        $ionicLoading.hide();
                        $state.go('tab.plans');
                        //$log.log(Storage.get("user"));
                        //$log.log(User.info);
                    }, function (err , status) {
                        $ionicLoading.hide();
                        navigator.notification.alert(err , "验证失败");
                        $log.error('HTTP error - status:', status, 'Error:', err);
                    });
            }


        })
    });
