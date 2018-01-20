(function () {
  'use strict';

  angular.module('ironridge')
    .controller('DesignCtrl', function(config, $scope, $rootScope, $state, project, $window, api, lodash, alerts, $document, $localStorage, $timeout, gaSend) {

      $scope.project = project;
      $state.tab = 'design';
      $scope.activeDetail = 'componentsDetail';
      $scope.modal = {
        'title': 'Title',
        'content': '!'
      };

      //current page refelected in navigation bar
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
        if(window.project_type === 'pitched' && $rootScope.disableKeyDown){
          $rootScope.disableKeyDown();
        }

        if (!isFinite(parseInt(project.info.rails.attachement_span, 10)) || project.info.rails.attachement_span <= 0)
          $scope.attachmentSpanInvalid = true;

        if(project.info.modules.manufacturer && project.info.modules.manufacturer.id)
          api.getModel(project.info.modules.manufacturer.id, 1).then(function(result) {
            $rootScope.models = result.data;
          });
        if (!project.railsSession.XR100.color)
          project.railsSession.XR100.color = 'clear';
        _groupSubArraysByName();
      };

      var _groupSubArraysByName = function () {
        $scope.subArrayGroups = lodash.groupBy(project.info.sub_arrays.objects, function(obj) {
          return obj.group_name;
        });

        for (var group in $scope.subArrayGroups) {
          if(typeof group !== 'object'){
            $scope.subArrayGroups[group] = lodash.sortBy($scope.subArrayGroups[group], function (o) {
              return o.size;
            });
          }
        }

        $scope.subArrayGroups = lodash.toArray($scope.subArrayGroups);
      };
      // should remove
      var _transformSpan = function(_val){
        var a=_val.toString();
        var b=a.split('.');
        if(b[1]) _val = parseFloat(b[0]+'.'+b[1].slice(2));
      };


      function checkReactionForce(event){
        if(!$rootScope.activeOrientation || !project.info.structural_loads[$rootScope.activeOrientation]) return;
        var struct = project.info.structural_loads[$rootScope.activeOrientation] ;
        var zone1 = struct.zone1, zone2 = struct.zone2 , zone3 = struct.zone3;
        if(zone1[1].danger || zone1[2].danger || zone1[0].danger ||
          zone2[1].danger || zone2[2].danger || zone2[0].danger ||
          zone3[1].danger || zone3[2].danger || zone3[0].danger){
          $rootScope.$emit('showIronModal', "Notification" , 'The entered attachment span exceeds the structural capacity of the selected attachment for one or more of the roof zones. Reduce the attachment span or acknowledge that the array will not extend into the highlighted red roof zone by closing this window.');
        }
      }

      $scope.$watch('project.info.structural_loads.protrait', checkReactionForce);
      $scope.$watch('project.info.structural_loads.landscape', checkReactionForce);
      $rootScope.$on('updateActiveOrientation', checkReactionForce);

      $scope.onRailsSelect = function(oldValue, rails_id){
        /*if (project.info.rails.attachement_span == 0)
          project.info.rails.attachement_span = 1;*/
        var rails_index = {'XR10' : 0, 'XR100' : 1 , 'XR1000' : 2};

        rails_id = rails_id ? rails_id : project.info.rails.selected_rails;

        if (isFinite(parseInt(project.info.rails.attachement_span, 10)))
        {
          _transformSpan(project.info.rails.attachement_span);
          if (project.info.rails.attachement_span <= 0) {
            alerts.show('attachment-span-negative');
            $scope.haveToSaveAttachmentSpan = true;
            $scope.attachmentSpanInvalid = true;
            return;
          }
        } else {
          alerts.show('attachment-span-NaN');
          $scope.haveToSaveAttachmentSpan = true;
          $scope.attachmentSpanInvalid = true;
          return;
        }
        $scope.attachmentSpanInvalid = false;
        //console.log(project.info.rails);
        //return;
        $rootScope.hilightSelectedRails(rails_id);

        project.info.rails.color = project.railsSession[rails_id].color;
        project.info.rails.selected_rails = rails_id;

        if (oldValue) {
          console.log('moving between', oldValue, 'and', project.info.rails.selected_rails);
          if (oldValue === 'XR100' || oldValue === 'XR10') {
            project.railsSession[oldValue].color = project.info.rails.color;
            project.info.rails.color = project.railsSession[project.info.rails.selected_rails].color;
          }

          if (project.info.rails.selected_rails === 'XR100' || project.info.rails.selected_rails === 'XR10') {
            project.info.rails.color = project.railsSession[project.info.rails.selected_rails].color;
          }
        }

        // if (project.info.rails.selected_rails === 'XR1000') {
        //   project.info.rails.color = 'clear';
        // }
        if(project.info.modules.panel_finish && window.project_type !=='flat' && rails_id !== 'XR1000') {
          project.info.rails.color = project.info.modules.panel_finish ;
        }else{
          project.info.rails.color= 'clear';
        }
        //debugger
        console.log('RAILS SELECTED');

        $rootScope.setImageSources();
        //console.log(project.info.rails.finish)
        $rootScope.updateArrayLengthData();
        project.postData('rails').then(function(result) {
          project.info.summary = result.data.summary;
          project.info.bill_of_material = result.data.bill_of_material;
          project.info.structural_loads = result.data.structural_loads;
          project.info.documents = result.data.documents;
          project.info.rails = result.data.rails;
          project.info.sub_arrays = result.data.sub_arrays;
          project.info.tilt_leg = result.data.tilt_leg;
          _groupSubArraysByName();
          $rootScope.setImageSources();
        });
      };
      $scope.initialized=_init;
      $scope.groupSubArraysByName=_groupSubArraysByName;
      $scope.range = function(n) {
        return new Array(n);
      };

      $scope.closeNotifeEmpty  = function($event){
        angular.element('#NotifeEmpty').css({'display': 'none'});
        $event.stopPropagation();
      };

      $scope.go = function() {
        if (project.info.arrays.count === 0) {
          $('html, body').animate({ scrollTop: 0 }, 'fast');
          angular.element('#NotifeEmpty').css({'display': 'inline-block'});
          return false;
        }
        $rootScope.panelsdesactivated = true;
        if (!project.info.modules.model.id || !project.info.arrays || project.info.arrays.length < 1) {
          alerts.show('nothing-to-quote');
          return;
        }

        if (project.info.id) {
          gaSend.sendToGa('event', 'Quote Tab', 'visit', (window.project_type === 'flat' ? 'Flat Roof' : 'Pitched Roof' ));
          $scope.$emit('Go_To_Quote_Id');
          $state.go('quoteId', {
            'id': project.info.id
          });
        } else {
          alerts.show('nothing-to-quote');
        }
      };

      $scope.switchDetail = function(detailMode){
        $scope.activeDetail = detailMode;
      };

      _groupSubArraysByName();

      _init();

      angular.element(document).ready(function () {
        if(project.info.location.zip_code && (!project.info.modules.manufacturer.id || !project.info.modules.model.id || !project.info.id)){
            $state.go('siteId', {
              'id': project.info.id
            });
            alerts.show('manuf-model-not-set');
          }
          if(!$rootScope.user  && $localStorage.ironridge[project.info.id] && !$localStorage.ironridge[project.info.id].isaccepted){
              $state.go('siteId', {
                'id': project.info.id
              });
            }
      });

      $rootScope.$on('project.redraw.arrays', _init);

      // ON PROJECT LOADED
      $rootScope.$on('project.redraw.arrays', function () {
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

      $rootScope.$on('project.arrays.updated', function () {
        _groupSubArraysByName();
      });

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
