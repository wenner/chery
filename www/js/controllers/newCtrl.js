angular.module('chery').controller(
    'NewCtrl',
    function ($scope, $log , $cordovaImagePicker , $cordovaToast , ENV , Cache , NewMaintain) {

        //从换从中获取
        Cache.getFromRemote().then(function(){
            var cacheRoadSections = Cache.get("RoadSection");
            var roadSections = {};
            for(var i = 0 ; i<cacheRoadSections.length ; i++){
                var rs = cacheRoadSections[i] ,
                    district = rs.district ,
                    road = rs.road ,
                    section = rs.section;
                var districtGroup = roadSections[district];
                if (!districtGroup){
                    districtGroup = roadSections[district] = {};
                }
                var roadGroup = districtGroup[road];
                if (!roadGroup){
                    roadGroup = districtGroup[road] = [];
                }
                if (roadGroup.indexOf(section) == -1){
                    roadGroup.push(section);
                }
            }
            $scope.roadSections = roadSections ;
            var cacheMaintainTypes = Cache.get("MaintainType");
            var maintainTypes = [];
            for(var i = 0 ; i<cacheMaintainTypes.length ; i++){
                var item = cacheMaintainTypes[i];
                if (item.parentid != 0) maintainTypes.push(item);
            }
            $scope.maintainTypes = maintainTypes;
            $scope.maintainTypeSteps = Cache.get("MaintainTypeStep");
        });

        $scope.maintain = {
            district: '空港' ,
            type: "养护单位检查记录" ,
            check_date: new Date() ,
            road: '' ,
            section: ''
        };
        $scope.showPicker = function(){

            var options = {
                maximumImagesCount: 10,
                width: 800,
                height: 800,
                quality: 80
            };
            $cordovaToast
                .show('Here is a message', 'long', 'center')
            $cordovaImagePicker.getPictures(options)
                .then(function (results) {
                    for (var i = 0; i < results.length; i++) {
                        console.log('Image URI: ' + results[i]);
                    }
                }, function(error) {
                    // error getting photos
                });
        }


        $scope.hideNewModal = function () {
            alert(11111)
            NewMaintain.hide();
        }
    }
);
