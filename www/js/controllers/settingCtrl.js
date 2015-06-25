angular.module('chery')
.controller('SettingCtrl', function($scope , $state , ENV) {
    $scope.version = ENV.getConfig().version;
    $scope.logout = function(){
        $state.go("login")
    }
});
