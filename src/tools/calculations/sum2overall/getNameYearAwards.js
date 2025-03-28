//outputs name and year

export function getNameYearAwards(vars,input){
    //looks at each year
    const stats = input.year
    let awards = []
    const list2 = [
        ['Peak Performer',"The best ever regular season record",'pct'],
        ['Please Forget',"The worst ever regular season record",'pct','min'],
        ['Season High',"The highest ever reg season point total",'reg total'],
        ['Season Low',"The lowest ever reg season point total",'reg total','min'],
        ['Season High Defense',"The highest ever reg season point total allowed",'oppo reg total'],
        ['Season Low Defense',"The Lowest ever reg season point total allowed",'oppo reg total','min']
    ]
    for(const item of list2){
        let vals = []
        let onlyVals = []
        for(const year in stats){
            for(const name of vars.allNames){
                const ind = name
                if(vars.lameDucks.includes(name)){continue}
                const value = stats[year][item[2]][name]
                if(value=='none'||value=='NA'||value==undefined){continue}
                vals.push({'name':name,'year':year,'val':stats[year][item[2]][name]})
                onlyVals.push(stats[year][item[2]][name])
            }
        }
    let sorted = [...onlyVals].sort((a,b)=>a-b)
    if(item[3]!='min'){sorted = sorted.reverse()}
    for(const line of vals){
        line['rank'] = sorted.indexOf(line.val) + 1
    }
    awards.push({'title':item[0],'desc':item[1],'values':vals,'meta':['name','year']})
    }
    return awards
}