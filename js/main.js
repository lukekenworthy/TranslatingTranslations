
queue()
    .defer(d3.json,"data/primaryView.json")
    .defer(d3.json,"data/secondaryView.json")
    .defer(d3.json,"data/tertiaryView.json")
    .await(createVis);

function createVis(error, primaryView, secondaryView, tertiaryView) {
    if(error) { console.log(error);}

    //primary View data
    sentenceData = primaryView.sentences;

    //secondary view data
    secondaryDataEnglish = secondaryView.english;
    secondaryDataSpanish = secondaryView.spanish;

    //tertiary view data
    englishWords = tertiaryView.englishWords;
    spanishWords = tertiaryView.spanishWords;
    translations = tertiaryView.translations;

    // initialize secondary and tertiary view graphs
    secondaryViewEnglish = new SecondaryView("secondaryViewEnglish", secondaryDataEnglish, []);
    secondaryViewSpanish = new SecondaryView("secondaryViewSpanish", secondaryDataSpanish, []);
    tertiaryViewViz = new TertiaryView("tertiaryView", englishWords, spanishWords, translations, "the", "english");

    //create the primary view
    primaryViewVisualization();

}

function primaryViewVisualization() {

    //show documents in entirety
    sentenceData.forEach(function(sentence){
        $('#english-document-p').append(`<span class="fullDocuments" id=${"englDoc" + sentence.index}>${sentence.english + "&nbsp;"}</span>`);
        $('#spanish-document-p').append(`<span class="fullDocuments" id=${"spanDoc" + sentence.index}>${sentence.spanish + "&nbsp;"}</span>`);
    });

    //Make tables of sentences in order of least similarity
    var newSentenceData = sentenceData.sort(function(a, b) { return d3.ascending(a.score, b.score);});
    var ind = 1;

    newSentenceData.forEach(function(sentence) {
        var htmlEngl =
            `
            <tr>
                <td class="sentence-rankings" id=${"englSentence"+sentence.index} onclick=${"onDocumentSentenceClick("+sentence.index + ")"}>
                    ${ind + ") &nbsp;" + sentence.english}
                </td>
            </tr>
        `;
        $('#englishSentenceRankings')
            .append(htmlEngl);

        var htmlSpan =
            `
            <tr>
                <td class="sentence-rankings" id=${"spanSentence"+sentence.index} onclick=${"onDocumentSentenceClick("+sentence.index +")"}>
                    ${ind + ") &nbsp;" + sentence.spanish}
                </td>
            </tr>
        `;
        $('#spanishSentenceRankings')
            .append(htmlSpan);

        ind++;
    });

    //initialize selected sentence to least similar translations
    onDocumentSentenceClick(newSentenceData[0].index);
}

function onDocumentSentenceClick(sentenceIndex){

    // select all sentences in document and remove highlighting when a new sentence is clicked
    var allSentences = document.getElementsByClassName("sentence-rankings");
    var docSentences = document.getElementsByClassName("fullDocuments");

    for(var i=0; i < allSentences.length; i++) {
        allSentences[i].style.backgroundColor='#FFFFFF';
        docSentences[i].style.backgroundColor='#FFFFFF';
    }

    // select the correct sentence on click and highlight in purple
    var curSentenceEnglish = document.getElementById("englSentence" + sentenceIndex);
    var curSentenceSpanish = document.getElementById("spanSentence" + sentenceIndex);
    var curDocEnglish = document.getElementById("englDoc" + sentenceIndex);
    var curDocSpanish = document.getElementById("spanDoc" + sentenceIndex);


    curSentenceEnglish.style.backgroundColor = "#e1c4ff";
    curSentenceSpanish.style.backgroundColor = "#e1c4ff";
    curDocEnglish.style.backgroundColor = "#e1c4ff";
    curDocSpanish.style.backgroundColor = "#e1c4ff";

    // filter sentence data to get only relevant words information
    var curFilteredPrimaryData = sentenceData.filter(function(s) {
        return s.index === sentenceIndex;
    });

    var curEnglishSentence = curFilteredPrimaryData[0].englishTokens;
    var curSpanishSentence = curFilteredPrimaryData[0].spanishTokens;

    var curWordEnglish = curEnglishSentence[0];
    var curWordSpanish = curSpanishSentence[0];

    // update secondary graph with nodes from current sentence and auto select a center word
    secondaryViewEnglish.wrangleData(curEnglishSentence, curWordEnglish, sentenceIndex);
    secondaryViewSpanish.wrangleData(curSpanishSentence, curWordSpanish, sentenceIndex);

    //update tertiary graph with auto selected word from current sentence
    tertiaryViewViz.wrangleData(curWordEnglish, "english");

}
