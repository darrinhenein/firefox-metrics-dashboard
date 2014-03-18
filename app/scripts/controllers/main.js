'use strict';

angular.module('ffxDashboardApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.page =
    {
      title : "Firefox Desktop Users & Usage"
    };

    $scope.sizes = {
      big : {
        width: 400,
        height: 180
      },
      small: {
        width: 200,
        height: 60
      },
      bigMargin: {
          left: 40,
          right: 10,
          top: 10,
          bottom: 25
      },
      smallMargin: {
          left: 25,
          right: 10,
          top: 8,
          bottom: 10
      }
    };

    $http.get('data/desktop.json').success(function(response){

        var si = d3.format('.2s');
        var numberFormat = function(val) {
         return si(val).replace(/G/, 'B')
        };

        response.forEach(function(g){
          if(g.series.length != 0)
          {
            g.lastY = numberFormat(g.series[0].data[g.series[0].data.length - 1].y);
            var lastMonth = g.series[0].data[g.series[0].data.length - 1];
            var secondLastMonth = g.series[0].data[g.series[0].data.length - 2];
            g.percChange = ((lastMonth.y - secondLastMonth.y) / secondLastMonth.y * 100).toFixed(2);
          }
        });

        $scope.rows = [
          response.slice(0,2),
          response.slice(2,6),
          response.slice(6,10),
        ];
    });

  });
