import { useState } from "react"
import { NamePicker } from "./misc/misc"

export const SummaryTable = ({records,pickMacro,vars}) =>{
    let dict
    const [summaryYear,setSummaryYear] = useState('All')
    if(summaryYear==='All'){dict=records['overall']}else{dict=records['year'][summaryYear]}
    const pickSumYear = <NamePicker title={'Year: '} showAll={true} selecting={setSummaryYear} curval={summaryYear} options={vars.activeYears} key={'st'}></NamePicker>
    const relevantChoices=[pickMacro,pickSumYear]
    let out = []
    let cols = []
    let colDecs =[]
    let nameCells = []
    for (const name in dict['W']){
        if(name=='t0'){continue}
        if(dict['games played'][name]==0){continue}
        nameCells.push(<div className="headerCell"><p className="txt">{name}</p></div>)
    }
    cols.push(<div className="tableRow">
        <div className="headerCell"><p className="txt">Name</p></div>
        {nameCells}
    </div>)
    for (const key in dict){
        if(key=='point stats'){continue}
        if(key=='ind records'){continue}
        colDecs.push(<col></col>)
        let vals = []
        for(const name in dict[key]){
            if(name=='t0'){continue}
            if(dict['games played'][name]==0){continue}
            let value
            if(key=='Record vs Mid'){value = dict[key][name][0]+'-'+dict[key][name][1]+'-'+dict[key][name][2]}
            else if(key=='KO by'||key=='last until'){value=dict[key][name]}
            else{value =Math.round(100*dict[key][name])/100}
            vals.push(<div className="tableCell"><p className="txt">{value}</p></div>)
        }
        cols.push(
            <div className="tableRow">
                <div className="headerCell"><p className="txt">{key}</p></div>
                {vals}
            </div>

        )
    }
    // out.push(<div className="tableColumn">
    //     {cols}
    // </div>)
    // console.log({1:out,2:dict})
    out = 
    <div>
        <div className='topContainer' key={'topcontsum'}>
            <div className='buttonsContainer' key={'butcont'}>
                {relevantChoices}
            </div>  
        </div>
        <div className="container2">
            {cols}
        </div>
    </div>
    return out

}