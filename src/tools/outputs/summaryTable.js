import { useLayoutEffect, useRef, useState } from "react"
import { NamePicker } from "./misc/misc"
import { RecordToFrac, SummaryLine } from "../calculations/other"

export const SummaryTable = ({records,pickMacro,vars}) =>{
    let dict
    const [summaryYear,setSummaryYear] = useState('All')
    const [focusName,setFocusName] = useState('All')
    const stickyRef = useRef(null)
    const [stickyHeight,setStickyHeight] = useState(0)
    useLayoutEffect(() => {
        if (stickyRef.current) {
            setStickyHeight(stickyRef.current.offsetHeight)
        }
    }, []) // empty dependency ensures this runs once after first layout
    if(summaryYear==='All'){dict=records['overall']}else{dict=records['year'][summaryYear]}
    const pickSumYear = <NamePicker title={'Year: '} showAll={true} selecting={setSummaryYear} curval={summaryYear} options={vars.activeYears} key={'st'}></NamePicker>
    const pickName = <NamePicker title={'Filter By Name: '} showAll={true} selecting={setFocusName} curval={focusName} options={vars.activeNames} key={'1name'}></NamePicker>
    const relevantChoices=[pickMacro,pickSumYear,pickName]
    let out = []
    let cols = []
    // let colDecs =[]
    let nameCells = []
    for (const name in dict['W']){
        if(name=='t0'){continue}
        if(dict['games played'][name]==0){continue}
        if(focusName!=='All'&&name!==focusName){continue}
        nameCells.push(<div className="headerCell" key={name}><p className="txt" key={name+'txt'}>{name}</p></div>)
    }
    cols.push(<div className="tableRow headerRow" style={{zIndex:4,top:stickyHeight}} key={'headerrow'}>
        <div className="headerCell headerRow" style={{top:stickyHeight,zIndex:4,left:0}} key={'headrow1'}><p className="txt" key={'headrow2'}>Name</p></div>
        {nameCells}
    </div>)
    for (const key in dict){
        if(key=='point stats'){continue}
        if(key=='ind records'){continue}
        // colDecs.push(<col></col>)
        let allVals,myVal
        const showComp = key!=='KO by'
        if(showComp){
            const lameVals = dict[key]
            const filtVals = Object.fromEntries(Object.entries(lameVals).filter(([k])=>vars.activeNames.includes(k)))
            allVals=key!=='Record vs Mid'?Object.values(filtVals):Object.values(filtVals).map(x=>RecordToFrac(x))}
        let vals = []
        for(const name in dict[key]){
            if(name=='t0'){continue}
            if(dict['games played'][name]==0){continue}
            if(focusName!=='All'&&name!==focusName){continue}
            let value
            if(key=='Record vs Mid'){value = dict[key][name][0]+'-'+dict[key][name][1]+'-'+dict[key][name][2];
                myVal = RecordToFrac(dict[key][name])
            }
            else if(key=='KO by'||key=='last until'){value=dict[key][name]}
            else{value =Math.round(100*dict[key][name])/100;myVal = dict[key][name]}
            vals.push(<div className="tableCell" key={name+'1'}>
                <p className="txt" key={name+'txt1'}>{value}</p>
                {showComp&&<p className="txt" key={name+'txt2'}>{!vars.activeNames.includes(name)?'    N/A    ':SummaryLine(myVal,allVals,'max')}</p>}
                </div>)
        }
        cols.push(
            <div className="tableRow" key={key}>
                <div className="headerCell headerRow" style={{left:0,zIndex:3}} key={'a'+key}><p className="txt" key={'b'+key}>{key}</p></div>
                {vals}
            </div>

        )
    }
    // out.push(<div className="tableColumn">
    //     {cols}
    // </div>)
    // console.log({1:out,2:dict})
    out = 
    // <div style={{alignItems:'flex-start',justifyContent:'left',display:'inline-block',flexDirection:"column",backgroundColor:'blue',width:'auto'}}>
        [<div className='topContainer' key={'topcontsum'} ref={stickyRef}>
            <div className='buttonsContainer' key={'butcont'}>
                {relevantChoices}
            </div>  
        </div>,
        <div key={'bot2nd'}><div className="tableContainer" key={'2nd'}>
            {cols}
        </div></div>]
    {/* </div> */}
    return out

}