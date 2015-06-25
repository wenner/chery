'use strict';
angular.module('chery.services')
    .factory('NewMaintain', function ($resource, $log, $http , $q, $ionicModal , Storage , ENV) {

        var modal;
        $ionicModal.fromTemplateUrl("templates/new.html", {
            animation: "slide-in-up" ,
            backdropClickToClose: true ,
            hardwareBackButtonClose: true
        }).then(function (m) {
                modal = m;
        });

        return {
            show: function(){modal.show()} ,
            hide: function(){alert(111);modal.hide()}
        };
    });
