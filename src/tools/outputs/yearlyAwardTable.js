import { useState } from "react"
import { NamePicker } from "./misc/misc"


export const YearlyAwardTable = ({records,pickMacro,vars})=>{
    let out = []
    let rows = []
    const [selectedYear,setSelectedYear] = useState(2024)
    const pickYear = <NamePicker title={'Year: '} showAll={false} selecting={setSelectedYear} curval={selectedYear} options={vars.activeYears} key={'yearp'}></NamePicker>
    const relevantChoices=[pickMacro,pickYear]
    const dict = records.yearSum[selectedYear]
    for (const key in dict){
        if(key=='league reg pts'){continue}
        const value = Math.round(100*dict[key][0])/100
        let owner = dict[key][1]
        if(Array.isArray(owner)){owner=owner.join(', ')}
        rows.push(
            <div className="tableRow">
                <div className="headerCell"><p className="txt">{key}</p></div>
                <div className="tableCell"><p className="txt">{value}</p></div>
                <div className="tableCell"><p className="txt">{owner}</p></div>
            </div>

        )
    }
    // out.push(<div className="tableColumn">
    //     {cols}
    // </div>)
    // console.log({1:out,2:dict})
    out = 
    <div>
    <div className='topContainer' key={'topcont'}>
        <div className='buttonsContainer' key={'butcont'}>
            {relevantChoices}
        </div>  
    </div>
    <div className="tableContainer">
        {rows}
    </div>
    </div>
    return out

}