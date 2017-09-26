import React from 'react';

const Kmers = ({result}) => {
    console.log('result');
    console.log(result);
    result.kmer.pop();
    console.log(result);
    let b = 0;
    const k = result.kmer.map((km) => {
        console.log('kmerrr');
        console.log(km);
        b++
        return <li key={b} >{km}</li>
    })
    

    return (
        <ul style={{ listStyle: 'none' }}>{k}</ul>
    );
}

export default Kmers;