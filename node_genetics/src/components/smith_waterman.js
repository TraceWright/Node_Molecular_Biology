import React, { Component } from 'react';
import '../App.css';
import * as SW from 'igenius-smith-waterman';

function smith_waterm() {
  let seq1 = 'AAAATTTAAGAAAGATGGAGTAAATTTATGTCGGAAAAAGAAATTTGAGT';
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
    }
      render() {
        return (
            <div>
                <button onClick={ smith_waterm }>Smith-Waterman</button>
            </div>
        );
    }
}