import { useLayoutEffect, useRef, useState } from "react"
import { NamePicker } from "./misc/misc"


export const FantasyTeams =({dict,vars,pickMacro})=>{
    const [focusName,setFocusName] = useState('All')
    const stickyRef = useRef(null)
    const [stickyHeight,setStickyHeight] = useState(0)
    useLayoutEffect(() => {
        if (stickyRef.current) {
            setStickyHeight(stickyRef.current.offsetHeight)
        }
    }, []) // empty dependency ensures this runs once after first layout
    // const stickyHeight = stickyRef.current?.offsetHeight || 0; // Sticky header height
    const pickName = <NamePicker title={'Filter By Name: '} showAll={true} selecting={setFocusName} curval={focusName} options={vars.activeNames} key={'name'}></NamePicker>
    const relevantChoices=[pickMacro,pickName]
    let rows = []
    let body = []
    for(const name in dict){
        if(focusName!='All'&&focusName!=name){continue}
        body.push(<div className="headerCell" key={'headercell'+name}><p className="txt">{name}</p></div>)
    }
    rows.push(<div className="tableRow headerRow" style={{top:stickyHeight,zIndex:3}} key={'headerrow'}>
        <div className="headerCell headerRow" style={{top:stickyHeight,zIndex:3,left:0}}><p className="txt">Pos</p></div>
        {body}
    </div>)

for(const pos in dict['Kevin']){
    if(pos=='Total'){continue}
    let body1 = []
    for(const name in dict){
        if(focusName!='All'&&focusName!=name){continue}
            const val = dict[name][pos][0]+'\n'+dict[name][pos][1].name+'\n'+dict[name][pos][1].meta[0]+' Week '+dict[name][pos][1].meta[1]
            body1.push(<div className="tableCell recordCell" key={name+pos}><p className="txt">{val}</p></div>)
        }
        rows.push(<div className="tableRow" key={pos}>
            <div className="headerCell headerRow" style={{left:0,zIndex:2}}><p className="txt">{pos}</p></div>
            {body1}
        </div>)
    }
let finalRowBody = []
for(const name in dict){
    if(focusName!='All'&&focusName!=name){continue}
    finalRowBody.push(<div className="tableCell recordCell" key={name}><p className="txt">{Math.round(100*dict[name]['Total'])/100}</p></div>)
}
 rows.push(<div className="tableRow" key={'total'}>
    <div className="headerCell headerRow" style={{left:0,zIndex:2}}><p className="txt">Total</p></div>
    {finalRowBody}
 </div>)   


const out = 

[<div className='topContainer' key={'topcontfantasyteams'} ref={stickyRef}>
    <div className='buttonsContainer' key={'butcont'}>
        {relevantChoices}
    </div>  
</div>,
<div className="tableContainer" key={'2nd'}>
{rows}
</div>]
// </div>
    return out

}