angular.module('chery').controller(
    'tasksCtrl',
    function ($scope, $rootScope, $stateParams, $ionicLoading, $ionicModal, $timeout, $state, $location, $log, TasksService) {
        angular.extend($scope, {
            plans: TasksService.plans,
            isLoading: false,
            doRefresh: function () {
                $scope.isLoading = true;

                TasksService.getTasks()
                    .then(function (response) {
                        $rootScope.taskCount = response.length;
                        $scope.plans = response;
                    }

                ).finally(function () {
                        $scope.isLoading = false;
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.$broadcast('scroll.infiniteScrollComplete');

                    });
            }
        });

        $scope.doRefresh();
    }
);
