

SecondaryView = function(_parentElement, _data, _sentence){
    this.parentElement = _parentElement;
    this.data = _data;
    this.sentence = _sentence;
    this.initVis();
}


SecondaryView.prototype.initVis = function() {
    var vis = this;

    // SVG Size
    vis.margin = { top: 40, right: 10, bottom: 40, left: 10 };
    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = 300 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select("#"+vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g");
       //.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(vis.width / 2, vis.height / 2))
    ;

    vis.wrangleData();
}

SecondaryView.prototype.wrangleData = function(){
    var vis = this;
    var curWords = vis.sentence;

    vis.funNodes = [];

    curWords.forEach(function (w) {
        var wObj = new Object();
        wObj.id = w;
        vis.funNodes.push(wObj);
    });

    vis.secondaryFiltered = vis.data.filter(function (a) {
        return curWords.includes(a.word);
    });

    vis.funLinks = [];
    vis.secondaryFiltered.forEach(function (w) {
        w.neighborWords.forEach(function (neighbor, index) {
            if (curWords.includes(neighbor)) {
                var obj = new Object();
                obj.source = w.word;
                obj.target = neighbor;
                obj.count = w.neighborCounts[index];
                vis.funLinks.push(obj);
            }
        })
    });
    vis.updateVis();
}

SecondaryView.prototype.updateVis = function(){
    var vis = this;

    //Create the node link diagram

    var link = vis.svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(vis.funLinks)
        .enter().append("line")
        .attr("stroke-width", function(d) { return 3*Math.sqrt(d.count); });

    var node = vis.svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(vis.funNodes)
        .enter().append("g")

    var circles = node.append("circle")
        .attr("r", 8)
        .attr("fill", "blue")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    var lables = node.append("text")
        .text(function(d) {
            return d.id;
        })
        .attr('x', 6)
        .attr('y', 3);

    node.append("title")
        .text(function(d) { return d.id; });

    vis.simulation
        .nodes(vis.funNodes)
        .on("tick", ticked);

    vis.simulation.force("link")
        .links(vis.funLinks);

    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
    }

    function dragstarted(d) {
        if (!d3.event.active) vis.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) vis.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

}





