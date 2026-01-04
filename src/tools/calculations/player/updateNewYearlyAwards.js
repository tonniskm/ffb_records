

export function updateNewYearlyAwards(vars,input){
    const yearSum = input['yearSum']
    const list = [
        {'name':'high score','table':'gameAwards','id':'ga6','meta':['name','week','year','rank'],'minMax':'max'},
        {'name':'low score','table':'gameAwards','id':'ga6','meta':['name','week','year','rank'],'minMax':'min'},
        {'name':'low high','table':'nameAwards','id':'na27','meta':['name','week','rank'],'minMax':'min'},
        {'name':'pts for','table':'nyAwards','id':'nya3','meta':['name','rank'],'minMax':'max'},
        {'name':'low pts for','table':'nyAwards','id':'nya3','meta':['name','rank'],'minMax':'min'},
        {'name':'pts against','table':'nyAwards','id':'nya5','meta':['name','rank'],'minMax':'max'},
        {'name':'low pts against','table':'nyAwards','id':'nya5','meta':['name','rank'],'minMax':'min'},
        {'name':'best score vs proj per game','table':'nyAwards','id':'nya12','meta':['name','rank'],'minMax':'max'},
        {'name':'worst score vs proj per game','table':'nyAwards','id':'nya12','meta':['name','rank'],'minMax':'min'},

        {'name':'most under optimum','table':'teamAwards','id':'TAG1','meta':['name','week','rank'],'minMax':'max'},
        {'name':'closest to optimum','table':'teamAwards','id':'TAG1','meta':['name','week','rank'],'minMax':'min'},
        {'name':'most more wins if you could set a lineup','table':'teamAwards','id':'team5'+'inYear','meta':['name','rank'],'minMax':'max'},
        {'name':'most more wins if best ball','table':'teamAwards','id':'team7'+'inYear','meta':['name','rank'],'minMax':'max'},
        {'name':'most more losses if best ball','table':'teamAwards','id':'team7'+'inYear','meta':['name','rank'],'minMax':'min'},
        {'name':'most points/gm left on bench','table':'teamAwards','id':'team6'+'inYear','meta':['name','rank'],'minMax':'max'},
        {'name':'fewest points/gm left on bench','table':'teamAwards','id':'team6'+'inYear','meta':['name','rank'],'minMax':'min'},
        {'name':'Biggest Beat Projection','table':'projAwards','id':'ap5','meta':['name','week','year','rank'],'minMax':'max'},
        {'name':'Biggest Under Projection','table':'projAwards','id':'ap6','meta':['name','week','year','rank'],'minMax':'min'},
    ]

    for(const year in yearSum){
        for(const item of list){
            const award= input[item.table].filter(x=>x.id===item.id)
            if(award.length===0){continue}
            let filtered = award[0]['values'].filter(x=>x.year == year)
            if(filtered.length===0){continue}
            filtered = filtered.sort((a,b)=>a['value']-b['value'])
            if(item.minMax==='max'){filtered = filtered.reverse()}
            const winners = filtered.filter(x=>x['value']===filtered[0]['value'])
            yearSum[year][item.name] = {value: winners[0]['value']}
            for(const metaKey of item['meta']){
                yearSum[year][item.name][metaKey] = []
                for(const win of winners){
                    yearSum[year][item.name][metaKey].push(win[metaKey])
                }
            }
            const rank = award[0]['values'].find(x=>x['value']===winners[0]['value'])['rank']
            yearSum[year][item.name]['rank'] = rank
            yearSum[year][item.name]['totalEligible'] = award[0]['values'].length
        }
    }

    // fix old ones with arrays
    // for(const year in yearSum){
    //     const list = [
    //         {'name':'high score','table':'yearAwards','id':'ya1'},
    //     ]
    //     yearSum[year]['high score'] = 
    // }
}