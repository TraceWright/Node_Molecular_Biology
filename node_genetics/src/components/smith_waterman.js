import React, { Component } from 'react';
import '../App.css';
import * as SW from 'igenius-smith-waterman';

function smith_waterm() {
  let seq1 = document.getElementById('fileDisplayArea').textContent;
    
    console.log(this.state.querySeq)
//   let seq1 = 'AAAATTTAAGAAAGATGGAGTAAATTTATGTCGGAAAAAGAAATTTGAGT';
  let seq2 = 'AAAATTTAAGAAAGATGGAGTAAATTTAAGATGGAGTAAATTTATGTCGGAAAAAGAAATTTGAGT';
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

export class Smith_Waterman extends Component {
    constructor(props) {
        super(props);

        this.state = {
            searchSeq: [],
            querySeq: [],
          }

        this.handleChange = this.handleChange.bind(this); 
        this.takeSequence = this.takeSequence.bind(this); 
        
    }

    handleChange({ target }) {
        this.setState({
            [target.name]: target.value
          });
      }

    takeSequence() {
        let s = document.getElementById('fileDisplayArea').textContent;
        console.log(s);
        this.setState({ searchSeq: s })
      }

      render() {
        return (
            <div>
                <button onClick={ smith_waterm }>Smith-Waterman</button>
                <br/><br/><br/>
                <button id="createIndexButton" onClick={ this.takeSequence }>Create Index</button>
                <br/><br/><br/>
                <textarea placeholder="Enter a Query Sequence" type="text" id='' name="querySeq" onChange={ this.handleChange } value={ this.state.seq } style={{ height: '100px', width: '400px'}}></textarea>
            </div>
        );
    }
}