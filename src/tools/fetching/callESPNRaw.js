



export function CallESPNRaw(vars,setRaw,loading,setLoading){
    let out = {}
    // const year = 2012
    let promises = []
    for (let year=vars.yearMin;year<=vars.currentYear;year++){
        out[year] = []

        let url = 'https://mocktion-site.vercel.app/call/'+year.toString()
        // const url = 'http://localhost:5432/call/'+year.toString()
        // if (year>2012){continue}
        // console.log(year)
        // try{
        promises.push(fetch(url
        ).then(res=>res.json()).then(json=>{
        if(year<2018){json=json[year-vars.yearMin]['schedule']}
        let playoffStart = 1000
        let byeCount = 0
        let winnersBracket = []
        let losersBracket = []
        for(let i=0;i<json.length;i++){ //for each game in the season
            //get the winner and loser scores
            let game = json[i]
            let winner = 'BYE'
            if(game['winner']=='AWAY'){
                winner=game['away']['teamId']
            }else if(game['winner'] =='HOME'){
                winner=game['home']['teamId']
            }else if(game['winner'] =='TIE'){
                winner = 'TIE'
            }
            let week = game['matchupPeriodId']
            let home = game['home']['teamId']
            let homeScore = game['home']['totalPoints']
            let away = 'BYE'
            let awayScore = 0
            if(Object.keys(game).indexOf('away') > -1){
                away = game['away']['teamId']
                awayScore = game['away']['totalPoints']
            }else{
                if(byeCount==0){
                    playoffStart = week
                    byeCount=1
                }else if (byeCount==1){
                    byeCount=2
                }
            }
            //playoff stuff
            if(week==playoffStart){
                if(away=='BYE'){winnersBracket.push(home)}
                else if(byeCount==1){
                    winnersBracket.push(home)
                    winnersBracket.push(away)}
                    else{losersBracket.push(home)
                        losersBracket.push(away)
                    }
            }
            let playoffWeek = week-playoffStart+1
            let gameType = 'REG'
            if(playoffWeek>=1){
                if(winnersBracket.indexOf(home)>-1){
                    gameType='P'+playoffWeek.toString()
                }else if(losersBracket.indexOf(home)>-1){
                    gameType='L'+playoffWeek.toString()
                }else{gameType='lame'}
            }
            
            if(winner==home&&winner!='BYE'){
                if(gameType.includes('P')){winnersBracket=winnersBracket.filter(x=>x!=away)}
                if(gameType.includes('L')&&(playoffWeek!=1||losersBracket.length!=4)){losersBracket=losersBracket.filter(x=>x!=home)}
            }
            if(winner==away&&winner!='BYE'){
                if(gameType.includes('P')){winnersBracket=winnersBracket.filter(x=>x!=home)}
                if(gameType.includes('L')&&(playoffWeek!=1||losersBracket.length!=4)){losersBracket=losersBracket.filter(x=>x!=away)}
            }
            // if(i==0){console.log(winnersBracket)}
            out[year].push({'Week':week,'Team1':home,'Score1':homeScore,'Team2':away,'Score2':awayScore,'winner':winner,'type':gameType,
                'winBracket':winnersBracket.toString(),'loseBracket':losersBracket.toString()
            })

        }//end for each game
        
    })// end res.json
)//end fetch
//}catch(err){console.log(err)}
    //end res.json
    }//end for years
Promise.all(promises).then(()=>{

    setRaw(out)
    // function Update(x){
    //     // console.log('update raw')
    //     x.raw = true
    //     return x
    // }
    // let newLoading = {...loading}
    // newLoading['raw'] = true
    // console.log({1:'raw',2:newLoading})
    // setLoading((prev)=>Update(prev))
})    

}//end func