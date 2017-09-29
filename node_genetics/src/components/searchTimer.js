import React from 'react';

const SearchTimer = ({timer}) => {
    console.log(timer);
    const searchTime = timer / 100;
    console.log(searchTime);
    
    return (
        <div>
            <label>{searchTime} seconds</label> 
        </div>
    )
}

export default SearchTimer;