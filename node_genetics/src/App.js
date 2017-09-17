import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import * as fs from 'browserify-fs';

import { simple_starter } from './components/simple_starter';
import { Smith_Waterman } from './components/smith_waterman';

function uploadFile(fileName, fileText) {
  // console.log(fileName);
  // console.log(fileText);
  fs.mkdir('/home', function() {
    fs.writeFile(`/home/${fileName}`, fileText, function () {
      fs.readFile(`/home/${fileName}`, 'utf-8', function(err, data) {
        //console.log(data);
      });
    });
  });
}

window.onload = function() {
  let fileInput = document.getElementById('fileInput');
  let fileDisplayArea = document.getElementById('fileDisplayArea');
  let dirContents  = document.getElementById('dir-content');
  console.log('dc: ' + dirContents)
  let fileList;
  fileInput.addEventListener('change', function(e) {
      var file = fileInput.files[0];
      var textType = /text.*/;
      if (file.type.match(textType)) {
          var reader = new FileReader();
          reader.onload = function(e) {
            fileDisplayArea.innerText = reader.result;
            uploadFile(fileInput.files[0].name, fileDisplayArea.innerText);
          }
          reader.readAsText(file);    
      } else {
          fileDisplayArea.innerText = "File not supported!"
      }

      fileList = dirContents.innerText + fileInput.files[0].name + '\r\n';
      dirContents.innerText = fileList;

  });
}

function clearBrowserFiles() {
  let dirContents  = document.getElementById('dir-contents');
  dirContents.innerText = 'Directory Contents: ';
    fs.readdir('/home', function(e,f) {
      console.log(f);
    
      f.forEach(function(element) {
        fs.unlink('/home/' + element)
        console.log(element)
      });
  
    })
  }

function uploadFilesPage() {
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
              <button className='bttn' id="upload-files-btn" style={{ float: 'left', marginTop: '20px', marginLeft: '20px' }} onClick={ uploadFilesPage }>Upload File/s</button>
              <button className='bttn' id="back-btn" style={{ float: 'left', marginTop: '20px', marginLeft: '20px', display: 'none' }} onClick={ back }>Back</button>
            </div>

            <div style={{ display: 'none'}} className="file-uploader" id="file-uploader">

              <div className="dir-contents">
                <div id="dir-content">Directory Contents: </div>
              </div>

            <div className="clear-dir">
                <button onClick={ clearBrowserFiles }>Clear Directory</button>
              </div>

              <div className="input-files">
                <input type="file" id="fileInput"/>
              </div> 

              <div style={{ display: 'none', float: 'left' }} className="uploaded-sequence" id="uploaded-sequence">    
                <label style={{ textAlign: 'left' }}>File Contents:</label>
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
