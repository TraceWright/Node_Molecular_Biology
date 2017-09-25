import React from 'react';
import { ListGroup } from 'react-bootstrap';
import ResultListItem from './resultListItem';

const ResultList = (props) => {
    console.log(props);
    const resultItems = props.results.map((result) => {
        return <ResultListItem key={result._id} result={result}/>
    })
    return (
        
        <ListGroup>
            {resultItems}
        </ListGroup>
    );
};

export default ResultList;