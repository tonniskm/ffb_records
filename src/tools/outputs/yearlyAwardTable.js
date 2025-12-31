import { useState } from "react"
import { NamePicker } from "./misc/misc"

const needWeekNo = ['high score','low score','low high','high low','blowout','close game','shootout','defensive','high L','low W']
const needOppo = ['high L','low W']
const needScores = ['close game','shootout','defensive','blowout']
export const YearlyAwardTable = ({records,pickMacro,vars})=>{
    let out = []
    let rows = []
    const [selectedYear,setSelectedYear] = useState(vars.activeYears[vars.activeYears.length-1])
    const pickYear = <NamePicker title={'Year: '} showAll={false} selecting={setSelectedYear} curval={selectedYear} options={vars.activeYears} key={'yearp'}></NamePicker>
    const relevantChoices=[pickMacro,pickYear]
    const dict = records.yearSum[selectedYear]
    for (const key in dict){
        if(key=='league reg pts'){continue}
        const value = Math.round(100*dict[key][0])/100
        let owner = dict[key][1]
        if(Array.isArray(owner)){owner=owner.join(', ')}
        // if(needWeekNo.includes(key)){console.log(key,dict[key])}
        rows.push(
            <div className="tableRow" key={key}>
                <div className="headerCell"><p className="txt">{key}</p></div>
                <div className="tableCell"><p className="txt">{value}</p></div>
                <div className="tableCell"><p className="txt">{owner==='t0'?'None':owner
                +(needWeekNo.includes(key)?` (Week ${dict[key][2].join(', ')})`:'')
                +(needOppo.includes(key)?` vs. ${dict[key][3].join(', ')}: ${dict[key][4].join(', ')}`:'')
                +(needScores.includes(key)?` [${dict[key][dict[key].length-1].join(' - ')}]`:'')
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