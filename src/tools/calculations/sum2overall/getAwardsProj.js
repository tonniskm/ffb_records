

export function getAwardsProj(vars,input){
    const projStatsRaw = input['yearProj']
    const meta = projStatsRaw[2018]['meta']
    const comparedKeys = meta['comparedKeys']
    let awards = []
    const names = vars.allNames
    const overall = input['overallProj']
    const list = [
        {'id': 'ap1', 'title': 'Great Expectations', 'description': 'The highest projection ever', 'keyID': 'Best Proj', 'MinMax': null, 'meta': ['name', 'year', 'week'], 'agg': 'total'},
        {'id': 'ap2', 'title': 'Poor Outlook', 'description': 'The worst highest projection ever', 'keyID': 'Best Proj', 'MinMax': 'min', 'meta': ['name', 'year', 'week'], 'agg': 'person','sort':'high'},
        {'id': 'ap3', 'title': 'Not My Week', 'description': 'The lowest projection ever', 'keyID': 'Worst Proj', 'MinMax': 'min', 'meta': ['name', 'year', 'week'], 'agg': 'total'},
        {'id': 'ap4', 'title': 'Never a Bad Week', 'description': 'The best lowest projection ever', 'keyID': 'Worst Proj', 'MinMax': 'low', 'meta': ['name', 'year', 'week'], 'agg': 'person','sort':'high'},
        {'id': 'ap5', 'title': 'Exceeds Expectations', 'description': 'The most a person has beaten their projection by', 'keyID': 'Best Beat Proj', 'MinMax': null, 'meta': ['name', 'year', 'week'], 'agg': 'total'},
        {'id': 'ap6', 'title': 'Life is Often Disappointing', 'description': 'The most a person has underperformed their projection', 'keyID': 'Worst Lose Proj', 'MinMax': 'min', 'meta': ['name', 'year', 'week'], 'agg': 'total'},
        {'id': 'ap7', 'title': 'Feeling Confident', 'description': 'The biggest projected difference', 'keyID': 'Best Proj Dif', 'MinMax': null, 'meta': ['name', 'year', 'week'], 'agg': 'total'},
        {'id': 'ap8', 'title': 'Life is Easy', 'description': 'The person whose worst enemy projection ever is the lowest', 'keyID': 'Best Proj Faced', 'MinMax': 'min', 'meta': ['name', 'year', 'week'], 'agg': 'person'},
        {'id': 'ap9', 'title': 'Uphill Both Ways', 'description': 'The person whose easiest enemy projection ever is the highest', 'keyID': 'Worst Proj Faced', 'MinMax': 'low', 'meta': ['name', 'year', 'week'], 'agg': 'person'},
        {'id': 'ap10', 'title': 'Trophy Hunter', 'description': 'The highest projection to ever be defeated', 'keyID': 'Best Proj Beaten', 'MinMax': null, 'meta': ['name', 'year', 'week'], 'agg': 'total'},
        {'id': 'ap11', 'title': 'The Mouse that Roared', 'description': 'The lowest projection to ever win a game', 'keyID': 'Worst Proj Lost To', 'MinMax': 'min', 'meta': ['name', 'year', 'week'], 'agg': 'total'},
        {'id': 'ap12', 'title': 'David and Goliath', 'description': 'The biggest projected deficit ever overcome', 'keyID': 'Biggest Overcome', 'MinMax': null, 'meta': ['name', 'year', 'week'], 'agg': 'total'},
        {'id': 'ap13', 'title': 'Always Cocky', 'description': 'The person projected to win the most often', 'keyID': 'Proj to Win %', 'MinMax': null, 'meta': ['name'], 'agg': 'person'},
        {'id': 'ap14', 'title': 'Uphill Battle', 'description': 'The person projected to win the least often', 'keyID': 'Proj to Win %', 'MinMax': 'min', 'meta': ['name'], 'agg': 'person'},
        {'id': 'ap15', 'title': 'Thinking Positive', 'description': 'The most likely to win while projected to win', 'keyID': 'Proj to W W %', 'MinMax': null, 'meta': ['name'], 'agg': 'total'},
        {'id': 'ap16', 'title': 'Glass Half Empty', 'description': 'The most likely to lose when projected to win', 'keyID': 'Proj to W W %', 'MinMax': 'min', 'meta': ['name'], 'agg': 'total'},
        {'id': 'ap17', 'title': 'I Shall Overcome!', 'description': 'The most likely to win when projected to lose', 'keyID': 'Proj to L W %', 'MinMax': null, 'meta': ['name'], 'agg': 'total'},
        {'id': 'ap18', 'title': 'Defeatist', 'description': 'The most likely to lose when projected to lose', 'keyID': 'Proj to L W %', 'MinMax': 'min', 'meta': ['name'], 'agg': 'total'}
    
    ]
    const smallList = ['Poor Outlook','Not My Week','Life is Often Disappointing','Life is Easy','The Mouse that Roared',
        'Uphill Battle','Glass Half Empty','Defeatist']
    const noMetaList = ['Always Cocky','Uphill Battle','Thinking Positive','Glass Half Empty','I Shall Overcome!','Defeatist']
    const personalList = ['Poor Outlook','Life is Easy','Never a Bad Week','Uphill Both Ways','Always Cocky','Uphill Battle']

    for(const item of list){
        let vals = []
        let onlyVals = []
        const key = item.keyID
        let value
        if(comparedKeys.includes(key)&&item.agg!='person'){
            for(const line of overall[key]){
                // console.log({1:line,2:overall,3:item})
                value = line.value
                onlyVals.push(value)
                vals.push({'value':value,'name':line.name,'week':line.week,'year':line.year})
            }
        }
        else if(comparedKeys.includes(key)&&item.agg=='person'){
            for (const name of names){
                const filtered = overall[key].filter(x=>x.name==name)
                let sort = filtered.sort((a,b)=>a.value-b.value)
                if (sort.length>0){

                    if(item.sort!='low'){sort = sort.reverse()}
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
        if(item.MinMax!='min'){sorted = sorted.reverse()}
        for(const line of vals){
            line['rank'] = sorted.indexOf(line.value) + 1
        }
        // let meta = ['name','year','week']
        // if(noMetaList.includes(item[0])){meta=['name']}
        awards.push({'title':item.title,'desc':item.description,'values':vals,'meta':item.meta,'id':item.id})
    }//for item
    return awards
}