import React from 'react';
import { ListGroupItem } from 'react-bootstrap';
import Kmers from './kmer';


const ResultListItem = ({result}) => {
   //const results = props.queryResults;
//    console.log('result');
//    console.log(result);
   result.pop();
   let a = 0;

    const kmers = result.map((km) => {
        a++
        return <Kmers key={a} result={km} />
    });

    const organismName = `Organism: ${result[0].organism}`;
    const sequenceLength = `Sequence Length: ${result[0].seqLength} base pairs`;

   return (
        <ListGroupItem>
            {organismName}
            <br/>
            {sequenceLength}
            {kmers}
            <hr id="line"/>
        </ListGroupItem>
    )
}

export default ResultListItem;
