'use strict';
angular.module('chery.services')
    .factory('PlanService', function(ENV, $http , $resource, $log, $q, User){

        return {
            getPlanStatus: function(id) {
                return $http.get(
                    ENV.api + "chery/plan.asmx/GetPlanStatus" ,
                    {params:{plan_id:id}}
                )
            },
            getResults: function(id){
                return $http.get(
                    ENV.api + "chery/flow.asmx/GetResults" ,
                    {params:{plan_id:id}}
                )
            } ,
            getComments: function(id){
                return $http.get(
                    ENV.api + "chery/comment.asmx/GetComments" ,
                    {params:{plan_id:id}}
                )
            } ,

            saveConfirmPlan: function(data){
                return $http.post(
                    ENV.api + "chery/flow.asmx/SaveConfirm" ,
                    data
                );
            } ,
            saveArrangePlan: function(data){
                return $http.post(
                    ENV.api + "chery/flow.asmx/SaveArrange" ,
                    data
                );
            } ,
            saveComment: function(data){
                return $http.post(
                    ENV.api + "chery/comment.asmx/SaveComment" ,
                    data
                );
            } ,



            saveReply: function(topicId, replyData) {
                var reply = angular.extend({}, replyData);
                var currentUser = User.getCurrentUser();
                // add send from
                if (Settings.getSettings().sendFrom) {
                    reply.content = replyData.content + '\n 自豪地采用 [CNodeJS ionic](https://github.com/lanceli/cnodejs-ionic)';
                }
                return resource.reply({
                        topicId: topicId,
                        accesstoken: currentUser.accesstoken
                    }, reply
                );
            },
            upReply: function(replyId) {
                var currentUser = User.getCurrentUser();
                return resource.upReply({
                        replyId: replyId,
                        accesstoken: currentUser.accesstoken
                    }, null, function(response) {
                        if (response.success) {
                            angular.forEach(topic.replies, function(reply, key) {
                                if (reply.id === replyId) {
                                    if (response.action === 'up') {
                                        reply.ups.push(currentUser.id);
                                    } else {
                                        reply.ups.pop();
                                    }
                                }
                            });
                        }
                    }
                );
            },
            collectTopic: function(topicId) {
                var currentUser = User.getCurrentUser();
                return resource.collect({
                    topic_id: topicId,
                    accesstoken: currentUser.accesstoken
                });
            },
            deCollectTopic: function(topicId) {
                var currentUser = User.getCurrentUser();
                return resource.deCollect({
                    topic_id: topicId,
                    accesstoken: currentUser.accesstoken
                });
            }
        };
    });
