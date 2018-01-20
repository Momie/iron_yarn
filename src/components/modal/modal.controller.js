(function() {
    'use strict';
    angular.module('ironridge')
        .controller('IronModal', function($scope, api, $stateParams, $localStorage, $rootScope, $state) {
            $scope.info = {
                title: "",
                content: "",
                icon: "",
                close : true
            };
            $rootScope.$on('showIronModal', function(event, title, content, close, icon){
                $scope.info.title = title;
                $scope.info.content = content;
                $scope.info.close = close;
                $scope.info.icon = icon;
                angular.element('#iron-modal').css({'display': 'flex',  'align-items': 'center'});
                angular.element('#iron-modal').modal('show');
            });
        });
})();
