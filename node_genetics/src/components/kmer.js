import React from 'react';

const Kmers = ({result}) => {

    let r = Object.entries(result);
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