import { DictMax, DictMin, KeysWithValue } from "../other"


export function GetYearAwards(vars,scores,otherVars){
    const {champ, deweyDoes, shootOut, badShootOut, closeGame, blowoutGame, highL, lowW, regPoints, weekTots, leagueSize} = otherVars
    let awards = {}
    if(champ !== 'none' && deweyDoes !== 'none'){
        awards['champ'] = {value: 1, name: [champ]}
        awards['dewey does'] = {value: 1, name: [deweyDoes]}
    } else {
        awards['champ'] = {value: 0, name: ['t0']}
        awards['dewey does'] = {value: 0, name: ['t0']}
    }
    const eligible = vars.allNames.filter(x => scores['games played'][x] > 0)
    //[name,type,key(scores[key])]
    const minMaxAwards = [
        ['high score','max','high'], ['low score','min','low'], ['low high','min','high'],
        ['high low','max','low'], ['high scores','max','high scores'], ['low scores','max','low scores'],
        ['pts for','max','reg total'], ['low pts for','min','reg total'], ['pts against','max','oppo reg total'],
        ['low pts against','min','oppo reg total'], ['best dif','max','reg pt diff'], ['worst dif','min','reg pt diff'],
        ['consistent','min','reg STD'], ['boom bust','max','reg STD'], ['best record','max','pct'], ['worst record','min','pct'],
        ['most W by < 6','max','close W'], ['most L by < 6','max','close L'], ['most losses with over 100','max','L over 100'],
        ['most wins with under 80','max','W under 80'], ['best score vs proj per game','max','Total Score - Proj Per Game'],
        ['worst score vs proj per game','min','Total Score - Proj Per Game']
    ]
    const needsWeek = ['high score','low score','low high','high low']
    for(let i = 0; i < minMaxAwards.length; i++){
        if(!scores[minMaxAwards[i][2]]){continue}
        let val
        if(minMaxAwards[i][1] === 'min'){val = DictMin(scores[minMaxAwards[i][2]], eligible)}
        else if(minMaxAwards[i][1] === 'max'){val = DictMax(scores[minMaxAwards[i][2]], eligible)}
        else{console.log('error!!!!!!!!!! in year awards minmax'); continue}
        const names = KeysWithValue(val, scores[minMaxAwards[i][2]])
        const award = {value: val, name: names}
        if(needsWeek.includes(minMaxAwards[i][0])){
            award.week = names.map(n => scores[minMaxAwards[i][2] + ' W'][n])
        }
        awards[minMaxAwards[i][0]] = award
    }
    awards['shootout'] = {value: shootOut[0], name: shootOut[1], week: shootOut[2], scores: shootOut[3]}
    awards['defensive'] = {value: badShootOut[0], name: badShootOut[1], week: badShootOut[2], scores: badShootOut[3]}
    awards['close game'] = {value: closeGame[0], name: closeGame[1], week: closeGame[2], scores: closeGame[3]}
    awards['blowout'] = {value: blowoutGame[0], name: blowoutGame[1], week: blowoutGame[2], scores: blowoutGame[3]}
    awards['high L'] = highL.length === 5
        ? {value: highL[0], name: highL[1], week: highL[2], oppo: highL[3], oppoScore: highL[4]}
        : {value: 0, name: ['t0']}
    awards['low W'] = lowW.length === 5
        ? {value: lowW[0], name: lowW[1], week: lowW[2], oppo: lowW[3], oppoScore: lowW[4]}
        : {value: 999, name: ['t0']}
    awards['league reg pts'] = regPoints.reduce((a, b) => a + b, 0)
    awards['best week'] = {value: Math.max(...weekTots) / leagueSize, name: weekTots.indexOf(Math.max(...weekTots)) + 1}
    awards['worst week'] = {value: Math.min(...weekTots) / leagueSize, name: weekTots.indexOf(Math.min(...weekTots)) + 1}
    return awards



}
