import { GetOtherTables } from "./other"
import GetYearStats from "./raw2year/getYearStats"


export default function GetRecords(vars,records,setRecords,raw,proj,fa){
 let out = {'year':{}}
 let tables = GetOtherTables(vars,raw)
 let oppos = tables.oppos
 let scores = tables.scores
 let types = tables.types     
 let oppoScores = tables.oppoScores   
//  console.log(tables)         
 for(let year=vars.yearMin;year<=vars.currentYear;year++){
    out['year'][year] = GetYearStats(vars,raw,proj,fa,year,tables)
 }  
}   