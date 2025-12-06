import { getNames } from "../getNames"



export function getGameAwards(vars,raw){
    let gameAwards = []
    

    const list = [
        {'id': 'ga1', 'title': 'Shootout', 'description': 'The highest total score in a game', 'keyID': 'total', 'minMax': null, 'meta': ['year', 'week', 't1', 't2', 's1', 's2']},
        {'id': 'ga2', 'title': 'Defensive Struggle', 'description': 'The lowest total score in a game', 'keyID': 'total', 'minMax': 'min', 'meta': ['year', 'week', 't1', 't2', 's1', 's2']},
        {'id': 'ga3', 'title': 'Beatdown', 'description': 'The biggest blowout', 'keyID': 'dif', 'minMax': null,'agg':'winner', 'meta': ['name','year', 'week', 't1', 't2', 's1', 's2']},
        {'id': 'ga3.1', 'title': 'Beatdown2', 'description': 'The biggest blowout loss', 'keyID': 'dif', 'minMax': null,'agg':'loser', 'meta': ['name','year', 'week', 't1', 't2', 's1', 's2']},
        {'id': 'ga4', 'title': 'Big Game Hunter', 'description': 'The highest score ever defeated', 'keyID': 'sLose', 'minMax': null, 'agg':'winner', 'meta': ['name','year', 'week', 't1', 't2', 's1', 's2']},
        {'id': 'ga4.1', 'title': 'Big Game Hunter2', 'description': 'The highest score ever to be defeated', 'keyID': 'sLose', 'minMax': null, 'agg':'loser', 'meta': ['name','year', 'week', 't1', 't2', 's1', 's2']},
        {'id': 'ga5', 'title': "A Win's A Win", 'description': 'The lowest winning score', 'keyID': 'sWin', 'minMax': 'min', 'agg':'winner', 'meta': ['name','year', 'week', 't1', 't2', 's1', 's2']},
        {'id': 'ga5.1', 'title': "A Win's A Win2", 'description': 'The lowest score lost to', 'keyID': 'sWin', 'minMax': 'min', 'agg':'loser', 'meta': ['name','year', 'week', 't1', 't2', 's1', 's2']},

    ]
        //individual game awards
    const list2 = [
        {'id': 'ga6', 'title': 'King of the Rock', 'description': 'The highest score ever', 'keyID': 'smax', 'minMax': null, 'meta': ['name','year','week']},
        {'id': 'ga7', 'title': 'Noodle Armed', 'description': 'The lowest score ever', 'keyID': 'smin', 'minMax': 'min', 'meta': ['name','year','week']},
    ]
    let vals = {}
    let onlyVals = {}
    for(let year in raw){ 
        const names = getNames(vars.leagueID,year)
        for(let game of raw[year]){
            let week = parseInt(game['Week'])
            let t1 = names[parseInt(game['Team1'])]
            let score1 = Math.round(parseFloat(game['Score1'])*100)/100
            let t2 = game.Team2
            let score2 = Math.round(parseFloat(game['Score2'])*100)/100
            let winner = game.winner
            let type = game.type
            let loser
            if(type!='lame'&&t2!='BYE'){
                t2 = names[parseInt(game['Team2'])]
                winner = names[parseInt(winner)]
            }else{continue}
            const total = score1 + score2
            const dif = Math.max(score1-score2,score2-score1)
            // const dif = score1 - score2
            let sWin,sLose
            if(winner!='TIE'&&winner!='BYE'){
                if(winner==t1){
                    sWin = score1
                    sLose = score2
                    loser = t2
                }
                else{
                    sWin = score2
                    sLose = score1
                    loser = t1
                }
            }else{sWin = 999;sLose=0}
            for(const item of list){
                if (vals[item.id]==undefined){
                    vals[item.id] = []
                    onlyVals[item.id] = []
                }
                let value
                if(item.keyID=='total'){value=total}
                if(item.keyID=='dif'){value=dif}
                if(item.keyID=='sLose'){value=sLose}
                if(item.keyID=='sWin'){value=sWin}
                // if(item[2]=='smax'){value=Math.max(score1,score2)}
                // if(item[2]=='smin'){value=Math.min(score1,score2)}
                // console.log({1:item,2:value,3:total,4:dif,5:sWin,6:sLose,7:score1,8:score2})
                if(item.agg==='winner'){
                    if(winner==='TIE'||winner==='BYE'){continue}
                    onlyVals[item.id].push(value)
                    vals[item.id].push({'name':winner,'week':week,'year':year,'t1':t1,'t2':t2,'s1':score1,'s2':score2,'value':value})
                }
                else if (item.agg==='loser'){
                    if(winner==='TIE'||winner==='BYE'){continue}
                    onlyVals[item.id].push(value)
                    vals[item.id].push({'name':loser,'week':week,'year':year,'t1':t1,'t2':t2,'s1':score1,'s2':score2,'value':value})
                }
                else{
                    onlyVals[item.id].push(value)
                    vals[item.id].push({'week':week,'year':year,'t1':t1,'t2':t2,'s1':score1,'s2':score2,'value':value})
                }
            }//for award
            for(const item of list2){
                if (vals[item.id]==undefined){
                    vals[item.id] = []
                    onlyVals[item.id] = []
                }
                let value
                let owner
                // if(item.keyID=='smax'){value=Math.max(score1,score2);owner=winner}
                // if(item.keyID=='smin'){value=Math.min(score1,score2);if(t1==winner){owner=t2}else{owner=t1}}
                onlyVals[item.id].push(score1)
                onlyVals[item.id].push(score2)
                vals[item.id].push({'week':week,'year':year,'name':t1,'value':score1})
                vals[item.id].push({'week':week,'year':year,'name':t2,'value':score2})
            }
        }//for game
    }//for year
    for(const item of list.concat(list2)){
        let sorted = [...onlyVals[item.id]].sort((a,b)=>a-b)
        if(item.minMax!='min'){sorted = sorted.reverse()}
        for(const line of vals[item.id]){
            line['rank'] = sorted.indexOf(line.value) + 1

    }
    let meta
    // const wrongMeta = ['King of the Rock','Noodle Armed']
    // if(wrongMeta.includes(item[0])){meta=['name','year','week']}
    // else{meta=['year','week','t1','t2','s1','s2']}
    gameAwards.push({'title':item.title,'desc':item.description,'values':vals[item.id],'meta':item.meta,'id':item.id})
    }//award


return gameAwards     
    
}