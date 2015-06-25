'use strict';
window.rAF = window.rAF || window.requestAnimationFrame;
//start
angular.module('chery', [
        'ionic' ,
        'ngCordova' ,
        'ngStorage' ,
        'chery.config' ,
        'chery.controllers' ,
        'chery.services'
    ])

    //run
    .run(function ($ionicPlatform, $rootScope, $state, $log, $timeout, $ionicPopup,
                   ENV , Cache , Storage , TasksService , User) {
        User.loadStorage()
        TasksService.getTasks();
        /*
        //下载缓存内容
        Cache.getFromRemote()
            .then(function(isUpdate){
                $log.log(isUpdate ? '缓存更新成功!' : '没有更新!');
            } , function(){
                $log.log('缓存更新失败!');
            });
        */

        // notify
        if (!navigator.notification) {
            navigator.notification = {
                alert: function (message, title) {
                    $ionicPopup.alert({template: message, title: title || '信息'});
                }
            };
        }

        //ready
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }

            //splashScreen
            if (navigator.splashscreen) {
                $timeout(function () {
                    navigator.splashscreen.hide();
                }, 100);
            } else {
                $log.debug('no splash screen plugin');
            }

            $rootScope.$on("$stateChangeStart", function (event, toState) {
                //console.log(toState)
                //如果页面的authenticated == true , 并且没有登录 , 转到welcome
                if (!(toState.authenticated !== true  || AuthenticationService.isAuthenticated(Me))) {
                    $state.go("welcome");
                    event.preventDefault();
                }
                //toState.authenticated !== true || AuthenticationService.isAuthenticated(Me) || ($state.go("welcome"), event.preventDefault())
            });

        });
    })

    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider,
                      $httpProvider) {

        //注入拦截器
        $httpProvider.interceptors.push("UnauthorizedInterceptor");

        $httpProvider.defaults.useXDomain = true;
        $httpProvider.defaults.withCredentials = true;
        delete $httpProvider.defaults.headers.common["X-Requested-With"];
        //$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';


        $httpProvider.defaults.transformResponse = function (data) {
            //通过<root serverdate来判断是否是通过asmx返回的数据
            if (data.indexOf("<root serverdate") == -1) return data;
            var result = {
                isok: false,
                message: "",
                data: null
            };
            var responseRoot = {};
            var parseString = xml2js.parseString;
            parseString(data, {attrkey:"attrs" , mergeAttrs:true , explicitArray:false} , function (err, result) {
                responseRoot = result.root;
            });
            result.isok = responseRoot.status == "succ";
            result.message = responseRoot.message;
            result.data = responseRoot.data;
            result.date = responseRoot.serverdate;
            return result;
        };

        //设置android , ios不同
        $ionicConfigProvider.tabs.position('bottom');
        $ionicConfigProvider.tabs.style('standard');
        $ionicConfigProvider.form.toggle('large');
        $ionicConfigProvider.navBar.alignTitle('center');

        $stateProvider
            //welcome
            .state('welcome', {
                url: '/welcome',
                templateUrl: 'views/welcome.html',
                controller: 'WelcomeCtrl'
            })
            //login
            .state('login', {
                url: '/login',
                templateUrl: 'views/login.html',
                controller: 'AuthCtrl'
            })
            //tabs
            .state('tab', {
                url: "",
                abstract: true,
                templateUrl: "views/tabs.html" ,
                controller: 'TabsCtrl'
            })
            .state('tab.plans' , {
                url: "/plans" ,
                views:{
                    'tabPlans': {
                        templateUrl:"views/plans.html" ,
                        controller: "plansCtrl"
                    }
                }
            })
            .state('tab.tasks' , {
                url: "/tasks" ,
                views: {
                    tabTasks: {
                        templateUrl:"views/tasks.html" ,
                        controller: "tasksCtrl"
                    }
                }
            })
            .state('tab.setting' , {
                url: "/setting" ,
                views:{
                    tabSetting: {
                        templateUrl: 'views/setting.html',
                        controller: 'SettingCtrl'
                    }
                }
            })
            .state('plan' , {
                url: "/plan/{id:int}" ,
                templateUrl: "views/plan.html" ,
                controller: "PlanCtrl"
            })


            /*
            //maintains 病害列表
            .state('tab.maintains', {
                url: '/maintains',
                views: {
                    'tabMaintains': {
                        templateUrl: 'templates/maintains.html',
                        controller: 'MaintainsCtrl'
                    }
                }
            })
            //near 附近
            .state('tab.near', {
                url: '/near',
                views: {
                    'tabNear': {
                        templateUrl: 'templates/near.html',
                        controller: 'NearCtrl'
                    }
                }
            })
            .state('tab.test', {
                url: '/test',
                views: {
                    'tabNear': {
                        templateUrl: 'templates/setting.html'
                    }
                }
            })
            //map 地图浏览
            .state('tab.map', {
                url: '/map',
                views: {
                    'tabMap': {
                        templateUrl: 'templates/map.html',
                        controller: 'MapCtrl'
                    }
                }
            })
            //setting 设置
            .state('tab.setting', {
                url: '/setting',
                views: {
                    'tabSetting': {
                        templateUrl: 'templates/setting.html',
                        controller: 'SettingCtrl'
                    }
                }
            })

            //new 新增病害
            .state('new', {
                url: '/new',
                templateUrl: 'templates/new.html',
                controller: 'NewCtrl'
            })

            //病害详细信息
            .state('maintain', {
                url: '/maintain/:id',
                templateUrl: 'templates/maintain.html',
                controller: "MaintainCtrl"
            })
            */

        $urlRouterProvider.otherwise('/welcome');

    });

angular.module('chery.controllers', [
    'ngCordova' ,
    'chery.services' ,
    'chery.config'
]);
angular.module('chery.services', [
    'chery.config' ,
    'ngResource'
]);
