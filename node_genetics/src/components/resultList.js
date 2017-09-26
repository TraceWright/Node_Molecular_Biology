import React from 'react';
import { ListGroup } from 'react-bootstrap';
import ResultListItem from './resultListItem';

function initElement(elem) {
    elem.push({ kmer: ['', 0, []] })
};

const ResultList = (props) => {
    console.log(props);
    let uninvertedList = [];
    if (props.results.length > 0) {
        props.results.forEach(function(element) {
        
            for (let i = 0; i < element.d.length; i++) {
            let docNo = element.d[i][0];
            
            uninvertedList[docNo] ? null : uninvertedList.push( [docNo] );
            }

            for (let j = 0; j < element.d.length; j++) {
            
                    for (let k = 0; k < uninvertedList.length; k++) {

                        if (uninvertedList[k][0] === element.d[j][0]) {
                            initElement(uninvertedList[k]);
                            uninvertedList[k][uninvertedList[k].length-1].kmer[0] = element.k;
                            uninvertedList[k][uninvertedList[k].length-1].kmer[1] = element.d[j][1];
                            uninvertedList[k][uninvertedList[k].length-1].kmer[2] = element.d[j][2];
                        }
                    }
            };
        })
       console.log(uninvertedList);
    }
    // const resultItems = props.results.map((result) => {
    //     return <ResultListItem key={result._id} result={result}/>
    // })
    const resultItems = uninvertedList.map((result) => {
        console.log(result)
        return <ResultListItem key={result[0]} result={result} />
    })
    return (        
        <ListGroup>
            {resultItems}
        </ListGroup>
    );
};

export default ResultList;