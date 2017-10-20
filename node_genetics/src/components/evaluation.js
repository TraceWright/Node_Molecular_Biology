
import React from 'react';

function displayTimer(time, uiElement) {
    time.minutes > 0 ? uiElement.innerText = `${time.minutes}:${Math.round(time.seconds)} minutes`: uiElement.innerText = `${Math.round(time.seconds)} seconds`;
}

const Evaluation = (props) => {
    console.log(props);
    return (
        <div>
            <h3>Efficiency</h3>
            <label>Search Time: { props.searchTime }</label><br/>
            <label id="index-time">Indexing Time: {`${props.indexTime.minutes}:${Math.round(props.indexTime.seconds)} minutes`}</label><br/>
            <label>Index Size: </label> 
            <h3>Efficacy</h3> 
        </div>
    );
};

export default Evaluation;