import { ChooseNames, DictKeysWithValue, DictMax, DictMin, RecordToFrac, SortNRank, UnpackProjLine } from "../other"


export function getPlayerStats(vars,raw,projIn,input,tables,yearMax){
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
            'lowScore':score,'times on IR':isIR,'rawScoreInYear':{},'startScoreInYear':{}}
    }
    for(const name of names){teamTracker[name] = []}
    
    for(const year in rawProjIn){
        if(year>yearMax){continue}
        const lastWeek = parseInt(raw[year][raw[year].length-1]['Week'])
        const types = tables.types[year]
        const outcomes = tables.outcomes[year]
        const scores = tables.scores[year]
        const opponent = tables.oppos[year]
        const oppoScores = tables.oppoScores[year]

        for (const line of rawProjIn[year]){
            const yearNames = ChooseNames(vars,year)
            const {week,NFLName,actual,projected,team,pos,nflTeam,slot} = UnpackProjLine(line,yearNames)
            if(week>lastWeek){continue}
            const gameType = types[team][week]
            if(gameType=='lame'){continue}
            const name = NFLName
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
            if (outcome == "BYE"||outcome==undefined){isBye = 1}else{isBye=0}
            if (rosterSpot == 'FLEX'){isFlex = 1}else{isFlex=0}
            if (rosterSpot=='Bench' || rosterSpot=='IR'){isBench = 1}else{isBench=0}
            if (rosterSpot == 'IR'){isIR = 1}else{isIR=0}
            if (outcome != 'BYE'&&outcome!=undefined){
                if (rawScore > rawProject){beatProj = 1}else{beatProj=0}
                if (!['Bench','IR'].includes(rosterSpot)){ isStart = 1}else{isStart=0}
                if (rawScore > rawProject && isStart ==1){ starterBeatProj = 1}else{starterBeatProj=0}
                if (oppo==undefined ||oppo=='BYE'){continue}
                // oppoScore = scores[year][week][int(oppo)]
            }
            else{
                rawScore = 0;rawProject = 0 //#don't score points when you are on bye
                oppo = 0;oppoScore = 0
                beatProj=0;starterBeatProj=0;isStart=0;isBye=1
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
                    playerTracker[playerTracker.length-1]['rawScoreInYear'][year] = rawScore
                    playerTracker[playerTracker.length-1]['startScoreInYear'][year] = score
            }
            else{//already in playerTracker
                const index = playerTracker.findIndex(x=>x.name==name)
                // console.log({1:playerTracker,2:index,3:name,4:playerTracker[index],5:playerTracker[index]['years'],6:year})
                if ((playerTracker[index]['years']).includes(year)){
                    if (!playerTracker[index]['teamInYear'][year].includes(team)){
                        playerTracker[index]['teamInYear'][year].push(team)}
                    playerTracker[index]['rawScoreInYear'][year] += rawScore
                    playerTracker[index]['startScoreInYear'][year] += score
                }else{
                    playerTracker[index]['teamInYear'][year] = [team]
                    playerTracker[index]['years'].push(year)
                    playerTracker[index]['rawScoreInYear'][year] = rawScore
                    playerTracker[index]['startScoreInYear'][year] = score
                }
                if (!playerTracker[index]['teams'].includes(team)){playerTracker[index]['teams'].push(team)}

                const additiveKeys = [['score',rawScore], ['proj',rawProject], ['startScore',score], ['startProj',proj],
                                ['starts',isStart], ['flexes',isFlex], ['benches',isBench], ['beatProj',beatProj],
                                ['startBeatProj',starterBeatProj],
                                ['rings',isChamp],['deweyDoesTimes',isDew],['byes',isBye],['war',war],['times on IR',isIR]
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
    const minGamesOwned = 10
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
                if(pos!=line.pos || (item[2]==='record'&&gp<minGamesOwned) || (item[2]==='startRecord'&&gp<minGames)){continue}
                const value = RecordToFrac(line[item[2]])
                vals.push({'value':value,'name':line.name,'meta':{'record':line['record']}})
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
            // let number1,number2,number3
            const key = 'Best '+pos+' week'
            // console.log({1:bestPlayers,2:bestPlayers[team],3:bestPlayers[team][key],4:key})
            const sortedPlayers = bestPlayers[team][key]['values'].sort((a,b)=>a.rank-b.rank)
            if(sortedPlayers.length==0){continue}
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
        if(sortedFlex.length==0){continue}
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
        {'id':'pa1','title':'Best Fantasy','description':'The person with the best fantasy fantasy team','keyID':'Total','MinMax':'max','meta':['name'],'agg':'person','calcType':'def'},
        {'id':'pa2','title':'Worst Fantasy','description':'The person with the worst fantasy fantasy team','keyID':'Total','MinMax':'min','meta':['name'],'agg':'person','calcType':'def'},
        {'id':'pa3','title':'Negative Nancy1','description':'The person who has gotten a negative score the most','keyID':'timesNegative','MinMax':'max','meta':['name'],'agg':'person','calcType':'sum'},
        {'id':'pa4','title':'Positive Peter','description':'The person who has gotten negative scores the least','keyID':'timesNegative','MinMax':'min','meta':['name'],'agg':'person','calcType':'sum'}    
    ]
    for(const item of list1){
        let vals = []
        let onlyVals = []
        if (item.agg=='person'){
            for(const name of names){
                if (vars.lameDucks.includes(name)){continue}
                let value
                if(item.calcType=='def'){value = fantasyTeams[name][item.keyID]}
                if(item.calcType=='sum'){value = teamTracker[name].reduce((a,b)=>a+b[item.keyID],0)}
                vals.push({'name':name,'value':value})
                onlyVals.push(value)
        }
        }
        awards.push({'title':item.title,'desc':item.description,'values':SortNRank(onlyVals,vals,item.MinMax),'meta':['name'],'id':item.id})
    }
    // const list2 = [
    //     {'id':'pa3','title':'Negative Nancy1','description':'The person who has gotten a negative score the most','keyID':'timesNegative','MinMax':'max','meta':['name']},
    //     {'id':'pa4','title':'Positive Peter','description':'The person who has gotten negative scores the least','keyID':'timesNegative','MinMax':'min','meta':['name']}
    // ]
    // for(const item of list2){
    //     let vals = []
    //     let onlyVals = []
    //     for(const name of names){
    //         if (vars.lameDucks.includes(name)){continue}
    //         const value = teamTracker[name].reduce((a,b)=>a+b[item.keyID],0)
    //         vals.push({'name':name,'value':value})
    //         onlyVals.push(value)
    //     }
    //     awards.push({'title':item.title,'desc':item.description,'values':SortNRank(onlyVals,vals,item.MinMax),'meta':['name']})
    // }
    const list3 = [
        {'id':'pa5','title':'Here We Go Again','description':'The player with the most weeks owned by the same team','keyID':'Most Owned Player','MinMax':null,'meta':['name','meta']},
        {'id':'pa6','title':'Workhorse','description':'The player who has started the most weeks by the same team','keyID':'Most Started Player','MinMax':null,'meta':['name','meta']},
        {'id':'pa7','title':'Riding the pine','description':'The player that has been on the same teams bench the most','keyID':'Most Benched Player','MinMax':null,'meta':['name','meta']}
    ]
    for(const item of list3){
        let vals = []
        let onlyVals = []
        for(const name of names){
            if (vars.lameDucks.includes(name)){continue}
            for(const line of output[name][item.keyID]){
                let value,onlyValue
                // console.log({1:line})
                onlyValue = line['value']
                value = {'value':onlyValue,'name':line['name'],'meta':line['meta']}
                vals.push(value)
                onlyVals.push(onlyValue)
            }
        }
        awards.push({'title':item.title,'desc':item.description,'values':SortNRank(onlyVals,vals,item.MinMax),'meta':['name','meta'],'id':item.id})
    }

    //player awards
    const minGames1 = 20
    const lowMinGames = 5
    const list4 = [
        {"id":"pa1","title":"Took the Slow Train from Philly","description":"The player with the most teams in one year","keyID":"teamInYear","pos":"all","MinMax":"max","calcType":"special","minGames":0,"meta":["name","year","teams"]},
        {"id":"pa2","title":"I Get Around","description":"The player who has been on the most teams","keyID":"teams","pos":"all","MinMax":"max","calcType":"normal","minGames":0,"meta":["name","teams"]},
        {"id":"pa3","title":"I Also Get Around","description":"The player who has been on the most teams no D/ST","keyID":"teams","pos":"noDST","MinMax":"max","calcType":"normal","minGames":0,"meta":["name","teams"]},
        {"id":"pa4","title":"Never not Working","description":"The player who has been started the most","keyID":"starts","pos":"all","MinMax":"max","calcType":"normal","minGames":0,"meta":["name"]},
        {"id":"pa5","title":"Riding the Pine","description":"The player who has been on the bench the most","keyID":"benches","pos":"all","MinMax":"max","calcType":"normal","minGames":0,"meta":["name"]},
        {"id":"pa6","title":"Gun Show","description":"The Player who has been flexed the most","keyID":"flexes","pos":"all","MinMax":"max","calcType":"normal","minGames":0,"meta":["name"]},
        {"id":"pa7","title":"The Winner","description":"The Player with the most wins","keyID":"record","pos":"all","MinMax":"max","calcType":"W","minGames":0,"meta":["name"]},
        {"id":"pa8","title":"The Biggest Loser","description":"The player with the most losses","keyID":"record","pos":"all","MinMax":"max","calcType":"L","minGames":0,"meta":["name"]},
        {"id":"pa9","title":"Actual Winner","description":"The player with the most wins while starting","keyID":"recordStarting","pos":"all","MinMax":"max","calcType":"W","minGames":0,"meta":["name"]},
        {"id":"pa10","title":"The Actual Biggest Loser","description":"The player with the most losses while starting","keyID":"recordStarting","pos":"all","MinMax":"max","calcType":"L","minGames":0,"meta":["name"]},
        {"id":"pa11","title":"Consistent Winner","description":"The player with the highest winrate (min "+minGames1.toString()+" games played)","keyID":"record","pos":"all","MinMax":"max","calcType":"rate","minGames":minGames1,"meta":["name","record"]},
        {"id":"pa12","title":"Actual Consistent Winner","description":"The player with the highest winrate while starting (min "+lowMinGames.toString()+" games started)","keyID":"recordStarting","pos":"all","MinMax":"max","calcType":"rate","minGames":lowMinGames,"meta":["name","recordStarting"]},
        {"id":"pa13","title":"Well Rested","description":"The player with the most byes","keyID":"byes","pos":"all","MinMax":"max","calcType":"normal","minGames":0,"meta":["name"]},
        {"id":"pa14","title":"The Bread Winner","description":"The player with the most championships","keyID":"rings","pos":"all","MinMax":"max","calcType":"normal","minGames":0,"meta":["name"]},
        {"id":"pa15","title":"The Absolute Worst","description":"The player with the most Dewey Does titles","keyID":"deweyDoesTimes","pos":"all","MinMax":"max","calcType":"normal","minGames":0,"meta":["name"]},
        {"id":"pa16","title":"Consistent QB","description":"The QB with the highest winrate (min "+lowMinGames.toString()+" games started)","keyID":"recordStarting","pos":"QB","MinMax":"max","calcType":"rate","minGames":lowMinGames,"meta":["name","recordStarting"]},
        {"id":"pa17","title":"Consistent RB","description":"The RB with the highest winrate (min "+lowMinGames.toString()+" games started)","keyID":"recordStarting","pos":"RB","MinMax":"max","calcType":"rate","minGames":lowMinGames,"meta":["name","recordStarting"]},
        {"id":"pa18","title":"Consistent WR","description":"The WR with the highest winrate (min "+lowMinGames.toString()+" games started)","keyID":"recordStarting","pos":"WR","MinMax":"max","calcType":"rate","minGames":lowMinGames,"meta":["name","recordStarting"]},
        {"id":"pa19","title":"Consistent TE","description":"The TE with the highest winrate (min "+lowMinGames.toString()+" games started)","keyID":"recordStarting","pos":"TE","MinMax":"max","calcType":"rate","minGames":lowMinGames,"meta":["name","recordStarting"]},
        {"id":"pa20","title":"Consistent D/ST","description":"The D/ST with the highest winrate (min "+lowMinGames.toString()+" games started)","keyID":"recordStarting","pos":"D/ST","MinMax":"max","calcType":"rate","minGames":lowMinGames,"meta":["name","recordStarting"]},
        {"id":"pa21","title":"Consistent K","description":"The K with the highest winrate (min "+lowMinGames.toString()+" games started)","keyID":"recordStarting","pos":"K","MinMax":"max","calcType":"rate","minGames":lowMinGames,"meta":["name","recordStarting"]},
        {"id":"pa22","title":"Toxic Player","description":"The Player with the worst overall winrate (min "+minGames1.toString()+" games played)","keyID":"record","pos":"all","MinMax":"min","calcType":"rate","minGames":minGames1,"meta":["name","record"]},
        {"id":"pa23","title":"Toxic Starter","description":"The Player with the worst winrate starting (min "+lowMinGames.toString()+" games started)","keyID":"recordStarting","pos":"all","MinMax":"min","calcType":"rate","minGames":lowMinGames,"meta":["name","recordStarting"]},
        {"id":"pa24","title":"Toxic QB","description":"The QB with the worst winrate starting (min "+lowMinGames.toString()+" games played)","keyID":"recordStarting","pos":"QB","MinMax":"min","calcType":"rate","minGames":lowMinGames,"meta":["name","recordStarting"]},
        {"id":"pa25","title":"Toxic RB","description":"The RB with the worst winrate starting (min "+lowMinGames.toString()+" games played)","keyID":"recordStarting","pos":"RB","MinMax":"min","calcType":"rate","minGames":lowMinGames,"meta":["name","recordStarting"]},
        {"id":"pa26","title":"Toxic WR","description":"The WR with the worst winrate starting (min "+lowMinGames.toString()+" games played)","keyID":"recordStarting","pos":"WR","MinMax":"min","calcType":"rate","minGames":lowMinGames,"meta":["name","recordStarting"]},
        {"id":"pa27","title":"Toxic TE","description":"The TE with the worst winrate starting (min "+lowMinGames.toString()+" games played)","keyID":"recordStarting","pos":"TE","MinMax":"min","calcType":"rate","minGames":lowMinGames,"meta":["name","recordStarting"]},
        {"id":"pa28","title":"Toxic K","description":"The K with the worst winrate starting (min "+lowMinGames.toString()+" games played)","keyID":"recordStarting","pos":"K","MinMax":"min","calcType":"rate","minGames":lowMinGames,"meta":["name","recordStarting"]},
        {"id":"pa29","title":"Toxic D/ST","description":"The D/ST with the worst winrate starting (min "+lowMinGames.toString()+" games played)","keyID":"recordStarting","pos":"D/ST","MinMax":"min","calcType":"rate","minGames":lowMinGames,"meta":["name","recordStarting"]},
        {"id":"pa30","title":"What is Victory?","description":"The most weeks owned without a win","keyID":"record","pos":"all","MinMax":"max","calcType":"special1","minGames":0,"meta":["name"]},
        {"id":"pa31","title":"Someday I'll win","description":"The most starts without a win","keyID":"recordStarting","pos":"all","MinMax":"max","calcType":"special1","minGames":0,"meta":["name"]},
        {"id":"pa32","title":"WAR!","description":"The player with the highest WAR","keyID":"war","pos":"all","MinMax":"max","calcType":"normal","minGames":0,"meta":["name"]},
        {"id":"pa33","title":"HUH!","description":"The player with the highest WAR per game started (min "+lowMinGames.toString()+" games played)","keyID":"warRate","pos":"all","MinMax":"max","calcType":"normal","minGames":lowMinGames,"meta":["name"]},
        {"id":"pa34","title":"What is it good for?","description":"The player with the lowest WAR","keyID":"war","pos":"all","MinMax":"min","calcType":"normal","minGames":0,"meta":["name"]},
        {"id":"pa35","title":"Absolutely Nothing!","description":"The player with the lowest WAR per game started (min "+lowMinGames.toString()+" games played)","keyID":"warRate","pos":"all","MinMax":"min","calcType":"normal","minGames":lowMinGames,"meta":["name"]},
        {"id":"pa36","title":"Negative Nancy","description":"The Player who has score negative the most","keyID":"timesNegative","pos":"all","MinMax":"max","calcType":"normal","minGames":0,"meta":["name"]},
        {"id":"pa37","title":"Real Negative Nancy","description":"The non D/ST who has score negative the most","keyID":"timesNegative","pos":"noDST","MinMax":"max","calcType":"normal","minGames":0,"meta":["name"]},
        {"id":"pa38","title":"Top Dawg","description":"The highest score ever recorded","keyID":"highScore","pos":"all","MinMax":"max","calcType":"normal","minGames":0,"meta":["name"]},
        {"id":"pa39","title":"Bad Day","description":"The worst score ever recorded","keyID":"lowScore","pos":"all","MinMax":"min","calcType":"normal","minGames":0,"meta":["name"]},
        {"id":"pa40","title":"Bad Day1","description":"The worst score ever recorded (no D/ST)","keyID":"lowScore","pos":"noDST","MinMax":"min","calcType":"normal","minGames":0,"meta":["name"]},
        {'id':'pa41','title':'Top Scorer','description':"The player who has scored the most points",'keyID':'score','pos':'all','MinMax':'max','calcType':'normal','minGames':0,'meta':['name']},
        {'id':'pa41.1','title':'Real Top Scorer','description':"The player who has scored the most points while starting",'keyID':'startScore','pos':'Each','MinMax':'max','calcType':'normal','minGames':0,'meta':['name']},
        {'id':'pa41.2','title':'Real Best Scorer','description':"The player who has scored the most points while starting per start (min "+lowMinGames.toString()+" games played)",'keyID':'startScore','pos':'Each','MinMax':'max','calcType':'perStart','minGames':lowMinGames,'meta':['name']},
        {'id':'pa41.3','title':'Real Worst Scorer','description':"The player who has scored the fewest points while starting per start (min "+lowMinGames.toString()+" games played)",'keyID':'startScore','pos':'Each','MinMax':'min','calcType':'perStart','minGames':lowMinGames,'meta':['name']},
        {'id':'pa42','title':'A Good Year','description':"The player who has scored the most points in a year",'keyID':'rawScoreInYear','pos':'Each','MinMax':'max','calcType':'years','minGames':0,'meta':['name','year']},
        {'id':'pa43','title':'A Great Year','description':"The player who has scored the most points in a year while starting",'keyID':'startScoreInYear','pos':'Each','MinMax':'max','calcType':'years','minGames':0,'meta':['name','year']},
        {'id':'pa44','title':'Glass Bones','description':'The player who has been on IR the most','keyID':'times on IR','pos':'all','MinMax':'max','calcType':'normal','minGames':0,'meta':['name']},

    ]
    const winRateList = ['Consistent Winner','Actual Consistent Winner','Consistent QB','Consistent RB','Consistent WR',
        'Consistent TE','Consistent D/ST','Consistent K','Toxic Player','Toxic Starter','Toxic QB','Toxic RB','Toxic WR',
        'Toxic TE','Toxic D/ST','Toxic K'
    ]
    // const specialList = ['Took the Slow Train from Philly']


    for(const item of list4){
        let vals = []
        let onlyVals = []
        let valsEach = {}
        let onlyValsEach = {}
        for(const pos of poses){valsEach[pos]=[];onlyValsEach[pos]=[]}
        let meta = item.meta
        if(item.calcType=='special'){//'Took the Slow Train from Philly'
            for(const line of playerTracker){
                if(item.minGames==lowMinGames&&line.starts<lowMinGames){continue}
                if(item.minGames==minGames1&&line.record[0]+line.record[1]+line.record[2]<minGames1){continue}
                for(const year of line['years']){
                        let onlyValue, value
                        onlyValue = line['teamInYear'][year].length
                        value = {'value':onlyValue,'name':line['name'],'teams':line['teamInYear'][year],'year':year}
                        onlyVals.push(onlyValue)
                        vals.push(value)
                    }
                }
            }
            else if(item.calcType=='special1'){//someday i will win
                for(const line of playerTracker){
                    if(item.minGames==lowMinGames&&line.starts<lowMinGames){continue}
                    if(item.minGames==minGames1&&line.record[0]+line.record[1]+line.record[2]<minGames1){continue}
                    if(line.record[0]>0){continue}
                    let onlyValue, value
                    if(item.id=='pa31'){ //someday I win
                        onlyValue=line.starts
                    }else{onlyValue=line.starts+line.benches}
                    value = {'value':onlyValue,'name':line['name']}
                    onlyVals.push(onlyValue)
                        vals.push(value)
                }
            }
            else{//other items
                for(const line of playerTracker){
                    if(item.minGames==lowMinGames&&line.starts<lowMinGames){continue}
                    if(item.minGames==minGames1&&line.record[0]+line.record[1]+line.record[2]<minGames1){continue}
                    let onlyValue, value
                    const pos = line['pos']
                    const posID = item.pos
                    const valID = item.calcType
                    const minID = item.MinMax
                    const key = item.keyID
                    if(posID=='noDST'&&pos=='D/ST'){continue}
                    else if(poses.includes(posID)&&pos!=posID){continue}
                    if(valID=='rate'){//need winrate,not wins
                        onlyValue = (line[key][0]+line[key][2]/2)/Math.max(1,line[key][0]+line[key][1]+line[key][2])
                        value = {'value':onlyValue,'name':line['name']}
                        for(const metaType of meta){value[metaType]=line[metaType]}
                    }
                    else if(key=='teams'){
                        onlyValue = line[key].length
                        value = {'value':onlyValue,'name':line['name']}
                        for(const metaType of meta){value[metaType]=line[metaType]}
                    }
                    else if(['W','L','T'].includes(item.calcType)){
                        const index = ['W','L','T'].indexOf(item.calcType)
                        onlyValue = line[key][index]
                        value = {'value':onlyValue,'name':line.name}
                        for(const metaType of meta){value[metaType]=line[metaType]}
                    }
                    else if(item.calcType==='years'){ //score in a year
                        for(const year in line[item.keyID]){
                            onlyValue = line[item.keyID][year]
                            value = {'value':onlyValue,'name':line['name'],'year':year,'pos':pos}
                            vals.push(value)
                            onlyVals.push(onlyValue)
                            valsEach[pos].push({...value})
                            onlyValsEach[pos].push(onlyValue)
                        }
                    }
                    else{//just compare values, no calculations
                        onlyValue = line[key]
                        value = {'value':onlyValue,'name':line['name']}
                        for(const metaType of meta){value[metaType]=line[metaType]}
                    }
                    if(isNaN(onlyValue)){console.log({1:value,2:line,3:item})}
                    if(item.calcType=='perStart'){
                        onlyValue=onlyValue/Math.max(1,line.starts)
                        value.value = onlyValue
                    }
                    
                    if(item.calcType!=='years'){
                        vals.push(value)
                        onlyVals.push(onlyValue)
                        valsEach[pos].push({...value})
                        onlyValsEach[pos].push(onlyValue)
                    }
                }
    
                // console.log({1:meta,2:item})
            }
            awards.push({'title':item.title,'desc':item.description,'values':SortNRank(onlyVals,vals,item.MinMax),'meta':item.meta,'id':item.id})
            if(item.pos=='Each'){
                for(const pos of poses){
                    awards.push({'title':item.title+' ('+pos+')','desc':item.description+' ('+pos+')','values':SortNRank(onlyValsEach[pos],valsEach[pos],item.MinMax),'meta':item.meta,'id':item.id+pos})
                }
            }

    }//for list4

    // flexcounts
    let flexCounts = {'RB':0,'WR':0,'TE':0}
    let flexRecords = {'RB':[0,0,0],'WR':[0,0,0],'TE':[0,0,0]}

    for (const year in rawProjIn){
        if(year>yearMax){continue}
        const lastWeek = parseInt(raw[year][raw[year].length-1]['Week'])
        const types = tables.types[year]
        const outcomes = tables.outcomes[year]
        const scores = tables.scores[year]
        const opponent = tables.oppos[year]
        const oppoScores = tables.oppoScores[year]
        const yearNames = ChooseNames(vars,year)
        for(const line of rawProjIn[year]){
            const {week,NFLName,actual,projected,team,pos,nflTeam,slot} = UnpackProjLine(line,yearNames)
            if(slot!='FLEX'){continue}
            if(week>lastWeek){continue}
            const outcome = outcomes[team][week]
            if(outcome=='BYE'){continue}
            const type = types[team][week]
            if(type=='BYE'||type=='lame'){continue}
            for(const posType of ['RB','WR','TE']){
                if(pos!=posType){continue}
                flexCounts[posType] += 1
                const outcomeTypes = ['W','L','T']
                for(let i=0;i<3;i++){
                    const outcomeType = outcomeTypes[i]
                    if(outcome==outcomeType){flexRecords[posType][i] += 1}
                }
            }
        } 
    }
    awards.push({'title':'Flex comparison','counts':{'RB':flexCounts['RB'],'WR':flexCounts['WR'],'TE':flexCounts['TE'],'id':'fc'},
    'rates':{'RB':(flexCounts['RB'][0]+flexCounts['RB'][2]/2)/Math.max(1,flexCounts['RB'][0]+flexCounts['RB'][1]+flexCounts['RB'][2]),
        'WR':(flexCounts['WR'][0]+flexCounts['WR'][2]/2)/Math.max(1,flexCounts['WR'][0]+flexCounts['WR'][1]+flexCounts['WR'][2]),
        'TE':(flexCounts['TE'][0]+flexCounts['TE'][2]/2)/Math.max(1,flexCounts['TE'][0]+flexCounts['TE'][1]+flexCounts['TE'][2]),
    },'meta':[]
    })

    //ownedTable
    let ownedTable = {}
    for(const name of names){
        ownedTable[name] = {}
        const owned = teamTracker[name].length
        let started = 0
        for(const line of teamTracker[name]){
            if(line['weeks started'] > 0){
                started += 1
            }
        }
        ownedTable[name]['owned'] = owned
        ownedTable[name]['started'] = started
    }
    let ownedInYears = {}
    for(const name of names){
        ownedInYears[name] = {'owned':{},'started':{}}
    }
    for(const year in rawProjIn){
        if(year>yearMax){continue}
        let alreadyCounted = {}
        let alreadyCountedStart = {}
        const lastWeek = parseInt(raw[year][raw[year].length-1]['Week'])
        const types = tables.types[year]
        const outcomes = tables.outcomes[year]
        const scores = tables.scores[year]
        const opponent = tables.oppos[year]
        const oppoScores = tables.oppoScores[year]
        const yearNames = ChooseNames(vars,year)
        for(const name of names){
            ownedInYears[name]['owned'][year] = 0
            ownedInYears[name]['started'][year] = 0
            alreadyCounted[name] = []
            alreadyCountedStart[name] = []
        }
        for(const line of rawProjIn[year]){
            const {week,NFLName,actual,projected,team,pos,nflTeam,slot} = UnpackProjLine(line,yearNames)
            // if(slot!='FLEX'){continue}
            if(week>lastWeek){continue}
            const outcome = outcomes[team][week]
            // if(outcome=='BYE'){continue}
            const type = types[team][week]
            // if(type=='BYE'||type=='lame'){continue}
            if(type=='lame'){continue}
            if(!alreadyCounted[team].includes(NFLName)){
                alreadyCounted[team].push(NFLName)
                ownedInYears[team]['owned'][year] += 1
            }
            if(!alreadyCountedStart[team].includes(NFLName)&&slot!='Bench'&&slot!='IR'&&type!='lame'&&type!='BYE'){
                alreadyCountedStart[team].push(NFLName)
                ownedInYears[team]['started'][year] += 1
            }
        }
    }

    const ownedList = [
        {"id": "pa41", "title": "Gotta Catch 'Em All!", "description": "The person who has owned the most unique players", "tableID": "ownedTable", "keyID": "owned", "MinMax": "max", "personFilter": null},
        {"id": "pa42", "title": "Tinkerer", "description": "The person who has started the most unique players", "tableID": "ownedTable", "keyID": "started", "MinMax": "max", "personFilter": null},
        {"id": "pa43", "title": "What's a Drop/Add?", "description": "The person who has owned the fewest unique players", "tableID": "ownedTable", "keyID": "owned", "MinMax": "min", "personFilter": null},
        {"id": "pa44", "title": "Never Tinkerer", "description": "The person who has started the fewest unique players", "tableID": "ownedTable", "keyID": "started", "MinMax": "min", "personFilter": null},
        {"id": "pa45", "title": "Diversity Today", "description": "The most players a person has owned in one year", "tableID": "ownedInYears", "keyID": "owned", "MinMax": "max", "personFilter": null},
        {"id": "pa46", "title": "A Stable Life", "description": "The fewest players a person has owned in one year", "tableID": "ownedInYears", "keyID": "owned", "MinMax": "min", "personFilter": null,'requires':'season'},
        {"id": "pa47", "title": "Who's On My Team Again?", "description": "The most players a person has started in one year", "tableID": "ownedInYears", "keyID": "started", "MinMax": "max", "personFilter": null},
        {"id": "pa48", "title": "Same Old Same Old", "description": "The fewest players a person has started in one year", "tableID": "ownedInYears", "keyID": "started", "MinMax": "min", "personFilter": null,'requires':'season'},
        {"id": "pa49", "title": "Never Injured", "description": "The person with the lowest maximum unique people started in a year", "tableID": "ownedInYears", "keyID": "started", "MinMax": "min", "personFilter": "maxOnly"},
        {"id": "pa50", "title": "Streamer", "description": "The person who has the highest minimum unique people started in a year", "tableID": "ownedInYears", "keyID": "started", "MinMax": "max", "personFilter": "minOnly",'requires':'season'},
        {"id": "pa51", "title": "I Haven't Learned to do Drop/Adds", "description": "The person who has the lowest maximum unique players owned in a year", "tableID": "ownedInYears", "keyID": "owned", "MinMax": "min", "personFilter": "maxOnly"},
        {"id": "pa52", "title": "Frantic Tinkerer", "description": "The person who has the highest minimum unique players owned in a year", "tableID": "ownedInYears", "keyID": "owned", "MinMax": "max", "personFilter": "minOnly",'requires':'season'}
      ]


    for(const item of ownedList){
        let vals = []
        let onlyVals = []
        for(const name of names){
            if(vars.lameDucks.includes(name)){continue}
            if(item.tableID=='ownedTable'){
                const value=ownedTable[name][item.keyID]
                onlyVals.push(value)
                vals.push({'value':value,'name':name})
            }else{
            if(item.personFilter=='maxOnly'||item.personFilter=='minOnly'){//only names?
                let value
                if(item.personFilter=='maxOnly'){
                    if(!input.isComplete.year&&item.requires=='season'){
                        const filtered = Object.fromEntries(Object.entries(ownedInYears[name][item.keyID]).filter(([key])=>key!=input.isComplete.lastYear))
                        const maxValue = DictMax(filtered)
                        const meta = DictKeysWithValue(filtered,maxValue)
                        onlyVals.push(maxValue)
                        vals.push({'value':maxValue,'year':meta,'name':name})
                    }else{
                        const maxValue = DictMax(ownedInYears[name][item.keyID])
                        const meta = DictKeysWithValue(ownedInYears[name][item.keyID],maxValue)
                        onlyVals.push(maxValue)
                        vals.push({'value':maxValue,'year':meta,'name':name})
                    }
                }else{//minOnly
                    if(!input.isComplete.year&&item.requires=='season'){
                    let filtered = Object.fromEntries(Object.entries(ownedInYears[name][item.keyID]).filter(([key])=>key!=input.isComplete.lastYear))
                    filtered = Object.fromEntries(  //removing skipped years
                        Object.entries(filtered).filter(([key, value]) => value > 0)
                        );
                    const minValue = DictMin(filtered)
                    const meta = DictKeysWithValue(filtered,minValue)
                    onlyVals.push(minValue)
                    vals.push({'value':minValue,'year':meta,'name':name})
                    }else{
                    const minValue = DictMin(ownedInYears[name][item.keyID])
                    const meta = DictKeysWithValue(ownedInYears[name][item.keyID],minValue)
                    onlyVals.push(minValue)
                    vals.push({'value':minValue,'year':meta,'name':name})
                    }
                }
            }else{
                for(const year in ownedInYears[name]['owned']){
                    if(ownedInYears[name]['owned'][year]<=0){continue}
                    if(!input.isComplete.year&&item.requires=='season'&&year==input.isComplete.lastYear){continue}
                    let value
                    value=ownedInYears[name][item.keyID][year]
                    onlyVals.push(value)
                    vals.push({'value':value,'year':year,'name':name})
                }
            }
            }
        }
        let meta
        if(item.tableID=='ownedTable'){meta=['name']}else{meta=['name','year']}
        awards.push({'title':item.title,'desc':item.description,'values':SortNRank(onlyVals,vals,item.MinMax),'meta':meta,'id':item.id})
    }
    
// console.log({1:playerTracker,2:teamTracker,3:ownedTable,4:ownedInYears})
return {'awards':awards,'fantasyTeams':fantasyTeams,'bestPlayers':bestPlayers,'playerTracker':playerTracker}  
}