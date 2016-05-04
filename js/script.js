//HOW TO GET VAL TO DISTINGUISH BETWEEN RES AND NR
var chartThisValue = "agriculture";

//var legendData = {name: ["Resident", "Non-resident"], color: ["teal", "gold"]};
var legendData = [
{name: 'Non-resident', color: 'gold'},
{name: 'Resident', color: 'teal'}
];


var legendRectSize = 18;
var legendSpacing= 4;

//DEFINE CHART DIMENSIONS
var margin = {top: 20, right: 20, bottom: 30, left: 50};
var width = $(".chart").width() - margin.left - margin.right;
var height = $(".chart").height() - margin.top - margin.bottom;

var formatDate = d3.time.format("%Y");

// DEFINE SCALES
var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category20c();

// DEFINE AXES
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");



// APPEND SVG AND AXES GROUPS TO THE DOM
var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.price);});


var svg = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("class", "chart-g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// IMPORT DATA
d3.csv("data/degree_cost.csv", function(error, data) {
  if (error) throw error;

  setNav();

  var colorDomain = 
    d3.keys(data[0]).filter(function(key) {
        return key !== "YEAR";
      });

  color.domain(colorDomain);

  data.forEach(function(d)  {
    d.YEAR = formatDate.parse(d["YEAR"]);
  });

  var degrees = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d)  {
        return{date:d["YEAR"], price: +d[name]};//this is where d.price comes from
      })
    };
  });


// PREPARE DATA
  x.domain(d3.extent(data, function(d) { return d["YEAR"]; }));
  y.domain([0,
    d3.max(degrees, function(c) { return d3.max(c.values, function(v) { return v.price;});  })
  ]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Cost (in $)");

  var degree = svg.selectAll(".degree")
    .data(degrees)
    .enter().append("g")
    .attr("class", "degree");

  degree.append("path")
    .attr("class", "line")
    .attr("d", function(d) { return line(d.values); })
    .attr("opacity", function(d) {
      var Name = d.name.split("-")[0];
      if(Name == chartThisValue) {
        return 1;
      } else {
        return 0;
      }
    })
    .attr("stroke", function(d) {
      var resType = d.name.split("-")[1];

      if(resType === "nr") {
        return "gold";
      } else {
        return "teal";
      }
    });

  var legend = svg.selectAll(".legend")
    .data(legendData)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) {
      var height = legendRectSize + legendSpacing;
      var offset = -18*height;
      var horz = 1.5*legendRectSize;
      var vert = i * height - offset;
      return 'translate(' + horz + ',' + vert +')';
    });
    // .attr("x", width-65)
    // .attr("y", 25)
    // .attr("height", 100)
    // .attr("width", 100)
    // .style("fill", function(d) {
    //    return legendData.color;
    // });

  legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', function(d) { return d.color})
    .style('stroke', function(d) { return d.color});

  legend.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text(function(d) { return d.name;});

  
});






function setNav() {

  $(".btn").on("click", function() {
    $(".btn").removeClass("active");
    $(this).addClass("active");

    var val = $(this).attr("val");

    chartThisValue = val;

    d3.selectAll(".line")
      .attr("opacity", function(d) {
        var lineName = d.name.split("-")[0];

        if(lineName === val) {
          return 1;
        } else {
          return 0;
        }
      })
      .style("stroke", function(d) {
        //Color coding for resident (teal) or non-resident (gold) student
        var resType = d.name.split("-")[1];
          if(resType == "nr") { return "gold"}
          else { return "teal"}
       }
      );
  })

}


