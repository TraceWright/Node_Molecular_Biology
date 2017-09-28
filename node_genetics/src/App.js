import React, { Component } from 'react';
import './style.css';
let Stopwatch = require("node-stopwatch").Stopwatch;

let indexStopwatch = Stopwatch.create();

function matchesKmer(element, index, array){
    if (element.k === this) {
        return index;
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
            indexes: []
        }

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

    displayTimer(time, uiElement) {
      time.minutes > 0 ? uiElement.innerText = `${time.minutes}:${Math.round(time.seconds)} minutes`: uiElement.innerText = `${Math.round(time.seconds)} seconds`;
    }
      
    createIndex(ra, i_main) {
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
        
    indexMain() {
    document.getElementById('loader').style.display = 'grid';
      let sa;
      let indexTimes = { minutes: 0, seconds: 0 };
      sa = this.state.sequences
      for (let i = 0; i < sa.length; i++) {
        let ta = this.tokeniseSequence(sa[i]);
        let ra = this.createRotations(ta);
        let timer = this.createIndex(ra, i); // sets index in state and returns indexStopwatch result
        indexTimes.minutes += timer.minutes;
        indexTimes.seconds += timer.seconds;
    }
      let indexTimer  = document.getElementById('index-timer');
      this.displayTimer(indexTimes, indexTimer);
      document.getElementById('loader').style.display = 'none'; 
      console.log(this.state.indexes)
    }

    saveSequence() {
        console.log(this.state.sequences);
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
                        <button className='bttn' id="postDataButton" onClick={ this.postData }>Post Index to Database</button>
                        <br/><br/><br/>
                    </div>

                    <div className="querying">
                        <h2 className="heading">Querying</h2><br/><br/>
                    </div>
                </div>
            </div>
        </div>
    )}
}

export default App;