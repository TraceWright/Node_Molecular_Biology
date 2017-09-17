import React, { Component } from 'react';
import '../App.css';
import * as SW from 'igenius-smith-waterman';
import * as fs from 'browserify-fs';

export class Smith_Waterman extends Component {
    constructor(props) {
        super(props);

        this.state = {
            querySeq: [],
            optimalAlignment: [], 
            sequences: []
          }

        this.handleChange = this.handleChange.bind(this); 
        this.smith_waterm = this.smith_waterm.bind(this);
        this.takeSequences = this.takeSequences.bind(this);
        this.handleMultipleSequences = this.handleMultipleSequences.bind(this);
    }

    handleChange({ target }) {
        this.setState({
            [target.name]: target.value
          });
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

    takeSequences() {
        let newState = [];
        fs.readdir('/home', function(e,f) {
            f.forEach(function(element) {
                fs.readFile(`/home/${element}`, 'utf-8', function(err, data) {
                    newState.push(data);
                });
            });
        });
        this.setState({ sequences: newState });
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
            <div className="smith-waterman">
                <br/><br/>
                <button className='bttn' onClick={ this.handleMultipleSequences }>Run Smith-Waterman Algorithm</button>
                <br/><br/><br/>
                <button className='bttn' id="createIndexButton" onClick={ this.takeSequences }>Save Uploaded Sequence/s to SW Search State</button>
                <br/><br/><br/>
                <textarea placeholder="Enter Query Sequence" type="text" id='' name="querySeq" onChange={ this.handleChange } value={ this.state.querySeq } style={{ height: '200px', width: '600px'}}></textarea>
                <br/><br/><br/>
                <div id="resultDisplayArea"/>

            </div>
        );
    }
}