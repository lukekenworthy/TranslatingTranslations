TertiaryView = function(_parentElement, _englishWords, _spanishWords, _translations, _curWord, _curLanguage){
    this.parentElement = _parentElement;
    this.englishWords = _englishWords;
    this.spanishWords = _spanishWords;
    this.translations = _translations;
    this.curWord = _curWord;
    this.curLanguage = _curLanguage;
    this.initVis();
}

TertiaryView.prototype.initVis = function() {
    var vis = this;

    vis.svg = d3.select("#tertiaryView").append("svg").attr("width", 1000).attr("height", 800);

    vis.wrangleData(vis.curWord, vis.curLanguage);

}

TertiaryView.prototype.wrangleData = function(curWord, curLanguage) {
    var vis = this;
    vis.curWord = curWord;
    //vis.curLanguage = curLanguage;

    var queue = [curWord];
    var queueLanguages = [curLanguage];
    var visited = [];
    var visitedLanguages = [];

    //create array visited with all words are connected starting from curWord
    while(Array.isArray(queue) && queue.length > 0){
        var currentWord = queue.pop();
        var currentLanguage = queueLanguages.pop();
        var oppositeLanguage = currentLanguage === "english" ? "spanish" : "english";

        //get word from data based on word and its language
        var currentTranslation = vis.translations.filter(function(w) {
            return w.word === currentWord && w.language === currentLanguage;
        });


        //should only have 1 match in the data, so examine its translations
        //see if word is already visited by checking if in the visited array or if it is but from the wrong language
        currentTranslation[0].translations.forEach(function(t) {
            if(!visited.includes(t) || (visited.includes(t) && queueLanguages[visited.indexOf(t)] === oppositeLanguage)) {
                queue.push(t);
                queueLanguages.push(oppositeLanguage);
            }
        });

        if(!visited.includes(currentWord)) {
            visited.push(currentWord);
            visitedLanguages.push(currentLanguage);
        }
    }

    //put data in correct format for bipartite graph
    vis.bpData = [];

    var filteredTranslations = vis.translations.filter(function(w) {
        return visited.includes(w.word);
    });

    filteredTranslations.forEach(function(t) {
        if(t.language === "english") {
            t.translations.forEach(function(translation, index){
                vis.bpData.push([t.word, translation, t.scores[index]]);
            })
        }
    });

    vis.updateVis();

}

TertiaryView.prototype.updateVis = function() {
    var vis = this;

    vis.svg.selectAll(".wordData").remove();

    var g = vis.svg.append("g").attr("class", "wordData").attr("transform","translate(330,50)");

    //create bipartite graph, coloring selected word and its connections
    var bp=viz.bP()
        .data(vis.bpData)
        .min(12)
        .pad(1)
        .height(600)
        .width(500)
        .barSize(35)
        .fill(d=>d.primary === vis.curWord || d.secondary === vis.curWord ? "#ff7751" : "#836cd4");

    g.call(bp);

    g.selectAll(".mainBars")
        .on("mouseover",mouseover)
        .on("mouseout",mouseout);

    g.selectAll(".mainBars").append("text").attr("class","label")
        .attr("x",d=>(d.part==="primary"? -30: 20))
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

