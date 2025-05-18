import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { RecordToFrac, Round } from "../calculations/other"
import { NamePicker, NumberPicker } from "./misc/misc"
import SuggestionInput from "./misc/suggestionPicker"

export const PlayerTable = ({pickMacro,vars,records})=>{
    const [focusName,setFocusName] = useState('All')
    const [numToShow,setNumToShow] = useState(1) 
    const [focusNFL,setFocusNFL] = useState('All')
    const stickyRef = useRef(null)
    const [stickyHeight,setStickyHeight] = useState(0)
    useLayoutEffect(() => {
        if (stickyRef.current) {
            setStickyHeight(stickyRef.current.offsetHeight)
        }
    }, []) // empty dependency ensures this runs once after first layout

    const pickName = <NamePicker title={'Filter by Name: '} showAll={true} selecting={setFocusName} curval={focusName} options={vars.activeNames} key={'name'}></NamePicker>
    const pickNum =  <NumberPicker key={'pnu'} selecting={setNumToShow} curval={numToShow}></NumberPicker>
    let pickNFL = [SuggestionInput(vars.allNFLNames,focusNFL,setFocusNFL)]
    if(focusNFL!=='All'){pickNFL.push(<button key={'reset'} onClick={()=>setFocusNFL('All')}>Unfilter by NFL Name</button>)}
    const relevantChoices=[pickMacro,pickName,pickNFL,pickNum]
    const dataTable = records.bestPlayers
    let headers = []
    let body = []
    // const focusName = props.focus.name
    // const focusNFL = props.focus.NFLName
    // useEffect(()=>{setNumToShow(1)},[]) // on mount set show top to 1
    function getAward(vals,keyName){
        const filtered = vals.filter(x=>x.name===focusNFL||focusNFL==='All')
        // const filtered = vals
        if(filtered.length>0){
            const sorted = filtered.sort((a,b)=>a.rank-b.rank)
            let outList = []
            for(let i=0;i<Math.min(sorted.length,Math.max(1,numToShow));i++){
                const best = sorted[i]
                let val = Round(best.value)
                let meta = []
                
                for(const key in best.meta){
                    const metaList = ['year','week']
                    if(key==='team'){continue} //i already know the owner name
                    if(!isNaN(key)){if(key>1){continue}}//skip 2nd meta if tied.  I don't care.
                    let mess = best.meta[key]
                    if(Array.isArray(mess)){mess=(Round(RecordToFrac(mess)*100)).toString()+'%'}  //if is record
                    meta.push((isNaN(key)?key:metaList[key])+': '+mess+' ')}
                
                outList = outList.concat(<p className="txt" key={'list'+i}>{best.name}</p>,
                    <p className="txt" key={'list1'+i}>({best.rank} of {vals.length})</p>,
                    <p className="txt" key={'list2'+i}>{val}</p>,<p className="txt" key={'list3'+i}>{meta}</p>)
                if(i!=Math.min(sorted.length,Math.max(1,numToShow))-1){outList.push(<p key={'skip'+i}>----------------------</p>)}
            }
            return <div className="tableCell" key={'tc'+keyName}>{outList}</div>
        }else{return(<div className="tableCell" key={'na'+keyName}><p className="txt">NA</p></div>)}
    }

    for(const name in dataTable){
        if(focusName!=='All'&&name!==focusName){continue}
        let bodyData = []
        for(const key in dataTable[name]){
            bodyData.push(getAward(dataTable[name][key].values,key))
        }
        body.push(<div className="tableRow" key={name+'tr'}>
            <div className="headerCell"><p className="txt">{name}</p></div>
            {bodyData}</div>)
    }
    for(const key in dataTable.Kevin){
        headers.push(<div className="headerCell" key={key+'hr'}><p className="txt" key={'key'+key}>{key}</p></div>)
    }
    const headRow = <div className="tableRow headerRow" key={'tr0'} style={{top:stickyHeight}}>
        <div className="headerCell"><p className="txt">Name</p></div>
        {headers}
    </div>


    const out = 
    // <div>
    [<div className='topContainer' key={'topcontplayert'} ref={stickyRef}>
        <div className='buttonsContainer' key={'butcont'}>
            {relevantChoices}
        </div>  
    </div>,
    
    <div className="tableContainer" key={'playertable'}>
        <p style={{textAlign:'left',paddingLeft:'10px'}}>Min 5 games starting or 10 games owned.</p>
        {headRow}
        {body}
    </div>]
    // </div>

    return(out)
}