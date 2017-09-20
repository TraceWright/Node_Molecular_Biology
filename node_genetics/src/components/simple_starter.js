import React, { Component } from 'react';
import '../App.css';
import * as fs from 'browserify-fs';

function clearTextarea() {
    document.getElementById('seqInput').value = "";  
}

function matchesExistingKmer(element, index, array){
    console.log(this);
  return element.k === this;
}

export class simple_starter extends Component {
    constructor(props) {
        super(props);
      
        this.state = {
          seq: [],
          rotArr: [], 
          sequences: [],
          indexes: []
        }
    
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
                    console.log(element);
                    newState.push(JSON.parse(data));
                });
            });
        });
        this.setState({ indexes: newState });
      }

      takeSequences() {
        let newState = [];
        fs.readdir('/home', function(e,f) {
            f.forEach(function(element) {
                fs.readFile(`/home/${element}`, 'utf-8', function(err, data) {
                    newState.push(data);
                });
            });
        });
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
        let sep;
        let prev;
        let rotationArr = [];
        let regexArray = [];
        rotationArr[0] = seqArr;
        regexArray[1] = /.{1,3}/g;
        regexArray[2] = /.{2,2}/g;
        regexArray[3] = /.{1}/g;
        for (let i = 1; i < 4; i++) {
          rotationArr[i] = [];
          for (let j = 0; j < seqArr.length - 1; j++) {
            sep = '';
            sep = seqArr[j].match(regexArray[i]);
            if (i < 3) {
              if (j > 0) {
                rotationArr[i][j] = prev + sep[0];
                prev = sep[1];
              }
              else { 
                rotationArr[i][j] = sep[0]; 
                prev = sep[1];
              }
            } else {
              j > 0 ? rotationArr[i][j] = prev + sep[0] : rotationArr[i][j] = sep[0]; // TODO: Add last element to 4th rotation for full coverage
              prev = sep[1] + sep[2] + sep[3];
            }      
          }
        }
        this.setState({ rotArr: rotationArr });
      }
    
      tokeniseSequence() {
        let s = this.state.sequences[0];
        console.log(s);
        let seq = s.replace('/,/g' , '')
        let seqArray = seq.match(/.{1,4}/g);
        this.createRotations(seqArray);
      }

      createIndex() {
        let indDirContents  = document.getElementById('index-dir-content');
        

        fs.mkdir('/index', function() {
            fs.readdir('/index', function(e, f) {
              let fileList = f.toString().split(',').join('\r\n');
              indDirContents.innerText = fileList;
            });
          });

        let rotations = this.state.rotArr // link to createRotations
        let queryLength = rotations.length;

        let positionStart;
        let index = [{ k: rotations[0][0], d: [[1,1,[1]]]  }]; // d: documentNumber, termFrequency, termPosition[]
        for (let i = 1; i < rotations[0].length; i++) {
            positionStart = 0 + (i * queryLength); // 0 is hardcoded currently for docNumber
            let exists = index.findIndex(matchesExistingKmer, rotations[0][i]);
            if (exists < 1) {
                index.push( { k: rotations[0][i], d: [[1,1,[positionStart]]] })
            } else {
                // add document number
                index[exists].d[0][1] += 1;
                index[exists].d[0][2].push(positionStart);  //fix positioning
            }  
        }
            console.log(JSON.stringify(index))
        fs.writeFile(`/index/index_1`, JSON.stringify(index), function(err) {
            if (err) {
                console.log('Error: ' + err)
            } else {
                console.log(`index_1 saved`)
            }
        } )         
      }

      accessIndexes() {
          console.log(this.state.indexes)
      }
      
      searchIndex() {
        let matchArray = [];
    
        for (let i = 0; i < this.state.rotArr.length; i++) {
          for (let j = 0; j < this.state.rotArr[i].length; j++) {
            this.state.rotArr[i][j] === this.state.seq ? matchArray.push({ rotation: i, position: j }) : null ;
          }
        }
        let saStartPos = this.calcRelativePosition(matchArray);
        let saPos = this.extendMatchArr(saStartPos);
        this.highlightMatches(saPos);
      }     
    
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
              <button className='bttn' id="tokeniseSequence" onClick={ this.tokeniseSequence }>Tokenise Sequence</button>
              <br/><br/><br/>
              <button className='bttn' id="createIndexButton" onClick={ this.createIndex }>Create Index</button>
              <br/><br/><br/>
              <button className='bttn' id="getIndexButton" onClick={ this.getIndex }>Get Index</button>
              <br/><br/><br/>
              <button className='bttn' id="accessIndexButton" onClick={ this.accessIndexes }>Access Index</button>
              <br/><br/><br/>
              <div className="index-dir-contents">
                <label>/index directory contents:</label>
                <div style={{paddingLeft: '50px', paddingTop: '10px'}} id="index-dir-content"></div>
              </div>
              <label>Result Sequence:</label>
              <br/><br/>
              <label id="resultDisplayArea" style={{float: 'left', textAlign: 'left', width: '600px', wordBreak: 'break-all', wordWrap: 'break-word'}}></label>
              </div>
            </div>
          </div>
        </div>
        );
    }
}