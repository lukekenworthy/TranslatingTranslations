
// SVG Size
var width = 700,
	height = 500;

var padding = 60;


// Load CSV file
d3.csv("data/wealth-health-2014.csv", function(data){

    //Convert to numeric values when needed
    data.forEach(function(d) {
        d.Population = +d.Population;
        d.LifeExpectancy = +d.LifeExpectancy;
        d.Income = +d.Income;
        d.Region = d.Region;
    });

    //Sort data by population largest to smallest
	data.sort(function(a, b) { return b.Population - a.Population;});

	// Analyze the dataset in the web console
	console.log(data);
	console.log("Countries: " + data.length);

    var svg = d3.select("#chart-area")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    //Create scales
    var incomeScale = d3.scaleLog()
        .domain([d3.min(data, function(d) { return d.Income;}), d3.max(data, function(d) {return d.Income;})])
        .range([padding, width - padding]);

    var lifeExpectancyScale = d3.scaleLinear()
        .domain([d3.min(data, function(d) { return d.LifeExpectancy;}) - 20, d3.max(data, function(d) {return d.LifeExpectancy;}) + 20])
        .range([height - padding, padding]);

    var populationScale = d3.scaleLinear()
		.domain([d3.min(data, function(d) {return d.Population;}), d3.max(data, function(d) {return d.Population})])
		.range(["4px", "30px"]);

    var regionScale = d3.scaleOrdinal()
        .domain(["Europe & Central Asia", "Sub-Saharan Africa", "East Asia & Pacific", "America", "Middle East & North Africa"])
        .range(["red", "orange", "green", "blue", "purple"]);

    //Check scales
    console.log(incomeScale(5000));
    console.log(lifeExpectancyScale(68));

    svg.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("cx", d => incomeScale(d.Income))
		.attr("cy", d => lifeExpectancyScale(d.LifeExpectancy))
		.attr("r", d => populationScale(d.Population))
		.attr("stroke", "black")
		.attr("fill", d => regionScale(d.Region));

    //Create Axes
    var xAxis = d3.axisBottom()
        .scale(incomeScale)
        .ticks("10", "t")
        .tickSize(5, 0);

    var yAxis = d3.axisLeft()
		.scale(lifeExpectancyScale);

    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0," + (height - padding) + ")")
        .call(xAxis);

    svg.append("g")
		.attr("class", "axis y-axis")
		.attr("transform", "translate(" + padding+",0)")
		.call(yAxis);

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate("+ (padding/4) +","+(height/2)+")rotate(-90)")
        .text("Life Expectancy");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate("+ (width/2) +","+(height-(padding/4))+")")  // centre below axis
        .text("Income");

});

