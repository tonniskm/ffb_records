import { ChooseNames, SortNRank, UnpackProjLine } from "../other"


export function getPlayerStats(vars,raw,projIn,input,tables){
    const replacement = {'QB':15,'RB':5,'WR':5,'TE':4,'D/ST':7,'K':7}
    const rawProjIn = projIn
    const names = vars.allNames
    let teamTracker = {}
    let playerTracker = []
    function TeamTrackerInit(name,year,score,proj,pos){
        return {'name':name,'years':[year],'weeks owned':1,'beat proj times':0,'scored':score,'proj score':proj,
        'score-proj':score-proj,'weeks started':0,'weeks benched':0,'weeks flexed':0,'record':[0,0,0],
      'startRecord':[0,0,0],'pos':pos,'best score':[0,[]],'worst score':[9999,[]],
      'best lose score':[0,[]],'worst win score':[9999,[]],'timesNegative':0,'times on IR':0}
    }
    function PlayerTrackerInit(name,year,team,rawScore,rawProject,score,proj,isStart,isFlex,isBench,isIR,
        beatProj,starterBeatProj,pos,isW,isL,isT,startW,startL,startT,isChamp,isDew,isBye,war){
       return  {'name': name, 'years':[year],'teams':[team], 'score': rawScore, 'proj': rawProject,
        'startScore': score,'startProj': proj, 'starts': isStart, 'flexes': isFlex, 'benches': isBench, 'beatProj': beatProj,
            'startBeatProj': starterBeatProj,'pos':pos,'record':[isW,isL,isT],'recordStarting':[startW,startL,startT],
            'byes':isBye,'rings':isChamp,'deweyDoesTimes':isDew,'war':war,'warRate':war,'timesNegative':0,'highScore':score,
            'lowScore':score,'times on IR':isIR}
    }
    for(const name of names){teamTracker[name] = []}
    
    for(const year in rawProjIn){
        const lastWeek = parseInt(raw[year][raw[year].length-1]['Week'])
        const types = tables.types[year]
        const outcomes = tables.outcomes[year]
        const scores = tables.scores[year]
        const opponent = tables.oppos[year]
        const oppoScores = tables.oppoScores[year]

        for (const line of rawProjIn[year]){
            const yearNames = ChooseNames(vars,year)
            const {week,nflName,actual,projected,team,pos,nflTeam,slot} = UnpackProjLine(line,yearNames)
            if(week>lastWeek){continue}
            const gameType = types[team][week]
            if(gameType=='lame'){continue}
            const name = nflName
            const rosterSpot = slot
            let rawScore = actual
            let rawProject = projected
            const outcome = outcomes[team][week]
            let oppo = opponent[team][week]
            let oppoScore = oppoScores[team][week]

            // const isAppend = 0
            let score, proj
            let beatProj
            if (rosterSpot != 'Bench' && rosterSpot != 'IR'){
                score = rawScore
                proj = rawProject
            }else{score = 0; proj = 0}
            if (score > proj){beatProj = 1}
            else{beatProj = 0}
            if (gameType != 'BYE' && gameType != 'lame'){
                if (teamTracker[team].filter(x=>x.name==name).length>0){
                    const ind = teamTracker[team].findIndex(x=>x.name==name)
                    teamTracker[team][ind]['weeks owned'] += 1
                    if (!teamTracker[team][ind]['years'].includes(year)){teamTracker[team][ind]['years'].push(year)}
                    if (beatProj ==  1 ){teamTracker[team][ind]['beat proj times'] += 1}
                    teamTracker[team][ind]['scored'] += score
                    teamTracker[team][ind]['proj score'] += proj
                    teamTracker[team][ind]['score-proj'] += score - proj
                    if (teamTracker[team][ind]['best score'][0] == score){teamTracker[team][ind]['best score'][1].push([year,week])}
                    else if (teamTracker[team][ind]['best score'][0] < score){teamTracker[team][ind]['best score'] = [score,[year,week]]}
                    if (teamTracker[team][ind]['worst score'][0] == score && (rosterSpot!='Bench' && rosterSpot!='IR')){
                        teamTracker[team][ind]['worst score'][1].push([year,week])
                    }
                    else if (teamTracker[team][ind]['worst score'][0] > score&& (rosterSpot!='Bench' && rosterSpot!='IR')){
                        teamTracker[team][ind]['worst score'] = [score,[year,week]]
                    }
                    if (teamTracker[team][ind]['best lose score'][0] == score&&outcome=='L'&&(rosterSpot!='Bench' && rosterSpot!='IR')){
                        teamTracker[team][ind]['best lose score'][1].push([year, week])}
                    else if (teamTracker[team][ind]['best lose score'][0] < score&&(outcome=='L')&&(rosterSpot!='Bench' && rosterSpot!='IR')){
                        teamTracker[team][ind]['best lose score'] = [score, [year, week]]}

                    if (teamTracker[team][ind]['worst win score'][0] == score &&(outcome=='W' && rosterSpot!='Bench' && rosterSpot!='IR')){
                        teamTracker[team][ind]['worst win score'][1].push([year, week])}
                    else if (teamTracker[team][ind]['worst win score'][0] > score &&(outcome=='W' && rosterSpot!='Bench' && rosterSpot!='IR')){
                        teamTracker[team][ind]['worst win score'] = [score, [year, week]]}

                    if (rosterSpot=='Bench' || rosterSpot=='IR'){teamTracker[team][ind]['weeks benched'] += 1}
                    else{
                        teamTracker[team][ind]['weeks started'] += 1
                        if (rosterSpot =='FLEX'){teamTracker[team][ind]['weeks flexed'] += 1}
                        }
                    if(score < 0){teamTracker[team][ind]['timesNegative'] += 1}
                    if(rosterSpot=='IR'){teamTracker[team][ind]['times on IR'] += 1}
                }
                else{
                    // isAppend = 1 // because record is done later
                    teamTracker[team].push(TeamTrackerInit(name,year,score,proj,pos))
                    const i = teamTracker[team].length - 1
                    teamTracker[team][i]['best score']=[score,[year,week]]
                    if((rosterSpot!='Bench' && rosterSpot!='IR')){
                        teamTracker[team][i]['worst score'] = [score,[year,week]]
                        teamTracker[team][i]['best lose score'] = [score,[year,week]]
                        if(outcome=='W'){teamTracker[team][i]['worst win score'] = [score,[year,week]]}
                    }
                    if(score<0){teamTracker[team][i]['timesNegative'] = 1}
                    if (beatProj == 1){teamTracker[team][i]['beat proj times'] = 1}
                    if (rosterSpot=='Bench' || rosterSpot=='IR'){teamTracker[team][i]['weeks benched'] = 1}
                    else{
                        teamTracker[team][i]['weeks started'] = 1
                        if (rosterSpot == 'FLEX'){teamTracker[team][i]['weeks flexed'] = 1}
                    }
                    if(rosterSpot=='IR'){teamTracker[team][i]['times on IR'] = 1}

                }
                

            }//if real game
        //player tracker
            let isFlex,isBench,isIR,isStart, starterBeatProj, isW, isL, isT, isBye, isChamp, isDew, startW, startL,startT,war   
            //already know beatProj and outcome 
            const teamScore = scores[team][week]
            if (outcome == "W"){isW=1}else{isW=0}
            if( outcome == "L"){isL=1}else{isL=0}
            if (outcome == "T"){isT=1}else{isT=0}
            if (outcome == "BYE"){isBye = 1}else{isBye=0}
            if (rosterSpot == 'FLEX'){isFlex = 1}else{isFlex=0}
            if (rosterSpot=='Bench' || rosterSpot=='IR'){isBench = 1}else{isBench=0}
            if (rosterSpot == 'IR'){isIR = 1}else{isIR=0}
            if (outcome != 'BYE'){
                if (rawScore > rawProject){beatProj = 1}else{beatProj=0}
                if (!['Bench','IR'].includes(rosterSpot)){ isStart = 1}else{isStart=0}
                if (rawScore > rawProject && isStart ==1){ starterBeatProj = 1}
                if (oppo==undefined ||oppo=='BYE'){continue}
                // oppoScore = scores[year][week][int(oppo)]
            }
            else{
                rawScore = 0;rawProject = 0 //#don't score points when you are on bye
                oppo = 0;oppoScore = 0
            }
            if( isStart == 1 && isW == 1){startW= 1}else{startW=0}
            if (isStart == 1 && isL == 1){startL = 1}else{startL=0}
            if (isStart == 1 && isT == 1){ startT = 1}else{startT=0}
            if (gameType =='P3' && isW==1){isChamp=1}else{isChamp=0}
            if (gameType =='L3' && isL==1){isDew=1}else{isDew=0}
            if (isStart == 1 && (teamScore - rawScore) + replacement[pos] < oppoScore && isW == 1){war = 1}
            else if (isStart == 1 && (teamScore - rawScore) + replacement[pos] == oppoScore && isW == 1){war = 0.5}
            else if (isStart == 1 && (teamScore - rawScore) + replacement[pos] > oppoScore && isL == 1){ war = -1}
            else if (isStart == 1 && (teamScore - rawScore) + replacement[pos] == oppoScore && isL == 1){ war = -0.5}
            else if (isStart == 1 && (teamScore - rawScore) + replacement[pos] > oppoScore && isT == 1){ war = -0.5}
            else if (isStart == 1 && (teamScore - rawScore) + replacement[pos] < oppoScore && isT == 1){war = 0.5}else{war=0}

            if (playerTracker.filter(x=>x.name==name).length<=0){
                playerTracker.push(PlayerTrackerInit(name,year,team,rawScore,rawProject,score,proj,isStart,isFlex,isBench,isIR,
                    beatProj,starterBeatProj,pos,isW,isL,isT,startW,startL,startT,isChamp,isDew,isBye,war))
                    playerTracker[playerTracker.length-1]['teamInYear'] = {}
                    playerTracker[playerTracker.length-1]['teamInYear'][year] = [team]
                    if (score < 0){playerTracker[playerTracker.length-1]['timesNegative'] = 1}
            }
            else{//already in playerTracker
                const index = playerTracker.findIndex(x=>x.name==name)
                // console.log({1:playerTracker,2:index,3:name,4:playerTracker[index],5:playerTracker[index]['years'],6:year})
                if ((playerTracker[index]['years']).includes(year)){
                    if (!playerTracker[index]['teamInYear'][year].includes(team)){
                        playerTracker[index]['teamInYear'][year].push(team)}
                }else{
                    playerTracker[index]['teamInYear'][year] = [team]
                    playerTracker[index]['years'].push(year)
                }
                if (!playerTracker[index]['teams'].includes(team)){playerTracker[index]['teams'].push(team)}

                const additiveKeys = [['score',rawScore], ['proj',rawProject], ['startScore',score], ['startProj',proj],
                                ['starts',isStart], ['flexes',isFlex], ['benches',isBench], ['beatProj',beatProj],
                                ['startBeatProj',starterBeatProj],
                                ['rings',isChamp],['deweyDoesTimes',isDew],['byes',isBye],['war',war]
                                ]

                playerTracker[index]['highScore'] = Math.max(playerTracker[index]['highScore'],score)
                playerTracker[index]['lowScore'] = Math.min(playerTracker[index]['lowScore'],score)
                if (score < 0){playerTracker[index]['timesNegative'] += 1}


                const recordKeys = [['record',[isW,isL,isT]],['recordStarting',[startW,startL,startT]]]

                for (const key of additiveKeys){playerTracker[index][key[0]] += key[1]}
                for (const key of recordKeys){
                    for (let iter=0;iter<3;iter++){playerTracker[index][key[0]][iter] +=key[1][iter]}
                }
                playerTracker[index]['warRate'] = playerTracker[index]['war']/Math.max(1,playerTracker[index]['starts'])
                
            }
            if (gameType !='BYE' && gameType != 'lame'){
                    const recordKeys = [['record', [isW, isL, isT]], ['startRecord', [startW, startL, startT]]]
                    const index = teamTracker[team].findIndex(x=>x.name==name)
                    for (const key of recordKeys){
                        for(let iter=0;iter<3;iter++){ 
                            // console.log({1:teamTracker,2:team,3:key,4:iter,5:index,6:isW,7:isL,8:key[1][iter]})
                            teamTracker[team][index][key[0]][iter] += key[1][iter]
                            // teamTracker.append(0)
                        }
                    }

            }
            

        }//proj line
    }//year
    let output = {}
    const minGames = 5
    const keys = ['Most Owned Player','Most Started Player','Most Benched Player','Most Flexed Player','Highest Scoring Player',
        'Best Proj Beater','Worst Proj Loser','Most Negative Player']
    const list = [['Most Owned Player','weeks owned'],['Most Started Player','weeks started'],
    ['Most Benched Player','weeks benched'],['Most Flexed Player','weeks flexed'],['Highest Scoring Player','scored'],
    ['Best Proj Beater','score-proj'],['Worst Proj Loser','score-proj'],['Most Negative Player','timesNegative']]
    const smallList = ['Worst Proj Loser']
    const poses = ['QB','RB','WR','TE','D/ST','K']
    let bestList = []
    let bestPlayers = {}
    let bestWeeks = []
    let worstWeeks = []
    let bestLoseWeeks = []
    let worstWinWeeks = []
    for (const pos of poses){
        bestList = bestList.concat([['Best ' +pos,pos,'record','max'],['Worst '+pos,pos,'record','min'],
                     ['Best Starting ' +pos,pos,'startRecord','max'],['Worst Starting ' +pos,pos,'startRecord','min']])
        bestWeeks = bestWeeks.concat([['Best '+pos+' week',pos,'best score','max']])
        worstWeeks = worstWeeks.concat([['Worst '+pos+' week',pos,'worst score','min']])
        bestLoseWeeks = bestLoseWeeks.concat([['Highest '+pos+' lose week',pos,'best lose score','max']])
        worstWinWeeks  = worstWinWeeks.concat([['Lowest ' +pos+' win week',pos,'worst win score','min']])
    }
    for(const name of names){
        if(vars.lameDucks.includes(name)){continue}
        output[name] = {}
        bestPlayers[name] = {}
        for(const item of list){
            // output[name][item[0]] = []
            let vals = []
            let onlyVals = []
            bestPlayers[name][item[0]] = {}
            for(const line of teamTracker[name]){
                // const years = line['years']
                const value = line[item[1]]
                vals.push({'value':value,'name':line.name,'meta':{'team':name}})
                onlyVals.push(value)
            }
            let type
            if(smallList.includes(item[0])){type='min'}
            const new1 = {'title':item[0],'values':SortNRank(onlyVals,vals,type)}
            output[name][item[0]] = new1['values']
            bestPlayers[name][item[0]] = new1
        }//item
        for(const item of bestList){
            // output[name][item[0]] = []
            let vals = []
            let onlyVals = []
            bestPlayers[name][item[0]] = {}
            for(const line of teamTracker[name]){
                const pos = item[1]
                const gp = line['record'][0]+line['record'][1]+line['record'][2]
                if(pos!=line.pos || gp<minGames){continue}
                const value = line[item[2]]
                vals.push({'value':value,'name':line.name,meta:{'record':line['record']}})
                onlyVals.push(value)
            }
            const new1 = {'title':item[0],'values':SortNRank(onlyVals,vals,item[3])}
            output[name][item[0]] = new1['values']
            bestPlayers[name][item[0]] = new1
        }

        for(const item of bestWeeks.concat(worstWeeks).concat(bestLoseWeeks).concat(worstWinWeeks)){
            // output[name][item[0]] = []
            let vals = []
            let onlyVals = []
            bestPlayers[name][item[0]] = {}
            for(const line of teamTracker[name]){
                const pos = item[1]
                if(pos!=line.pos){continue}
                const value = line[item[2]][0]
                const meta = line[item[2]][1]
                vals.push({'value':value,'name':line.name,'meta':meta})
                onlyVals.push(value)
            }
            const new1 = {'title':item[0],'values':SortNRank(onlyVals,vals,item[3])}
            output[name][item[0]] = new1['values']
            bestPlayers[name][item[0]] = new1
        }
    }//for name


    //fantasy teams
    const fantasyTeams = {}
    // const poses = ['QB', 'RB', 'WR', 'TE', 'D/ST', 'K']
    for(const name of names){
        if(vars.lameDucks.includes(name)){continue}
        const team = name
        fantasyTeams[name] = {}
        let possibleFlexes = []
        for(const pos of poses){
            let number1,number2,number3
            const key = 'Best '+pos+' week'
            // console.log({1:bestPlayers,2:bestPlayers[team],3:bestPlayers[team][key],4:key})
            const sortedPlayers = bestPlayers[team][key]['values'].sort((a,b)=>a.rank-b.rank)
            fantasyTeams[team][pos +'1'] = [sortedPlayers[0].value,sortedPlayers[0]]
            if(['RB','WR'].includes(pos)){
                fantasyTeams[team][pos+'2'] = [sortedPlayers[1].value,sortedPlayers[1]]
                possibleFlexes.push([sortedPlayers[2].value,sortedPlayers[2]])
            }
            if(pos=='TE'){
                possibleFlexes.push([sortedPlayers[1].value,sortedPlayers[1]])
            }
        }
        const sortedFlex = possibleFlexes.sort((a,b)=>b[0]-a[0])
        fantasyTeams[team]['Flex'] = sortedFlex[0]
        let total = 0
        for(const key in fantasyTeams[team]){
            total += fantasyTeams[team][key][0]
        }
        fantasyTeams[team]['Total'] = total
    }

    //awards
    let awards = []
    const list1  = [
        ['Best Fantasy','The person with the best fantasy fantasy team','Total','max'],
        ['Worst Fantasy','The person with the worst fantasy fantasy team','Total','min']
    ]
    for(const item of list1){
        let vals = []
        let onlyVals = []
        for(const name of names){
            if (vars.lameDucks.includes(name)){continue}
            const value = fantasyTeams[name][item[2]]
            vals.push({'name':name,'value':value})
            onlyVals.push(value)
        }
        awards.push({'title':item[0],'desc':item[1],'values':SortNRank(onlyVals,vals,item[3])})
    }
    const list2 = [
        ['Negative Nancy1','The person who has gotten a negative score the most','timesNegative','max'],
        ['Positive Peter','The person who has gotten negative scores the least','timesNegative','min']
    ]
    for(const item of list2){
        let vals = []
        let onlyVals = []
        for(const name of names){
            if (vars.lameDucks.includes(name)){continue}
            const value = teamTracker[name].reduce((a,b)=>a+b[item[2]],0)
            vals.push({'name':name,'value':value})
            onlyVals.push(value)
        }
        awards.push({'title':item[0],'desc':item[1],'values':SortNRank(onlyVals,vals,item[3])})
    }
    const list3 = [
        ['Here We Go Again','The player with the most weeks owned by the same team','Most Owned Player'],
        ['Workhorse','The player who has started the most weeks by the same team','Most Started Player'],
        ['Riding the pine','The player that has been on the same teams bench the most','Most Benched Player']
    ]
    for(const item of list3){
        let vals = []
        let onlyVals = []
        for(const name of names){
            if (vars.lameDucks.includes(name)){continue}
            for(const line of output[name][item[2]]){
                let value,onlyValue
                // console.log({1:line})
                onlyValue = line['value']
                value = {'value':onlyValue,'name':line['name'],'meta':line['meta']}
                vals.push(value)
                onlyVals.push(onlyValue)
            }
            // console.log({1:output,2:output[name][item[2]],3:output[name][item[2]]['values']})
            // output.append(0)
            // const sorted = output[name][item[2]].sort((a,b)=>a.rank-b.rank)
            // const value = sorted[0].value
            // // let meta = []
            // const meta = sorted.filter(x=>x.rank==1)
            // vals.push({'name':name,'value':value,'meta':meta})
            // onlyVals.push(value)
        }
        awards.push({'title':item[0],'desc':item[1],'values':SortNRank(onlyVals,vals,item[3])})
    }

    //player awards
    const minGames1 = 20
    const lowMinGames = 5
    const list4 = [
        ['Took the Slow Train from Philly','The player with the most teams in one year','teamInYear','all','max','special'],
        ['I Get Around','The player who has been on the most teams','teams','all','max','normal'],
        ['I Also Get Around','The player who has been on the most teams no D/ST','teams','noDST','max','normal'],
        ['Never not Working','The player who has been started the most','starts','all','max','normal'],
        ['Riding the Pine','The player who has been on the bench the most','benches','all','max','normal'],
        ['Gun Show','The Player who has been flexed the most','flexes','all','max','normal'],
        ['The Winner','The Player with the most wins','record','all','max','normal'],
        ['Actual Winner','The player with the most wins while starting','recordStarting','all','max','normal'],
        ['Consistent Winner','The player with the highest winrate (min '+minGames1.toString()+' games played)','record','all','max','normal'],
        ['Actual Consistent Winner','The player with the highest winrate while starting (min '+minGames1.toString()+' games played)','recordStarting','all','max','normal'],
        ['Well Rested','The player with the most byes','byes','all','max','normal'],
        ['The Bread Winner','The player with the most championships','rings','all','max','normal'],
        ['The Absolute Worst','The player with the most Dewey Does titles','deweyDoesTimes','all','max','normal'],
        ['Consistent QB','The QB with the highest winrate (min '+minGames1.toString()+' games played)','recordStarting','QB','max','rate'],
        ['Consistent RB','The RB with the highest winrate (min '+minGames1.toString()+' games played)','recordStarting','RB','max','rate'],
        ['Consistent WR','The WR with the highest winrate (min '+minGames1.toString()+' games played)','recordStarting','WR','max','rate'],
        ['Consistent TE','The TE with the highest winrate (min '+minGames1.toString()+' games played)','recordStarting','TE','max','rate'],
        ['Consistent D/ST','The D/ST with the highest winrate (min '+minGames1.toString()+' games played)','recordStarting','D/ST','max','rate'],
        ['Consistent K','The K with the highest winrate (min '+minGames1.toString()+' games played)','recordStarting','K','max','rate'],
        ['Toxic Player','The Player with the worst overall winrate (min '+minGames1.toString()+' games played)','all','min','rate'],
        ['Toxic Starter','The Player with the worst winrate starting (min '+minGames1.toString()+' games played)','all','min','rate'],
        ['Toxic QB','The QB with the worst winrate starting (min '+minGames1.toString()+' games played)','recordStarting','QB','min','rate'],
        ['Toxic RB','The RB with the worst winrate starting (min '+minGames1.toString()+' games played)','recordStarting','RB','min','rate'],
        ['Toxic WR','The WR with the worst winrate starting (min '+minGames1.toString()+' games played)','recordStarting','WR','min','rate'],
        ['Toxic TE','The TE with the worst winrate starting (min '+minGames1.toString()+' games played)','recordStarting','TE','min','rate'],
        ['Toxic K','The K with the worst winrate starting (min '+minGames1.toString()+' games played)','recordStarting','D/ST','min','rate'],
        ['Toxic D/ST','The D/ST with the worst winrate starting (min '+minGames1.toString()+' games played)','recordStarting','K','min','rate'],
        ['What is Victory?','The most weeks owned without a win','record','all','max','normal'],
        ["Someday I'll win",'The most starts without a win','recordStarting','all','max','normal'],
        ['WAR!','The player with the highest WAR','war','all','max','normal'],
        ['What is it good for?','The player with the lowest WAR','war','all','min','normal'],
        ['HUH!','The player with the highest WAR per game started (min '+lowMinGames.toString()+' games played)','warRate','all','max','normal'],
        ['Absolutely Nothing!','The player with the lowest WAR per game started (min '+lowMinGames.toString()+ ' games played)','warRate','all','min','normal'],
        ['Negative Nancy','The Player who has score negative the most','timesNegative','all','max','normal'],
        ['Real Negative Nancy','The non D/ST who has score negative the most','timesNegative','noDST','max','normal'],
        ['Top Dawg','The highest score ever recorded','highScore','all','max','normal'],
        ['Bad Day','The worst score ever recorded','lowScore','all','min','normal']
    ]
    const winRateList = ['Consistent Winner','Actual Consistent Winner','Consistent QB','Consistent RB','Consistent WR',
        'Consistent TE','Consistent D/ST','Consistent K','Toxic Player','Toxic Starter','Toxic QB','Toxic RB','Toxic WR',
        'Toxic TE','Toxic D/ST','Toxic K'
    ]
    // const specialList = ['Took the Slow Train from Philly']


    for(const item of list4){
        let vals = []
        let onlyVals = []
        if(item[5]=='special'){//'Took the Slow Train from Philly'
            for(const line of playerTracker){
                for(const year of line['years']){
                        let onlyValue, value
                        onlyValue = line['teamInYear'].length
                        value = {'value':onlyValue,'name':line['name'],'teams':line['teamInYear'],'year':year}
                        onlyVals.push(onlyValue)
                        vals.push(value)
                    }
                }
            }else{//other items
                for(const line of playerTracker){
                    let onlyValue, value
                    const pos = line['pos']
                    const posID = item[3]
                    const valID = item[5]
                    const minID = item[4]
                    const key = item[2]
                    if(posID=='noDST'&&pos=='D/ST'){continue}
                    else if(poses.includes(posID)&&pos!=posID){continue}
                    if(valID=='rate'){//need winrate,not wins
                        onlyValue = (line[key][0]+line[key][1]/2)/Math.max(1,line[key][0]+line[key][1]+line[key][2])
                        value = {'value':onlyValue,'name':line['name'],'record':line[key]}
                    }else{//just compare values, no calculations
                        onlyValue = line[key]
                        value = {'value':onlyValue,'name':line['name']}
                    }
                    
                    vals.push(value)
                    onlyVals.push(onlyValue)
                }
    

            awards.push({'title':item[0],'desc':item[1],'values':SortNRank(onlyVals,vals,item[4])})
        }


    }


return awards  
}