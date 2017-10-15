import React from 'react';

const Kmers = ({result}) => {
    // console.log(result);
    result.pos = '';    // temporarily removed data for development
    result.posComplement = '';  // temporarily removed data for development
    let r = Object.entries(result);
    console.log('r');
    console.log(r);
    let b = 0;
    const k = r.map((km) => {
        b++
        return <li key={b} >{km}</li>
    })
   const kmer = `Kmer: ${result.kmer}`;
   console.log(kmer);
    return (
        <ul style={{ listStyle: 'none' }}>
            {kmer}
            {k}

        </ul>
    );
}

export default Kmers;