

export function CallESPNProj(vars,setProj){
    let out = {}
    // const year = 2024
    // const week = 1
    for(let year=2018;year<=vars.currentYear;year++){
        out[year] = []
        for(let week=1;week<=vars.weekMax;week++){
    const url = 'https://mocktion-site.vercel.app/callProj/'+year.toString()+'/'+week.toString()
    // const url = 'http://localhost:5432/callProj/'+year.toString()+'/'+week.toString()
    // console.log(url)
    const leagueSize = 12
    const playerSlots = {0: 'QB', 4: 'WR', 2: 'RB', 23: 'FLEX', 6: 'TE', 16: 'D/ST', 17: 'K', 20: 'Bench', 21: 'IR'}
    const defaultPosID = {1: 'QB', 3: 'WR', 2: 'RB', 4: 'TE', 16: 'D/ST', 5: 'K'}
    fetch(url).then(res=>res.json()).then(json=>{
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
                for(let statInd=0;statInd<json['teams'][team]['roster']['entries'][slot]['playerPoolEntry']['player']['stats'].length;statInd++){
                    let stat = json['teams'][team]['roster']['entries'][slot]['playerPoolEntry']['player']['stats'][statInd]
                    if (stat['scoringPeriodId'] != week){continue}
                    if (stat['statSourceId'] == 0){outDict['PlayerScoreActual']=stat['appliedTotal']}
                    if (stat['statSourceId'] == 1){outDict['PlayerScoreProj']=stat['appliedTotal']}
                }
                out[year].push(outDict)
            } // end for each roster slot
        }//end for each team
    })//end fetch
}//end week
}//end year
setProj(out)
}