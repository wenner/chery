'use strict';
angular.module('chery.services')
    .factory('ENV', function ($resource, $log, Storage, defaultSetting , defaultConfig) {
        var configKey = 'config' ,
            configs = Storage.set(configKey) || defaultConfig ,
            settingKey = 'settings' ,
            settings = Storage.get(settingKey) || defaultSetting ,
            apiUrl;
        return {
            api: apiUrl ,
            getApi: function(){
                var apiType = Storage.get("apiType" , true);
                if (!apiType) apiType = configs.apiType;
                this.apiType = apiType;
                apiUrl = configs.apiUrls[apiType];
                this.api = apiUrl;
                console.log(this.apiType ,this.api)
            } ,
            changeApiType: function(type){
                Storage.set("apiType" , type , true);
                this.getApi();
            } ,
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
