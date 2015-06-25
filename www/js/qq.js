var Adjust = {
    trackEvent: function () {
    },
    trackRevenue: function () {
    }
};

ionic.Platform.ready(function ($ionicPlatform) {
    //相当于ng-app='runway'
    angular.bootstrap(document.body, ["runway"]);
    //如果是webview就隐藏splashscreen
    ionic.Platform.isWebView() && navigator.splashscreen.hide()
});

//module: templates-main
angular.module("templates-main", []);

angular.module("runway", ["ionic", "ngCordova", "angularMoment", "localytics", "hockeyapp", "mallzee.ionic", "mallzee.service", "mallzee.filters", "mallzee.images", "mallzee.services.unknownstates", "runway.controllers", "runway.services", "templates-main"]);


angular.module("runway")
    .constant("BaseUrl", "http://runway.mallzee.com");

//service: me
angular.module("runway")
    .provider("Me", [function () {
        this.$get = ["Base", "User", function (base, user) {
            var c = base.store.get("me") ? new user(base.store.get("me")) : new user;
            return c
        }]
    }]);

//service: networkactivity
angular.module("runway")
    .factory("NetworkActivity", function ($cordovaDialogs) {
        var c = $cordovaDialogs;

        function d() {
            c.alert("Your appear to be offline. Please try later")
        }

        var e = _.throttle(d, 3e4, {
                trailing: !1
            }),
            f = {
                enabled: !1,
                activityOffline: e,
                activityStop: function () {
                },
                activityStart: function () {
                }
            };
        return "NetworkActivity" in b && (a.copy(NetworkActivity, f), f.enabled = !0, f.activityOffline = e),
            f
    });


//service: pushState
angular.module("runway")
    .factory("PushState", function ($rootScope, $state) {
        var a = $rootScope , b = $state;
        return a.$on("notification.push",
            function (a, c) {
                if (!c.foreground) switch (c.state) {
                    case "tab.saved":
                        b.go("tab.saved");
                        break;
                    case "tab.stylefeeds":
                        b.go("tab.stylefeeds");
                        break;
                    case "tab.brands":
                        b.go("tab.brands")
                }
            }),
        {}
    });


//interceptor: unauthorizedinterceptor
//用户验证
angular.module("runway")
    .factory("UnauthorizedInterceptor", function ($q, $injector) {
        return {
            responseError: function (rejection) {
                var state = $injector.get("$state");
                console.log("Response error", rejection, state);
                //如果没有验证 但是 当前有过登录
                if (401 === rejection.status && state.current.authenticated) {
                    state.go("login")
                }
                return $q.reject(rejection)
            }
        }
    });

//config
angular.module("runway")
    .config(function ($urlRouterProvider, $sceProvider, $httpProvider, $hockeyappProvider, $ionicConfigProvider, MallzeeServiceProvider) {

        $sceProvider.enabled(false);
        //默认页
        $urlRouterProvider.otherwise("/inspiration");

        //注入拦截器
        $httpProvider.interceptors.push("UnauthorizedInterceptor");
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common["X-Requested-With"];

        $hockeyappProvider.setAppId("360b490473aa28593f67b208c53d8cc3"),

            //设置baseurl
            MallzeeServiceProvider.setBaseUrl("https://api.mallzee.com/")
    });


//app.run
angular.module("runway")
    .run(function ($rootScope, $state, $window, $cordovaStatusbar, $cordovaPush, Me, Base, PushState, AuthenticationService, BrandsResource, UserProductsResource, StyleFeedsResource, OpenUrlService) {
        /*
         var a = $rootScope , 
         c = $state , 
         d = $window , 
         e = $cordovaStatusbar , 
         f = $cordovaPush , 
         g = Me , 
         h = PushState , 
         i = AuthenticationService;
         */

        //如果已经登录了,设置header
        AuthenticationService.load(Me);

        Me.refresh().then(function (a) {
            console.log("Me", a);
            a.settings.swipes = 0
        });

        //event, toState, toParams, fromState, fromParams
        $rootScope.$on("$stateChangeStart", function (event, toState) {
            //如果页面的authenticated == true , 并且没有登录 , 转到welcome
            if (!(toState.authenticated !== true || AuthenticationService.isAuthenticated(Me))) {
                $state.go("welcome");
                event.preventDefault();
            }
            //toState.authenticated !== true || AuthenticationService.isAuthenticated(Me) || ($state.go("welcome"), event.preventDefault())
        });
        ////?????
        $rootScope.openLink = function (a) {
            var c = b.open(a, "_blank", "location=no,closebuttoncaption=Back to Mallzee");
            c.addEventListener("exit", function () {
                $cordovaStatusbar.overlaysWebView(!0);
                $cordovaStatusbar.style(1);
                $cordovaStatusbar.show()
            })
        }

        //fb登录插件
        if (ionic.Platform.isWebView()) {
            facebookConnectPlugin.getLoginStatus(function (a) {
                Me.facebookStatus = a
            }, function (a) {
                console.log("Facebook status error", a)
            });
        }

        //全局事件notification.push , 应该是通过$broadcast触发
        $rootScope.$on("notification.push", function (a, b) {
            "tab.brand" !== b.state || b.foreground || setTimeout(function () {
                $state.go("tab.brands");
                setTimeout(function () {
                    $state.go("tab.products-brand", {brand: b.brand})
                })
            })
        });

    });

//service: hockeyapp
angular.module("hockeyapp", []).provider("$hockeyapp", [function () {
        var b = {
            start: function (a, b, c) {
                console.log("[hockeyapp][init]", c, a, b)
            },
            feedback: function (a, b) {
                console.log("[hockeyapp][feedback]", a, b)
            }
        };
        this.appId = "",
            this.successFn = function () {
            },
            this.errorFn = function () {
            },
            this.setAppId = function (a) {
                this.appId = a
            },
            this.$get = [function () {
                "hockeyapp" in window && (b = window.hockeyapp);
                if (this.appId) {
                    b.start(this.successFn, this.errorFn, this.appId)
                    document.addEventListener("backbutton", function () {
                    }, false);
                } else {
                    console.log("[HockeyApp][Error] No app id set")
                }
                return b
            }]
    }])
    .run(function ($hockeyapp) {
    });

//service: Model
angular.module("mallzee.models", ["mallzee.base"])
    .factory("Model", function (Base) {
        var a = Base;

        function model(a, b) {
            this.setData(a);
            this.$$identifier = b || "_id"
        }

        model.prototype.setData = function (a) {
            for (var b in a) this[b] = a[b];
            return this
        }
        model.prototype.configure = function (a) {
            this.$$path = a
        }
        model.prototype.getUrl = function () {
            return a.getBaseUrl() + this.$$path
        }
        model.prototype.getPath = function () {
            return this.$$path
        }
        model.prototype.save = function (a, b, c) {
            return this[this.$$identifier] ? this.update(a, b, c) : this.create(a, b, c)
        }
        model.prototype.refresh = function () {
            var b = this;
            return Base.request("GET", this.$$path + "/" + this[this.$$identifier]).then(function (a) {
                return b.setData(a.data)
            })
        }
        model.prototype.create = function (b, c, d) {
            var e = this;
            return a.request("POST", this.$$path, this, b, c, d).then(function (a) {
                return e.setData(a.data)
            })
        }
        model.prototype.update = function (b, c, d) {
            var e = this;
            return a.request("PUT", this.$$path + "/" + this[this.$$identifier], this, b, c, d).then(function (a) {
                return e.setData(a.data)
            })
        }
        model.prototype.destroy = function () {
            return this[this.$$identifier] ? a.request("DELETE", this.$$path + "/" + this[this.$$identifier]).then(function (a) {
                return a.data
            }) : void 0
        }
        return model;
    }) ,

    function (a) {
        "use strict";
        function b(b) {
            a.forEach(b, function (a, c) {
                "$" === c[0] && "$" === c[1] && delete b[c]
            })
        }

        var d = {
            baseUrl: "https://api.mallzee.com/",
            headers: {
                "Accept-Version": "1.0.0"
            },
            version: "1.0.0"
        };
        //service: Base
        angular.module("mallzee.base", []).service("Base", function ($window, $http) {
            return {
                getBaseUrl: function () {
                    return d.baseUrl
                },
                getHeader: function (a) {
                    return d.headers[a]
                },
                setHeader: function (a, b) {
                    return d.headers[a] = b
                },
                removeHeader: function (a) {
                    delete d.headers[a]
                },
                request: function (method, url, data, params, headers, options) {
                    if (headers) {
                        angular.extend(headers, d.headers)
                    } else {
                        headers = d.headers;
                    }
                    var k;
                    if (data) {
                        k = {};
                        angular.copy(data, k);
                        b(k);
                    }
                    var l = {
                        method: method,
                        url: d.baseUrl + url,
                        data: k,
                        params: params,
                        headers: headers
                    };
                    if (options) {
                        angular.extend(options, l)
                    } else {
                        options = l;
                    }
                    return $http(options)
                },
                store: {
                    get: function (a) {
                        return JSON.parse($window.localStorage.getItem(a))
                    },
                    set: function (b, d) {
                        return d = a.isObject(d) ? JSON.stringify(d) : d,
                            $window.localStorage.setItem(b, d)
                    },
                    remove: function (a) {
                        $window.localStorage.removeItem(a)
                    },
                    clear: function () {
                        $window.localStorage.clear()
                    }
                }
            }
        });

        //service: MallzeeService
        angular.module("mallzee.service", ["mallzee.base", "mallzee.models", "mallzee.resources", "mallzee.services"]).provider("MallzeeService", function () {
            this.getBaseUrl = function () {
                return d.baseUrl
            }
            this.setBaseUrl = function (a) {
                d.baseUrl = a
            }
            this.getHeaders = function () {
                return d.headers
            }
            this.setHeaders = function (a) {
                d.headers = a
            }
            this.getVersion = function () {
                return d.version
            }
            this.setVersion = function (a) {
                d.headers["Accept-Version"] = a
            }
            this.$get = ["Base", "Resource", function (a, Resource) {
                var c = this;
                return {
                    getBaseUrl: this.getBaseUrl,
                    setBaseUrl: this.setBaseUrl,
                    resource: function (a, c) {
                        return new Resource(a, c)
                    }
                }
            }]
        });

    }(angular),


    function (a, b) {
        "use strict";
        var c = function (c, d, e) {
            var f;
            return f = function () {
                function f(b, c, e, f) {
                    this.$$path = b,
                        this.$$model = c,
                        this.$$cache = e || !1,
                        this.$$identifier = f || "_id";
                    var g = {
                        records: [],
                        item: {},
                        count: 0,
                        hasMore: !1
                    };
                    this.$$cache && (g = d.store.get("mallzee/" + this.$$path) || g),
                        this.data = {
                            records: this._hydrateRecords(g.records),
                            item: this.new(g.item),
                            count: g.count,
                            hasMore: g.hasMore
                        },
                        this.new = a.bind(this, this.new),
                        this.find = a.bind(this, this.find),
                        this.save = a.bind(this, this.save),
                        this.get = a.bind(this, this.get),
                        this.getUrl = a.bind(this, this.getUrl)
                }

                return f.prototype.new = function (b) {
                    if (!b) return {};
                    var c = new this.$$model,
                        d = new e(b, this.$$identifier);
                    return d.$$path = this.$$path,
                        this.item = a.extend(c, d),
                        this.item
                },
                    f.prototype.get = function (a, e) {
                        var f = this,
                            g = {};
                        g[f.$$identifier] = a;
                        var h = b.find(f.data.records, g);
                        if (h) {
                            f.data.item = h;
                            var i = c.defer();
                            return e ? h.refresh().then(function () {
                                i.resolve(h)
                            }) : i.resolve(h),
                                i.promise
                        }
                        return d.request("GET", this.$$path + "/" + a).then(function (a) {
                            return f.new(a.data)
                        })
                    },
                    f.prototype.find = function (b) {
                        var c = this;
                        return d.request("GET", this.$$path, null, b).then(function (b) {
                            var e = [];
                            return a.forEach(b.data.records,
                                function (a) {
                                    e.push(c.new(a))
                                }),
                                c.data.records = b.data.records = e,
                                c.data.count = b.data.count,
                                c.data.hasMore = b.data.has_more || c.data.count > c.data.records.length,
                                c.$$cache && d.store.set("mallzee/" + c.$$path, c),
                                b.data
                        })
                    },
                    f.prototype.save = function (a) {
                        return a instanceof e ? (a._id || this.data.records.push(a), a.save().then(function (b) {
                            return a._id = b._id,
                                a.updated_at = b.updated_at,
                                a.created_at = b.created_at,
                                b
                        })) : void 0
                    },
                    f.prototype.remove = function (a) {
                        var c = {};
                        c[this.$$identifier] = a[this.$$identifier],
                            b.remove(this.data.records, c)
                    },
                    f.prototype.destroy = function (a) {
                        var b = this;
                        return a instanceof e ? (b.remove(a), a.destroy().then().
                            catch(function () {
                                console.log("There was a problem, injecting model back into collection"),
                                    b.data.records.push(a)
                            })) : void 0
                    },
                    f.prototype.getUrl = function () {
                        return d.getBaseUrl() + this.$$path
                    },
                    f.prototype._hydrateRecords = function (a) {
                        var b = [];
                        if (!a || 0 === a.length) return [];
                        for (var c = 0; c < a.length; c++) b.push(this.new(a[c]));
                        return b
                    },
                    f
            }()
        };
        a.module("mallzee.resources", ["mallzee.models"]).service("Resource", ["$q", "Base", "Model", c])
    }(angular, _),
    function () {
        "use strict";
        angular.module("mallzee.services", ["mallzee.models"])
    }(),
    function (a) {
        "use strict";
        function b(a, b) {
            var c, d = "brands";
            return c = function () {
                function c(a) {
                    this.configure(d),
                        b.call(this, a)
                }

                return c.prototype = new b,
                    c.prototype.constructor = c,
                    c.prototype.toggleFavourite = function () {
                        var b = this;
                        return b.status && "hidden" !== b.status ? (delete b.status, a.request("DELETE", d + "/" + this[this.$$identifier] + "/favourite").then(function (a) {
                            return a.data
                        })) : (b.status = "favourite", a.request("POST", d + "/" + this[this.$$identifier] + "/favourite").then(function (a) {
                            return a.data
                        }))
                    },
                    c.prototype.toggleHidden = function () {
                        var b = this;
                        return b.status && "favourite" !== b.status ? (delete b.status, a.request("DELETE", d + "/" + this[this.$$identifier] + "/hide").then(function (a) {
                            return a.data
                        })) : (b.status = "hidden", a.request("POST", d + "/" + this[this.$$identifier] + "/hide").then(function (a) {
                            return a.data
                        }))
                    },
                    c
            }()
        }

        a.module("mallzee.models").service("Brand", ["Base", "Model", b])
    }(angular),
    function (a) {
        "use strict";
        function b(a) {
            var b, c = "collections";
            return b = function () {
                function b(b) {
                    this.configure(c),
                        a.call(this, b)
                }

                return b.prototype = new a,
                    b.prototype.constructor = b,
                    b
            }()
        }

        a.module("mallzee.models").service("Collection", ["Model", b])
    }(angular),
    function (a) {
        "use strict";
        function b(a) {
            var b, c = "devices";
            return b = function () {
                function b(b) {
                    a.call(this, b, "uuid"),
                        this.configure(c)
                }

                return b.prototype = new a,
                    b.prototype.constructor = b,
                    b
            }()
        }

        a.module("mallzee.models").service("Device", ["Model", b])
    }(angular),
    function (a) {
        "use strict";
        function b(a) {
            var b, c = "friends";
            return b = function () {
                function b(b) {
                    this.configure(c),
                        a.call(this, b)
                }

                return b.prototype = new a,
                    b.prototype.constructor = b,
                    b
            }()
        }

        a.module("mallzee.models").service("Friend", ["Model", b])
    }(angular),
    function (a) {
        "use strict";
        function b(a) {
            var b, c = "invites";
            return b = function () {
                function b(b) {
                    this.configure(c),
                        a.call(this, b)
                }

                return b.prototype = new a,
                    b.prototype.constructor = b,
                    b
            }()
        }

        a.module("mallzee.models").service("Invite", ["Model", b])
    }(angular),
    function (a) {
        "use strict";
        function b(a) {
            var b, c = "merchants";
            return b = function () {
                function b(b) {
                    this.configure(c),
                        a.call(this, b)
                }

                return b.prototype = new a,
                    b.prototype.constructor = b,
                    b
            }()
        }

        a.module("mallzee.models").service("Merchant", ["Model", b])
    }(angular),
    function (a) {
        "use strict";
        function b(a) {
            var b, c = "notifications";
            return b = function () {
                function b(b) {
                    this.configure(c),
                        a.call(this, b)
                }

                return b.prototype = new a,
                    b.prototype.constructor = b,
                    b
            }()
        }

        a.module("mallzee.models").service("Notification", ["Model", b])
    }(angular),
    function (a) {
        "use strict";
        function b(a, b, c, d) {
            var e, f = "products";
            return e = function () {
                function e(a) {
                    this.configure(f),
                        b.call(this, a)
                }

                return e.prototype = new b,
                    e.prototype.constructor = e,
                    e.prototype.hide = function (b) {
                        return a.request("POST", f + "/" + this[this.$$identifier] + "/hide", b).then(function (a) {
                            return a.data
                        })
                    },
                    e.prototype.save = function (b) {
                        return a.request("POST", f + "/" + this[this.$$identifier] + "/save", b).then(function (a) {
                            return a.data
                        })
                    },
                    e.prototype.share = function (b) {
                        return a.request("POST", f + "/" + this[this.$$identifier] + "/share", b).then(function (a) {
                            return new c(a.data)
                        })
                    },
                    e.prototype._convertPrice = function (a) {
                        if (!this.price) return "";
                        switch (this.price.currency) {
                            case "GBP":
                                return d("currency")(this.price[a], "£");
                            case "USD":
                            case "AUS":
                                return d("currency")(this.price[a], "$");
                            case "EUR":
                                return d("currency")(this.price[a], "€");
                            default:
                                return this.price[a]
                        }
                    },
                    Object.defineProperty(b.prototype, "cost", {
                        get: function () {
                            return this._convertPrice("current")
                        },
                        set: function () {
                        }
                    }),
                    Object.defineProperty(b.prototype, "sale", {
                        get: function () {
                            return this._convertPrice("sale")
                        },
                        set: function () {
                        }
                    }),
                    Object.defineProperty(b.prototype, "originalCost", {
                        get: function () {
                            return this._convertPrice("original")
                        },
                        set: function () {
                        }
                    }),
                    Object.defineProperty(b.prototype, "isOnSale", {
                        get: function () {
                            return this.price.original > this.price.current
                        },
                        set: function () {
                        }
                    }),
                    e
            }()
        }

        a.module("mallzee.models").service("Product", ["Base", "Model", "ShortCode", "$filter", b])
    }(angular),
    function (a) {
        "use strict";
        function b(b) {
            var c, d = "short-codes";
            return c = function () {
                function c(c) {
                    b.call(this, c, "short_code"),
                        this.configure(d);
                    var e = a.injector(["mallzee.service", "ng"]);
                    if (this.type) {
                        var f = e.get(this.type.charAt(0).toUpperCase() + this.type.slice(1));
                        this.content = new f(this.content)
                    }
                }

                return c.prototype = new b,
                    c.prototype.constructor = c,
                    c
            }()
        }

        a.module("mallzee.models").service("ShortCode", ["Model", b])
    }(angular),
    function (a) {
        "use strict";
        function b(a) {
            var b = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
            return b.test(a)
        }

        function c(c) {
            var d, e = "style-feeds",
                f = {
                    brand: [],
                    colour: [],
                    type: [],
                    gender: null,
                    min_price: null,
                    max_price: null
                };
            return d = function () {
                function d(b) {
                    this.configure(e),
                        this.filter = {},
                        a.copy(f, this.filter),
                        c.call(this, b)
                }

                return d.prototype = new c,
                    d.prototype.constructor = d,
                    d.prototype.save = function (a, d) {
                        var e;
                        if (b(this.image) && delete this.image, this.image) var d = {
                                "Content-Type": void 0
                            },
                            e = {
                                transformRequest: function (a) {
                                    if (a.image) {
                                        var b = new FormData;
                                        return b.append("image", a.image),
                                            delete a.image,
                                            b.append("json", JSON.stringify(a)),
                                            b
                                    }
                                    return a
                                }
                            };
                        return c.prototype.save.call(this, a, d, e)
                    },
                    d.prototype.addImage = function (a) {
                        this.image = a
                    },
                    d.prototype.clear = function (b) {
                        a.copy(f, this.filter),
                            b && (this.filter.gender = b)
                    },
                    d
            }()
        }

        a.module("mallzee.models").service("StyleFeed", ["Model", c])
    }(angular),
    function (a) {
        "use strict";
        function b(b, c, d, e) {
            var f, g = "user-products";
            return f = function () {
                function c(c) {
                    d.call(this, c),
                        this.configure(g),
                        this.share = a.bind(this, this.share),
                        this.share = function (a) {
                            return this.p_id ? b.request("POST", "products/" + this.p_id + "/share", a).then(function (a) {
                                return new e(a.data)
                            }) : void 0
                        },
                        c instanceof d && (this.p_id = c._id, delete this._id)
                }

                return c.prototype = new d,
                    c.prototype.constructor = c,
                    c
            }()
        }

        a.module("mallzee.models").service("UserProduct", ["Base", "Model", "Product", "ShortCode", b])
    }(angular),


    function () {
        "use strict";
        angular.module("mallzee.resources").factory("Authentication", ["MallzeeRestangular", "localStorageService",
            function (a, b) {
                return {
                    isAuthenticated: function () {
                        console.log("Is authenticated?", b.get("authenticated"), b.cookie.get("session"));
                        return false;
                    },
                    authenticate: function (c) {
                        var d = a.all("login").post(c);
                        return d.then(function () {
                                b.set("authenticated", !0)
                            },
                            function (a) {
                                console.log("Service error", a)
                            }),
                            d
                    },
                    logout: function () {
                        var c = a.one("logout", "").get();
                        return c.then(function () {
                                b.remove("authenticated")
                            },
                            function () {
                                b.remove("authenticated")
                            }),
                            c
                    }
                }
            }])
    }(),
    function (a) {
        "use strict";
        a.module("mallzee.resources").service("BrandsResource", ["Resource", "Brand",
            function (a, b) {
                return new a("brands", b, !0)
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("mallzee.resources").service("CollectionsResource", ["Resource", "Collection",
            function (a, b) {
                return new a("collections", b)
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("mallzee.resources").service("DevicesResource", ["Resource", "Device",
            function (a, b) {
                return new a("devices", b)
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("mallzee.resources").service("FriendsResource", ["Resource", "Friend",
            function (a, b) {
                return new a("friends", b)
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("mallzee.resources").service("InvitesResource", ["Resource", "Invite",
            function (a, b) {
                return new a("invites", b)
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("mallzee.resources").service("MerchantsResource", ["Resource", "Merchant",
            function (a, b) {
                return new a("merchants", b)
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("mallzee.resources").service("NotificationsResource", ["Resource", "Notification",
            function (a, b) {
                return new a("notifications", b, !0)
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("mallzee.resources").service("ProductsResource", ["Resource", "Product",
            function (a, b) {
                var c = new a("products", b);
                return c.hide = function (a, b) {
                    var c = this;
                    return c.remove(a),
                        a.hide(b).then(function () {
                            },
                            function () {
                                c.data.records.push(a)
                            })
                },
                    c.save = function (a, b) {
                        var c = this;
                        return c.remove(a),
                            a.save(b).then(function () {
                                },
                                function () {
                                    c.data.records.push(a)
                                })
                    },
                    c
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("mallzee.resources").factory("RegistrationService", ["MallzeeRestangular",
            function (a) {
                return {
                    register: function (b) {
                        var c = a.all("register");
                        c.post(b).then(function (a) {
                                console.log("Registration succeeded", a)
                            },
                            function (a) {
                                console.log("Registration failed", a.status)
                            })
                    }
                }
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("mallzee.resources").service("ShortCodesResource", ["Resource", "ShortCode",
            function (a, b) {
                return new a("short-codes", b, !1, "short_code")
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("mallzee.resources").service("StyleFeedsResource", ["Resource", "StyleFeed",
            function (a, b) {
                return new a("style-feeds", b, !0)
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("mallzee.resources").service("UserProductsResource", ["Resource", "UserProduct",
            function (a, b) {
                return new a("user-products", b, !0)
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("mallzee.resources").service("UsersResource", ["Resource", "User",
            function (a, b) {
                return new a("users", b)
            }])
    }(angular),


//service: AuthenticationService
    angular.module("mallzee.services").factory("AuthenticationService", function ($rootScope, Base, User) {
        var a = $rootScope , b = Base , c = User;
        var d = "authenticate";
        return {
            authenticate: function (e) {
                return Base.request("POST", d, e).then(function (d) {
                        d.data.token && (b.store.set("Authorization", "Bearer " + d.data.token), b.setHeader("Authorization", "Bearer " + d.data.token));
                        var e = new c(d.data);
                        return b.store.set("me", e),
                            a.$broadcast("user.authenticated", e),
                            e
                    },
                    function (a) {
                        throw Error(a)
                    })
            },
            isAuthenticated: function (me) {
                return Base.getHeader("Authorization") === "Bearer " + me.token
            },
            //设置header
            load: function (me) {
                if (me.token) {
                    Base.setHeader("Authorization", "Bearer " + me.token);
                    ///todo: 这里事件没触发
                    $rootScope.$broadcast("user.authenticated", me)
                }
            },
            ping: function () {
                return b.request("GET", "me").then(function () {
                        return !0
                    },
                    function () {
                        return !1
                    })
            },
            forgottenPassword: function (a) {
                return b.request("POST", "forgotten-password", {
                    email: a
                }).then(function (a) {
                        return a.data
                    })
            },
            resetPassword: function (a, c) {
                return b.request("POST", "reset-password", {
                    token: a,
                    password: c
                }).then(function (a) {
                        return a.data
                    })
            },
            destroy: function () {
                return b.removeHeader("Authorization"),
                    b.store.clear()
            },
            getUrl: function () {
                return b.getBaseUrl() + d
            }
        }
    }) ,


    function (a) {
        "use strict";
        a.module("mallzee.services").service("FiltersService", ["$q", "Base", "Brand", "StyleFeed", "ProductsResource",
            function (b, c, d, e, f) {
                function g(b, c) {
                    a.extend(c.filter, b.data.filters)
                }

                var h, i, j = "filters",
                    k = {
                        brand: [],
                        colour: [],
                        type: []
                    },
                    l = {
                        count: 0,
                        min_limit: 0,
                        max_limit: 0
                    };
                h = {
                    filter: {},
                    metadata: {}
                },
                    i = {
                        filter: {},
                        metadata: {}
                    },
                    h.gender = "male",
                    i.gender = "female";
                var m = {},
                    n = {},
                    o = {},
                    p = {},
                    q = !1;
                a.extend(h.filter, k),
                    a.extend(h.metadata, l),
                    a.extend(i.filter, k),
                    a.extend(i.metadata, l);
                var r = {
                        male: h,
                        female: i
                    },
                    s = function (a) {
                        return c.request("GET", j, null, a)
                    },
                    t = function () {
                        var a = [];
                        return void 0 === gender && (gender = !0),
                            (gender || "male" === gender) && a.push(c.request("GET", j + "?gender=male").then(function (a) {
                                return g(a, h),
                                    a.data
                            })),
                            (gender || "female" === gender) && a.push(c.request("GET", j + "?gender=female").then(function (a) {
                                return g(a, i),
                                    a.data
                            })),
                            b.all(a)
                    },
                    u = function (a) {
                        var d = [];
                        return void 0 === a && (a = !0),
                            (a || "male" === a) && d.push(c.request("GET", j + "?gender=male").then(function (a) {
                                return g(a, h),
                                    a.data
                            })),
                            (a || "female" === a) && d.push(c.request("GET", j + "?gender=female").then(function (a) {
                                return g(a, i),
                                    a.data
                            })),
                            b.all(d)
                    },
                    v = function (b) {
                        return q = !0,
                            f.find(E(b.filter)).then(function (c) {
                                return a.extend(b, c),
                                    q = !1,
                                    c
                            })
                    },
                    w = function (a, b, c) {
                        var d = _.find(a[b], {
                            key: c.key
                        });
                        d && (d.selected = !d.selected)
                    },
                    x = function (b, c) {
                        _.forEach(c,
                            function (c, d) {
                                a.isArray(c) && ("brand" === d ? _.forEach(c,
                                    function (a) {
                                        y(b, a, d, "_id")
                                    }) : _.forEach(c,
                                    function (a) {
                                        y(b, a, d, "key")
                                    }))
                            })
                    },
                    y = function (a, b, c, d) {
                        var e = {};
                        e[d] = b;
                        var f = _.find(a[c], e);
                        f && (f.selected = !0)
                    },
                    z = function () {
                        return filter
                    },
                    A = function (a) {
                        function b(a) {
                            a.selected && delete a.selected
                        }

                        _.forEach(a.filter.brand, b),
                            _.forEach(a.filter.colour, b),
                            _.forEach(a.filter.type, b),
                            a.filter.min_price = a.metadata.min_price,
                            a.filter.max_price = a.metadata.max_price,
                            a.filter.search = "",
                            a.metadata.selection = !1,
                            v(a)
                    },
                    B = function (b) {
                        _.isEmpty(n) && (n.min_price = b.min_price, n.max_price = b.max_price, a.copy(b, o)),
                            m = b
                    },
                    C = function (b) {
                        return a.copy(r[b])
                    },
                    D = function (a) {
                        p = a
                    },
                    E = function (a) {
                        return a ? {
                            search: a.search || "",
                            brand: _.pluck(_.where(a.brand, {
                                selected: !0
                            }), "key"),
                            colour: _.pluck(_.where(a.colour, {
                                selected: !0
                            }), "key"),
                            type: _.pluck(_.where(a.type, {
                                selected: !0
                            }), "key"),
                            min_price: a.min_price,
                            max_price: a.max_price,
                            b_id: a.b_id,
                            style_feed: a.style_feed
                        } : {}
                    },
                    F = function () {
                        var a = " ",
                            b = "",
                            c = !1,
                            d = 30,
                            e = this.getQuery();
                        return e.search && e.search.length > 0 && (a += e.search, b = " in "),
                            e.colour && e.colour.length > 0 && (c || (a += b, c = !0), a += e.colour.splice(0, 2).join(" & "), a += " "),
                            e.brand && e.brand.length > 0 && (c || (a += b, c = !0), a += e.brand.splice(0, 2).join(" & "), a += " "),
                            e.type && e.type.length > 0 && (c || (a += b, c = !0), a += e.type.splice(0, 2).join(" & "), a += " "),
                            a.length > d && (a = "Multiple Filters"),
                            " " === a && (a = "Discovery"),
                            a
                    };
                return {
                    clear: A,
                    filter: m,
                    getFilter: z,
                    getFilterForGender: C,
                    getQuery: E,
                    getUrl: function () {
                        return c.getBaseUrl() + j
                    },
                    humanise: F,
                    loading: q,
                    metadata: n,
                    products: p,
                    preload: t,
                    query: s,
                    refresh: u,
                    setFilter: B,
                    setProducts: D,
                    setSelections: x,
                    toggleFilterSelection: w,
                    updateProducts: v
                }
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("mallzee.services").factory("RegistrationService", ["Base", "User",
            function (a, b) {
                var c = "register",
                    d = function (d) {
                        return a.request("POST", c, d).then(function (c) {
                            c.data.token && (a.store.set("Authorization", "Bearer " + c.data.token), a.setHeader("Authorization", "Bearer " + c.data.token));
                            var d = new b(c.data);
                            return a.store.set("me", d),
                                d
                        })
                    };
                return {
                    register: d,
                    getUrl: function () {
                        return a.getBaseUrl() + c
                    }
                }
            }])
    }(angular),
    function (a) {
        a.module("runway.config", []).constant("API_URL", "https://api.mallzee.com").constant("MP_ID", "f9b291f6d8b920ec4e941fdfbda9dfdb").constant("FB_ID", "312702818844146")
    }(angular),


    function (a) {
        "use strict";
        a.module("runway").service("BrandsService", ["$q", "BrandsResource",
            function (b, c) {
                var d, e = {},
                    f = function () {
                        var f = 36e5,
                            g = b.defer(),
                            h = function () {
                                c.find().then(function (b) {
                                        g.resolve(a.extend(e, b))
                                    },
                                    function () {
                                        g.reject()
                                    })
                            };
                        return d = d ? d : _.throttle(h, f),
                            d(),
                            g.promise
                    };
                return {
                    brands: e,
                    getBrands: f
                }
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("runway.services.camera", []).service("CameraService", ["$q", "$cordovaCamera",
            function (a, b) {
                var c = "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCABWAFIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD8RkOR7/WpYwdv+19ahVwByOakjk/I19Bc+sJoxgjOB3qzAhIGRyTVeORcjjt3q7aOjAAH5j0rKTtqyJS0uIY/Xp3prwYB649a+v8A/h1bqug/svad8Rda8QWdmusWouoLVeTEGGUV+eCQR0zivky/szZXctu2C8bbTj61z0sVCq2oPYyp1oz+FmZLHxwD+dQSA9M5rovE/gbVPClpZTX9jc2sepRmW2aRColUHBx+n51gMAT2rqjJvY3jqrpkEibVOCeKhYZHSrLckimYAQ9Oau7ZRB5fvRUuwUUCGIuRwKliXIFQrlu4FTx5B9RmoclazFa5peG/C994r1MWenWdxe3ZjaQQwxl3KqCScDngA5p9vAYm24IKdu/XFfpV/wAEkP2G7fVvAFj48m8PaxbeLbB5ZYHuQyW1/aSIVBQdCCucg4rlr/8A4Jn6V8Y/2+L7wx9ug0DRiG1TUY7aYNKiH7yRA5AYkj6DmvGea01UdJ9DieLgpuLL37F/w0+Kn7dHwHuPCEstvpOm6JbpDYXWoGSI3u5WMaoCPmA2dRXz98Z/+CYfxe+EF14ou9V8Oy3Fn4VuEF7dQHejo5G2RB95k564r9moPEdt4J0TRvht4QtDPfadp6CzuZYwEshCqhZnkAA+vHViMc16H8OvjNYH4lpoXjfSorXXtdtE8howZ7XVFRclUOOSD2I714tLMsPh6zoU5JTlry31t3PEp4mdNyq04PkPzG+J2t+Ef2qP2UfCRXTLQ+NPBcB0y2tIkUPfeZCq7scc7k7+tfml8Q/AusfDXxde6Rr2n3Ol6naOVmt50KvGevIr9a/26/hN4S/Yw+KR8bnUI11XXddkuofC80XlRR2xYlmUjGADjpkc9a+BP2+7tfi34/u/H8N5PMNUdQ1vM29rdVGFAcdQPevoMBWey2PVwVRtabHzgW5PX86QnilYhjkUgr1j1Bv4/rRR8tFA7G8njGGRP3umWMh9dpX+VWYPEekSjEujqPeOdhXMIcipYzyfSp5V0JZ9rfsg/wDBX/xb+y9ptvpNvdX9/odvH5Mdpd7LgRJtI2oxwyDnPHpWz+yF+1h4Lb9tu18beKPEE2m21/54aS9VlS2kdTtYupIHIx8wxXwtG+Dz2q1azH+XX/P6dK8yvl1FtySs2ccsLTcuZKzP6CfCHiSfxP4gtfG/haOw8WaPfW01hcCwuQ4uomIDBXGRuVlHPqK7n4GXd34u8SQ69ZaC2n2fgKO40+DTrtw9xKTtZ2STnntjnivh/wDYT/4LKeB/hF+z14e8E23gbxJJq+h6KI0SzgSSG9vIx8wGDnD5LknodwPY1teBv+CqnxD8B/C7Wby++Hyaf4kvLxrhlknd1bzV/wBaIwOAMjjPavicXlmFhi1jpQXtY+6nfoeJWnOlF0pS93scN/wX1+Nlz8cPHGgaNp50vUbWwsBe2ckXN3brNxJHMex3R/d9Oe+K/NHUdC8Rw2ZtpYb5rdTnZksv6HpXsf7QXh++1bS/7Va8c6hfk3M6SkiSR2Ys2B2PQ/ieK8KTxNqWnSFUvbmMqccOSK+xylqVBch6+Wyi6SsUrnRbu0zvtp1A7lDiqro0akEHp3GK2B481aMnF5KwPUMARQfHl8VJk+zSjGPmiFeteXU9LQxKK2j44fP/AB52P/fuineXYfu9jFibAqQNgmq+cVOhyKslkoPPrXQ+AfCtz448VWGlWkE9xcXkyx7IELuVzyQB6DJrno3BK17T+xV408N/DX4mTeIvEt00Ftpts4gjRNzzyv8AKMDp3NcWOnKNJuCu+hw4ypKFKUoK7PuD4X+CvCv7HPwdvr4S+fHpXm3H2m5RZpGlkUII12jjJ2gAe+c818j+Bv2oNfm+KEk2o3PnWeqXJ8+GZsKiscZBzkBc9K+7U/Y4i/4KFfsj2niLwhr81pK0zy2envxDdyxuykSnPDED5R0+Y/Wvl/4k/sE+JPCf2+G68P3unapZr+7tXgJMuD8wD9DjFfKUctfs39ZV5S/A+eyb6viYyeIklN6WfQ8/+Osa+LfEepX+j3FtLpVgrBZC3DqhAJx1ALdK8H8Y6C0mlw6rFD5UNwzIwXpn19q9G0n4IeML7Up0exvtPtpMxyPOCkW3I49+laHxS8HW3gf4dXVhK2/yYwUPZmPce1fU5bgvYUlDse86tKCjToW7aHz7J8jHIHFMMoYEEYFOZgzZz1qMnGB6V3noiZPrRRx70UAIrDHWpFf5s1X3DFOD496ALMcmCParEcwwOpGc9aoBx9KlSfCiixEkfpH/AMESv+CicfwT1a78Aa95UthqFz9v04zHaiSgDdH6ANjI96/QT4mfFu28daZdX9ne+X5qtJsyHGc8gZr+ezw3qcmmahHcxSNHLCQ6MpIKkdxX1B4C/wCCiWqaFoSWerx3FziML50D7WYjuQeDXdQoYeb5p6SPzjiLIMXPEe3wTsnuvM9+/al8cWk9hdzXN60pjYlUyFGc+gxXw5+0B8YZ/HFzHY71MNuNvy8cDpV743ftIS/EK6k+ypPFHIct5hHNeRXEzzSFnOWY5J9aWMlDmtT2Ppciy2dGivbbjM+1NLAUM+DTHc4riPpmFFFFAWZGoycU/P8AOiigHuLml3miigRYtpmjfg8EVYec4PTg49aKKpGaSuVpJMt0xxULMScUUVPUtDaR/umiigY3caKKKDQ//9k=";
                return {
                    startCamera: function () {
                        return ionic.Platform.isWebView() ? b.getPicture({
                            quality: 50,
                            destinationType: Camera.DestinationType.DATA_URL,
                            sourceType: Camera.PictureSourceType.CAMERA,
                            allowEdit: !0,
                            encodingType: Camera.EncodingType.JPEG,
                            targetWidth: 200,
                            targetHeight: 200,
                            popoverOptions: new CameraPopoverOptions,
                            saveToPhotoAlbum: !0
                        }) : void 0
                    },
                    openCameraRoll: function () {
                        if (!ionic.Platform.isWebView()) {
                            var d = a.defer();
                            return d.resolve(c),
                                d.promise
                        }
                        return b.getPicture({
                            quality: 50,
                            destinationType: Camera.DestinationType.DATA_URL,
                            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                            allowEdit: !1,
                            encodingType: Camera.EncodingType.JPEG,
                            targetWidth: 200,
                            targetHeight: 200,
                            popoverOptions: new CameraPopoverOptions,
                            saveToPhotoAlbum: !1
                        })
                    }
                }
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("runway.services.device", []).service("DeviceService", ["$rootScope", "$cordovaPush", "$localytics", "$ionicPopup", "DevicesResource", "Device", "Me",
            function (a, b, c, d, e, f, g) {
                var h;
                if (window.onNotificationAPN = function (b) {
                    b.foreground = "1" === b.foreground,
                        console.log("APNS push notification received:", b),
                        a.$broadcast("notification.push", b)
                },
                    !ionic.Platform.isWebView()) return {
                    register: function () {
                        return !1
                    }
                };
                ionic.Platform.ready(function () {
                    h = new f(ionic.Platform.device()),
                        h.refresh().then(function (a) {
                                console.log("Device refresh", h, a),
                                    h = a,
                                    a.settings.push && j(a)
                            },
                            function () {
                                h = new f(ionic.Platform.device()),
                                    h.save(),
                                    h.refresh()
                            })
                });
                var i = {
                        badge: "true",
                        sound: "true",
                        alert: "true",
                        ecb: "onNotificationAPN"
                    },
                    j = function (a) {
                        console.log("Registering device", a),
                            b.register(i).then(function (b) {
                                    a.settings.push = !0,
                                        a.push_token = b,
                                        a.app_version = "2.0.0",
                                        a.save(),
                                        c.setPushToken(b),
                                        console.log("Push registration", b, a)
                                },
                                function (a) {
                                    console.log("Push registration error", a),
                                        d.alert({
                                            title: "Push notification error",
                                            template: a
                                        })
                                })
                    },
                    k = function () {
                        return g.settings.notifications.push.price_drop && !h.settings.push ? d.confirm({
                            title: "Ahoy there!",
                            template: "Do you want to receive notifications when items you save drop in price?",
                            cancelText: "No",
                            okText: "Yes",
                            okType: "button-balanced"
                        }).then(function (a) {
                                return a ? (j(h), !0) : (g.settings.notifications.push.price_drop = !1, g.save(), !1)
                            }) : !1
                    };
                return {
                    register: k
                }
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("runway").service("FilterService", [function () {
            var b = {},
                c = function (c) {
                    a.copy(c, b)
                },
                d = function (a, c) {
                    function d(a) {
                        a.selected && delete a.selected
                    }

                    return a ? (_.forEach(a.brand, d), _.forEach(a.colour, d), _.forEach(a.type, d), a.min_price = b.min_price, a.max_price = b.max_price, c || delete a.search, a.selected = !1, a) : !1
                },
                e = function (a) {
                    return _.any(a, {
                        selected: !0
                    })
                },
                f = function (a) {
                    if (!a) return !1;
                    var c = _.any([e(a.brand), e(a.colour), e(a.type), a.min_price && a.min_price !== b.min_price, a.max_price && a.max_price !== b.max_price, "" !== a.search && void 0 !== a.search]);
                    return c
                },
                g = function (a, b, c) {
                    var d = _.find(a[b], {
                        key: c.key
                    });
                    return d && (d.selected = !d.selected),
                        d
                },
                h = function (a) {
                    return a ? {
                        search: a.search,
                        brand: _.pluck(_.where(a.brand, {
                            selected: !0
                        }), "key"),
                        colour: _.pluck(_.where(a.colour, {
                            selected: !0
                        }), "key"),
                        type: _.pluck(_.where(a.type, {
                            selected: !0
                        }), "key"),
                        min_price: a.min_price,
                        max_price: a.max_price,
                        b_id: a.b_id,
                        style_feed: a.style_feed
                    } : {}
                };
            return {
                clearFilters: d,
                filtersSelected: f,
                getQuery: h,
                hasSelected: e,
                setMasterFilters: c,
                toggleFilterSelection: g
            }
        }])
    }(angular),

    function (a) {
        "use strict";
        a.module("runway.services", ["runway.services.camera", "runway.services.device", "runway.services.stylefeed", "runway.services.products", "runway.services.brand", "runway.services.images", "runway.services.filter", "runway.services.modal.product", "runway.services.modal.products", "runway.services.openurl"]).factory("ShareService", ["$localytics", "$ionicActionSheet", "$ionicLoading", "$cordovaSocialSharing",
            function (a, b, c, d) {
                var e, f = {
                        shortcode: null
                    },
                    g = function () {
                    },
                    h = function () {
                    },
                    i = function () {
                    };
                return {
                    share: function (a, b, j, k) {
                        f.shortcode = null,
                            e = a,
                            g = b ? b : g,
                            h = j ? j : h,
                            i = k ? k : i,
                            c.show({
                                template: "Creating a share link"
                            }),
                            a.share().then(function (b) {
                                var c = "Check out this on Mallzee - " + a.name,
                                    e = "I just discovered this " + a.name + " on Mallzee",
                                    f = a.images[0],
                                    i = "http://mallzee.com/#/product/" + b.short_code;
                                return ionic.Platform.isWebView() ? d.share(c, e, f, i).then(g, h) : (g(), window.prompt("Copy to clipboard", i), !1)
                            }).
                                finally(function () {
                                    c.hide()
                                })
                    }
                }
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("runway.services.products", []).service("ProductsService", ["$window", "$cordovaProgressIndicator", "$cordovaStatusbar", "$ionicScrollDelegate", "$localytics", "FilterModalService", "FilterService", "ProductModalService", "ProductsModalService", "ProductsResource", "ShareService", "Me",
            function (b, c, d, e, f, g, h, i, j, k, l, m) {
                function n(a, b) {
                    var c = {};
                    c[b.$$identifier] = b[b.$$identifier];
                    var d = v(a);
                    _.remove(d.records, c)
                }

                var o = {
                        reset: !0,
                        loading: !1
                    },
                    p = {},
                    q = function () {
                    },
                    r = function (a) {
                        g.show(a)
                    },
                    s = function (a, b) {
                        i.show(a, b)
                    },
                    t = function (a) {
                        j.show(a)
                    },
                    u = function (a) {
                        return a = !a,
                            e.$getByHandle("multiview").resize(),
                            a
                    },
                    v = function (b) {
                        var c;
                        return c = "string" == typeof b ? b : b._id,
                            p[c] || (p[c] = {},
                                a.extend(p[c], o)),
                            p[c]
                    },
                    w = function (a, b) {
                        var c = v(a);
                        return c.has_more === !1 ? !1 : (c.empty = !1, b || (b = {}), b._id || (b.gender = m.gender), "new-in" === a && (b.limit = 50, b.gender = m.gender), "sale" === a ? (b.gender = m.gender, b.sale = !0, b.limit = 50) : a._id && ("brands" === a.$$path ? (b.b_id = a._id, b.gender = m.gender, b.limit = 50) : "style-feeds" === a.$$path && (b.style_feed = a._id, b.gender = a.filter.gender, b.limit = 50)), x(c, b))
                    },
                    x = function (b, c) {
                        return b.loading = !0,
                            b && b.cursor && !b.reset && (a.extend(c, b.query), c.filters = !1, c.cursor = b.cursor),
                            k.find(c).then(function (d) {
                                return b.records ? (b.cursor = d.cursor, b.query = c, b.count = d.count, b.has_more = d.has_more, a.forEach(d.records,
                                    function (a) {
                                        b.records.push(a)
                                    })) : (c.gender && (d.filters.gender = c.gender), d.filters ? a.extend(d.filters, c) : d.filters = {},
                                    a.extend(b, d), b.query = c),
                                    0 === d.records.length && (b.empty = !0),
                                    b.reset = !1,
                                    b.loading = !1,
                                    b
                            })
                    },
                    y = function (a, b) {
                        var c = v(a);
                        c.reset = !0,
                            c.records && (c.records.length = 0),
                            c.cursor = null,
                            c.has_more = null,
                            b && h.clearFilters(c.filters, !0)
                    },
                    z = function (a) {
                        delete p[a]
                    },
                    A = function (a, e, g, h) {
                        function i() {
                            c.hide()
                        }

                        Adjust.trackEvent("6n7mut"),
                            f.tagEvent("Product Action", {
                                    item: "product",
                                    action: "buy",
                                    product: a._id,
                                    name: a.name,
                                    brand: a.brand.name,
                                    merchant: a.merchants[0].name || "Unknown",
                                    product_gender: a.gender,
                                    colour: a.colour,
                                    type: a.type,
                                    age: m.age || "Unknown",
                                    gender: m.gender || "Unknown",
                                    context: e.name || "Unknown",
                                    featured: e.featured ? "Yes" : "No",
                                    view: e.view ? "Yes" : "No"
                                },
                                3);
                        var j = b.open(a.merchants[g].stock[h].buy_url, "_blank", "location=no,closebuttoncaption=Back to Mallzee");
                        ionic.Platform.isWebView() && (c.showAnnularWithLabel(!0, 6e5, "Taking you to " + a.merchants[0].name), j.addEventListener("loaderror", i), j.addEventListener("loadstop", i), j.addEventListener("exit",
                            function () {
                                d.overlaysWebView(!0),
                                    d.style(1),
                                    d.show(),
                                    i()
                            }))
                    },
                    B = function (a, b) {
                        n(b.key, a),
                            k.save(a, {
                                context: b
                            }).then(function () {
                                    Adjust.trackEvent("gbw096"),
                                        f.tagEvent("Product Action", {
                                                item: "product",
                                                action: "save",
                                                product: a._id,
                                                name: a.name,
                                                brand: a.brand.name,
                                                merchant: a.merchants[0].name || "Unknown",
                                                product_gender: a.gender,
                                                colour: a.colour,
                                                type: a.type,
                                                age: m.age || "Unknown",
                                                gender: m.gender || "Unknown",
                                                context: b.name || "Unknown",
                                                featured: b.featured ? "Yes" : "No",
                                                swiped: b.swiped ? "Yes" : "No",
                                                view: b.view
                                            },
                                            2),
                                        i.hide()
                                },
                                function () {
                                    console.log("Possible conflict?")
                                })
                    },
                    C = function (a, b) {
                        n(b.key, a),
                            k.hide(a, {
                                context: b
                            }).then(function () {
                                    Adjust.trackEvent("i4uzoo"),
                                        f.tagEvent("Product Action", {
                                                item: "product",
                                                action: "hide",
                                                product: a._id,
                                                name: a.name,
                                                brand: a.brand.name,
                                                merchant: a.merchants[0].name || "Unknown",
                                                product_gender: a.gender,
                                                colour: a.colour,
                                                type: a.type,
                                                age: m.age || "Unknown",
                                                gender: m.gender || "Unknown",
                                                context: b.name || "Unknown",
                                                featured: b.featured ? "Yes" : "No",
                                                swiped: b.swiped ? "Yes" : "No",
                                                view: b.view
                                            },
                                            1),
                                        i.hide()
                                },
                                function (a) {
                                    console.log("Possible conflict?", a)
                                })
                    },
                    D = function (a, b) {
                        l.share(a,
                            function () {
                                Adjust.trackEvent("d1u5g2"),
                                    f.tagEvent("Product Action", {
                                            item: "product",
                                            action: "share",
                                            product: a._id,
                                            name: a.name,
                                            brand: a.brand.name,
                                            merchant: a.merchants[0].name || "Unknown",
                                            product_gender: a.gender,
                                            colour: a.colour,
                                            type: a.type,
                                            age: m.age || "Unknown",
                                            gender: m.gender || "Unknown",
                                            context: b.name || "Unknown",
                                            featured: b.featured ? "Yes" : "No",
                                            view: b.view
                                        },
                                        3)
                            },
                            function () {
                                console.log("Something went wrong when sharing product", a)
                            },
                            function () {
                                console.log("Share cancelled")
                            })
                    };
                return {
                    buyProduct: A,
                    clearProducts: y,
                    deleteProducts: z,
                    fetchProducts: w,
                    getProducts: v,
                    hideProduct: C,
                    modal: {
                        showFilter: r,
                        showProduct: s
                    },
                    saveProduct: B,
                    setDefaultView: q,
                    shareProduct: D,
                    showFilter: r,
                    showProduct: s,
                    showProducts: t,
                    toggleView: u
                }
            }])
    }(angular),
    function (a, b) {
        "use strict";
        b.module("runway.services.openurl", []).factory("OpenUrlService", ["$rootScope",
            function (b) {
                return a.handleOpenURL = function (a) {
                    b.$broadcast("url.opened", a)
                },
                {}
            }])
    }(window, angular),
    function (a) {
        "use strict";
        a.module("mallzee.services.unknownstates", []).provider("UnknownInspirationState", ["$stateProvider",
            function (a) {
                this.$get = ["$rootScope", "$state", "BaseUrl",
                    function (b, c, d) {
                        var e = !1;
                        b.$on("$stateNotFound",
                            function (b, f) {
                                if (e) return !1;
                                b.preventDefault(),
                                    e = !0;
                                var g = f.to.split(".")[1].split("-");
                                a.state(f.to, {
                                    url: "/" + g.join("/"),
                                    authenticated: !0,
                                    screen: g.join(" "),
                                    views: {
                                        "tab-inspiration": {
                                            templateUrl: d + "/" + g.join("/") + "/index.html"
                                        }
                                    }
                                }),
                                    c.go(f.to, f.toParams),
                                    e = !1
                            })
                    }]
            }]),
            a.module("mallzee.services.unknownstates").run(["UnknownInspirationState",
                function () {
                }])
    }(angular),
    function (a) {
        "use strict";
        a.module("runway.services.brand", []).service("BrandModalService", ["$rootScope", "$ionicModal", "BrandsResource",
            function (a, b, c) {
                var d, e;
                b.fromTemplateUrl("views/brands/modal.html", {
                    animation: "slide-in-up"
                }).then(function (a) {
                        d = a
                    });
                var f = function () {
                        d.hide()
                    },
                    g = function (b) {
                        e = b,
                            Adjust.trackEvent("hben8w"),
                            a.$broadcast("modal.brand.show", e),
                            d.show()
                    };
                return a.$on("notification.push",
                    function (a, b) {
                        "modal.brand" !== b.state || b.foreground || c.get(b.brand).then(function (a) {
                            g(a)
                        })
                    }),
                {
                    brand: e,
                    hide: f,
                    show: g
                }
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("runway.services.filter", []).service("FilterModalService", ["$rootScope", "$ionicModal", "$ionicHistory", "$ionicNavBarDelegate", "$ionicSpinnerDelegate", "FilterService", "ProductsResource", "Me",
            function (a, b, c, d, e, f, g, h) {
                var i;
                e.$getByHandle("types"),
                    e.$getByHandle("colours"),
                    b.fromTemplateUrl("views/products/filters.html", {
                        animation: "slide-in-up"
                    }).then(function (a) {
                            i = a
                        });
                var j = function (a) {
                        f.clear(a)
                    },
                    k = function () {
                        c.goBack(),
                            d.title(f.humanise(h.gender)),
                            i.hide()
                    },
                    l = function (b) {
                        console.log("Show modal", b),
                            a.$broadcast("modal.filters.show", b),
                            i.show()
                    },
                    m = function () {
                        console.log("Hide filters", f.filter),
                            i.hide()
                    };
                return {
                    apply: k,
                    clear: j,
                    hide: m,
                    show: l
                }
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("runway.services.images", []).service("ImagesModalService", ["$rootScope", "$ionicModal", "$ionicSlideBoxDelegate",
            function (a, b, c) {
                var d, e, f;
                b.fromTemplateUrl("views/images.html", {
                    animation: "slide-in-up"
                }).then(function (a) {
                        d = a
                    }),
                    e = c.$getByHandle("images");
                var g = function () {
                        d.hide()
                    },
                    h = function (b, c) {
                        f = b,
                            e.select(c),
                            a.$broadcast("modal.images.show", b),
                            d.show()
                    };
                return {
                    hide: g,
                    images: f,
                    show: h
                }
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("runway.services.modal.product", []).service("ProductModalService", ["$rootScope", "$ionicModal", "$ionicLoading", "$ionicSlideBoxDelegate", "ProductsResource", "UserProductsResource",
            function (a, b, c, d, e, f) {
                function g(a) {
                    c.show({
                        template: "Looking for product...",
                        duration: 600
                    }),
                        f.get(a).then(function (a) {
                            m(a).then(function () {
                                c.hide()
                            })
                        }).
                            finally(function () {
                                c.hide()
                            })
                }

                function h(a) {
                    c.show({
                        template: "Looking for product...",
                        duration: 600
                    }),
                        e.get(a).then(function (a) {
                            m(a).then(function () {
                                c.hide()
                            })
                        }).
                            finally(function () {
                                c.hide()
                            })
                }

                var i, j, k, l;
                l = d,
                    b.fromTemplateUrl("views/products/modal.html", {
                        animation: "slide-in-up"
                    }).then(function (a) {
                            i = a
                        });
                var m = function (b, c) {
                        return j = b,
                            k = c,
                            a.$broadcast("modal.product.show", j, k),
                            i.show().then(function () {
                            })
                    },
                    n = function () {
                        i.hide(),
                            a.$broadcast("modal.product.hide")
                    };
                return a.$on("notification.push",
                    function (a, b) {
                        "modal.userproduct" !== b.state || b.foreground || g(b.product)
                    }),
                    a.$on("url.opened",
                        function (a, b) {
                            var c = b.split("/"),
                                d = c[c.length - 1];
                            h(d)
                        }),
                {
                    context: k,
                    hide: n,
                    product: j,
                    show: m
                }
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("runway.services.modal.products", []).service("ProductsModalService", ["$rootScope", "$ionicModal", "$ionicLoading", "$ionicSlideBoxDelegate", "BrandsResource", "ProductsResource",
            function (a, b, c, d, e, f) {
                function g(a) {
                    f.find({
                        b_id: a
                    }).then(function (a) {
                            console.log("Find brand products", a)
                        }),
                        e.get(a).then(function (a) {
                            console.log("Find brand", a)
                        })
                }

                var h, i, j, k;
                k = d,
                    b.fromTemplateUrl("views/products/products-modal.html", {
                        animation: "slide-in-up"
                    }).then(function (a) {
                            h = a
                        });
                var l = function (b, c) {
                        return i = product,
                            j = c,
                            a.$broadcast("modal.products.show", i, j),
                            h.show().then(function () {
                            })
                    },
                    m = function () {
                        h.hide(),
                            a.$broadcast("modal.products.hide")
                    };
                return a.$on("notification.push",
                    function (a, b) {
                        "modal.brand" !== b.state || b.foreground || g(b.brand)
                    }),
                    a.$on("url.opened",
                        function (a, b) {
                            var c = b.split("/");
                            "brands" === c[c.length - 2] && (c[c.length - 1], g(brandId))
                        }),
                {
                    context: j,
                    hide: m,
                    product: i,
                    show: l
                }
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("runway.services.stylefeed", []).service("StylefeedService", ["$rootScope", "$cordovaKeyboard", "$ionicModal", "$ionicPopup", "$ionicSlideBoxDelegate", "StyleFeedsResource", "FiltersService",
            function (a, b, c, d, e, f, g) {
                var h = function () {
                    var a = this;
                    a.modal = {},
                        a.stylefeed = {},
                        c.fromTemplateUrl("views/style-feeds/add-style-feed.html", {
                            animation: "slide-in-up"
                        }).then(function (c) {
                                a.modal = c,
                                    a.ctrl = e.$getByHandle("stylefeed"),
                                    a.ctrl.enableSlide(!1),
                                    a.ctrl.closeKeyboard = function () {
                                        ionic.Platform.isWebView() && b.close()
                                    }
                            })
                };
                return h.prototype.open = function (b) {
                    this.stylefeed = b,
                        console.log("Open stylefeed", b),
                        this.stylefeed.filter.gender,
                        console.log("Setting selections", this.stylefeed.filter),
                        this.modal.show(),
                        a.$broadcast("modal.stylefeed.open", this.stylefeed)
                },
                    h.prototype.close = function () {
                        this.modal.hide(),
                            this.ctrl.select(0)
                    },
                    h.prototype.save = function () {
                        var b = this;
                        f.save(this.stylefeed).then(function (c) {
                                console.log("Stylefeed saved!", c),
                                    Adjust.trackEvent("nxzhg7"),
                                    a.$broadcast("modal.stylefeed.hide", c),
                                    b.close()
                            },
                            function (a) {
                                d.alert({
                                    title: a.data.error,
                                    template: a.data.message
                                })
                            })
                    },
                    h.prototype.setGender = function (a) {
                        this.stylefeed.filter.gender = a,
                            g.setGender(this.stylefeed.filter.gender)
                    },
                    h.prototype.toggleFilter = function (a, b, c, d) {
                        d || (d = "key");
                        var e = _.indexOf(this.stylefeed.filter[b], c[d]);
                        -1 === e ? this.stylefeed.filter[b].push(c[d]) : _.pull(this.stylefeed.filter[b], c[d]),
                            g.toggleFilterSelection(a, b, c, d)
                    },
                    new h
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("runway.controllers", ["runway.controllers.mallzee", "runway.controllers.account", "runway.controllers.brands", "runway.controllers.brand", "runway.controllers.checkout", "runway.controllers.filter", "runway.controllers.images", "runway.controllers.login", "runway.controllers.forgotten", "runway.controllers.products", "runway.controllers.register", "runway.controllers.saved", "runway.controllers.stylefeeds"]).config(["$stateProvider",
            function (a) {
                a.state("tab", {
                    url: "/",
                    "abstract": !0,
                    templateUrl: "views/tabs.html"
                })
            }])
    }(angular),
    function () {
        "use strict";
        angular.module("runway.controllers.mallzee", ["mallzee.service"]).config(["$stateProvider",
                function (a) {
                    a.state("tab.inspiration", {
                        url: "inspiration",
                        authenticated: !0,
                        screen: "Inspiration",
                        views: {
                            "tab-inspiration": {
                                templateUrl: "views/inspiration.html",
                                controller: "InspirationCtrl"
                            }
                        }
                    })
                }]).controller("InspirationCtrl", ["$scope", "$state", "$timeout", "$ionicSlideBoxDelegate", "$cordovaKeyboard", "FiltersService", "ProductsService", "ProductsResource", "BaseUrl", "Me",
                function (a, b, c, d, e, f, g, h, i, j) {
                    a.modal = g,
                        a.view = {
                            currentSlideIndex: 0
                        },
                        a.products = g.getProducts("new-in"),
                        a.iPad = ionic.Platform.isIPad(),
                        a.inspirationIndex = i + "/inspiration/" + j.regions[0] + "/" + j.gender + "/index.html",
                        a.searchProducts = function (a) {
                            a.search && "" !== a.search && (b.go("tab.products", {
                                search: a.search
                            }), a.search = null)
                        },
                        a.products = g.getProducts("new-in"),
                        g.fetchProducts("new-in")
                }])
    }(),
    function () {
        "use strict";
        angular.module("runway.controllers.account", []).config(["$stateProvider",
                function (a) {
                    a.state("tab.account", {
                        url: "account",
                        authenticated: !0,
                        screen: "Account",
                        views: {
                            "tab-account": {
                                templateUrl: "views/account/account.html",
                                controller: "AccountCtrl"
                            }
                        }
                    }).state("tab.account-profile", {
                            url: "account/profile",
                            authenticated: !0,
                            screen: "Profile",
                            views: {
                                "tab-account": {
                                    templateUrl: "views/account/profile.html",
                                    controller: "AccountCtrl"
                                }
                            }
                        }).state("tab.account-profile-email", {
                            url: "account/profile/email",
                            authenticated: !0,
                            views: {
                                "tab-account": {
                                    templateUrl: "views/account/email.html",
                                    controller: "AccountCtrl"
                                }
                            }
                        }).state("tab.account-notifications", {
                            url: "account/notifications",
                            authenticated: !0,
                            screen: "Notification Settings",
                            views: {
                                "tab-account": {
                                    templateUrl: "views/account/notifications.html",
                                    controller: "AccountCtrl"
                                }
                            }
                        }).state("tab.account-settings", {
                            url: "account/settings",
                            authenticated: !0,
                            screen: "Settings",
                            views: {
                                "tab-account": {
                                    templateUrl: "views/account/settings.html",
                                    controller: "AccountCtrl"
                                }
                            }
                        })
                }]).controller("AccountCtrl", ["$scope", "$state", "$filter", "$hockeyapp", "$localytics", "$cordovaSocialSharing", "$cordovaSplashscreen", "$ionicLoading", "$ionicPopup", "AuthenticationService", "Me",
                function (a, b, c, d, e, f, g, h, i, j, k) {
                    var l = angular.copy(k);
                    a.user = k,
                        k.refresh().then(function () {
                            k.birthday = c("date")(k.birthday, "yyyy-MM-dd"),
                                console.log("Formatting date", k)
                        }),
                        "tab.brands-disabled" === b.current.name && k.getHiddenBrands().then(function (b) {
                            a.hiddenBrands = b.records,
                                console.log("Hidden brands", a.hiddenBrands)
                        }),
                        a.setGender = function (a) {
                            k.gender = a
                        },
                        a.updateProfile = function (a) {
                            h.show({
                                template: "Updating profile..."
                            }),
                                k.save().
                                    catch(function (a) {
                                        console.log("Updating profile failed", a)
                                    }).
                                    finally(function () {
                                        h.hide(),
                                            e.tagEvent("Updated Profile", {},
                                                0),
                                            (a.gender !== l.gender || a.region !== l.region) && (ionic.Platform.isWebView() && g.show(), window.location.reload())
                                    })
                        },
                        a.verifyMobileNumber = function () {
                        },
                        a.giveFeedback = function () {
                            d.feedback()
                        },
                        a.showHiddenBrands = function () {
                            b.go("tab.brands-disabled")
                        },
                        a.enableBrand = function (b) {
                            h.show({
                                template: "Enabling " + b.name
                            }),
                                _.remove(a.hiddenBrands, {
                                    _id: b._id
                                }),
                                k.enableBrand(b).then(function () {
                                        h.hide()
                                    },
                                    function (c) {
                                        a.hiddenBrands.push(b),
                                            h.hide(),
                                            i.alert({
                                                title: "Something went wrong",
                                                template: c.data.message
                                            })
                                    })
                        },
                        a.inviteFriend = function () {
                            var a = "I have just discovered Mallzee! Come check it out",
                                b = "Come join me on Mallzee",
                                c = "../res/images/logo.png",
                                d = "http://app.adjust.io/mzjoxn";
                            f.share(a, b, c, d)
                        },
                        a.logout = function () {
                            i.confirm({
                                title: "Are you sure?",
                                template: "This will sign you out of Mallzee and remove any locally stored data"
                            }).then(function (a) {
                                    a && (e.tagEvent("Authentication", {
                                            action: "logout"
                                        },
                                        0), j.destroy(), b.go("login"))
                                })
                        }
                }])
    }(),
    function () {
        "use strict";
        angular.module("runway.controllers.brands", []).config(["$stateProvider",
                function (a) {
                    a.state("tab.brands", {
                        url: "brands",
                        authenticated: !0,
                        screen: "Brands",
                        views: {
                            "tab-brands": {
                                templateUrl: "views/brands/brands.html",
                                controller: "BrandsCtrl"
                            }
                        }
                    })
                }]).factory("BrandsViewService", ["Me",
                function (a) {
                    var b = {
                        currentSlideIndex: 0,
                        editTitle: "Edit",
                        editingBrands: !1,
                        simple: !1,
                        search: {
                            name: ""
                        },
                        order: "-featured." + a.gender + ".order"
                    };
                    return {
                        view: b
                    }
                }]).controller("BrandsCtrl", ["$scope", "BrandsService", "BrandsViewService", "BrandsResource", "Me",
                function (a, b, c, d, e) {
                    a.user = e,
                        a.filter = {
                            featured: {}
                        },
                        a.filter.featured[e.gender] = {},
                        a.filter.featured[e.gender].enabled = !0,
                        a.view = c.view,
                        a.simplifyView = function (b) {
                            a.view.simple = b
                        },
                        a.brands = b.brands,
                        b.getBrands().then(function (a) {
                            angular.forEach(a.records,
                                function (a) {
                                    switch (a.status) {
                                        case "favourite":
                                            a.statusOrder = 1;
                                            break;
                                        case "hidden":
                                            a.statusOrder = 3;
                                            break;
                                        default:
                                            a.statusOrder = 2
                                    }
                                })
                        }),
                        a.toggleEditingBrands = function () {
                            a.brands.records.length > 0 && (a.view.editingBrands = !a.view.editingBrands, a.view.editTitle = a.view.editingBrands ? "Cancel" : "Edit")
                        },
                        a.updateSlideIndex = function (b) {
                            a.view.currentSlideIndex = b
                        }
                }])
    }(),
    function (a) {
        "use strict";
        a.module("runway.controllers.brand", []).config(["$stateProvider",
                function (a) {
                    a.state("tab.brand", {
                        url: "brands/:brand",
                        authenticated: !0,
                        screen: "Brand",
                        views: {
                            "tab-brands": {
                                templateUrl: "views/brands/brand.html",
                                controller: "BrandCtrl"
                            }
                        }
                    })
                }]).controller("BrandCtrl", ["$scope", "$state", "$localytics", "$ionicPopup", "$ionicListDelegate", "$ionicLoading", "$ionicHistory", "$ionicScrollDelegate", "BrandsResource", "BrandModalService", "ImagesModalService", "ProductModalService", "ProductsResource", "Me",
                function (a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
                    function o() {
                        e.$getByHandle("brands-list").closeOptionButtons()
                    }

                    function p(b) {
                        i.get(b).then(function (b) {
                            a.brand = b,
                                a.context = {
                                    b_id: b._id,
                                    name: b.name,
                                    type: "Brand"
                                },
                                a.brand.products = {},
                                m.find({
                                    b_id: a.brand._id
                                }).then(function (b) {
                                        a.brand.products = b.records
                                    })
                        })
                    }

                    a.BrandModalService = j,
                        a.ProductModalService = l,
                        a.view = {
                            shoppingAvailable: b.is("tab.brand"),
                            currentSlideIndex: 0
                        },
                        a.shopBrand = function (a) {
                            i.item = a,
                                c.tagEvent("Brand Interaction", {
                                        action: "shop",
                                        name: a.name,
                                        age: n.age || "Unknown",
                                        gender: n.gender || "Unknown",
                                        featured: a.featured[n.gender].enabled ? "Yes" : "No"
                                    },
                                    0),
                                b.go("tab.products-brand", {
                                    brand: a._id
                                })
                        },
                        a.viewBrandInfo = function (a) {
                            i.item = a,
                                c.tagEvent("Brand Interaction", {
                                        action: "view information",
                                        name: a.name,
                                        featured: a.featured[n.gender].enabled ? "Yes" : "No"
                                    },
                                    0),
                                b.go("tab.brand", {
                                    brand: a._id
                                })
                        },
                        a.toggleBrand = function (b) {
                            "hidden" === b.status ? a.toggleHiddenBrand(b) : a.toggleFavouriteBrand(b)
                        },
                        a.toggleFavouriteBrand = function (a) {
                            a.toggleFavourite(),
                                "favourite" === a.status ? (Adjust.trackEvent("g35ycr"), c.tagEvent("Brand Interaction", {
                                        action: "favourite",
                                        name: a.name,
                                        featured: a.featured[n.gender].enabled ? "Yes" : "No"
                                    },
                                    0)) : c.tagEvent("Brand Interaction", {
                                        action: "unfavourite",
                                        name: a.name,
                                        featured: a.featured[n.gender].enabled ? "Yes" : "No"
                                    },
                                    0)
                        },
                        a.toggleHiddenBrand = function (a) {
                            "hidden" !== a.status ? d.confirm({
                                title: "Hiding " + a.name,
                                template: "This will hide all products from " + a.name + ". You can enabled them again from the hidden brands list."
                            }).then(function (b) {
                                    o(),
                                        b && (f.show({
                                            template: "Disabling " + a.name
                                        }), a.toggleHidden().then(function () {
                                            f.hide(),
                                                Adjust.trackEvent("ayzz1n"),
                                                c.tagEvent("Brand Interaction", {
                                                        action: "hidden",
                                                        name: a.name,
                                                        featured: a.featured[n.gender].enabled ? "Yes" : "No"
                                                    },
                                                    0)
                                        }))
                                }) : (a.toggleHidden().then(function () {
                                c.tagEvent("Brand Interaction", {
                                        action: "unhidden",
                                        name: a.name,
                                        featured: a.featured[n.gender].enabled ? "Yes" : "No"
                                    },
                                    0)
                            }), o())
                        },
                        a.viewImages = function (a, b) {
                            k.show(a, b)
                        },
                        a.updateSlideIndex = function (b) {
                            a.view.currentSlideIndex = b
                        },
                        b.is("tab.brand") && b.params.brand && p(b.params.brand),
                        a.$on("modal.brand.show",
                            function (a, b) {
                                p(b._id),
                                    h.$getByHandle("brand").scrollTop()
                            })
                }])
    }(angular),
    function (a) {
        "use strict";
        a.module("runway.controllers.checkout", []).config(["$stateProvider",
                function (a) {
                    a.state("checkout", {
                        url: "/checkout/:product",
                        authenticated: !0,
                        templateUrl: "views/checkout.html",
                        controller: "CheckoutCtrl"
                    })
                }]).controller("CheckoutCtrl", ["$scope", "$state", "$window", "$timeout", "$ionicLoading", "Me", "ProductsResource",
                function (a, b, c, d, e, f, g) {
                    e.show({
                        title: "Checkout",
                        template: "Taking you to ...",
                        duration: 1e4
                    }),
                        g.get(b.params.product).then(function (b) {
                            e.show({
                                title: "Checkout",
                                template: "Taking you to " + b.brand.name,
                                duration: 1e5
                            }),
                                a.product = b,
                                document.getElementById("content").onload = function () {
                                    e.hide()
                                }
                        })
                }])
    }(angular),
    function () {
        "use strict";
        angular.module("runway.controllers.filter", []).config(["$stateProvider",
                function (a) {
                    a.state("tab.product-filters", {
                        url: "filters",
                        authenticated: !0,
                        screen: "Filters",
                        views: {
                            "tab-products": {
                                templateUrl: "views/products/filters.html",
                                controller: "FilterCtrl"
                            }
                        }
                    })
                }]).controller("FilterCtrl", ["$scope", "$state", "$filter", "$timeout", "$localytics", "$ionicLoading", "$ionicScrollDelegate", "$ionicSpinnerDelegate", "FilterModalService", "FilterService", "ProductsService", "Me",
                function (a, b, c, d, e, f, g, h, i, j, k, l) {
                    a.loading = !1,
                        a.view = {
                            currency: c("regionToCurrency")(l.regions[0])
                        };
                    var m = !1;
                    a.clearFilters = function (a) {
                        m = !1,
                            e.tagEvent("Filter Interaction", {
                                    action: "clear"
                                },
                                0),
                            j.clearFilters(a)
                    },
                        a.applyFilters = function () {
                            e.tagEvent("Filter Interaction", {
                                    action: "apply"
                                },
                                0),
                                m && g.$getByHandle("multiview").scrollTop(),
                                i.hide()
                        },
                        a.hideFilters = function () {
                            i.hide()
                        },
                        a.hasSelection = function (a) {
                            return j.hasSelected(a)
                        },
                        a.hasFilterSelection = function (a) {
                            return j.filtersSelected(a)
                        },
                        a.toggleFilterSelection = function (a, b, c) {
                            return j.toggleFilterSelection(a, b, c)
                        },
                        a.currencyFilter = function (a) {
                            return "£" + a
                        },
                        a.$on("modal.filters.show",
                            function (b, c) {
                                m = !1,
                                    a.products = c,
                                    a.filters = c.filters,
                                    j.setMasterFilters(a.filters),
                                    e.tagScreen("Filters")
                            })
                }])
    }(),
    function () {
        "use strict";
        angular.module("runway.controllers.forgotten", []).config(["$stateProvider",
                function (a) {
                    a.state("forgotten", {
                        url: "/forgotten",
                        templateUrl: "views/forgotten.html",
                        controller: "ForgottenCtrl",
                        authenticated: !1,
                        screen: "Forgotten"
                    })
                }]).controller("ForgottenCtrl", ["$scope", "$state", "$localytics", "$ionicPopup", "$ionicLoading", "AuthenticationService",
                function (a, b, c, d, e, f) {
                    a.user = {
                        email: ""
                    },
                        a.forgottenPassword = function (a) {
                            e.show({
                                template: "Requesting password reset"
                            }),
                                f.forgottenPassword(a.email).then(function () {
                                        c.tagEvent("Authentication", {
                                                action: "forgotten"
                                            },
                                            0),
                                            e.hide(),
                                            d.alert({
                                                title: "You have mail",
                                                subTitle: "Please click the reset link in your email from Mallzee"
                                            }).then(function () {
                                                    b.go("login")
                                                })
                                    },
                                    function (a) {
                                        e.hide(),
                                            d.alert({
                                                title: a.data.error,
                                                subTitle: a.data.message
                                            })
                                    })
                        }
                }])
    }(),
    function (a) {
        "use strict";
        a.module("runway.controllers.images", []).controller("ImagesCtrl", ["$scope", "$localytics", "ImagesModalService",
            function (a, b, c) {
                a.ImagesModalService = c,
                    a.$on("modal.images.show",
                        function (c, d) {
                            b.tagScreen("Image Viewer"),
                                a.images = d
                        })
            }])
    }(angular),

//LoginCtrl
    angular.module("runway.controllers.login", [])
        .config(function ($stateProvider) {
            $stateProvider.state("welcome", {
                url: "/welcome",
                templateUrl: "views/welcome.html",
                controller: "LoginCtrl",
                authenticated: !1,
                screen: "Welcome"
            }).state("login", {
                    url: "/login",
                    templateUrl: "views/login.html",
                    controller: "LoginCtrl",
                    authenticated: !1,
                    screen: "Login"
                })
        })
        .controller("LoginCtrl", [, function ($scope, $state, $http, $localytics, $ionicPopup, $ionicLoading, AuthenticationService, Me) {
            $scope.user = {
                email: "",
                password: "",
                app: "web"
            },
                $scope.authenticate = function (a) {
                    f.show({
                        template: "Logging you in..."
                    }),
                        g.authenticate(a).then(function (a) {
                                angular.extend(h, a),
                                    f.hide(),
                                    d.tagEvent("Authentication", {
                                            action: "login",
                                            type: "email"
                                        },
                                        0),
                                    b.go("tab.inspiration")
                            },
                            function () {
                                f.hide(),
                                    e.alert({
                                        title: "Uh oh spaghettio",
                                        subTitle: "We could not log you in."
                                    })
                            })
                },
                $scope.forgottenPassword = function (a) {
                    f.show({
                        template: "Requesting password reset"
                    }),
                        g.resetPassword(a).then(function () {
                                f.hide(),
                                    e.alert({
                                        title: "You have mail",
                                        subTitle: "Please click the reset link in your email from Mallzee"
                                    }).then(function () {
                                            b.go("login")
                                        })
                            },
                            function (a) {
                                f.hide(),
                                    e.alert({
                                        title: a.data.error,
                                        subTitle: a.data.message
                                    })
                            })
                },
                $scope.slideHasChanged = function (b) {
                    $scope.currentSlide = b
                }
        }]) ,

    function () {
        "use strict";
        angular.module("runway.controllers.register", []).config(["$stateProvider",
                function (a) {
                    a.state("register", {
                        url: "/register",
                        templateUrl: "views/register.html",
                        controller: "RegisterCtrl",
                        authenticated: !1,
                        screen: "Register"
                    })
                }]).controller("RegisterCtrl", ["$scope", "$state", "$cordovaGlobalization", "$localytics", "$ionicPopup", "$ionicLoading", "RegistrationService", "Me",
                function (a, b, c, d, e, f, g, h) {
                    a.user = {
                        name: {
                            first: "",
                            last: ""
                        },
                        email: "",
                        password: "",
                        gender: "",
                        locale: "en-GB",
                        app: "web"
                    },
                        ionic.Platform.ready(function () {
                            ionic.Platform.isWebView() && c.getLocaleName().then(function (b) {
                                    a.user.locale = b.value
                                },
                                function () {
                                    a.user.locale = "en-GB"
                                })
                        }),
                        a.setGender = function (b) {
                            a.user.gender = b
                        },
                        a.registerUser = function (a) {
                            f.show({
                                template: "Registering..."
                            }),
                                g.register(a).then(function (a) {
                                        angular.extend(h, a),
                                            f.hide(),
                                            d.tagEvent("Registered", {},
                                                0),
                                            b.go("tab.inspiration")
                                    },
                                    function (a) {
                                        f.hide(),
                                            e.alert({
                                                title: "Uh oh spaghettio",
                                                subTitle: a.data.message
                                            }),
                                            console.log(a)
                                    })
                        }
                }])
    }(),
    function () {
        "use strict";
        angular.module("runway.controllers.products", []).config(["$stateProvider",
                function (a) {
                    a.state("tab.products", {
                        url: "products?_id&colour&m_id&type&brand&b_id&search&title",
                        authenticated: !0,
                        screen: "Products",
                        type: "products",
                        views: {
                            "tab-inspiration": {
                                templateUrl: "views/products/products.html",
                                controller: "ProductsCtrl"
                            }
                        }
                    }).state("tab.products-brand", {
                            url: "brands/:brand/products?name",
                            authenticated: !0,
                            screen: "Brand Products",
                            type: "brands",
                            views: {
                                "tab-brands": {
                                    templateUrl: "views/products/products.html",
                                    controller: "ProductsBrandCtrl"
                                }
                            }
                        }).state("tab.products-stylefeed", {
                            url: "style-feeds/:stylefeed/products?name",
                            authenticated: !0,
                            screen: "Stylefeed Products",
                            type: "stylefeed",
                            views: {
                                "tab-stylefeeds": {
                                    templateUrl: "views/products/products.html",
                                    controller: "ProductsStyleFeedCtrl"
                                }
                            }
                        }).state("tab.products-inspiration-brand", {
                            url: "inspiration/brands/:brand/products?name",
                            authenticated: !0,
                            screen: "Inspiration Brand Products",
                            views: {
                                "tab-inspiration": {
                                    templateUrl: "views/products/products.html",
                                    controller: "BrandProductsCtrl"
                                }
                            }
                        }).state("tab.products-totw", {
                            url: "totw/:title?_id",
                            authenticated: !0,
                            screen: "TOTW",
                            type: "totw",
                            views: {
                                "tab-inspiration": {
                                    templateUrl: "views/products/products.html",
                                    controller: "ProductsCtrl"
                                }
                            }
                        })
                }]).controller("ProductsCtrl", ["$scope", "$state", "$timeout", "$localytics", "$ionicNavBarDelegate", "$ionicScrollDelegate", "$ionicBackdrop", "FilterService", "ProductsResource", "ProductsService", "ProductsModalService", "BrandsResource", "StyleFeedsResource", "Me",
                function (a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
                    function o(b, c, d, e) {
                        "tab.inspiration" === b.name && "tab.products" === d.name && null !== e.search && j.deleteProducts(a.context.key)
                    }

                    Adjust.trackEvent("5mkrpk"),
                        a.ProductsModalService = k,
                        a.view = {
                            multiView: !1,
                            settings: n.settings,
                            title: "",
                            helpTitle: "What is the swipe view?",
                            helpMessage: 'Personalise your style by swiping through products. Swipe right to <b class="balanced">save</b> and left to <b class="assertive">hide</b>',
                            productHeight: Math.floor((screen.height - 112) / 2),
                            productWidth: screen.width / 2,
                            filtersSelected: !1,
                            disableFilters: !1
                        },
                        a.closeHelp = function () {
                            n.settings.hide_help_sw || (n.settings.hide_help_sw = !0, n.save())
                        },
                        a.modal = j.modal,
                        a.context = {
                            filter: h.getQuery(),
                            view: a.view.multiView ? "multiview" : "single",
                            key: !1
                        },
                        a.localyticsAttributes = {
                            type: b.current.type,
                            age: n.age || "Unknown",
                            gender: n.gender || "Unknown"
                        },
                        a.loadProducts = _.throttle(function (b, c) {
                                return !b && a.products && a.products.records && !a.products.has_more ? !1 : j.fetchProducts(b, c)
                            },
                            600, {
                                leading: !0,
                                trailing: !1
                            }),
                        a.filterProducts = function (b, c) {
                            j.clearProducts(b),
                                a.loadProducts(b, c)
                        },
                        a.setupProductFeed = function (b, c) {
                            if (b.match(/tab.products/i)) switch (a.context.name = c.title ? c.title : a.view.title, b) {
                                case "tab.products":
                                    var e = {};
                                    a.context.key = "new-in",
                                        c.search && (e.search = c.search, a.context.key = "search"),
                                        c._id && (a.view.disableFilters = !0, a.view.multiView = !0, e._id = c._id.split(","), a.context.key = "look"),
                                        a.products = j.getProducts(a.context.key),
                                        a.loadProducts(a.context.key, e),
                                        a.context.name = a.view.title = c.search ? c.search : "New In",
                                        a.localyticsAttributes.title = a.context.name,
                                        d.tagEvent("Shopping", a.localyticsAttributes, 0);
                                    break;
                                case "tab.products-sale":
                                    a.context.key = "sale",
                                        a.products = j.getProducts(a.context.key),
                                        a.loadProducts(a.context.key),
                                        a.context.name = a.view.title = "Sales",
                                        a.localyticsAttributes.title = a.context.name,
                                        d.tagEvent("Shopping", a.localyticsAttributes, 0);
                                    break;
                                case "tab.products-totw":
                                    a.view.disableFilters = !0,
                                        a.view.multiView = !0,
                                        a.context.key = "totw",
                                        a.context.name = "Trend of the Week",
                                        a.view.title = c.title,
                                        i.find({
                                            _id: c._id.split(",")
                                        }).then(function (b) {
                                                a.products = b
                                            }),
                                        a.localyticsAttributes.title = a.context.name,
                                        d.tagEvent("Shopping", a.localyticsAttributes, 0)
                            }
                        },
                        a.$on("$stateChangeStart",
                            function (b, c, d, e, f) {
                                a.setupProductFeed(c.name, d),
                                    o(c, d, e, f)
                            }),
                        a.setupProductFeed(b.current.name, b.params),
                        a.checkScroll = function () {
                            var b = f.$getByHandle("multiview").getScrollPosition().top,
                                c = f.$getByHandle("multiview").getScrollView().__maxScrollTop;
                            b >= c && !a.products.loading && a.products.has_more !== !1 && a.loadProducts(a.context.key)
                        },
                        e.title(a.context.name),
                        a.refresh = function () {
                            a.$broadcast("scroll.refreshComplete")
                        },
                        a.$watch("products.records.length",
                            function (b) {
                                a.context.key && b && 10 > b && a.products.has_more && a.loadProducts(a.context.key)
                            }),
                        a.$watch("products.filters", _.throttle(function (b, c) {
                                b && c && b !== c && (a.view.filtersSelected = h.filtersSelected(b), a.filterProducts(a.context.key, h.getQuery(b)))
                            },
                            300, {
                                leading: !1,
                                trailing: !0
                            }), !0),
                        a.$on("destroy",
                            function () {
                                ionic.Platform.isWebView() && window.CollectionRepeatImage.cancelAll()
                            })
                }]).controller("ProductsBrandCtrl", ["$controller", "$scope", "$state", "$localytics", "BrandsResource", "ProductsService", "Me",
                function (a, b, c, d, e, f, g) {
                    angular.extend(this, a("ProductsCtrl", {
                        $scope: b
                    })),
                        b.setupProductFeed = function (a, c) {
                            if (a.match(/tab.products/i)) switch (b.context.name = c.title ? c.title : b.view.title, a) {
                                case "tab.products-brand":
                                    e.get(c.brand).then(function (a) {
                                        b.context.key = a,
                                            b.context.type = "Brand",
                                            b.context.name = a.name,
                                            b.context.b_id = a._id,
                                            b.localyticsAttributes.featured = a.featured[g.gender].enabled ? "Yes" : "No",
                                            b.view.title = a.name,
                                            b.products = f.getProducts(b.context.key),
                                            b.loadProducts(b.context.key),
                                            b.localyticsAttributes.title = b.context.name,
                                            d.tagEvent("Shopping", b.localyticsAttributes, 0)
                                    })
                            }
                        },
                        b.$on("$stateChangeStart",
                            function (a, c, d) {
                                b.setupProductFeed(c.name, d)
                            }),
                        b.setupProductFeed(c.current.name, c.params)
                }]).controller("ProductsStyleFeedCtrl", ["$controller", "$scope", "$state", "$localytics", "ProductsService", "StyleFeedsResource",
                function (a, b, c, d, e, f) {
                    angular.extend(this, a("ProductsCtrl", {
                        $scope: b
                    })),
                        b.setupProductFeed = function (a, c) {
                            if (a.match(/tab.products/i)) switch (b.context.name = c.title ? c.title : b.view.title, a) {
                                case "tab.products-stylefeed":
                                    f.get(c.stylefeed).then(function (a) {
                                        b.context.key = a,
                                            b.context.type = "Stylefeed",
                                            b.context.name = a.name,
                                            b.context.t_id = a._id,
                                            b.view.title = a.name,
                                            b.products = e.getProducts(b.context.key),
                                            b.loadProducts(b.context.key),
                                            b.localyticsAttributes.title = b.context.name,
                                            d.tagEvent("Shopping", b.localyticsAttributes, 0)
                                    })
                            }
                        },
                        b.$on("$stateChangeStart",
                            function (a, c, d) {
                                b.setupProductFeed(c.name, d)
                            }),
                        b.setupProductFeed(c.current.name, c.params)
                }])
    }();
var ProductCtrl = ["$scope", "$state", "$timeout", "$localytics", "$ionicLoading", "$ionicScrollDelegate", "$ionicSlideBoxDelegate", "BrandModalService", "BrandsResource", "DeviceService", "ImagesModalService", "ProductModalService", "ProductsResource", "ProductsService", "Product", "ShareService", "Me", function (a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q) {
    function r(b, c) {
        a.product = b,
            a.context = c,
            a.view.stockIndex = 0,
            a.stockItems = a.product.merchants[a.view.merchantIndex].stock,
            g.$getByHandle("product-images").select(0),
            g.$getByHandle("product-images").enableSlide(1 === a.stockItems[a.view.stockIndex].images.length ? !1 : !0),
            f.$getByHandle("product").scrollTop()
    }

    a.ProductModalService = l,
        a.view = {
            currentSlideIndex: 0,
            savedProduct: b.is("tab.saved-product"),
            merchantIndex: 0,
            lowStockThreshold: 10,
            stockIndex: 0
        },
        a.context = a.$parent.context ? a.$parent.context : {
            view: "single",
            name: "Product Information",
            featured: !1
        },
        a.buy = function (a, b, c, d) {
            n.buyProduct(a, b, c, d)
        },
        a.hide = function (a, b, c) {
            c ? (e.show({
                template: '<div>Product hidden</div><div class="icon icon-thumb-down" style="font-size: 72pt;"></div>',
                duration: 600
            }), b.swiped = !1) : (q.settings.hide_help_sw || (q.settings.swipes++, q.settings.swipes >= 3 && (q.settings.hide_help_sw = !0, q.save())), b.swiped = !0),
                n.hideProduct(a, b)
        },
        a.save = function (a, b, c) {
            c ? (e.show({
                template: '<div>Product saved</div><div class="icon icon-thumb-up" style="font-size: 72pt;"></div>',
                duration: 600
            }), b.swiped = !1) : (q.settings.hide_help_sw || (q.settings.swipes++, q.settings.swipes >= 3 && (q.settings.hide_help_sw = !0, q.save())), b.swiped = !0),
                n.saveProduct(a, b)
        },
        a.share = function (a) {
            n.shareProduct(a)
        },
        a.viewBrand = function (a) {
            e.show({
                template: "Loading " + a.name
            }),
                i.get(a._id).then(function (a) {
                    e.hide(),
                        h.show(a)
                })
        },
        a.viewImages = function (a, b) {
            k.show(a, b)
        },
        a.updateStockIndex = function (b) {
            a.view.stockIndex = b,
                a.stockItems = a.product.merchants[a.view.merchantIndex].stock
        },
        a.updateSlideIndex = function (b) {
            a.view.currentSlideIndex = b
        },
        a.$on("modal.product.show",
            function (b, c, e) {
                d.tagScreen("Product"),
                    c instanceof o && !a.mlzProduct ? r(c, e) : angular.isString(c) && m.get(c).then(function (a) {
                        r(a, e)
                    })
            }),
        a.$on("modal.product.hide",
            function () {
                a.stockItems = []
            })
}];
angular.module("runway.controllers.products").config(["$stateProvider", function (a) {
    a.state("tab.product", {
        url: "products/:product",
        authenticated: !0,
        screen: "Product",
        views: {
            "tab-inspiration": {
                templateUrl: "views/products/information.html",
                controller: "ProductsCtrl"
            }
        }
    })
        .state("tab.product-brand", {
            url: "products/brand/:brand",
            authenticated: !0,
            screen: "Product Brand",
            views: {
                "tab-inspiration": {
                    templateUrl: "views/brands/brand.html",
                    controller: "BrandsCtrl"
                }
            }
        })
}]).controller("ProductCtrl", ProductCtrl),
    function () {
        "use strict";
        angular.module("runway.controllers.saved", []).config(["$stateProvider",
                function (a) {
                    a.state("tab.saved", {
                        url: "saved",
                        authenticated: !0,
                        screen: "Saved Items",
                        views: {
                            "tab-saved": {
                                templateUrl: "views/saved/saved.html",
                                controller: "SavedCtrl"
                            }
                        }
                    }).state("tab.saved-product", {
                            url: "saved/:product",
                            authenticated: !0,
                            screen: "Saved Product",
                            views: {
                                "tab-saved": {
                                    templateUrl: "views/saved/product.html",
                                    controller: "SavedCtrl"
                                }
                            }
                        })
                }]).factory("SavedViewService", [function () {
                var a = {
                    editTitle: "Edit",
                    editingUserProducts: !1,
                    order: "-updated_at",
                    filter: {},
                    defaultFilters: {
                        selection: "-updated_at",
                        options: [
                            {
                                name: "Most Recent",
                                value: "-updated_at"
                            },
                            {
                                name: "Price",
                                value: "price.current"
                            },
                            {
                                name: "Price drop",
                                value: "price_drop"
                            },
                            {
                                name: "Brand",
                                value: "brand.name"
                            }
                        ]
                    },
                    filters: {},
                    loading: !1,
                    merchantIndex: 0,
                    stockIndex: 0
                };
                return {
                    view: a
                }
            }]).controller("SavedCtrl", ["$scope", "$state", "$localytics", "$ionicPopup", "$ionicHistory", "$ionicListDelegate", "$ionicPopover", "$ionicScrollDelegate", "$ionicSlideBoxDelegate", "SavedViewService", "UserProductsResource", "ShareService", "StyleFeedsResource", "DeviceService", "Me",
                function (a, b, c, d, e, f, g, h, i, j, k, l, m, n, o) {
                    function p() {
                        angular.forEach(a.view.filters.options,
                            function (b) {
                                b.value === a.view.order && (b.selected = !0)
                            })
                    }

                    function q() {
                        i.$getByHandle("product-images").select(0),
                            i.$getByHandle("product-images").enableSlide(1 === a.stockItems[a.view.stockIndex].images.length ? !1 : !0)
                    }

                    function r() {
                        f.$getByHandle("saved-items-list").closeOptionButtons()
                    }

                    function s() {
                        angular.copy(a.view.defaultFilters, a.view.filters),
                            m.find().then(function (b) {
                                b.records.length > 0 && (a.view.filters.options.push({
                                    name: "Style Feeds",
                                    disabled: !0,
                                    selected: !1
                                }), angular.forEach(b.records,
                                    function (b) {
                                        a.view.filters.options.push({
                                            name: b.name,
                                            value: b.name,
                                            selected: !1
                                        })
                                    }), p())
                            })
                    }

                    a.view = j.view,
                        o.context = "saved",
                        g.fromTemplateUrl("views/saved/popover.html", {
                            scope: a
                        }).then(function (b) {
                                a.popover = b
                            }),
                        a.openPopover = function (b) {
                            a.popover.show(b)
                        },
                        a.closePopover = function () {
                            a.popover.hide()
                        },
                        a.$on("$destroy",
                            function () {
                                a.popover.remove()
                            }),
                        a.$on("popover.hidden",
                            function () {
                            }),
                        a.$on("popover.removed",
                            function () {
                            }),
                        a.exact = function (a, b) {
                            return a.name == b.name
                        },
                        a.update = function (b) {
                            switch (console.log("Selection", b), b) {
                                case "-updated_at":
                                    a.view.order = b,
                                        a.view.filter = {};
                                    break;
                                case "price.current":
                                    a.view.order = b,
                                        a.view.filter = {};
                                    break;
                                case "price_drop":
                                    a.view.order = "-updated_at",
                                        a.view.filter = {
                                            price_drop: !0
                                        };
                                    break;
                                case "brand.name":
                                    a.view.order = b,
                                        a.view.filter = {};
                                    break;
                                default:
                                    a.view.order = "-updated_at",
                                        a.view.filter = {
                                            context: {
                                                name: b
                                            }
                                        }
                            }
                            a.view.selection = b,
                                a.closePopover(),
                                h.$getByHandle("saved-items").scrollTop(!0)
                        },
                        a.userproducts = k.data,
                        a.loadUserProducts = _.throttle(function () {
                                a.view.loading = !0,
                                    k.find({
                                        limit: 200
                                    }).then(function () {
                                            a.view.loading = !1
                                        })
                            },
                            1e3, {
                                leading: !0,
                                trailing: !1
                            }),
                        a.loadUserProducts(),
                        n.register(),
                        a.product = k.data.item,
                        a.stockItems = a.product.merchants[0].stock,
                        b.params.product && k.get(b.params.product).then(function (b) {
                            a.product = b,
                                a.stockItems = a.product.merchants[0].stock,
                                q()
                        }),
                        q(),
                        a.checkScroll = function () {
                            var b = h.$getByHandle("saved-items").getScrollPosition().top,
                                c = h.$getByHandle("saved-items").getScrollView().__maxScrollTop;
                            b >= c && !a.view.loading && a.userproducts.has_more !== !1 && a.loadUserProducts()
                        },
                        a.viewUserProduct = function (a) {
                            k.data.item = a,
                                b.go("tab.saved-product", {
                                    product: a._id
                                })
                        },
                        a.deleteUserProduct = function (f) {
                            k.destroy(f).then(function () {
                                    r(),
                                        c.tagEvent("Product Action", {
                                                item: "userproduct",
                                                action: "delete",
                                                product: f.p_id,
                                                name: f.name,
                                                brand: f.brand.name,
                                                merchant: f.merchants[0].name || "Unknown",
                                                product_gender: f.gender,
                                                colour: f.colour,
                                                type: f.type,
                                                age: o.age || "Unknown",
                                                gender: o.gender || "Unknown",
                                                context: "saved",
                                                featured: "No"
                                            },
                                            0),
                                        b.params.product && e.goBack()
                                },
                                function (b) {
                                    console.log("Error removing user product", f, b),
                                        d.alert({
                                            title: "Oops :(",
                                            template: "There was a problem removing this user product. Please try again"
                                        }).then(function () {
                                                a.userproducts.push(f)
                                            })
                                })
                        },
                        a.share = function (a) {
                            l.share(a,
                                function () {
                                    r(),
                                        Adjust.trackEvent("d1u5g2"),
                                        c.tagEvent("Product Action", {
                                                item: "userproduct",
                                                action: "share",
                                                product: a._id,
                                                name: a.name,
                                                brand: a.brand.name,
                                                merchant: a.merchants[0].name || "Unknown",
                                                product_gender: a.gender,
                                                colour: a.colour,
                                                type: a.type,
                                                age: o.age || "Unknown",
                                                gender: o.gender || "Unknown",
                                                context: "saved",
                                                featured: "No"
                                            },
                                            3)
                                },
                                function () {
                                    console.log("Something went wrong when sharing product", a)
                                },
                                function () {
                                    console.log("Share cancelled")
                                })
                        },
                        a.toggleEditUserProducts = function () {
                            a.view.editingUserProducts = !a.view.editingUserProducts,
                                a.view.editTitle = a.view.editingUserProducts ? "Cancel" : "Edit"
                        },
                        s(),
                        a.$on("$stateChangeStart",
                            function (b, c) {
                                "tab.saved" === c.name && (a.loadUserProducts(), s())
                            })
                }])
    }(),
    function (a) {
        "use strict";
        a.module("runway.controllers.stylefeeds", []).config(["$stateProvider",
                function (a) {
                    a.state("tab.stylefeeds", {
                        url: "style-feeds",
                        authenticated: !0,
                        screen: "Stylefeeds",
                        views: {
                            "tab-stylefeeds": {
                                templateUrl: "views/style-feeds/style-feeds.html",
                                controller: "StyleFeedsCtrl"
                            }
                        }
                    })
                }]).factory("StyleFeedsViewService", ["Me",
                function (a) {
                    var b = {
                        editTitle: "Edit",
                        editingStyleFeeds: !1,
                        settings: a.settings,
                        helpTitle: "What are Style Feeds?",
                        helpMessage: 'Personalised feeds of clothes tailored to your tastes and styles. Tap <i class="icon icon-new"></i> to make one now!',
                        search: {
                            name: ""
                        }
                    };
                    return {
                        view: b
                    }
                }]).controller("StyleFeedsCtrl", ["$scope", "$state", "$localytics", "StyleFeed", "StyleFeedsViewService", "StyleFeedsResource", "StylefeedService", "Me",
                function (a, b, c, d, e, f, g, h) {
                    a.view = e.view,
                        a.closeHelp = function () {
                            h.settings.hide_help_sf || (h.settings.hide_help_sf = !0, h.save())
                        },
                        a.stylefeeds = f.data,
                        f.find(),
                        a.addStyleFeed = function () {
                            var b = new d;
                            a.closeHelp(),
                                b.filter.gender = h.gender,
                                g.open(b)
                        },
                        a.toggleEditingStyleFeeds = function () {
                            a.view.editingStyleFeeds = !a.view.editingStyleFeeds,
                                a.view.editTitle = a.view.editingStyleFeeds ? "Cancel" : "Edit"
                        },
                        a.editStyleFeed = function (a) {
                            g.open(a)
                        },
                        a.deleteStyleFeed = function (a) {
                            c.tagEvent("Stylefeed Interaction", {
                                    action: "delete",
                                    age: h.age || "Unknown",
                                    gender: h.gender || "Unknown"
                                },
                                0),
                                f.destroy(a)
                        },
                        a.selectStyleFeed = function (b) {
                            a.view.editingStyleFeeds ? a.editStyleFeed(b) : a.showProducts(b)
                        },
                        a.showProducts = function (a) {
                            b.go("tab.products-stylefeed", {
                                stylefeed: a._id
                            })
                        },
                        a.$on("modal.stylefeed.hide",
                            function (b, c) {
                                c && a.showProducts(c)
                            })
                }])
    }(angular),
    function (a) {
        "use strict";
        a.module("runway.controllers.stylefeeds").controller("StyleFeedCtrl", ["$scope", "$filter", "$localytics", "$ionicActionSheet", "$ionicScrollDelegate", "CameraService", "StyleFeed", "FiltersService", "ProductsService", "StylefeedService", "Me",
            function (a, b, c, d, e, f, g, h, i, j, k) {
                function l() {
                    a.stylefeed.filter.min_price || a.stylefeed.filter.max_price || (a.stylefeed.filter.min_price = 0, a.stylefeed.filter.max_price = a.filters.filter.max_price)
                }

                function m(a) {
                    return a && a.name && a.filter.gender && a.name.length && a.filter.gender.length
                }

                a.title = "New style feed",
                    a.metadata = h.metadata,
                    a.view = {
                        currency: b("regionToCurrency")(k.regions[0]),
                        showNext: !1,
                        showPrev: !1,
                        loading: !1,
                        count: 0
                    },
                    h.refresh().then(function () {
                        e.resize()
                    }),
                    a.walkthrough = j.ctrl,
                    a.saveStyleFeed = function (b) {
                        0 === a.stylefeed.filter.min_price && delete a.stylefeed.filter.min_price,
                            a.stylefeed.filter.max_price >= 250 && delete a.stylefeed.filter.max_price,
                            c.tagEvent("Stylefeed Interaction", {
                                    action: b._id ? "update" : "create",
                                    age: k.age || "Unknown",
                                    gender: k.gender || "Unknown"
                                },
                                0),
                            j.save(b),
                            i.products.stylefeed.metadata.refresh = !0
                    },
                    a.cancelStyleFeed = function () {
                        j.close()
                    },
                    a.setGender = function (b) {
                        a.filters = h.getFilterForGender(b),
                            a.stylefeed.clear(b)
                    },
                    a.toggleFilter = function (a, b, c, d) {
                        j.toggleFilter(a, b, c, d)
                    },
                    a.currencyFilter = function (a) {
                        return "£" + a
                    },
                    a.hasSelected = function (a) {
                        return _.any(a, {
                            selected: !0
                        })
                    },
                    a.next = function () {
                        j.ctrl.select(j.ctrl.next())
                    },
                    a.prev = function () {
                        j.ctrl.select(j.ctrl.previous())
                    },
                    a.$on("modal.stylefeed.open",
                        function () {
                            void 0 === j.stylefeed.filter.max_price && (j.stylefeed.filter.max_price = 250),
                                a.stylefeed = j.stylefeed,
                                a.filters = h.getFilterForGender(a.stylefeed.filter.gender),
                                l(),
                                h.setSelections(a.filters.filter, a.stylefeed.filter)
                        }),
                    a.setTitle = function (b) {
                        a.title = b
                    },
                    a.canSaveStyleFeed = function (a) {
                        return a && a.name && a.filter.gender && a.name.length && a.filter.gender.length
                    },
                    a.calculateStyleFeed = function (b) {
                        switch (b) {
                            case 0:
                                a.setTitle("New style feed"),
                                    a.view.showPrev = !1,
                                    a.view.showNext = m(a.stylefeed);
                                break;
                            case 1:
                                a.setTitle("Select types"),
                                    a.view.showPrev = !0,
                                    a.view.showNext = !0;
                                break;
                            case 2:
                                a.setTitle("Select colours"),
                                    a.view.showPrev = !0,
                                    a.view.showNext = !0;
                                break;
                            case 3:
                                a.setTitle("Select brands"),
                                    a.view.showPrev = !0,
                                    a.view.showNext = !0;
                                break;
                            case 4:
                                a.setTitle("Set price range"),
                                    a.view.showPrev = !0,
                                    a.view.showNext = !1
                        }
                    },
                    a.choosePhoto = function () {
                        d.show({
                            buttons: [
                                {
                                    text: "Take Photo",
                                    identifier: "CAMERA"
                                },
                                {
                                    text: "Choose Existing Photo",
                                    identifier: "PHOTOLIBRARY"
                                }
                            ],
                            cancelText: "Cancel",
                            buttonClicked: function (b, c) {
                                switch (c.identifier) {
                                    case "CAMERA":
                                        f.startCamera().then(function (b) {
                                            a.stylefeed.image = b
                                        });
                                        break;
                                    case "PHOTOLIBRARY":
                                        f.openCameraRoll().then(function (b) {
                                            a.stylefeed.image = b
                                        });
                                        break;
                                    default:
                                        console.log("Index problem", b)
                                }
                                return !0
                            }
                        })
                    },
                    a.$watch("stylefeed", _.debounce(function (b) {
                            if (b) {
                                a.view.showNext = m(b),
                                    a.view.loading = !0;
                                var c = b.filter;
                                b._id && (c.style_feed = b._id),
                                    h.query(c).then(function (b) {
                                        a.view.loading = !1,
                                            a.view.count = b.data.count
                                    })
                            }
                        },
                        300), !0)
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("runway").directive("ngEnter",
            function () {
                return function (a, b, c) {
                    b.bind("keydown keypress",
                        function (b) {
                            13 === b.which && (a.$apply(function () {
                                a.$eval(c.ngEnter)
                            }), b.preventDefault())
                        })
                }
            })
    }(angular),
    function (a) {
        "use strict";
        a.module("runway").directive("facebookConnect", [function () {
            return {
                restrict: "E",
                scope: {
                    user: "=",
                    text: "@"
                },
                controller: ["$scope", "$state", "$http", "$localytics", "$ionicLoading", "$ionicPopup", "AuthenticationService", "Me",
                    function (b, c, d, e, f, g, h, i) {
                        b.connectWithFacebook = function (b) {
                            console.log("Connecting with Facebook", b),
                                facebookConnectPlugin.login(["email", "user_birthday"],
                                    function () {
                                        f.show({
                                            template: "Connecting with facebook..."
                                        }),
                                            facebookConnectPlugin.getAccessToken(function (b) {
                                                d({
                                                    method: "GET",
                                                    url: "https://api.mallzee.com/facebook-authenticate",
                                                    params: {
                                                        access_token: b
                                                    }
                                                }).then(function (b) {
                                                        a.extend(i, b.data),
                                                            h.load(i),
                                                            e.tagEvent("Authentication", {
                                                                    action: "login",
                                                                    type: "facebook"
                                                                },
                                                                1),
                                                            i.refresh().then(function () {
                                                                    c.go("tab.inspiration"),
                                                                        f.hide()
                                                                },
                                                                function () {
                                                                    f.hide()
                                                                })
                                                    },
                                                    function () {
                                                        f.hide()
                                                    })
                                            })
                                    },
                                    function (a) {
                                        g.alert({
                                            title: "Facebook error",
                                            subTitle: a
                                        }),
                                            f.hide()
                                    })
                        }
                    }],
                template: '<button class="button button-block button-facebook icon-left icon-facebook" ng-click="connectWithFacebook(user)">{{text}}</button>'
            }
        }])
    }(angular),
    function (a) {
        "use strict";
        a.module("runway").directive("mlzHelp", ["$animate",
            function (b) {
                return {
                    restrict: "E",
                    scope: {
                        action: "@",
                        hide: "=",
                        onClose: "&",
                        message: "@",
                        title: "@"
                    },
                    template: '<div style="overflow: hidden;"><button class="close button button-clear icon ion-ios7-close-outline" ng-click="close()"></button><h1 ng-bind-html="title"></h1><p ng-bind-html="message"></p><h4 ng-bind-html="action"></h4></div>',
                    link: function (c, d) {
                        d.addClass("mlz-help slide-up");
                        var e = a.element(d.parent().children()[1]);
                        "ION-LIST" === e[0].tagName && (e = e.children()),
                            c.hide || (e.addClass("slide-up"), b.addClass(e, "help-active")),
                            c.close = function () {
                                c.hide = !0,
                                    c.onClose(arguments)
                            },
                            c.$watch("hide",
                                function (a, c) {
                                    a && a !== c && b.removeClass(e, "help-active")
                                })
                    }
                }
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("runway").directive("mlzSearch", [function () {
            return {
                restrict: "E",
                scope: {
                    placeholder: "@",
                    model: "=",
                    perform: "&"
                },
                controller: ["$scope",
                    function (a) {
                        a.clearSearch = function () {
                            delete a.model
                        }
                    }],
                template: '<div class="item item-input-inset"><button ng-if="model && model.length > 0" class="button button-clear icon ion-ios7-close-outline" ng-click="clearSearch()"></button><label class="item-input-wrapper"><i class="icon icon-search placeholder-icon"></i><form><input type="search" placeholder="{{placeholder}}" ng-model="model" /></form></label></div>',
                link: function (a, b) {
                    var c = function (b) {
                            (13 === b.which || "blur" === b.type) && (console.log(b.which), a.perform())
                        },
                        d = b[0].getElementsByTagName("input")[0];
                    d.addEventListener("keydown", c, !1),
                        d.addEventListener("keypress", c),
                        d.onblur = c
                }
            }
        }])
    }(angular),
    function (a) {
        "use strict";
        a.module("runway").directive("mlzShop", ["$state", "$ionicLoading", "ProductsResource", "ProductsService",
            function (a, b, c, d) {
                return {
                    restrict: "AE",
                    scope: {
                        product: "=",
                        products: "=",
                        title: "@",
                        brand: "@"
                    },
                    link: function (e, f) {
                        f.bind("click",
                            function () {
                                e.products && a.go("tab.products", {
                                    _id: e.products,
                                    title: e.title
                                }),
                                    e.product && (b.show({
                                        template: "Fetching product details"
                                    }), c.get(e.product).then(function (a) {
                                        d.showProduct(a),
                                            b.hide()
                                    })),
                                    e.brand && a.go("tab.products-inspiration-brand", {
                                        brand: e.brand,
                                        title: e.title
                                    })
                            })
                    }
                }
            }])
    }(angular),
    function (a) {
        "use strict";
        a.module("runway").directive("mlzNewIn", [function () {
            return {
                restrict: "E",
                templateUrl: "views/new-in.html",
                scope: {
                    products: "=?",
                    columns: "="
                },
                link: function (a) {
                    a.columns || (a.columns = !1)
                }
            }
        }])
    }(angular),
    function (a) {
        "use strict";
        String.prototype.splice = function (a, b, c) {
            return this.slice(0, a) + c + this.slice(a + Math.abs(b))
        };
        var b = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAX4AAAHRAgMAAAAQ/jpUAAAACVBMVEUAAADl5eXl5eWYP5lBAAAAA3RSTlMA/ABCf2pvAAAGi0lEQVR4AezRoXHEMBCGUTeRvkLWYFGw+jEPMbCrDAi6BX6jUTJzYH8q8CR927vtY9xT+97uuUU28LsGGmiggQYaaKCBBhpooIEGGmjg2v8ZOGMZKLcswBFjHTjjCch14HgAztjXgYjxAMQycEV5QTkcq8D5BNwRSYAJ9grUUwBMkBVwBAHllwuACACQoAKOEMkEFUAEAEhQAUeIZIIKIAIAJKiAI0QqAQBFkB8JQBEilQCAIkQqAQBFiEQCAIwAPhIAI0QiAQBGiEQCAIwQiQQAGOEYSADAEZQAgCMoAQBHUAIAjoAEABDBCQAoghMAQAQnAKAITgBAEZwAgCI4AQBEcAIAjMAEABiBCQA4ghIAcAQmAOAISgDAEZgAgCMoAQBHcAIAjuAEBhxBf2rgAoALGbingX0SOGKycU4C5+wLhoC6fRK4ASzuSgHra6CB9TVwxMtGAw000EADDTTQQAMNNPCmgNfAAoC03ABwRtnLeXj5eKGv7Yiy8cdA1OUKEHWfP+3bwYrcSAwG4Kf8BaN7DqX3UQ57V0B6yoXYPVYqHsJSUm8M1afgg7+4i//vluj5HwApBd5wBj5doVgA/ksONrCBDfwFwLdagHQG/PGA1QKwuXSfD2gxMCaA2wEUAx8TINUANwH6FTCqAdIvggz5uwH7CrBqAPZFkBF/N+D5AyYDWgSM+yinpqA1QP4M/LME8BdRTte5BZAyQJsB+iLK6fB7AC8D7B6wC5AlAPdRvlzYIuDdwLjtinw0ZcBIANcB0g3cRzlfbQGkENBm4D7K+ehXAbsDvANADzB3xceUalsGPAPn8VIhMEdZdGqKaiAMAFcCkgFQOTBFmcOnplgH9FcgAEgfIBHaBpACEaH54GUdEEsARYTlbIguA5FC9RPwWoAyAJ7rI2wd8LkWQAnwVYATMHAMhhdAEauARMyAkRYCkQE6fx2bAS0EmGeAI2wNoDyMs6SppAhABuh8AqkEJGKe92zkKV/XAfsEvh+AZ2A9BznKRw5KAYoMyDSURHgB4BfAEeGUAVsFkIGRgTNny4DMUTbSUoDnMlLOAEoBhkQgN4WvA5S74ieXm8LWASSAlMMhxYBkgMISIKElgF0AQjESgAKALUUZovAL8AqA1DOABFgJAB0J+EAeb75VAPOIkJrCUANIAqbxpgSYR4T3AYwqQJEBVAPTuy4NgN0DowcY5cC0TvAGwO8BKwNGXrNYKzDygdQBcg9oGZCzRdoB6AXkf/cAKAemVXULYHfAqANwATZ6AZi3AH4HWB2Qo2z1QI5yXh+1A1oIpHRpD6C/A9wOoBDIXdED2O/AqARyV7QAKcrvA6wUyB3aAsgMgNoBLQVSVzQBOgNcC9DvAGoBm6l2YFQC84jQAfjbASsGcle0ADIBVA3wDGgxMEe5HeBqgDRTJ1MJzFFuB6QamLtiVANzlL0bsGpgjnI3QPUAZwqk9YBmqh3gcmAaERj1gL0VkGpgTtroBrwBGJmyBkAy1Q1QB8CJIu0A9KLaAe4ActIYTwekA8hRHt2AtwDjonoAuShrBqQHSEnTGdjAnLSHAtwOpCg/E5B4HzAeA0yv+78mfQ7woxv4HlfSngloeC+AC8BDAYn7dJVNOIPvoiyPARycl/z1gL0DsEaADKSfgDQAmgCyJmC8coZ6gPUaPNhgrYCDGwAAzi8reraOZ5QdHN4DkAIQRVg9MAAIKUAO8Z7d9dEVAgqFFAH+KwADGcRzV8QSEJa/jrLa8QBpyIlFIDSVA6kdD3ABsgwEMjACHLgAjnXArvGGTF4ZiwOIAiAOIBSAfYAjDSNcAtj15d2AsFSnUQK8buaAgz3Ng1QE6Hk3xTjeezpNKQL8aAoODPK8DIkiIPR468UFlh6AywADDiV+ApJDVgI4yCIACjhAfmYvyoBQUgoDWMdnxsCFgJGeUZNr4JdCwFnPqDEi92gVEPyKGrPlMaoMiOOWBr5+clQL6Nl4ZC8gaoE4/9eUB81SwM8+egFcDPwIm5azxYBzKDIQhUAaYvOsXw1QeAK4HFBw2AVIOWCAxHfrAxxARI5ZMRBHkvMZFwOaPsvADYABwAuQLqBzX+TdQABoXgpeAHcD0gJYN+AXEM0A9QCRzrgH0LcB0gOkrm4C/F0AdQHxLoDbgDSb9QD2JiDaAH8PQH1AvAfgZwIpCPJMIAUhNvCHpNEGFl5rwAY2sIENbGADG9jABjawgQ1sYAMb2MAGNrCBDWzAHvEE/wIgequby/A1+AAAAABJRU5ErkJggg==";
        a.module("mallzee.images", []).directive("mlzCameraImage", ["$rootScope",
                function (a) {
                    return {
                        scope: {
                            ngSrc: "@"
                        },
                        link: function (b, c, d) {
                            function e(b) {
                                var e = b;
                                b && "jpg" !== f.exec(b)[1] ? e = "data:image/jpeg;base64," + b : "tablet" === a.device && (e = b.splice(d.mlzSrc.lastIndexOf("."), 0, "-large")),
                                    c[0].src = e
                            }

                            var f = /(?:\.([^.]+))?$/;
                            b.$watch("ngSrc",
                                function (a) {
                                    a && e(a)
                                })
                        }
                    }
                }]).provider("MallzeeImageService",
            function () {
                this.serviceUrl = "",
                    this.imageUrl = "",
                    this.setServiceUrl = function (a) {
                        this.serviceUrl = a
                    },
                    this.setImageUrl = function (a) {
                        this.imageUrl = a
                    },
                    this.$get = [function () {
                        var a = this;
                        return {
                            getServiceUrl: function () {
                                return a.serviceUrl
                            },
                            getImageUrl: function () {
                                return a.imageUrl
                            }
                        }
                    }]
            }).directive("mlzImg", [function () {
                return {
                    restrict: "E",
                    scope: {
                        src: "@",
                        id: "@"
                    },
                    template: '<img class="fade-in-not-out" />',
                    link: function (a, c) {
                        function d() {
                            k.classList.add("loaded")
                        }

                        function e() {
                            k.src = b,
                                k.classList.add("loaded")
                        }

                        function f() {
                            l || (i = Math.round(c[0].offsetWidth), j = Math.round(c[0].offsetHeight), k.addEventListener("load", d), k.addEventListener("error", e)),
                                l = !0
                        }

                        function g(a) {
                            k.src = a
                        }

                        function h(a) {
                            k.classList.remove("loaded"),
                                g(a)
                        }

                        var i, j, k = c.children()[0],
                            l = !1;
                        window.devicePixelRatio,
                            a.$watch("src",
                                function (a) {
                                    l || f(),
                                        h(a)
                                }),
                            a.$on("destroy",
                                function () {
                                    k.removeEventListener("load", d),
                                        k.removeEventListener("error", e),
                                        k = null
                                })
                    }
                }
            }])
    }(angular),
    angular.module("runway").directive("mlzScrollWindow",
        function () {
            return {
                restrict: "A",
                link: function (a, b) {
                    a.view && (a.view.productHeight = b[0].offsetHeight / 2, a.view.productWidth = b[0].offsetWidth / 2)
                }
            }
        }).directive("mlzProduct", ["$ionicGesture",
            function (a) {
                return {
                    restrict: "E",
                    templateUrl: "views/products/product.html",
                    controller: "ProductCtrl",
                    link: function (b, c, d) {
                        function e(a) {
                            n = !0,
                                l = o[0].clientWidth,
                                r.classList.remove("reset"),
                                j = 0,
                                k = 0,
                                h = a.gesture.deltaX,
                                i = a.gesture.deltaY,
                                m = l / 7
                        }

                        function f() {
                            n = !1,
                                r.classList.add("reset"),
                                j > m ? (r.style["-webkit-transform"] = "translate3d(200%, " + k + "px, 0)", b.$apply(d.swipeRight)) : -m > j ? (r.style["-webkit-transform"] = "translate3d(-200%, " + k + "px, 0)", b.$apply(d.swipeLeft)) : b.productCancel()
                        }

                        function g(a) {
                            ionic.requestAnimationFrame(function () {
                                n && (j = a.gesture.deltaX - h, k = a.gesture.deltaY - i, r.style["-webkit-transform"] = "translate3d(" + j + "px, " + k + "px, 0)", 0 > j && Math.abs(j) > m ? t.classList.add("active") : t.classList.remove("active"), j > 0 && Math.abs(j) > m ? s.classList.add("active") : s.classList.remove("active"))
                            })
                        }

                        var h = 0,
                            i = 0,
                            j = 0,
                            k = 0,
                            l = c[0].clientWidth,
                            m = l / 2,
                            n = !1,
                            o = angular.element(c.children()[0]),
                            p = c[0].getElementsByTagName("mlz-img"),
                            q = c[0].getElementsByTagName("button"),
                            r = p[0],
                            s = q[2],
                            t = q[1];
                        b.mlzProduct = !0,
                            c.addClass("product"),
                            t.classList.add("reset"),
                            s.classList.add("reset"),
                            b.productCancel = function () {
                                r.classList.add("reset"),
                                    r.style["-webkit-transform"] = "translateX(0)",
                                    r.style.opacity = 1,
                                    t.style.opacity = 1,
                                    s.style.opacity = 1
                            },
                            b.productCancel(),
                            a.on("dragstart", e, c),
                            a.on("dragend", f, c),
                            a.on("drag", g, c),
                            b.$on("$destroy",
                                function () {
                                    o = p = r = null,
                                        s = t = null
                                })
                    }
                }
            }]),
    function (a) {
        "use strict";
        a.module("runway").directive("mlzColours", [function () {
            return {
                restrict: "E",
                scope: {
                    radius: "@",
                    innerRadius: "@",
                    colours: "="
                },
                templateUrl: "res/images/multi-colours.svg",
                link: function (b) {
                    function c(a, b) {
                        function c(a) {
                            return a * (Math.PI / 180)
                        }

                        function d(a) {
                            return {
                                x: 1 * Math.cos(a),
                                y: 1 * Math.sin(a)
                            }
                        }

                        return {
                            start: d(c(a)),
                            end: d(c(b))
                        }
                    }

                    var d = 0;
                    b.$watch("colours",
                        function (e) {
                            b.slices = [],
                                a.forEach(e,
                                    function (a) {
                                        var e = c(d, d += 360 / b.colours.length);
                                        e.colour = a.hex,
                                            b.slices.push(e)
                                    })
                        })
                }
            }
        }])
    }(angular),
    function (a, b) {
        "use strict";
        b.views.Spinner = b.views.View.inherit({
            initialize: function (a) {
                function c(a) {
                    return o = a,
                        o && 0 !== o.length ? (n = s.children, p = new Array(o.length), t = o.length * y, void d()) : !1
                }

                function d() {
                    m = s.getBoundingClientRect().width,
                        v = m / 2,
                        w = t / 2,
                        u = v - t / 2,
                        q = v - w,
                        r = v + w,
                        x = t > m;
                    for (var a = 0; a < o.length; a++) n[a].style.position = "absolute",
                        n[a].style.width = y + "px";
                    e(u)
                }

                function e(a) {
                    for (var b = 0; b < n.length; b++) f(b, a + b * y, 0)
                }

                function f(a, b, c) {
                    var d = n[a],
                        e = d && d.style;
                    b = g(b),
                        e && (e.webkitTransitionDuration = e.MozTransitionDuration = e.msTransitionDuration = e.OTransitionDuration = e.transitionDuration = c + "ms", e.webkitTransform = "translate(" + b + "px,0)translateZ(0)", e.msTransform = e.MozTransform = e.OTransform = "translateX(" + b + "px)")
                }

                function g(a) {
                    return q > a && (a += t),
                        a > r && (a -= t),
                        Math.round(a)
                }

                function h(a) {
                    return x ? (H = !0, a.stopPropagation(), void a.preventDefault()) : !1
                }

                function i(a) {
                    return x ? (B = C = 0, a.stopPropagation(), void a.preventDefault()) : !1
                }

                function j(a) {
                    return x ? (H = !1, F = a.gesture.velocityX * D, (F > .2 || .2 > F) && (E = 200 * F, A = Date.now(), G = g(u + E), b.requestAnimationFrame(l)), a.stopPropagation(), void a.preventDefault()) : !1
                }

                function k(a) {
                    if (!x) return !1;
                    switch (B = a.gesture.distance - C, a.type) {
                        case "dragright":
                            D = 1,
                                u += B;
                            break;
                        case "dragleft":
                            D = -1,
                                u -= B
                    }
                    u = g(u),
                        C = a.gesture.distance,
                        e(u),
                        a.stopPropagation(),
                        a.preventDefault()
                }

                function l() {
                    var a, c;
                    !H && E && (a = Date.now() - A, c = -E * Math.exp(-a / 325), c > .5 || -.5 > c ? (u = g(G + c), e(u), b.requestAnimationFrame(l)) : e(u))
                }

                var m, n, o, p, q, r, s = a.el,
                    t = 0,
                    u = 0,
                    v = 0,
                    w = 0,
                    x = !1,
                    y = a.itemWidth,
                    z = a.itemHeight;
                if (s.style.display = "block", s.style.width = "100%", s.style.height = z + "px", s.classList.add("item-spinner"), s) {
                    var A, B = 0,
                        C = 0,
                        D = 0,
                        E = 0,
                        F = 0,
                        G = 0,
                        H = !1;
                    this.update = function (a) {
                        setTimeout(function () {
                            c(a)
                        })
                    },
                        this.resize = function () {
                            setTimeout(function () {
                                d()
                            })
                        },
                        b.onGesture("dragstart", i, s),
                        b.onGesture("dragend", j, s),
                        b.onGesture("dragleft", k, s),
                        b.onGesture("dragright", k, s),
                        b.onGesture("touch", h, s)
                }
            }
        }),
            a.module("mallzee.ionic", ["ionic"]).service("$ionicSpinnerDelegate", delegateService(["update", "resize"])).directive("ionSpinner", ["$ionicSpinnerDelegate",
                function (a) {
                    return {
                        restrict: "E",
                        scope: {
                            items: "="
                        },
                        controller: ["$scope", "$element", "$attrs",
                            function (c, d, e) {
                                var f = new b.views.Spinner({
                                        el: d[0],
                                        itemWidth: e.itemWidth,
                                        itemHeight: e.itemHeight
                                    }),
                                    g = a._registerInstance(f, e.delegateHandle);
                                c.$watch("items",
                                    function (a) {
                                        f.update(a)
                                    }),
                                    c.$on("$destroy", g)
                            }]
                    }
                }])
    }(angular, ionic),


    function (a) {
        "use strict";
        var b = {
            tagEvent: function (a, b, c) {
                console.log("[Localytics][Tag Event]", a, b, c)
            },
            tagScreen: function (a) {
                console.log("[Localytics][Tag Screen]", a)
            },
            setCustomerId: function (a) {
                console.log("[Localytics][Customer ID]", a)
            },
            setCustomerName: function (a) {
                console.log("[Localytics][Customer Name]", a)
            },
            setCustomerEmail: function (a) {
                console.log("[Localytics][Customer Email]", a)
            },
            setCustomDimension: function (a, b) {
                console.log("[Localytics][Custom Dimension]", a, b)
            },
            setProfileValue: function (a, b) {
                console.log("[Localytics][Profile Value]", a, b)
            },
            setPushToken: function (a) {
                console.log("[Localytics][Push Token]", a)
            }
        };

        angular.module("localytics", [])
            .run(function ($rootScope) {

                ///TODO: 不知道这里的参数
                function c() {
                    b.resume();
                    b.upload();
                }

                function d() {
                    b.resume();
                    b.upload();
                }

                function e() {
                    b.close();
                    b.upload()
                }


                ///TODO: Localytics 是个什么东西??
                if ("Localytics" in window) {
                    b = window.Localytics
                }
                //"Localytics" in window && (b = window.Localytics),
                document.addEventListener("deviceready", function () {
                    b.resume();
                    b.upload();
                }, false),

                    document.addEventListener("resume", function () {
                        b.resume();
                        b.upload();
                    }, false),

                    document.addEventListener("pause", function e() {
                        b.close();
                        b.upload()
                    }, false),


                    $rootScope.$on("$stateChangeStart", function (event, toState) {
                        if (toState.screen) b.tagScreen(toState.screen);
                    });

            })
            .service("$localytics", function ($rootScope) {
                $rootScope.$on("user.authenticated", function (a, c) {
                    b.setCustomerId(c._id),
                        b.setCustomerName(c.name.first + " " + c.name.last),
                        b.setCustomerEmail(c.email),
                        b.setCustomDimension(0, c.gender),
                        b.setCustomDimension(1, c.age),
                        b.setProfileValue("Gender", c.gender),
                        b.setProfileValue("Age", c.age),
                        b.setProfileValue("Region", c.regions[0])
                });
                return b;
            })
            .directive("tagEvent", function ($localytics) {
                return {
                    restrict: "A",
                    link: function (b, c, d) {
                        console.log("Localytics tag event directive");
                        $localytics.tagEvent(d.tagEvent, d.properties, d.value)
                    }
                }
            })
            .directive("tagScreen", function ($localytics) {
                return {
                    restrict: "A",
                    link: function (b, c, d) {
                        $localytics.tagScreen(d.tagScreen)
                    }
                }
            })
    }(angular),


    function (a) {
        "use strict";
        a.module("runway").directive("currentVersion", ["$http",
            function (a) {
                return {
                    restrict: "E",
                    template: '<div class="footer-overscroll"><div>Mallzee v{{version}}</div><div>Made with &lt;3 in Edinburgh</div></div>',
                    link: function (b, c) {
                        console.log("Current version"),
                            c[0].style.display = "block",
                            b.version = "DEVELOPMENT",
                            a.get("../package.json").success(function (a) {
                                b.version = a.version
                            })
                    }
                }
            }])
    }(angular)




    ,
    function (a) {
        "use strict";
        a.module("mallzee.filters", []).filter("capitalise", [function () {
                return function (a) {
                    return a && a.length > 0 ? a.substring(0, 1).toUpperCase() + a.substring(1) : a
                }
            }]).filter("diffById",
            function () {
                return function (a, b) {
                    return _.remove(a,
                        function (a) {
                            return !!_.find(b, {
                                _id: a._id
                            })
                        }),
                        a
                }
            }).filter("regionToCurrency",
            function () {
                return function (a) {
                    switch (a) {
                        case "GBR":
                        case "GBP":
                            return "£";
                        case "USA":
                        case "USD":
                        case "AUS":
                            return "$";
                        case "EUR":
                            return "€";
                        default:
                            return a
                    }
                }
            }).filter("sizeAvailible",
            function () {
                return function (a) {
                    return a && "string" == typeof a ? !a.match(/notavailable/i) : !1
                }
            })
    }(angular);

//service: User
angular.module("mallzee.models")
    .service("User", function (Base, Model) {
        var path = "me";

        function user(a) {
            this.authenticated = false;
            this.configure(path);
            this.settings = {};
            Model.call(this, a);
        }

        user.prototype = new Model();
        user.prototype.constructor = user;
        user.prototype.refresh = function () {
            var b = this;
            return Base.request("GET", this.$$path).then(function (c) {
                b.setData(c.data);
                Base.store.set("me", b);
                return b;
            })
        }
        user.prototype.save = function () {
            var b = this;
            return Base.request("PUT", d, this).then(function (c) {
                Base.store.set("me", b);
                return  c.data
            })
        }
        return user;

    });
