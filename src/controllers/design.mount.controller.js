(function() {
    'use strict';
    angular.module('ironridge')
        .controller('designCtrlMount', function($scope, $state, $stateParams, $rootScope, $http, $timeout, $window, $localStorage, api, alerts, projectMount, $document, gaSend) {

          $scope.project = projectMount;
          $state.tab = 'design';
          $scope.modal = {
            'title': 'Title',
            'content': 'rr'
          };

          $scope.nav = {
            radio: 'design'
          };

          // try{
          //   hopscotch.endTour();
          // }
          // catch(e){
          //   console.log('')
          // }
          // finally{
          //   if (!$localStorage.ironridge.joyRide || !$localStorage.ironridge.joyRide[2]) {
          //     if (!$localStorage.ironridge.joyRide) $localStorage.ironridge.joyRide = {};
          //     $localStorage.ironridge.joyRide[2] = true;
          //     setTimeout(function(){
          //       hopscotch.startTour(tour, 2);
          //     }, 500)
          //   }
          // }

      $scope.closeNotifeEmpty  = function($event){
        angular.element('#NotifeEmpty').css({'display': 'none'});
        $event.stopPropagation();
      };
          $scope.go = function() {
            if (projectMount.info.arrays_details.count === 0) {
              $('html, body').animate({ scrollTop: 0 }, 'fast');
              angular.element('#NotifeEmpty').css({'display': 'inline-block'});
              return false;
            }

            $rootScope.panelsdesactivated = true;
            if (!projectMount.info.modules.model.id || !projectMount.info.arrays || projectMount.info.arrays.length < 1) {
              alerts.show('nothing-to-quote');
              return;
            }

            if (projectMount.info.id) {
              gaSend.sendToGa('event', 'Quote Tab', 'visit', 'Ground Based');
              $scope.$emit('Go_To_Quote_Id');
              $state.go('quoteId', {
                'id': projectMount.info.id
              });
            } else {
              alerts.show('nothing-to-quote');
            }
          };

          angular.element(document).ready(function () {
            if(projectMount.info.location_wind_and_snow.zip_code && (!projectMount.info.modules.manufacturer.id || !projectMount.info.modules.model.id || !projectMount.info.id)){
                $state.go('siteId', {
                  'id': projectMount.info.id
                });
                alerts.show('manuf-model-not-set');
              }
              if(!$rootScope.user  && $localStorage.ironridge[projectMount.info.id] && !$localStorage.ironridge[projectMount.info.id].isaccepted){
                  $state.go('siteId', {
                    'id': projectMount.info.id
                  });
                }
          });

          // $window.onkeydown = function (e) {
          //   var jqTarget = $(e.target);
          //   if (e.keyCode == 9) {
          //     var jqVisibleInputs = $(':input:visible,a');
          //     var jqFirst =jqVisibleInputs.first();
          //     var jqLast = jqVisibleInputs.last();
          //     if (!e.shiftKey && jqTarget.is(jqLast)) {
          //       e.preventDefault();
          //       jqFirst.focus();
          //     } else if (e.shiftKey && jqTarget.is(jqFirst)) {
          //       e.preventDefault();
          //       jqLast.focus();
          //     }
          //   }
          // };

          $document.bind('keydown', function(event) {
            var attrs = event.currentTarget.activeElement.attributes;

            if (attrs['tab-stop-DM']) {
             angular.element.find('select')[0].focus();
              event.preventDefault();
            }
          });

          $timeout(function () {
            angular.element('#companyId').focus();
            $timeout(function () {
              angular.element('#companyId').blur();
            }, 1);
          }, 1);

        });

})();
