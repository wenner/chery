angular.module('chery').controller(
    'plansCtrl',
    function ($scope, $rootScope, $stateParams, $ionicLoading,
              $ionicModal, $timeout, $state, $location, $log,
              PlansService) {
        angular.extend($scope, {
            condition: {
                startdate: new Date(),
                enddate: new Date()
            } ,
            plans: [],
            hasNextPage: false,
            isLoading: false,
            doRefresh: function () {
                $scope.isLoading = true;
                PlansService.query()
                    .then(function (response) {
                        $scope.isLoading = false;
                        $scope.plans = PlansService.getPlans();
                    }
                ).finally(function () {
                        $scope.isLoading = false;
                    $scope.$broadcast('scroll.refreshComplete');
                        $scope.$broadcast('scroll.infiniteScrollComplete');

                    });
            } ,
            loadMore: function(){
                $log.debug('load more');
                $timeout(function(){
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                } , 400)
                /*
                PlansService.pagination().$promise.then(function (response) {
                        $log.debug('load more complete');
                        $scope.hasNextPage = false;
                        $scope.loadError = false;
                        $timeout(function () {
                            $scope.hasNextPage = Maintains.hasNextPage();
                            $log.debug('has next page ? ', $scope.hasNextPage);
                        }, 100);
                        $scope.maintains = $scope.maintains.concat(response.data.list);
                    }
                ).finally(function () {
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                    */
            }
        });

        $scope.doRefresh();
    }
);
