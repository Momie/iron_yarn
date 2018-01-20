(function() {
  'use strict';
  angular
    .module('ironridge')
    .directive('modalHelp', help)
    .controller('helpController', function($scope, $http, $rootScope) {
      var vm = this;
      $rootScope.toggleModal = function(variable, content) {
        $http.get('app/components/help/help.json').then(function(data) {
          $scope.info = data.data[variable];

          if(content) $scope.info.content = content;

          angular.element('#mymodal').css({'display': 'flex',  'align-items': 'center'});
          if ($scope.info) angular.element('#mymodal').modal('show');
        });
        return vm;
      };
    });

  function help() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/help/help.html',
      scope: {
        category: '='
      },
      transclude: true,
      controller: 'helpController',
      controllerAs: 'sm',
      bindToController: true
    };
    return directive;
  }
})();
