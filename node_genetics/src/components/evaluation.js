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

    let stats = [];
    let indSiz = Object.keys(props.indexStats).forEach(function(key) {
        // <label>{ props.indexStats[key].name }</label>
        let name = props.indexStats[key].name;
        let totInd = props.indexStats[key].totalIndexSize;
        stats.push([name, totInd]);
    });

let a = 0;
    const orgInd = stats.map((stat) => {
        a++
        return <div key={a}><label style={{ fontWeight: 'bold' }}>&emsp;&emsp;{ stat[0] }</label><label>:&nbsp;{ Math.round(stat[1]/1024) }&nbsp; kb</label><br/><br/></div>
    });


    return (
        <div>
            <h3>Efficiency</h3>
            <label>Search Time: { props.searchTime } seconds</label><br/><br/>
            <label id="index-time">Indexing Time: { props.indexTime } seconds</label><br/><br/>
            <label id="index-stor">Index Sizes: </label><br/><br/>
            {orgInd}
            {/* <label>Index Size: </label>  */}
            <hr id="line" style={{ width: '500px', float: 'left' }}/><br/>
        </div>
    );
};

export default Evaluation;