(function() {
  'use strict';
  describe('myDirective modalHelp', function() {
    var scope, $http, $httpBackend;
    beforeEach(module('ironridge'));
    beforeEach(inject(function(_$http_, $rootScope, $controller, _$httpBackend_) {
      scope = $rootScope.$new();
      $http = _$http_;
      $httpBackend = _$httpBackend_;
    }));

    it('should toggleModal be a function ', function($controller) {
      $controller('helpController', {
        $scope: scope
      });
      expect(scope.toggleModal).toHaveBeenCalled();
      scope.toggleModal('Zip_Code');
      expect(scope.info.info.title).toEqual('Zip Code');
    });

    it('should demonstrate using when (200 status) ', function() {
      $httpBackend.expect('GET', 'app/components/help/help.json').respond(200);
    });
  });
})();
