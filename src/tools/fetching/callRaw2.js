import { sleeperNames } from "../constants/sleeper_names"
import { savedRaw } from "./saved_jsons/raw/saved"
const sleeper_league_id = '1263340152806195200' //sleeper league id for fetching settings


export async function callRaw(vars,setRaw){
    const yearMax = vars.currentYear
    const lastSavedYear = Math.max(...Object.keys(savedRaw).map(x=>parseInt(x)))
    let out = {}
    if (vars.leagueID === 'rajan') {
        out = {...savedRaw}
    }
    if(yearMax<=lastSavedYear && vars.leagueID === 'rajan'){
        setRaw(out)
    }else{
        if(vars.leagueID !== 'rajan'){

            // const url = 'http://localhost:5432/rawrajan/'+yearMax.toString()
            const url = 'https://mocktion-site.vercel.app/rawrajan/'+yearMax.toString()+'/'+vars.yearMin.toString() +'/'+vars.leagueNo.toString()
            fetch(url,{
                // method:'GET',
                // mode:'cors'
            }).then(res=>res.json()).then(json=>{
        
                for(const year in json){
                    // if(year<=lastSavedYear){continue}
                    json[year] = json[year].sort((a,b)=>a.Week-b.Week)
                    if(json[year][0].Score1==0){continue;delete json[year]}
                    out[year] = json[year]
                }
                setRaw(out) 
            })
        }
        else{//Sleeper
            const nflStateRes = await fetch(`https://api.sleeper.app/v1/state/nfl`);
            const nflState = await nflStateRes.json();
            for (let year=lastSavedYear;year<=yearMax;year++){
                if(year<2025){continue}
                out[year] = []
                for(let week=1;week<nflState.week;week++){
                const matchupsRes = await fetch(`https://api.sleeper.app/v1/league/${sleeper_league_id}/matchups/${week}`);
                const matchups = await matchupsRes.json();
                const used_mids = []
                const mid_inds = {}
                let wBracket = []
                let lBracket = []
                for(const matchup of matchups){
                    const mid = matchup.matchup_id
                    const rid = matchup.roster_id
                    const uid = Object.entries(sleeperNames).find(([k, v]) => v.roster_id === rid)?.[0];
                    let type = 'REG'
                    if(week==15){
                        if(!mid){
                            if(wBracket.length<2){type='P1';wBracket.push(sleeperNames[uid]?.ind)}
                            else{type='L1';lBracket.push(sleeperNames[uid]?.ind)}
                        }
                        else if(mid==1 || mid==2){type='P1';wBracket.push(sleeperNames[uid]?.ind)}
                        else if(mid==4 || mid==5){type='L1';lBracket.push(sleeperNames[uid]?.ind)}
                    }

                    if(used_mids.includes(mid)){
                        const s1 = out[year][mid_inds[mid]]['Score1']
                        const s2 = matchup.points
                        out[year][mid_inds[mid]]['Team2'] = sleeperNames[uid]?.ind
                        out[year][mid_inds[mid]]['Score2'] = s2
                        out[year][mid_inds[mid]]['winner'] = s1>s2?out[year][mid_inds[mid]]['Team1']:s1<s2?sleeperNames[uid]?.ind:'TIE'
                        out[year][mid_inds[mid]]['type'] = type //TODO
                        out[year][mid_inds[mid]]['winBracket'] = wBracket//TODO
                        out[year][mid_inds[mid]]['loseBracket'] = lBracket//TODO

                    }else{
                        used_mids.push(mid)
                        out[year].push({
                            Week:week,
                            Team1:sleeperNames[uid]?.ind,
                            Score1:matchup.points
                        })
                        mid_inds[mid] = out[year].length - 1
                    }
                }
            }//week
            }//year
            setRaw(out)
        }
        }
}