import React from 'react';
import Products from './products.js';

const Kmers = ({result}) => {
    // console.log(result);
    // result.pos = '';    // temporarily removed data for development
    // result.posComplement = '';  // temporarily removed data for development
    let r = Object.entries(result);
    console.log('r');
    console.log(r);
    let b = 0; 
    let c = 0;
    let d = 0;
    // const products = r.map((prod) => {
    //     b++
    //     return <li key={b} >{prod}</li>
    // })
    console.log('pos');
    console.log(result.pos);
    const pos = result.pos.map((pos) => {
        b++
        d++
        return <div><label key={pos[0]} >{pos[0]} &nbsp;</label><label key={pos[1].product}>{pos[1].product}</label></div>
    });
    const posComplement = result.posComplement.map((posComplement) => {
        c++
        return <label key={c} >{posComplement[0]} &nbsp;</label>
    });
   const kmer = `Kmer: ${result.kmer}`;
   const termFreq = `Kmer Frequency: ${result.tf[0]}`;
   console.log(kmer);
    return (
        <ul style={{ listStyle: 'none' }}>
            {kmer}
            <br/><br/>
            {termFreq}
            <br/><br/>
            <label>Template Strand Positions:</label>
            <br/><br/>
            {pos} &nbsp;
            <br/><br/>
            <label>Complementary Strand Positions:</label>
            <br/><br/>
            {posComplement}
        </ul>
    );
}

export default Kmers;