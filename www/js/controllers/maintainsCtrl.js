angular.module('chery').controller(
    'MaintainsCtrl',
    function ($scope, $rootScope, $stateParams, $ionicLoading,
              $ionicModal, $timeout, $state, $location, $log ,
              Maintains) {
        $log.debug('maintains ctrl', $stateParams);

        $scope.maintains = Maintains.getMaintains();
        $scope.hasNextPage = Maintains.hasNextPage();
        $scope.loadError = false;
        $log.debug('page load, has next page ? ', $scope.hasNextPage);

        $scope.doRefresh = function() {
            $log.debug('do refresh');
            Maintains.refresh().$promise
                .then(function(response) {
                    $log.debug('do refresh complete');
                    $scope.maintains = response.data.list;
                    $scope.hasNextPage = true;
                    $scope.loadError = false;
                }
                ).finally(function() {
                    $scope.$broadcast('scroll.refreshComplete');
            });
        };

        $scope.showNew = function(){
            alert(222222222222)
        }

        $scope.loadMore = function() {
            $log.debug('load more');
            Maintains.pagination().$promise.then(function(response) {
                    $log.debug('load more complete');
                    $scope.hasNextPage = false;
                    $scope.loadError = false;
                    $timeout(function() {
                        $scope.hasNextPage = Maintains.hasNextPage();
                        $log.debug('has next page ? ', $scope.hasNextPage);
                    }, 100);
                    $scope.maintains = $scope.maintains.concat(response.data.list);
                }
            ).finally(function() {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        };

        /*

         // pagination
         $scope.hasNextPage = Topics.hasNextPage();
         $scope.loadError = false;
         $log.debug('page load, has next page ? ', $scope.hasNextPage);
         $scope.doRefresh = function () {
         Topics.currentTab($stateParams.tab);
         $log.debug('do refresh');
         Topics.refresh().$promise.then(function (response) {
         $log.debug('do refresh complete');
         $scope.topics = response.data;
         $scope.hasNextPage = true;
         $scope.loadError = false;
         }, $rootScope.requestErrorHandler({
         noBackdrop: true
         }, function () {
         $scope.loadError = true;
         })
         ).finally(function () {
         $scope.$broadcast('scroll.refreshComplete');
         });
         };
         $scope.loadMore = function () {
         $log.debug('load more');
         Topics.pagination().$promise.then(function (response) {
         $log.debug('load more complete');
         $scope.hasNextPage = false;
         $scope.loadError = false;
         $timeout(function () {
         $scope.hasNextPage = Topics.hasNextPage();
         $log.debug('has next page ? ', $scope.hasNextPage);
         }, 100);
         $scope.topics = $scope.topics.concat(response.data);
         }, $rootScope.requestErrorHandler({
         noBackdrop: true
         }, function () {
         $scope.loadError = true;
         })
         ).finally(function () {
         $scope.$broadcast('scroll.infiniteScrollComplete');
         });
         };

         // Create the new topic modal that we will use later
         $ionicModal.fromTemplateUrl('templates/newTopic.html', {
         tabs: Tabs,
         scope: $scope
         }).then(function (modal) {
         $scope.newTopicModal = modal;
         });

         $scope.newTopicData = {
         tab: 'share',
         title: '',
         content: ''
         };
         $scope.newTopicId;

         // save new topic
         $scope.saveNewTopic = function () {
         $log.debug('new topic data:', $scope.newTopicData);
         $ionicLoading.show();
         Topics.saveNewTopic($scope.newTopicData).$promise.then(function (response) {
         $ionicLoading.hide();
         $scope.newTopicId = response['topic_id'];
         $scope.closeNewTopicModal();
         $timeout(function () {
         $state.go('app.topic', {
         id: $scope.newTopicId
         });
         $timeout(function () {
         $scope.doRefresh();
         }, 300);
         }, 300);
         }, $rootScope.requestErrorHandler);
         };
         $scope.$on('modal.hidden', function () {
         // Execute action
         if ($scope.newTopicId) {
         $timeout(function () {
         $location.path('/app/topic/' + $scope.newTopicId);
         }, 300);
         }
         });
         // show new topic modal
         $scope.showNewTopicModal = function () {

         // track view
         if (window.analytics) {
         window.analytics.trackView('new topic view');
         }

         if (window.StatusBar) {
         StatusBar.styleDefault();
         }
         $scope.newTopicModal.show();
         };

         // close new topic modal
         $scope.closeNewTopicModal = function () {
         if (window.StatusBar) {
         StatusBar.styleLightContent();
         }
         $scope.newTopicModal.hide();
         };
         */
    }
);
