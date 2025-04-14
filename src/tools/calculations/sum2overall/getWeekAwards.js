

export function getWeekAwards(vars,input){
    const misc = input['misc']
    let weekAwards = []
    const list = [
        {'id': 'wa1', 'title': 'Best Week', 'description': 'The highest scoring week ever', 'MinMax': null, 'keyID': null},
        {'id': 'wa2', 'title': 'Worst Week', 'description': 'The lowest scoring week ever', 'MinMax': 'min', 'keyID': null},
    ]
    

    for(const item of list){
        let vals = []
        let onlyVals = []
        for(const year in misc){
            const weekTots = misc[year]['weekTots']
            const leagueSize = misc[year]['leagueSize']
            for(let [ind,val] of weekTots.entries()){
                const value = val/leagueSize
                onlyVals.push(value)
                vals.push({'week':ind+1,'year':year,'value':value})
            }
        }
        let sorted = [...onlyVals].sort((a,b)=>a-b)
        if(item.MinMax!='min'){sorted = sorted.reverse()}
        for(const line of vals){
            line['rank'] = sorted.indexOf(line.value) + 1
        }
        weekAwards.push({'title':item.title,'desc':item.description,'values':vals,'meta':['year','week'],'id':item.id})
    }
    return weekAwards

}