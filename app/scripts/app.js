'use strict';

angular.module('ffxDashboardApp', [
  'ngRoute'
])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/desktop', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          data: ['$http', function($http){
            return $http.get('data/desktop.json', {cache: true});
          }]
        }
      })
      .when('/mobile', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          data: ['$http', function($http){
            return $http.get('data/mobile.json', {cache: true});
          }]
        }
      })
      .otherwise({
        redirectTo: '/desktop'
      });
  }]);
