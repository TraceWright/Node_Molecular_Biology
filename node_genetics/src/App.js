import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
// import * as fs from 'browserify-fs';

import { simple_starter } from './components/simple_starter';
import { Smith_Waterman } from './components/smith_waterman';

window.onload = function() {
  let fileInput = document.getElementById('fileInput');
  let fileDisplayArea = document.getElementById('fileDisplayArea');
  fileInput.addEventListener('change', function(e) {
      var file = fileInput.files[0];
      var textType = /text.*/;
      if (file.type.match(textType)) {
          var reader = new FileReader();
          reader.onload = function(e) {
            fileDisplayArea.innerText = reader.result;
          }
          reader.readAsText(file);    
      } else {
          fileDisplayArea.innerText = "File not supported!"
      }
  });
}

// fs.mkdir('/home', function() {
//   fs.writeFile('/home/hello-world.txt', 'Hello world!\n', function() {
//       fs.readFile('/home/hello-world.txt', 'utf-8', function(err, data) {
//           console.log(data);
//       });
//   });
// });
// fs.readdir("/home/",function(e,f) {console.log(f);})

function uploadFiles() {
  document.getElementById('file-uploader').style.display = 'grid'; 
  document.getElementById('search-components').style.display = 'none';
  document.getElementById('uploaded-sequence').style.display = 'grid';  
  document.getElementById('upload-files-btn').style.display = 'none';
  document.getElementById('back-btn').style.display = 'grid';  
     
}

function back() {
  document.getElementById('file-uploader').style.display = 'none'; 
  document.getElementById('search-components').style.display = 'grid';
  document.getElementById('uploaded-sequence').style.display = 'none';
  document.getElementById('back-btn').style.display = 'none';
  document.getElementById('upload-files-btn').style.display = 'grid';
}


class App extends Component {

  render() {
    return (
      <div className="App">
        <Router>
         <div style={{display: 'inlineBlock'}}>
          <div>
            <div className="files">
              <button id="upload-files-btn" style={{ float: 'left', marginTop: '20px', marginLeft: '20px' }} onClick={ uploadFiles }>Upload File/s</button>
              <button id="back-btn" style={{ float: 'left', marginTop: '20px', marginLeft: '20px', display: 'none' }} onClick={ back }>Back</button>
            </div>

            <div style={{ display: 'none'}} className="file-uploader" id="file-uploader">
              <div className="input-files">
                <input type="file" id="fileInput"/>
              </div> 

              <div style={{ display: 'none', float: 'left' }} className="uploaded-sequence" id="uploaded-sequence">    
                <label style={{ textAlign: 'left' }}>Uploaded Sequence:</label>
                <br/><br/>
                <label id="fileDisplayArea" style={{float: 'left', textAlign: 'left', width: '600px', wordBreak: 'break-all', wordWrap: 'break-word'}}></label>
              </div>

            </div>
            <div id="search-components">
              <Route path="/simple_starter" component={simple_starter}/>
              <Route path="/smith_waterman" component={Smith_Waterman}/>
            </div>
          </div>
        </div>
        </Router>
      </div>
    );
  }
}

export default App;
