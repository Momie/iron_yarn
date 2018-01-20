(function () {
  'use strict';

  describe('controllers: ManufCtrl', function () {
    var scope;

    beforeEach(module('ironridge'));

    var apiService;
    var q;
    var deferred;

    beforeEach(function () {
      apiService = {
        getModel: function() {
          deferred = q.defer();
          return deferred.promise;
        },
        getManufactur: function(page) {
          deferred = q.defer();
          return deferred.promise;
        }
      };
    });

    beforeEach(inject(function ($rootScope) {
      scope = $rootScope.$new();
    }));

    it('choose should call thisManuf', inject(function ($controller) {
      $controller('ManufCtrl', {
        $scope: scope
      });
      //spyOn(scope, 'thisManuf');
      var manufacturer = {name: 'manufacturer350', id: 250};
      scope.choose(manufacturer);
      //expect(scope.thisManuf).toHaveBeenCalledWith(manufacturer.name, manufacturer.id);
    }));

    it('should get models corresponding to chosen manufacturer', inject(function ($controller, project, $q) {
      q = $q;
      $controller('ManufCtrl', {
        $scope: scope,
        project: project,
        api: apiService
      });
      spyOn(apiService, 'getModel').and.callThrough();
      var manufacturer = {name: 'manufacturer350', id: 250};
      scope.choose(manufacturer);
      expect(apiService.getModel).toHaveBeenCalledWith(manufacturer.id, 1, false);
    }));

  });
})();
