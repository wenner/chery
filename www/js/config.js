"use strict";
angular.module("chery.config", [])
    .constant("$ionicLoadingConfig", {
        template: "请求中..."
    })
    .constant("defaultConfig", {
        version: "1.2.1",
        name: "production",
        debug: !1,
        api: "/ws/" ,
        //api: "http://tbm.penavicotj.com/penavico/ws/"
        //api: "http://10.1.115.8:808/api/"
    })
    .constant('defaultSetting', {
        sendFrom: true,
        saverMode: true
    });