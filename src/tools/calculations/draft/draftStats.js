import { CleanName, GetPickNo, SortNRank } from "../other";
import { predone } from "./predone";

//cahnge false to true below to download an updated json
export async function AnalyzeDraft(records,yearMax,vars,updateSaved=false,playerInfo=null){
    let promises = []
    let rawDrafts = {}
    let rawRanks = {}
    // let draftInfo = []
    const draftInfo = updateSaved?[]:predone
    const yearsDone = [...new Set(draftInfo.flatMap(obj => Object.values(obj)))].map(x=>parseInt(x))
    for(let year=2015;year<=yearMax;year++){
        if(yearsDone.includes(year)&&!updateSaved){continue}
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
                if(!Object.keys(data[0]).includes('<!DOCTYPE html>')){rawDrafts[year] = data}
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
            if(!Object.keys(data[0]).includes('<!DOCTYPE html>')){rawRanks[year] = data}
            }))
    }
    await Promise.all(promises).then(()=>{
        for(const year in rawDrafts){
            const ranks = rawRanks[year]
            ranks.forEach(x=>x.Name=CleanName(x.Name))
            for(const [ind,line] of rawDrafts[year].entries()){
                    let round
                    if(line[""]===''||line['""']==''){continue}
                    if(rawDrafts[year].length>30){round=ind/2+1}
                    else{round = ind}
                    const keys = Object.keys(line)
                    for(let i=0;i<keys.length;i++){
                        const name = keys[i]
                        const NFLName = CleanName(line[name])
                        if (name===''||NFLName===''){continue}
                        const rankLines = ranks.filter(x=>x.Name===CleanName(NFLName))
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
                        
                        let height, weight, dob, age
                        const statsLines1 = playerInfo.filter(x=>x.name===CleanName(NFLName))
                        const statsLines = playerInfo.find(x=>x.name===CleanName(NFLName))
                        // if(statsLines!==undefined){
                        if(statsLines1.length>0){
                            // const statLine = statsLines
                        const statLine = statsLines1.sort((a, b) => {
                            const da = new Date(a.dob);
                            const db = new Date(b.dob);

                            if (isNaN(da)) return 1;
                            if (isNaN(db)) return -1;
                            return db - da;
                            })[0]


                            height = statLine.height/12 //in to ft
                            weight = statLine.weight
                            dob = statLine.dob
                            const convdob = new Date(dob)
                            const sept1 = new Date(`${year}-09-01T00:00:00Z`);
                            const msPerYear = 1000 * 60 * 60 * 24 * 365.2425; // average accounting for leap years
                            const ageInMilliseconds = sept1 - convdob;
                            age = ageInMilliseconds / msPerYear;
                        }
                        draftInfo.push({year,name,pickNo,rank,NFLteam,NFLName,bye,pos,reachWeight,height,weight,dob,whratio:height>0?weight/height:undefined,age})
                    }//key
            }//line
        }//year
    })//then
    // console.log(draftInfo)
    if(updateSaved){ // do this to update already finished
        const blob = new Blob([JSON.stringify(draftInfo,null,2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
    
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json';
        a.click();
        URL.revokeObjectURL(url); // Clean up
        return
    }

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
        {'id':'draft10','title':'Hey Big Spender!','desc':'The person with worst average draft value','filter':'reachWeight','by':'avg','MinMax':'min','meta':['name'],'agg':'name'},
        {'id':'draft11','title':'Height Supremecist','desc':'The person who drafts the tallest players (ft)','filter':'height','by':'avg','MinMax':'max','meta':['name'],'agg':'name'},
        {'id':'draft12','title':'Chubby Chaser','desc':'The person who drafts the heaviest players (lbs)','filter':'weight','by':'avg','MinMax':'max','meta':['name'],'agg':'name'},
        {'id':'draft13','title':'Big Chongus','desc':'The person who drafts the highest weight/height ratio (lbs/ft)','filter':'whratio','by':'avg','MinMax':'max','meta':['name'],'agg':'name'},
        {'id':'draft14','title':'Elder Respecter','desc':'The person who drafts the oldest players on average (yrs)','filter':'age','by':'avg','MinMax':'max','meta':['name'],'agg':'name'}
      
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
                    filtered = filtered.filter(x=>x[item.filter])
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
    
    