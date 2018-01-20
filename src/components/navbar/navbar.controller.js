(function() {
    'use strict';

    angular.module('ironridge')
        .controller('NavbarCtrl', function($interval, $scope, $rootScope, $stateParams, $state, project, projectFx, projectMount, api, $localStorage, alerts, config, $window, $document, errorHandler, gaSend) {
            var localProject = project;
            var sefix = '', googleFix = '';
            var locationName = 'location';
            var revManifest = null;
            switch (window.project_type) {
                case 'flat':
                    localProject = project;
                    sefix = '';
                    googleFix = 'Flat Roof';
                    break;
                case 'pitched':
                    localProject = project;
                    sefix = '';
                    googleFix = 'Pitched Roof';
                    break;
                case 'fx':
                    localProject = projectFx;
                    googleFix = 'Fx';
                    sefix = 'Fx';
                    break;
                case 'mount':
                    localProject = projectMount;
                    locationName = 'location_wind_and_snow';
                    sefix = 'Mount';
                    googleFix = 'Ground Based';
                break;
            }
            $scope.sefix = sefix;
            $rootScope.type = $window.project_type;
            $rootScope.saveOpcity = false;
            $scope.project = localProject;
            $scope.newVersion = false;
            var _localStorge = function() {
                if (!$localStorage.ironridge) {
                    $localStorage.ironridge = {};
                }
                if (!$localStorage.ironridge[localProject.info.id]) {
                    $localStorage.ironridge[localProject.info.id] = {
                        type: localProject.info.roof_type
                    };
                }
                $localStorage.ironridge[localProject.info.id].isaccepted = true;
            };

            var _updateInfoSummary = function(obj) {
                if (localProject.info.ownership && localProject.info.ownership.shared) $scope.share = localProject.info.ownership.shared;
                if (obj && obj.cost && obj.cost !== '-') {
                    var costVal = -Number(obj.cost.substring(1).replace(/,/g, ''),10);
                    var wattsVal = -parseFloat(obj.watts.replace(/,/g, ''));
                    var cost_per_wattsVal = parseFloat(obj.cost_per_watts.substring(1));
                    var length_watt = 0;
                    var realLengtPerWatt = obj.cost_per_watts.split('.')[1];
                    $rootScope.navBarValueObject.prefixCost_per_watts = cost_per_wattsVal < 1 ? ((cost_per_wattsVal < 0.1 && cost_per_wattsVal >= 0.01) ? '$0.0' : ((cost_per_wattsVal > 0 && cost_per_wattsVal < 0.01) ? '$0.00' : '$0.')) : '$';
                    if (sefix == 'Mount') {
                      $rootScope.navBarValueObject.pipe = obj.pipe;
                    }
                    var copy_watt = cost_per_wattsVal.toString().split('.');
                    if (copy_watt[1]) length_watt = copy_watt[1].length;
                    cost_per_wattsVal = cost_per_wattsVal < 1 ? -cost_per_wattsVal * (Math.pow(10, length_watt)) : -cost_per_wattsVal;
                    if (realLengtPerWatt && realLengtPerWatt.length && Math.abs(cost_per_wattsVal).toString().length < realLengtPerWatt.length) cost_per_wattsVal = cost_per_wattsVal * 10;
                    if($rootScope.navBarValueObject.cost !== costVal) $rootScope.navBarValueObject.cost = costVal;
                    if($rootScope.navBarValueObject.cost_per_watts  !== cost_per_wattsVal) $rootScope.navBarValueObject.cost_per_watts  = cost_per_wattsVal;
                    if($rootScope.navBarValueObject.watts !== wattsVal )  $rootScope.navBarValueObject.watts  = wattsVal;
                    if($rootScope.navBarValueObject.nb_modules  !== -obj.nb_modules) $rootScope.navBarValueObject.nb_modules  = -obj.nb_modules;
                    if (sefix == 'Fx') {
                        $rootScope.navBarValueObject.nb_bridges = -obj.nb_bridges;
                        $rootScope.navBarValueObject.nb_modules = -obj.nb_modules;
                        $rootScope.navBarValueObject.nb_mounts = -obj.nb_mounts;
                    } else if (sefix == 'Mount') {
                        var pipeTotal = obj.pipe.split('\'');
                        var pipeFeetValue = Number(pipeTotal[0], 10);
                        var pipeIncheValue = pipeTotal[1] ? Number(pipeTotal[1].split('\"')[0], 10) : 0;
                        $rootScope.navBarValueObject.pipeFeet = -pipeFeetValue;
                        $rootScope.navBarValueObject.pipeInche = -pipeIncheValue;
                        if ($rootScope.navBarValueObject.piers !== -obj.piers) $rootScope.navBarValueObject.piers = -obj.piers;
                    } {
                        $rootScope.navBarValueObject.nb_splices = -obj.nb_splices;
                        $rootScope.navBarValueObject.nb_attachements = -obj.nb_attachements;
                    }
                } else {
                    $rootScope.navBarValueObject.prefixCost_per_watts = '$0.';
                    $rootScope.navBarValueObject.cost = 0;
                    $rootScope.navBarValueObject.cost_per_watts = 0;
                    $rootScope.navBarValueObject.nb_attachements = 0;
                    $rootScope.navBarValueObject.nb_bridges = 0;
                    $rootScope.navBarValueObject.nb_modules = 0;
                    $rootScope.navBarValueObject.nb_mounts = 0;
                    $rootScope.navBarValueObject.nb_splices = 0;
                    $rootScope.navBarValueObject.watts = 0;
                    $rootScope.navBarValueObjectMount.pipe = 0;
                    $rootScope.navBarValueObjectMount.piers = 0;
                }
            };

            $scope.acceptTermeToDesign = function() {
                if (localProject.info.id) {
                    _localStorge();
                    $scope.$emit('Go_To_Design');
                    $scope.activeMenu = 'design';
                    angular.element('#modalTerm').modal('hide');

                    if ($stateParams.id) {
                        $scope.$emit('WithID');
                        $state.go('designId', {
                            id: $stateParams.id
                        });
                        gaSend.sendToGa('event', 'Design Tab', 'visit', googleFix);

                    } else {
                        $scope.$emit('WithoutID');
                        $state.go('design');
                        gaSend.sendToGa('event', 'Design Tab', 'visit', googleFix);

                    }
                }
            };

            $scope.acceptTermeToQuote = function() {
                if (localProject.info.id) {
                    _localStorge();

                    if ($stateParams.id) {
                        $scope.$emit('WithID');
                        $state.go('quoteId', {
                            id: $stateParams.id
                        });
                        gaSend.sendToGa('event', 'Quote Tab', 'visit', googleFix);

                    } else {
                        $scope.$emit('WithoutID');
                        $state.go('quote');
                        gaSend.sendToGa('event', 'Quote Tab', 'visit', googleFix);
                    }

                    angular.element('#modalTerm2').modal('hide');
                    $scope.activeMenu = 'quote';
                }
            };

            $scope.navigate = function(to) {
                if (to === 'design') {
                    if (!localProject.info[locationName].city_state || !localProject.info[locationName].site_name) {
                        alerts.show('project-not-created');
                        return;
                    } else if (!(sefix !== 'Mount'  ? $rootScope.project : $rootScope.projectMount).modules || !localProject.info.modules.model || !localProject.info.modules.model.id) {
                        alerts.show('manuf-model-not-set');
                        return;
                    } else if (!$rootScope.user && localProject.info.modules.model.id && $scope.activeMenu === 'site' && !localProject.ownership && $localStorage.ironridge[localProject.info.id] && !localProject.ownership && !$localStorage.ironridge[localProject.info.id].isaccepted) {
                        angular.element('#modalTerm').modal('show');
                        angular.element('#modalTerm').css({
                            'display': 'flex',
                            'align-items': 'center'
                        });
                        return;
                    } else if (localProject.info.id) {
                        if (!$localStorage.ironridge) {
                            $localStorage.ironridge = {};
                        }

                        if (!$localStorage.ironridge[localProject.info.id]) {
                            $localStorage.ironridge[localProject.info.id] = {};
                        }

                        $localStorage.ironridge[localProject.info.id].firstTime = false;
                        $localStorage.ironridge[localProject.info.id].type = window.project_type;
                        //go to next page and keep current project id
                        console.log('hello local storage');
                        $scope.$emit('Go_To_Design');
                    } else {
                        $scope.$emit('Go_To_Design');
                        // post project data
                        localProject.create().then(function(result) {
                            $state.go('designId', {
                                'id': result.data.id
                            });
                        });
                    }

                    $scope.activeMenu = 'design';
                    gaSend.sendToGa('event', 'Design Tab', 'visit', googleFix);
                    // check if there is a project id
                } else if (to === 'quote') {
                    if (localProject.info[(sefix !== 'Mount'  ? 'arrays' : 'arrays_details')].count === 0 && $scope.activeMenu === 'design') {
                        $('html, body').animate({
                            scrollTop: 0
                        }, 'fast');
                        angular.element('#NotifeEmpty').css({
                            'display': 'inline-block'
                        });
                        return false;
                    }
                    if (!localProject.info[locationName].city_state || !localProject.info[locationName].site_name) {
                        alerts.show('project-not-created');
                        return;
                    } else if (!$rootScope.user && localProject.info.modules.model.id && $scope.activeMenu === 'site' && !localProject.ownership && $localStorage.ironridge[localProject.info.id] && !localProject.ownership && !$localStorage.ironridge[localProject.info.id].isaccepted) {
                        angular.element('#modalTerm2').modal('show');
                        angular.element('#modalTerm2').css({
                            'display': 'flex',
                            'align-items': 'center'
                        });
                        return;
                    }
                    // else if ($scope.activeMenu === 'site' && $localStorage.ironridge[localProject.info.id] && $localStorage.ironridge[localProject.info.id].firstTime === true){
                    //   alerts.show('quote-first-time');
                    //   return;
                    // }
                    else if (!localProject.info.modules.model || !localProject.info.modules.model.id) {
                        alerts.show('manuf-model-not-set');
                        return;
                    }
                    $scope.activeMenu = 'quote';
                    gaSend.sendToGa('event', 'Quote Tab', 'visit', googleFix);
                } else {
                    $scope.activeMenu = to;
                }

                if ($stateParams.id) {
                    $scope.$emit('WithID');
                    $state.go(to + 'Id', {
                        id: $stateParams.id
                    });
                } else {
                    $scope.$emit('WithoutID');
                    $state.go(to);
                }
            };

            // ckeck current version of DA
           $interval(function(){
                api.loadRev().then(function(data){
                    var res =  JSON.stringify(data);
                    if(revManifest && revManifest != res) {
                       $scope.newVersion = true;
                    }else{
                       revManifest = res;
                    }
                });
            }, 3000);

           $scope.reload = function(){
              location.reload();
           };

            $scope.saveAndClose = function() {
                if (!localProject.info[locationName].city_state || !localProject.info[locationName].site_name || !$rootScope.project.modules || !localProject.info.modules.model || !localProject.info.modules.model.id) {
                    window.location.href = config.HOST_URL + '/projects';
                } else {
                    localProject.save().then(function() {
                        window.location.href = config.HOST_URL + '/projects';
                    });
                }
            };

            $rootScope.initiNavBar = function() {
                //var projectId = $stateParams.id; //getting project id from url
                //$scope.firstTime = true;
                $rootScope.saveOpcity = true;
                $scope.activeMenu = $state.tab;
                $scope.project_type = window.project_type;
                //var projectInfo = $scope.projectInfo = localProject.info;
                if (sefix == 'Mount'){
                  $rootScope.projectMount= angular.fromJson(localProject.init());
                } else $rootScope.project = angular.fromJson(localProject.init());
                localProject.info.id = $stateParams.id;
                if (!localProject.isLoaded && localProject.info.id) {
                    localProject.load().then(function() {
                        if (localProject.info.modules.manufacturer && localProject.info.modules.manufacturer.id) {
                            api.getModel(localProject.info.modules.manufacturer.id, 1).then(function(result) {
                                $rootScope.models = result.data;
                                //localProject.info.rails = result.data.rails;
                                //localProject.updatePanel();
                            });
                        }
                    });
                } else if (($state.tab === 'site') && !localProject.isLoaded && localProject.info.id) {
                    localProject.load();
                } else {
                    $rootScope.$emit('project' + sefix + '.redraw.arrays');
                }
            };
            $scope.$watch('project.info.summary', function(obj) {
                _updateInfoSummary(obj);
            });

            $rootScope.$on('project' + sefix + '.redraw.arrays', function() {
                $scope.site_name = localProject.info[locationName].site_name;
                $scope.city_state = localProject.info[locationName].city_state;
                _updateInfoSummary($scope.project.info.summary);
            });

            $rootScope.$on('project' + sefix + '.failed.zip', function() {
                $scope.city_state = '-';
            });

            $document.click(function() {
                errorHandler.close();
            });

        }).directive('animateOnChange', function($timeout) {
            return function(scope, element, attr) {
                scope.$watch(attr.animateOnChange, function(nv, ov) {
                    if (nv !== ov) {
                        element.addClass('changed');
                        $timeout(function() {
                            element.removeClass('changed');
                        }, 1200);
                    }
                });
            };
        });

    $(document).on('scroll', function() {
        var scrollTopp = angular.element('.topnav').height() + angular.element('#ir_header').height() + 33;

        if ($(window).scrollTop() >= scrollTopp) {
            angular.element('.fix-me').addClass('stick-to-top');
        } else if ($(window).scrollTop() < scrollTopp) {
            angular.element('.fix-me').removeClass('stick-to-top');
        }
    });
})();









