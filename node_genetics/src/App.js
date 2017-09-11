import React, { Component } from 'react';
import './App.css';

function clearTextarea() {
  document.getElementById('seqInput').value = "";  
}

function tokeniseSequence() {
  let seq = document.getElementById('fileDisplayArea').textContent;
  // console.log(seq);
  let seqArray = seq.match(/.{1,4}/g); // TODO: dynamically create subsequences of the same length as the query
  // console.log(seqArray);
  createRotations(seqArray);
}

function createRotations(seqArr) {
  let sep;
  let rotationArr = [];
  let regexArray = [];
  regexArray[0] = /.{1,3}/g;
  regexArray[1] = /.{2,2}/g;
  // rotationArr.map((i) => {
  //   return [ rotation, rotation, rotation, rotation ];
  // })
  for (let i = 0; i < 2; i++) {
    rotationArr[i] = [];
    for (let j = 0; j < seqArr.length; j++) {
      sep = '';
      sep = seqArr[j].match(regexArray[i]); // TODO: get 2nd rotation
      j > 0 ? rotationArr[i][j] = sep[1] + sep[0]: rotationArr[i][j] = sep[0]; 
    }
    
    
  }
  console.log(rotationArr);
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
              fileDisplayArea.innerText = reader.result;
              document.getElementById('createIndexButton').style.display = 'block'; 
              
              // console.log(reader.result);
              // let seqArr = tokeniseSequence(reader.result);
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
      seq: []
    }

    this.newSequence = this.newSequence.bind(this);    
    this.submitSequence = this.submitSequence.bind(this);
    this.handleChange = this.handleChange.bind(this); 
  }

  handleChange({ target }) {
    this.setState({
        [target.name]: target.value
      });
  }

  submitSequence() {
    let seqInput = document.getElementById('seqInput').value;
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
    document.getElementById('seqInput').style.display = 'none'; 
    document.getElementById('submitButton').style.display = 'none';
    document.getElementById('clearButton').style.display = 'none';    
    document.getElementById('seqDisplay').style.display = 'block'; 
    document.getElementById('searchSeqInput').style.display = 'none';
    document.getElementById('searchSeqDisplay').style.display = 'block';  
  }

  newSequence() {
    this.setState({ seq: '' })
    document.getElementById('seqInput').style.display = 'block'; 
    document.getElementById('submitButton').style.display = 'block';
    document.getElementById('clearButton').style.display = 'block';        
    document.getElementById('seqDisplay').style.display = 'none'; 
    document.getElementById('searchSeqInput').style.display = 'block';
    document.getElementById('searchSeqDisplay').style.display = 'none'; 
  }


  render() {
    return (
      <div className="App">
        <div style={{display: 'inlineBlock'}}>
          <div className="geneProcesser">
            <div className="query">
              <div className="seqInput">
                <h3 style={{textAlign: 'left'}}>Query Sequence</h3><br/><br/>
                <textarea type="text" id='seqInput' name="seq" onChange={ this.handleChange } value={ this.state.seq } style={{float: 'left', height: '100px', width: '400px'}}></textarea>
                <button id="submitButton" style={{float: 'left', marginTop: '20px'}} onClick={this.submitSequence}>Submit Query</button>
                <button id="clearButton" style={{ marginTop: '20px'}} onClick={clearTextarea}>Clear Input</button>
              </div>
              <div className="seqDisplay" id="seqDisplay" style={{display: 'none'}}>
                <label style={{float: 'left', textAlign: 'left', width: '200px', wordBreak: 'break-all', wordWrap: 'break-word'}}>{ this.state.seq }</label>
              </div>
            </div>
            <div className="search" style={{}}>
              <h3>Search Sequence</h3><br/><br/>
              <div className="searchSeqInput" id="searchSeqInput">
              <input type="file" id="fileInput"/>
              <br/><br/><br/>
              <button id="createIndexButton" style={{ display: 'none' }} onClick={ tokeniseSequence }>Create Index</button>
              <br/><br/><br/>
              <label id="fileDisplayArea" style={{float: 'left', textAlign: 'left', width: '600px', wordBreak: 'break-all', wordWrap: 'break-word'}}></label>
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
