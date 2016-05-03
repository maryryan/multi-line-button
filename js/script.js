

//HOW TO GET VAL TO DISTINGUISH BETWEEN RES AND NR

var highlightThis = "agriculture";
// var highlightRes = "agriculture-r";
// var highlightNR = "agriculture-nr";

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

// d3.selection.prototype.moveToFront = function() {  
//   return this.each(function(){
//     this.parentNode.appendChild(this);
//   });
// };

// d3.selection.prototype.moveToBack = function() {  
//   return this.each(function() { 
//     var firstChild = this.parentNode.firstChild; 
//       if (firstChild) { 
//         this.parentNode.insertBefore(this, firstChild); 
//       } 
//   });
// };

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
        return{date:d["YEAR"], price: +d[name]};
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


  var MAX = d3.max(degrees, function(c) { return d3.max(c.values, function(v) { return v.price;});  });

  var PRICE = d3.select(degrees, function(c) { d3.select(c.values, function(v) { return v.price;}); });
  console.log(PRICE[0][0][0]["values"]);
    //PRICE[array][array][SPECIFY FOR DEGREE]["values"][SPECIFY FOR YEAR]["price"]

  degree.selectAll(".dot")
    .data(function(d) {
      return d.values;
    })
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", function(d) {
      return x(d.date);
    })
    .attr("cy", function(d) {
      return y(d.price);
    })
    .attr("r", 5)
    .on("mouseover", function(d) {

      var displayDate = moment(d.date).format("YYYY");
      var displayVal = "$"+d.price;

      $(".d3-tip").html(
        "<div class='name'>"+d.name+"</div>"+
        "<div class='date'>"+displayDate+": </div>"+
        "<div class='price'>"+displayVal+"</div>"
        )

      $(".d3-tip").show();

      d3.select(this).style("opacity", 1);
    })
    .on("mousemove", function(d) {

      var xPos = d3.mouse(this)[0] + margin.left + 10;
      var yPos = d3.mouse(this)[1] + margin.top + 10;

      $(".d3-tip").css({
        "left": xPos + "px",
        "top": yPos + "px"
      })
    })
    .on("mouseout", function(d) {
      d3.select(this).style("opacity", 0);
      $(".d3-tip").hide();
    })

  // var tip = d3.tip()
  // .attr('class', 'd3-tip')
  // .offset([-10, 0])
  // .html(function(d) {
  //   //need to fix d.price so shows the amount --> if statement depending on where the x-coords are?
  //   return "<strong, style='color:teal'>" + d.name +":</strong> <span style='color:white'>" + PRICE[0][0]["name"]["values"][function(){
  //      if (d3.event.pageX > 100 && d3.event.pageX <= 200) { return 0}//2007
  //      else if(d3.event.pageX > 200 && d3.event.pageX <= 284) { return 1}//2008
  //      else if (d3.event.pageX > 284 && d3.event.pageX <=367) { return 2}//2009
  //      else if (d3.event.pageX > 367 && d3.event.pageX <=446) { return 3}//2010
  //      else if (d3.event.pageX > 446 && d3.event.pageX <=526) { return 4}//2011
  //      else if (d3.event.pageX > 526 && d3.event.pageX <=610) { return 5}//2012
  //      else if (d3.event.pageX > 610 && d3.event.pageX <=690) { return 6}//2013
  //      else if (d3.event.pageX > 690 && d3.event.pageX <=762) { return 7}//2014
  //      else if (d3.event.pageX > 762) { return 8};//2015
  //    }]
  //    ["price"] + "</span>";
  // })
  // .style("left", function(d) {
  //   return d + "px"
  // });

  // svg.call(tip);

  degree.append("path")
    .attr("class", "line")
    .attr("d", function(d) { return line(d.values); })
    .attr("stroke", "gray")
    // .on('mouseover', tip.show)
    // //fixing the tooltip so it appears close to the line
    // .on("mousemove", function () {
    // return tip
    //     .style("top", (d3.event.pageY - 70) + "px")
    //     .style("left", (d3.event.pageX) + "px");
    // })
    // .on('mouseout', tip.hide);

  setNav();

  // degree.append("text")
  //   .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
  //   .attr("transform", function(d) { return "translate(" + x(d.value.YEAR) + "," + y(d.value.price) + ")"; })
  //   .attr("x", 3)
  //   .attr("dy", ".35em")
  //   .text(function(d) { return d.name});



  //updateLine();
});



// function updateLine() {

//   //line.y(function(d) { return y(d[highlightThis]); });

//   d3.select(".line")
//     .transition()
//     .style("stroke", function(d) {
//       if ($(".btn").Class == "active") {return "gold"}
//       else {return "gray"};
//     });

// }




function setNav() {

  $(".line").on("mouseover", function(d) {
    d3.select(this).attr("class", "line")
      .style("stroke", "gold");
    })
    .on("mouseout", function(d) {
      d3.select(this).attr("class", "line")
        .style("stroke", "gray");
    });


    // $(".btn").removeClass("active");
    // $(this).addClass("active");

    // var val = $(this).attr("val");


    // highlightThis = val;


    // highlightRes = val;
    // highlightNR = val;

  // });

}
