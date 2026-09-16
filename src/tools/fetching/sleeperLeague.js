import { sleeperNames } from "../constants/sleeper_names";
import { sleeperSettings } from "../constants/sleeper_settings";

// Sleeper issues a new league_id each season for continuing leagues, chained via previous_league_id.
const anchorYear = 2025
const anchorLeagueId = sleeperSettings[anchorYear].league_id
const leagueIdCache = { [anchorYear]: anchorLeagueId }

export async function getSleeperLeagueId(year){
    if(leagueIdCache[year]){return leagueIdCache[year]}
    const knownYears = Object.keys(leagueIdCache).map(y=>parseInt(y))
    const lastKnownYear = Math.max(...knownYears.filter(y=>y<=year))
    let leagueId = leagueIdCache[lastKnownYear]
    const ownerId = Object.keys(sleeperNames)[0]
    for(let y=lastKnownYear+1;y<=year;y++){
        if(leagueIdCache[y]){leagueId = leagueIdCache[y]; continue}
        try{
            const res = await fetch(`https://api.sleeper.app/v1/user/${ownerId}/leagues/nfl/${y}`)
            const leagues = await res.json()
            const nextLeague = Array.isArray(leagues) ? leagues.find(l=>l.previous_league_id===leagueId) : null
            if(nextLeague){leagueId = nextLeague.league_id}
        }catch(e){/* keep last known leagueId as fallback */}
        leagueIdCache[y] = leagueId
    }
    return leagueId
}
