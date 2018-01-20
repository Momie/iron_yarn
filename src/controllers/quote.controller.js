(function() {
  'use strict';

  angular.module('ironridge')
    .controller('QuoteCtrl', function(config, $scope, $state, $timeout, $window, $rootScope, $http, $document, project, lodash, api, alerts, $localStorage, gaSend) {
      var _spareQuantityCountdown,
      _countdown,
      _imgBaseUrl = '//files.ironridge.com/images/';

      $scope.project = project;
      $state.tab = 'quote';
      $scope.hosturl = config.HOST_URL;
      $scope.env = config.env;
      //current page reflected in navigation bar
      $scope.nav = {radio: 'quote'};
      $scope.img = 'http://i61.tinypic.com/15mxl4n.jpg';
      $scope.project_type = window.project_type;
      $scope.zipSate = 'Zip All Files';
      $scope.srcZipImg = 'zip';

      $rootScope.$emit('Quote_tab', 'PF');

      $scope.sharing = {
        name: '',
        email: '',
        Rep: false,
        bom: false
      };
      $scope.buidingBom = false;
      $scope.buidingRep = false;
      if(config.JOYRIDE){
        try{
          hopscotch.endTour();
        }
        catch(e){
          console.log('');
        }
        finally{
          if (!$localStorage.ironridge.joyRide || !$localStorage.ironridge.joyRide[5]) {
            if (!$localStorage.ironridge.joyRide) $localStorage.ironridge.joyRide = {};
            $localStorage.ironridge.joyRide[5] = true;
            setTimeout(function(){
              hopscotch.startTour(tour, 5);
            }, 2000);
          }
        }
      }
      var _updateQuantityValues = function() {
          project.info.bill_of_material.groups_of_items.forEach(function(line, group){
            line.items.forEach(function(item, index) {
              if(!project.quantityValues[group]) project.quantityValues[group] = [];
              project.quantityValues[group][index] = item.quantity + item.spare_quantity;
            });
          });
      };


      var _updateSpareQuantity = function(item, group, index) {
        var spare_quantity = parseInt(project.quantityValues[group][index], 10) - item.quantity;
        if (spare_quantity >= -1 * item.quantity)
          item.spare_quantity = spare_quantity;
        else
          item.spare_quantity = -1 * item.quantity;
        $scope.updateBillOfMaterial();
      };

      var _updateDiscount = function() {
        project.postData('discount').then(function(result) {
          project.info.discount = result.data.discount;
          project.info.summary = result.data.summary;
          project.info.bill_of_material = result.data.bill_of_material;
          _updateQuantityValues();
        });
      };

      var _progressAnnimation = function(progressVal){
        var val = progressVal;
        var r = angular.element('#circleProgression').attr('r');
        var c = Math.PI*(r*2);

        if (val < 0) { val = 0;}
        if (val > 100) { val = 100;}

        var pct = ((100 - val)/100)*c;

        angular.element('#circleProgression').css({ strokeDashoffset: pct});
      };


      $scope.closeNew = function(){
        angular.element('#modalNotife').css({'display': 'none'});
      };

      $scope.toggleModalImg = function(group){
        if(group.toLowerCase().indexOf('attachments') !== -1){
          if(project.info.flashfoot2)
            $rootScope.toggleModal('attachments_Img', '<br><br><p class="img-quotes-attachment"><img src="' +_imgBaseUrl + 'flashfoot2/FF2-Mill.png' + '" > <img src="' +_imgBaseUrl + 'flashfoot2/L-Foot-Mill.png' + '" > <img src="' +_imgBaseUrl + 'flashfoot2/Attachment-Bonding-Hardware.png' + '" > <img src="' +_imgBaseUrl + 'flush_standoffs.jpg' + '" ></p><p class="img-quotes-attachment"><label>FlashFoot2</label> <label>Slotted L-Feet</label> <label>Bonding Hardware</label> <label>Standoffs</label></p>');
          else
            $rootScope.toggleModal('attachments_Img', '<br><br><p class="img-quotes"><img src="' +_imgBaseUrl + 'flashfoot.jpg' + '" > <img src="' +_imgBaseUrl + 'bonded_l-feet.jpg' + '" > <img src="' +_imgBaseUrl + 'flush_standoffs.jpg' + '" ></p><p class="img-quotes"><label>FlashFoot</label> <label>Bonded L-Feet</label> <label>Standoffs</label></p>');
        }
        else if(group.toLowerCase().indexOf('clamps') !== -1){
           $rootScope.toggleModal('clamps_Img', '<br><br><p class="img-quotes"><img src="' +_imgBaseUrl + 'ufo_clamps_2.jpg' + '" > <img src="' +_imgBaseUrl + 'stopper_sleeves.jpg' + '" > <img src="' +_imgBaseUrl + 'grounding_lugs_2.jpg' + '" ></p><p class="img-quotes"><label>UFO Clamps</label> <label>Stopper Sleeves</label> <label>Grounding Lugs</label></p>');
        }
        else if(group.toLowerCase().indexOf('rails') !== -1){
          $rootScope.toggleModal('rails_Img',  '<br><br><p class="img-quotes"><img src="' +_imgBaseUrl + 'xr10_rail.jpg' + '" > <img src="' +_imgBaseUrl + 'xr100_rail.jpg' + '" > <img src="' +_imgBaseUrl + 'xr1000_rail.jpg' + '" ></p> <p class="img-quotes"><label>XR10 Rail</label> <label>XR100 Rail</label> <label>XR1000 Rail</label></p> <hr><p class="img-quotes"><img src="' +_imgBaseUrl + 'bonded_splices.jpg' + '" ></p><p class="img-quotes"><label>Internal Bonded Splices</label></p>');
        }
        else if(group.toLowerCase().indexOf('accessories') !== -1){
          $rootScope.toggleModal('accessories_Img', '<br><br><p class="img-quotes-attachment"><img src="' +_imgBaseUrl + 'wire_clips.jpg' + '" > <img src="' +_imgBaseUrl + 'end_caps.jpg' + '" > <img src="' +_imgBaseUrl + 'mi_kit.jpg' + '" > <img src="https://s3-us-west-1.amazonaws.com/files.ironridge.com/images/carousel/conduit_mount_.jpg" >  </p> <p class="img-quotes-attachment"><label>Wire Clips</label> <label>End Caps</label> <label>Microinverter Kit</label> <label>Conduit Mount</label></p>');
        }
        else if(group.toLowerCase().indexOf('substructure') !== -1){
          $rootScope.toggleModal('substructure_Img', '<br><br><p class="img-quotes"><img src="' +_imgBaseUrl + 'top_caps.jpg' + '" > <figcaption>Top Caps</figcaption> <img src="' +_imgBaseUrl + 'bonded_rail_connectors.jpg' + '" > <img src="' +_imgBaseUrl + 'diagonal_brace.jpg' + '" ></p><p class="img-quotes"><label>Top Caps</label> <label>Rail Connectors</label> <label>Diagonal Braces</label></p>');
        }
        else if(group.toLowerCase().indexOf('tilt') !== -1){
          $rootScope.toggleModal('tilt_Img', '<br><br><p class="img-tilt"><img src="' +_imgBaseUrl + 'tilt_legs.jpg' + '" ></p>');
        }
      };

      $scope.onColorSelect = function(rails_id){
        project.postData('bill_of_material').then(function(result) {
          project.info.summary = result.data.summary;
          project.info.bill_of_material = result.data.bill_of_material;
          project.info.structural_loads = result.data.structural_loads;
          project.info.documents = result.data.documents;
          project.info.rails = result.data.rails;
          project.info.sub_arrays = result.data.sub_arrays;
          project.info.tilt_leg = result.data.tilt_leg;
        });
      };

      $scope.selectAllContent = function($event) {
        $event.target.select();
      };

      $scope.keyDownSpareQuantity = function() {
        $timeout.cancel(_spareQuantityCountdown);
        $scope.haveToUpdateSpareQuantity = true;
      };

      $scope.keyUpSpareQuantity = function(item, group , index) {
        $scope.haveToUpdateSpareQuantity = true;
        _spareQuantityCountdown = $timeout(function() {
          $scope.haveToUpdateSpareQuantity = false;
          _updateSpareQuantity(item, group , index);
        }, 500);
      };

      $scope.blurSpareQuantity = function(item, group , index) {
        if ($scope.haveToUpdateSpareQuantity) {
          $timeout.cancel(_spareQuantityCountdown);
          $scope.haveToUpdateSpareQuantity = false;
          _updateSpareQuantity(item, group , index);
        }
      };

      $scope.onAccessoriesSelect = function() {
        project.postData('accessories').then(function(result) {
          project.info.summary = result.data.summary;
          project.info.bill_of_material = result.data.bill_of_material;
          project.info.accessories = result.data.accessories;
          _updateQuantityValues();
        });
      };

      $scope.updateBillOfMaterial = function() {
        project.postData('bill_of_material').then(function(result) {
          project.info.summary = result.data.summary;
          project.info.bill_of_material = result.data.bill_of_material;
          project.info.accessories = result.data.accessories;
          _updateQuantityValues();
        });
      };

      $scope.keyDownUpdateDiscount = function() {
        $timeout.cancel(_countdown);
        $scope.haveToSaveDiscount = true;
      };

      $scope.keyUpUpdateDiscount = function() {
        $scope.haveToSaveDiscount = true;
        _countdown = $timeout(function() {
          $scope.haveToSaveDiscount = false;
          _updateDiscount();
        }, 700);
      };

      $scope.blurDiscount = function() {
        if ($scope.haveToSaveDiscount) {
          $timeout.cancel(_countdown);
          $scope.haveToSaveDiscount = false;
          _updateDiscount();
        }
      };

      $scope.go = function(link) {
        window.location.href = config.HOST_URL + link;
      };

      $scope.quantityReset = function() {
        project.info.bill_of_material.groups_of_items.forEach(function(line, group){
            line.items.forEach(function(item, index) {
              item.spare_quantity = 0;
            });
        });
        $scope.updateBillOfMaterial();
      };

      $scope.quantityReduce = function(item) {
        if (item.spare_quantity > -1 * item.quantity) {
          item.spare_quantity--;
          $scope.updateBillOfMaterial();
        }
      };

      $scope.quantityAdd = function(item) {
        item.spare_quantity++;
        $scope.updateBillOfMaterial();
      };

      $scope.calculatePrice = function(item) {
        item.total_price = parseFloat(item.price_each.substring(1)) * item.quantity;
        item.total_price = '$' + item.total_price.toFixed(2);
        return item.total_price;
      };

      $scope.downloadCsvFunc = function(){
        gaSend.sendToGa('event', 'CSV File', 'download', (window.project_type === 'flat' ? 'Flat Roof' : 'Pitched Roof'));
        api.downloadPdf(project.info.download_csv).then(function(result) {
          var file = new Blob([result.data], {type: 'text/csv'});
          var a = angular.element('<a/>').attr('href', URL.createObjectURL(file)).attr('download',  'bom_' + project.info.summary.project_name.replace(/ /g,'_').replace(/\./g,'_')  + '_' + new Date().toJSON().slice(0,10).replace(/-/g,'') + '.csv');
          $document.find('body').append(a);
          if(typeof a.download !== 'undefined'){
            a[0].click();
          }else{
            console.log('download functionily is not available');
            if(!window.test) window.location = project.info.download_csv;
          }
        },
        function(state){
        });
      };

      $scope.documentAnalytic = function(){
        gaSend.sendToGa('event', 'Document', 'download', (window.project_type === 'flat' ? 'Flat Roof' : 'Pitched Roof'));
      };
      $scope.printFunc = function (){
        gaSend.sendToGa('event', 'Project', 'print', (window.project_type === 'flat' ? 'Flat Roof' : 'Pitched Roof'));
      };
      $scope.shareFunc = function(){
        gaSend.sendToGa('event', 'Project', 'share', (window.project_type === 'flat' ? 'Flat Roof' : 'Pitched Roof'));
      };
      $scope.downloadZip = function() {
        gaSend.sendToGa('event', 'Zip File', 'download', (window.project_type === 'flat' ? 'Flat Roof' : 'Pitched Roof'));
        $scope.zipSate = 'Zipping...';
        _progressAnnimation(100);
        $timeout(function(){
          _progressAnnimation(50);
        },500);

        api.downloadZipFile(project.info.id).then(function(result) {
          var file = new Blob([result.data], {
            type: 'application/octet-stream',
            responseType: 'arraybuffer'
          });

          var a = angular.element('<a/>').attr('href', URL.createObjectURL(file)).attr('download', project.info.location.site_name + '.zip');
          $document.find('body').append(a);
          a[0].click();
          _progressAnnimation(0);

          $timeout(function(){
            $scope.zipSate = 'Zipped';

            $timeout(function(){
              $scope.zipSate = 'Zip All Files';
              $document.find(a).remove();
            },1000);
          },1000);
        },
        function(state){
          _progressAnnimation(0);
          $scope.zipSate = 'Zip All Files';
        });
      };

     $scope.shareReport = function(type){
        if($rootScope.user){
          $scope.sharing.name = '';
          $scope.sharing.nameError = false;
          $scope.sharing.email = '';
          $scope.sharing.emailError = false;
          $scope.sharing.Rep = false;
          $scope.sharing.bom = false;
          $scope.sharing[type] = true;
          angular.element('#modalshareReport').modal('show');
          angular.element('#modalshareReport').css({'display': 'flex',  'align-items': 'center'});
        }else{
            $scope.textToregister = 'To email a Project Report or Bill of Materials, you must be signed in';
            angular.element('#RegisterModal').modal('show');
            angular.element('#RegisterModal').css({'display': 'flex',  'align-items': 'center'});
        }
     };
     $scope.sendReport = function(){
        $scope.sharing.nameError = !$scope.sharing.name;
        $scope.sharing.emailError = !$scope.sharing.email;

        if (!$scope.sharing.nameError && !$scope.sharing.emailError) {
          if ($scope.sharing.Rep) gaSend.sendToGa('event', 'PDF Report', 'email',  (window.project_type === 'flat' ? 'Flat Roof' : 'Pitched Roof'));
          if ($scope.sharing.bom) gaSend.sendToGa('event', 'BOM Report', 'email',  (window.project_type === 'flat' ? 'Flat Roof' : 'Pitched Roof'));
          $rootScope.isLoading = true;
          $rootScope.loaderText = 'Sending';
          api.shareReport(project.info.share_report, {
            name: $scope.sharing.name,
            email: $scope.sharing.email,
            project_id: project.info.id,
            rep: $scope.sharing.Rep,
            bom: $scope.sharing.bom
          }).then(function(){
            $rootScope.isLoading = false;
            project.postData({'completed' : true}, true, false);
            angular.element('#modalshareReport').modal('hide');
            angular.element('#modalshareReport').css({'display': 'inherit'});
            setTimeout(function(){
              angular.element('#modalshareReport').fadeOut(700);
            }, 2000);
          });
        }
     };

     $scope.downloadPdf = function(url, type) {
        if(!$rootScope.user){
            $scope.textToregister = 'To download a Project Report or Bill of Materials, you must be signed in';
            angular.element('#RegisterModal').modal('show');
            angular.element('#RegisterModal').css({'display': 'flex',  'align-items': 'center'});
            return;
        }
        var title = 'bom_' + project.info.summary.project_name.replace(/ /g,'_').replace(/\./g,'_')  + '_' + new Date().toJSON().slice(0,10).replace(/-/g,'');
        if(type == 'bom') {
          gaSend.sendToGa('event', 'BOM PDF File', 'download',  (window.project_type === 'flat' ? 'Flat Roof' : 'Pitched Roof'));
          $scope.buidingBom = true;
        } else {
          title = 'rpt_' + project.info.summary.project_name.replace(/ /g,'_').replace(/\./g,'_') + '_' + new Date().toJSON().slice(0,10).replace(/-/g,'');
          gaSend.sendToGa('event', 'PDF Report', 'download',  (window.project_type === 'flat' ? 'Flat Roof' : 'Pitched Roof'));
          $scope.buidingRep = true;
        }
        api.downloadPdf(url).then(function(result) {
          var file = new Blob([result.data], {type: 'application/pdf'});
          if (window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident") > -1) {
            window.navigator.msSaveOrOpenBlob(file, title);
          } else {
            var a = angular.element('<a/>').attr('href', URL.createObjectURL(file)).attr('download',  title);
            $document.find('body').append(a);
            a[0].click();
          }
          $scope.buidingBom = false;
          $scope.buidingRep = false;
          project.postData({'completed' : true}, true, false);
        },
        function(state){
          $scope.buidingBom = false;
          $scope.buidingRep = false;
        });
     };

      $document.bind('keydown', function(event) {
        var attrs = event.currentTarget.activeElement.attributes;

        if (attrs['tab-stop-zip-Q']) {
          angular.element('#print_project').focus();
          event.preventDefault();
        }
        if (attrs['tab-stop-Q']) {
          angular.element('#inlineCheckbox1').focus();
          event.preventDefault();
        }
      });

      if (!$scope.project.info.discount || lodash.isEmpty($scope.project.info.discount))
        $scope.project.info.discount = 0;

      _updateQuantityValues();

      $timeout(function () {
        angular.element('#companyId').focus();
        $timeout(function () {
          angular.element('#companyId').blur();
        }, 1);
      }, 1);

      angular.element(document).ready(function () {
        if(project.info.location.zip_code && (!project.info.modules.manufacturer.id || !project.info.modules.model.id || !project.info.id)){
            $state.go('siteId', {
              'id': project.info.id
            });
            alerts.show('manuf-model-not-set');
        }

        if(!$rootScope.user && $localStorage.ironridge[project.info.id] && !$localStorage.ironridge[project.info.id].isaccepted){
            $state.go('siteId', {
              'id': project.info.id
            });
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
