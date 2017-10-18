import React from 'react';
import './../style.css';

const Kmers = ({result}) => {
    const pos = result.pos.map((pos) => {
        return <tr><td key={pos[0]}>{pos[0]}</td><td style={{}} key={pos[1].product}>{pos[1].product}</td><td key={pos[1].sPos}>{pos[1].sPos}</td><td key={pos[1].ePos}>{pos[1].ePos}</td><br/></tr>
    });
    const posComplement = result.posComplement.map((posComplement) => {
        return <tr><td key={posComplement[0]} >{posComplement[0]}</td><td style={{width: '800px'}} key={posComplement[1].product}>{posComplement[1].product}&nbsp;</td><td key={posComplement[1].sPos}>{posComplement[1].sPos}</td><td key={posComplement[1].ePos}>{posComplement[1].ePos}</td></tr>
    });
    const k = 'Kmer: ';
    const kmer = `${result.kmer}`;
    const frequency = ' Frequency: ';
    const termFreq = `${result.tf[0]}`;
    return (        
        <div id="products-list">
            <div style={{paddingTop:'0px !important'}}>
                <b>{k}</b>
                {kmer}
                <b>{frequency}</b>
                {termFreq}
                <br/>
                <h4>Template Strand</h4>
                 <table width="100%"><th>Kmer Position</th><th>Gene Product</th><th>Start Position &nbsp;</th><th>End Position</th>{pos}</table>
                <br/>
            </div>
            <div>
            <h4>Complementary Strand</h4>
            <table width="100%"><th>Kmer Position</th><th>Gene Product</th><th>Start Position &nbsp;</th><th>End Position</th>{posComplement}</table>
            </div>
       </div>
    );
}

export default Kmers;