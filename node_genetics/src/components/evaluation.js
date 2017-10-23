import React from 'react';
import IndexSizes from './indexSizes';

// function displayTimer(time, uiElement) {
//     time.minutes > 0 ? uiElement.innerText = `${time.minutes}:${Math.round(time.seconds)} minutes`: uiElement.innerText = `${Math.round(time.seconds)} seconds`;
// }

const Evaluation = (props) => {
    // console.log(props);

    if (props.indexStats.length > 0) {
        let objArray = props.indexStats.Object.values();
        console.log(objArray);
    }

    let names = [];
    let indSiz = Object.keys(props.indexStats).forEach(function(key) {
        // <label>{ props.indexStats[key].name }</label>
        names.push(props.indexStats[key].name);
    })
    console.log(names);

    const orgInd = names.map((name) => {
        return <h4>&emsp;&emsp;{ name }</h4>
    })


    return (
        <div>
            <h3>Efficiency</h3>
            <label>Search Time: { props.searchTime } seconds</label><br/>
            <label id="index-time">Indexing Time: { props.indexTime }</label><br/>
            {orgInd}
            {/* <label>Index Size: </label>  */}
            <hr id="line" style={{ width: '400px', float: 'left' }}/><br/>
            <h3>Efficacy</h3> 
        </div>
    );
};

export default Evaluation;