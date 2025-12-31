import { sleeperNames } from "../constants/sleeper_names";
import { sleeperSettings } from "../constants/sleeper_settings";
import { missingData } from "./missing2023w1";
import { saved_jsons_proj_2025 } from "./saved_jsons/proj/2025";
import { savedProj } from "./saved_jsons/proj/saved";

const sleeper_league_id = '1263340152806195200' //sleeper league id for fetching settings

export async function callProj2(vars,setProj){
    const yearMax = vars.currentYear
    let out = {}
    if (vars.leagueID === 'rajan') {
        out = {...savedProj}
        out[2025] = saved_jsons_proj_2025
    }
    // console.log(out[2023].filter(x=>x.Week==1))
    let dataCopy = [...missingData]
    // console.log(out[2023].filter(x=>x.Week).length>0,out[2023].filter(x=>x.Week).length)
    if(vars.leagueID === 'rajan'){
        if(!out[2023].filter(x=>x.Week==1).length>0){
            for(const line of dataCopy){
                line.PlayerScoreActual = parseFloat(line.PlayerScoreActual)
                line['PlayerScoreProj'] = parseFloat(line.PlayerScoreProjected)
                out[2023].push(line)
            }
        }
    }
        // console.log(out[2023].filter(x=>x.Week==1))
    const lastSavedYear = vars.leagueID==='rajan'?Math.max(...Object.keys(out).map(x=>parseInt(x))):vars.yearMin
    const lastSavedWeek = vars.leagueID==='rajan'?Math.max(...out[lastSavedYear].map(x=>x.Week)):0
    if(lastSavedYear==yearMax&&lastSavedWeek>=17 && vars.leagueID === 'rajan'){
        setProj(out)
    }
    else{
        if(vars.leagueID !== 'rajan'){

            // setProj(out)
            // for(let year=2018;year<=yearMax;year++){
            //     out[year] = []
            //     for(let week=1;week<=18;week++){
            //         if(year==2023&&week==1){continue}
                    // if(year==2024&&week>1){continue}
                    // const url = 'http://localhost:5432/projrajan/'+year.toString()+'/'+week.toString()
                    // const url = 'https://mocktion-site.vercel.app/projrajan/'+year.toString()+'/'+week.toString()
            // const url = 'http://localhost:5432/test/'+lastSavedYear.toString()+'/'+lastSavedWeek.toString()
            const url = 'https://mocktion-site.vercel.app/test/'+lastSavedYear.toString()+'/'+lastSavedWeek.toString() + '/'+vars.leagueNo.toString()
                    
            fetch(url).then(res=>res.json()).then(json=>{
                for (const year in json){
                    if(json[year].length<1){continue}
                    out[year] = json[year].sort((a,b)=>a.Week-b.Week)
                }
                setProj(out)
            })
        }//end espn
        else{//Sleeper
            function calculateCustomPoints(stats, scoringSettings) {
                let points = 0;
                for (const stat in stats) {
                    if (scoringSettings[stat] !== undefined) {
                    points += stats[stat] * scoringSettings[stat];
                    }
                }
                return points;
                }
            const nflStateRes = await fetch(`https://api.sleeper.app/v1/state/nfl`);
            const nflState = await nflStateRes.json();
            const playersRes = await fetch(`https://api.sleeper.app/v1/players/nfl`);
            const players = await playersRes.json();

            let idsDict = {}
    const year = new Date().getFullYear();
    // const year = 2024
    const url = 'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/'+year.toString()+'/players?scoringPeriodId=0&view=players_wl&limit=50000';
    const headers = {
        'Accept': 'application/json',
        'x-fantasy-platform': 'kona-PROD-ce733480830480c5aa5f21379bed87b976d13f5e',
        'x-fantasy-source': 'kona',
        'x-fantasy-filter':JSON.stringify({
            'players': {
            'limit': 15000,"sortDraftRanks": { "sortPriority": 100, "sortAsc": true, "value": "STANDARD" } 
            }})
        // If needed (e.g. in Express), set e.g.:
        // 'Origin': 'https://fantasy.espn.com',
        // 'Referer': 'https://fantasy.espn.com/',
        // 'Cookie': `espn_s2=${espn_s2}; SWID={${swid}};`,
  }; 
  const ELIGIBLE_POSIDS = [1,2,3,4,5,16]
const replacements = [
  ['Jaguars D/ST', 'Jacquarfs D/ST'],
  ["Ja'Marr Chase", 'Chase Lay'],
  ['Hollywood Brown', 'Marquise Brown'],
  ['Chig Okonkwo', 'Chigoziem Okonkwo'],
  ['Andy Isabella', 'Isabelle Lay'],
  ['H. Brown', 'M. Brown'],
  ['','.']
];
function CleanName(name) {
  let clean = partlyCleanName(name)
  clean = FixJrs(clean);
  return clean;
}
function partlyCleanName(name) {
  let clean = name;
  for (const [correct, alt] of replacements) {
    clean = clean.replaceAll(alt, correct);
  }
  return clean;
}
function DirtyName(name){
    let out = name
    for (const replacement of replacements){
        if (replacement[0]!==''){
            out = out.replace(replacement[0],replacement[1])
        }
    }
    return out
}
const JRS = [' Jr', ' Sr', ' III', ' II', ' IV', '.']
function FixJrs(name){
    let out = name
    for(const jr of JRS){
       out = out.replaceAll(jr,'')
    }
    return out
}
    const res = await fetch(url,{
        method:"GET",
        headers
        })
    const json = await res.json()
            for (let index = 0; index < json.length; index++) {
            const line = json[index];
            const name = line.fullName
            const posID = line.defaultPositionId
                    if(!ELIGIBLE_POSIDS.includes(posID)){continue}
                    const id = line.id
                    idsDict[FixJrs(name)] = {
                        'id':id,'name':name
                    }
                }
                // console.log(Object.keys(idsDict).length)
                // console.log(Object.keys(idsDict).filter(x=>idsDict[x].NFLTeam==='CIN'))
                // console.log(idsDict['Cam Grandy'])
            
        


            for (let year=lastSavedYear;year<=yearMax;year++){
                if(year<2025){continue}
                out[year] = []
                for(let week=1;week<nflState.week;week++){
            const scoring_settings = sleeperSettings[year].scoring_settings
            // const rosterRes = await fetch(`https://api.sleeper.app/v1/league/${sleeper_league_id}/rosters`);
            // const rosters = await rosterRes.json();
            const projRes = await fetch(`https://api.sleeper.com/projections/nfl/${year}/${week}?season_type=regular&position[]=DEF&position[]=K&position[]=QB&position[]=RB&position[]=TE&position[]=WR&order_by=pts_dynasty_std`);
            const projections = await projRes.json();
            const matchupsRes = await fetch(`https://api.sleeper.app/v1/league/${sleeper_league_id}/matchups/${week}`);
            const matchups = await matchupsRes.json();
            for(const matchup of matchups){
                const mid = matchup.matchup_id
                const rid = matchup.roster_id
                const uid = Object.entries(sleeperNames).find(([k, v]) => v.roster_id === rid)?.[0];
                for(const pid of matchup.players){
                    const metaLine = players[pid]
                    let pos = metaLine?.position??'NA'
                    let name
                    const startersInd = matchup.starters.indexOf(pid)
                    let rosterSlot = startersInd>-1?sleeperSettings[year].roster_positions[startersInd]:'Bench'
                    if(rosterSlot==='DEF'){rosterSlot='D/ST'}
                    if(pos==='DEF'){
                        name = metaLine.last_name + ' D/ST';
                        pos = 'D/ST'
                        }else{
                        name = metaLine.full_name
                        }
                    const projLine = projections.find(obj => obj.player_id === pid);
                    const espnLine = idsDict[CleanName(name)]??null
                    if(espnLine){
                        name = espnLine.name
                    }
                    const outLine = {
                        Week:week,
                        PlayerName: name,
                        PlayerFantasyTeam:sleeperNames[uid]?.ind,
                        Position: pos,
                        PlayerRosterSlot:rosterSlot,
                        PlayerScoreActual: matchup.players_points[pid] ,
                        PlayerScoreProj: calculateCustomPoints(projLine?.stats??{},scoring_settings),
                        PlayerTeam: metaLine?.team??'FA',
                        PlayerID: pid,
                    }
                    out[year].push(outLine)
                }
            }
        }
    }
            setProj(out)
        }
        }
 
}