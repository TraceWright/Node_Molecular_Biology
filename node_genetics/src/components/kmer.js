import React from 'react';

const Kmers = ({result}) => {
    result.kmer.pop();
    let b = 0;
    const k = result.kmer.map((km) => {
        b++
        return <li key={b} >{km}</li>
    })

    return (
        <ul style={{ listStyle: 'none' }}>{k}</ul>
    );
}

export default Kmers;