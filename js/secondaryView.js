

SecondaryView = function(_parentElement, _data, _sentence, _curWord){
    this.parentElement = _parentElement;
    this.data = _data;
    this.sentence = _sentence;
    this.curWord = _curWord;
    this.initVis();
}


SecondaryView.prototype.initVis = function() {
    var vis = this;

    // SVG Size
    vis.margin = { top: 40, right: 10, bottom: 40, left: 0 };
    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = 550 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select("#"+vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.graphLanguage = vis.parentElement === "secondaryViewEnglish" ? "english" : "spanish";
    //vis.wrangleData();
}

SecondaryView.prototype.wrangleData = function(curWords, focusWord, sentenceIndex){
    var vis = this;

    vis.sentence = curWords;
    vis.focusWord = focusWord;
    vis.sentenceIndex = sentenceIndex;

    vis.funNodes = [];

    // create the set of nodes from the words in the selected sentence
    curWords.forEach(function (w) {
        var wObj = new Object();
        wObj.id = w;
        vis.funNodes.push(wObj);
    });

    // find the elements in the secondary view data that correspond to words in the sentence
    vis.secondaryFiltered = vis.data.filter(function (a) {
        return curWords.includes(a.word);
    });


    //create the set of links between nodes from the setence, including a datum of how often the words appear close to each other
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

    vis.focusWordIndexNodes = curWords.indexOf(focusWord);
    vis.updateVis();
}

SecondaryView.prototype.updateVis = function(){
    var vis = this;

    vis.svg.selectAll(".nodes").remove();
    vis.svg.selectAll(".links").remove();

    //Create the node link diagram


    // Calculate force between nodes and links
    vis.simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody().strength(-290))
        .force("center", d3.forceCenter(vis.width / 2 + vis.margin.left, vis.height / 2 + vis.margin.bottom))
    ;


    // draw links with appropriate thickness, and use orange color for the selected word's links
    var link = vis.svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(vis.funLinks)
        .enter().append("line")
        .attr("stroke-width", function(d) { return 3*d.count; })
        .style("stroke", function(d) { return d.source === vis.focusWord ?  "#ff7751": "#999999"; })
        .style("stroke-opacity", function(d) { return d.source === vis.focusWord ? 1 : 0.6; });


    // create node elements
    var node = vis.svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(vis.funNodes)
        .enter().append("g");

    // draw circles at each node, and color the selected word's node orange
    var circles = node.append("circle")
        .attr("r", 8)
        .attr("fill", function(d){return d.id === vis.focusWord? "#ff7751" : "#836cd4"; })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("click", function(d) {
            vis.wrangleData(vis.sentence, d.id, vis.sentenceIndex);
            tertiaryViewViz.wrangleData(d.id, vis.graphLanguage);
        });

    // create labels for each node with which word it corresponds to
    var lables = node.append("text")
        .attr("class", "lables")
        .text(function(d) {
            return d.id;
        })
        .attr('x', 6)
        .attr('y', 3);

    // update locations of nodes on tick
    vis.simulation
        .nodes(vis.funNodes)
        .on("tick", ticked);

    // update force and lengths for links and account for links in force calculation
    vis.simulation.force("link")
        .links(vis.funLinks);

    // function for changing node position on tick; center the selected word
    function ticked() {
        vis.funNodes[vis.focusWordIndexNodes].fx = vis.width / 2 + vis.margin.left;
        vis.funNodes[vis.focusWordIndexNodes].fy = vis.height / 2 + vis.margin.bottom;

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

    //Allow user to drag words to view certain connections more easily
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






