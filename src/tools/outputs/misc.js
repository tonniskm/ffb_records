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
return(<div>
    <label >{props.title}</label>
    <select onChange={(x)=>handleChange(x)}>
            {options}
    </select>
</div>)
}

export const NumberPicker = (props)=>{
    function handleChange(x){
        if(!isNaN(x.target.value)){
            props.selecting(Math.max(1,Math.round(x.target.value)))
        }
    }
let out = <div>
<label for="quantity">Number of Selected Scores to Show:</label>
<input type="number" id="quantity" name="quantity" min="1" max="5000" onChange={(x)=>handleChange(x)}></input>
</div>
    return out
}