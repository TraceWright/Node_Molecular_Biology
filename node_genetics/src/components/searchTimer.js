import React from 'react';

const SearchTimer = ({timer}) => {
    const searchTime = timer / 100;
    
    return (
        <div>
            <label>{searchTime} seconds</label> 
        </div>
    )
}

export default SearchTimer;