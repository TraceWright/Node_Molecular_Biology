
import React from 'react';

const Evaluation = (props) => {
    console.log(props);
    return (
        <div>
            <h3>Efficiency</h3>
            <label>Search Time: { props.searchTime.searchTime }</label>
            <label>Indexing Time: { props.indexTime.indexTime }</label> 
            <label>Index Size: </label> 
            <h3>Efficacy</h3> 
        </div>
    );
};

export default Evaluation;