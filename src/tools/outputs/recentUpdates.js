import { useState } from "react"
import { NamePicker } from "./misc/misc"
import { CompareRecords } from "../calculations/compareRecords"


export const RecentUpdates = ({records,oldRecords,weekOldRecords,pickMacro,vars})=>{
    const [weekYear,setWeekYear] = useState('Week')
    let lists
    weekYear=='Week'?lists=CompareRecords(records,weekOldRecords):lists=CompareRecords(records,oldRecords)

    const pickWY =   <NamePicker title={'Past week or year: '} showAll={false} selecting={setWeekYear} curval={weekYear} options={['Week','Year']} key={'wy'}></NamePicker>
    const relevantChoices=[pickMacro,pickWY]
let out = []
let head1 =  
    <div className="tableRow" key={'hr0'}>
        <div className="headerCell"><p className="txt">Record Title</p></div>
        <div className="headerCell description"><p className="txt">Description</p></div>
        <div className="headerCell"><p className="txt">New Record</p></div>
        <div className="headerCell"><p className="txt">Previous Holder</p></div>
        {/* <div className="headerCell"><p className="txt">Old Record</p></div>
        <div className="headerCell"><p className="txt">New Challenger's Old Value</p></div> */}
    </div>
const count = lists.records.length+lists.overall.length+lists.fantasy.length
if (count==0){return<p>no recent updates</p>}
if(!lists.records.length==0){
    out.push(head1)
    for(const item of lists.records){
        let newWin = item.now.winnerValue[0]
        let newLose = item.now.loserValue
        let newLoseLine = []
        let prevVal
        for(let i=0;i<item.now.loser.length;i++){
            const name = item.now.loser[i]
            let val = newLose[i]
            if(newLose=='NA'){val='NA'}
            if(!item.now.winner.includes(name)){
                if(!isNaN(val)){val=Math.round(100*val)/100}
                let valOut
                if(val==prevVal){valOut=''}else{valOut=val.toString()+'\n'}
                newLoseLine.push(valOut+name)
                prevVal=val
            }
        }
        if(newLoseLine.length==0){newLoseLine=['Record Holders Except:'].concat(item.now.winner.filter(x=>!item.now.loser.includes(x)))}
        // let oldWin = item.was.winnerValue[0]
        // let oldLose = item.was.loserValue[0]
        if(!isNaN(newWin)){newWin=Math.round(100*newWin)/100}else{newWin='N/A'}
        if(!isNaN(newLose)){newLose=Math.round(100*newLose)/100}else{newLose='N/A'}
        // if(!isNaN(oldWin)){oldWin=Math.round(100*oldWin)/100}else{oldWin='N/A'}
        // if(!isNaN(oldLose)){oldLose=Math.round(100*oldLose)/100}else{oldLose='N/A'}
        
        const row = <div className="tableRow" key={item.title}>
            <div className="headerCell"><p className="txt">{item.title}</p></div>
            <div className="tableCell description"><p className="txt">{item.desc}</p></div>
            <div className="tableCell"><p className="txt">{newWin+'\n'+item.now.winner.join('\n')}</p></div>
            <div className="tableCell"><p className="txt">{newLoseLine.join('\n')}</p></div>
            {/* <div className="tableCell"><p className="txt">{oldWin+'\n'+item.was.winner.join('\n')}</p></div>
            <div className="tableCell"><p className="txt">{oldLose+'\n'+item.was.loser.join('\n')}</p></div> */}
        </div>
        out.push(row)
    }
}

// overall updates
let overall = []
if(lists.overall.length+lists.fantasy.length!=0){
    overall.push(
        <div className="tableRow">
            <div className="headerCell"><p className="txt">Name</p></div>
            <div className="headerCell description"><p className="txt">Record ID</p></div>
            <div className="headerCell"><p className="txt">New PB</p></div>
            <div className="headerCell"><p className="txt">Old PB</p></div>
        </div>
    )
    for(const item of lists.overall.concat(lists.fantasy)){
        let newVal,oldVal
        if(isNaN(item.new)||isNaN(item.old)){newVal=item.new;oldVal=item.old}
        else{newVal=Math.round(100*item.new)/100;oldVal=Math.round(100*item.old)/100}
        overall.push(
            <div className="tableRow">
            <div className="headerCell"><p className="txt">{item.name}</p></div>
            <div className="tableCell"><p className="txt">{item.key}</p></div>
            <div className="tableCell"><p className="txt">{newVal}</p></div>
            <div className="tableCell"><p className="txt">{oldVal}</p></div>
        </div>
        )
    }
}
const realOut = 
{/* <div> */}
[<div className='topContainer' key={'topcontrecent'}>
    <div className='buttonsContainer' key={'butcont'}>
        {relevantChoices}
    </div>  
</div>,

<div className="tableContainer">
{out}
{overall}
</div>]
// </div>
return realOut
}