import React, { Component } from 'react';
import '../App.css';
import * as SW from 'igenius-smith-waterman';

export class Smith_Waterman extends Component {
    constructor(props) {
        super(props);

        this.state = {
            seq1: [],
            seq2: [],
            optimalAlignment: []
          }

        this.handleChange = this.handleChange.bind(this); 
        this.smith_waterm = this.smith_waterm.bind(this);
        this.takeSequence = this.takeSequence.bind(this); 
        
    }

    handleChange({ target }) {
        this.setState({
            [target.name]: target.value
          });
      }

    smith_waterm() {
      let seq1 = this.state.seq1;
      let seq2 = this.state.seq2; 
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
      this.highlightMatches(alignment, alignment.str1, alignment.str2);
    }

    takeSequence() {
        let s = document.getElementById('fileDisplayArea').textContent;
        console.log(s) 
        this.setState({ seq1: s })
      }

    highlightMatches(alignment, seq1, seq2) {
        let sq1 = seq1.split('');
        let sq2 = seq2.split('');
        let target = document.getElementById('resultDisplayArea');
        let line1;
        let line2; 
        for (let i = 0; i < alignment.walk.length; i++) {
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
                <button onClick={ this.smith_waterm }>Smith-Waterman</button>
                <br/><br/><br/>
                <button id="createIndexButton" onClick={ this.takeSequence }>Create Index</button>
                <br/><br/><br/>
                <textarea placeholder="Enter a Query Sequence" type="text" id='' name="seq2" onChange={ this.handleChange } value={ this.state.seq2 } style={{ height: '100px', width: '400px'}}></textarea>
                <br/><br/><br/>
                <div id="resultDisplayArea"/>

            </div>
        );
    }
}