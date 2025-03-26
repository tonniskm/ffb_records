import { DictMax, DictMin, DictSum, KeysWithValue } from "../other"


export function GetYearAwards(vars,scores,otherVars){
    // const awardsCats = ['champ','dewey does','high score','low score']
    const champ = otherVars.champ
    const deweyDoes = otherVars.deweyDoes
    // names = rawNames //py nonsense
    let awards = {}
    if (champ != 'none' && deweyDoes != 'none'){
        awards['champ'] = [1,champ]
        awards['dewey does'] = [1,deweyDoes]
    }else{
    awards['champ'] = [0,'t0']
    awards['dewey does'] = [0,'t0']
    }
    //[name,type,key(scores[key])]
    const minMaxAwards = [['high score','max','high'],['low score','min','low'],['low high','min','high'],
    ['high low','max','low'],['high scores','max','high scores'],['low scores','max','low scores'],
    ['pts for','max','reg total'],['low pts for','min','reg total'],['pts against','max','oppo reg total'],
    ['low pts against','min','oppo reg total'],['best dif','max','reg pt diff'],['worst dif','min','reg pt diff'],
    ['consistent','min','reg STD'],['boom bust','max','reg STD'],['best record','max','pct'],['worst record','min','pct'],
    ['most narrow W','max','close W'],['most narrow L','max','close L'],['most bad losses','max','L over 100'],
    ['most bad wins','max','W under 80']
]
    for(let i=0;i<minMaxAwards.length;i++){
        let val
        // console.log({1:minMaxAwards[i],2:scores,3:scores[minMaxAwards[2]],4:minMaxAwards[2]})
        if(minMaxAwards[i][1]=='min'){val=DictMin(scores[minMaxAwards[i][2]])}
        else if(minMaxAwards[i][1]=='max'){val=DictMax(scores[minMaxAwards[i][2]])}
        else{console.log('error!!!!!!!!!! in year awards minmax')} 
        awards[minMaxAwards[i][0]] = [val,KeysWithValue(val,scores[minMaxAwards[i][2]])]
    } 
    awards['shootout'] = otherVars.shootOut 
    awards['defensive'] = otherVars.badShootOut 
    awards['high L'] = otherVars.highL
    awards['low W'] = otherVars.lowW

    awards['league reg pts'] = otherVars.regPoints.reduce((a,b)=>a+b,0)
    awards['best week'] = [Math.max(...otherVars.weekTots)/otherVars.leagueSize,
        otherVars.weekTots.indexOf(Math.max(...otherVars.weekTots))+1]
    awards['worst week'] = [Math.min(...otherVars.weekTots)/otherVars.leagueSize,
        otherVars.weekTots.indexOf(Math.min(...otherVars.weekTots))+1]

        
    return awards
 



}
