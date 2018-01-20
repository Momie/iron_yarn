(function() {
  'use strict';

  angular.module('ironridge')
    .controller('QuoteCtrlMount', function(config, $scope, $state, $timeout, $window, $rootScope, $http, $document,$localStorage, projectMount, lodash, api, gaSend) {
      var _spareQuantityCountdown,
          _countdown,
          _imgBaseUrl = '//files.ironridge.com/images/';

      $scope.hosturl = config.HOST_URL;
      $scope.projectMount = projectMount;
      $state.tab = 'quote';
      $scope.nav = {radio: 'quote'};
      $scope.img = 'http://i61.tinypic.com/15mxl4n.jpg';
      $scope.zipSate = 'Zip All Files';
      $scope.srcZipImg = 'zip';
      $scope.sharing = {
        name: '',
        email: '',
        Rep: false,
        bom: false
      };
      $scope.buidingBom = false;
      $scope.buidingRep = false;

      $rootScope.$emit('Quote_tab', 'Mount');

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
        projectMount.info.bill_of_material.groups_of_items.forEach(function(line, group){
          line.items.forEach(function(item, index) {
            if(!projectMount.quantityValues[group]) projectMount.quantityValues[group] = [];
            projectMount.quantityValues[group][index] = item.quantity + item.spare_quantity;
          });
        });
      };

      var _updateSpareQuantity = function(item, group,  index) {
        var spare_quantity = parseInt(projectMount.quantityValues[group][index], 10) - item.quantity;
        if (spare_quantity >= -1 * item.quantity)
          item.spare_quantity = spare_quantity;
        else
          item.spare_quantity = -1 * item.quantity;
          $scope.updateBillOfMaterial();
      };

      var _updateDiscount = function() {
        projectMount.postData('discount').then(function(result) {
          projectMount.info.discount = result.data.discount;
          projectMount.info.summary = result.data.summary;
          projectMount.info.bill_of_material = result.data.bill_of_material;
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
          $rootScope.toggleModal('attachments_Img', '<br><br><p class="img-quotes"><img src="' +_imgBaseUrl + 'flashfoot.jpg' + '" > <img src="' +_imgBaseUrl + 'bonded_l-feet.jpg' + '" > <img src="' +_imgBaseUrl + 'flush_standoffs.jpg' + '" ></p><p class="img-quotes"><label>FlashFoot</label> <label>Bonded L-Feet</label> <label>Flush Standoffs</label></p>');
        }
        else if(group.toLowerCase().indexOf('clamps') !== -1){
           $rootScope.toggleModal('clamps_Img', '<br><br><p class="img-quotes"><img src="' +_imgBaseUrl + 'ufo_clamps_2.jpg' + '" > <img src="' +_imgBaseUrl + 'stopper_sleeves.jpg' + '" > <img src="' +_imgBaseUrl + 'grounding_lugs_2.jpg' + '" ></p><p class="img-quotes"><label>UFO Clamps</label> <label>Stopper Sleeves</label> <label>Grounding Lugs</label></p>');
        }
        else if(group.toLowerCase().indexOf('rails') !== -1){
          $rootScope.toggleModal('rails_Img',  '<br><br><p class="img-quotes"><img src="' +_imgBaseUrl + 'xr10_rail.jpg' + '" > <img src="' +_imgBaseUrl + 'xr100_rail.jpg' + '" > <img src="' +_imgBaseUrl + 'xr1000_rail.jpg' + '" ></p> <p class="img-quotes"><label>XR10 Rail</label> <label>XR100 Rail</label> <label>XR1000 Rail</label></p> <hr><p class="img-quotes"><img src="' +_imgBaseUrl + 'bonded_splices.jpg' + '" ></p><p class="img-quotes"><label>Internal Bonded Splices</label></p>');
        }
        else if(group.toLowerCase().indexOf('accessories') !== -1){
          $rootScope.toggleModal('accessories_Img', '<br><br><p class="img-quotes"><img src="' +_imgBaseUrl + 'wire_clips.jpg' + '" > <img src="' +_imgBaseUrl + 'end_caps.jpg' + '" > <img src="' +_imgBaseUrl + 'mi_kit.jpg' + '" ></p> <p class="img-quotes"><label>Wire Clips</label> <label>End Caps</label> <label>Microinverter Kit</label></p>');
        }
        else if(group.toLowerCase().indexOf('substructure') !== -1){
          $rootScope.toggleModal('substructure_Img', '<br><br><p class="img-quotes"><img src="' +_imgBaseUrl + 'top_caps.jpg' + '" > <img src="' +_imgBaseUrl + 'bonded_rail_connectors.jpg' + '" > <img src="' +_imgBaseUrl + 'diagonal_brace.jpg' + '" ></p><p class="img-quotes"><label>Top Caps</label> <label>Rail Connectors</label> <label>Diagonal Braces</label></p>');
        }
        else if(group.toLowerCase().indexOf('tilt') !== -1){
          $rootScope.toggleModal('tilt_Img', '<br><br><p class="img-tilt"><img src="' +_imgBaseUrl + 'tilt_legs.jpg' + '" ></p>');
        }
      };

      $scope.onColorSelect = function(rails_id){
        projectMount.postData('bill_of_material').then(function(result) {
          projectMount.info.summary = result.data.summary;
          projectMount.info.bill_of_material = result.data.bill_of_material;
          projectMount.info.structural_loads = result.data.structural_loads;
          projectMount.info.documents = result.data.documents;
          projectMount.info.rails = result.data.rails;
          projectMount.info.sub_arrays = result.data.sub_arrays;
          projectMount.info.tilt_leg = result.data.tilt_leg;
        });
      };

      $scope.parseFloat = function(value){
        if(value) return parseFloat(value);
     };

      $scope.selectAllContent = function($event) {
        $event.target.select();
      };

      $scope.keyDownSpareQuantity = function() {
        $timeout.cancel(_spareQuantityCountdown);
        $scope.haveToUpdateSpareQuantity = true;
      };

      $scope.keyUpSpareQuantity = function(item, group, index) {
        $scope.haveToUpdateSpareQuantity = true;
        console.log(item);
        _spareQuantityCountdown = $timeout(function() {
          $scope.haveToUpdateSpareQuantity = false;
          _updateSpareQuantity(item, group , index);
        }, 500);
      };

      $scope.blurSpareQuantity = function(item, group, index) {
        if ($scope.haveToUpdateSpareQuantity) {
          $timeout.cancel(_spareQuantityCountdown);
          $scope.haveToUpdateSpareQuantity = false;
          _updateSpareQuantity(item, group, index);
        }
      };

      $scope.updateBillOfMaterial = function() {
        projectMount.postData('bill_of_material').then(function(result) {
          projectMount.info.summary = result.data.summary;
          projectMount.info.bill_of_material = result.data.bill_of_material;
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
          console.log('lets send data');
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
        projectMount.info.bill_of_material.groups_of_items.forEach(function(line, group){
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
        gaSend.sendToGa('event', 'CSV File', 'download', 'Ground Based');
        api.downloadPdf(projectMount.info.download_csv).then(function(result) {
          var file = new Blob([result.data], {type: 'text/csv'});
          var a = angular.element('<a/>').attr('href', URL.createObjectURL(file)).attr('download',  'bom_' + projectMount.info.summary.project_name.replace(/ /g,'_').replace(/\./g,'_')  + '_' + new Date().toJSON().slice(0,10).replace(/-/g,'') + '.csv');
          $document.find('body').append(a);
          if(typeof a.download !== 'undefined'){
            a[0].click();
          }else{
            console.log('download functionily is not available');
            if(!window.test) window.location = projectMount.info.download_csv;
          }
        },
        function(state){
        });
      };
      $scope.documentAnalytic = function(){
        gaSend.sendToGa('event', 'Document', 'download', 'Ground Based');
      };
      $scope.printFunc = function (){
        gaSend.sendToGa('event', 'Project', 'print', 'Ground Based');
      };
      $scope.shareFunc = function(){
        gaSend.sendToGa('event', 'Project', 'share', 'Ground Based');
      };


      $scope.downloadZip = function() {
        $scope.zipSate = 'Zipping...';
        gaSend.sendToGa('event', 'Zip File', 'download', 'Ground Based');
        _progressAnnimation(100);
        $timeout(function(){
          _progressAnnimation(50);
        },500);

        api.downloadZipFile(projectMount.info.id).then(function(result) {
          console.log('download zip', result);
          var file = new Blob([result.data], {
            type: 'application/octet-stream',
            responseType: 'arraybuffer'
          });

          var a = angular.element('<a/>').attr('href', URL.createObjectURL(file)).attr('download', projectMount.info.location_wind_and_snow.site_name + '.zip');
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


     $scope.onAccessoriesSelectMount = function(){
       projectMount.postData('accessories').then(function(result) {
         projectMount.info.summary = result.data.summary;
         projectMount.info.bill_of_material = result.data.bill_of_material;
         projectMount.info.accessories = result.data.accessories;
         _updateQuantityValues();
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
          if ($scope.sharing.Rep) gaSend.sendToGa('event', 'PDF Report', 'email',  'Ground Based');
          if ($scope.sharing.bom) gaSend.sendToGa('event', 'BOM Report', 'email',  'Ground Based');
          $rootScope.isLoading = true;
          $rootScope.loaderText = 'Sending';
          api.shareReport(projectMount.info.share_report, {
            name: $scope.sharing.name,
            email: $scope.sharing.email,
            project_id: projectMount.info.id,
            rep: $scope.sharing.Rep,
            bom: $scope.sharing.bom
          }).then(function(){
            $rootScope.isLoading = false;
            projectMount.postData({'completed' : true}, true, false);
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
        var title = 'bom_' + projectMount.info.summary.project_name.replace(/ /g,'_').replace(/\./g,'_')  + '_' + new Date().toJSON().slice(0,10).replace(/-/g,'');
        if(type == 'bom') {
          gaSend.sendToGa('event', 'BOM PDF File', 'download',  'Ground Based');
          $scope.buidingBom = true;
        } else {
          title = 'rpt_' + projectMount.info.summary.project_name.replace(/ /g,'_').replace(/\./g,'_')  + '_' + new Date().toJSON().slice(0,10).replace(/-/g,'');
          gaSend.sendToGa('event', 'PDF Report', 'download',  'Ground Based');
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
          projectMount.postData({'completed' : true}, true, false);
        },
        function(state){
          $scope.buidingBom = false;
          $scope.buidingRep = false;
        });
     };

      $document.bind('keydown', function(event) {
        var attrs = event.currentTarget.activeElement.attributes;

        if (attrs['tab-stop-zip-QM']) {
                angular.element('#print_project_mount').focus();
                event.preventDefault();
        }

        if (attrs['tab-stop-QM']) {
          angular.element('#inlineCheckbox1M').focus();
          event.preventDefault();
        }
      });

      if (!$scope.projectMount.info.discount || lodash.isEmpty($scope.projectMount.info.discount))
        $scope.projectMount.info.discount = 0;

      _updateQuantityValues();

      $timeout(function () {
        angular.element('#companyId').focus();
        $timeout(function () {
          angular.element('#companyId').blur();
        }, 1);
      }, 1);

      angular.element(document).ready(function () {
        if(projectMount.info.location_wind_and_snow.zip_code && (!projectMount.info.modules.manufacturer.id || !projectMount.info.modules.model.id || !projectMount.info.id)){
            $state.go('siteId', {
              'id': projectMount.info.id
            });
            alerts.show('manuf-model-not-set');
        }

        if(!$rootScope.user && $localStorage.ironridge[projectMount.info.id] && !$localStorage.ironridge[projectMount.info.id].isaccepted){
            $state.go('siteId', {
              'id': projectMount.info.id
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
