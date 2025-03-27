export const NamePicker = (props)=>{
    // console.log(props.options)
    const options = [<option value='All' key={'All1'}>All</option>]
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