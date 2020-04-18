TertiaryView = function(_parentElement, _englishWords, _spanishWords, _translations, _curWord){
    this.parentElement = _parentElement;
    this.englishWords = _englishWords;
    this.spanishWords = _spanishWords;
    this.translations = _translations;
    this.curWord = _curWord;
    this.initVis();
}

TertiaryView.prototype.initVis = function() {
    var vis = this;
    //
    // // SVG Size
    // vis.margin = { top: 40, right: 10, bottom: 40, left: 10 };
    // vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    // vis.height = 300 - vis.margin.top - vis.margin.bottom;
    //
    // vis.svg = d3.select("#"+vis.parentElement).append("svg")
    //     .attr("width", vis.width + vis.margin.left + vis.margin.right)
    //     .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    //     .append("g");
    // //.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.wrangleData(vis.curWord);

}

TertiaryView.prototype.wrangleData = function(curWord) {
    var vis = this;

    var queue = [curWord];
    var visited = [];


    //create array visited with all words are connected starting from curWord
    while(Array.isArray(queue) && queue.length > 0){
        var currentWord = queue.pop();
        var currentTranslation = vis.translations.filter(function(w) {
            return w.word === currentWord;
        });
        currentTranslation[0].translations.forEach(function(t) {
            if(!visited.includes(t)) {
                queue.push(t);
            }
        });
        if(!visited.includes(currentWord)) {visited.push(currentWord)};
    }

    //put data in correct format for bipartite graph
    vis.bpData = [];

    var filteredTranslations = vis.translations.filter(function(w) {
        return visited.includes(w.word);
    });

    filteredTranslations.forEach(function(t) {
        var mainWord = t.word;
        if(englishWords.includes(mainWord)) {
            t.translations.forEach(function(translation, index){
                vis.bpData.push([mainWord, translation, t.scores[index]]);
            })
        }
    });

    console.log(vis.bpData);
    vis.updateVis();

}

TertiaryView.prototype.updateVis = function() {
    var vis = this;

    //var color ={Elite:"#3366CC", Grand:"#DC3912",  Lite:"#FF9900", Medium:"#109618", Pluxss:"#990099", Small:"#0099C6"};
    var svg = d3.select("#tertiaryView").append("svg").attr("width", 960).attr("height", 800);
    var g = svg.append("g").attr("transform","translate(200,50)");

    var bp=viz.bP()
        .data(vis.bpData)
        .min(12)
        .pad(1)
        .height(600)
        .width(500)
        .barSize(35);

    g.call(bp);

    g.selectAll(".mainBars")
        .on("mouseover",mouseover)
        .on("mouseout",mouseout);

    g.selectAll(".mainBars").append("text").attr("class","label")
        .attr("x",d=>(d.part==="primary"? -30: 30))
        .attr("y",d=>+6)
        .text(d=>d.key)
        .attr("text-anchor",d=>(d.part==="primary"? "end": "start"));

    g.selectAll(".mainBars").append("text").attr("class","perc")
        .attr("x",d=>(d.part==="primary"? -100: 80))
        .attr("y",d=>+6)
        .text(function(d){ return d3.format("0.0%")(d.percent)})
        .attr("text-anchor",d=>(d.part==="primary"? "end": "start"));

    function mouseover(d){
        bp.mouseover(d);
        g.selectAll(".mainBars")
            .select(".perc")
            .text(function(d){ return d3.format("0.0%")(d.percent)})
    }
    function mouseout(d){
        bp.mouseout(d);
        g.selectAll(".mainBars")
            .select(".perc")
            .text(function(d){ return d3.format("0.0%")(d.percent)})
    }
    d3.select(self.frameElement).style("height", "800px");
}

