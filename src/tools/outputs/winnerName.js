import { DictKeysWithValue } from "../calculations/other"
// import { styleSheet } from "../styles/styles"


export function winnerName(awards,focusName){
    let out = [<div className="tableRow">
                <div className="headerCell"><p className="txt">Record</p></div>
                <div className="headerCell"><p className="txt">1st Place</p></div>
                <div className="headerCell"><p className="txt">Holder</p></div>
                <div className="headerCell"><p className="txt">Selected Score</p></div>
                <div className="headerCell"><p className="txt">Description</p></div>
    </div>]
    for(const award of awards){
        const vals = []
        const winners = []
        for(const name in award.values){
            vals.push({'name':name,'value':Math.round(100*award.values[name])/100,'rank':award.ranks[name]})
        }
        const sorted = vals.sort((a,b)=>a.rank-b.rank)
        const count = sorted.length
        const winFilter = sorted.filter(x=>x.rank==1)
        for(const line of winFilter){winners.push(line.name)}
        const r1 = Math.round(100*sorted[0].value)/100
        let myRank
        if(focusName=='All'){
            myRank = []
            for(const line of sorted){
                myRank.push(line.name+': '+line.value+'\n')
            }

        }else{
            const filtered = sorted.filter(x=>x.name==focusName)[0]
            myRank = filtered.value+'\n ('+filtered.rank+' of '+count+')'
        }
        out.push(
            <div key={award.title} className="tableRow">
                <div className="tableCell"><p className="txt">{award.title}</p></div>
                <div className="tableCell"><p className="txt">{r1}</p></div>
                <div className="tableCell"><p className="txt">{winners.join(',\n')}</p></div>
                <div className="tableCell"><p className="txt">{myRank}</p></div>
                <div className="tableCell"><p className="txt">{award.desc}</p></div>
            </div>
        ) 
    }
    return out

}