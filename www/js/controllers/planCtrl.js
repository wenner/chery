'use strict';
angular.module('chery').controller(
    'PlanCtrl',
    function ($scope, $q, $rootScope, $stateParams, $timeout, $ionicLoading, $ionicModal ,
              $ionicActionSheet, $ionicScrollDelegate, $log, $ionicPopup, $ionicHistory ,
              $ionicPopover, PlansService, PlanService, User) {

        // .fromTemplateUrl() method
        $ionicPopover.fromTemplateUrl('views/plan/mediamenu.html', {
            scope: $scope
        }).then(function (popover) {
                $scope.popover = popover;
            });

        //comment modal
        $ionicModal.fromTemplateUrl("views/plan/commentModal.html" , {
            scope: $scope
        }).then(function(modal) {
                $scope.commentModal = modal;
            });

        var id = $stateParams.id;
        $scope.currentAction = "";
        $scope.plan = PlansService.getById(id);

        $scope.goBack = function(){
            $ionicHistory.goBack();
        }

        /*
         $scope.getPlanStatus = function(id){
         PlanService.getPlanStatus(id)
         .then(function(response){
         var data = response.data.data;
         $scope.permission = data.RowSet.R.permission.R;
         $scope.plan = data.RowSet.R.plan.R;
         //$scope.currentAction = $scope.getCurrentAction();
         //console.log(data)
         });

         }
         $scope.getResults = function(id){
         $scope.isResultLoading = true;
         PlanService.getResults(id)
         .then(function(response){
         $scope.isResultLoading = false;
         var data = response.data.data;
         var results = data.RowSet.R;
         _.each(results , function(plan){
         if (plan.plan_date == "0-00-00 00:00:00"
         || plan.complete_date=="0-00-00 00:00:00") return;
         plan.isdelay = moment(plan.complete_date).isAfter(plan.plan_date);
         });
         $scope.results = results;
         //console.log(data);
         });
         };
         $scope.getComments = function(id){
         PlanService.getComments(id)
         .then(function(response){
         var data = response.data.data;
         console.log(data)
         $scope.comments = data.RowSet.R;
         //console.log(data)
         });
         };
         $scope.getCurrentAction = function(){
         var plan = $scope.plan ,
         permission = $scope.permission ,
         planId = plan.qp_id ,
         status = plan.status;
         var hasPermission = function(permissionCode , allowIds , id){
         var has = permission[permissionCode] == "1";
         if (allowIds != null){
         has = has && allowIds.split(",").indexOf(id)>-1;
         }
         return has;
         };
         var currentAction = "detail";
         switch (status){
         case "待安排":
         case "安排中":
         if (hasPermission("allowArrange" , permission.allowArrangeIds , planId)){
         currentAction = "arrange";
         }
         break;
         case "待审核":
         if (hasPermission("allowApprove")){
         currentAction = "approve";
         }
         break;
         case "待执行":
         case "执行中":
         if (hasPermission("allowConfirm" , permission.allowConfirmIds , planId)){
         currentAction = "confirm";
         }
         break;
         case "已完成":
         currentAction = "detail";
         break;
         default:
         currentAction = "detail";
         break;
         }
         return currentAction;
         };
         */
        //加载发运计划信息
        $scope.loadPlan = function (reload) {
            var defer = $q.defer;
            $scope.isResultLoading = true;

            $q.all({
                planStatus: PlanService.getPlanStatus(id),
                results: PlanService.getResults(id),
                comments: PlanService.getComments(id)
            }).then(function (allResponse) {
                    //console.log(allResponse)
                    var planStatus = allResponse.planStatus.data.data;
                    $scope.permission = planStatus.RowSet.R.permission.R;
                    $scope.plan = planStatus.RowSet.R.plan.R;


                    var resultsData = allResponse.results.data.data;
                    var results = resultsData.RowSet.R;
                    _.each(results, function (plan) {
                        if (plan.plan_date == "0-00-00 00:00:00"
                            || plan.complete_date == "0-00-00 00:00:00") return;
                        plan.isdelay = moment(plan.complete_date).isAfter(plan.plan_date);
                    });
                    $scope.results = results;

                    var commentsData = allResponse.comments.data.data;
                    var commentGroup = [];
                    _.forEach(commentsData.RowSet.R , function(n){
                        var curGroup = _.find(commentGroup , function(g){
                            return g.qr_id == n.qr_id;
                        })
                        if (!curGroup){
                            curGroup = {
                                qr_id: n.qr_id ,
                                name: n.name ,
                                qp_id: n.qp_id ,
                                cr_id: n.cr_id ,
                                group_index: n.group_index ,
                                ix: n.ix ,
                                children: [] ,
                                files:[]
                            };
                            commentGroup.push(curGroup);
                        }
                        if (n.cc_id != "0"){
                            if (!_.isEmpty(n.files)){
                                curGroup.files.push(n)
                            }else{
                                curGroup.children.push(n);
                            }
                        }
                    });
                    $scope.comments = commentGroup;

                    $scope.isResultLoading = false;
                });
            //$scope.getResults(id);
            //$scope.getPlanStatus(id);
            //$scope.getComments(id);
        };
        $scope.loadPlan();
        $scope.currentValues = {
            confirmDate: new Date()
        };

        //confirm部分
        $scope.allowConfirm = function (item) {
            var allowConfirmIds = $scope.permission.allowConfirmIds;
            return allowConfirmIds.indexOf(item.qr_id) > -1 && item.status == "待确认";
        };
        $scope.confirmPlan = function (item) {
            if (!$scope.allowConfirm(item)) return;
            $scope.currentValues.confirmItem = item;
            var confirmPopup = $ionicPopup.show({
                template: [
                    '<div class="item-input popupinput">' ,
                    '<input type="date" ng-model="currentValues.confirmDate">' ,
                    '</div>' ,
                    '<div class="item-input popupinput" style="margin-top:5px" ng-if="isConfirmDelay(item)">' ,
                    '<textarea placeholder="请输入超时原因" style="height:60px" ng-model="currentValues.confirmMemo"></textarea>' ,
                    '</div>'
                ].join(""),
                title: '确认完成',
                subTitle: '请填写实际完成日期 , 如果超时需要填写超时原因!',
                scope: $scope,
                buttons: [
                    { text: '取消' },
                    {
                        text: '<b>确认完成</b>',
                        type: 'button-royal',
                        onTap: function (e) {
                            if (!$scope.currentValues.confirmDate) {
                                e.preventDefault();
                            } else {
                                if ($scope.isConfirmDelay() && !$scope.currentValues.confirmMemo) {
                                    e.preventDefault();
                                } else {
                                    return {
                                        date: $scope.currentValues.confirmDate,
                                        memo: $scope.currentValues.confirmMemo
                                    }
                                }
                            }
                        }
                    }
                ]
            });
            confirmPopup.then(function (res) {
                if (!res) return;
                $scope.saveConfirmPlan(res);
            });
        };
        $scope.saveConfirmPlan = function (data) {
            var fv = {
                plan_id: $scope.plan.qp_id,
                qr_id: $scope.currentValues.confirmItem.qr_id,
                complete_date: data.date,
                confirm_memo: data.memo
            };
            fv.data = angular.toJson(fv);
            PlanService.saveConfirmPlan(fv)
                .then(function () {
                    var item = $scope.currentValues.confirmItem;
                    item.status = "已完成";
                    item.complete_date = moment(data.date).format("YYYY-MM-DD HH:mm:ss");
                    item.confirm_memo = data.memo;
                    item.isdelay = $scope.isConfirmDelay(data.date, item);
                    var ids = $scope.permission.allowConfirmIds.split(",");
                    ids = _.dropWhile(ids, function (n) {
                        return n == item.qr_id;
                    });
                    $scope.permission.allowConfirmIds = ids.toString();
                    $scope.currentValues.confirmDate = new Date();
                    $scope.currentValues.confirmItem = null;
                    $scope.currentValues.confirmMemo = "";


                })
        };
        $scope.isConfirmDelay = function (confirmDate, node) {
            confirmDate = confirmDate || $scope.currentValues.confirmDate;
            node = node || $scope.currentValues.confirmItem;
            var planDate = moment(node.plan_date);
            return moment(confirmDate).isAfter(planDate);

        }

        //arrange部分
        $scope.allowArrange = function (item) {
            var allowArrangeIds = $scope.permission.allowArrangeIds;
            return allowArrangeIds.indexOf(item.qr_id) > -1 && item.status == "待安排";
        };
        $scope.arrangePlan = function (item) {
            if (!$scope.allowArrange(item)) return;
            $scope.currentValues.arrangeItem = item;
            $scope.currentValues.arrangeDate = new Date(item.plan_date);
            var exportDate = moment($scope.plan.export_date).format("YYYY-MM-DD");
            var arrangePopup = $ionicPopup.show({
                template: [
                    '<div class="item-input popupinput">' ,
                    '<input type="date" ng-model="currentValues.arrangeDate">' ,
                    '</div>'
                ].join(""),
                title: '安排计划日期',
                subTitle: '请根据出运日期 (' + exportDate + ') , 填写 ' + item.name + ' 的计划日期!',
                scope: $scope,
                buttons: [
                    { text: '取消' },
                    {
                        text: '<b>安排日期</b>',
                        type: 'button-royal',
                        onTap: function (e) {
                            //判断最大日期 , 不能大过出运日期
                            if (!$scope.currentValues.arrangeDate) {
                                e.preventDefault();
                            } else {
                                return $scope.currentValues.arrangeDate;
                            }
                        }
                    }
                ]
            });
            arrangePopup.then(function (date) {
                if (!date) return;
                $scope.saveArrangePlan(date);
            });
        };
        $scope.saveArrangePlan = function (date) {
            var isConfirm = 0;
            if (_.isBoolean(date) && date === true) isConfirm = 1;
            var fv = {
                plan_id: $scope.plan.qp_id,
                ids: $scope.permission.allowArrangeIds.split(",") ,
                records:isConfirm == 1 ? [] : [{
                    qr_id:$scope.currentValues.arrangeItem.qr_id ,
                    arrange_date: moment(date).format("YYYY-MM-DD")
                }] ,
                isconfirm: isConfirm
            };
            fv.data = angular.toJson(fv);
            if (isConfirm == 1){
                if (_.any($scope.results , function(n){
                    return n.plan_date == "0-00-00 00:00:00";
                })){
                    navigator.notification.alert('如果要提交计划信息, 需要将所有节点的计划日期都填写 , 请检查!' , "错误");
                    return;
                }
            }
            PlanService.saveArrangePlan(fv)
                .then(function (){
                    if (isConfirm == 1){
                        _.forEach($scope.results , function(n){
                            n.statue = "待审核";
                        });
                        $scope.permission.allowArrangeIds = "";
                    }else{
                        var item = $scope.currentValues.arrangeItem;
                        item.status = "待安排";
                        item.arrange_date = moment(date).format("YYYY-MM-DD HH:mm:ss");
                        item.plan_date = item.arrange_date;
                        var ids = $scope.permission.allowArrangeIds.split(",");
                        ids = _.dropWhile(ids, function (n) {
                            return n == item.qr_id;
                        });
                        $scope.permission.allowArrangeIds = ids.toString();
                    }
                    $scope.currentValues.arrangeDate = "";
                    $scope.currentValues.arrangeItem = null;
                })
        };

        $scope.saveResult = function(plan){
            var status = plan.status;
            if (status == "待审核"){
                //$scope.saveApprove()
            }else{
                $scope.saveArrangePlan(true);
            }
        };


        //comment
        $scope.addComment = function(item){
            $scope.currentValues.commentItem = item;
            $scope.commentModal.show();
        }
        $scope.reply = function(item){
            $scope.currentValues.commentItem = item;
            $scope.commentModal.show();
        }
        $scope.hideCommentModal = function(){
            $scope.currentValues.commentItem = null;
            $scope.commentModal.hide()
        }
        $scope.saveComment = function(){
            if (!$scope.currentValues.comment) return;
            var item = $scope.currentValues.commentItem;
            var fv = {
                content: escape($scope.currentValues.comment.replace(/\n/ig , "<br>")) ,
                parent_id: item.cc_id ? item.cc_id : 0 ,
                cr_id: item.qr_id ,
                qr_id: item.qr_id ,
                create_time: new Date() ,
                files: []
            }
            fv.data = angular.toJson(fv);
            fv.files = "";
            PlanService.saveComment(fv)
                .then(function(){
                    $scope.currentValues.commentItem = item;
                    $scope.commentModal.hide();
                    var curGroup = _.find($scope.comments , function(g){
                        return g.qr_id == fv.cr_id;
                    });
                    console.log(curGroup)
                    if (curGroup) curGroup.children.push(fv);
                });
        }

        $scope.addMedia = function (event) {
            $scope.popover.show(event);

        }
    }
);
