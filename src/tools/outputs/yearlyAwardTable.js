import { useState } from "react"
import { NamePicker } from "./misc/misc"

export const YearlyAwardTable = ({records,pickMacro,vars})=>{
    let out = []
    let rows = []
    const [selectedYear,setSelectedYear] = useState(vars.activeYears[vars.activeYears.length-1])
    const pickYear = <NamePicker title={'Year: '} showAll={false} selecting={setSelectedYear} curval={selectedYear} options={vars.activeYears} key={'yearp'}></NamePicker>
    const relevantChoices=[pickMacro,pickYear]
    const dict = records.yearSum[selectedYear]
    for (const key in dict){
        if(key=='league reg pts'){continue}
        const value = Math.round(100*dict[key]['value'])/100
        let owner = dict[key]['name']
        if(Array.isArray(owner)){owner=owner.join(', ')}
        rows.push(
            <div className="tableRow" key={key}>
                <div className="headerCell"><p className="txt">{key}</p></div>
                <div className="tableCell"><p className="txt">{value}</p></div>
                <div className="tableCell"><p className="txt">{owner==='t0'?'None':owner
                +(Object.keys(dict[key]).includes('week')?` (Week ${dict[key]['week'].join(', ')})`:'')
                +(Object.keys(dict[key]).includes('oppo')?` vs. ${dict[key]['oppo'].join(', ')}: ${dict[key]['oppoScore'].join(', ')}`:'')
                +(Object.keys(dict[key]).includes('scores')?` [${dict[key]['scores'].join(' - ')}]`:'')
                +(Object.keys(dict[key]).includes('rank')?` (#${dict[key]['rank']} of ${dict[key]['totalEligible']})`:'')
                }</p></div>
            </div>
        )
    }
    // out.push(<div className="tableColumn">
    //     {cols}
    // </div>)
    // console.log({1:out,2:dict})
    out = 
    // <div>
    [<div className='topContainer' key={'topcontyear'}>
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