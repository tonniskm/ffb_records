

export function getYearAwards(vars,input){
    const misc = input['misc']
    let weekAwards = []
    const list = [['Best Year','The highest scoring year ever'],['Worst Year','The lowest scoring year ever','min']]

    for(const item of list){
        let vals = []
        let onlyVals = []
        for(const year in misc){
            const weekTots = misc[year]['weekTots']
            const leagueSize = misc[year]['leagueSize']
            const value = weekTots.reduce((a,b)=>a+b)/weekTots.length/leagueSize
            onlyVals.push(value)
            vals.push({'year':year,'value':value})
        }
        let sorted = [...onlyVals].sort((a,b)=>a-b)
        if(item[2]!='min'){sorted = sorted.reverse()}
        for(const line of vals){
            line['rank'] = sorted.indexOf(line.value) + 1
        }
        weekAwards.push({'title':item[0],'desc':item[1],'values':vals,'meta':['year']})
    }
    return weekAwards

}