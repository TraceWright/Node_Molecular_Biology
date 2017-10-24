import React from 'react';
import { ListGroupItem } from 'react-bootstrap';
import Kmers from './kmer';


const ResultListItem = ({result}) => {
   result.pop();
   let a = 0;

    const kmers = result.map((km) => {
        a++
        return <Kmers key={a} result={km} />
    });
    const on = 'Organism: ';
    const sl = 'Sequence Length: ';
    let organismName = '';
    let sequenceLength = '';
    if (result.length > 0) {
        organismName = `${result[0].organism}`;
        sequenceLength = `${result[0].seqLength} base pairs`;
    } else {
        organismName = '';
        sequenceLength = '';
    }

   return (
       // <div>this</div>
        <ListGroupItem>
            <b>{on}</b>
            {organismName}
            <br/>
            <b>{sl}</b>
            {sequenceLength}
            <br/><br/>
            {kmers}
            <hr id="line"/>
        </ListGroupItem>
    )
}

export default ResultListItem;
