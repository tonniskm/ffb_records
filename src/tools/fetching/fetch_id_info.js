
// https://sports.core.api.espn.com/v3/sports/football/nfl/athletes?limit=1000

import { AnalyzeDraft } from "../calculations/draft/draftStats"
import { CleanName } from "../calculations/other"


export function getPlayerIDInfo(vars){
    let idDicts = []
const url = 'https://sports.core.api.espn.com/v3/sports/football/nfl/athletes?limit=25000'
// console.log('here')
fetch(url,{method:"GET"}).then(response=>
    response.json()).then((json)=>{
        // console.log('here2')
        // console.log(json)
        // idDicts = json.items.filter(x=>x.active)
        const out = []
        idDicts = json.items
        for(const line of idDicts){
            // console.log(line)
            if(line.height===undefined){continue}
            out.push({name:CleanName(line.fullName),height:line.height,weight:line.weight,dob:line.dateOfBirth})
        }
        // console.log(out)
        // console.log(idDicts.length)
        // vars.setNFLstats(out)
        AnalyzeDraft(null,vars.currentYear,vars,true,out)
    })
}