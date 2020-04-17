
queue()
    .defer(d3.json,"data/primaryView.json")
    .defer(d3.json,"data/secondaryView.json")
    //.defer(d3.json,"data/tertiaryView.json")
    .await(createVis);

function createVis(error, primaryView, secondaryView) { //}, tertiaryView) {
    if(error) { console.log(error);}

    sentenceData = primaryView.sentences;
    primaryViewVisualization();


    //Secondary View
    secondaryDataEnglish = secondaryView.english;
    secondaryDataSpanish = secondaryView.spanish;

    var curSentenceEnglish = ["light", "of", "the"];
    var curSentenceSpanish = ["luz", "de", "la"];

    //Get data for the sentence

    var secondaryViewEnglish = new SecondaryView("secondaryViewEnglish", secondaryDataEnglish, curSentenceEnglish);
    var secondaryViewSpanish = new SecondaryView("secondaryViewSpanish", secondaryDataSpanish, curSentenceSpanish);


    //Tertiary View
    // tertiaryData = tertiaryView.spanish;
    // tertiaryViewVisualization();
}

function primaryViewVisualization() {

    //show documents in entirety
    sentenceData.forEach(function(sentence){
        $('#english-document-p').append(sentence.english + "&nbsp;");
        $('#spanish-document-p').append(sentence.spanish + "&nbsp;");
    });

    //Make tables of sentences in order of least similarity
    var newSentenceData = sentenceData.sort(function(a, b) { return d3.ascending(a.score, b.score);});
    var ind = 1;

    newSentenceData.forEach(function(sentence) {
        var htmlEngl =
            `
            <tr>
                <td class="english-sentence-rankings" id=${"englSentence"+sentence.index}>
                    ${ind + ") &nbsp;" + sentence.english}
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
                    ${ind + ") &nbsp;" + sentence.spanish}
                </td>
            </tr>
        `;
        var $element = $(htmlSpan);
        $('#spanishSentenceRankings')
            .append($element);

        ind++;
    });
}



function tertiaryViewVisualization() {

}