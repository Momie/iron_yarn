
(function() {
  'use strict';

  angular.module('ironridge')
    .controller('tiltLegKitCtrl', function($scope, $rootScope,svgLoad ,project) {
      var _svgBaseUrl = '//files.ironridge.com/flat-roof-mounting/resources/diagrams/';

      $scope.tiltAngle = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
      $scope.project = project;

      var _countStatusSwitch = function() {
        $rootScope.nbrPanelsPortrait = 0;
        $rootScope.nbrPanelsLandscape = 0;

        project.info.arrays.objects.forEach(function(d) {
          if (d.portrait) {
            $rootScope.nbrPanelsPortrait++;
          } else {
            $rootScope.nbrPanelsLandscape++;
          }
        });

        if(project.info.summary.cost === '$0'){
          $rootScope.nbrPanelsPortrait = 0;
          $rootScope.nbrPanelsLandscape = 0;
        }

        $rootScope.activeTiltOrientation = 'portrait';

        if ($rootScope.nbrPanelsPortrait && $rootScope.nbrPanelsLandscape) {
           $rootScope.activeTiltOrientation = 'portrait';
         }

         if (!$rootScope.nbrPanelsPortrait && $rootScope.nbrPanelsLandscape) {
           $rootScope.activeTiltOrientation = 'landscape';
         }

         _updateSvgTiltLeg();
      };

     var _getsvg = function(urlSvg){
        svgLoad.getsvg(urlSvg, true).then(function (result) {
              angular.element('#tiltLegSvg').html(result.data);
              $scope.updateTiltVal();
        });
      };

      var _updateSvgTiltLeg = function(){
       if($scope.project.info.tilt_leg.portrait.north_leg && $scope.activeTiltOrientation === 'portrait'){
         switch(parseInt($scope.project.info.tilt_leg.portrait.north_leg.title)){
           case 10: _getsvg( _svgBaseUrl + 'Portrait-10.svg');
           break;
           case 15: _getsvg( _svgBaseUrl + 'Portrait-15.svg');
           break;
           case 20: _getsvg( _svgBaseUrl +'Portrait-20.svg');
           break;
           case 25: _getsvg( _svgBaseUrl +'Portrait-25.svg');
           break;
           case 30: _getsvg( _svgBaseUrl +'Portrait-30.svg');
           break;
           default: _getsvg( _svgBaseUrl +'Portrait-10.svg');
         }
       }
       else if($scope.project.info.tilt_leg.landscape.north_leg){
         switch(parseInt($scope.project.info.tilt_leg.landscape.north_leg.title)){
           case 10: _getsvg( _svgBaseUrl +'Landscape-10.svg');
           break;
           case 15: _getsvg( _svgBaseUrl +'Landscape-15.svg');
           break;
           case 20: _getsvg( _svgBaseUrl +'Landscape-20.svg');
           break;
           default: _getsvg( _svgBaseUrl +'Landscape-10.svg');
         }
       }
     };

     $scope.updateTiltVal = function() {
        angular.element('#module_height').text($scope.project.info.tilt_leg[$scope.activeTiltOrientation].module_height.replace('\\', ''));
        angular.element('#south_clearance').text($scope.project.info.tilt_leg[$scope.activeTiltOrientation].south_clearance.replace('\\', ''));
        angular.element('#ns_spacing').text($scope.project.info.tilt_leg[$scope.activeTiltOrientation].ns_spacing.replace('\\', ''));
        angular.element('#inset').text($scope.project.info.tilt_leg[$scope.activeTiltOrientation].inset.replace('\\', ''));
        angular.element('#north_clearance').text($scope.project.info.tilt_leg[$scope.activeTiltOrientation].north_clearance.replace('\\', ''));
        angular.element('#insetPourcent').text('INSET (' + $scope.project.info.tilt_leg[$scope.activeTiltOrientation].inset_percent + '%)');
        angular.element('#angleTextId').text($scope.project.info.tilt_leg.angle + '°');
      };

      $scope.tiltAngleChange = function() {
        project.postData({
          'tilt_angle': $scope.project.info.tilt_leg.angle
        }, true).then(function(result) {
          project.info.summary = result.data.summary;
          project.info.bill_of_material = result.data.bill_of_material;
          project.info.documents = result.data.documents;
          project.info.tilt_leg = result.data.tilt_leg;
          project.info.structural_loads = result.data.structural_loads;
          project.info.arrays = result.data.arrays;
          project.info.rails = result.data.rails;
          _updateSvgTiltLeg();
        });
      };

      $rootScope.switchTiltOrientation = function(detailMode, $event) {
        if ($event && $event.currentTarget.attributes.disabled && $event.currentTarget.attributes.disabled.specified === true) {
          return;
        }
        $rootScope.activeTiltOrientation = detailMode;
        _updateSvgTiltLeg();
      };

      _countStatusSwitch();
      $rootScope.$on('project.redraw.arrays', function(){
        _updateSvgTiltLeg();
      });
    });
})();
