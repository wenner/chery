'use strict';
angular.module('chery.services')
    .factory('PlansService', function(ENV, $q , $resource, $log, $http , User) {
        var plans = [];
        var nextPage = 1;
        var hasNextPage = true;
        return {
            query: function() {
                var defer = $q.defer();
                var params = {
                    data: {startdate:"2013-01-01"}
                };
                $http
                    .get(ENV.api + 'chery/plan.asmx/GetPlans' , {params:params})
                    .success(function(result){
                        if (!result.isok){
                            defer.reject(result.message);
                        }else{
                            plans = result.data.RowSet.R.plans.R;
                            defer.resolve(result);
                        }
                    })
                    .error(function(err , status){
                        //alert("error")
                        defer.reject(err ? err.error : err, status);
                    })
                return defer.promise;
            },
            /*
            pagination: function() {
                return getMaintains(currentTab, nextPage, function(response) {
                    if (response.data.length < 10) {
                        $log.debug('response data length', response.data.length);
                        hasNextPage = false;
                    }
                    nextPage++;
                    maintains = maintains.concat(response.data.list);

                });
            },
            currentTab: function(newTab) {
                if (typeof newTab !== 'undefined') {
                    //currentTab = newTab;
                }
                return currentTab;
            },
            hasNextPage: function(has) {
                if (typeof has !== 'undefined') {
                    hasNextPage = has;
                }
                return hasNextPage;
            },
            resetData: function() {
                plans = [];
                nextPage = 1;
                hasNextPage = true;
            },
            */
            getPlans: function() {
                return plans;
            },
            getById: function(id) {
                if (!!plans) {
                    for (var i = 0; i < plans.length; i++) {
                        if (plans[i].qp_id === id.toString()) {
                            return plans[i];
                        }
                    }
                } else {
                    return null;
                }
            }
        };
    });
