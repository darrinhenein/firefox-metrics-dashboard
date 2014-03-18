"use strict";

angular.module('ffxDashboardApp')
  .directive("graph", function($http) {

    return {
     restrict: 'E',
     scope: {
      data: '=',
      sizes: '=',
      size: '@'
     },
     link: function (scope, element, attrs) {

        if(scope.size == "big")
        {
          scope.margin = scope.sizes.bigMargin;
          scope.dims = scope.sizes.big;
        }
        else
        {
          scope.margin = scope.sizes.smallMargin;
          scope.dims = scope.sizes.small;
        }

        var margin = scope.margin;
        var width = scope.dims.width - margin.left - margin.right;
        var height = scope.dims.height - margin.top - margin.bottom;

        var parseDate = d3.time.format("%y-%m-%d").parse;
        var si = d3.format('s');
        var numberFormat = function(val) {
         return si(val).replace(/G/, 'B')
        };

        var dateFormat = d3.time.format('%b');

         // set up initial svg object
         var vis = d3.select(element[0])
         .append("svg")
         .attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom)
         .attr("preserveAspectRatio", "xMidYMid")
         .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom));

         var svg = vis
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



         scope.$watch('data', function (newVal, oldVal) {

           // if 'val' is undefined, exit
           if (!newVal) {
             return;
           }

           if (scope.data.length === 0 || scope.data.series.length == 0){
            return;
          }

          var getQuarter = function(d) {
            var m = Math.floor(new Date(d).getMonth()/3) + 1;
            return m > 4? m - 5 : m;
          }

          var data = scope.data.series;

          var x = d3.time.scale()
              .range([0, width]);

          var y = d3.scale.linear()
              .range([height, 0]);

          var allData = [];

          data.forEach(function(d){
            d.data.forEach(function(s){
              s.date = parseDate(s.x);
              s.val = s.y;
              allData.push(s);
            });
          });

          var color = d3.scale.ordinal().range(["#D46B37", "#E08540", "#8B8BA5"]);

          x.domain(d3.extent(allData, function(d) { return d.date; }));
          var yDom = d3.extent(allData, function(d) { return d.val; })
          yDom[0] *= 0.98;
          yDom[1] *= 1.02;
          y.domain(yDom);

          var xAxis = d3.svg.axis()
            .scale(x)
            .ticks(3)
            .tickFormat(function(d) {
              // return "Q" + getQuarter(d);
              return dateFormat(d);
            })
            .orient("bottom");

          var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(5)
            .tickFormat(function(d) {
              return numberFormat(d);
            })
            .orient("left");

          svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

          svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)

          var line = d3.svg.line()
              .x(function(d) { return x(d.date); })
              .y(function(d) { return y(d.val); });

          data.forEach(function(series, idx){

          series.data.forEach(function(d) {
                d.date = parseDate(d.x);
                d.val = d.y;
              });

          var baseline = svg.append("line")
              .attr("x1", series.data[0].x)
              .attr("y1", y(series.data[0].val))
              .attr("x2", width)
              .attr("y2", y(series.data[0].val))
              .style("stroke", "rgba(0,0,0,0.1)");

           svg.append("path")
                 .datum(series.data)
                 .attr("class", "line")
                 .attr("stroke", color(idx))
                 .attr("d", line);

          });

        });
      }
    }
});