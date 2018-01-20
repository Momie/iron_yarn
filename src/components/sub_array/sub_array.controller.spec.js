(function() {
  'use strict';

  describe('controllers: subArrayCtrl', function() {
    var scope, stateParams, alert;
    var obj = {
      'id': 83760,
      'location': {
        'site_name': 'test1011uy',
        'zip_code': '94115',
        'city_state': 'San Francisco, CA'
      },
      'modules': {
        'manufacturer': {
          'id': 179,
          'name': 'Alps'
        },
        'model': {
          'id': 25838,
          'name': 'AFR-80'
        }
      },
      'arrays': {
        'width': 21.8,
        'height': 47.3,
        'count': 2,
        'objects': [{
          '_id': 1,
          'rows': null,
          'columns': null,
          'portrait': null,
          'cells': []
        }]
      }
    };
    var site_name = 'test70501';
    var zipcode = '94305';
    var model_id = 23552;
    var manufacturer_id = 179;
    beforeEach(module('ngMock'));
    beforeEach(module('ironridge'));


    beforeEach(inject(function($rootScope, $controller, $timeout, $stateParams, project) {
      scope = $rootScope.$new();
      stateParams = $stateParams;
      project = project;
    }));
    describe('controller tests', function() {
      it('test add subarray without save ', inject(function($controller, $rootScope, project) {
        $controller('subArrayCtrl', {
          $scope: scope
        });
        stateParams.id = 12;
        scope.addSubarray(1,1,true);
        expect(project.info.arrays.objects[0].rows).toBe(1);
        expect(project.info.arrays.objects[0].columns).toBe(1);
        expect(project.info.arrays.objects[0].portrait).toBe(true);
      }));

      it('test when saved cells are creatred if column and rows ', inject(function($controller, $rootScope, project) {

        $controller('subArrayCtrl', {
          $scope: scope
        });
        project.info = obj;
        project.info.arrays.objects[0].rows = 2;
        project.info.arrays.objects[0].columns = 2;
        project.info.arrays.objects[0].portrait = false;
        expect(project.info.arrays.objects[0].cells.length).toBe(0);
        scope.saveSubarray();
        expect(project.info.arrays.objects[0].cells.length).not.toBe(0);
      }));

      it('test when saved cells are creatred if column=null and rows ', inject(function($controller, $rootScope, project) {

        $controller('subArrayCtrl', {
          $scope: scope
        });
        scope.saveSubarray();
        project.info = obj;
        project.info.arrays.objects[0].rows = null;
        project.info.arrays.objects[0].columns = 5;
        project.info.arrays.objects[0].cells = [];
        expect(project.info.arrays.objects[0].cells.length).toBe(0);
        scope.saveSubarray();
        expect(project.info.arrays.objects[0].cells.length).toBe(0);
      }));


      it('delete ', inject(function($controller, $rootScope, project) {
        $controller('subArrayCtrl', {
          $scope: scope
        });
        scope.saveSubarray();
        project.info = obj;
        expect(project.info.arrays.objects[0]).toEqual({
          _id: 1,
          rows: null,
          columns: 5,
          portrait: false,
          cells: []
        });
        scope.delete(0);
        expect(project.info.arrays.objects[0]).toBe(undefined);
      }));
    });
  });
})();
