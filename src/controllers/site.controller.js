'use strict';

SiteController.$inject = ['$scope', '$rootScope'];
function SiteController($scope, $rootScope) {

}

module.exports = SiteController;

// (function() {
//     'use strict';
//     angular.module('ironridge')
//         .controller('SiteCtrl', function($scope, $state, $stateParams, $rootScope, $http, $timeout, $window, $localStorage, api, project, alerts, $document, msgHandler, gaSend, config) {
//             var _projectName = project.info.location.site_name;
//             var _zipRegex = /^([0-9]{5})(?:[-\s]*([0-9]{4}))?$/;
//             var _callFlag = false;
//             $state.tab = 'site';
//             gaSend.sendToGa('event', 'Site Tab', 'visit', (window.project_type === 'flat' ? 'Flat Roof' : 'Pitched Roof'));
//             console.log('site');
//             $scope.project = project;
//             //current page refelected in navigation bar
//             $scope.nav = { 'radio': 'site' };
//             $scope.roofSlope = [];
//             project.info.id = $stateParams.id; //getting project id from url
//             project.info.roof_type = window.project_type;
//             var _init = function() {
//                 for (var i = 0; i < 46; i++) {
//                     $scope.roofSlope.push(i);
//                 }

//               if($localStorage.ironridge && $localStorage.ironridge[project.info.id] && $localStorage.ironridge[project.info.id].firstTime){
//                 angular.element('#zipcode').focus();
//               }
//             };

//             var _cleanLocalStorge = function() {

//                 if (Object.keys($localStorage.ironridge).length > 1000) {
//                     var i = 0;
//                     for (var key in $localStorage.ironridge) {
//                         if (i < 100) {
//                             delete $localStorage.ironridge[key];
//                             i++;
//                         } else {
//                             break;
//                         }
//                     }
//                 }
//             };

//             var _initProjectLocalStorage = function(id, type) {
//                 if (!$localStorage.ironridge) {
//                     $localStorage.ironridge = {};
//                 }
//                 if (!$localStorage.ironridge[id]) {
//                     $localStorage.ironridge[id] = { type: type };
//                 }
//                 $scope.initialized = true;
//             };

//             $scope.$watch('project.info.modules.dimensions_mm',function(dimensions){
//               var totalDimension = '',
//               dimension,
//               dimensionString,
//               dimensionsArray;
//               if(dimensions){
//                 dimensionsArray = dimensions.split('x');

//                 for(var count = 0; count < dimensionsArray.length; count++){
//                   dimension = Math.round(parseFloat(dimensionsArray[count].replace(/,/g, '')));

//                   while ((dimensionString = dimension.toString().replace(/(\d)([\d]{3})(\.|\s|\b)/,'$1,$2$3')) && dimensionString != dimension) dimension = dimensionString;

//                   totalDimension += dimension + (count !== dimensionsArray.length -1 ? ' x ' : 'mm');
//                 }
//               }

//               $scope.dimensions_mm = totalDimension;
//             });

//             $scope.updateModel = function(selectedModel) {
//                 if(config.JOYRIDE){
//                     try{
//                       hopscotch.endTour();
//                     }
//                     catch(e){
//                       console.log('');
//                     }
//                     finally{
//                       if (!$localStorage.ironridge.joyRide || !$localStorage.ironridge.joyRide[0]) {
//                         if (!$localStorage.ironridge.joyRide) $localStorage.ironridge.joyRide = {};
//                         $localStorage.ironridge.joyRide[0] = true;
//                         hopscotch.startTour(tour, 0);
//                       }
//                     }
//                 }
//                 project.info.modules.model.id = selectedModel.id;
//                 project.info.modules.model.name = selectedModel.name;
//                 project.updatePanel();
//                 $rootScope.showPickModel = false;
//                 $rootScope.showselcted = true;

//             };

//             $scope.onBuildingSelect = function() {
//                 project.postData('building').then(function(result) {
//                     project.info.summary = result.data.summary;
//                     project.info.building = result.data.building;
//                     project.info.wind_and_snow = result.data.wind_and_snow;
//                     project.info.bill_of_material = result.data.bill_of_material;

//                     project.info.rails = result.data.rails;
//                     project.info.structural_loads = result.data.structural_loads;
//                 });
//             };

//             $scope.onWindSnowSelect = function() {
//                 project.postData('wind_and_snow').then(function(result) {
//                     $rootScope.isLoading = false;
//                     project.info.wind_and_snow = result.data.wind_and_snow;
//                     project.info.location = result.data.location;
//                     project.info.summary = result.data.summary;
//                     project.info.building = result.data.building;
//                     project.info.bill_of_material = result.data.bill_of_material;

//                     project.info.structural_loads = result.data.structural_loads;
//                     project.info.rails = result.data.rails;
//                 });
//             };

//             $scope.checkLocation = function() {
//                 $scope.locationError = project.info.location.site_name ? '' : 'inputError';
//             };

//             $scope.checkLocationUpdate = function() {
//                 if (project.info.location.site_name && project.info.location.zip_code && _projectName !== project.info.location.site_name) {
//                     project.updateLocation();
//                     _projectName = project.info.location.site_name;
//                 }
//             };

//             $scope.checkZip = function() {
//                 if (_callFlag) return;
//                 $scope.location = '';
//                 $scope.zipCodeError = '';
//                 $scope.zipCodeMessageError = '';
//                 var zipcode = project.info.location.zip_code;
//                 if (zipcode && (/\D/g.test(zipcode))) {
//                     // zipcode = zipcode.replace(/\D/g, '');
//                     $rootScope.$emit('project.failed.zip');
//                     _callFlag = false;
//                     $scope.zipCodeError = 'inputError';
//                     $scope.zipCodeMessageError = 'error';
//                     $scope.location = 'Bad Zipcode';
//                     return;
//                 }
//                 if (!zipcode || zipcode.length < 5) {
//                     if (project.info.location.city_state !== '') {
//                         $scope.location = '';
//                         project.info.location.city_state = null;
//                         project.set('info.location.city_state', $scope.location);
//                         project.set('info.summary.location', $scope.location);
//                         project.set('info.wind_and_snow.available_snows', []);
//                         project.set('info.wind_and_snow.available_winds', []);
//                         project.set('info.wind_and_snow.ground_snow_load', null);
//                         project.set('info.wind_and_snow.wind_speed', null);
//                         project.set('info.wind_and_snow.asce_code', '');
//                         project.set('info.building.risk_category', 'I');
//                     }
//                     return;
//                 }
//                 _callFlag = true;
//                 project.set('info.location.zip_code', zipcode);

//                 $scope.location = 'Loading';

//                 api.getSiteInfo(zipcode).then(function(result) {
//                     result = result.data;
//                     $scope.location = result.city_state;
//                     project.info.location.city_state = result.city_state;
//                     project.set('info.location.city_state', $scope.location);
//                     project.set('info.summary.location', $scope.location);
//                     project.set('info.wind_and_snow.available_snows', result.available_snows);
//                     project.set('info.wind_and_snow.available_winds', result.available_winds);
//                     project.set('info.wind_and_snow.ground_snow_load', result.ground_snow_load);
//                     project.set('info.wind_and_snow.wind_speed', result.wind_speed);
//                     project.set('info.wind_and_snow.asce_code', result.asce_code);

//                     if (!project.info.id) { //if project not already created
//                         // post project data
//                         project.create().then(function(result) {
//                             _callFlag = false;
//                             _initProjectLocalStorage(result.data.id, result.data.roof_type);
//                             $localStorage.ironridge[result.data.id].firstTime = true;
//                             $localStorage.ironridge[result.data.id].groups = {};
//                             _cleanLocalStorge();
//                             $state.go('siteId', {
//                                 'id': result.data.id
//                             });
//                         });
//                     } else {
//                         console.log('should update project !!!');
//                         project.updateLocation().then(function() {
//                             _callFlag = false;
//                             console.log('updated location');
//                         });
//                     }
//                 }, function() {
//                     $rootScope.$emit('project.failed.zip');
//                     _callFlag = false;
//                     $scope.zipCodeError = 'inputError';
//                     $scope.zipCodeMessageError = 'error';
//                     $scope.location = 'Bad Zipcode';
//                 });
//             };

//             $scope.go = function() {
//                 var cancelRequest = false;

//                 if (!_zipRegex.test(project.info.location.zip_code)) {

//                     cancelRequest = true;
//                     $scope.zipCodeError = 'inputError';
//                     $scope.zipCodeMessageError = 'error';
//                 }

//                 if (!project.info.location.site_name) {
//                     $scope.locationError = 'inputError';
//                     cancelRequest = true;
//                 }

//                 if (cancelRequest) {
//                     alerts.show('verify-project-name-zipcode');
//                 } else if (!project.info.modules.model || !project.info.modules.model.id) {
//                     alerts.show('manuf-model-not-set');
//                 } else if(!$rootScope.user && project.info.modules.model.id && !project.ownership && $localStorage.ironridge[project.info.id] && !$localStorage.ironridge[project.info.id].isaccepted){
//                   angular.element('#modalTerm').modal('show');
//                   angular.element('#modalTerm').css({'display': 'flex',  'align-items': 'center'});
//                 } else if (project.info.id) {
//                     _initProjectLocalStorage(project.info.id, project.info.roof_type);
//                     var firstTime = $localStorage.ironridge[project.info.id].firstTime;

//                     if (firstTime) $localStorage.ironridge[project.info.id].firstTime = false;
//                     gaSend.sendToGa('event', 'Design Tab', 'visit', (window.project_type === 'flat' ? 'Flat Roof' : 'Pitched Roof'));
//                     //go to next page and garde corrent project id
//                     $scope.$emit('Go_To_Design_Id');
//                     $state.go('designId', {
//                         'id': project.info.id
//                     });
//                 } else {
//                     gaSend.sendToGa('event', 'Design Tab', 'visit', (window.project_type === 'flat' ? 'Flat Roof' : 'Pitched Roof'));
//                     $scope.$emit('Go_To_Design');
//                     project.create().then(function(result) {
//                         $state.go('designId', {
//                             'id': result.data.id
//                         });
//                     });
//                 }
//             };

//             $scope.OnSelectColor = function(){
//               project.postData('modules').then(function(result) {
//                 project.info.summary = result.data.summary;
//                 project.info.bill_of_material = result.data.bill_of_material;
//                 project.info.documents = result.data.documents;
//                 project.info.structural_loads=result.data.structural_loads;
//                 project.info.modules=result.data.modules;
//               });
//             };

//             _init();

//             $rootScope.$on('project.redraw.arrays', function () {
//               $timeout(function() {
//                   if (!project.info.location.site_name) {
//                       angular.element('#project_name').focus();
//                   } else if (!project.info.location.zip_code){
//                       angular.element('#zipcode').focus();
//                   }
//               }, 100);
//             });

//             // $window.onkeydown = function (e) {
//             //   var jqTarget = angular.element(e.target);
//             //   if (e.keyCode === 9) {
//             //     var jqVisibleInputs = angular.element(':input:visible');
//             //     var jqFirst = angular.element('#project_name');
//             //     var jqLast = jqVisibleInputs.last();
//             //     if (!e.shiftKey && jqTarget.is(jqLast)) {
//             //       e.preventDefault();
//             //       jqFirst.focus();
//             //     } else if (e.shiftKey && jqTarget.is(jqFirst)) {
//             //       e.preventDefault();
//             //       jqLast.focus();
//             //     }
//             //   }
//             // };
//             $document.bind('keydown', function(event) {
//               var attrs = event.currentTarget.activeElement.attributes;

//               if (attrs['tab-stop']) {
//                 angular.element('#project_name').focus();
//                 event.preventDefault();
//               }
//             });

//             /********* this function used by unit test *******/
//                 $scope.getContext = function(name){
//                     try{
//                         return eval(name);
//                     }catch(e){
//                         return e;
//                     }
//                 };
//                 $scope.setContext = function(name, value){
//                     try{
//                         return eval(name + ' = ' + value);
//                     }catch(e){
//                         return e;
//                     }
//                 };
//             /************************************************/

//         })
//         .directive('uiSelectOpenOnFocus', [function() {
//             return {
//                 require: 'uiSelect',
//                 restrict: 'A',
//                 link: function($scope, el, attrs, uiSelect) {
//                     var closing = false;

//                     angular.element(uiSelect.focusser).on('focus', function() {
//                         if (!closing) {
//                             uiSelect.activate();
//                         }
//                     });
//                     // we need to not re-activate after closing
//                     $scope.$on('uis:close', function() {
//                         closing = true;
//                         uiSelect.close();
//                     });
//                 }
//             };
//         }]);
// })();
