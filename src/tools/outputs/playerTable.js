import { useEffect } from "react"
import { RecordToFrac, Round } from "../calculations/other"

export const PlayerTable = (props)=>{
    const dataTable = props.records.bestPlayers
    let headers = []
    let body = []
    const focusName = props.focus.name
    const focusNFL = props.focus.NFLName
    useEffect(()=>{props.setShowTop(1)},[]) // on mount set show top to 1
    function getAward(vals){
        const filtered = vals.filter(x=>x.name===focusNFL||focusNFL==='All')
        // const filtered = vals
        if(filtered.length>0){
            const sorted = filtered.sort((a,b)=>a.rank-b.rank)
            let outList = []
            for(let i=0;i<Math.min(sorted.length,Math.max(1,props.showTop));i++){
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
                
                outList = outList.concat(<p className="txt">{best.name}</p>,
                    <p className="txt">({best.rank} of {vals.length})</p>,
                    <p className="txt">{val}</p>,<p className="txt">{meta}</p>)
                if(i!=Math.min(sorted.length,Math.max(1,props.showTop))-1){outList.push(<p>----------------------</p>)}
            }
            return <div className="tableCell">{outList}</div>
        }else{return(<div className="tableCell"><p className="txt">NA</p></div>)}
    }

    for(const name in dataTable){
        if(focusName!=='All'&&name!==focusName){continue}
        let bodyData = []
        for(const key in dataTable[name]){
            bodyData.push(getAward(dataTable[name][key].values))
        }
        body.push(<div className="tableRow">
            <div className="headerCell"><p className="txt">{name}</p></div>
            {bodyData}</div>)
    }
    for(const key in dataTable.Kevin){
        headers.push(<div className="headerCell"><p className="txt" key={'key'+key}>{key}</p></div>)
    }
    const headRow = <div className="tableRow">
        <div className="headerCell"><p className="txt">Name</p></div>
        {headers}
    </div>


    const out = <div className="tableContainer">
        <p style={{textAlign:'left',paddingLeft:'10px'}}>Min 5 games starting or 10 games owned.</p>
        {headRow}
        {body}
    </div>


    return(out)
}