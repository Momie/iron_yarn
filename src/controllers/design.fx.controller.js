(function () {
  'use strict';

  angular.module('ironridge')
    .controller('DesignFxCtrl', function(config, $scope, $rootScope, $state, projectFx, $window, api, lodash, alerts, $document, $localStorage, $timeout, gaSend) {

      $scope.project = projectFx;
      $state.tab = 'design';
      $scope.activeDetail = 'componentsDetail';
      $scope.attachment_span = 72;
      $scope.modal = {
        'title': 'Title',
        'content': '!'
      };
      $scope.nav = {
        radio: 'design'
      };
      if(config.JOYRIDE){
        try{
          hopscotch.endTour();
        }
        catch(e){
          console.log('');
        }
        finally{
          if (!$localStorage.ironridge.joyRide || !$localStorage.ironridge.joyRide[2]) {
            if (!$localStorage.ironridge.joyRide) $localStorage.ironridge.joyRide = {};
            $localStorage.ironridge.joyRide[2] = true;
            setTimeout(function(){
              hopscotch.startTour(tour, 2);
            }, 500);
          }
        }
      }

      var _init = function () {
        var max = 0, initAttachment = 0;
        if (!$scope.project.info.engineering.span_cantilever.landscape && !$scope.project.info.engineering.span_cantilever.portrait) $scope.current_engineering = 'landscape';
        else $scope.current_engineering = $scope.project.info.engineering.span_cantilever.landscape ? 'landscape' : 'portrait' ;
        $scope.attachments_span = [];
        if ($scope.project.info.engineering.span_cantilever.landscape) $scope.project.info.engineering.span_cantilever.landscape.map(function(e){
          if (e.max_span.value > max) max = e.max_span.value;
          if (e.usable_span.value > initAttachment) initAttachment = e.usable_span.value;
        });
        if ($scope.project.info.engineering.span_cantilever.portrait) $scope.project.info.engineering.span_cantilever.portrait.map(function(e){
          if (e.max_span.value > max) max = e.max_span.value;
          if (e.usable_span.value > initAttachment) initAttachment = e.usable_span.value;
        });
        for (var i = projectFx.info.building.rafter_spacing; i <= max; i+=projectFx.info.building.rafter_spacing) {
          $scope.attachments_span.push(i);
        }
        if($scope.attachments_span.indexOf(projectFx.info.attachment_span) == -1) $scope.attachments_span.push(projectFx.info.attachment_span);
        $scope.attachments_span.sort(function(a, b){
          return a < b;
        });
        $scope.attachment_span = projectFx.info.attachment_span || initAttachment;
        if(projectFx.info.modules.manufacturer && projectFx.info.modules.manufacturer.id)
          api.getModel(projectFx.info.modules.manufacturer.id, 1).then(function(result) {
            $rootScope.models = result.data;
          });
      };

      var _transformSpan = function(_val){
        var a=_val.toString();
        var b=a.split('.');

        if(b[1]) _val = parseFloat(b[0]+'.'+b[1].slice(2));
      };

      $scope.initialized=_init;
      $scope.range = function(n) {
        return new Array(n);
      };

      $scope.closeNotifeEmpty  = function($event){
        angular.element('#NotifeEmpty').css({'display': 'none'});
        $event.stopPropagation();
      };
      $scope.changeOrientation = function(value){
        $scope.current_engineering  = value;
        // $scope.span_cantilever = $scope.project.info.engineering.span_cantilever[$scope.current_engineering]
        // console.log($scope.project.info.engineering.span_cantilever[value], value, $scope.span_cantilever)
      };
      $scope.go = function() {
        // if (projectFx.info.arrays.count == 0) {
        //   $('html, body').animate({ scrollTop: 0 }, 'fast');
        //   angular.element('#NotifeEmpty').css({'display': 'inline-block'});
        //   return false
        // }
        $rootScope.panelsdesactivated = true;
        if (!projectFx.info.modules.model.id || !projectFx.info.arrays || projectFx.info.arrays.length < 1) {
          alerts.show('nothing-to-quote');
          return;
        }

        if (projectFx.info.id) {
          gaSend.sendToGa('event', 'Quote Tab', 'visit', 'FX');
          $scope.$emit('Go_To_Quote_Id');
          $state.go('quoteId', {
            'id': projectFx.info.id
          });
        } else {
          alerts.show('nothing-to-quote');
        }
      };

      $scope.onAttachmentSpanChange = function(){
          projectFx.info.attachment_span = $scope.attachment_span;
          projectFx.postData('attachment_span').then(function(result) {
            $scope.project.info.attachment_span = result.data.attachment_span;
            $scope.project.info.engineering = result.data.engineering;
            $rootScope.$emit('projectFx.redraw.arrays');
          });
      };

      $scope.switchDetail = function(detailMode){
        $scope.activeDetail = detailMode;
      };

      _init();

      angular.element(document).ready(function () {
        if(projectFx.info.location.zip_code && (!projectFx.info.modules.manufacturer.id || !projectFx.info.modules.model.id || !projectFx.info.id)){
            $state.go('siteId', {
              'id': projectFx.info.id
            });
            alerts.show('manuf-model-not-set');
          }
          if(!$rootScope.user  && $localStorage.ironridge[projectFx.info.id] && !$localStorage.ironridge[projectFx.info.id].isaccepted){
              $state.go('siteId', {
                'id': projectFx.info.id
              });
            }
      });

      $rootScope.$on('projectFx.redraw.arrays', _init);
      $rootScope.$on('projectFx.arrays.updated', _init);

      // ON PROJECT LOADED
      $rootScope.$on('projectFx.redraw.arrays', function () {
        if($rootScope.updateCheckboxItems) $rootScope.updateCheckboxItems();
        if($rootScope.setImageSources) $rootScope.setImageSources();
        $document.scrollTo(0, 100, 50);
      });

      // $rootScope.$on('model-selected', function () {
      //   console.log('model selected');
      //   $scope.updateCheckboxItems();
      // });
      $timeout(function () {
        angular.element('#companyId').focus();
        $timeout(function () {
          angular.element('#companyId').blur();
        }, 1);
      }, 1);

      $document.bind('keydown', function(event) {
        var attrs = event.currentTarget.activeElement.attributes;

        if (attrs['tab-stop-D']) {
        if(window.project_type === 'pitched') {
          angular.element.find('select')[0].focus();
        }else if(window.project_type === 'flat'){
          angular.element('.columnsInputNumber').focus();
        }
          event.preventDefault();
        }
      });

      /********* this function used by unit test *******/
          $scope.getContext = function(name){
              try{
                  return eval(name);
              }catch(e){
                  return e;
              }
          };
          $scope.setContext = function(name, value){
              try{
                  return eval(name + ' = ' + value);
              }catch(e){
                  return e;
              }
          };
      /************************************************/

    });
})();
