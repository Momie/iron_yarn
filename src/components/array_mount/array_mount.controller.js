(function() {
  'use strict';
  angular.module('ironridge')
    .controller('arrayMountCtrl', function($scope, projectMount, $rootScope) {
      $scope.projectMount = projectMount;

      var _createSubarray = function(moduleUp, col, repeat) {
        var Obj = {
          'columns': col,
          'repeats': repeat
        };
        projectMount.info.arrays.arrays.push(Obj);
        projectMount.info.arrays.modules_up = moduleUp;
      };

      var _createSubarrayFromVirtual = function() {
        if (projectMount.info.arrays.arrays.length < 1 && $scope.defaultSubbaray.modules_up && $scope.defaultSubbaray.arrays.columns && $scope.defaultSubbaray.arrays.repeats) {
          _createSubarray($scope.defaultSubbaray.modules_up, $scope.defaultSubbaray.arrays.columns, $scope.defaultSubbaray.arrays.repeats);
          $scope.reset();
        }
      };
      var _initDefualtSubarray = function() {
        $scope.defaultSubbaray = {
          'arrays': {
            'columns': 0,
            'repeats': 1
          },
          'modules_up': 0
        };
      };

      $scope.reset = function() {
        $scope.defaultSubbaray.modules_up = 0;
        $scope.defaultSubbaray.arrays.columns = 0;
        $scope.defaultSubbaray.arrays.repeats = 1;
      };

      $scope.addSubarray = function(moduleUp, col, repeat) {
        _createSubarray(moduleUp, col, repeat);
      };

      $scope.delete = function(index) {
        if (projectMount.info.arrays.arrays.length < 2) {
          projectMount.info.arrays.arrays.splice(index, 1);
          $scope.reset();
          projectMount.updateArraysMount();
        } else {
          projectMount.info.arrays.arrays.splice(index, 1);
        }
      };

      $scope.saveSubarray = function() {
        if (!$rootScope.isLoading) {
          _createSubarrayFromVirtual();
          projectMount.updateArraysMount();
        }
      };
      _initDefualtSubarray();
      $rootScope.$on('projectMount.redraw.arrays', function() {
        _initDefualtSubarray();
      });



    });
})();
