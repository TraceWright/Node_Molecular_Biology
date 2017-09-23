import React, { Component } from 'react';
import '../App.css';
import * as fs from 'browserify-fs';
var Client = require('node-rest-client').Client;




function clearTextarea() {
    document.getElementById('seqInput').value = "";  
}

function matchesKmer(element, index, array){
    if (element.k === this) {
        return index;
    }
}

function download(text, name, type) {
    var a = document.createElement("a");
    var file = new Blob([text], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}


export class simple_starter extends Component {
    constructor(props) {
        super(props);
      
        this.state = {
          seq: [],
          rotArr: [], 
          sequences: [],
          indexes: [],
          srcFileNames: []
        }
    
        this.postData = this.postData.bind(this);
        this.indexCreationMain = this.indexCreationMain.bind(this);
        this.accessIndexes = this.accessIndexes.bind(this);                
        this.getIndex = this.getIndex.bind(this);        
        this.createIndex = this.createIndex.bind(this);
        this.takeSequences = this.takeSequences.bind(this);
        this.searchIndex = this.searchIndex.bind(this);
        this.tokeniseSequence = this.tokeniseSequence.bind(this);
        this.createRotations = this.createRotations.bind(this);
        this.submitSequence = this.submitSequence.bind(this);
        this.handleChange = this.handleChange.bind(this); 
      }

      postData() {
        console.log(this.state.indexes)
        let jsonIndex = JSON.stringify(this.state.indexes)
        var client = new Client();
        var args = {
          data: { test: jsonIndex },
          headers: { "Content-Type": "application/json" },
          body: this.state.index
        };
        
      client.post("http://localhost:4000/index", args, function (data, response) {
        // parsed response body as js object 
        console.log("hello");
        // raw response 
        console.log(response);
      });
      
      }
    
      handleChange({ target }) {
        this.setState({
            [target.name]: target.value
          });
      }

      getIndex() {
        let newState = [];
        fs.readdir('/index', function(e,f) {
            f.forEach(function(element) {
                fs.readFile(`/index/${element}`, 'utf-8', function(err, data) {
                    newState.push(JSON.parse(data));
                });
            });
        });
        // this.setState({ indexes: newState });
      }

      takeSequences() {
        let newState = [];
        let fileNames = [];
        fs.readdir('/home', function(e,f) {
            f.forEach(function(element) {
                fs.readFile(`/home/${element}`, 'utf-8', function(err, data) {
                    fileNames.push(element);
                    newState.push(data);
                });
            });
        });
        this.setState({ srcFileNames: fileNames });
        this.setState({ sequences: newState });
      }
    
      submitSequence() {
        let seqInput = document.getElementById('queryInput').value;
        let charArray = [];
        charArray = seqInput.split('')
        let charOutput = '';
        let charLength = charArray.length;
        for(let i=0; i < charLength; i+=100) {
          if(i+100 < charLength) {
            charOutput += charArray.slice(i,i+100).join("");
            charOutput += '\n----\n';
          }
          else {
            charOutput += charArray.slice(i,charLength).join("");
          }
        }
        this.setState({ seq: charOutput })
        document.getElementById('queryInput').style.display = 'none'; 
        document.getElementById('queryDisplay').style.display = 'block'; 
        document.getElementById('submitButton').style.display = 'none';
        document.getElementById('clearButton').style.display = 'none';
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

      createIndexBrowserLocation() {
        let indDirContents  = document.getElementById('index-dir-content');
        

        fs.mkdir('/index', function() {
            fs.readdir('/index', function(e, f) {
              let fileList = f.toString().split(',').join('\r\n');
              indDirContents.innerText = fileList;
            });
          });
      }

      createIndex(ra, i_main) {
          // initialise index directory in browser file system
        this.createIndexBrowserLocation();
        let queryLength = ra.length;

        let positionStart;
        let index = this.state.indexes;
        for (let j = 0; j < ra.length; j++) {
            for (let i = 0; i < ra[j].length; i++) {
                positionStart = 0 + (i * queryLength); // 0 is hardcoded currently for rotNumber
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

        this.setState({ indexes: index });
        console.log('index created')
      }

      accessIndexes() {
          // console.log(this.state.indexes)

        let jsonIndex = JSON.stringify(this.state.indexes)
        fs.writeFile(`/index/index_1`, jsonIndex, function(err) {
            if (err) {
                console.log('Error: ' + err)
            } else {
                console.log(`index_1 saved`)
                download(jsonIndex, 'test.txt', 'text/plain');
            }
        } ) 
      }

      indexCreationMain() {
        let sa = this.state.sequences;
          for (let i = 0; i < sa.length; i++) {
            let ta = this.tokeniseSequence(sa[i]);
            let ra = this.createRotations(ta);
            this.createIndex(ra, i);
          }
      } 

      calculateIDF(n, corpusLen) {
        return Math.log10(corpusLen / n);
      }

      calculateTFIDF(tf, idf) {
          return tf * idf;
      }

      searchIndex() {
        let q = this.state.seq;
        let s = this.state.indexes;
        let match = s.findIndex(matchesKmer, q);
        if (match < 1) {
            // no match
        } else {
            let n = s[match].d.length;
            let corpusLen = this.state.sequences.length;
            let idf = this.calculateIDF(n, corpusLen);
            let tf = s[match].d[0][1] // hardcoded 0 does first document only
            let tfidf = this.calculateTFIDF(tf, idf);
        }
        
      }
      
    //   searchIndex() {
    //     let matchArray = [];
    
    //     for (let i = 0; i < this.state.rotArr.length; i++) {
    //       for (let j = 0; j < this.state.rotArr[i].length; j++) {
    //         this.state.rotArr[i][j] === this.state.seq ? matchArray.push({ rotation: i, position: j }) : null ;
    //       }
    //     }
    //     let saStartPos = this.calcRelativePosition(matchArray);
    //     let saPos = this.extendMatchArr(saStartPos);
    //     this.highlightMatches(saPos);
    //   }     
    
      calcRelativePosition(matches) {
        let saStartPos = [];
        for (let i = 0; i < matches.length; i++) {
          saStartPos.push(4 - matches[i].rotation + (4 * matches[i].position) - 4);
        }
        return saStartPos;
      }
    
      highlightMatches(saPos) {
        let seq = document.getElementById('fileDisplayArea').textContent;
        let target = document.getElementById('resultDisplayArea');
        for (let i = 0; i < seq.length; i++) {
          var elem = document.createElement('span'),
          text = document.createTextNode(seq[i]);
      elem.appendChild(text);
    
      if (saPos.indexOf(i) > -1) {
          elem.style.color = 'red'
          elem.style.fontWeight = 'bold'
      } else {
          elem.style.color = 'black'
      }
      target.appendChild(elem);
      }
    }
    
    extendMatchArr(saStartPos) {
      let positionsArray = [];
      saStartPos.forEach(function(element) {
        for (let i = 0; i < 4; i++) {  
          positionsArray.push(element + i);
        }
      }, this);
      return positionsArray;
    }
  render() {
    return (
        <div style={{display: 'inlineBlock'}}>
          <div className="geneProcesser">
            <div className="query">
              <div className="queryInput">
                <h3 style={{textAlign: 'left'}}>Query Sequence</h3><br/><br/>
                <textarea placeholder="Enter a 4 base sequence (eg. AATT)" type="text" id='queryInput' name="seq" onChange={ this.handleChange } value={ this.state.seq } style={{float: 'left', height: '100px', width: '400px'}}></textarea>
                <button id="submitButton" style={{float: 'left', marginTop: '20px'}} onClick={this.submitSequence}>Submit Query</button>
                <button id="clearButton" style={{ marginTop: '20px'}} onClick={clearTextarea}>Clear Input</button>
              </div>
              <div className="queryDisplay" id="queryDisplay" style={{display: 'none'}}>
                <label id="querySeq" style={{float: 'left', textAlign: 'left', width: '200px', wordBreak: 'break-all', wordWrap: 'break-word'}}>{ this.state.seq }</label>
                <br/><br/><br/>
                <button onClick={ this.searchIndex } style={{float: 'left', textAlign: 'left'}}>Search</button>
              </div>
            </div>
            <div className="search" style={{}}>
              <h3>Search Sequence</h3><br/><br/>
              <div className="searchQueryInput" id="searchQueryInput">
              <br/><br/><br/>
              <button className='bttn' id="saveFiles" onClick={ this.takeSequences }>Save Uploaded Sequence/s to SS Search State</button>
              <br/><br/><br/>
              <button className='bttn' id="indexCreationMainBttn" onClick={ this.indexCreationMain }>Main</button>
              <br/><br/><br/>
              {/* <button className='bttn' id="createIndexButton" onClick={ this.createIndex }>Create Index</button>
              <br/><br/><br/> */}
              <button className='bttn' id="getIndexButton" onClick={ this.postData }>Post Data</button>
              <br/><br/><br/>
              <button className='bttn' id="accessIndexButton" onClick={ this.accessIndexes }>Access Index</button>
              <br/><br/><br/>
              <div className="index-dir-contents">
                <label>/index directory contents:</label>
                <div style={{paddingLeft: '50px', paddingTop: '10px'}} id="index-dir-content"></div>
              </div>
              {/* <label>Result Sequence:</label> */}
              <br/><br/>
              <label id="resultDisplayArea" style={{float: 'left', textAlign: 'left', width: '600px', wordBreak: 'break-all', wordWrap: 'break-word'}}></label>
              </div>
            </div>
          </div>
        </div>
        );
    }
}