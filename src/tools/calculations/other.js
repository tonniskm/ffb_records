

export function GetOtherTables(vars,raw){
    let oppos = {}
    let scores = {}
    let types = {}
    let oppoScore = {}

    for(let year=vars.yearMin;year<=vars.currentYear;year++){
        oppos[year] = {}
        scores[year] = {}
        types[year] = {}
        oppoScore[year] = {}
        let names = ChooseNames(vars,year)
        for (let n=0;n<names.length;n++){
            oppos[year][names[n]] = {} 
            scores[year][names[n]] = {}
            types[year][names[n]] = {}
            oppoScore[year][names[n]] = {}
        }
    for(let i=0;i<Object.keys(raw[year]).length;i++){
        let game = raw[year][i]
        let week = parseInt(game['Week'])
        let t1 = parseInt(game['Team1'])
        let score1 = Math.round(parseInt(game['Score1'])*100)/100
        let t2 = game.Team2
        let score2 = Math.round(parseInt(game['Score2'])*100)/100
        let winner = game.winner
        let type = game.type

        if(t2!='BYE'&&type!='lame'){
            oppos[year][names[t1]][week] = names[parseInt(t2)]
            oppos[year][names[parseInt(t2)]][week] = names[t1]

            scores[year][names[t1]][week] = parseInt(score1)
            scores[year][names[parseInt(t2)]][week] = parseInt(score2)

            oppoScore[year][names[t1]][week] = parseInt(score2)
            oppoScore[year][names[parseInt(t2)]][week] = score1
        }
        types[year][names[t1]][week] = type
        if(t2!='BYE'){types[year][names[parseInt(t2)]][week] = type}
    }
}//end year
return {'oppos':oppos,'scores':scores,'types':types,'oppoScores':oppoScore}
}

export function ChooseNames(vars,year){
    let names = vars.names
    if(year==2012){names=vars.names2012}
    if(year>=2022){names=vars.names2022}
    return names
}