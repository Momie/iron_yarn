(function() {
    'use strict';

    angular.module('ironridge')
        .controller('TopnavCtrl', function(config, $scope, $rootScope, $localStorage, $window, $cookieStore, api) {
            //var projectId = $stateParams.id; //getting project id from url
            //$scope.firstTime = true;
            var wp_url = config.WORD_PRESS_BASE_URL;
            var current_url =  config.HOST_URL;
            var rollout = null;
            $scope.signOut = function() {
                $.ajax({
                    url: $rootScope.HOST_URL,
                    xhrFields: {
                        withCredentials: true
                    },
                    type: 'get',
                    success: function(result) {
                        var parser = new DOMParser();
                        var doc = parser.parseFromString(result, "text/html");
                        var csrf = doc.querySelector('[name^="csrf-token"]').getAttribute('content');
                        $.ajax({
                            url: $rootScope.HOST_URL + '/users/sign_out',
                            xhrFields: {
                                withCredentials: true
                            },
                            contentType: 'application/x-www-form-urlencoded',
                            type: 'POST',
                            data: {
                                _method: 'delete',
                                authenticity_token: csrf
                            },
                            success: function(result) {
                                $localStorage.ironridge.token = null;
                                $localStorage.ironridge.user = null;
                                $cookieStore.remove('iron_token');
                                $window.location.assign($rootScope.HOST_URL);
                            }
                        });
                    }
                });
                // $window.location.assign($rootScope.HOST_URL + '/users/sign_out');
            };

            $scope.goTo = function(url) {
                $window.location.assign($rootScope.HOST_URL + url);
            };

            $scope.wp_nav_to = function(path){
                if(!rollout) return '';
                return (rollout.word_press ? wp_url : current_url) + path;
            };
            api.getFeatures().then(function(list){
                rollout = list.data;
            });
        });
})();
