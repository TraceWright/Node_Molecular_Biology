import React, { Component } from 'react';
import './App.css';
import * as SW from 'igenius-smith-waterman';

function smith_waterman() {
  let seq1 = 'AAAATTTAAGAAAGATGGAGTAAATTTATGTCGGAAAAAGAAATTTGAGT';
  let seq2 = 'AAAATTTAAGAAAGATGGAGTAAATTTAAGATGGAGTAAATTTATGTCGGAAAAAGAAATTTGAGT';
  let gss = function (i) {
    return -i;
  };
  let simfunc = function (a, b) {
    if (a === b) {
      return 2;
    } else {
      return -1;
    }
  };
  SW.align(seq1, seq2, gss, simfunc)
}

function clearTextarea() {
  document.getElementById('seqInput').value = "";  
}

window.onload = function() {
  var fileInput = document.getElementById('fileInput');
  var fileDisplayArea = document.getElementById('fileDisplayArea');
  fileInput.addEventListener('change', function(e) {
      var file = fileInput.files[0];
      var textType = /text.*/;
      if (file.type.match(textType)) {
          var reader = new FileReader();
          reader.onload = function(e) {
            // let sArr = [];
            // sArr = reader.result.split('')
            // // console.log(sArr);
            // fileDisplayArea.innerText = sArr;  //TODO: remove commas
            fileDisplayArea.innerText = reader.result;
          }
          reader.readAsText(file);    
      } else {
          fileDisplayArea.innerText = "File not supported!"
      }
  });
}

class App extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      seq: [],
      seqIndex: []
    }

    this.searchIndex = this.searchIndex.bind(this);
    this.tokeniseSequence = this.tokeniseSequence.bind(this);
    this.createRotations = this.createRotations.bind(this);
    // this.newSequence = this.newSequence.bind(this);    
    this.submitSequence = this.submitSequence.bind(this);
    this.handleChange = this.handleChange.bind(this); 
  }

  handleChange({ target }) {
    this.setState({
        [target.name]: target.value
      });
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
    document.getElementById('label3').style.display = 'none';
    // document.getElementById('searchQueryInput').style.display = 'none';
    // document.getElementById('searchSeqDisplay').style.display = 'block';  
  }

  // newSequence() {
  //   this.setState({ seq: '' })
  //   document.getElementById('queryInput').style.display = 'block'; 
  //   document.getElementById('submitButton').style.display = 'block';
  //   document.getElementById('clearButton').style.display = 'block';        
  //   document.getElementById('queryDisplay').style.display = 'none'; 
  //   document.getElementById('searchQueryInput').style.display = 'block';
  //   document.getElementById('searchSeqDisplay').style.display = 'none'; 
  // }

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
    this.setState({ seqIndex: rotationArr });
  }

  tokeniseSequence() {
    let s = document.getElementById('fileDisplayArea').textContent;
    console.log(s);
    let seq = s.replace('/,/g' , '')
    console.log(seq);
    let seqArray = seq.match(/.{1,4}/g); // TODO: dynamically create subsequences of the same length as the query
    // console.log(seqArray);
    this.createRotations(seqArray);
  }
  
  searchIndex() {
    console.log( this.state.seqIndex );
    // console.log( this.state.seq )
    let matchArray = [];

    for (let i = 0; i < this.state.seqIndex.length; i++) {
      for (let j = 0; j < this.state.seqIndex[i].length; j++) {
        this.state.seqIndex[i][j] === this.state.seq ? matchArray.push({ rotation: i, position: j }) : null ;
      }
    }
    // console.log('ma: ' + matchArray);
    let saStartPos = this.calcRelativePosition(matchArray);
    let saPos = this.extendMatchArr(saStartPos); // TODO: input query length here to extend by a variable length
    this.highlightMatches(saPos);
  } 
  

  calcRelativePosition(matches) {
    let saStartPos = [];
    for (let i = 0; i < matches.length; i++) {
      // console.log(matches[i])
      // console.log(matches[i].rotation)
      saStartPos.push(4 - matches[i].rotation + (4 * matches[i].position) - 4);
    }
    // console.log(saStartPos); fix sasStartPos: is slightly off
    return saStartPos;
  }

  highlightMatches(saPos) {
    let seq = document.getElementById('fileDisplayArea').textContent;
    // console.log(seq);
    let target = document.getElementById('resultDisplayArea');
    for (let i = 0; i < seq.length; i++) {
      var elem = document.createElement('span'),
      text = document.createTextNode(seq[i]);
  elem.appendChild(text);
  // console.log(seq[i])
  // console.log(saStartPos[0]);

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
    // console.log(element);
    for (let i = 0; i < 4; i++) {  // TODO: update hardcoded query length value
      console.log(element + i);
      positionsArray.push(element + i);
    }
  }, this);
  return positionsArray;
}

  render() {
    return (
      <div className="App">
        <div style={{display: 'inlineBlock'}}>
          <div className="geneProcesser">
            <div className="query">
              <div className="queryInput">
                <h3 style={{textAlign: 'left'}}>Query Sequence</h3><br/><br/>
                <textarea placeholder="Enter a 4 base sequence (eg. AATT)" type="text" id='queryInput' name="seq" onChange={ this.handleChange } value={ this.state.seq } style={{float: 'left', height: '100px', width: '400px'}}></textarea>
                <label id="label3" style={{float: 'left', marginTop: '20px'}}>3. &nbsp;</label>
                <button id="submitButton" style={{float: 'left', marginTop: '20px'}} onClick={this.submitSequence}>Submit Query</button>
                <button id="clearButton" style={{ marginTop: '20px'}} onClick={clearTextarea}>Clear Input</button>
              </div>
              <div className="queryDisplay" id="queryDisplay" style={{display: 'none'}}>
                <label id="querySeq" style={{float: 'left', textAlign: 'left', width: '200px', wordBreak: 'break-all', wordWrap: 'break-word'}}>{ this.state.seq }</label>
                <br/><br/><br/>
                <label style={{float: 'left', textAlign: 'left'}}>4. &nbsp;</label>
                <button onClick={ this.searchIndex } style={{float: 'left', textAlign: 'left'}}>Search</button>
              </div>
            </div>
            <div className="search" style={{}}>
              <h3>Search Sequence</h3><br/><br/>
              <div className="searchQueryInput" id="searchQueryInput">
              <label>1. &nbsp;</label>
              <input type="file" id="fileInput"/>
              <br/><br/><br/>
              <label>2. &nbsp;</label>
              <button id="createIndexButton" onClick={ this.tokeniseSequence }>Create Index</button>
              <br/><br/><br/>
              <label>Uploaded Sequence:</label>
              <br/><br/>
              <label id="fileDisplayArea" style={{float: 'left', textAlign: 'left', width: '600px', wordBreak: 'break-all', wordWrap: 'break-word'}}></label>
              <br/><br/><br/>
              <label>Result Sequence:</label>
              <br/><br/>
              <label id="resultDisplayArea" style={{float: 'left', textAlign: 'left', width: '600px', wordBreak: 'break-all', wordWrap: 'break-word'}}></label>
              <br/><br/><br/>
              <br/><br/><br/>
              <button onClick={smith_waterman}>Smith-Waterman</button>
              </div>
              <div className="searchSeqDisplay" id="searchSeqDisplay" style={{display: 'none'}}>
              <br/><br/><br/>
              
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
