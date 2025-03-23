

export default function GetYearStats(vars,raw,proj,fa,year,tables){
    let names = vars.names
    if(year==2012){names=vars.names2012}
    if(year>=2022){names=vars.names2022}
    const teams = names.length
    let highScores = []
    let lowScores = []
    //list of calculated values in this record type
    const calculated = ['name','games played','reg total','reg STD','high scores','low scores','seed','last until','KO by',
        'oppo reg total','W','L','T','pct','high','oppo high','low','oppo low',
        'biggest W','biggest L','closest W','closest L','low W','high L','oppo high L','oppo low W','close W','close L',
        'L over 100','W under 80','ind records','Beat Low Score','Lost to High Score','Record vs Mid',
        'Beat 2nd','Lost to 2nd Last']
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
    let shootOut = [0,[]]
    let badShootOut = [999,[]]
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
            if(Object.keys(weekScores).indexOf(week)>-1){
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
                regPoints.push(score1)
                regPoints.push(score2)
                if(highScores.length>=week){
                    highScores[week-1] = Math.max(highScores[week-1],score1,score2)
                }else{highScores.push(Math.max(score1,score2))}
                if(lowScores.length>=week){
                    lowScores[week-1] = Math.min(highScores[week-1],score1,score2)
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
                    if (scores['high'][player] < score){scores['high'][player] = score}
                    if (scores['low'][player] > score){scores['low'][player] = score}
                    if (scores['oppo high'][player] < otherScore){scores['oppo high'][player] = otherScore}
                    if (scores['oppo low'][player] > otherScore){scores['oppo low'][player] = otherScore}
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
        
                if (lowW[0] == winScore){lowW[1].push(winner)}
                        else if (lowW[0] > winScore){lowW = [winScore,[winner]]}
                        if (highL[0] == loseScore){highL[1].push(loser)}
                        else if (highL[0] < loseScore){highL = [loseScore,[loser]]}
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
                if (shootOut[0] == score1 + score2){shootOut[1].append([names[t1],names[t2]])}
                else if (shootOut[0] < score1 + score2){shootOut = [score1 + score2,[names[t1],names[t2]]]}
                if (badShootOut[0] == score1 + score2){badShootOut[1].append([names[t1],names[t2]])}
                else if (badShootOut[0] > score1 + score2){badShootOut = [score1 + score2, [names[t1],names[t2]]]}
            }//end if not a bye

        }//end if type is lame
    }
// console.log(scores) 
}