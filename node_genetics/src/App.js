import React, { Component } from 'react';
import './style.css';
import ResultList from './components/resultList';
import SearchTimer from './components/searchTimer'
let Stopwatch = require("node-stopwatch").Stopwatch;
let Client = require('node-rest-client').Client;

let indexStopwatch = Stopwatch.create();
// let searchStopwatch = Stopwatch.create();

function matchesKmer(element, index, array){
    if (element.k === this) {
        return index;
    }
}

function initElement(elem) {
    elem.push({ kmer: ['', 0, []] })
};

function sortResults(sortingArray) {
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

function initVectors(queryTokens, uninvertedList) {
    let vectors = [];
    for (let i = 0; i < uninvertedList.length; i++) {
        vectors.push([]);
        let k = 0;
        for (let j = 1; k < queryTokens.length; j++) {
            if (queryTokens[k] === uninvertedList[i][j].kmer[0]) {
                vectors[i].push({ kmer: queryTokens[k], tf: uninvertedList[i][j].kmer[1] });
                k++
                k === queryTokens.length ? j = uninvertedList.length : j = 0;
            } else if (j === uninvertedList[i].length - 1) {
                vectors[i].push({ kmer: queryTokens[k], tf: 0, tfidf: 0 });
                j = 0
                k++
            }
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
        let documentTfidf = [];
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

// workaround: 'this' was not available inside client
function rankResults(results, seqLen) {
    endSearchTime();
    let uninvertedList = uninvertList(results);
    let queryTokens = this.tokeniseQuery(this.state.querySeq);
    let vectors = initVectors(queryTokens, uninvertedList);
    let vectorsWithStats = getStats(vectors, seqLen);
    let vectorsWithCosSim = calculateCosineSimilarity(vectorsWithStats);
    console.log(vectorsWithCosSim);
    let sortedList = sortResults(vectorsWithCosSim);
    this.setState({sortedList: sortedList});
}

// workaround: 'this' was not available inside client
function uninvertList(results) {
    let uninvertedList = [];
    if (results.length > 0) {
        results.forEach(function(element) {
        
            for (let i = 0; i < element.d.length; i++) {
                let docNo = element.d[i][0];
                uninvertedList[docNo] ? null : uninvertedList.push( [docNo] );
            }

            for (let j = 0; j < element.d.length; j++) {
            
                for (let k = 0; k < uninvertedList.length; k++) {
                    if (uninvertedList[k][0] === element.d[j][0]) {
                        initElement(uninvertedList[k]);
                        uninvertedList[k][uninvertedList[k].length-1].kmer[0] = element.k;
                        uninvertedList[k][uninvertedList[k].length-1].kmer[1] = element.d[j][1];
                        uninvertedList[k][uninvertedList[k].length-1].kmer[2] = element.d[j][2];
                    }
                }
            };
        })
       return uninvertedList;
    }
}

window.onload = function() {
    let fileInput = document.getElementById('fileInput');
    let fileContents = document.getElementById('file-contents');
    let notSupported = document.getElementById('not-supported');
    
    fileInput.addEventListener('change', function(e) {
        var file = fileInput.files[0];
        var textType = /text.*/;
        if (file.type.match(textType)) {
            var reader = new FileReader();
            reader.onload = function(e) {
              fileContents.value = reader.result;
            }
            reader.readAsText(file);
        } else {
            notSupported.innerText = "File not supported!"
        }
    });
}


class App extends Component {
    constructor(props) {
        super(props);
      
        this.state = {
            sequence: [],
            sequences: [],
            querySeq: [],
            indexes: [], 
            searchTimeStart: 0,
            searchTime: 0,
            sortedList: []
        }

        endSearchTime = endSearchTime.bind(this);
        rankResults = rankResults.bind(this); 
        this.searchIndex = this.searchIndex.bind(this);        
        this.submitSequence = this.submitSequence.bind(this);
        this.searchMain = this.searchMain.bind(this);        
        this.postData = this.postData.bind(this);        
        this.indexMain = this.indexMain.bind(this);        
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
          let seqLen = results.pop();
          rankResults(results, seqLen);
          uninvertList(results);
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
        this.setState({ searchTimeStart: startSearchTime })
        this.postSearchQuery(tokensArray);
    }

    submitSequence() {
        let seqInput = document.getElementById('queryInput').value;
        document.getElementById('queryInput').style.display = 'none'; 
        document.getElementById('querySeq').style.display = 'block'; 
        document.getElementById('submitButton').style.display = 'none';
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
      
    createIndex(ra, i_main, sequenceLengths) {
        indexStopwatch.start();
        let queryLength = ra.length;
        let positionStart;
        let index = this.state.indexes;
        for (let j = 0; j < ra.length; j++) {
            for (let i = 0; i < ra[j].length; i++) {
                positionStart = 0 + (i * queryLength); // TODO: 0 is hardcoded currently for rotNumber
                let exists = index.findIndex(matchesKmer, ra[j][i]);
                if (exists < 1) {
                    index.push( { k: ra[j][i], d: [[i_main,1,[positionStart]]] }) 
                } else {
                    i_main === index[exists].d[index[exists].d.length - 1][0] ? null : index[exists].d.push([i_main,0,[]]);                   
                    index[exists].d[index[exists].d.length - 1][1] += 1;
                    index[exists].d[index[exists].d.length - 1][2].push(positionStart); 
                }  
            }    
        }
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
        
    indexMain() {        
    document.getElementById('loader').style.display = 'grid';
      let sa;
      let indexTimes = { minutes: 0, seconds: 0 };
      sa = this.state.sequences;
      let sequenceLengths = this.getSequenceLengths(sa);
      for (let i = 0; i < sa.length; i++) {
        let ta = this.tokeniseSequence(sa[i]);
        let ra = this.createRotations(ta);
        let timer = this.createIndex(ra, i, sequenceLengths); // sets index in state and returns indexStopwatch result
        indexTimes.minutes += timer.minutes;
        indexTimes.seconds += timer.seconds;
      }
      let tempArray = this.state.indexes;
      tempArray.push({ seqLen: sequenceLengths });
      this.setState({ indexes: tempArray });      
      let indexTimer  = document.getElementById('index-timer');
      this.displayTimer(indexTimes, indexTimer);
      document.getElementById('loader').style.display = 'none'; 
    }

    newQuery() {
        document.getElementById('queryInput').style.display = 'grid'; 
        document.getElementById('querySeq').style.display = 'none'; 
        document.getElementById('submitButton').style.display = 'grid';
        document.getElementById('new-query-button').style.display = 'none';
        document.getElementById('search-timer').style.display = 'none';
        document.getElementById('results-list').style.display = 'none';                    
    }

    saveSequence() {
        let fileContents = document.getElementById('file-contents').value;
        this.setState({ sequences: [...this.state.sequences, fileContents] });
    }

    uploadFilesPage() {
        document.getElementById('file-uploads').style.display = 'grid';
        document.getElementById('back-btn').style.display = 'grid'; 
        document.getElementById('upload-files-btn').style.display = 'none'; 
        document.getElementById('indexing-querying').style.display = 'none';
    }

    back() {
        document.getElementById('back-btn').style.display = 'none'; 
        document.getElementById('file-uploads').style.display = 'none';
        document.getElementById('upload-files-btn').style.display = 'grid';
        document.getElementById('indexing-querying').style.display = 'grid';
    }

    render() {
      return (
          <div style={{ textAlign: 'center' }}>
            <div style={{display: 'inlineBlock'}} className="background">
                <div className="upload-back">
                  <button  className='buttn' id="upload-files-btn" style={{ float: 'left', marginTop: '20px', marginLeft: '20px' }} onClick={ this.uploadFilesPage }>Upload File/s</button>
                  <button className='buttn' id="back-btn" style={{ float: 'left', marginTop: '20px', marginLeft: '20px', display: 'none' }} onClick={ this.back }>Back</button>
                </div>

                <div id="file-uploads" style={{ paddingTop: '80px', paddingLeft: '50px', textAlign: 'left', display: 'none' }}> 
                    <div className="input-files">
                        <input type="file" id="fileInput" className='buttn'/>
                    </div> 

                    <div style={{ float: 'left', paddingLeft: '50px' }} className="uploaded-sequence" id="uploaded-sequence">
                        <br/><br/>    
                        <label style={{ textAlign: 'left' }}>File Contents:</label>
                        <br/><br/>
                        <label id="not-supported"/>
                        <br/>
                        <textarea name="sequence" value={ this.state.sequence } onChange={ this.handleChange } id="file-contents" style={{height: '500px', float: 'left', textAlign: 'left', width: '600px', wordBreak: 'break-all', wordWrap: 'break-word'}}></textarea>
                        <br/>
                    </div>

                    <div>
                    <button onClick={ this.saveSequence } style={{ marginTop: '20px', float: 'left', marginLeft: '50px' }} className='buttn'>Submit</button>
                    </div>
                </div>

                <div className="indexing-querying" id="indexing-querying"> 
                    <div className="indexing">
                        <h2 className="heading">Indexing</h2><br/><br/>
                        <button className='buttn' id="mainBttn" onClick={ this.indexMain }><i id="loader" className="loader" style={{ display: 'none', float: 'right' }}></i>Create Index &nbsp;</button>
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
                        <br/><br/><br/>
                        <button className="buttn" id="new-query-button" style={{float: 'right', marginTop: '20px', display: 'none'}} onClick={this.newQuery}>New Query</button>
                        <button className="buttn" id="submitButton" style={{float: 'left', marginTop: '20px'}} onClick={this.searchMain}>Submit Query</button>
                        <div id="search-timer" style={{ display: 'none' }}>
                            <SearchTimer timer={ this.state.searchTime } />  
                        </div>                  
                        <div id="results-list" style={{paddingTop: '100px'}}>
                            <ResultList results={ this.state.sortedList } />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )}
}

export default App;