(function() {
    'use strict';

    angular.module('ironridge')
    .controller('ArrayDetailCtrl', function($scope, $rootScope, $document, project) {
        var _lengths = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
        // Rail Lengths
        var _fillArray = function (elems) {
          var arr = [];
          for (var i in elems) {
            if(typeof i !== 'object')
              arr.push({value: elems[i], checked: false, custom: true});
          }
          return arr;
        };

        var _transformArrayLengthData = function () {
          var lengths_obj = project.info.rails.custom_lengths;
          var result = [];
          for (var key in lengths_obj) {
            if(typeof key !== 'object'){
              var value = key.split('_')[2];
              var checked = lengths_obj[key] ? true : false;
              result.push({value: value, checked: checked});
            }
          }
          return result;
        };

        $scope.toggleRailsLengths = function () {
          if (!project.info.modules.model.id) {
            return;
          }

          $scope.isActive = !$scope.isActive;

          if (!$scope.isActive) {
            $scope.updateArrayLengthData();
            $scope.onRailsSelect();
          }
        };

        $scope.toggleLength = function (){
          $scope.selectedLengths = '';

          for (var i=0; i<$scope.allLengths.length; i++) {
            var val = $scope.allLengths[i].value;
            if($scope.allLengths[i].checked){
              $scope.selectedLengths += val+'\',';
            }
          }

          if($scope.selectedLengths.length > 0)
            $scope.selectedLengths = $scope.selectedLengths.substring(0, $scope.selectedLengths.length - 1);
        };

        $rootScope.updateArrayLengthData = function(){
          var customLengths = {};

          for (var i=0; i<$scope.allLengths.length; i++) {
            var _key = 'custom_length_' + $scope.allLengths[i].value.toString();

            customLengths[_key] = $scope.allLengths[i].checked ? 1 : 0 ;
          }

          project.info.rails.custom_lengths = customLengths;
        };

        $rootScope.updateCheckboxItems = function () {
          var lengths_arr = _transformArrayLengthData();

          for (var i = 0; i < lengths_arr.length; i++) {
            $scope.allLengths[lengths_arr[i].value - 4].checked = lengths_arr[i].checked;
          }

          $scope.toggleLength();
        };

        $scope.allLengths = _fillArray(_lengths);
        $scope.allLengths[7].custom = false;
        $scope.allLengths[10].custom =  false;
        $scope.allLengths[13].custom =  false;
        $scope.selectedLengths = '';
        $scope.toggleLength();
        $scope.updateCheckboxItems();

        angular.element('#dropdownArrayDetail').click(function(e){
          e.stopPropagation();
        });

        $document.click(function(){
          if ($scope.isActive) {
              $scope.isActive =false;
              $scope.updateArrayLengthData();
              $scope.onRailsSelect();
          }
        });

    });
})();
