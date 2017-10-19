import React, { Component } from 'react';
import './style.css';
import ResultList from './components/resultList';
import Evaluation from './components/evaluation';
import SearchTimer from './components/searchTimer';
import * as dna from 'dna';
const Stopwatch = require("node-stopwatch").Stopwatch;
const Client = require('node-rest-client').Client;
const pdfConverter = require('jspdf');
const cpus = require('cpus');

let indexStopwatch = Stopwatch.create();

function matchesKmer(element, index, array){
    if (element.k === this) {
        return index;
    }
}

function initElement(elem) {
    elem.push({ kmer: ['', 0, []] })
};

function sortResultRanks(sortingArray) {
    let sortedArray = sortingArray.sort((a, b) => {     
        if (a[a.length - 1].cosSim > b[b.length - 1].cosSim) {
            return -1;
          }
        if (a[a.length - 1].cosSim < b[b.length - 1].cosSim) {
          return 1;
        }
        return 0;
    });
    return sortedArray;
}

function calculateTFIDF(tf, idf) {
    return tf * idf;
}

function normaliseTF(tf, seqLen) {
    return tf / seqLen; // factorised tf / sequence length * number of rotations (tf / seqLen * 7 / 7)
}

function calculateIDF(vectors, kmer) {
    let n = 0;
    vectors.forEach(function(element) {
        for (let i = 0; i < element.length - 1; i++) {
            element[i].kmer === kmer.kmer ? n++ : null;
        };
    });
    return Math.log10((vectors.length / n) + 1);
}

function endSearchTime() {
    document.getElementById('search-timer').style.display = 'grid';
    let searchTimeEnd = Date.now();
    this.setState({ searchTime:  searchTimeEnd - this.state.searchTimeStart});
}

function initVectors(queryTokens, uninvertedList, organisms, seqLen) {
    let vectors = [];
    for (let i = 0; i < uninvertedList.length; i++) {
        vectors.push([]);
        let k = 0;
        if (uninvertedList[i].length > 1) {
            for (let j = 1; k < queryTokens.length; j++) {
                if (queryTokens[k] === uninvertedList[i][j].kmer[0]) {
                    vectors[i].push({ organism: organisms.organisms[i], seqLength: seqLen.seqLen[i], kmer: queryTokens[k], tf: uninvertedList[i][j].kmer[1], pos: uninvertedList[i][j].kmer[2], posComplement: uninvertedList[i][j].kmer[3] });
                    k++
                    k === queryTokens.length ? j = uninvertedList.length : j = 0;
                } else if (j === uninvertedList[i].length - 1) {
                    vectors[i].push({ kmer: queryTokens[k], tf: 0, tfidf: 0 });
                    j = 0
                    k++
                }
            }
        } else {
            vectors[i].push({ organism: organisms.organisms[i], seqLength: seqLen.seqLen[i] });
        }
    }
    return vectors;
}

function getStats(vectors, seqLen) {
    for (let i = 0; i < vectors.length; i++) {
        vectors[i].push({cosSim: 0});
        for (let j = 0; j < vectors[i].length - 1; j++) {
            let idf = calculateIDF(vectors, vectors[i][j]);
            let tf = vectors[i][j].tf;
            let normTF = normaliseTF(tf, seqLen.seqLen[i]);
            vectors[i][j].tf = [tf, normTF];
            let tfidf = calculateTFIDF(vectors[i][j].tf[1], idf);
            vectors[i][j].tfidf = tfidf;
        }
    }
    return vectors;
}

function calculateCosineSimilarity(vectorsWithStats) {
    const queryTfidf = 1;
    for (let i = 0; i < vectorsWithStats.length; i++) {
        let dotProduct = 0;
        let documentSquares = 0;
        let querySquares = 0;
        for (let j = 0; j < vectorsWithStats[i].length - 1; j++) {
            dotProduct += vectorsWithStats[i][j].tfidf * queryTfidf;
            documentSquares += Math.pow(vectorsWithStats[i][j].tfidf, 2);
            querySquares += Math.pow(queryTfidf, 2);
        }
        vectorsWithStats[i][vectorsWithStats[i].length - 1].cosSim = dotProduct / (Math.sqrt(documentSquares) * Math.sqrt(querySquares));
    }
    return vectorsWithStats;
}

function displayResults(data) {
    // document.getElementById('results').style.display = 'grid';
    this.setState({ results: data });
}

function sortPositions(sortingArray) {
    for (let i = 0; i < sortingArray.length; i++) {
        for (let j = 1; j < sortingArray[i].length; j++) {
            let sortArr = sortingArray[i][j].kmer[2];
            sortArr.sort((a, b) => {     
                if (a[0] < b[0]) {
                    return -1;
                }
                if (a[0] > b[0]) {
                    return 1;
                }
                return 0;
            });
            let sortArrPos = [];
            let sortArrPosComplement = [];
            for (let k = 0; k < sortArr.length; k++) {
                if (sortArr[k][1] === "t") {
                    sortArrPos.push(sortArr[k][0]);
                } else if (sortArr[k][1] === "c") {
                    sortArrPosComplement.push(sortArr[k][0])
                } else {
                    console.log("ERROR: not template or complement strand")
                }
            }
            sortingArray[i][j].kmer[2] = sortArrPos;      // save template strand positions to element 2, and complementary strand positions to element 3
            sortingArray[i][j].kmer.push(sortArrPosComplement);
        }
    }
    return sortingArray;
}

function matchProductsToPositions(vectors) {
    let v = JSON.stringify(vectors);
    var client = new Client();
    var args = {
        data: { data: v },
        headers: { "Content-Type": "application/json" },
      };
    client.post("http://localhost:4000/vectors", args, function (data, response) {
        displayResults(data);
    }); 
}

// workaround: 'this' was not available inside client
function rankResults(results, seqLen, organisms) {
    endSearchTime();
    let uninvertedList = uninvertList(results, organisms);
    let sortedPositions = sortPositions(uninvertedList);
    let queryTokens = this.tokeniseQuery(this.state.querySeq);
    let vectors = initVectors(queryTokens, sortedPositions, organisms, seqLen);
    let vectorsWithStats = getStats(vectors, seqLen);
    let vectorsWithCosSim = calculateCosineSimilarity(vectorsWithStats);
    let sortedListRanks = sortResultRanks(vectorsWithCosSim);
    let vectorsWithCosSimAnn = matchProductsToPositions(sortedListRanks);
}

// workaround: 'this' was not available inside client
function uninvertList(results, organisms) {
    let uninvertedList = [];
    for (let i = 0; i < organisms.organisms.length; i++) {
        uninvertedList.push([i]);
    }
    if (results.length > 0) {
        results.forEach(function(element) {

            for (let j = 0; j <  element.d.length; j++) {
                for (let k = 0; k < uninvertedList.length; k++) {
                    if (uninvertedList[k][0] === element.d[j][0]) { // match results document/organism to new array element
                        initElement(uninvertedList[k]);
                        uninvertedList[k][uninvertedList[k].length-1].kmer[0] = element.k;

                        uninvertedList[k][uninvertedList[k].length-1].kmer[1] += element.d[j][1];
                        uninvertedList[k][uninvertedList[k].length-1].kmer[2] = element.d[j][2];
                       

                        // if (uninvertedList[k][uninvertedList[k].length-1].kmer[0] === element.k) {
                        //     console.log('matches');
                        // };
                        //  uninvertedList[k][uninvertedList[k].length-1].kmer[1] += element.d[j+len/2][1];
                        //  uninvertedList[k][uninvertedList[k].length-1].kmer[3] = element.d[j+len/2][2];

                    }
                }
            };
        })
       return uninvertedList;
    }
}

window.onload = function() {
    let seqInput = document.getElementById('seq-input');
    let annInput = document.getElementById('ann-input');
    let fileContentsSeq = document.getElementById('file-contents-seq');
    let fileContentsAnn = document.getElementById('file-contents-ann');
    let notSupportedSeq = document.getElementById('not-supported-seq');
    let notSupportedAnn = document.getElementById('not-supported-ann');
    
    seqInput.addEventListener('change', function(e) {
        var file = seqInput.files[0];
        var textType = /text.*/;
        if (file.type.match(textType)) {
            var reader = new FileReader();
            reader.onload = function(e) {
              fileContentsSeq.value = reader.result;
            }
            reader.readAsText(file);
        } else {
            notSupportedSeq.innerText = "File not supported!"
        }
    });

    annInput.addEventListener('change', function(e) {
        var file = annInput.files[0];
        var textType = /text.*/;
        if (file.type.match(textType)) {
            var reader = new FileReader();
            reader.onload = function(e) {
              fileContentsAnn.value = reader.result;
            }
            reader.readAsText(file);
        } else {
            notSupportedAnn.innerText = "File not supported!"
        }
    });
}


class App extends Component {
    constructor(props) {
        super(props);
      
        this.state = {
            sequence: [],
            sequences: [],
            annotation: [],
            annotations: [],
            annotationsProcessed: [],
            querySeq: [],
            indexes: [], 
            searchTimeStart: 0,
            searchTime: 0,
            indexTime: {},
            results: [],
            an: [],
            reverseComplement: []
        }

        endSearchTime = endSearchTime.bind(this);
        rankResults = rankResults.bind(this); 
        displayResults = displayResults.bind(this);
        this.onPrint = this.onPrint.bind(this);
        this.processAnnotations = this.processAnnotations.bind(this);
        this.searchIndex = this.searchIndex.bind(this);        
        this.submitSequence = this.submitSequence.bind(this);
        this.searchMain = this.searchMain.bind(this);        
        this.postData = this.postData.bind(this);        
        this.indexMain = this.indexMain.bind(this);   
        this.createIndexSpinner = this.createIndexSpinner.bind(this);  
        this.createIndex = this.createIndex.bind(this);
        this.tokeniseSequence = this.tokeniseSequence.bind(this);
        this.createRotations = this.createRotations.bind(this);
        this.handleChange = this.handleChange.bind(this); 
        this.saveSequence = this.saveSequence.bind(this);
    }

    handleChange({ target }) {
        this.setState({
            [target.name]: target.value
        });
    }

    onPrint() {
        const { results } = this.state.results;
        var doc = new pdfConverter('p','pt','c6');

        var specialElementHandlers = {
            '#editor': function(element, renderer){
                return true;
            },
            '.controls': function(element, renderer){
                return true;
            }
        };

        let reportStuff = document.getElementById('results-list').innerHTML;
        reportStuff += '<style type="text/css">table {font-size: 6px;}</style>';
        doc.setFontSize(8);
        doc.fromHTML(reportStuff, 40, 40, { 
            'elementHandlers': specialElementHandlers
        });
        
        doc.save("test.pdf");
    }

    postAnnotations(geneProducts) {
        let jsonAnnotations = JSON.stringify(geneProducts);
        var client = new Client();
        var args = {
            data: { data: jsonAnnotations },
            headers: { "Content-Type": "application/json" },
            //body: jsonAnnotations
          };
        client.post("http://localhost:4000/annotations", args, function (data, response) {
            console.log(response);
        }); 
    }

    cleardb() {
        var client = new Client();
        var args = {
            headers: { "Content-Type": "application/json" },
          };
        client.post("http://localhost:4000/cleardb", args, function (data, response) {

        });
    }

    postSearchQuery(queryStr) {
        let results;
        var client = new Client();
        var args = {
          data: { data: queryStr },
          headers: { "Content-Type": "application/json" },
        };
        client.post("http://localhost:4000/query", args, function (data, response) {
          results = JSON.parse(data.toString());
          let organisms = results.pop();
          let seqLen = results.pop();
          rankResults(results, seqLen, organisms);
          // uninvertList(results);
        });     
    }

    validateQuery(tokensArray) {
        // TODO: check that the query tokens length == 7
    }

    setToUppercase() {
        // TODO: require all input to be uppercase
    }

    tokeniseQuery(querySeq) {
        let tokensArray = querySeq.split(' ');
        //this.validateQuery(tokensArray);
        return tokensArray;
    }

    searchIndex(tokensArray) {
        let startSearchTime = Date.now();
        this.setState({ searchTimeStart: startSearchTime });
        this.postSearchQuery(tokensArray);
    }

    submitSequence() {
        let seqInput = document.getElementById('queryInput').value;
        document.getElementById('queryInput').style.display = 'none'; 
        document.getElementById('querySeq').style.display = 'block'; 
        document.getElementById('submit-button').style.display = 'none';
        document.getElementById('new-query-button').style.display = 'grid'; 
        document.getElementById('results-list').style.display = 'grid';    
        return seqInput;                        
    }

    searchMain() {
        let seqQuery = this.submitSequence();
        let queryTokens = this.tokeniseQuery(seqQuery);
        this.searchIndex(queryTokens);
        this.setState({ querySeq: seqQuery });
    }

    postData() {
        let jsonIndex = JSON.stringify(this.state.indexes)
        var client = new Client();
        var args = {
          data: { data: jsonIndex },
          headers: { "Content-Type": "application/json" },
          body: this.state.index
        };  
        client.post("http://localhost:4000/index", args, function (data, response) {
          console.log(response);
        }); 
      }

    displayTimer(time, uiElement) {
      time.minutes > 0 ? uiElement.innerText = `${time.minutes}:${Math.round(time.seconds)} minutes`: uiElement.innerText = `${Math.round(time.seconds)} seconds`;
    }

    addTimes(timeOne, timeTwo) {
        let minutes = timeOne.minutes + timeTwo.minutes;
        let seconds = timeOne.seconds + timeTwo.seconds;
        if (seconds > 60) {
            seconds -= 60;
            minutes += 1;
        }
        return { minutes: minutes, seconds: seconds };
    }
      
    createIndex(ra, i_main, arrayLength, sequenceLengths, organisms, revComp) {
        let strand = '';
        revComp === true ? strand = 'c': strand = 't';
        indexStopwatch.start();
        let queryLength = ra.length;
        let positionStart;
        let index = this.state.indexes;
        for (let j = 0; j < ra.length; j++) {
            for (let i = 0; i < ra[j].length; i++) {
                positionStart = 0 + (i * queryLength); // TODO: 0 is hardcoded currently for rotNumber
                let exists = index.findIndex(matchesKmer, ra[j][i]);
                if (exists < 1) {
                    index.push( { k: ra[j][i], d: [[i_main, 1 , [[positionStart, strand]]]] }) 
                } else {
                    let match = -1;
                    for (let l = 0; l < index[exists].d.length; l++) {
                        if (i_main === index[exists].d[l][0]) {
                            match = l;
                        }
                    }
                    if (match < 0) {
                        index[exists].d.push([i_main, 1, [[positionStart, strand]] ]);                   
                    } else {
                        index[exists].d[match][1] += 1;
                        index[exists].d[match][2].push([positionStart, strand]); 
                    }    
                }  
            }    
        }
        i_main === arrayLength - 1 && revComp === true ? index.push({ organisms: organisms, sequence_count: arrayLength }): null;
        indexStopwatch.stop();
        let minutes = Math.floor(indexStopwatch.elapsed.minutes);
        let seconds = indexStopwatch.elapsed.seconds % 60; 
        this.setState({ indexes: index });
        return { minutes, seconds }          
    }

    createRotations(seqArr) {
        let prev = '';
        let rotationArr = [];
        let ql = seqArr[0].length;

        rotationArr[0] = seqArr;
        for (let i = 1; i < ql; i++) {
            rotationArr[i] = [];
            prev = '';
            for (let j = 0; j < seqArr.length - 1; j++) {
                let current = seqArr[j].slice(0, ql-i);
                rotationArr[i][j] = `${prev}${current}`
                prev = seqArr[j].slice(ql-i, ql);
              }      
            }
        return rotationArr;
    }

    tokeniseSequence(s) {
        let tok = s.replace('/,/g' , '')
        let tokArray = tok.match(/.{1,7}/g);
        return tokArray;
    }

    getSequenceLengths(sa) {
        let sequenceLengths = [];
        sa.forEach(function(element) {
            sequenceLengths.push(element.length);  
        });
        return sequenceLengths;
    }

    createComplementStrand(sequence) {
        console.log(this.state.reverseComplement);
        let complement = dna.complStrand(sequence, true);
        return complement;
    }

    proccessRegex(regex, input, organism = false) {
        let matches, output = [];
        while (matches = regex.exec(input)) {
            if (matches.length > 4)
            {
                let whitespaceRemoved = matches[4].split('\n').map(Function.prototype.call, String.prototype.trim).join(' ');
                output.push({ strand: matches[1], sPos: parseInt(matches[2]), ePos: parseInt(matches[3]), product: whitespaceRemoved, organism: organism });
            }
            else
            {
                let whitespaceRemoved = matches[1].split('\n').map(Function.prototype.call, String.prototype.trim).join(' ');
                output.push(whitespaceRemoved);
            }
        }
        return output;
    }

    processAnnotations(annotations) {
        let genesProducts = []; 
        let organisms = [];
        for (let i = 0; i < annotations.length; i++) {
            let organism = this.proccessRegex(/organism=\"(.+)\"/gi, annotations[i])[0];
            organisms.push(organism);
            // let complementGene = this.proccessRegex(/gene\s+complement\((\d+)[.]+(\d+)\)/gi, annotations[0]);
            // let gene = this.proccessRegex(/gene\s+(\d+)[.]+(\d+)/gi, annotations[0]);
            // let product = this.proccessRegex(/product=\"(.+?[\n]?.+?)\"/gi, annotations[0]);
            genesProducts = genesProducts.concat(this.proccessRegex(/gene\s+((?:complement)?)\(?(\d+)\.+(\d+)\)?(?:\s|\S)*?product=\"(.+?[\n]?.+?)\"/gi, annotations[i], organism));
        }
        return { genesProducts, organisms };
    }

    processSequences(sequenceArray, sequenceLengths, ant, revComp) {
        let indexTimes = { minutes: 0, seconds: 0 };
        for (let i = 0; i < sequenceArray.length; i++) {
          let ta = this.tokeniseSequence(sequenceArray[i]);
          let ra = this.createRotations(ta);
          let timer = this.createIndex(ra, i, sequenceArray.length, sequenceLengths, ant.organisms, revComp); // sets index in state and returns indexStopwatch result
          indexTimes.minutes += timer.minutes;
          indexTimes.seconds += timer.seconds;
        }
        return indexTimes;
    }

    getPerformanceStats() {
        
    }
        
    indexMain() {
        let ant = this.processAnnotations(this.state.annotations);
        this.postAnnotations(ant.genesProducts);
        let sa = this.state.sequences;
        let rcsa = this.state.reverseComplement;
        let sequenceLengths = this.getSequenceLengths(sa);
        let indexTimesTemplate = this.processSequences(sa, sequenceLengths, ant, false);
        let indexTimesComplementary = this.processSequences(rcsa, sequenceLengths, ant, true);
        let indexTimes = this.addTimes(indexTimesTemplate, indexTimesComplementary);
        this.setState({ indexTime: indexTimes });
        let tempArray = this.state.indexes;
        tempArray.push({ seqLen: sequenceLengths });
        this.setState({ indexes: tempArray });      
        let indexTimer  = document.getElementById('index-timer');
        this.displayTimer(indexTimes, indexTimer);
        document.getElementById('loader').style.display = 'none'; 
    }

    createIndexSpinner() {
        // this.getPerformanceStats();
        document.getElementById('loader').style.display = '';
        // Give the display some time to update before doing the main workload
        setTimeout(this.indexMain, 500);
    }

    showGeneProducts() {
        // document.getElementById('products-table').style.display = 'grid';
        //document.getElementsByClassName('products-table-complementary').style.display = 'grid';
        let list = document.getElementsByClassName('products-table');
        for (var i = 0; i < list.length; i++) {
            list[i].style.display='';
        }
    }

    hideEval() {
        document.getElementById('hide-eval').style.display = 'none';
        document.getElementById('eval').style.display = '';
        document.getElementById('evaluation').style.display = 'none'; 
    }

    evaluateResults() {
        document.getElementById('results-list').style.display = 'none';
        document.getElementById('evaluation').style.display = 'grid'; 
        document.getElementById('eval').style.display = 'none'; 
        document.getElementById('hide-eval').style.display = '';
    }

    newQuery() {
        document.getElementById('queryInput').style.display = 'grid'; 
        document.getElementById('querySeq').style.display = 'none'; 
        document.getElementById('submit-button').style.display = 'grid';
        document.getElementById('new-query-button').style.display = 'none';
        document.getElementById('search-timer').style.display = 'none';
        document.getElementById('results-list').style.display = 'none';                    
    }

    saveSequence() {
        let fileContentsSeq = document.getElementById('file-contents-seq').value;
        let fileContentsAnn = document.getElementById('file-contents-ann').value;
        this.setState({ sequences: [...this.state.sequences, fileContentsSeq] });
        this.setState({ annotations: [...this.state.annotations, fileContentsAnn]});
        let reverseComplement = this.createComplementStrand(fileContentsSeq);
        this.setState({ reverseComplement: [...this.state.reverseComplement, reverseComplement]});
    }

    uploadFilesPage() {
        document.getElementById('file-uploads').style.display = 'grid';
        document.getElementById('back-btn').style.display = 'grid'; 
        document.getElementById('upload-files-btn').style.display = 'none'; 
        document.getElementById('indexing-querying').style.display = 'none';
        document.getElementById('results').style.display = 'none';
    }

    back() {
        document.getElementById('back-btn').style.display = 'none'; 
        document.getElementById('file-uploads').style.display = 'none';
        document.getElementById('upload-files-btn').style.display = 'grid';
        document.getElementById('indexing-querying').style.display = 'grid';
        document.getElementById('results').style.display = 'grid';
    }

    render() {
      return (
          <div style={{ textAlign: 'center' }}>
            <div style={{display: 'inlineBlock'}} className="background">
                <div className="upload-back">
                  <button  className='buttn' id="upload-files-btn" style={{ float: 'left', marginTop: '20px', marginLeft: '20px' }} onClick={ this.uploadFilesPage }>Upload File/s</button>
                  <button className='buttn' id="back-btn" style={{ float: 'left', marginTop: '20px', marginLeft: '20px', display: 'none' }} onClick={ this.back }>Back</button>
                </div>

                <div className="file-uploads" id="file-uploads" style={{ paddingTop: '30px', paddingLeft: '50px', textAlign: 'left', display: 'none' }}> 
                        <div className="seq-up" style={{ float: 'left', paddingLeft: '50px' }} className="uploaded-sequence" id="uploaded-sequence">
                            <textarea className="text-area" placeholder="Copy/Paste sequence or upload a text file" name="sequence" value={ this.state.sequence } onChange={ this.handleChange } id="file-contents-seq"></textarea>
                            <br/>
                        <div id="input-files">
                            <input style={{ marginTop: '20px', float: 'left' }} type="file" id="seq-input" className='buttn'/>
                            <br/><br/>
                            <label id="not-supported-seq"/>
                        </div> 
                    </div>

                    <div className="annotations-up">
                        <textarea className="text-area" placeholder="Copy/Paste annotations or upload a text file" name="annotation" value={ this.state.annotation } onChange={ this.handleChange } id="file-contents-ann"></textarea>
                        <div id="input-annotations">
                            <input style={{ marginTop: '20px', float: 'left' }} type="file" id="ann-input" className='buttn'/>
                            <br/><br/>
                            <label id="not-supported-ann"/>
                        </div> 
                    </div>

                    <div id="submit">
                        <button onClick={ this.saveSequence } style={{ marginTop: '20px', marginLeft: '50px' }} className='buttn'>Submit</button>
                    </div>
                </div>

                <div className="indexing-querying" id="indexing-querying"> 
                    <div className="indexing">
                        <h2 className="heading">Indexing</h2><br/><br/>
                        <button className='buttn' id="mainBttn" onClick={ this.createIndexSpinner }><i id="loader" className="loader" style={{ display: 'none', float: 'right' }}></i>Create Index &nbsp;</button>
                        <label style={{ paddingLeft: '40px' }} id="index-timer"></label>
                        <br/><br/><br/>
                        <button className='buttn' id="post-data-button" onClick={ this.postData }>Post Index to Database</button>
                        <br/><br/><br/>
                        <button className='buttn' id="clear-data-button" onClick={ this.cleardb }>Clear Database</button>
                        <br/><br/><br/>
                    </div>

                    <div className="querying">
                        <h2 className="heading">Querying</h2><br/><br/>
                        <textarea placeholder="Enter sequences with a length of 7 bases, separated by a space (eg. AATTCAG GCGCTTA AATTCAG)" type="text" id='queryInput' name="querySeq" onChange={ this.handleChange } value={ this.state.querySeq } style={{float: 'left', height: '100px', width: '400px'}}></textarea>
                        <label id="querySeq" style={{float: 'left', textAlign: 'left', width: '380px', wordBreak: 'break-all', wordWrap: 'break-word', display: 'none'}}>{ this.state.querySeq }</label>
                        <br/><br/><br/><br/><br/><br/>
                        <button className="buttn" id="new-query-button" style={{float: 'right', marginTop: '20px', display: 'none'}} onClick={ this.newQuery }>New Query</button>
                        <button className="buttn" id="submit-button" style={{float: 'left', marginTop: '20px'}} onClick={ this.searchMain }>Submit Query</button>
                        <div id="search-timer" style={{ display: 'none' }}>
                            <SearchTimer timer={ this.state.searchTime } />  
                        </div>                  
                    </div>
                </div>

                <div id="results" className="results" style={{textAlign: 'left', width: '1100px', margin: 'auto'}}>
                <h2 className="heading">Results</h2>
                    <button className='buttn' onClick={ this.onPrint } style={{ marginBottom: '40px', marginTop: '20px', width: '70px' }}>Print</button>
                    <button id="eval" className='buttn' onClick={ this.evaluateResults } style={{ marginBottom: '40px', marginTop: '20px', marginLeft: '20px', width: '150px' }}>Evaluate Results</button>
                    <button id="hide-eval" className='buttn' onClick={ this.hideEval } style={{ marginBottom: '40px', marginTop: '20px', marginLeft: '20px', display: 'none', width: '150px' }}>Hide Evaluation</button>
                    <button className='buttn' onClick={ this.showGeneProducts } style={{ marginBottom: '40px', marginTop: '20px', marginLeft: '20px', width: '200px' }}>Show Gene Products</button>
                    <div id="results-list">
                        <ResultList results={ this.state.results } />
                    </div>
                    <div id="evaluation" style={{ display: 'none' }}>
                        <Evaluation searchTime={ this.state.searchTime } indexTime={ this.state.indexTime }/>
                    </div>
                </div>
            </div>
        </div>
    )}
}

export default App;