import { useState } from "react"
import { NamePicker } from "./misc/misc"


export const MatchupTable = ({pickMacro,dict,vars})=>{
    const [focusName,setFocusName] = useState('All')

    const pickName = <NamePicker title={'Filter By Name: '} showAll={true} selecting={setFocusName} curval={focusName} options={vars.activeNames} key={'name'}></NamePicker>
    const relevantChoices=[pickMacro,pickName]
    let cols = []
    let col1 = []
    for(const name in dict){
        if(name=='t0'){continue}
        col1.push(<div className="headerCell" key={name}><p className="txt">{name}</p></div>)
    }
    cols.push(<div className="tableRow">
        <div className="headerCell" key={'head'}>name</div>
        {col1}
    </div>)
    for(const name1 in dict){
        if(name1=='t0'){continue}
        let colbody =[]
        if(focusName!='All'&&name1!=focusName){continue}
        for(const name2 in dict[name1]){
            if(name2=='t0'){continue}
            let val
            if(name1==name2){val='x'}
            else{val = dict[name1][name2][0] +' - '+dict[name1][name2][1]+' - '+dict[name1][name2][2]}
            colbody.push(<div className="tableCell recordCell" key={name2+'n2'}><p className="txt">{val}</p></div>)
        }
            cols.push(<div className="tableRow" key={name1+'n1'}>
                        <div className="headerCell"><p className="txt">{name1}</p></div>
                        {colbody}
                    </div>)

    }
const out = 
[<div className='topContainer' key={'topcontmatchup'}>
    <div className='buttonsContainer' key={'butcont'}>
        {relevantChoices}
    </div>  
</div>,
    <div>
        <p className="titleTxt">Row's record vs Column.  Consolation games are ignored.</p>
    <div className="tableContainer">
        {cols}
    {/* <p>helloworld</p> */}
    </div>
</div>]
// </div>
// console.log(cols)
// const out = <p>hello world</p>
return out
}