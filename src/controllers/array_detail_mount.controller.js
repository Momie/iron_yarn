(function() {
    'use strict';

    angular.module('ironridge')
    .controller('ArrayDetailMountCtrl', function($scope, $rootScope, $document, projectMount) {
      $scope.project = projectMount;

    }).filter('toRange', function(){
      return function(input) {
        var lowBound, highBound, i,
        result = [];

        if (input.length === 1) {
          lowBound = 0;
          highBound = +input[0] - 1;
        } else if (input.length === 2) {
          lowBound = +input[0];
          highBound = +input[1];
        }

        i = lowBound;

        while (i <= highBound) {
          result.push(i);
          i++;
        }

        return result;
      };
    });
})();
