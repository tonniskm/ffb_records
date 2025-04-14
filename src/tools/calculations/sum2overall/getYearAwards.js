

export function getYearAwards(vars,input){
    const misc = input['misc']
    let weekAwards = []
    const list = [
        {'id': 'ya1', 'title': 'Best Year', 'description': 'The highest scoring year ever', 'MinMax': null, 'keyID': null},
        {'id': 'ya2', 'title': 'Worst Year', 'description': 'The lowest scoring year ever', 'MinMax': 'min', 'keyID': null},
    ]
    

    for(const item of list){
        let vals = []
        let onlyVals = []
        for(const year in misc){
            // if(!input.isComplete.reg&&year==input.isComplete.lastYear){continue}
            const weekTots = misc[year]['weekTots']
            const leagueSize = misc[year]['leagueSize']
            const value = weekTots.reduce((a,b)=>a+b)/weekTots.length/leagueSize
            onlyVals.push(value)
            vals.push({'year':year,'value':value})
        }
        let sorted = [...onlyVals].sort((a,b)=>a-b)
        if(item.MinMax!='min'){sorted = sorted.reverse()}
        for(const line of vals){
            line['rank'] = sorted.indexOf(line.value) + 1
        }
        weekAwards.push({'title':item.title,'desc':item.description,'values':vals,'meta':['year'],'id':item.id})
    }
    return weekAwards

}