import { GetPickNo, SortNRank } from "../other";


export async function AnalyzeDraft(records,yearMax,vars){
    let promises = []
    let rawDrafts = {}
    let rawRanks = {}
    let draftInfo = []
    for(let year=2015;year<=yearMax;year++){
        promises.push(fetch(`/drafts/${year.toString()}.csv`).then(res=>
            res.text()).then(text=>{
                const lines = text.trim().split('\n');
                const headers = lines[0].split(',');

                const data = lines.slice(1).map(line => {
                const values = line.split(',');
                const row = {};
                headers.forEach((header, i) => {
                    row[header.trim()] = values[i].trim();
                });
                return row;
                        })
                rawDrafts[year] = data
                }))
    promises.push(fetch(`/drafts/rankings/${year.toString()}rank.csv`).then(res=>
        res.text()).then(text=>{
            const lines = text.trim().split('\n');
            const headers = lines[0].split(',');

            const data = lines.slice(1).map(line => {
            const values = line.split(',');
            const row = {};
            headers.forEach((header, i) => {
                row[header.trim()] = values[i].trim();
            });
            return row;
                    })
            rawRanks[year] = data
            }))
    }
    await Promise.all(promises).then(()=>{
        for(const year in rawDrafts){
            const ranks = rawRanks[year]
            for(const [ind,line] of rawDrafts[year].entries()){
                    let round
                    if(line[""]===''||line['""']==''){continue}
                    if(rawDrafts[year].length>30){round=ind/2+1}
                    else{round = ind}
                    const keys = Object.keys(line)
                    for(let i=0;i<keys.length;i++){
                        const name = keys[i]
                        const NFLName = line[name]
                        if (name===''){continue}
                        const rankLines = ranks.filter(x=>x.Name===NFLName)
                        let pos,rank,NFLteam,bye
                        if(rankLines.length>0){
                            pos=rankLines[0].Pos;
                            rank=rankLines[0].Rank
                            NFLteam=rankLines[0].Team
                            bye = rankLines[0].Bye
                        }else{pos='NA';rank=301;NFLteam='unk';bye='unk'}
                        if(NFLteam.toLowerCase() == 'jax'){NFLteam='jac'}
                        else if(NFLteam.toLowerCase() == 'was'){NFLteam='wsh'}
                        else if(NFLteam.toLowerCase() == 'sd'){NFLteam='lac'}
                        else if(NFLteam.toLowerCase() == 'la' || NFLteam.toLowerCase() == 'stl'){NFLteam='lar'}
                        else if(NFLteam.toLowerCase() == 'oak'){NFLteam='lv'}
                        const pickInd = keys.filter(x=>x!=='').indexOf(name)
                        const pickNo = GetPickNo(round,pickInd,keys.length-1)
                        const reach = pickNo - rank
                        const reachWeight = reach/round
                        draftInfo.push({year,name,pickNo,rank,NFLteam,NFLName,bye,pos,reachWeight})
                    }//key
            }//line
        }//year
    })//then
    const list = [
        {'id':'draft1','title':'Who Dey!','desc':'The person who has drafted the most Bengals','filter':'NFLteam','by':'cin','MinMax':'max','meta':['name'],'agg':'name'},
        {'id':'draft2','title':'Bad Fan','desc':'The person who has drafted the fewest Bengals','filter':'NFLteam','by':'cin','MinMax':'min','meta':['name'],'agg':'name'},
        {'id':'draft3','title':'Traitor!','desc':'The person who has drafted the most Steelers','filter':'NFLteam','by':'pit','MinMax':'max','meta':['name'],'agg':'name'},
        {'id':'draft4','title':'Good Fan','desc':'The person who has drafted the fewest Steelers','filter':'NFLteam','by':'pit','MinMax':'min','meta':['name'],'agg':'name'},
        {'id':'draft5','title':'Overdrafted','desc':'The person who has drafted the most','filter':'pos','by':'each','MinMax':'max','meta':['name'],'agg':'name'},
        {'id':'draft6','title':'Underdrafted','desc':'The person who has drafted the fewest','filter':'pos','by':'each','MinMax':'min','meta':['name'],'agg':'name'},
        {'id':'draft7','title':"Brenna's Curse",'desc':'The person with the earliest average pick','filter':'pickNo','by':'sp','MinMax':'min','meta':['name'],'agg':'name'},
        {'id':'draft8','title':'Bored','desc':'The person with the latest average pick','filter':'pickNo','by':'sp','MinMax':'max','meta':['name'],'agg':'name'},
        {'id':'draft9','title':'Bargain Hunter','desc':'The person with best average draft value','filter':'reachWeight','by':'avg','MinMax':'max','meta':['name'],'agg':'name'},
        {'id':'draft10','title':'Hey Big Spender!','desc':'The person with worst average draft value','filter':'reachWeight','by':'avg','MinMax':'min','meta':['name'],'agg':'name'}
      ]
    const poses = ['QB','RB','WR','TE','D/ST','K']

    for (const item of list){
        let vals = []
        let onlyVals = []
        let eachVals = {}
        let onlyEachVals = {}
        for(const pos of poses){eachVals[pos] = [];onlyEachVals[pos] = []}
        if(item.agg==='name'){
            for(const name of vars.allNames){
                let filtered = draftInfo.filter(x=>x.name===name)
                if(filtered.length===0){continue}
                if(item.by==='sp'){
                    filtered = filtered.filter(x=>x.pickNo<=12)
                    const value = filtered.reduce((sum,x)=>sum+x[item.filter],0)/filtered.length
                    vals.push({value,name})
                    onlyVals.push(value)
                }
                else if(item.by==='avg'){
                    const value = filtered.reduce((sum,x)=>sum+x[item.filter],0)/filtered.length
                    vals.push({value,name})
                    onlyVals.push(value)
                }
                else if(item.by==='each'){
                    for(const pos of poses){
                        const uniqueCount = new Set(filtered.map(x => x.year)).size;
                        const value = filtered.filter(x=>x.pos===pos).length/uniqueCount
                        eachVals[pos].push({value,name})
                        onlyEachVals[pos].push(value)
                    }
                }
                else{
                    const uniqueCount = new Set(filtered.map(x => x.year)).size;
                    filtered = filtered.filter(x=>x[item.filter].toLowerCase()===item.by.toLowerCase())
                    vals.push({'value':filtered.length/uniqueCount,name})
                    onlyVals.push(filtered.length/uniqueCount)
                }

            }

        }
    if(item.by==='each'){
        for(const pos of poses){
            records.draftAwards.push({'title':item.title+' '+pos+'s','desc':item.desc+' '+pos+'s','values':SortNRank(onlyEachVals[pos],eachVals[pos],item.MinMax),'meta':item.meta,'id':item.id})
        }
    }else{records.draftAwards.push({'title':item.title,'desc':item.desc,'values':SortNRank(onlyVals,vals,item.MinMax),'meta':item.meta,'id':item.id})}
    }//for list
}
    
    