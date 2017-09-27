import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import * as fs from 'browserify-fs';

import { simple_starter } from './components/simple_starter';
import { Smith_Waterman } from './components/smith_waterman';
import { Burrows_Wheeler } from './components/burrows_wheeler';

// let Stopwatch = require("node-stopwatch").Stopwatch;
// let stopwatch = Stopwatch.create();

function checkIfLoaded() {
  let fileUploaded; 
  fs.readdir('/home', function(e, f) {
    fileUploaded = f;
    if (fileUploaded) {
      window.setTimeout(this.checkIfLoaded, 200);
    } else {
      return true;   
    }
  }); 
  
}

function uploadFile(fileName, fileText) {
  let dirContents  = document.getElementById('dir-content');
  fs.writeFile(`/home/${fileName}`, fileText, function () {
    // fs.readFile(`/home/${fileName}`, 'utf-8', function(err, data) {
      fs.readdir('/home', function(e, f) {
        let check = checkIfLoaded();
        if (check == true) {
          let fileList = f.toString().split(',').join('\r\n');
          dirContents.innerText = fileList;
        }
      }); 
    // });
  });
}

// function  displayUploadTime(minutes, seconds) {
//   let uploadTimer  = document.getElementById('upload-timer');
//   minutes > 0 ? uploadTimer.innerText = `${minutes}:${Math.round(seconds)} minutes`: uploadTimer.innerText = `${seconds.toFixed(3)} seconds`; 
// }

// function checkIfLoaded() {
//   let fileDisplayArea = document.getElementById('fileDisplayArea');
// console.log(fileDisplayArea.innerText)
//   if (fileDisplayArea.innerText.length < 1) {
//     window.setTimeout(checkIfLoaded(), 500);
//   } else {  
//       stopwatch.stop();
//       let minutes = Math.floor(stopwatch.elapsed.minutes);
//       let seconds = stopwatch.elapsed.seconds % 60; 
//       console.log('mins:' + minutes);
//       console.log('secs: ' + seconds);
//       displayUploadTime(minutes, seconds); 
//   }
// }

window.onload = function() {
  let fileInput = document.getElementById('fileInput');
  let fileDisplayArea = document.getElementById('fileDisplayArea');
  let dirContents  = document.getElementById('dir-content');

  fs.mkdir('/home', function() {
    fs.readdir('/home', function(e, f) {
      if (f) {
        let fileList = f.toString().split(',').join('\r\n');
        dirContents.innerText = fileList;
      }
    });
  });

  fileInput.addEventListener('change', function(e) {
    //stopwatch.start();    
      var file = fileInput.files[0];
      var textType = /text.*/;
      if (file.type.match(textType)) {
          var reader = new FileReader();
          reader.onload = function(e) {
            document.getElementById('uploaded-sequence').style.display = 'grid';
            fileDisplayArea.innerText = reader.result;

            uploadFile(fileInput.files[0].name, fileDisplayArea.innerText);
          }
          reader.readAsText(file);
          // stopwatch.stop();
          // let minutes = Math.floor(stopwatch.elapsed.minutes);
          // let seconds = stopwatch.elapsed.seconds % 60; 
          // console.log('mins:' + minutes);
          // console.log('secs: ' + seconds);
          // displayUploadTime(minutes, seconds);       
      } else {
          fileDisplayArea.innerText = "File not supported!"
      }
      
  });
}

function clearBrowserFiles() {
  let dirContents  = document.getElementById('dir-content');
  dirContents.innerText = '';
    fs.readdir('/home', function(e,f) {
      f.forEach(function(element) {
        fs.unlink('/home/' + element)
      });
    })
  }

function uploadFilesPage() {
  document.getElementById('file-uploader').style.display = 'grid'; 
  document.getElementById('search-components').style.display = 'none';  
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
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css"/>
        <Router>
         <div style={{display: 'inlineBlock'}}>
          <div>
            <div className="files">
              <button  className='bttn' id="upload-files-btn" style={{ float: 'left', marginTop: '20px', marginLeft: '20px' }} onClick={ uploadFilesPage }>Upload File/s</button>
              <button className='bttn' id="back-btn" style={{ float: 'left', marginTop: '20px', marginLeft: '20px', display: 'none' }} onClick={ back }>Back</button>
            </div>

            <div style={{ display: 'none'}} className="file-uploader" id="file-uploader">

              <div className="dir-contents">
                <label>Directory Contents:</label>
                <div style={{paddingLeft: '50px', paddingTop: '10px'}} id="dir-content"></div>
              </div>

            <div className="clear-dir">
                <button onClick={ clearBrowserFiles }>Clear Directory</button>
              </div>

              <div className="input-files">
                <input type="file" id="fileInput"/>
                <br/>
                <label style={{ float: 'left' }} id="upload-timer"></label>
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
              <Route path="/burrows_wheeler" component={Burrows_Wheeler}/>
            </div>
          </div>
        </div>
        </Router>
      </div>
    );
  }
}

export default App;
