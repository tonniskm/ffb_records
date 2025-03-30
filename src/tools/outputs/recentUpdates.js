

export function recentUpdates(lists){
let out = []
let head1 = 
    <div className="tableRow">
        <div className="headerCell"><p className="txt">Record Title</p></div>
        <div className="headerCell description"><p className="txt">Description</p></div>
        <div className="headerCell"><p className="txt">New Record</p></div>
        <div className="headerCell"><p className="txt">Previous Holder</p></div>
        <div className="headerCell"><p className="txt">Old Record</p></div>
        <div className="headerCell"><p className="txt">New Challenger's Old Value</p></div>
    </div>
const count = lists.records.length+lists.overall.length+lists.fantasy.length
if (count==0){return<p>no recent updates</p>}
if(!lists.records.length==0){
    out.push(head1)
    for(const item of lists.records){
        
        const row = <div className="tableRow">
            <div className="headerCell"><p className="txt">{item.title}</p></div>
            <div className="tableCell description"><p className="txt">{item.desc}</p></div>
            <div className="tableCell"><p className="txt">{Math.round(100*item.now.winnerValue[0])/100+'\n'+item.now.winner.join('\n')}</p></div>
            <div className="tableCell"><p className="txt">{Math.round(100*item.now.loserValue[0])/100+'\n'+item.now.loser.join('\n')}</p></div>
            <div className="tableCell"><p className="txt">{Math.round(100*item.was.winnerValue[0])/100+'\n'+item.was.winner.join('\n')}</p></div>
            <div className="tableCell"><p className="txt">{Math.round(100*item.was.loserValue[0])/100+'\n'+item.was.loser.join('\n')}</p></div>
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
            <div className="headerCell description"><p className="txt">Person Record</p></div>
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
const realOut = <div className="tableContainer">
{out}
{overall}
</div>
return realOut
}