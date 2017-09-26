import React from 'react';
import { ListGroupItem } from 'react-bootstrap';
import Kmers from './kmer';


const ResultListItem = ({result}) => {
   //const results = props.queryResults;

   result.splice(0,1);
   console.log('result')
   console.log(result)
   let a = 0;

    const kmers = result.map((km) => {
        console.log('km')
        console.log(km)
        a++
        return <Kmers key={a} result={km} />
    })
   return (
        <ListGroupItem>
            {kmers}
            {/* {result[0]}
            {result[1].kmer[0]} */}
        </ListGroupItem>
    )
}

export default ResultListItem;
