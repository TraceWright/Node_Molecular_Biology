import React, { Component } from 'react';
import '../App.css';
import * as SW from 'igenius-smith-waterman';

export class Smith_Waterman extends Component {
    constructor(props) {
        super(props);

        this.state = {
            seq1: [],
            seq2: [],
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
        console.log(this.state.seq1)
        console.log(this.state.seq2)
    //   let seq1 = 'AAAATTTAAGAAAGATGGAGTAAATTTATGTCGGAAAAAGAAATTTGAGT';
    //   let seq2 = 'AAAATTTAAGAAAGATGGAGTAAATTTAAGATGGAGTAAATTTATGTCGGAAAAAGAAATTTGAGT';
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
      SW.align(seq1, seq2, gss, simfunc)
    }

    takeSequence() {
        let s = document.getElementById('fileDisplayArea').textContent;
        console.log(s) 
        this.setState({ seq1: s })
      }

      render() {
        return (
            <div>
                <button onClick={ this.smith_waterm }>Smith-Waterman</button>
                <br/><br/><br/>
                <button id="createIndexButton" onClick={ this.takeSequence }>Create Index</button>
                <br/><br/><br/>
                <textarea placeholder="Enter a Query Sequence" type="text" id='' name="seq2" onChange={ this.handleChange } value={ this.state.seq2 } style={{ height: '100px', width: '400px'}}></textarea>
            </div>
        );
    }
}