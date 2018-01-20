(function() {
    'use strict';

    angular.module('ironridge')
    .controller('ComponentsDetailCtrl', function($scope, $rootScope, $window, $timeout, $document, project) {
        var _imgBaseUrl = '//files.ironridge.com/images/';
        var _imgBlank = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP4/x8AAwAB/2+Bq7YAAAAASUVORK5CYII=';
        //var countdown;

        $rootScope.activeOrientation = 'portrait';
        $rootScope.engineeringOrientation = 'portrait';

        var _countStatusSwitch = function() {
          $rootScope.nbrPanelsPortrait = 0;
          $rootScope.nbrPanelsLandscape = 0;

          project.info.arrays.objects.forEach(function(d) {
            if (d.portrait) {
              $rootScope.nbrPanelsPortrait++;
            } else {
              $rootScope.nbrPanelsLandscape++;
            }
          });

          $rootScope.activeOrientation = 'portrait';

          if ($rootScope.nbrPanelsPortrait && $rootScope.nbrPanelsLandscape) {
             $rootScope.activeOrientation = 'portrait';
           }

           if (!$rootScope.nbrPanelsPortrait && $rootScope.nbrPanelsLandscape) {
             $rootScope.activeOrientation = 'landscape';
           }
           $rootScope.$emit('updateActiveOrientation', $rootScope.activeOrientation);
        };
        _countStatusSwitch();

        var _setAttachmentImg = function () {
          switch (project.info.attachments.type) {
            case 'none':
              $scope.attachmentImg = _imgBlank;
              break;
            case 'A4':
              $scope.attachmentImg = _imgBaseUrl + 'Flush_Standoff_4_150x150.png';
              break;
            case 'A7':
              $scope.attachmentImg = _imgBaseUrl + 'Flush_Standoff_7in_150x150.png';
              break;
            case 'flashfoot':
              if((!project.info.ufo && project.info.attachments.flashfoot_finish === 'mill') || (project.info.ufo && project.info.bill_of_material.attachments_finish === 'clear')) {
                $scope.attachmentImg = _imgBaseUrl + 'FlashFoot_150x150.png';
              } else {
                $scope.attachmentImg = _imgBaseUrl + 'FlashFoot_Black_150x150.png';
              }
            break;
            case 'flashfoot2':
              if((!project.info.ufo && project.info.attachments.flashfoot_finish === 'mill') || (project.info.ufo && project.info.bill_of_material.attachments_finish === 'clear')) {
                $scope.attachmentImg = _imgBaseUrl + 'flashfoot2/FF2_Mill%400%2C25x.png';
              } else {
                $scope.attachmentImg = _imgBaseUrl + 'flashfoot2/FF2_Black%400%2C25x.png';
              }
            break;
            case 'lfoot':
              if((!project.info.ufo && project.info.attachments.l_foot_finish === 'mill') || (project.info.ufo && project.info.bill_of_material.attachments_finish === 'clear')) {
                $scope.attachmentImg = _imgBaseUrl + (project.info.flashfoot2 ? 'flashfoot2/Slotted_L-Foot%400%2C25x.png' :'L-Foot_150x150.png');
              } else {
                $scope.attachmentImg = _imgBaseUrl + (project.info.flashfoot2 ? 'flashfoot2/Slotted_L-Foot_Black%400%2C25x.png' : 'L-Foot_Black_150x150.png');
              }
            break;
          }
        };

        var _setClampsImg = function () {
          switch (project.info.clamps.type) {
            case 'ig':
              if (project.info.clamps.finish === 'black')
                $scope.clampsImg = _imgBaseUrl + 'IG_Clamp_Black_150x150.png';
              else
                $scope.clampsImg = _imgBaseUrl + 'IG_Clamp_150x150.png';
              break;
            case 'tbolt':
              if (project.info.clamps.finish === 'black')
                $scope.clampsImg = _imgBaseUrl + 'Standard_Mid_Clamp_T_Black_150x150.png';
              else
                $scope.clampsImg = _imgBaseUrl + 'Standard_Mid_Clamp_T_150x150.png';
              break;
            case 'hex':
              if (project.info.clamps.finish === 'black')
                $scope.clampsImg = _imgBaseUrl + 'Standard_Mid_Clamp_Hex_Black_150x150.png';
              else
                $scope.clampsImg = _imgBaseUrl + 'Standard_Mid_Clamp_Hex_150x150.png';
            break;
          }
        };

        var _setRailsXRImg = function () {
          // railsXRImg
          if ((!project.info.ufo && project.railsSession.XR10.color === 'black') || (project.info.ufo && project.info.bill_of_material.rails_and_splices_finish === 'black' && window.project_type !== 'flat') ) {
            $scope.railsXR10Img = _imgBaseUrl + 'XR10B_150x150.png';
          } else {
            $scope.railsXR10Img = _imgBaseUrl + 'XR10_150x150.png';
          }

          if ((!project.info.ufo && project.railsSession.XR100.color === 'black') || (project.info.ufo && project.info.bill_of_material.rails_and_splices_finish === 'black' && window.project_type !== 'flat')) {
            $scope.railsXR100Img = _imgBaseUrl + 'XR100B_150x150.png';
          } else {
            $scope.railsXR100Img = _imgBaseUrl + 'XR100_150x150.png';
          }

          $scope.railsXR1000Img = _imgBaseUrl + 'XR1000_150x150.png';
        };

        // $scope.keyDownUpdateAttachmentSpan = function() {
        //   $timeout.cancel(countdown);
        //   $scope.haveToSaveAttachmentSpan = true;
        // };
        //
        // $scope.keyUpUpdateAttachmentSpan = function() {
        //   $scope.haveToSaveAttachmentSpan = true;
        //   countdown = $timeout(function() {
        //     $scope.haveToSaveAttachmentSpan = false;
        //     $scope.onRailsSelect();
        //   }, 1000);
        //
        // };

        $scope.selectAllContent= function($event) {
          $event.target.select();
          $window.onkeydown = null;
          // function (e) {
          //   var jqTarget = angular.element(e.target);
          //
          //   if (e.keyCode === 9) {
          //     var jqVisibleInputs = angular.element(':input:visible,a');
          //     var jqFirst = jqVisibleInputs.first();
          //     var jqLast = jqVisibleInputs.last();
          //
          //     if (!e.shiftKey && jqTarget.is(jqLast)) {
          //       e.preventDefault();
          //       jqFirst.focus();
          //     } else if (e.shiftKey && jqTarget.is(jqFirst)) {
          //       e.preventDefault();
          //       jqLast.focus();
          //     }
          //   }
          // };
        };

        $scope.blurAttachmentSpan = function () {
          // if ($scope.haveToSaveAttachmentSpan) {
          //    $timeout.cancel(countdown);
          //    $scope.haveToSaveAttachmentSpan = false;
          // project.info.rails.color = project.info.modules.panel_finish;
             $scope.onRailsSelect(null, project.info.rails.selected_rails);
             if($rootScope.disableKeyDown) $rootScope.disableKeyDown();
          // }
        };

        $scope.onClampsSelect = function(){
          if(project.info.clamps.type === 'ig'){
            project.info.clamps.wiley_components = false;
          }

          _setClampsImg();

          project.postData('clamps').then(function(result) {
            project.info.summary = result.data.summary;
            project.info.bill_of_material = result.data.bill_of_material;
            project.info.documents = result.data.documents;
            project.info.structural_loads=result.data.structural_loads;
            _setClampsImg();
          });
        };

        $scope.onAttachmentSelect = function(){
          if (project.info.attachments.type === 'A3' || project.info.attachments.type === 'A4' ||
            project.info.attachments.type === 'A6' || project.info.attachments.type === 'A7') {
            if (project.info.attachments.flashfoot_finish === 'black') {
              project.info.attachments.flashfoot_finish = 'mill';
            }
          }

          if(project.info.bill_of_material.attachments_finish){
            if(project.info.attachments.type === 'flashfoot2' || project.info.attachments.type === 'flashfoot')
              project.info.attachments.flashfoot_finish = project.info.bill_of_material.attachments_finish === 'black' ? 'black' : 'mill';
            else if(project.info.attachments.type === 'lfoot')
              project.info.attachments.l_foot_finish = project.info.bill_of_material.attachments_finish === 'black' ? 'black' : 'mill';
          }

          $scope.setImageSources();

          project.postData('attachments').then(function(result) {
            project.info.summary = result.data.summary;
            project.info.bill_of_material = result.data.bill_of_material;
            project.info.structural_loads=result.data.structural_loads;
            project.info.documents = result.data.documents;
            _setAttachmentImg();
          });
        };



        $rootScope.switchOrientation = function(detailMode, $event){
          if($event && $event.currentTarget.attributes.disabled && $event.currentTarget.attributes.disabled.specified === true){
            return;
          }

          $rootScope.activeOrientation = detailMode;
          $rootScope.engineeringOrientation = detailMode;
        };

        $rootScope.switchEngineeringOrientation = function(detailMode, $event){
          if($event && $event.currentTarget.attributes.disabled && $event.currentTarget.attributes.disabled.specified === true){
            return;
          }

          $rootScope.engineeringOrientation = detailMode;
        };

        $rootScope.setImageSources = function () {
          _setRailsXRImg();
          _setAttachmentImg();
          _setClampsImg();
        };

        $rootScope.hilightSelectedRails = function(rails_id){
          if (rails_id === 'XR10'){
            $scope.model_rails_class = 'activeXR10';
          }
          else if (rails_id === 'XR1000'){
            $scope.model_rails_class = 'activeXR1000';
          }
          else if(rails_id === 'XR100'){
            //rails_id == 'XR100'
            $scope.model_rails_class = 'activeXR100';
          }
        };

        angular.element(window).unbind('keydown').keydown();
        $rootScope.setImageSources();
        $rootScope.hilightSelectedRails(project.info.rails.selected_rails);

        $rootScope.$on('project.redraw.arrays', function () {
          $scope.hilightSelectedRails(project.info.rails.selected_rails);
        });
    });
})();
