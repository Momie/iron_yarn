(function() {
    'use strict';
    angular.module('ironridge')
        .controller('SiteCtrlMount', function($scope, $state, $stateParams, $rootScope, $http, $timeout, $window, $localStorage, api, alerts, projectMount, errorHandler, $document, gaSend, config) {
          var _projectName = projectMount.info.location_wind_and_snow.site_name;
          var _zipRegex = /^([0-9]{5})(?:[-\s]*([0-9]{4}))?$/;
          var _callFlag = false;

          $state.tab = 'site';
          gaSend.sendToGa('event', 'Site Tab', 'visit', 'Ground Based');


          $scope.projectMount = projectMount;
          $scope.nav = { 'radio': 'site' };
          projectMount.info.id = $stateParams.id;

          var _init = function() {
            if($localStorage.ironridge && $localStorage.ironridge[projectMount.info.id] && $localStorage.ironridge[projectMount.info.id].firstTime){
              angular.element('#zipcode').focus();
              console.log('set focus');
            }
          };

          var _cleanLocalStorge = function() {
              if (Object.keys($localStorage.ironridge).length > 1000) {
                  var i = 0;
                  for (var key in $localStorage.ironridge) {
                      if (i < 100) {
                          delete $localStorage.ironridge[key];
                          i++;
                      } else {
                          break;
                      }
                  }
              }
          };

          var _initProjectLocalStorage = function(id, type) {
                          if (!$localStorage.ironridge) {
                              $localStorage.ironridge = {};
                          }
                          if (!$localStorage.ironridge[id]) {
                              $localStorage.ironridge[id] = { type: type };
                          }
                          $scope.initialized = true;
            };

            $scope.$watch('projectMount.info.modules.dimensions_mm',function(dimensions){
              var totalDimension = '',
              dimension,
              dimensionString,
              dimensionsArray;
              if(dimensions){
                dimensionsArray = dimensions.split('x');

                for(var count = 0; count < dimensionsArray.length; count++){
                  dimension = Math.round(parseFloat(dimensionsArray[count].replace(/,/g, '')));

                  while ((dimensionString = dimension.toString().replace(/(\d)([\d]{3})(\.|\s|\b)/, '$1,$2$3')) && dimensionString != dimension) dimension = dimensionString;

                  totalDimension += dimension + (count !== dimensionsArray.length -1 ? ' x ' : 'mm');
                }
              }

              $scope.dimensions_mm = totalDimension;
            });

            $scope.updateModel = function(selectedModel) {
              if(config.JOYRIDE){
                try{
                  hopscotch.endTour();
                }
                catch(e){
                  console.log('');
                }
                finally{
                  if (!$localStorage.ironridge.joyRide || !$localStorage.ironridge.joyRide[0]) {
                    if (!$localStorage.ironridge.joyRide) $localStorage.ironridge.joyRide = {};
                    $localStorage.ironridge.joyRide[0] = true;
                    hopscotch.startTour(tour, 0);
                  }
                }
              }
                projectMount.info.modules.model.id = selectedModel.id;
                projectMount.info.modules.model.name = selectedModel.name;
                projectMount.updateMount();
                $rootScope.showPickModel = false;
                $rootScope.showselcted = true;
            };

            $scope.onWindSnowSelectMount = function() {
                projectMount.postData('location_wind_and_snow').then(function(result) {
                  $rootScope.isLoading = false;
                  projectMount.info.location_wind_and_snow = result.data.location_wind_and_snow;
                  projectMount.info.summary = result.data.summary;
                  projectMount.info.bill_of_material = result.data.bill_of_material;

                  projectMount.info.reaction_forces = result.data.reaction_forces;
                  projectMount.info.substructure = result.data.substructure;
                },function(data){
                  if(data.data.error) errorHandler.handle(data.data.error);
                });
            };

            $scope.checkLocation = function() {
                $scope.locationError = projectMount.info.location_wind_and_snow.site_name ? '' : 'inputError';
            };

            $scope.checkLocationUpdate = function() {
                if (projectMount.info.location_wind_and_snow.site_name && projectMount.info.location_wind_and_snow.zip_code && _projectName !== projectMount.info.location_wind_and_snow.site_name) {
                    projectMount.updateLocation();
                    _projectName = projectMount.info.location_wind_and_snow.site_name;
                }
            };

            $scope.checkZip = function() {
                if (_callFlag) return;
                $scope.location = '';
                $scope.zipCodeError = '';
                $scope.zipCodeMessageError = '';
                var zipcode = projectMount.info.location_wind_and_snow.zip_code;
                if (zipcode && (/\D/g.test(zipcode))) {
                    $rootScope.$emit('project.failed.zip.mount');
                    _callFlag = false;
                    $scope.zipCodeError = 'inputError';
                    $scope.zipCodeMessageError = 'error';
                    $scope.location = 'Bad Zipcode';
                    return;
                }
                if (!zipcode || zipcode.length < 5) {
                    if (projectMount.info.location_wind_and_snow.city_state !== '') {
                        $scope.location = '';
                        projectMount.info.location_wind_and_snow.city_state = null;
                        projectMount.set('info.location_wind_and_snow.city_state', $scope.location);
                        projectMount.set('info.summary.location', $scope.location);
                        projectMount.set('info.location_wind_and_snow.available_snows', []);
                        projectMount.set('info.location_wind_and_snow.available_winds', []);
                        projectMount.set('info.location_wind_and_snow.ground_snow_load', null);
                        projectMount.set('info.location_wind_and_snow.wind_speed', null);
                        projectMount.set('info.location_wind_and_snow.wind_exposure', null);
                        projectMount.set('info.location_wind_and_snow.asce_code', '');
                    }
                    return;
                }
                if(zipcode == 55555){
                  alerts.show('gound-zip-5555');
                  return;
                }
                _callFlag = true;
                projectMount.set('info.location_wind_and_snow.zip_code', zipcode);

               //$rootScope.isLoading = true;

                api.getSiteInfo(zipcode).then(function(result) {
                    result = result.data;
                    $scope.location = result.city_state;
                    projectMount.info.location_wind_and_snow.city_state = result.city_state;
                    projectMount.set('info.location_wind_and_snow.city_state', $scope.location);
                    projectMount.set('info.summary.location', $scope.location);
                    projectMount.set('info.location_wind_and_snow.available_snows', result.available_snows);
                    projectMount.set('info.location_wind_and_snow.available_winds', result.available_winds);
                    projectMount.set('info.location_wind_and_snow.ground_snow_load', result.ground_snow_load);
                    projectMount.set('info.location_wind_and_snow.wind_speed', result.wind_speed);
                    projectMount.set('info.location_wind_and_snow.asce_code', result.asce_code);

                    if (!projectMount.info.id) { //if project not already created
                        projectMount.create().then(function(result) {
                            _callFlag = false;
                            _initProjectLocalStorage(result.data.id, 'mount');
                            $localStorage.ironridge[result.data.id].firstTime = true;
                            $localStorage.ironridge[result.data.id].groups = {};
                            _cleanLocalStorge();
                            $state.go('siteId', {
                                'id': result.data.id
                            });
                        });
                    } else {
                        console.log('should update project !!!');
                        projectMount.updateLocation().then(function() {
                            _callFlag = false;
                            console.log('updated location');
                        });
                    }
                }, function() {
                    $rootScope.$emit('project.failed.zip.mount');
                    _callFlag = false;
                    $scope.zipCodeError = 'inputError';
                    $scope.zipCodeMessageError = 'error';
                    $scope.location = 'Bad Zipcode';
                });
            };

            $scope.go = function() {
                var cancelRequest = false;
              if (!_zipRegex.test(projectMount.info.location_wind_and_snow.zip_code)) {
                    cancelRequest = true;
                    $scope.zipCodeError = 'inputError';
                    $scope.zipCodeMessageError = 'error';
              }
              if (!projectMount.info.location_wind_and_snow.site_name) {
                    $scope.locationError = 'inputError';
                    cancelRequest = true;
              }

              if (cancelRequest) {
                    alerts.show('verify-project-name-zipcode');

              } else if (!projectMount.info.modules.model || !projectMount.info.modules.model.id) {
                    alerts.show('manuf-model-not-set');

              } else if (!$rootScope.user && projectMount.info.modules.model.id && !projectMount.ownership && $localStorage.ironridge[projectMount.info.id] && !$localStorage.ironridge[projectMount.info.id].isaccepted){
                  angular.element('#modalTerm').modal('show');
                  angular.element('#modalTerm').css({'display': 'flex',  'align-items': 'center','justify-content': 'center'});

              } else if (projectMount.info.id) {
                    _initProjectLocalStorage(projectMount.info.id, 'mount');
                    var firstTime = $localStorage.ironridge[projectMount.info.id].firstTime;
                    if (firstTime)
                        $localStorage.ironridge[projectMount.info.id].firstTime = false;
                    //go to next page and garde corrent project id
                    gaSend.sendToGa('event', 'Design Tab', 'visit', 'Ground Based');
                    $scope.$emit('Go_To_Design_Id');
                    $state.go('designId', {
                        'id': projectMount.info.id
                    });
                    $rootScope.$emit('projectMount.Go_To_Design.tab');

              } else {
                    gaSend.sendToGa('event', 'Design Tab', 'visit', 'Ground Based');
                    $scope.$emit('Go_To_Design');
                    // post project data
                    projectMount.create().then(function(result) {
                        $state.go('designId', {
                            'id': result.data.id
                        });
                    });
                }

            };
            $scope.OnSelectColorMount = function(){
              projectMount.postData('modules').then(function(result) {
                projectMount.info.summary = result.data.summary;
                projectMount.info.bill_of_material = result.data.bill_of_material;

                projectMount.info.documents = result.data.documents;
                projectMount.info.structural_loads=result.data.structural_loads;
                projectMount.info.modules=result.data.modules;
              });
            };

            _init();

            $rootScope.$on('projectMount.redraw.arrays', function () {
              $timeout(function() {
                  if (!projectMount.info.location_wind_and_snow.site_name) {
                      angular.element('#project_name_mount').focus();
                  } else if (!projectMount.info.location_wind_and_snow.zip_code){
                      angular.element('#zipcode_mount').focus();
                  }
              }, 100);
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
            // $window.onkeydown = function (e) {
            //   var jqTarget = angular.element(e.target);
            //
            //   if (e.keyCode === 9) {
            //     var jqVisibleInputs = angular.element(':input:visible');
            //     var jqFirst = angular.element('#project_name_mount');
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

              if (attrs['tab-stop-M']) {
                angular.element('#project_name_mount').focus();
                event.preventDefault();
              }
            });

          });

})();
