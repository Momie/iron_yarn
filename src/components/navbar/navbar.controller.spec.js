(function() {
    'use strict';

    describe('controllers: NavBarCtrl', function() {
      var httpBackend, scope, $http, timeout, stateParams, api;
      var site_name = 'MyProject Test';
      var city_state = 'Young America, MN';
      var zipcode = '55555';
      var model_id = 23552;
      var manufacturer_id = 179;
      beforeEach(module('ironridge'));


      beforeEach(inject(function($httpBackend, _$http_, $rootScope, $controller, $timeout, $stateParams, _api_, $window) {
        timeout = $timeout;
        $window.ga = function() {};
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        $http = _$http_;
        stateParams = $stateParams;
        api = _api_;

      }));

      it('should init the project when ID is undefined', inject(function($controller, project) {
        stateParams.id = undefined;
        $controller('NavbarCtrl', {
          $scope: scope
        });
        expect(project.info.summary.project_name).toMatch('');
      }));

      xit('should go to design state with Id if project is created', inject(function($controller, project) {
        spyOn(scope, '$emit');
        stateParams.id = 1500;
        $controller('NavbarCtrl', {
          $scope: scope,
          $stateParams: stateParams,
          project: project
        });
        project.info.location = {
          site_name: site_name,
          city_state: city_state
        };
        project.info.modules = {
          manufacturer: {
            id: manufacturer_id
          },
          model: {
            id: model_id
          }
        };
        scope.navigate('design');
        expect(scope.$emit).toHaveBeenCalledWith('WithID');
      }));


      it('should not go to design state and should show alert if project is not created', inject(function($controller, $rootScope, alerts) {
        spyOn(scope, '$emit');

        $controller('NavbarCtrl', {
          $scope: scope,
          alerts: alerts
        });
        spyOn(alerts, 'show');
        scope.navigate('design');

        expect(alerts.show).toHaveBeenCalledWith('project-not-created');
        expect(scope.$emit).not.toHaveBeenCalledWith('WithID');
      }));

      it('should go to quote state if project is created', inject(function($controller, project, alerts, $window) {
        spyOn(scope, '$emit');
        stateParams.id = 88552;
        $controller('NavbarCtrl', {
          $scope: scope,
          $stateParams: stateParams,
          project: project
        });
        spyOn(alerts, 'show');
        project.info.location = {
          site_name: site_name,
          city_state: city_state
        };
        project.info.modules = {
          manufacturer: {
            id: manufacturer_id
          },
          model: {
            id: model_id
          }
        };
        scope.navigate('quote');
        expect(scope.$emit).toHaveBeenCalledWith('WithID');
        expect(alerts.show).not.toHaveBeenCalled();
      }));

      it('should not go to quote state and should show alert if project is not created', inject(function($controller, project, alerts) {
        spyOn(scope, '$emit');
        stateParams.id = 12;
        $controller('NavbarCtrl', {
          $scope: scope,
          alerts: alerts,
          project: project
        });
        spyOn(alerts, 'show');
        scope.navigate('quote');
        expect(scope.$emit).not.toHaveBeenCalledWith('WithID');
        expect(alerts.show).toHaveBeenCalledWith('project-not-created');
      }));
      it('should  go to quote state if firstTime, project created and should not show alert', inject(function ($controller, project, alerts, $localStorage) {
      spyOn(scope, '$emit');
      stateParams.id = 12;
      $controller('NavbarCtrl', {
        $scope: scope,
        alerts: alerts,
        project: project,
        $localStorage: {
          ironridge: {
            '12': {
              firstTime: true
            }
          }
        }
      });
      project.info.location = {
        site_name: site_name,
        city_state: city_state
      };
      scope.activeMenu = 'site';
      project.info.id = '12';
      spyOn(alerts, 'show');
      scope.navigate('quote');
      expect(alerts.show).not.toHaveBeenCalledWith('quote-first-time');
    }));
    it('should  go to quote state if not firstTime and  activeMenu is not a site', inject(function ($controller, project, alerts, $localStorage) {
    spyOn(scope, '$emit');
    stateParams.id = 12;
    $controller('NavbarCtrl', {
      $scope: scope,
      alerts: alerts,
      project: project,
      $localStorage: {
        ironridge: {
          '12': {
            firstTime: true
          }
        }
      }
    });
    project.info.location = {
      site_name: site_name,
      city_state: city_state
    };
    project.info.modules = {
      manufacturer: {
        id: manufacturer_id
      },
      model: {
        id: model_id
      }
    };
    project.info.id = '12';
    scope.activeMenu = '';
    scope.navigate('quote');
    expect(scope.$emit).toHaveBeenCalledWith('WithID');
  }));
  it('should  go to quote state if not manufacturer', inject(function ($controller, project, alerts, $localStorage) {
  stateParams.id = 12;
  $controller('NavbarCtrl', {
    $scope: scope,
    alerts: alerts,
    project: project,
    $localStorage: {
      ironridge: {
        '12': {
          firstTime: true
        }
      }
    }
  });
  project.info.location = {
    site_name: site_name,
    city_state: city_state
  };
  project.info.id = '12';
  scope.activeMenu = '';
  spyOn(alerts, 'show');
  scope.navigate('quote');
  expect(alerts.show).toHaveBeenCalledWith('manuf-model-not-set');
}));
});
})();
