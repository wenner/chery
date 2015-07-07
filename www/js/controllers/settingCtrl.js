angular.module('chery')
.controller('SettingCtrl', function($scope , $state , ENV , User , Storage) {
    $scope.version = ENV.getConfig().version;
    $scope.user = User.info;

    $scope.apis = {type:ENV.apiType};



    $scope.changeApiUrl = function(){
        ENV.changeApiType($scope.apis.type);
    }

    $scope.logout = function(){
        $state.go("login")
    }
});
