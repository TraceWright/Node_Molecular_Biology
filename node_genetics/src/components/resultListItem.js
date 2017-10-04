import React from 'react';
import { ListGroupItem } from 'react-bootstrap';
import Kmers from './kmer';


const ResultListItem = ({result}) => {
   //const results = props.queryResults;

   result.splice(result.length - 1,1);
   let a = 0;

    const kmers = result.map((km) => {
        a++
        return <Kmers key={a} result={km} />
    })
   return (
        <ListGroupItem>
            {kmers}
            <hr id="line"/>
        </ListGroupItem>
    )
}

export default ResultListItem;
