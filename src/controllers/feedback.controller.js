(function() {
    'use strict';
    angular.module('ironridge')
    .controller('feedbackCtrl', function($scope, $rootScope, projectMount, projectFx, project, config) {
            var localProject = project;
            var sefix = '', googleFix = '';
            var locationName = 'location';
      setTimeout(function(){
            switch (window.project_type) {
                case 'flat':
                    localProject = project;
                    sefix = '';
                    googleFix = 'Flat Roof';
                    break;
                case 'pitched':
                    localProject = project;
                    sefix = '';
                    googleFix = 'Pitched Roof';
                    break;
                case 'fx':
                    localProject = projectFx;
                    googleFix = 'Fx';
                    sefix = 'Fx';
                    break;
                case 'mount':
                    localProject = projectMount;
                    locationName = 'location_wind_and_snow';
                    sefix = 'Mount';
                    googleFix = 'Ground Based';
                break;
            }
            $scope.sefix = sefix;
      	var id = projectMount.info.id || project.info.id || projectFx.info.id;
        $scope.url = config.APP_URL + '#/quote/' + id;
      }, 100);
      $scope.feedbackOpen = function(){
        if($rootScope.user && $rootScope.user.email)  $scope.email = $rootScope.user.email;
        angular.element('#modalfeedback').modal('show');
        console.log($rootScope.user);
      };
      
      $scope.send = function(){
        $scope.showError = true;
        if(sefix == 'Fx') $scope.description = $scope.description + ' ' + localProject.info[locationName].site_name + ' (from DA) ';
      };
    });
})();
