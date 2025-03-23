

export default function CallESPNFa(vars,setFa){
    const defaultPosID = {1: 'QB', 3: 'WR', 2: 'RB', 4: 'TE', 16: 'D/ST', 5: 'K'}
    // console.log('here')
    // const year = 2024
    let out = {}
    for(let year=2018;year<=vars.currentYear;year++){
    out[year] = []
    const filters =JSON.stringify({ "players": { "limit": 1500, "sortDraftRanks": { "sortPriority": 100, "sortAsc": true, "value": "STANDARD" } } })
    const url = 'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/'+year.toString()+'/segments/0/leaguedefaults/1?view=kona_player_info'
    fetch(url,{
        headers:{'x-fantasy-filter':filters}
    }).then(res=>res.json()).then(json=>{
        for(let i=0;i<json.players.length;i++){
            let item = json.players[i].player
            let pos = defaultPosID[item.defaultPositionId]
            let name = item.fullName
            let proTeam = item.proTeamId
            let act = {}
            let proj = {}
            // if(i==0){console.log(item.stats)}
            for(let j=0;j<item.stats.length;j++){
                let statLine = item.stats[j]
                let week = statLine.scoringPeriodId
                if(statLine.seasonId==year){
                    if(statLine.statSourceId==0){act[week]=statLine.appliedTotal}
                    if(statLine.statSourceId==1){proj[week]=statLine.appliedTotal}
                }
            }
        out[year].push({'Name':name,'pos':pos,'proTeam':proTeam,'actual':act,'proj':proj})
        }
    // console.log(out)
})//end fetch
}//end year
setFa(out)
}