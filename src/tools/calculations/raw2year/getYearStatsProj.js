import { getNames } from "../getNames"
import { UnpackProjLine, UnpackRawLine } from "../other"


export function getYearStatsProj(vars,rawIn,projIn,fa,year,tables){
    let scores = {}
    if(year<2018){return scores}
    const names = getNames(vars.leagueID,year)
    const raw = rawIn[year]
    const proj = projIn[year]
    const WLTw = ['Proj W W','Proj W L','Proj W T']
    const WLTl = ['Proj L W','Proj L L','Proj L T']
    const WLT = ['W','L','TIE']
    const keys = ['Projected to Win','Projected to Lose','Beat Proj Times','Oppo Beat Proj Times',
            'Proj W W','Proj W L','Proj W T','Proj L W','Proj L L','Proj L T',
            'Best Proj','Worst Proj',
            'Best Beat Proj','Worst Lose Proj','Best Proj Dif','Worst Proj Dif',
            'Best Proj Faced', 'Worst Proj Faced','Best Proj Beaten','Worst Proj Lost To','Biggest Overcome','Biggest Blown'
            ]
    const comparedKeys = ['Best Proj','Worst Proj',
            'Best Beat Proj','Worst Lose Proj','Best Proj Dif','Worst Proj Dif',
            'Best Proj Faced', 'Worst Proj Faced','Best Proj Beaten','Worst Proj Lost To','Biggest Overcome','Biggest Blown'
            ]

    const minKeys = ['Worst Lose Proj','Worst Proj Dif','Worst Proj','Worst Proj Faced','Worst Proj Lost To']
    const winKeys = ['Biggest Overcome','Best Proj Beaten']
    const loseKeys = ['Biggest Blown','Worst Proj Lost To']


    function getValue(key,score1,score2,proj1,proj2){
    if (key == 'Best Proj'){ return proj1}
    if (key == 'Worst Proj'){ return proj1}
    if (key == 'Best Beat Proj'){ return score1-proj1}
    if (key == 'Worst Lose Proj'){ return score1 - proj1}
    if (key == 'Best Proj Dif'){ return proj1 - proj2}
    if (key == 'Worst Proj Dif'){ return proj1 - proj2}
    if (key == 'Best Proj Faced'){ return proj2}
    if (key == 'Worst Proj Faced'){ return proj2}
    if (key == 'Best Proj Beaten'){ return proj2}
    if (key == 'Worst Proj Lost To'){ return proj2}
    if (key == 'Biggest Overcome'){ return proj2 - proj1}
    if (key == 'Biggest Blown'){ return proj1 - proj2}
    }
    function getEligible(key,result){
        if (winKeys.includes(key)){
            if (result =="W"){return 1}
            else{return 0}}
        else if (loseKeys.includes(key)){
            if (result =="L"){return 1}
            else{return 0}}
        else{ return 1}}
    function Compare(record,key,value,minKeys){
        if (record == value){return "TIE"}
        else if (minKeys.includes(key)){
            if (record > value) {return "replace"}
            else{return "false"}}
        else if (record < value) {return "replace"}
        else{return "false"}
    }

    for (const key of keys){
        scores[key] = {}
        for(const name of names){
            scores[key][name] = 0
        }
    }
    for (const key of minKeys){
        scores[key] = {}
        for(const name of names){
            scores[key][name] = 99999
        }
    }
    for (const key of comparedKeys){
        for(const name of names){
            // scores[key][name] = [scores[key][name],[]]
            scores[key] = []
        }
    }
    let projections = {}
    //...[name][week]
    let oppo = tables.oppos[year]
    let type = tables.types[year]
    let outcomes = tables.outcomes[year]
    let myScore = tables.scores[year]
    let oppoScore = tables.oppoScores[year]
    let finalWeek = raw[raw.length-1]['Week']
    for (const name of names){
        projections[name] = {}
    }
    // for (const line of raw){
    //     const {week,t1,score1,t2,score2,winner,type} = UnpackRawLine()
    // }
    for (const line of proj){
        const {week,NFLName,actual,projected,team,pos,nflTeam,slot} = UnpackProjLine(line,names)
        // console.log({1:projected,2:NFLName,3:line})
        if(week>finalWeek){continue}
        if(projections[team][week]==undefined){projections[team][week] = 0}
        if(slot!='Bench'&&slot!='IR'){projections[team][week]+=projected}
    }
 
    for(const name of names){
        for(const week in myScore[name]){
            const thisType = type[name][week]
            if(thisType=='BYE'||thisType=='lame'){continue}
            const opponent = oppo[name][week]
            const score1 = myScore[name][week]
            const score2 = oppoScore[name][week]
            const proj1 = projections[name][week]
            const proj2 = projections[opponent][week]
            const result = outcomes[name][week]
            const i = name

            if (proj1 > proj2){
                scores['Projected to Win'][i] += 1
                for(let j=0;j<WLT.length;j++){
                    const item = WLT[j]
                    if (result == item){scores[WLTw[j]][i] += 1}
                }
            }
            else if (proj2 > proj1){
                scores['Projected to Lose'][i] += 1
                for(let j=0;j<WLT.length;j++){
                    const item = WLT[j]
                    if (result == item){scores[WLTl[j]][i] += 1}
                }
            }
            const gamesPlayed = scores['Projected to Win'][i] + scores['Projected to Lose'][i]
            if (score1 > proj1){scores['Beat Proj Times'][i] += 1}
            if (score2 > proj2){scores['Oppo Beat Proj Times'][i] += 1}
            for (const item of comparedKeys){
                const value = getValue(item,score1,score2,proj1,proj2)
                if (getEligible(item,result) ==1){
                    scores[item].push({'value':value,'week':week,'score':score1,'oscore':score2,'proj':proj1,'oproj':proj2
                        ,'oname':opponent,'name':name,'year':year
                    })
                    // const comparison = Compare(scores[item][i][0],item,value,minKeys)
                    // const out = [value, [{'week': week, 'score': score1, 'oscore': score2, 'proj': proj1, 'oproj': proj2,
                    //                 'oname': opponent,'name':name}]]
                    // if (comparison == "TIE"){
                    //     scores[item][i][1].push(out[1][0])
                    // }
                    // else if (comparison == "replace"){
                    //     scores[item][i] = out
                    // }
                }
            }
        }//for week
    }//for names
    return {'scores':scores,'meta':{'comparedKeys':comparedKeys,'minKeys':minKeys},'projections':projections}


    
}