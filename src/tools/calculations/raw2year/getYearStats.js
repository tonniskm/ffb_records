import { getNames } from "../getNames"
import { StandardDeviation } from "../other"


export default function GetYearStats(vars,raw,proj,fa,year,tables){

    let names = getNames(vars.leagueID,year)
    const teams = names.length
    let highScores = []
    let lowScores = []
    //list of calculated values in this record type
    const calculated = ['games played','reg total','reg games played','reg STD','high scores','low scores','seed','last until','KO by',
        'oppo reg total','W','L','T','pct','high','oppo high','low','oppo low','high W','oppo high W','low W','oppo low W',
        'biggest W','biggest L','closest W','closest L','low W','high L','oppo high L','oppo low W','close W','close L',
        'L over 100','W under 80','ind records','Beat Low Score','Lost to High Score','Record vs Mid',
        'Beat 2nd','Lost to 2nd Last','reg pt diff','Lost as 2nd','Won as 2nd Last']
    //define record types
    const set0 = ['high','oppo high','biggest W','biggest L','high L','oppo high L']
    const sethigh = ['low','oppo low','low W','oppo low W','closest W','closest L']
    const highVal = 999
    const setOther = ['ind records']
    const setNone = ['seed','last until','KO by','pct']
    const closeWinVal = 6 //win by 5 or fewer
    let scores = {}
    
    //initialize records
    for(let i=0;i<calculated.length;i++){
        scores[calculated[i]] = {}
        for(let n=0;n<names.length;n++){
            if(calculated[i]=='Record vs Mid'){continue}
            scores[calculated[i]][names[n]] = 0
        }
    }
    // for math on all of a persons scores
    let pointList = {}
    for(let n=0;n<names.length;n++){
        pointList[names[n]] = []
    }
    let deweyDoes = 'none'
    let champ = 'none'
    let regPoints = []
    let shootOut = [0,[],[]]
    let badShootOut = [999,[],[]]
    let highL = [0,[]]
    let lowW = [999,[]]
    let weekTots = []
    let leagueSize = 0

    //correct initialization
    for(let n=0;n<names.length;n++){
        for(let i=0;i<set0.length;i++){
            scores[set0[i]][names[n]] = 0
        }
        for(let i=0;i<sethigh.length;i++){
            scores[sethigh[i]][names[n]] = highVal
        }
        for(let i=0;i<setOther.length;i++){
            scores[setOther[i]][names[n]] = []
            for(let n2=0;n2<names.length;n2++){
                scores[setOther[i]][names[n]][names[n2]] = [0,0,0]
            }
        }
        for(let i=0;i<setNone.length;i++){
            scores[setNone[i]][names[n]] = 'none'
        }
    }
    
    let count = 0
    let seedOrder = [1,4,5,3,6,2,7,8,9,10,11,12]
    // let lists = {'oppo':{},'score':{},'type':{},'oppoScore':{}}
    let weekScores = {}

    //for each line in the raw database
    //Week,Team1,Score1,Team2,Score2,winner,type,winBracket,loseBracket
    for(let i=0;i<Object.keys(raw[year]).length;i++){
        let game = raw[year][i]
        let week = parseInt(game['Week'])
        let t1 = names[parseInt(game['Team1'])]
        let score1 = Math.round(parseFloat(game['Score1'])*100)/100
        let t2 = game.Team2
        let score2 = Math.round(parseFloat(game['Score2'])*100)/100
        let winner = game.winner
        let type = game.type


        //if its a real game
        if(t2!='BYE'&&type!='lame'){
            if(Object.keys(weekScores).indexOf(week.toString())>-1){
                weekScores[week].push(score1)
                weekScores[week].push(score2)
            }else{weekScores[week] = [score1,score2]}
        }
        if(t2!='BYE'){t2=names[parseInt(t2)]}
        if(winner!='BYE'&&winner!='TIE'){winner=names[parseInt(winner)]}

        if (week == 1){leagueSize += 2}
        if(type=='P1'||type=='L1'){
            scores['seed'][t1] = seedOrder[count]
            count = count+1
            if(t2!='BYE'){
                scores['seed'][t2] = seedOrder[count]
                count = count+1
            }
        }

        if(type!='lame'){
            if(type=='REG'){
                scores['reg total'][t1] += score1
                scores['reg total'][t2] += score2
                scores['oppo reg total'][t1] += score2
                scores['oppo reg total'][t2] += score1
                scores['reg games played'][t1] += 1
                scores['reg games played'][t2] += 1
                regPoints.push(score1)
                regPoints.push(score2)
                if(highScores.length>=week){
                    highScores[week-1] = Math.max(highScores[week-1],score1,score2)
                }else{highScores.push(Math.max(score1,score2))}
                if(lowScores.length>=week){
                    lowScores[week-1] = Math.min(lowScores[week-1],score1,score2)
                }else{lowScores.push(Math.min(score1,score2))}
                if(weekTots.length>=week){
                    weekTots[week-1] += score1 + score2
                }else{weekTots.push(score1 + score2)}
            }//end 'REG'
            if(t2!='BYE'){
                pointList[t1].push(score1)
                pointList[t2].push(score2)

                for(let p=0;p<2;p++){
                    let score, otherScore, player
                    if(p==0){score=score1;otherScore=score2;player=t1}else{score=score2;otherScore=score1;player=t2}
                    scores['games played'][player] += 1
                    if (scores['high'][player] < score){scores['high'][player] = score;scores['high W'][player] = week}
                    if (scores['low'][player] > score){scores['low'][player] = score;scores['low W'][player] = week}
                    if (scores['oppo high'][player] < otherScore){scores['oppo high'][player] = otherScore;scores['oppo high W'][player] = week}
                    if (scores['oppo low'][player] > otherScore){scores['oppo low'][player] = otherScore;scores['oppo low W'][player] = week}
                }
            }

            if(winner!='BYE'){

                if(winner=='TIE'){
                    if(type=='REG'){
                        scores['T'][t1] += 1
                        scores['T'][t2] += 1
                    }
                    scores['ind records'][t1][t2][2] += 1
                    scores['ind records'][t2][t1][2] += 1
                }else{
    
                    if(type=='REG'){scores['W'][winner] += 1}
                    let loser = 'NA'
                    let winScore = 0
                    let loseScore = 0
                    if(t1==winner){
                        if(type=='REG'){scores['L'][t2] += 1}
                        loser = t2
                        winScore = score1
                        loseScore = score2
                    }else{
                        if(type=='REG'){scores['L'][t1] += 1}
                        loser = t1
                        winScore = score2
                        loseScore = score1
                    }
                    if (scores['biggest W'][winner] < winScore - loseScore){scores['biggest W'][winner] = winScore - loseScore}
                if (scores['closest W'][winner] > winScore-loseScore){scores['closest W'][winner] = winScore - loseScore}
                if (scores['closest L'][loser] > winScore - loseScore){scores['closest L'][loser] = winScore - loseScore}
                if (scores['biggest L'][loser] < winScore - loseScore){scores['biggest L'][loser] = winScore - loseScore}
                if (scores['high L'][loser] < loseScore){scores['high L'][loser] = loseScore}
                if (scores['low W'][winner] > winScore){scores['low W'][winner] = winScore}
                if (scores['oppo low W'][loser] > winScore){scores['oppo low W'][loser] = winScore}
                if (scores['oppo high L'][winner] < loseScore){scores['oppo high L'][winner] = loseScore}
                if( winScore - loseScore < closeWinVal){
                    scores['close W'][winner] += 1
                    scores['close L'][loser] += 1
                }
                if (winScore < 80){scores['W under 80'][winner] += 1}
                if (loseScore > 100){scores['L over 100'][loser] += 1}
                scores['ind records'][winner][loser][0] += 1
                scores['ind records'][loser][winner][1] += 1
        
                if (lowW[0] == winScore){lowW[1].push(winner);lowW[2].push(week);lowW[3].push(loser);lowW[4].push(loseScore);}
                    else if (lowW[0] > winScore){lowW = [winScore,[winner],[week],[loser],[loseScore]];}
                if (highL[0] == loseScore){highL[1].push(loser);highL[2].push(week);highL[3].push(winner);highL[4].push(winScore);}
                    else if (highL[0] < loseScore){highL = [loseScore,[loser],[week],[winner],[winScore]];}
                //left off here line 217
                if(type.includes('P')){
                    scores['last until'][loser] = type
                    scores['KO by'][loser] = winner
                    if (type=="P3"){
                        scores['last until'][winner] = "P4"
                        scores['KO by'][winner] = "Nothing"
                        champ = winner
                    }
                }
                if (leagueSize == 10&&type=='L2'){deweyDoes = loser}else if(leagueSize == 12&&type=='L3'){deweyDoes = loser}
                }//end if not a tie
                if (shootOut[0] == score1 + score2){shootOut[1].push([t1,t2]);shootOut[2].push(week)}
                else if (shootOut[0] < score1 + score2){shootOut = [score1 + score2,[t1,t2],[week]]}
                if (badShootOut[0] == score1 + score2){badShootOut[1].push([t1,t2]);badShootOut[2].push(week)}
                else if (badShootOut[0] > score1 + score2){badShootOut = [score1 + score2, [t1,t2],[week]]}
            }//end if not a bye

        }//end if type is lame

    }// end for each line
    let rankList = {}
    const rankKeys = ['Beat Low Score','Lost to High Score','Beat 2nd','Lost to 2nd Last','Lost as 2nd','Won as 2nd Last']
    let activePlayers = {}
    // scores['Record vs Mid'] = {}
    for(const name of names){scores['Record vs Mid'][name] = [0,0,0]}
    for (let i=0;i<rankKeys.length;i++){
        scores[rankKeys[i]] = {}
        for (let n=0;n<names.length;n++){
            scores[rankKeys[i]][names[n]] = 0
            // scores['Record vs Mid'][names[n]] = [0,0,0]
        }  
    }
    for(let i=0;i<Object.keys(weekScores).length;i++){
        let key = Object.keys(weekScores)[i]
        let week = key //from py
        rankList[key] = {} 
        for (let n=0;n<names.length;n++){
        rankList[key][names[n]] = 'none'  
        }
        activePlayers[week] = weekScores[week].length
        let sortedScores = [...weekScores[week]].sort((a, b) => a - b);
        for (let n=0;n<names.length;n++){
            let s = tables.scores[year][names[n]][week]
            if (s!=undefined && s != 'none' && s != 'BYE' && s != 'lame' && tables.types[year][names[n]][week] == 'REG'){
                rankList[key][names[n]] = sortedScores.indexOf(s) + 1
                // if(year==2024){console.log({1:s,2:rankList,3:sortedScores,4:sortedScores.indexOf(s)})}
            } 
        }
        // if(year==2024){console.log({1:rankList,2:sortedScores})
        // rankList.append(0)}
        for (let n=0;n<names.length;n++){
            let r1 = rankList[key][names[n]]
            if(r1 == 'none'){continue}
            let s1 = tables.scores[year][names[n]][week]
            let oppo = tables.oppos[year][names[n]][week]
            let s2 = tables.oppoScores[year][oppo][week]
            let r2 = rankList[key][oppo]
            let active = activePlayers[key]
            let mid = Math.floor(active/2)
            let midScore = [...weekScores[week]].sort((a, b) => a - b)[mid-1]
            let highMidScore = [...weekScores[week]].sort((a, b) => a - b)[mid]
            let out = 'na'
            let name = names[n]
            // console.log({1:scores,2:midScore})
            if (r2 == active - 1 && r1 == active){scores['Beat 2nd'][name] += 1}
            if (r2 == 2 && r1 == 1){scores['Lost to 2nd Last'][name] += 1}
            if (r2 == active && r1 < active){scores['Lost to High Score'][name] += 1}
            if (r2 == 1 && r1 > 1){scores['Beat Low Score'][name] += 1}
            if (r1 == 2 && r2 == 1){scores['Won as 2nd Last'][name] += 1}
            if (r1 == active -1 && r2 == active){scores['Lost as 2nd'][name]+=1}
            if (s1 > midScore){scores['Record vs Mid'][name][0] += 1
                out = 'W'}
            else if (s1 == highMidScore){scores['Record vs Mid'][name][2] += 1
                out = 'T'}
            else{
                scores['Record vs Mid'][name][1] += 1
                out = 'L'}
        }//for each name
    }//for each week score
    const postProcess = ['reg STD','high scores','low scores','seed','last until','KO by']
    for(let n=0;n<names.length;n++){
        let name = names[n]
        let team = name //team is teamno from py
        let item = pointList[team] //from py
        if (item.length > 1){scores['reg STD'][team] = StandardDeviation(item)}
        else{scores['reg STD'][team] = 'none'}
        if (scores['games played'][team] > 0){
            scores['pct'][team] = (scores['W'][team] + scores["T"][team]/2)/(scores['W'][team]+scores['L'][team]
            +scores['T'][team])}
        for (let i=0;i<item.length;i++){
            let week = i
            let score = item[week]
            if (highScores.length -1 >= week){
                if (highScores[week] <= score){scores['high scores'][team] += 1}
                if (lowScores[week] >= score){scores['low scores'][team] += 1}
            }
    }
    }//end each name
    //cleanup
    for(let i=0;i<set0;i++){
        let item = set0[i]
        let list = scores[item]
        for(let j=0;j<list.length;j++){
            let value = list[j]
            if(value==0){scores[item][j] = 'none'}
        }
    }
    for(let j=0;j<sethigh;j++){
        let item = sethigh[j]
        let list = scores[item]
        for(let i=0;i<list.length;i++){
            let value = list[i]
            if(value==0){scores[item][i] = 'none'}
        }
    }
    for (let n=0;n<names.length;n++){
        let team = names[n]
        scores['reg pt diff'][team] = scores['reg total'][team] - scores['oppo reg total'][team]
        if (scores['seed'][team] != 'none'){
            if (scores['seed'][team] > 6){scores['last until'][team] = 'P0'
                scores['KO by'][team] = 'Failure'
            }
        }
    }
// console.log(year)
// console.log(scores) 
return {'scores':scores,
    'other':{'champ':champ,'deweyDoes':deweyDoes,'shootOut':shootOut,'badShootOut':badShootOut,
        'highL':highL,'lowW':lowW,'regPoints':regPoints,'weekTots':weekTots,'leagueSize':leagueSize
    }
}
}