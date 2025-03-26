

export function getAwardsProj(vars,input){
    let awards = []
    const names = vars.allNames
    const overall = input['overallProj']
    const list = [
        ['Great Expectations','The highest projection ever','Best Proj'],
        ['Poor Outlook','The worst highest projection ever','Best Proj'],
        ['Not My Week','The lowest projection ever','Worst Proj'],
        ['Never a Bad Week','The best lowest projection ever','Worst Proj'],
        ['Exceeds Expectations','The most a person has beaten their projection by','Best Beat Proj'],
        ['Life is Often Disappointing','The most a person has underperformed their projection','Worst Lose Proj'],
        ['Feeling Confident','The biggest projected difference','Best Proj Dif'],
        ['Life is Easy','The person whose worst enemy projection ever is the lowest','Best Proj Faced'],
        ['Uphill Both Ways','The person whose easiest enemy projection ever is the highest','Worst Proj Faced'],
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

    for(const item of list){
        let values = []
        let onlyValues = []
        for(const name of names){
            if(vars.lameDucks.includes(name)){continue}
            const key = item[2]
            onlyValues.push(overall[key][name]['value'])
            const meta = overall[key][name]['meta']
            if(meta==undefined)(overall[key][name]['meta']={'name':name})
            values.push(overall[key][name])
        }//for name
        let sorted = [...onlyValues].sort((a,b)=>a-b)
        if(smallList.includes(item[0])){sorted = sorted.reverse()}
        for(const line of values){
            line['rank'] = sorted.indexOf(line.value) + 1
        }
        awards.push({'title':item[0],'desc':item[1],'values':values})
    }//for item
    return awards
}