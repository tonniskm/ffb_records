import { Round, SortNRank } from "../other"


export function GetTeamAwards(vars,tables,records){
const myTeams = tables.myTeam
let stats = {}
const poses = {'QB':1,'RB':2,'WR':2,'TE':1,'D/ST':1,'K':1}
const flexable ={}
for(const pos of ['WR','RB','TE']){flexable[pos]=poses[pos]+1}

const list = ['slave times','no slave times','gp','no slave total','wins gained if slave',
    'pts gained if slave','nirvana times','wins gained if nirvana','pts gained if nirvana',
    'wins gained if bestball',
]
const gameList = ['left on bench in a game']
const gameStats = {}
const statsInAYear = {}
for(const item of list){stats[item]={};statsInAYear[item] = {}}
for(const item of gameList){gameStats[item]=[]}
function FilterStarters(team){
    return team.filter(x=>x.slot!='Bench'&&x.slot!='IR')
}

function GetBestStarters(team,value,outType){
    let bestTeam = []
    for(const pos in poses){
        const filtered = team.filter(x=>x.pos===pos).sort((a,b)=>b[value]-a[value])
        bestTeam = bestTeam.concat(filtered.slice(0,poses[pos]))
    }

    let flexEligible = []
    for(const pos in flexable){
        const sorted = team.filter(x=>x.pos===pos).sort((a,b)=>b[value]-a[value])
        if(sorted.length>=flexable[pos]){
            flexEligible.push(sorted[flexable[pos]-1])}
    }
    if(flexEligible.length>0){
        bestTeam.push(flexEligible.sort((a,b)=>b[value]-a[value])[0])
    }
    for(const item of bestTeam){
        if(item==undefined){console.log({bestTeam,item,team,flexEligible})}
    }
    if(bestTeam.reduce((a,b)=>a+b[value],0)==undefined){console.log({1:'here',bestTeam,team,flexEligible})}
    return bestTeam.reduce((a,b)=>a+b[outType],0)
}

for(const year in myTeams){
    for (const key in statsInAYear){statsInAYear[key][year]={}}
    for(const name in myTeams[year]){
        for(const key in stats){if(!(name in stats[key])){stats[key][name] = 0}}
        for(const key in stats){if(!(name in statsInAYear[key][year])){statsInAYear[key][year][name] = 0}}
        for(const week in myTeams[year][name]){
            const type = tables.types[year][name][week]
            if(type==='BYE'||type==='lame'){continue}
            const oppo = tables.oppos[year][name][week]
            const wholeTeam = myTeams[year][name][week]
            const bestScore = Round(GetBestStarters(wholeTeam,'actual','actual'))
            const bestProj = Round(GetBestStarters(wholeTeam,'projected','projected'))
            const bestProjActual = Round(GetBestStarters(wholeTeam,'projected','actual'))
            const realScore = Round(tables.scores[year][name][week])
            const realProj = Round(GetBestStarters(FilterStarters(wholeTeam),'actual','projected'))
            const oppoScore = tables.oppoScores[year][name][week]
            const oppoWholeTeam = myTeams[year][oppo][week]
            const oppoBestScore = Round(GetBestStarters(oppoWholeTeam,'actual','actual'))
            const oppoBestProj = Round(GetBestStarters(oppoWholeTeam,'projected','projected'))
            const oppoBestProjActual = Round(GetBestStarters(oppoWholeTeam,'projected','actual'))

            const outcome = tables.outcomes[year][name][week]
            const slaveOutcome = bestProjActual>oppoScore?'W':(bestProjActual==oppoScore?'T':'L')
            const nirvOutcome = bestScore>oppoScore?'W':(bestScore==oppoScore?'T':'L')
            const bestballOutcome = bestScore>oppoBestScore?'W':(bestScore==oppoBestScore?'T':'L')
            let slaveGains=0; let nirvGains=0; let bestballGains=0;
            if(outcome==='W'){
                if(slaveOutcome==='T'){slaveGains= -.5}
                if(slaveOutcome==='L'){slaveGains= -1}
                if(nirvOutcome==='T'){nirvGains= -.5}
                if(nirvOutcome==='L'){nirvGains= -1}
                if(bestballOutcome==='L'){bestballGains= -1}
                if(bestballOutcome==='T'){bestballGains= -.5}
            }else if(outcome==='T'){
                if(slaveOutcome==='W'){slaveGains= .5}
                if(slaveOutcome==='L'){slaveGains= -.5}
                if(nirvOutcome==='W'){nirvGains= .5}
                if(nirvOutcome==='L'){nirvGains= -.5}
                if(bestballOutcome==='W'){bestballGains= .5}
                if(bestballOutcome==='L'){bestballGains= -.5}
            }else if(outcome==='L'){
                if(slaveOutcome==='W'){slaveGains= 1}
                if(slaveOutcome==='T'){slaveGains= .5}
                if(nirvOutcome==='W'){nirvGains= 1}
                if(nirvOutcome==='T'){nirvGains= .5}
                if(bestballOutcome==='W'){bestballGains= 1}
                if(bestballOutcome==='T'){bestballGains= .5}
            }

            stats['gp'][name] += 1
            statsInAYear['gp'][year][name] += 1
            stats['wins gained if nirvana'][name] += nirvGains
            stats['wins gained if slave'][name] += slaveGains
            stats['wins gained if bestball'][name] += bestballGains
            statsInAYear['wins gained if nirvana'][year][name] += nirvGains
            statsInAYear['wins gained if slave'][year][name] += slaveGains
            statsInAYear['wins gained if bestball'][year][name] += bestballGains
            if(realProj===bestProj){  // is slave
                stats['slave times'][name] += 1
                statsInAYear['slave times'][year][name] += 1
            }else{ // is not slave
                stats['no slave times'][name] += 1
                statsInAYear['no slave times'][year][name] += 1
                stats['no slave total'][name] += bestProj - realScore
                statsInAYear['no slave total'][year][name] += bestProj - realScore
                stats['pts gained if slave'][name] += bestProjActual - realScore
                statsInAYear['pts gained if slave'][year][name] += bestProjActual - realScore
            }
            if(bestScore===realScore){
                stats['nirvana times'][name] += 1
                statsInAYear['nirvana times'][year][name] += 1
            }else{
                stats['pts gained if nirvana'][name] += bestScore - realScore
                statsInAYear['pts gained if nirvana'][year][name] += bestScore - realScore
            }
            for(const item of gameList){  
            gameStats[item].push({'team':name,'year':year,'week':week,
                'value':Round(bestScore - realScore),'name':name
            })
            }





        }
    } 
}
//awards
const list1 = [
    {'id':'team1','title':'Projections Slave','desc':'the person who starts their best projection the most often','keyID':'slave times','rate':'gp','yearRate':false,'MinMax':'max','meta':['name']},
    {'id':'team1.1','title':'Freethinker','desc':'the person who starts their best projection the least often','keyID':'slave times','rate':'gp','yearRate':false,'MinMax':'min','meta':['name']},
    {'id':'team2','title':'Should Be a Slave','desc':'the person would win the most more often if they just started the best projection','keyID':'wins gained if slave','rate':'gp','yearRate':false,'MinMax':'max','meta':['name']},
    {'id':'team2.1','title':"Don't Become A Slave",'desc':'the person would win the least more often if they just started the best projection','keyID':'wins gained if slave','rate':'gp','yearRate':false,'MinMax':'min','meta':['name']},
    {'id':'team3','title':'Should Be a Slave1','desc':'the person would gain the most points/game if they just started the best projection','keyID':'pts gained if slave','rate':'gp','yearRate':true,'MinMax':'max','meta':['name']},
    {'id':'team3.1','title':"Don't Become A Slave1",'desc':'the person would gain the fewest points/game if they just started the best projection','keyID':'pts gained if slave','rate':'gp','yearRate':true,'MinMax':'min','meta':['name']},
    {'id':'team4','title':'Fantasy Nirvana Enjoyer','desc':'The person most likely to start their best lineup (not accounting for free agents)','keyID':'nirvana times','rate':'gp','yearRate':false,'MinMax':'max','meta':['name']},
    {'id':'team4.1','title':"Never Nirvana",'desc':'The person least likely to start their best lineup (not accounting for free agents)','keyID':'nirvana times','rate':'gp','yearRate':false,'MinMax':'min','meta':['name']},
    {'id':'team5','title':'Get Gud','desc':'The person who would win the most more often if they just set better lineups','keyID':'wins gained if nirvana','rate':'gp','yearRate':false,'MinMax':'max','meta':['name']},
    {'id':'team5.1','title':"Good Lineup Setter",'desc':'The person who would win the least more often if they just set better lineups','keyID':'wins gained if nirvana','rate':'gp','yearRate':false,'MinMax':'min','meta':['name']},
    {'id':'team6','title':'Get Gud1','desc':'The person who would gain the most points/game if they just set better lineups','keyID':'pts gained if nirvana','rate':'gp','yearRate':true,'MinMax':'max','meta':['name']},
    {'id':'team6.1','title':"Good Lineup Setter1",'desc':'The person who would gain the fewest more points/game if they just set better lineups','keyID':'pts gained if nirvana','rate':'gp','yearRate':true,'MinMax':'min','meta':['name']},
    {'id':'team7','title':'Best Ball Master','desc':'The person who would gain the most if we played best ball wins/game played','keyID':'wins gained if bestball','rate':'gp','yearRate':false,'MinMax':'max','meta':['name']},
    {'id':'team7.1','title':"Best Ball is for Chumps",'desc':'The person who would lose the most if we played best ball wins/game played','keyID':'wins gained if bestball','rate':'gp','yearRate':false,'MinMax':'min','meta':['name']},

]
// console.log(stats)
for(const item of list1){
    const df = stats[item.keyID]
    let vals = []
    let onlyVals = []
    let valsInAYear = []
    let onlyValsInAYear = []
    for(const name in df){
        if(vars.lameDucks.includes(name)){continue}
        let value = df[name]
        if(item.rate!=false){value=value/Math.max(1,stats[item.rate][name])}
        onlyVals.push(value)
        vals.push({value,'name':name})
        for(const year in statsInAYear[item.keyID]){
            let valueInAYear = statsInAYear[item.keyID][year][name]
            if(isNaN(valueInAYear)){continue}
            if(item.yearRate!=false){valueInAYear=valueInAYear/Math.max(1,statsInAYear[item.rate][year][name])}
            onlyValsInAYear.push(valueInAYear)
            valsInAYear.push({value:valueInAYear,'name':name,'year':year})
        }
    }
    records.teamAwards.push({'id':item.id,'title':item.title,'desc':item.desc,'values':SortNRank(onlyVals,vals,item.MinMax),'meta':item.meta})
    records.teamAwards.push({'id':item.id+'inYear','title':item.title+' (in A Year)','desc':item.desc,'values':SortNRank(onlyValsInAYear,valsInAYear,item.MinMax),'meta':item.meta.concat(['year'])})
}
for (const item of gameList){
    records.teamAwards.push({
        'id':'TAG1','title':'Left On Bench In A Game','desc':'The most points left on the bench in a single game','values':SortNRank(gameStats[item].map(x=>x['value']),gameStats[item],'max'),'meta':['name','year','week']
    })
}
}