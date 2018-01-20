(function () {
  'use strict';

  angular.module('ironridge')
    .controller('ManufCtrl', function ($scope, $rootScope, $timeout, api, project, projectMount, projectFx, $localStorage) {
      // $scope.manufacturs = {};
      // current page in pagination
      var _thisPage = $rootScope.modules.pagination.manufacture;
      var _lastManufactureId;
      project = window.project_type === 'fx' ? projectFx : window.project_type === 'mount' ? projectMount : project;
      // fired when manufacture clicked and update the chosen manufacture
      var _thisManuf = function (manufactur, id) {
        if (_lastManufactureId === id)
          return;

        _lastManufactureId = id;
        /****** uncomment those 2 lines for production **************/
        if (!project.info.modules.manufacturer)
          project.info.modules.manufacturer = {};
          project.info.modules.manufacturer.name = manufactur;
          project.info.modules.manufacturer.id = id;


        //After selecting a manufacturer get all his models to use them in the typeahead
        $rootScope.models = {};

        api.getModel(id, 1, window.project_type === 'fx').then(function (result) {
          $rootScope.isLoading = false;
          $rootScope.globalLoader = 'success';

          $timeout(function () {
            delete $rootScope.globalLoader;
          }, 1500);

          $rootScope.models = result.data;
          $scope.$emit('got.model');
          document.getElementById('ModelId').focus();
        });
      };
      $scope.choose = function (manufacturer) {
        $rootScope.isLoading = true;
        $rootScope.globalLoader = 'loading';

        _thisManuf(manufacturer.name, manufacturer.id);
        project.info.modules.manufacturer.name = manufacturer.name;
        project.info.modules.manufacturer.id = manufacturer.id;

        project.info.modules.model.id = null;
        project.info.modules.model.name = '';
        $rootScope.showPickModel=true;
        $rootScope.showselcted=false;
      };
      
      $scope.selectManufKeyPress = function (event) {
        if (event.which === 9) {
         // event.preventDefault();
        }
      };

      api.getManufactur(_thisPage, window.project_type === 'fx').then(function (result) {
        $scope.manufacturs = result.data.response;
      });

      $scope.$on('got.model', function () {
        $timeout(function () {
          angular.element('#ModelId').focus();

          if(window.project_type === 'mount') {
            projectMount.info.modules.dimensions = '';
            projectMount.info.modules.dimensions_mm = '';

          }else {
            project.info.modules.dimensions = '';
            project.info.modules.dimensions_mm = '';
          }
        }, 200);
      });
    });
})();
