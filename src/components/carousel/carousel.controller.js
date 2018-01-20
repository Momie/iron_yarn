(function() {
    'use strict';
    angular.module('ironridge')
        .controller('CarouselCtrl', function($scope, api, $stateParams, $localStorage, $rootScope, $state) {
            $scope.title = "Welcome to new Conduit Mount";
            $scope.items = [];
            $scope.data = {
                "ConduitMount": [{
                    title: "Welcome to new Conduit Mount",
                    img: "https://s3-us-west-1.amazonaws.com/files.ironridge.com/images/carousel/conduit_mount_1.png",
                }, {
                    title: "Welcome to new Conduit Mount",
                    img: "https://s3-us-west-1.amazonaws.com/files.ironridge.com/images/carousel/conduit_mount_2.png",
                },
                {
                  title: "Welcome to new Conduit Mount",
                  img: "https://s3-us-west-1.amazonaws.com/files.ironridge.com/images/carousel/conduit_mount_.jpg"
                }],
            };
            $scope.init = function() {
                setTimeout(function() {
                    if ($state.tab == "quote") {
                        run();
                    }
                }, 2000);
            };
            $scope.next = function(){
              $('#feature-intro-carousel').carousel('next');
            };
            $scope.prev = function(){
              $('#feature-intro-carousel').carousel('prev');
            };
            function run(projectType) {
                $scope.items = [];
                if (!$rootScope.user) return;
                if ($localStorage.carouselStatus === undefined) $localStorage.carouselStatus = {};
                var rolout = $localStorage.carouselStatus[$rootScope.user.user_id] || {};
                var flag = false;
                api.getCarouselFeatures($stateParams.id).then(function(res) {
                    res.data.forEach(function(elem) {
                        if (elem.value && !rolout[elem.name]) {
                            flag = true;
                            if ($localStorage.carouselStatus[$rootScope.user.user_id] === undefined) $localStorage.carouselStatus[$rootScope.user.user_id] = {};
                            $localStorage.carouselStatus[$rootScope.user.user_id][elem.name] = true;
                            $scope.items.push($scope.data[elem.name]);
                        }
                    });
                    if (flag) {
                        $scope.items = [].concat.apply([], $scope.items);
                        $('#newFeatureModal').modal('show');
                    }
                });
            }
            $rootScope.$on('Quote_tab', run);
        });
})();
