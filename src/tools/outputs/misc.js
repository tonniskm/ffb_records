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
    props.selecting(x.target.value)
}
return(<div className="buttons">
    <label >{props.title}</label>
    <select onChange={(x)=>handleChange(x)} className="wordPicker">
            {options}
    </select>
</div>)
}

export const NumberPicker = (props)=>{
    function handleChange(x){
        if(!isNaN(x.target.value)){
            props.selecting(Math.max(0,Math.round(x.target.value)))
        }
    }
let out = <div className="buttons">
<label htmlFor="quantity">Number of Selected Scores to Show: </label>
<input type="number" id="quantity" name="quantity" min="0" max="5000" onChange={(x)=>handleChange(x)} value={props.curval}
 className="numberPicker"></input>
</div>
    return out
}