angular.module('ffxDashboardApp')
.directive("graph", function() {

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

   var dateFormat = d3.time.format('%b %y');

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
          var text = svg.append("text");
          text
          .attr("x", width/2)
          .attr("y", height/2 + 10)
          .text( "No Data Available")
          .attr("font-family", "sans-serif")
          .attr("font-size", "14px")
          .attr("text-anchor", "middle")
          .attr("class", "noData");
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

        var color = d3.scale.ordinal().range(["#0096eb", "#ED8F5E", "#8B8BA5"]);

        x.domain(d3.extent(allData, function(d) { return d.date; }));
        var yDom;
        if(scope.data.range)
        {
          yDom = scope.data.range;
        } else
        {
          yDom = d3.extent(allData, function(d) { return d.val; });
          yDom[0] *= 0;
          yDom[1] *= 1.02;
        }

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
        .ticks(3)
        .tickFormat(function(d) {
          return numberFormat(d);
        })
        .orient("left");

        var area = d3.svg.area()
        .x(function(d) { return x(d.date); })
        .y0(height)
        .y1(function(d) { return y(d.val); });

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

          // only draw area for first line
          if(idx == 0)
          {
            svg.append("path")
            .datum(series.data)
            .attr("class", "area")
            .attr("d", area);


            var baseline = svg.append("line")
            .attr("x1", x(series.data[0].x))
            .attr("y1", y(series.data[0].val))
            .attr("x2", width)
            .attr("y2", y(series.data[0].val))
            .attr("stroke-dasharray", "2,2")
            .style("stroke", "rgba(0,0,0,0.2)");
          }

          svg.append("path")
          .datum(series.data)
          .attr("class", "line line-" + idx)
          .attr("stroke", color(idx))
          .attr("stroke-linecap", "round")
          .attr("d", line);


          var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-5, 0])
          .html(function(d) {
           var numFor = d3.format(',');
           return "<span class='svgTooltip tooltip-" + idx + "'>" + numFor(d.val) + "</span>";
         })

          /* Invoke the tip in the context of your visualization */
          svg.call(tip);

          series.data.forEach(function(p) {
            svg.append("circle")
            .datum(p)
            .attr("r", 3)
            .attr("stroke", color(idx))
            .attr("class", "svgTooltipTarget circle-" + idx)
            .attr("stroke-width", 2)
            .attr("fill", "#FFF")
            .attr("cx", x(p.date))
            .attr("cy", y(p.val))
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
          });
        });



});
}
}
});