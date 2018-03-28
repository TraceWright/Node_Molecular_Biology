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
    this.viterbi = this.viterbi.bind(this);
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

  viterbi() {
    let seq = "AAAATTTAAGAAAGATGGAGGCGCGCCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCTTAT";
    // let seq = "CGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGC";

    const initProbGenome = 0.99;
    const initProbIsland = 0.01;

    const transitionGG = 0.99999;
    const transitionIG = 0.001;
    const transitionGI = 0.00001;
    const transitionII = 0.999;

    const emissionCpG_GC = 0.3;
    const emissionCpG_AT = 0.2; 
    const emissionGen_GC = 0.2;
    const emissionGen_AT = 0.3;
    
    // let sequenceArray = this.state.sequences.toString().split('');
    let sequenceArray = seq.split('');
    //console.log('seqArray: ' + sequenceArray);

    let h_genome = [];
    let h_island = [];
    
    let emission_genome;
    let emission_island;

    // assign emission value for initial base
    sequenceArray[0] === "A" | sequenceArray[0] === "T" ? emission_genome = emissionGen_AT : emission_genome = emissionGen_GC;
    sequenceArray[0] === "A" | sequenceArray[0] === "T" ? emission_island = emissionCpG_AT : emission_island = emissionCpG_GC;

    // multiply emission values by initiation probabilities and save to *_prev, to prepare for loop
    let genome_prev = emission_genome * initProbGenome;
    let island_prev = emission_island * initProbIsland;

    for (let i = 1, len = sequenceArray.length; i < len; i++) {

      // assign emission value for current base in sequenceArray
      sequenceArray[i] === "A" | sequenceArray[i] === "T" ? emission_genome = emissionGen_AT : emission_genome = emissionGen_GC;
      sequenceArray[i] === "A" | sequenceArray[i] === "T" ? emission_island = emissionCpG_AT : emission_island = emissionCpG_GC;

      // multiply previous values with current base transition and emission values 
      let comparative_value_gg = genome_prev * transitionGG * emission_genome;
      let comparative_value_ig = island_prev * transitionIG * emission_genome;

      let comparative_value_ii = island_prev * transitionII * emission_island;
      let comparative_value_gi = genome_prev * transitionGI * emission_island;

      comparative_value_gg > comparative_value_ig ? h_genome[i] = [comparative_value_gg, "G"] : h_genome[i] = [comparative_value_ig, "I"];
      comparative_value_ii > comparative_value_gi ? h_island[i] = [comparative_value_ii, "I"] : h_island[i] = [comparative_value_gi, "G"];

      genome_prev = h_genome[i][0];
      island_prev = h_island[i][0];

      console.log(i + " " + h_genome[i][1] + " genome: " + h_genome[i] + " base: " + sequenceArray[i]);
      console.log(i + " " + h_island[i][1] + " island: " + h_island[i] + " base: " + sequenceArray[i]);
    }

    // console.log("genome: " + h_genome);
    // console.log("island: " + h_island);

  }

  render() {
    return (
      <div>
        <div className="hmm-app background">
          <div className="upload-back">
            <button  className='bttn file-up-btn' onClick={ this.toggleView } style={ this.state.toggleUploadView ? { display: 'none' } : {} }>Upload File/s</button>
            <button className='bttn back-btn' onClick={ this.toggleView } style={ this.state.toggleUploadView ? { display: 'grid' } : {} }>Back</button>
          </div>

          <div className="viterbi">
            <button onClick={ this.viterbi }>Viterbi</button>
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
