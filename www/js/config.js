"use strict";
angular.module("chery.config", [])
    .constant("$ionicLoadingConfig", {
        template: "请求中..."
    })
    .constant("defaultConfig", {
        version: "1.2.1",
        name: "production",
        debug: !1,
        apiType: "penavico" ,
        apiUrls:{
            ionicproxy: "/ws/" ,
            penavico: "http://10.128.60.49/penavico/ws/" ,
            internet: "http://tbm.penavicotj.com/penavico/ws/"
        }
    })
    .constant('defaultSetting', {
        sendFrom: true,
        saverMode: true
    });