import { useState } from "react"
import { NamePicker } from "./misc/misc"


export const FantasyTeams =({dict,vars,pickMacro})=>{
    const [focusName,setFocusName] = useState('All')
    const pickName = <NamePicker title={'Filter By Name: '} showAll={true} selecting={setFocusName} curval={focusName} options={vars.activeNames} key={'name'}></NamePicker>
    
    const relevantChoices=[pickMacro,pickName]
    let rows = []
    let body = []
    for(const name in dict){
        if(focusName!='All'&&focusName!=name){continue}
        body.push(<div className="headerCell"><p className="txt">{name}</p></div>)
    }
    rows.push(<div className="tableRow">
        <div className="headerCell"><p className="txt">Pos</p></div>
        {body}
    </div>)

for(const pos in dict['Kevin']){
    if(pos=='Total'){continue}
    let body1 = []
    for(const name in dict){
        if(focusName!='All'&&focusName!=name){continue}
            const val = dict[name][pos][0]+'\n'+dict[name][pos][1].name+'\n'+dict[name][pos][1].meta[0]+' Week '+dict[name][pos][1].meta[1]
            body1.push(<div className="tableCell recordCell"><p className="txt">{val}</p></div>)
        }
        rows.push(<div className="tableRow">
            <div className="headerCell"><p className="txt">{pos}</p></div>
            {body1}
        </div>)
    }
let finalRowBody = []
for(const name in dict){
    if(focusName!='All'&&focusName!=name){continue}
    finalRowBody.push(<div className="tableCell recordCell"><p className="txt">{Math.round(100*dict[name]['Total'])/100}</p></div>)
}
 rows.push(<div className="tableRow">
    <div className="headerCell"><p className="txt">Total</p></div>
    {finalRowBody}
 </div>)   


const out = 
{/* <div> */}
[<div className='topContainer' key={'topcontfantasyteams'}>
    <div className='buttonsContainer' key={'butcont'}>
        {relevantChoices}
    </div>  
</div>,
<div className="tableContainer">
{rows}
</div>]
// </div>
    return out

}