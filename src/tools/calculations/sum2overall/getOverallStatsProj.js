

export function getOverallStatsProj(vars,input){
    const projStatsRaw = input['yearProj']
    let awards = []
    let overall = {}
    const allKeys = Object.keys(projStatsRaw[2018]['scores'])
    const meta = projStatsRaw[2018]['meta']
    const comparedKeys = meta['comparedKeys']
    const minKeys = meta['minKeys']
    const names = vars.allNames
    let addKeys = []
    for (const key of allKeys){
        if(!comparedKeys.includes(key)&&key!='Name'){addKeys.push(key)}
        overall[key] = {}
        for(const name of names){
            overall[key][name] = {'value':0}
        }
    }
    for (const key of comparedKeys){
        for(const name of names){
            if(minKeys.includes(key)){
                overall[key][name]['value'] = 999999
            }else{
                overall[key][name]['value'] = -1000
                overall[key][name]['meta'] = []
            }
        }
    }
    for (const year in projStatsRaw){
        const projStats = projStatsRaw[year]['scores']
        for(const name of names){
            const i = name
            if(name in projStats[addKeys[1]]){
                for(const item of addKeys){overall[item][i]['value'] += projStats[item][i]}
                for(const item of comparedKeys){
                    const value = projStats[item][i][0]
                    const fullValue = projStats[item][i]
                    for(let dict of fullValue[1]){dict['year']=year}
                    const metaValue = fullValue[1]

                    if (overall[item][i]['value'] == value){overall[item][i]['meta'].push(metaValue)}
                    if (minKeys.includes(item)){
                        if (value < overall[item][i]['value']){
                            overall[item][i]['value'] = value
                            overall[item][i]['meta'] = fullValue[1]}
                    }else{
                        if (value > overall[item][i]['value']){
                            overall[item][i]['value'] = value
                            overall[item][i]['meta'] = fullValue[1]}
                    }
                }
            }else{continue} //name not active this year
        }//names
    }//year
    const list = ['Proj to Win %','Beat Proj %','Oppo Beats Proj %','Proj to W W %','Proj to L W %']
    for (const item of list){
        overall[item] = {}
        for(const name of names){
            overall[item][name] = {'value':0}
        }
    }
    for (const name of names){
        const i = name
        overall['Proj to Win %'][i]['value'] = overall['Projected to Win'][i]['value']/Math.max((overall['Projected to Win'][i]['value']
                                   +overall['Projected to Lose'][i]['value']),1)
        overall['Beat Proj %'][i]['value'] = overall['Beat Proj Times'][i]['value']/Math.max((overall['Projected to Win'][i]['value']
                                   +overall['Projected to Lose'][i]['value']),1)
        overall['Oppo Beats Proj %'][i]['value'] = overall['Oppo Beat Proj Times'][i]['value']/Math.max((overall['Projected to Win'][i]['value']
                                   +overall['Projected to Lose'][i]['value']),1)
        overall['Proj to W W %'][i]['value'] = (overall['Proj W W'][i]['value'] + overall['Proj W T'][i]['value']/2)/
                                      Math.max(overall['Projected to Win'][i]['value'],1)
        overall['Proj to L W %'][i]['value'] = (overall['Proj L W'][i]['value'] + overall['Proj L T'][i]['value']/2)/
                                      Math.max(overall['Projected to Lose'][i]['value'],1)
    }

    return overall
}