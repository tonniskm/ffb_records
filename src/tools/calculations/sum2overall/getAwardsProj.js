

export function getAwardsProj(vars,input){
    const projStatsRaw = input['yearProj']
    const meta = projStatsRaw[2018]['meta']
    const comparedKeys = meta['comparedKeys']
    let awards = []
    const names = vars.allNames
    const overall = input['overallProj']
    const list = [
        ['Great Expectations','The highest projection ever','Best Proj'],
        ['Poor Outlook','The worst highest projection ever','Best Proj','high'],
        ['Not My Week','The lowest projection ever','Worst Proj'],
        ['Never a Bad Week','The best lowest projection ever','Worst Proj','low'],
        ['Exceeds Expectations','The most a person has beaten their projection by','Best Beat Proj'],
        ['Life is Often Disappointing','The most a person has underperformed their projection','Worst Lose Proj'],
        ['Feeling Confident','The biggest projected difference','Best Proj Dif'],
        ['Life is Easy','The person whose worst enemy projection ever is the lowest','Best Proj Faced','high'],
        ['Uphill Both Ways','The person whose easiest enemy projection ever is the highest','Worst Proj Faced','low'],
        ['Trophy Hunter','The highest projection to ever be defeated','Best Proj Beaten'],
        ['The Mouse that Roared','The lowest projection to ever win a game','Worst Proj Lost To'],
        ['David and Goliath','The biggest projected deficit ever overcome','Biggest Overcome'],
        ['Always Cocky','The person projected to win the most often','Proj to Win %'],
        ['Uphill Battle','The person projected to win the least often','Proj to Win %'],
        ['Thinking Positive','The most likely to win while projected to win','Proj to W W %'],
        ['Glass Half Empty','The most likely to lose when projected to win','Proj to W W %'],
        ['I Shall Overcome!','The most likely to win when projected to lose','Proj to L W %'],
        ['Defeatist','The most likely to lose when projected to lose','Proj to L W %'],
    ]
    const smallList = ['Poor Outlook','Not My Week','Life is Often Disappointing','Life is Easy','The Mouse that Roared',
        'Uphill Battle','Glass Half Empty','Defeatist']
    const noMetaList = ['Always Cocky','Uphill Battle','Thinking Positive','Glass Half Empty','I Shall Overcome!','Defeatist']
    const personalList = ['Poor Outlook','Life is Easy','Never a Bad Week','Uphill Both Ways','Always Cocky','Uphill Battle']

    for(const item of list){
        let vals = []
        let onlyVals = []
        const key = item[2]
        let value
        if(comparedKeys.includes(key)&&!personalList.includes(item[0])){
            for(const line of overall[key]){
                // console.log({1:line,2:overall,3:item})
                value = line.value
                onlyVals.push(value)
                vals.push({'value':value,'name':line.name,'week':line.week,'year':line.year})
            }
        }
        else if(comparedKeys.includes(key)&&personalList.includes(item[0])){
            for (const name of names){
                const filtered = overall[key].filter(x=>x.name==name)
                let sort = filtered.sort((a,b)=>a.value-b.value)
                if (sort.length>0){

                    if(item[3]!='low'){sort = sort.reverse()}
                    value = sort[0].value
                    onlyVals.push(value)
                    vals.push({'value':value,'name':name,'week':sort[0].week,'year':sort[0].year})
                }

            }
        }
        else{
            for(const name of names){
                if(vars.lameDucks.includes(name)){continue}
                value = overall[key][name]['value']
                onlyVals.push(value)
                // const meta = overall[key][name]['meta']
                // if(meta==undefined)(overall[key][name]['meta']={'name':name})
                vals.push({'value':value,'name':name,'week':overall[key][name].week,'year':overall[key][name].year})
            }//for name

        }
        let sorted = [...onlyVals].sort((a,b)=>a-b)
        if(!smallList.includes(item[0])){sorted = sorted.reverse()}
        for(const line of vals){
            line['rank'] = sorted.indexOf(line.value) + 1
        }
        let meta = ['name','year','week']
        if(noMetaList.includes(item[0])){meta=['name']}
        awards.push({'title':item[0],'desc':item[1],'values':vals,'meta':meta})
    }//for item
    return awards
}