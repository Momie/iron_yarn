(function() {
    'use strict';
    angular.module('ironridge')
        .controller('SiteCtrlFx', function($scope, $state, $stateParams, $rootScope, $http, $timeout, $window, $localStorage, api, projectFx, alerts, $document, msgHandler, gaSend, config) {
            var _projectName = projectFx.info.location && projectFx.info.location.site_name;
            var _zipRegex = /^([0-9]{5})(?:[-\s]*([0-9]{4}))?$/;
            var _callFlag = false;

            $state.tab = 'site';
            gaSend.sendToGa('event', 'Site Tab', 'visit', 'fx');
            $scope.project = projectFx;
            //current page refelected in navigation bar
            $scope.nav = { 'radio': 'site' };
            $scope.roofSlope = [];
            $scope.project_type = 'fx';
            $scope.rafter_spacings = [];
            projectFx.info.id = $stateParams.id; //getting project id from url
            projectFx.info.roof_type = window.project_type;
            var _init = function() {
                for (var i = 10; i <= 45; i+=1) {
                    $scope.roofSlope.push(i);
                }
                for(var j = 12; j<= 40; j++){
                    $scope.rafter_spacings.push(j);
                }
                if($localStorage.ironridge && $localStorage.ironridge[projectFx.info.id] && $localStorage.ironridge[projectFx.info.id].firstTime){
                  angular.element('#zipcode').focus();
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

            $scope.$watch('project.info.modules.dimensions_mm',function(dimensions){
              var totalDimension = '',
              dimension,
              dimensionString,
              dimensionsArray;
              if(dimensions){
                dimensionsArray = dimensions.split('x');

                for(var count = 0; count < dimensionsArray.length; count++){
                  dimension = Math.round(parseFloat(dimensionsArray[count].replace(/,/g, '')));

                  while ((dimensionString = dimension.toString().replace(/(\d)([\d]{3})(\.|\s|\b)/,'$1,$2$3')) && dimensionString != dimension) dimension = dimensionString;

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
                projectFx.info.modules.model.id = selectedModel.id;
                projectFx.info.modules.model.name = selectedModel.name;
                projectFx.updatePanel();
                $rootScope.showPickModel = false;
                $rootScope.showselcted = true;

            };

            $scope.onBuildingSelect = function() {
                projectFx.postData('building');
            };

            $scope.onWindSnowSelect = function() {
                projectFx.postData('wind_and_snow');
            };

            $scope.checkLocation = function() {
                $scope.locationError = projectFx.info.location.site_name ? '' : 'inputError';
            };

            $scope.checkLocationUpdate = function() {
                if (projectFx.info.location.site_name && projectFx.info.location.zip_code && _projectName !== projectFx.info.location.site_name) {
                    projectFx.updateLocation();
                    _projectName = projectFx.info.location.site_name;
                }
            };

            $scope.checkZip = function() {
                if (_callFlag) return;
                $scope.location = '';
                $scope.zipCodeError = '';
                $scope.zipCodeMessageError = '';
                var zipcode = projectFx.info.location.zip_code;
                if (zipcode && (/\D/g.test(zipcode))) {
                    // zipcode = zipcode.replace(/\D/g, '');
                    $rootScope.$emit('projectFx.failed.zip');
                    _callFlag = false;
                    $scope.zipCodeError = 'inputError';
                    $scope.zipCodeMessageError = 'error';
                    $scope.location = 'Bad Zipcode';
                    return;
                }
                if (!zipcode || zipcode.length < 5) {
                    if (projectFx.info.location.city_state !== '') {
                        $scope.location = '';
                        projectFx.info.location.city_state = null;
                        projectFx.set('info.location.city_state', $scope.location);
                        projectFx.set('info.summary.location', $scope.location);
                        projectFx.set('info.wind_and_snow.available_snows', []);
                        projectFx.set('info.wind_and_snow.available_winds', []);
                        projectFx.set('info.wind_and_snow.ground_snow_load', null);
                        projectFx.set('info.wind_and_snow.wind_speed', null);
                        projectFx.set('info.wind_and_snow.asce_code', '');
                        projectFx.set('info.building.risk_category', 'I');
                    }
                    return;
                }
                _callFlag = true;
                projectFx.set('info.location.zip_code', zipcode);

                $scope.location = 'Loading';

                api.getSiteInfo(zipcode).then(function(result) {
                    result = result.data;
                    $scope.location = result.city_state;
                    projectFx.info.location.city_state = result.city_state;
                    projectFx.set('info.location.city_state', $scope.location);
                    projectFx.set('info.summary.location', $scope.location);
                    projectFx.set('info.wind_and_snow.available_snows', result.available_snows);
                    projectFx.set('info.wind_and_snow.available_winds', result.available_winds);
                    projectFx.set('info.wind_and_snow.ground_snow_load', result.ground_snow_load);
                    projectFx.set('info.wind_and_snow.wind_speed', result.wind_speed);
                    projectFx.set('info.wind_and_snow.asce_code', result.asce_code);

                    if (!projectFx.info.id) { //if project not already created
                        // post project data
                        projectFx.create().then(function(result) {
                            _callFlag = false;
                            _initProjectLocalStorage(result.data.id, 'fx');
                            $localStorage.ironridge[result.data.id].firstTime = true;
                            $localStorage.ironridge[result.data.id].groups = {};
                            _cleanLocalStorge();
                            $state.go('siteId', {
                                'id': result.data.id
                            });
                        });
                    } else {
                        console.log('should update project !!!');
                        projectFx.updateLocation().then(function() {
                            _callFlag = false;
                            console.log('updated location');
                        });
                    }
                }, function() {
                    $rootScope.$emit('projectFx.failed.zip');
                    _callFlag = false;
                    $scope.zipCodeError = 'inputError';
                    $scope.zipCodeMessageError = 'error';
                    $scope.location = 'Bad Zipcode';
                });
            };

            $scope.go = function() {
                var cancelRequest = false;

                if (!_zipRegex.test(projectFx.info.location.zip_code)) {

                    cancelRequest = true;
                    $scope.zipCodeError = 'inputError';
                    $scope.zipCodeMessageError = 'error';
                }

                if (!projectFx.info.location.site_name) {
                    $scope.locationError = 'inputError';
                    cancelRequest = true;
                }

                if (cancelRequest) {
                    alerts.show('verify-project-name-zipcode');
                } else if (!projectFx.info.modules.model || !projectFx.info.modules.model.id) {
                    alerts.show('manuf-model-not-set');
                } else if(!$rootScope.user && projectFx.info.modules.model.id && !projectFx.ownership && $localStorage.ironridge[projectFx.info.id] && !$localStorage.ironridge[projectFx.info.id].isaccepted){
                  angular.element('#modalTerm').modal('show');
                  angular.element('#modalTerm').css({'display': 'flex',  'align-items': 'center'});
                } else if (projectFx.info.id) {
                    _initProjectLocalStorage(projectFx.info.id, 'fx');
                    var firstTime = $localStorage.ironridge[projectFx.info.id].firstTime;

                    if (firstTime) $localStorage.ironridge[projectFx.info.id].firstTime = false;
                    gaSend.sendToGa('event', 'Design Tab', 'visit', 'Fx');
                    //go to next page and garde corrent project id
                    $scope.$emit('Go_To_Design_Id');
                    $state.go('designId', {
                        'id': projectFx.info.id
                    });
                } else {
                    gaSend.sendToGa('event', 'Design Tab', 'visit', 'Fx');
                    $scope.$emit('Go_To_Design');
                    projectFx.create().then(function(result) {
                        $state.go('designId', {
                            'id': result.data.id
                        });
                    });
                }
            };

            _init();

            $rootScope.$on('projectFx.redraw.arrays', function () {
              $timeout(function() {
                  if (!projectFx.info.location.site_name) {
                      angular.element('#project_name').focus();
                  } else if (!projectFx.info.location.zip_code){
                      angular.element('#zipcode').focus();
                  }
              }, 100);
            });

            $document.bind('keydown', function(event) {
              var attrs = event.currentTarget.activeElement.attributes;

              if (attrs['tab-stop']) {
                angular.element('#project_name').focus();
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

        })
        .directive('uiSelectOpenOnFocus', [function() {
            return {
                require: 'uiSelect',
                restrict: 'A',
                link: function($scope, el, attrs, uiSelect) {
                    var closing = false;

                    angular.element(uiSelect.focusser).on('focus', function() {
                        if (!closing) {
                            uiSelect.activate();
                        }
                    });
                    // we need to not re-activate after closing
                    $scope.$on('uis:close', function() {
                        closing = true;
                        uiSelect.close();
                    });
                }
            };
        }]);
})();
