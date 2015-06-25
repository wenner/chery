'use strict';
angular.module('chery.services')
    .factory('ENV', function ($resource, $log, Storage, defaultSetting , defaultConfig) {
        var configKey = 'config' ,
            configs = Storage.set(configKey) || defaultConfig ,
            settingKey = 'settings' ,
            settings = Storage.get(settingKey) || defaultSetting;
        return {
            api: configs.api ,
            getSettings: function () {
                $log.debug('get settings', settings);
                return settings;
            },
            saveSetting: function () {
                Storage.set(settingKey, settings);
            } ,
            getConfig: function(){
                $log.debug('get configs', configs);
                return configs;
            } ,
            saveConfig: function(){
                Storage.set(configKey , configs);
            } ,

            getRemoteStorage: function(){

            }
        };
    });
