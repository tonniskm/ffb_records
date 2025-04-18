import { AnalyzeDraft } from "./draft/draftStats"
import { GetOtherTables } from "./other"
import { getPlayerStats } from "./player/getPlayerStats"
import { GetTeamAwards } from "./player/getTeamAwards"
import GetYearStats from "./raw2year/getYearStats"
import { getYearStatsProj } from "./raw2year/getYearStatsProj"
import { getAwardsProj } from "./sum2overall/getAwardsProj"
import { getGameAwards } from "./sum2overall/getGameAwards"
import { getNameAwards } from "./sum2overall/getNameAwards"
import { getNameYearAwards } from "./sum2overall/getNameYearAwards"
import { getOverallStats } from "./sum2overall/getOverallStats"
import { getOverallStatsProj } from "./sum2overall/getOverallStatsProj"
import { getWeekAwards } from "./sum2overall/getWeekAwards"
import { getYearAwards } from "./sum2overall/getYearAwards"
import { GetYearAwards } from "./year2sum/yearAwards"
 
 
export default async function GetRecords(vars,yearMax,setRecords,raw,proj,fa){
 let out = {'year':{},'yearSum':{},'overall':{},'misc':{},'nameAwards':{},'nyAwards':{},'gameAwards':{},'weekAwards':{},
'yearAwards':{},'yearProj':{},'overallProj':{},'projAwards':{},'playerStats':{},'fantasyTeams':{},'matchupTable':{},
'isComplete':{},'bestPlayers':{},'playerTracker':{},'draftAwards':[],'teamAwards':[]
} 
   let regComplete = false
   let yearComplete = false 
   try{ 
      const lastType =raw[yearMax][raw[yearMax].length-1].type
      if(lastType!='REG'){regComplete=true}
      if(lastType=='P3'||lastType=='L3'){yearComplete=true}
      out['isComplete']['reg'] = regComplete
      out['isComplete']['year'] = yearComplete 
      out['isComplete']['lastYear'] = yearMax 
 
 
      let tables = GetOtherTables(vars,raw,proj)           
      // console.log(tables) 
      for(let year=vars.yearMin;year<=yearMax;year++){ 
         const yearStats = GetYearStats(vars,raw,proj,fa,year,tables) 
         out['year'][year] = yearStats['scores']   
         out['misc'][year] = yearStats['other']   
         if(year>=2018){   
            const yearStatsProj = getYearStatsProj(vars,raw,proj,fa,year,tables)
            out['yearProj'][year] = yearStatsProj
         }
         out['yearSum'][year] = GetYearAwards(vars,out['year'][year],yearStats['other']) 
      }         
            
      const overall = getOverallStats(vars,out)   
      out['overall'] = overall.overallStats
      out['matchupTable'] = overall.matchupTable
      const overallProj = getOverallStatsProj(vars,out)
      out['overallProj'] = overallProj
      const nameAwards = getNameAwards(vars,out)
      out['nameAwards'] = nameAwards  
      const nyAwards = getNameYearAwards(vars,out)
      out['nyAwards'] = nyAwards 
      const gameAwards = getGameAwards(vars,raw) 
      out['gameAwards'] = gameAwards
      const weekAwards = getWeekAwards(vars,out) 
      out['weekAwards'] = weekAwards  
      const yearAwards = getYearAwards(vars,out)
      out['yearAwards'] = yearAwards 
      const projAwards = getAwardsProj(vars,out) 
      out['projAwards'] = projAwards
      const playerStats = getPlayerStats(vars,raw,proj,out,tables,yearMax)
      out['playerStats'] = playerStats.awards
      out['fantasyTeams'] = playerStats.fantasyTeams 
      out['bestPlayers'] = playerStats.bestPlayers
      out['playerTracker'] = playerStats.playerTracker 
      GetTeamAwards(vars,tables,out)  
      // try{await AnalyzeDraft(out,yearMax)}catch(e){console.log(e)}
      await AnalyzeDraft(out,yearMax,vars)
     //  console.log(out)        
      setRecords(out)          
   }catch(e){console.log(e)}   
  
}                                                                      