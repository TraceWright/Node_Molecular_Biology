import React from 'react';
import { ListGroupItem } from 'react-bootstrap';


const ResultListItem = ({result}) => {
   //const results = props.queryResults;
    return (
        <ListGroupItem>{result.k}</ListGroupItem>
    )
}

export default ResultListItem;
