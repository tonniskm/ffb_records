

export function CompareRecords(records,oldRecords){
    let out = []
    let overallOut = []
    let fantasyOut = []
    const input = [records,oldRecords]
    //unpack then compare
    function Comparison(award,oldAward,out,type){
        function NameOnly(x){return x.name}
        function WeekYear(x){return x.year+' Week '+x.week}
        function YearOnly(x){return x.year}
        function NameYear(x){return x.name+' '+x.year}
        function NWY(x){return x.name+' Week '+x.week+' '+x.year}
        function NMN(x){return x.name+', '+x.meta.team}
        function ID(x,type){
            if(type=='name'){return NameOnly(x)}
            if(type=='wy'){return WeekYear(x)}
            if(type=='year'){return YearOnly(x)}
            if(type=='ny'){return NameYear(x)}
            if(type=='nwy'){return NWY(x)}
            if(type=='nmn'){return NMN(x)}
        }
        const bestPBAwards = ['Poor Outlook','Never a Bad Week','Life is Easy','Uphill Both Ways','Always Cocky','Uphill Battle',
            'Thinking Positive','Glass Half Empty','I Shall Overcome!','Defeatist',"Gotta Catch 'Em All!",'Tinkerer',
            "What's a Drop/Add?",'Never Tinkerer','Diversity Today','A Stable Life',"Who's On My Team Again?",'Same Old Same Old',
            'Never Injured','Streamer',"I Haven't Learned to do Drop/Adds",'Frantic Tinkerer'
]
        const winnerLines = award['values'].filter(x=>x.rank==1)
        const oldWinnerLines = oldAward['values'].filter(x=>x.rank==1)
        const winners = winnerLines.map(x=>ID(x,type))
        const oldWinners = oldWinnerLines.map(x=>ID(x,type))
        const oldWinnerValues = oldWinnerLines.map(x=>x['value'])
        const newWinnerValues = winnerLines.map(x=>x['value'])
        let newLoserValues
        try{
            if(bestPBAwards.includes(award.title)){
                newLoserValues = oldWinnerLines.map(x=>x.name).map(x=>award['values'].filter(y=>y.name==x)[0]['value'])
            }else{
                newLoserValues = oldWinners.map(x=>award['values'].filter(y=>ID(y,type)==x)[0]['value'])
            }
        }catch(e){newLoserValues='NA'}
        let oldLoserValues 
        try{
            if(bestPBAwards.includes(award.title)){
                oldLoserValues = winnerLines.map(x=>x.name).map(x=>oldAward['values'].filter(y=>y.name==x)[0]['value'])
            }
            else{
                if(['wy','nwy','year','ny'].includes(type)){
                    oldLoserValues = 'NA'
                }else{
                    oldLoserValues = winners.map(x=>oldAward['values'].filter(y=>ID(y,type)==x)[0]['value'])
                }
            }
        }catch(e){oldLoserValues = 'NA'}
        let areEqual = true
        for(const winner of winners){
            if(!oldWinners.includes(winner)){areEqual=false}
        }
        for(const winner of oldWinners){
            if(!winners.includes(winner)){areEqual=false}
        }
        // if(award.title=='Noodle Armed'){console.log({1:areEqual,2:oldWinners,3:winners})}
        if(!areEqual){
            out.push({'title':award.title,'desc':award.desc,'was':{'winner':oldWinners,'loser':winners,'winnerValue':oldWinnerValues,'loserValue':oldLoserValues},
                'now':{'winner':winners,'loser':oldWinners,'winnerValue':newWinnerValues,'loserValue':newLoserValues}})
        }

    
    }
    const list = [['nameAwards','name'],['gameAwards','wy'],['weekAwards','wy'],['yearAwards','year'],['nyAwards','ny'],['projAwards','nwy'],['playerStats','name'],['draftAwards','name'],['teamAwards','name']]
    for(const item of list){ // records
        for(let i=0;i<records[item[0]].length;i++){
            const award = records[item[0]][i]
            if(award.title=='Flex comparison'){continue}
            const oldAward = oldRecords[item[0]][i]
            let idType = item[1]
            if(['King of the Rock','Noodle Armed'].includes(award.title)){idType='nwy'}
            if(['Always Cocky','Uphill Battle','Thinking Positive','Glass Half Empty','I Shall Overcome!','Defeatist'].includes(award.title)){idType='name'}
            if(['Here We Go Again','Workhorse','Riding the pine'].includes(award.title)){idType='nmn'}
            if(['Took the Slow Train from Philly','Diversity Today','A Stable Life',"Who's On My Team Again?",'Same Old Same Old','Never Injured','Streamer',"I Haven't Learned to do Drop/Adds",'Frantic Tinkerer'].includes(award.title)){idType='ny'}
            Comparison(award,oldAward,out,idType)

        }
    }
    const overallList = ['Biggest L','Biggest W','High L','High Score','Highest Win Against','Low Score','Lowest Lost To',]
    for(const key of overallList){
        const oldDict = oldRecords.overall[key]
        const newDict = records.overall[key]
        for(const name in newDict){
            if(oldDict[name]!=newDict[name]){
                overallOut.push({'name':name,'key':key,'old':oldDict[name],'new':newDict[name]})
            }
        }
    }
    //fantasyTeams
    const fantasyList = ['QB1','RB1','WR1','TE1','K1','D/ST1']
    for(const name in records.fantasyTeams){
        const oldDict = oldRecords.fantasyTeams[name]
        const newDict = records.fantasyTeams[name]
        for(const pos of fantasyList){
            let oldVal, newVal
            if(pos in newDict && !(pos in oldDict)){
                oldVal = 'NA'
                newVal = newDict[pos][0]+', '+newDict[pos][1].name+', '+newDict[pos][1].meta[0]+', week '+newDict[pos][1].meta[1]
            }else{
                if(oldDict[pos][0]!=newDict[pos][0]){
                    oldVal = oldDict[pos][0]+', '+oldDict[pos][1].name+', '+oldDict[pos][1].meta[0]+', week '+oldDict[pos][1].meta[1]
                    newVal = newDict[pos][0]+', '+newDict[pos][1].name+', '+newDict[pos][1].meta[0]+', week '+newDict[pos][1].meta[1]
                    fantasyOut.push({'name':name,'key':pos,'old':oldVal,'new':newVal})
                }
            }
        }
    }
// console.log(out)
// console.log(overallOut)
// console.log(fantasyOut)
return{'records':out,'overall':overallOut,'fantasy':fantasyOut}
}