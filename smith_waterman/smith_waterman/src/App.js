import React, { Component } from 'react';
import './App.css';
import * as SW from 'igenius-smith-waterman';

window.onload = function() {
  let seqInput = document.getElementById('seq-input');
  let fileContentsSeq = document.getElementById('file-contents-seq');
  let notSupportedSeq = document.getElementById('not-supported-seq');
  
  seqInput.addEventListener('change', function(e) {
    var file = seqInput.files[0];
    var textType = /text.*/;
    if (file) {
      if (file.type.match(textType)) {
          var reader = new FileReader();
          reader.onload = function(e) {
            fileContentsSeq.value = reader.result;
          }
          reader.readAsText(file);
      } else {
          notSupportedSeq.innerText = "File not supported!"
      }
    }
  });
}

class App extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      toggleUploadView: false,
      sequence: [],
      sequences: [],
      querySeq: [],
      optimalAlignment: [] 
    }

    this.toggleView = this.toggleView.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.saveSequence = this.saveSequence.bind(this);
    this.smith_waterm = this.smith_waterm.bind(this);
    this.handleMultipleSequences = this.handleMultipleSequences.bind(this);
  }

  toggleView() {
    this.setState({ toggleUploadView: !this.state.toggleUploadView })
  }

  handleChange({ target }) {
    this.setState({
        [target.name]: target.value
    });
  }

  saveSequence() {
    let fileContentsSeq = document.getElementById('file-contents-seq').value;
    this.setState({ sequences: [...this.state.sequences, fileContentsSeq] });
    console.log(this.state.sequences);
  }

  smith_waterm(seq1, seq2) {
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
    let alignment = SW.align(seq1, seq2, gss, simfunc);
    return alignment;
  }

  handleMultipleSequences() {
    let resultsArray = [];
    for (let i = 0; i < this.state.sequences.length; i++) {
        let result = this.smith_waterm(this.state.sequences[i], this.state.querySeq);
        resultsArray.push(result);
    }
    for (let i = 0; i < resultsArray.length; i++) {
       this.highlightMatches(resultsArray[i], resultsArray[i].str1, resultsArray[i].str2);
    }
}

highlightMatches(alignment, seq1, seq2) {
  let sq1 = seq1.split('');
  let sq2 = seq2.split('');
  let target = document.getElementById('resultDisplayArea');
  // while (target.hasChildNodes()) {
  //     target.removeChild(target.lastChild);
  // }
  let line1;
  let line2; 
  for (let i = 0; i < alignment.str1.length; i++) {
      if (i % 100 === 0){
          line1 = document.createElement('div');
          line2 = document.createElement('div');
          line1.style.marginTop = '20px';
          target.appendChild(line1);
          target.appendChild(line2);
      }
      let elem1 = document.createElement('span');
      let elem2 = document.createElement('span');
      let text1 = document.createTextNode(sq1[i]);
      let text2 = document.createTextNode(sq2[i]);
      elem1.appendChild(text1);
      elem2.appendChild(text2);
      line1.appendChild(elem1);
      line2.appendChild(elem2);
      elem1.style.fontFamily = 'Courier New';
      elem2.style.fontFamily = 'Courier New';
      elem1.style.textAlign = 'left';
      elem2.style.textAlign = 'left';
      if (seq1[i] === seq2[i]) {
          elem1.style.color = 'red';
          elem1.style.fontWeight = 'bold';
          elem2.style.color = 'red';
          elem2.style.fontWeight = 'bold';
      }
  }
}  

  render() {
    return (
      <div>
        <div className="sw-app background">
          <div className="upload-back">
            <button  className='bttn file-up-btn' onClick={ this.toggleView } style={ this.state.toggleUploadView ? { display: 'none' } : {} }>Upload File/s</button>
            <button className='bttn back-btn' onClick={ this.toggleView } style={ this.state.toggleUploadView ? { display: 'grid' } : {} }>Back</button>
          </div>

          <div className="smith-waterman">
            <button className="bttn" onClick={ this.handleMultipleSequences }>Smith Waterman</button>
          </div>

          <div className="query-input">
            <textarea placeholder="Enter Query Sequence (ACGT characters only)" type="text" id='' name="querySeq" onChange={ this.handleChange } value={ this.state.querySeq } style={{ height: '200px', width: '600px'}}></textarea>
          </div>

          <div className="results-display">
            <div id="resultDisplayArea"/>
          </div>

          <div className="file-uploads" style={ this.state.toggleUploadView ? { display: 'grid' } : {} }> 
            <div className="uploaded-sequence">
              <textarea 
                className="text-area" 
                id="file-contents-seq" 
                placeholder="Copy/Paste sequence or upload a text file" 
                name="sequence" 
                value={ this.state.sequence } 
                onChange={ this.handleChange } >
              </textarea>
              <br/>
            <div>
              <input type="file" className='bttn input-files-btn' id="seq-input"/>
              <br/><br/>
              <label id="not-supported-seq"/>
            </div> 
            <button onClick={ this.saveSequence } className='bttn submit-btn'>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );}
}

export default App;
