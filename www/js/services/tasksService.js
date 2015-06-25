'use strict';
angular.module('chery.services')
    .factory('TasksService', function($rootScope , ENV, $q , $resource, $log, $http , User) {
        var plans = [];
        var nextPage = 1;
        var hasNextPage = true;
        return {
            plans: plans ,
            getArranges: function(){
                return $http.get(
                    ENV.api + "chery/plan.asmx/GetMyArrangePlan"
                )
            } ,
            getApproves: function(){
                return $http.get(
                    ENV.api + "chery/plan.asmx/GetMyApprovePlan"
                )
            } ,
            getConfirms: function(){
                return $http.get(
                    ENV.api + "chery/plan.asmx/GetMyConfirmPlan"
                )
            } ,
            getTasks: function(){
                return $q.all({
                    arrange: this.getArranges(),
                    approve: this.getApproves(),
                    confirm: this.getConfirms()
                }).then(function (response) {
                        var tasks = [];
                        _.forEach(response, function (n, key) {
                            var rs = n.data.data.RowSet.R;
                            if (rs && rs.length > 0){
                                tasks = tasks.concat(rs);
                            }
                        });
                        $rootScope.taskCount = tasks.length;
                        plans = tasks;
                        return tasks;
                    }
                )
            }
        };
    });
