import React, { Component } from 'react';
import '../App.css';

function clearTextarea() {
    document.getElementById('seqInput').value = "";  
}

export class simple_starter extends Component {
    constructor(props) {
        super(props);
      
        this.state = {
          seq: [],
          seqIndex: []
        }
    
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
        this.setState({ seqIndex: rotationArr });
      }
    
      tokeniseSequence() {
        let s = document.getElementById('fileDisplayArea').textContent;
        console.log(s);
        let seq = s.replace('/,/g' , '')
        let seqArray = seq.match(/.{1,4}/g);
        this.createRotations(seqArray);
      }
      
      searchIndex() {
        let matchArray = [];
    
        for (let i = 0; i < this.state.seqIndex.length; i++) {
          for (let j = 0; j < this.state.seqIndex[i].length; j++) {
            this.state.seqIndex[i][j] === this.state.seq ? matchArray.push({ rotation: i, position: j }) : null ;
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
              <button id="createIndexButton" onClick={ this.tokeniseSequence }>Create Index</button>
              <br/><br/><br/>
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