


export function recordTable(awards,focus,showTop,allNames,allNFLNames){
    let out = [<div className="tableRow" key={'trh'}>
                <div className="headerCell" key={'rrh'}><p className="txt">Record</p></div>
                <div className="headerCell" key={'drh'}><p className="txt">Description</p></div>
                <div className="headerCell" key={'wrh'}><p className="txt">1st Place</p></div>
                <div className="headerCell" key={'wnrh'}><p className="txt">Holder</p></div>
                <div className="headerCell" key={'crh'}><p className="txt">Selected Comparison</p></div>
    </div>]
    function GenerateOutputList(list,type,metas,count,d){
        // const count = list.length
        let out = []
        let outLine = []
        function GeTMetaExtras(metaType,type){
            let starter, ender
             starter = ''
             ender = ''
            if(metaType=='week'){
                starter='Week '
                ender = ' '
            }
            else if(metaType=='t1'||metaType=='s1'){
                ender = ' - '
                starter = '\n'
            }
            else if(metaType=='s2'){
                // ender = '\n'
            }
            else if(metaType=='name'){ender=' '}
            else if(metaType=='record'||metaType=='recordStarting'){starter='\n'}
            else{
                ender = ' '
            }
            // if(metaType=='t1')(console.log({1:starter,2:ender}))
            return {'starter':starter,'ender':ender}
        }
        for(const line of list){
            const val = Math.round(100*line['value'])/100
            let extra =''
            if(type=='selected'){
                extra = '\n ('+line.rank+' of '+count+')'
                outLine.push(val+'\n')
            }
                else{outLine.push('')}
            for(const metaType of metas){
                if(metaType=='meta'){
                    for(const metaSubType in line.meta){
                        let message = line[metaType][metaSubType]
                        if(metaSubType=='teams'){message = message.join(", ")}
                        else if(metaSubType=='record'||metaSubType=='recordStarting'){message = line[metaSubType][0]+'-'+line[metaSubType][1]+'-'+line[metaSubType][2]}
                        let {starter,ender} = GeTMetaExtras(metaSubType,type)
                        message = starter + message + ender 
                        if(message==undefined){console.log({1:line})}
                    // if(d=='The highest total score in a game'){console.log({1:outLine,2:message})}
                        outLine[outLine.length-1] +=message
                    }
                }
                else{
                    let message = line[metaType]
                    if(metaType=='teams'){message = message.join(", ")}
                    else if(metaType=='record'||metaType=='recordStarting'){message = line[metaType][0]+'-'+line[metaType][1]+'-'+line[metaType][2]}
                    let {starter,ender} = GeTMetaExtras(metaType,type)
                    message = starter + message + ender 
                    // if(d=='The highest total score in a game'){console.log({1:outLine,2:message})}
                    outLine[outLine.length-1] +=message
                }

                // if(d=='The highest total score in a game'){console.log(outLine)}
            }//end meta
            outLine[outLine.length-1] +=extra
            // outLine.at(-1).join('+ ')
        }
        if(type=='w'){out.push(outLine.join('\n'))}else{
            out.push(outLine.join('\n-------\n'))
        }
        return out
    }

    for(const award of awards){
        if(award.title=='Flex comparison'){continue}
        const count = award.values.length
        // const vals = []
        let winners = []
        const sorted = award.values.sort((a,b)=>a.rank-b.rank)
        const winFilter = sorted.filter(x=>x.rank==1)
        winners = GenerateOutputList(winFilter,'w',award.meta,count,award.desc)
        const r1 = Math.round(100*sorted[0].value)/100
        let myRank = []
        let filtered = sorted
        if(award.meta.includes('name')||award.meta.includes('t1')||award.meta.includes('t2')){
            filtered = filtered.filter((x)=>![x.t1,x.t2,x.name].some(x=>allNames.includes(x))||[x.t1,x.t2,x.name].includes(focus['name'])||focus['name']=='All')}
            filtered = filtered.filter(x=>!allNFLNames.includes(x.name)||x.name===focus.NFLName||focus.NFLName==='All')
        if(award.meta.includes('week')){filtered = filtered.filter((x)=>x.week==focus['week']||focus['week']=='All')}
        if(award.meta.includes('year')){filtered = filtered.filter((x)=>x.year==focus['year']||focus['year']=='All')}
        filtered = filtered.filter(x=>x.rank!=1)
        filtered = filtered.slice(0,Math.max(1,showTop))
        myRank = GenerateOutputList(filtered,'selected',award.meta,count,'hi')

        // if(award.desc == 'The Most Rings'){console.log({1:focus})}
        // if(focusName=='All'){ 
        //     myRank = []
        //     for(const line of sorted){
        //         myRank.push(line.name+': '+line.value+'\n')
        //     }

        // }else{
        //     const filtered = sorted.filter(x=>x.name==focusName)[0]
        //     myRank = filtered.value+'\n ('+filtered.rank+' of '+count+')'
        // }
        out.push(
            <div key={award.title} className="tableRow">
                <div className="tableCell recordTitle" key={award.title+'title'}><p className="txt">{award.title}</p></div>
                <div className="tableCell description" key={award.title+'d'}><p className="txt">{award.desc}</p></div>
                <div className="tableCell" key={award.title+'wv'}><p className="txt">{r1}</p></div>
                <div className="tableCell otherScores" key={award.title+'w'}><p className="txt">{winners}</p></div>
                <div className="tableCell myScores" key={award.title+'c'}><p className="txt">{myRank}</p></div>
            </div>
        ) 
    }
    return out

}