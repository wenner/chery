angular.module('chery')
.controller('SettingCtrl', function($scope , $state , ENV , User) {
    $scope.version = ENV.getConfig().version;
    $scope.user = User.info;

    $scope.logout = function(){
        $state.go("login")
    }
});
