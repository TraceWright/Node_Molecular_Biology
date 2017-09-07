import React, { Component } from 'react';
import './App.css';


// function inputSequence() {
//   let seqInput = document.getElementById('seqInput').value;
//   console.log(seqInput)
//   this.setState({ seq: seqInput })
//   console.log(this.state.seq)  
// }

function clearTextarea() {
  document.getElementById('seqInput').value = "";  
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
    document.getElementById('seqDisplay').style.display = 'block'; 
    document.getElementById('controlsSeqInput').style.display = 'none';
    document.getElementById('controlsSeqDisplay').style.display = 'block';  
  }

  newSequence() {
    this.setState({ seq: '' })
    document.getElementById('seqInput').style.display = 'block'; 
    document.getElementById('submitButton').style.display = 'block';
    document.getElementById('seqDisplay').style.display = 'none'; 
    document.getElementById('controlsSeqInput').style.display = 'block';
    document.getElementById('controlsSeqDisplay').style.display = 'none'; 
  }

  render() {
    return (
      <div className="App">
        <div style={{display: 'inlineBlock'}}>
          <div className="geneProcesser">
            <div className="sequence">
              <div className="seqInput">
                <h3 style={{textAlign: 'left'}}>Sequence</h3><br/><br/>
                <textarea type="text" id='seqInput' name="seq" onChange={ this.handleChange } value={this.state.seq} style={{float: 'left', height: '800px', width: '800px'}}></textarea>
                <button id="submitButton" style={{float: 'left', marginTop: '20px'}} onClick={this.submitSequence}>Submit Sequence</button>
              </div>
              <div className="seqDisplay" id="seqDisplay" style={{display: 'none'}}>
                <label style={{float: 'left', width: '800px', wordBreak: 'break-all', wordWrap: 'break-word'}}>{this.state.seq}</label>
              </div>
            </div>
            <div className="controls" style={{}}>
              <h3>Controls</h3><br/><br/>
              <div className="controlsSeqInput" id="controlsSeqInput">
                <button onClick={clearTextarea}>Clear Input</button>
              </div>
              <div className="controlsSeqDisplay" id="controlsSeqDisplay" style={{display: 'none'}}>
                <button onClick={this.newSequence}>New Sequence</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
