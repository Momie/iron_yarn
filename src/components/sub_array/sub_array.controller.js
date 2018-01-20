(function() {
  'use strict';
  angular.module('ironridge')
    .controller('subArrayCtrl', function($scope, $rootScope, project, $window) {
      $scope.defaultSubbaray = {
        'rows': 0,
        'columns': 0,
        'portrait': true,
        'cells': [],
        '_id': Date.now()
      };

      var _createCells = function(row, col) {
        var localObj = [];

        for (var j = 0; j < row; j++) {
          for (var i = 0; i < col; i++) {
            localObj.push({
              x: i,
              y: j,
              active: true
            });
          }
        }

        return localObj;
      };

      var _updateOrientationStatus = function() {
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

        if ($rootScope.nbrPanelsPortrait && !$rootScope.nbrPanelsLandscape) {
          $rootScope.switchEngineeringOrientation('portrait');
          $rootScope.switchOrientation('portrait');
          $rootScope.switchTiltOrientation('portrait');
        } else if (!$rootScope.nbrPanelsPortrait && $rootScope.nbrPanelsLandscape) {
          $rootScope.switchEngineeringOrientation('landscape');
          $rootScope.switchOrientation('landscape');
          $rootScope.switchTiltOrientation('landscape');
        }
      };

      var _createSubarray = function(row, col,orient) {
        var Obj = {
          'rows': row || 1,
          'columns': col || 1,
          'portrait': orient,
          'cells': [],
          '_id': Date.now()
        };

        Obj.cells = _createCells(row, col);
        project.info.arrays.objects.push(Obj);
      };

      var _createSubarrayFromVirtual = function() {
        if(!project.info.arrays.objects.length && $scope.defaultSubbaray.rows && $scope.defaultSubbaray.columns){
            _createSubarray($scope.defaultSubbaray.rows, $scope.defaultSubbaray.columns, $scope.defaultSubbaray.portrait);
            $scope.reset();
        }
      };

      $scope.delete = function(index) {
        $scope.reset();
        project.info.arrays.objects.splice(index, 1);
      };

      $scope.addSubarray = function(row, col, orient) {
        _createSubarrayFromVirtual();
        _createSubarray(row, col, orient);
      };

      $scope.saveSubarray = function() {
        if(!$rootScope.isLoading){
          _createSubarrayFromVirtual();

          project.info.arrays.objects.map(function(e) {
            e.cells = _createCells(e.rows, e.columns);
          });

          project.updateArrays().then(function() {
            if (($rootScope.nbrPanelsPortrait && $rootScope.nbrPanelsLandscape )|| (!$rootScope.nbrPanelsPortrait && !$rootScope.nbrPanelsLandscape)) {
              $rootScope.activeTiltOrientation = 'portrait';
              $rootScope.engineeringOrientation = 'portrait';
              $rootScope.activeOrientation = 'portrait';
            }
          });
        }
      };

      $scope.reset = function(){
        $scope.defaultSubbaray.rows = 0;
        $scope.defaultSubbaray.columns = 0;
        $scope.defaultSubbaray.portrait = true;
        $scope.defaultSubbaray.cells = [];
      };

      $rootScope.$on('project.arrays.updated', function() {
        _updateOrientationStatus();
      });

      $rootScope.$on('project.redraw.arrays', function() {
        _updateOrientationStatus();
      });
      $window.addEventListener('beforeunload', function() {
          console.log('saving project before exit ');
          $scope.saveSubarray();
      });

      // $rootScope.$on('model-selected', function () {
      //   //_saveArrays();
      // });

    });
})();
