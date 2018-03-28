import React, { Component } from 'react';
import './App.css';

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
      sequences: []
    }

    this.toggleView = this.toggleView.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.saveSequence = this.saveSequence.bind(this);
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

  render() {
    return (
      <div>
        <div className="hmm-app background">
          <div className="upload-back">
            <button  className='bttn file-up-btn' onClick={ this.toggleView } style={ this.state.toggleUploadView ? { display: 'none' } : {} }>Upload File/s</button>
            <button className='bttn back-btn' onClick={ this.toggleView } style={ this.state.toggleUploadView ? { display: 'grid' } : {} }>Back</button>
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
