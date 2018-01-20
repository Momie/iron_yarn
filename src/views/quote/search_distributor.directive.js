(function() {
  'use strict';
  angular
    .module('ironridge')
    .directive('searchDistributor', function(){
      var directive = {
        restrict: 'E',
        templateUrl: 'app/views/quote/search.html',
        transclude: true,
        controller: 'searchDistributorController',
        controllerAs: 'sea',
        bindToController: true
      };
      return directive;
    })
    .controller('searchDistributorController', function($scope, $http, $rootScope, $document, $timeout, $window, api, project,projectMount, jwtHelper, gaSend) {
      var vm = this;
      var _isNewUser = false;
      var _isRegistred = false;

      vm.showChangeDistributor = false;
      vm.nearView = false;
      vm.show = false;
      vm.permissionToChange = false;
      vm.RQ = false;
      vm.distBack=true;
      vm.accept_terme=false;
      vm.project = window.project_type === 'mount' ? projectMount : project;
      var _initInput = function(){
        vm.distRib = '';
        vm.Ddistributors = {};
        vm.nearDistributors = {};
      };

      var _addToken=function(_token){
        if(_token){
          var user = jwtHelper.decodeToken(_token);
          $rootScope.user = user;
          $http.defaults.headers.common.Authorization = 'Token ' + _token;
        }
      };
        // chose distributor by search
      vm.choseDistributor = function(_val) {
          vm.nearView = false;
          api.getDistributors(_val).then(function(result) {
            result = result.data;
            vm.Ddistributors = result.distributors;
            vm.Ddistributors.sort(function(a, b){
              if ((a.name.toLowerCase().indexOf(_val.toLowerCase()) > b.name.toLowerCase().indexOf(_val.toLowerCase())) || a.name.toLowerCase().indexOf(_val.toLowerCase()) == -1) return 1;
              return -1;
            });
            vm.count = result.count;
            if(!_val || _val === '') vm.Ddistributors ={};
          });
        };

        // chose distributor by Near Distributor
        vm.getNearDistributors = function() {
          var zip;

          if(window.project_type === 'mount'){
            zip = projectMount.info.location_wind_and_snow.zip_code;
          }else{
            zip = project.info.location.zip_code;
          }

          api.getNearDistributors(zip).then(function(result) {
            result = result.data;
            vm.nearDistributors = result.distributors;
            vm.nearDistributorsCount = result.count;
          });
        };
        //create user
        vm.createUser = function() {
         if(!vm.users) vm.users = {};
         vm.showError = true;
         if (vm.users.password !== vm.users.confirm_password || !$scope.addUser.$valid){
             return;
         } else {
             api.createNewUser(vm.users).then(function(result) {
             vm.users.email='';
             result = result.data;
             if(window.project_type === 'mount'){
               projectMount.info.user_id = result.user_id;
               projectMount.postData('user_id');
             }else{
               project.info.user_id = result.user_id;
               project.postData('user_id');
             }
             _addToken(result.token);

             angular.element('#myModalRegister').modal('hide');
             angular.element('#myModalValidation').modal('show');
             angular.element('#myModalValidation').css({'display': 'flex'});
             _initInput();
             vm.permissionToChange=true;
             _isNewUser = true;
           },function(){});
         }
       };
        // send Distributor chosed

      vm.sendDistributor = function() {
          vm.id_location = vm.id_location || vm.project.info.prefered_distributor.prefered_distributor_location_id;
          if (vm.id_location) {
            var obj;
            gaSend.sendToGa('event', 'Quote Request', 'submit', (window.project_type === 'flat' ? 'Flat Roof' : (window.project_type === 'mount' ? 'Ground Based' : 'Pitched Roof')));

            obj = {
              'project_id': vm.project.info.id,
              'location_id': vm.id_location
            };

            api.postQuote(obj).then(function(result) {
              result = result.data;
            });

            var data = {
              prefered_distributor_location_id: vm.id_location
            };

            api.preferedDistributor(data, vm.project.info.user_id).then(function(result) {
              result = result.data;
              if(result.prefered_distributor_location_id) {
                 vm.project.info.prefered_distributor_location_id = result.prefered_distributor_location_id;
                 vm.project.info.prefered_distributor = vm.prefered_distributor || vm.project.info.prefered_distributor;
              }

              if(_isNewUser && !_isRegistred) $window.location.assign($rootScope.HOST_URL + '/users/sign_in');
            });
          }

          vm.RQ = true;

          $timeout(function() {
            vm.RQ = false;
          }, 5000);
      };

      var _findDistributorPrefered = function(_id, _callbk) {
        api.getAllDistributors().then(function(result) {
          result = result.data;
          for (var i = 0; i < result.count; i++) {
            if (result.distributors[i].location_id == _id) {
              vm.distributorPrefered = result.distributors[i];
              vm.id_location = result.distributors[i].location_id;
            }
          }
          _callbk();
        });
      };

      // button select with search
      vm.selectBySearch = function(_index) {
          gaSend.sendToGa('event', 'Quote Request', 'select_distributor', (window.project_type === 'flat' ? 'Flat Roof' : (window.project_type === 'mount' ? 'Ground Based' : 'Pitched Roof')));
          vm.showError = false;
          vm.prefered_distributor = vm.Ddistributors[_index]; 
          vm.name = vm.Ddistributors[_index].name;
          $rootScope.selectedDstrib = vm.Ddistributors[_index].name;
          vm.id_location = vm.Ddistributors[_index].location_id;
          vm.show = false;

          if (!$rootScope.user) {
            angular.element('#myModalRegister').modal('show');
            angular.element('#myModalRegister').css({'display': 'flex'});
          } else {
            angular.element('#myModalValidation').modal('show');
            angular.element('#myModalValidation').css({'display': 'flex'});
            _initInput();
            vm.permissionToChange=true;
          }
      };

      // button select with near
      vm.selectByNear = function(_index) {
        gaSend.sendToGa('event', 'Quote Request', 'select_distributor', (window.project_type === 'flat' ? 'Flat Roof' : (window.project_type === 'mount' ? 'Ground Based' : 'Pitched Roof')));
        vm.showError = false;
        vm.prefered_distributor = vm.nearDistributors[_index];
        vm.name = vm.nearDistributors[_index].name;
        $rootScope.selectedDstrib = vm.nearDistributors[_index].name;
        vm.id_location = vm.nearDistributors[_index].location_id;
        vm.show = false;

        if (!$rootScope.user) {
          angular.element('#myModalRegister').modal('show');
          angular.element('#myModalRegister').css({'display': 'flex'});
        } else {
          angular.element('#myModalValidation').modal('show');
          angular.element('#myModalValidation').css({'display': 'flex'});
           _initInput();
          vm.permissionToChange=true;
        }
      };

      vm.close = function() {
        vm.RQ = false;
      };

      vm.cancel = function() {
        vm.users={};
        vm.users.email = null;
      };

      // open quote=
      vm.openQuote = function($event) {
        $event.stopPropagation();
        gaSend.sendToGa('event', 'Quote Request', 'initiate', (window.project_type === 'flat' ? 'Flat Roof' : (window.project_type === 'mount' ? 'Ground Based' : 'Pitched Roof')));
        vm.distRib = '';
        vm.nearDistributors = {};
        vm.Ddistributors = {};
        vm.prefered_distributor = vm.project.info.prefered_distributor;
        if ($rootScope.user) {
          if (vm.prefered_distributor) {
            vm.name = vm.prefered_distributor.name;
            $rootScope.selectedDstrib = vm.prefered_distributor.name;
            vm.distributorPrefered = vm.prefered_distributor;
            vm.id_location = vm.prefered_distributor.prefered_distributor_location_id;
            angular.element('#myModalValidation').modal('show');
            angular.element('#myModalValidation').css({'display': 'flex'});
            vm.permissionToChange = true;
          } else {
            _isRegistred = true;
            vm.show = true;
            vm.distBack=true;
          }
        } else {
          vm.show = true;
          vm.distBack=true;
        }
      };
      vm.changeDistributor = function() {
        vm.showChangeDistributor = true;
        vm.show = true;
        vm.distBack=false;
        vm.showDistributor = false;
        _initInput();
      };

      vm.hideModals = function() {
        vm.showChangeDistributor = false;
        vm.show = false;
        vm.showDistributor = false;
        _initInput();
        vm.nearView=false;
      };

      angular.element('#searchDistributor,#button_quote,#linkChange,#myModalValidation, #linkChangeRegister').click(function(e) {
        e.stopPropagation();
      });

      $document.click(function() {
        if (vm.show) {
          vm.show = false;
          _initInput();
          vm.nearView=false;
          $rootScope.$digest();
        }
      });

    });

})();
