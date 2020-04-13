
// SVG Size
var margin = { top: 40, right: 10, bottom: 40, left: 10 };

// var width = document.getElementById("#english-document").clientWidth - margin.left - margin.right,
//    height = 1000 - margin.top - margin.bottom;

// var englishSvg = d3.select("#english-document").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//
// var spanishSvg = d3.select("#spanish-document").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

loadData();

function loadData() {
    d3.json("data/primaryView.json", function(primaryView) {
        sentenceData = primaryView.sentences;
        updateVisualization();
    });
}

function updateVisualization() {

    //show documents in entirety
    sentenceData.forEach(function(sentence){
        $('#english-document-p').append(sentence.english + "&nbsp;");
        $('#spanish-document-p').append(sentence.spanish + "&nbsp;");
    });

    //Make tables of sentences in order of least similarity
    var newSentenceData = sentenceData.sort(function(a, b) { return d3.descending(a.score, b.score);});

    newSentenceData.forEach(function(sentence) {
        var htmlEngl =
            `
            <tr>
                <td class="english-sentence-rankings" id=${"englSentence"+sentence.index}>
                    ${sentence.index + ") &nbsp;" + sentence.english}
                </td>
            </tr>
        `;
        var $element = $(htmlEngl);
        $('#englishSentenceRankings')
            .append($element);

        var htmlSpan =
            `
            <tr>
                <td class="spanish-sentence-rankings" id=${"spanSentence"+sentence.index}>
                    ${sentence.index + ") &nbsp;" + sentence.spanish}
                </td>
            </tr>
        `;
        var $element = $(htmlSpan);
        $('#spanishSentenceRankings')
            .append($element);

    });

}