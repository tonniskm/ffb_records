import { ChooseNames } from "../other"


export function getGameAwards(vars,raw){
    let gameAwards = []
    

    const list = [
        ['Shootout','The highest total score in a game','total'],
        ['Defensive Struggle','The lowest total score in a game','total','min'],
        ['Beatdown','The biggest score difference','dif'],
        ['Big Game Hunter','The highest score ever defeated','sLose'],
        ["A Win's A Win",'The lowest winning score','sWin','min'],
        // ['King of the Rock','The highest score ever','smax'], 
        // ['Noodle Armed','The lowest score ever','smin','min']
    ]
        //individual game awards
    const list2 = [
        ['King of the Rock','The highest score ever','smax'], 
        ['Noodle Armed','The lowest score ever','smin','min']
    ]
    let vals = {}
    let onlyVals = {}
    for(let year in raw){ 
        const names = ChooseNames(vars,year)
        for(let game of raw[year]){
            let week = parseInt(game['Week'])
            let t1 = names[parseInt(game['Team1'])]
            let score1 = Math.round(parseFloat(game['Score1'])*100)/100
            let t2 = game.Team2
            let score2 = Math.round(parseFloat(game['Score2'])*100)/100
            let winner = game.winner
            let type = game.type
            if(type!='lame'&&t2!='BYE'){
                t2 = names[parseInt(game['Team2'])]
                winner = names[parseInt(winner)]
            }else{continue}
            const total = score1 + score2
            const dif = Math.max(score1-score2,score2-score1)
            let sWin,sLose
            if(winner!='TIE'&&winner!='BYE'){
                if(winner==t1){
                    sWin = score1
                    sLose = score2
                }
                else{
                    sWin = score2
                    sLose = score1
                }
            }else{sWin = 999;sLose=0}
            for(const item of list){
                if (vals[item[0]]==undefined){
                    vals[item[0]] = []
                    onlyVals[item[0]] = []
                }
                let value
                if(item[2]=='total'){value=total}
                if(item[2]=='dif'){value=dif}
                if(item[2]=='sLose'){value=sLose}
                if(item[2]=='sWin'){value=sWin}
                // if(item[2]=='smax'){value=Math.max(score1,score2)}
                // if(item[2]=='smin'){value=Math.min(score1,score2)}
                // console.log({1:item,2:value,3:total,4:dif,5:sWin,6:sLose,7:score1,8:score2})
                onlyVals[item[0]].push(value)
                vals[item[0]].push({'week':week,'year':year,'t1':t1,'t2':t2,'s1':score1,'s2':score2,'value':value})
            }//for award
            for(const item of list2){
                if (vals[item[0]]==undefined){
                    vals[item[0]] = []
                    onlyVals[item[0]] = []
                }
                let value
                let owner
                if(item[2]=='smax'){value=Math.max(score1,score2);owner=winner}
                if(item[2]=='smin'){value=Math.min(score1,score2);if(t1==winner){owner=t2}else{owner=t1}}
                onlyVals[item[0]].push(value)
                vals[item[0]].push({'week':week,'year':year,'name':owner,'value':value})
            }
        }//for game
    }//for year
    for(const item of list.concat(list2)){
        let sorted = [...onlyVals[item[0]]].sort((a,b)=>a-b)
        if(item[3]!='min'){sorted = sorted.reverse()}
        for(const line of vals[item[0]]){
            line['rank'] = sorted.indexOf(line.value) + 1

    }
    let meta
    const wrongMeta = ['King of the Rock','Noodle Armed']
    if(wrongMeta.includes(item[0])){meta=['name','year','week']}
    else{meta=['year','week','t1','t2','s1','s2']}
    gameAwards.push({'title':item[0],'desc':item[1],'values':vals[item[0]],'meta':meta})
    }//award


return gameAwards     
    
}