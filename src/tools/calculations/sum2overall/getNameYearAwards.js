//outputs name and year


export function getNameYearAwards(vars,input){
    //looks at each year
    const stats = input.year
    let awards = []
    const list2 = [
        {'id': 'nya1', 'title': 'Peak Performer', 'description': 'The best ever regular season record', 'keyID': 'pct', 'MinMax': null, 'agg': 'total','req':'reg'},
        {'id': 'nya2', 'title': 'Please Forget', 'description': 'The worst ever regular season record', 'keyID': 'pct', 'MinMax': 'min', 'agg': 'total','req':'reg'},
        {'id': 'nya3', 'title': 'Season High', 'description': 'The highest ever reg season point total', 'keyID': 'reg total', 'MinMax': null, 'agg': 'total'},
        {'id': 'nya4', 'title': 'Season Low', 'description': 'The lowest ever reg season point total', 'keyID': 'reg total', 'MinMax': 'min', 'agg': 'total','req':'reg'},
        {'id': 'nya5', 'title': 'Season High Defense', 'description': 'The highest ever reg season point total allowed', 'keyID': 'oppo reg total', 'MinMax': null, 'agg': 'total'},
        {'id': 'nya6', 'title': 'Season Low Defense', 'description': 'The Lowest ever reg season point total allowed', 'keyID': 'oppo reg total', 'MinMax': 'min', 'agg': 'total','req':'reg'},
        {'id': 'nya7', 'title': 'True Season High', 'description': 'The highest ever reg season points/game', 'keyID': 'reg total', 'MinMax': null, 'agg': 'game','req':'reg'},
        {'id': 'nya8', 'title': 'True Season Low', 'description': 'The lowest ever reg season point/game', 'keyID': 'reg total', 'MinMax': 'min', 'agg': 'game','req':'reg'},
        {'id': 'nya9', 'title': 'True Season High Defense', 'description': 'The highest ever reg season points allowed/game', 'keyID': 'oppo reg total', 'MinMax': null, 'agg': 'game','req':'reg'},
        {'id': 'nya10', 'title': 'True Season Low Defense', 'description': 'The Lowest ever reg season points allowed/game', 'keyID': 'oppo reg total', 'MinMax': 'min', 'agg': 'game','req':'reg'},
    ]
    
    
    // const calcList = ['True Season High','True Season Low','True Season High Defense','True Season Low Defense']
    for(const item of list2){
        let vals = []
        let onlyVals = []
        for(const year in stats){
            if(!input.isComplete.reg&&item.req=='reg'&&year==input.isComplete.lastYear){continue}
            for(const name of vars.allNames){
                const ind = name
                if(vars.lameDucks.includes(name)){continue}
                if(stats[year]['reg games played'][name]<=0||stats[year]['reg games played'][name]==undefined){continue}
                let value
                if(item.agg=='game'){//per game 
                    value = stats[year][item.keyID][name]/stats[year]['reg games played'][name]
                }else{value = stats[year][item.keyID][name]}
                if(value=='null'||value=='NA'||value==undefined){continue}
                vals.push({'name':name,'year':year,'value':value})
                onlyVals.push(value)
            }
        }
    let sorted = [...onlyVals].sort((a,b)=>a-b)
    if(item.MinMax!='min'){sorted = sorted.reverse()}
    for(const line of vals){
        line['rank'] = sorted.indexOf(line.value) + 1
    }
    awards.push({'title':item.title,'desc':item.description,'values':vals,'meta':['name','year'],'id':item.id})
    }
    return awards
}