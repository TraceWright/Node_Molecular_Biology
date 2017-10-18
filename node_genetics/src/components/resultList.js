import React from 'react';
import { ListGroup } from 'react-bootstrap';
import ResultListItem from './resultListItem';

const ResultList = (props) => {
    let a = 0;
    const resultItems = props.results.map((result) => {
        a++
        return <ResultListItem key={a} result={result} />
    });
    return (        
        // <div>this</div>
        <ListGroup>
            {resultItems}
        </ListGroup>
    );
};

export default ResultList;