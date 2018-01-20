var angular = require('angular');
var ngCookies = require("angular-cookies");
 var uirouter = require("@uirouter/angularjs");
 var ngStorage = require("ngstorage");
 var uiselect = require("ui-select");
 var angularJwt = require("angular-jwt");
 var ironridgeConfig = require("../config.dev.js");
 var uiodometer = require("angular-odometer-js");
// var templates = require.context("./views/.", true, /\.html$/);

var templateUrl = require('file-loader!./views/site/site.pitched.html');
(function () {
  'use strict';

})();



  angular.module('ironridge', ['ngCookies', 'ui.router', 'ngStorage','ui.select' , 'angular-jwt' , 'ui.odometer'])
  .run(function ($cookieStore,$rootScope, $state, $location, $localStorage, $http, jwtHelper, $window, $document, $timeout) {
      var _token = $cookieStore.get('iron_token');
      $rootScope.HOST_URL = "/api/v2";
      window.project_type = ($location.search()).roof_type;
      if(window.project_type === undefined){
        try{
          window.project_type = $cookieStore.get('project_type');
        }catch(e){
          window.project_type = 'pitched';
        }
      }else{
        $cookieStore.put('project_type', window.project_type);
      }
      window.project_type = window.project_type || 'pitched';
      if(typeof(Storage) === undefined) $location.path('/forbidden');
      if($localStorage.ironridge === undefined) $localStorage.ironridge = {};
      if (_token) {
        $http.defaults.headers.common.Authorization = 'Token ' + _token;
      }

      $rootScope.modules = {
        pagination: {
          manufacture: 1,
          model: 1
        }
      };

      $rootScope.navBarValueObject = {
        cost: '-',
        cost_per_watts: '-',
        nb_attachements: '-',
        nb_modules: '-',
        nb_splices: '-',
        watts: '-',
        prefixCost_per_watts: ''
      };

      $rootScope.navBarValueObjectMount = {
        cost: '-',
        cost_per_watts: '-',
        pipe: '-',
        nb_modules: '-',
        piers: '-',
        watts: '-',
        prefixCost_per_watts: ''
      };

      $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
        var token = ($location.search()).token || $cookieStore.get('iron_token');
        var clear_flag = ($location.search()).clear_flag;
      //  $rootScope.showQuote=($location.search()).display_quote_button ? ($location.search()).display_quote_button === 'true'  : false;
        if (token) {
          $http.defaults.headers.common.Authorization = 'Token ' + token;
        }

        if (clear_flag !== undefined) {
          $localStorage.ironridge = {};
        }

        if(window.project_type !== 'pitched' && window.project_type !== 'flat' && window.project_type !== 'mount' && window.project_type !== 'fx' ){
          window.project_type = 'pitched';
        }

        if(toParams.id !== undefined){
          if($localStorage.ironridge[toParams.id]) window.project_type = $localStorage.ironridge[toParams.id].type;
        }

        if (token) {
          $cookieStore.put('iron_token', token);
          var user = jwtHelper.decodeToken(token);
          console.log(user);
          $rootScope.user = user;
          $http.defaults.headers.common.Authorization = 'Token ' + token;
          $location.search('token', null);
        } else $rootScope.user = null;

        /**************** google analytic ********************/

        /************************************************/
      });

      $rootScope.$on('$stateChangeSuccess',
        function () {
          /**************** google analytic ********************/
          //-comm-$window.ga('send', 'pageview', { page: $location.url() });
          // $window.ga('send', 'pageview', { page: 'tab/' + ($location.url().split('/')[1].split('?')[0] || 'site') });
          /************************************************/
          $timeout(function(){
            $document.scrollTo(0, 100, 0);
          },100);
      });

    })
    .config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
      window.project_type = 'pitched';
      $httpProvider.defaults.useXDomain = true;
      //init pagination for manufactures and modules

      $stateProvider
        .state('redirect', {
          url: '/{id:int}',
          //redirect to site page with current project id
          controller: function ($stateParams, $state) {
            $state.go('siteId', {
              id: $stateParams.id
            });

          }
        })
        .state('site', {
          url: '/site',
          templateUrl: function(){
            return templateUrl;
          }

        })
        .state('siteId', {
          url: '/site/{id:int}',
          templateUrl: function(){
            return templateUrl
          }

        })
        .state('designId', {
          url: '/design/{id:int}',
          templateUrl: function(){
            return templateUrl
          }
        })
        .state('quoteId', {
          url: '/quote/{id:int}',
          templateUrl: function(){
            switch(window.project_type){
            case 'mount' :
              return 'views/quote/quote.mount.html';
            case 'fx' :
              return 'views/quote/quote.fx.html';
            default :
              return 'views/quote/quote.pitched_flat.html';
            }
          }
        });


     $urlRouterProvider.otherwise('/site');
    })
    .filter('makeRange', function () {
      return function (input) {
        var lowBound, highBound;
        switch (input.length) {
          case 1:
            lowBound = 0;
            highBound = parseInt(input[0], 10) - 1;
            break;
          case 2:
            lowBound = parseInt(input[0], 10);
            highBound = parseInt(input[1], 10);
            break;
          default:
            return input;
        }
        var result = [];
        for (var i = highBound; i >= lowBound; i--)
          result.push(i);
        return result;
      };
    })
    .filter('makeMatrix', function () {
      return function (input) {
        var x, y;
        /*switch (input.length) {
         case 2:
         x = parseInt(input[0]);
         y = parseInt(input[1]);
         break;
         default:
         return input;
         }*/
        var arr = input.split(',');
        x = parseInt(arr[0], 10);
        y = parseInt(arr[1], 10);
        var result = [];
        for (var j = 0; j < y; j++) {
          for (var i = 0; i < x; i++)
            result.push({
              x: i,
              y: j
            });
        }
        console.log(result.length);
        return result;
      };
    })
    .filter('joinLengthValues', function () {
      return function (lengths) {
        //var lengths = [{value:4, checked: true}, {value:10, checked:true}];
        var list = [];
        for (var i = 0; i < lengths.length; i++) {
          list.push(lengths[i].value + '\'');
        }
        return list.join(', ');
      };
    })
    .directive('ngDebounce', function ($timeout) {
      return {
        restrict: 'A',
        require: 'ngModel',
        priority: 99,
        link: function (scope, elm, attr, ngModelCtrl) {
          if (attr.type === 'radio' || attr.type === 'checkbox') return;

          elm.unbind('input');

          var debounce;
          elm.bind('input', function () {
            $timeout.cancel(debounce);
            debounce = $timeout(function () {
              scope.$apply(function () {
                ngModelCtrl.$setViewValue(elm.val());
              });
            }, attr.ngDebounce || 1000);
          });
          elm.bind('blur', function () {
            scope.$apply(function () {
              ngModelCtrl.$setViewValue(elm.val());
            });
          });
        }

      };
    })
    angular.module('ironridge').controller('SiteCtrl', require('./controllers/site.controller.js'));
