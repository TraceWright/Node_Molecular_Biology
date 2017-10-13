import React from 'react';

const Kmers = ({result}) => {
    console.log(result);
    result.pos = '';    // temporarily removed data for development
    result.posComplement = '';  // temporarily removed data for development
    let r = Object.entries(result);
    console.log(r);
    let b = 0;
    const k = r.map((km) => {
        b++
        return <li key={b} >{km}</li>
    })

    return (
        <ul style={{ listStyle: 'none' }}>{k}</ul>
    );
}

export default Kmers;