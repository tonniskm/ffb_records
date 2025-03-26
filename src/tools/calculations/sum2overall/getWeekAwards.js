

export function getWeekAwards(vars,input){
    const misc = input['misc']
    let weekAwards = []
    const list = [['Best Week','The highest scoring week ever'],['Worst Week','The lowest scoring week ever','min']]

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
        if(item[2]!='min'){sorted = sorted.reverse()}
        for(const line of vals){
            line['rank'] = sorted.indexOf(line.value) + 1
        }
        weekAwards.push({'title':item[0],'desc':item[1],'values':vals})
    }
    return weekAwards

}