

export function CallESPNProj(vars,setProj,loading,setLoading){
    let out = {}
    // const year = 2024
    // const week = 1
    let promises = []
    for(let year=2018;year<=vars.currentYear;year++){
        out[year] = []
        for(let week=1;week<=vars.weekMax;week++){
    const url = 'https://mocktion-site.vercel.app/callProj/'+year.toString()+'/'+week.toString()
    // const url = 'http://localhost:5432/callProj/'+year.toString()+'/'+week.toString()
    // console.log(url)
    const leagueSize = 12
    const playerSlots = {0: 'QB', 4: 'WR', 2: 'RB', 23: 'FLEX', 6: 'TE', 16: 'D/ST', 17: 'K', 20: 'Bench', 21: 'IR'}
    const defaultPosID = {1: 'QB', 3: 'WR', 2: 'RB', 4: 'TE', 16: 'D/ST', 5: 'K'}
    promises.push(fetch(url).then(res=>res.json()).then(json=>{
        // console.log(Object.keys(json))
        for (let team=0;team<leagueSize;team++){ //for each team in teh league
            if(json['teams'].length<=team){continue}
            for (let slot=0;slot<17;slot++){ //for each roster slot
                if(json['teams'][team]['roster']['entries'].length<=slot){continue}
            
                let outDict = {}
                outDict['Week'] = week
                outDict['PlayerName'] = json['teams'][team]['roster']['entries'][slot]['playerPoolEntry']['player']['fullName']
                // outDict['PlayerScoreActual']
                // outDict['PlayerScoreProjected']
                outDict['PlayerRosterSlotId'] = json['teams'][team]['roster']['entries'][slot]['lineupSlotId']
                outDict['PlayerFantasyTeam'] = json['teams'][team]['id']
                outDict['Position'] = defaultPosID[json['teams'][team]['roster']['entries'][slot]['playerPoolEntry']['player']['defaultPositionId']]
                outDict['ProTeam'] = json['teams'][team]['roster']['entries'][slot]['playerPoolEntry']['player']['proTeamId']
                outDict['PlayerRosterSlot'] = playerSlots[json['teams'][team]['roster']['entries'][slot]['lineupSlotId']]
                //for each listed stat
                // console.log(json['teams'][team]['roster']['entries'][slot]['playerPoolEntry']['player'])
                // console.log(json['teams'][team]['roster']['entries'][slot]['playerPoolEntry']['player']['stats'])
                outDict['PlayerScoreActual'] =0
                outDict['PlayerScoreProj'] = 0
                for(let statInd=0;statInd<json['teams'][team]['roster']['entries'][slot]['playerPoolEntry']['player']['stats'].length;statInd++){
                    let stat = json['teams'][team]['roster']['entries'][slot]['playerPoolEntry']['player']['stats'][statInd]
                    if (stat['scoringPeriodId'] != week){continue}
                    if (stat['statSourceId'] == 0){
                        if(stat.appliedTotal!=undefined){outDict['PlayerScoreActual']=stat['appliedTotal']}}
                    else if (stat['statSourceId'] == 1){
                        if(stat.appliedTotal!=undefined){outDict['PlayerScoreProj']=stat['appliedTotal']}}
                    // else{console.log({1:'error',2:stat})
                    // stat.append(1)//error
                    // }
                }
                if(outDict['PlayerScoreActual']==undefined){outDict['PlayerScoreActual'] =0}
                if(outDict['PlayerScoreProj']==undefined){outDict['PlayerScoreProj'] = 0}
                // if(week==5&&year==2018&&)
                out[year].push(outDict)
            } // end for each roster slot
        }//end for each team
    })//end fetch
)//end promise
}//end week
}//end year
Promise.all(promises).then(()=>{
    for(const year in out){
        for(const line of out[year]){
            if(!Object.keys(line).includes('PlayerScoreActual')){console.log({1:'error',2:line,3:year,4:out})}
        }
    }
    setProj(out)
})
// let newLoading = {...loading}
// newLoading['proj'] = true
// console.log({1:'proj',2:newLoading})
// setLoading(newLoading)
}