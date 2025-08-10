

export function getFiddleAwards(vars,tables,input){
    let out = {}
    const awards = []
    function compareResults(myScore,oppoScore,outcome){
        if(outcome==='W'){
            if(myScore>oppoScore){return 0}
            if(myScore===oppoScore){return -0.5}
            if(myScore<oppoScore){return -1}
        }
        if(outcome==='L'){
            if(myScore>oppoScore){return 1}
            if(myScore===oppoScore){return 0.5}
            if(myScore<oppoScore){return 0}
        }
        if(outcome==='T'){
            if(myScore>oppoScore){return 0.5}
            if(myScore===oppoScore){return 0}
            if(myScore<oppoScore){return -0.5}
        }
        return 0
    }
    function decimalScoring(team){
        const adj = team.map(x=>Math.floor(x.actual))
        return adj
    }
    function noK(team){
        return team.filter(x=>x.slot!=='K').map(x=>x.actual)
    }
    function noD(team){
        return team.filter(x=>x.slot!=='D/ST').map(x=>x.actual)
    }
    function noST(team){
        return team.filter(x=>x.slot!=='K'&&x.slot!=='D/ST').map(x=>x.actual)
    }
    
    const fiddleList = [
        {'id':'decimal','func':decimalScoring},
        {'id':'noK','func':noK},
        {'id':'noD/ST','func':noD},
        {'id':'noST','func':noST}
    ]
for(const year in tables.types){
    if(!(year in tables.myTeam)){continue}
    for(const name in tables.types[year]){
        for (const week in tables.types[year][name]){
            const type = tables.types[year][name][week]
            if(['lame','BYE','bye','B'].includes(type)){continue}
            const myTeam = tables.myTeam[year][name][week]
            const myStarters = myTeam.filter(x=>!['Bench','IR'].includes(x.slot))
            const outcome = tables.outcomes[year][name][week]
            const oppo = tables.oppos[year][name][week]
            const oppoTeam = tables.myTeam[year][oppo][week]
            const oppoStarters = oppoTeam.filter(x=>!['Bench','IR'].includes(x.slot))

            for(const item of fiddleList){
                const myNew =  item.func(myStarters).reduce((total, obj) => total + obj, 0);
                const oppoNew = item.func(oppoStarters).reduce((total, obj) => total + obj, 0);
                const change = compareResults(myNew,oppoNew,outcome)
                if(!(item.id in out)){out[item.id]={}}
                if(!(name in out[item.id])){out[item.id][name]=0}
                out[item.id][name] += change
            }

        }
    }
}

const list = [
    {'id': 'fid1', 'title': 'Gerrymanderer', 'description': 'The player who would lose the most by reverting decimal scoring (wins change)', 'keyID': 'decimal', 'MinMax': 'min', 'meta': ['name'], 'agg': null},
    {'id': 'fid2', 'title': 'The Exploited Middle Class', 'description': 'The player who would gain the most by reverting decimal scoring (wins change)', 'keyID': 'decimal', 'MinMax': 'max', 'meta': ['name'], 'agg': null},
    {'id': 'fid3', 'title': 'Soccer Star', 'description': 'The player who would lose the most by losing kickers (wins change)', 'keyID': 'noK', 'MinMax': 'min', 'meta': ['name'], 'agg': null},
    {'id': 'fid4', 'title': 'No K Please', 'description': 'The player who would gain the most by losing kickers (wins change)', 'keyID': 'noK', 'MinMax': 'max', 'meta': ['name'], 'agg': null},
    {'id': 'fid5', 'title': 'Defense Wins Championships', 'description': 'The player who would lose the most by losing D/ST (wins change)', 'keyID': 'noD/ST', 'MinMax': 'min', 'meta': ['name'], 'agg': null},
    {'id': 'fid6', 'title': 'No D/ST Please', 'description': 'The player who would gain the most by losing D/ST (wins change)', 'keyID': 'noD/ST', 'MinMax': 'max', 'meta': ['name'], 'agg': null},   
    {'id': 'fid7', 'title': 'Special Teams Specialist', 'description': 'The player who would lose the most by losing kickers and D/ST (wins change)', 'keyID': 'noST', 'MinMax': 'min', 'meta': ['name'], 'agg': null},
    {'id': 'fid8', 'title': 'No Special Teams Please', 'description': 'The player who would gain the most by losing kickers and D/ST (wins change)', 'keyID': 'noST', 'MinMax': 'max', 'meta': ['name'], 'agg': null}, 
]

for (const item of list){
    let vals = []
    let onlyVals = []
    for(const name in out[item.keyID]){
        const val = out[item.keyID][name]
        onlyVals.push(val)
        vals.push({'value':val,'name':name})
    }

    let sorted = [...onlyVals].sort((a,b)=>a-b)
        if(item.MinMax!='min'){sorted = sorted.reverse()}
        for(const line of vals){
            line['rank'] = sorted.indexOf(line.value) + 1
        }
        // let meta = ['name','year','week']
        // if(noMetaList.includes(item[0])){meta=['name']}
        awards.push({'title':item.title,'desc':item.description,'values':vals,'meta':item.meta,'id':item.id})
}
return awards
}