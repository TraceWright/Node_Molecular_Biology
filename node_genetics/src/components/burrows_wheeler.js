import React, { Component } from 'react';
import '../App.css';
import { bwt } from 'burrows-wheeler-transform'; // ibwt
import * as fs from 'browserify-fs';

export class Burrows_Wheeler extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sequences: []
          }

        this.takeSequences = this.takeSequences.bind(this);
        this.burrowsWheeler = this.burrowsWheeler.bind(this);
        
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

        burrowsWheeler() {
            console.log(this.state.sequences)
            const WORD = this.state.sequences[0]
            const transformedWord = bwt(WORD)
            }

        render() {
            return (
                <div>
                    <button onClick={this.burrowsWheeler}>Burrows Wheeler</button>
                    <br/><br/><br/>
                    <button className='bttn' id="createIndexButton" onClick={ this.takeSequences }>Save Uploaded Sequence/s to BW Search State</button>

                </div>
            )
        }
    }