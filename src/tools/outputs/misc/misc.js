

export const NamePicker = (props)=>{
    // console.log(props.options)
    let options = []
    if(props.showAll){
        options = [<option value='All' key={'All1'}>All</option>]

    }
    for(const option of props.options){
        options.push(<option value={option} key={'test'+option}>{option}</option>)
    }
function handleChange(x){
    if(props.freezeScroll){
        const {scrollRef,stickyRef,id,rowRef} = props.scrollInfo
        rowRef.current = findTopRow(scrollRef,stickyRef,id)
        props.selecting(x.target.value)
    }else{
        props.selecting(x.target.value)
    }
}
return(<div className="buttons">
    <label style={{textWrap:"nowrap"}}>{props.title}</label>
    <select onChange={(x)=>handleChange(x)} className="wordPicker" value={props.curval}>
            {options}
    </select>
</div>)
}

export const NumberPicker = (props)=>{
    function handleChange(x){
        if(props.freezeScroll){
            const {scrollRef,stickyRef,id,rowRef} = props.scrollInfo
            rowRef.current = findTopRow(scrollRef,stickyRef,id)
            props.selecting(x.target.value)
        }else{
            props.selecting(x.target.value)
        }
    }
let out = <div className="buttons">
<label htmlFor="quantity" style={{textWrap:"nowrap"}}>Number of Comparison Scores to Show: </label>
<input type="number" id="quantity" name="quantity" min="0" max="5000" onChange={(x)=>handleChange(x)} value={props.curval}
 className="numberPicker"></input>
</div>
    return out
}

export function findTopRow(scrollRef,stickyRef,rowID){
    const container = scrollRef.current;
    const stickyHeight = stickyRef.current?.offsetHeight || 0; // Height of the sticky div
    const scrollTop = container.scrollTop;
    const allRows = container.querySelectorAll('['+rowID+']');

    for (const el of allRows){
        const rect = el.getBoundingClientRect();
        const rowTop = rect.top + scrollTop;  // Actual top position relative to the container
        const rowBottom = rect.bottom + scrollTop;
        const bottomOfScrollView = scrollRef.scrollTop + scrollRef.clientHeight;
        if(rowTop>=scrollTop+stickyHeight||rowBottom>=bottomOfScrollView){return el.getAttribute(rowID);break}
        };
    // console.log(topRow)
}
// import React, { useState, useRef, useEffect } from 'react';

// const suggestionsList = ['Apple', 'Banana', 'Cherry', 'Date'];

// function UpdateFilters(scrollRef){
//     const container = scrollRef.current;
//       const stickyHeight = stickyRef.current?.offsetHeight || 0; // Height of the sticky div
//       const scrollTop = container.scrollTop;
//       const allRows = container.querySelectorAll('[data-row]');
//     //   console.log(allRows)
//     //   allRows.forEach(el => {
//     //     const rect = el.getBoundingClientRect();
//     //     const rowTop = rect.top + scrollTop;  // Actual top position relative to the container
//     //     const rowBottom = rect.bottom + scrollTop;
//     //     if(el.getAttribute('data-row')===5){console.log({scrollTop,rowTop})}
//     //   })
//         const rect = allRows[5].getBoundingClientRect() 
//             const rowTop = rect.top + scrollTop;  // Actual top position relative to the container
//         const rowBottom = rect.bottom + scrollTop;
//         console.log({scrollTop,rowTop,stickyHeight,3:allRows[5].getAttribute('data-row')})  
// }