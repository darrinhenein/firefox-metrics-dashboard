angular.module('ffxDashboardApp')
  .controller('MainCtrl', function ($scope, $http, $location, data) {

    $scope.isActive = function(route) {
      return route === $location.path();
    }


    $scope.isViewLoading = false;
    $scope.$on('$routeChangeStart', function() {
      $scope.isViewLoading = true;
    });
    $scope.$on('$routeChangeSuccess', function() {
      $scope.isViewLoading = false;
    });

    $scope.page =
    {
      title : " Firefox Usage & Users ",
      date: "March 2014"
    };

    var response = data.data;

    response.forEach(function(g){
      if(g.series.length != 0)
      {
        var precision = g.precision || 2;
        var si = d3.format('.' + precision + 's');
        var numberFormat = function(val) {
         return si(val).replace(/G/, 'B')
        };
        g.lastY = numberFormat(g.series[0].data[g.series[0].data.length - 1].y);
        var lastMonth = g.series[0].data[g.series[0].data.length - 1];
        var secondLastMonth = g.series[0].data[g.series[0].data.length - 2];
        g.percChange = ((lastMonth.y - secondLastMonth.y) / secondLastMonth.y * 100).toFixed(2);
        if (g.total == true) {
          g.lastY = 0;
          g.series[0].data.forEach(function(s){
            g.lastY += s.y;
          });
          g.lastYRaw = d3.format(',')(parseInt(g.lastY, 10));
          g.lastY = numberFormat(g.lastY);
        }
      }
    });

    var columnCount = response.length > 8 ? 4 : 3;
    $scope.columnWidth = response.length > 8 ? 3 : 4;

    $scope.sizes = {
      big : {
        width: 520,
        height: 180
      },
      small: {
        width: 1000/columnCount,
        height: 90
      },
      bigMargin: {
          left: 40,
          right: 10,
          top: 23,
          bottom: 35
      },
      smallMargin: {
          left: 35,
          right: 18,
          top: 20,
          bottom: 30
      }
    };

    $scope.rows = [
      response.slice(0,2),
      response.slice(2,columnCount + 2),
      response.slice(columnCount + 2, columnCount + 6),
    ];

    setTimeout(function(){
      $('.hasTooltip').tooltip({placement: 'right'});
    }, 10)
});
