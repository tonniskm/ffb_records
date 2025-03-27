

export function GetOtherTables(vars,raw){
    let oppos = {}
    let scores = {}
    let types = {}
    let oppoScore = {}
    let outcome = {}

    for(let year=vars.yearMin;year<=vars.currentYear;year++){
        oppos[year] = {}
        scores[year] = {}
        types[year] = {}
        oppoScore[year] = {}
        outcome[year] = {}
        let names = ChooseNames(vars,year)
        for (let n=0;n<names.length;n++){
            oppos[year][names[n]] = {} 
            scores[year][names[n]] = {}
            types[year][names[n]] = {}
            oppoScore[year][names[n]] = {}
            outcome[year][names[n]] = {}
        }
    for(let i=0;i<Object.keys(raw[year]).length;i++){
        let game = raw[year][i]
        let week = parseInt(game['Week'])
        let t1 = parseInt(game['Team1'])
        let score1 = Math.round(parseFloat(game['Score1'])*100)/100
        let t2 = game.Team2
        let score2 = Math.round(parseFloat(game['Score2'])*100)/100
        let winner = game.winner
        let type = game.type

        if(t2!='BYE'&&type!='lame'){
            oppos[year][names[t1]][week] = names[parseInt(t2)]
            oppos[year][names[parseInt(t2)]][week] = names[t1]

            scores[year][names[t1]][week] = score1
            scores[year][names[parseInt(t2)]][week] = score2

            oppoScore[year][names[t1]][week] = score2
            oppoScore[year][names[parseInt(t2)]][week] = score1

            if(winner=="TIE"){
                outcome[year][names[t1]][week] = "T"
                outcome[year][names[parseInt(t2)]][week] = "T"
            }else if(parseInt(winner)==t1){
                outcome[year][names[t1]][week] = "W"
                outcome[year][names[parseInt(t2)]][week] = "L"
            }else if(winner=='BYE'){
                outcome[year][names[t1]][week] = "BYE"
            }
            else{
                outcome[year][names[t1]][week] = "L"
                outcome[year][names[parseInt(t2)]][week] = "W"
            }
        }
        types[year][names[t1]][week] = type
        if(t2!='BYE'){types[year][names[parseInt(t2)]][week] = type}
    }
}//end year
return {'oppos':oppos,'scores':scores,'types':types,'oppoScores':oppoScore,'outcomes':outcome}
}

export function ChooseNames(vars,year){
    let names = vars.names
    if(year==2012){names=vars.names2012}
    if(year>=2022){names=vars.names2022}
    return names
}


// Javascript program to calculate the 
// standard deviation of an array
export function StandardDeviation(arr) {
    if(arr.length==0){return 0}

    // Creating the mean with Array.reduce
    let mean = arr.reduce((acc, curr) => {
        return acc + curr
    }, 0) / arr.length;

    // Assigning (value - mean) ^ 2 to
    // every array item
    arr = arr.map((k) => {
        return (k - mean) ** 2
    });

    // Calculating the sum of updated array 
    let sum = arr.reduce((acc, curr) => acc + curr, 0);

    // Calculating the variance
    let variance = sum / arr.length

    // Returning the standard deviation
    return Math.sqrt(sum / (arr.length-1))
}

export function DictMax(dict){
    let maxValue = 0;
    for(const [key, value] of Object.entries(dict)) {
    if(value > maxValue&&value!='none'&&value!=undefined&&value!='NA') {
        maxValue = value;
    }
    }
    return maxValue
}
export function DictKeysWithValue(dict,value){
    let out = []
    for(const key in dict){
        if(dict[key]==value){out.push(key)}
    }
    return out
}

export function DictMin(dict){
    let minValue;
    for(const [key, value] of Object.entries(dict)) {
    if((value < minValue||minValue==undefined)&&value!='none'&&value!=undefined&&value!='NA') {
        minValue = value;
    }
    }
    return minValue
}
export function KeysWithValue(value,dict){
    let keys = []
    for (const key in dict) {
        // if (dict.hasOwnProperty(key)) {
          if (dict[key] == value) {
            keys.push(key);
          }
        // }
      }
      return keys;
}

export function DictSum(dict) {
    let sum = 0;
    for (const key in dict) { 
      if (dict.hasOwnProperty(key)) {
        sum += dict[key];
      }
    }
    return sum;
  }

export function DictRanks(dict,type){
    let arr = []
    let out = {}
    for(const key in dict){
        arr.push(dict[key])
    }
    let arr2 = [...arr].sort((a,b)=>a-b)
    if(type!='min'){arr2=[...arr2].reverse()}
    for(const key in dict){
        out[key] = arr2.indexOf(dict[key])+1
    }
    return out
}
export function findMedian(arr) {
    arr.sort((a, b) => a - b);
    const middleIndex = Math.floor(arr.length / 2);

    if (arr.length % 2 === 0) {
        return (arr[middleIndex - 1] + arr[middleIndex]) / 2;
    } else {
        return arr[middleIndex];
    }
}

export function UnpackRawLine(line,names){
    const week = parseInt(line['Week'])
    const t1 = names[parseInt(line['Team1'])]
    const score1 = Math.round(parseFloat(line['Score1'])*100)/100
    const t2 = line.Team2
    const score2 = Math.round(parseFloat(line['Score2'])*100)/100
    const winner = line.winner
    const type = line.type
    if(t2!='BYE'){t2=names[parseInt(t2)]}
    if(winner!='BYE'&&winner!='TIE'){winner=names[parseInt(winner)]}
    return{'week':week,'t1':t1,'score1':score1,'t2':t2,'score2':score2,'winner':winner,'type':type}
        // for (const line of raw){
    //     const {week,t1,score1,t2,score2,winner,type} = UnpackRawLine()
    // }

}
export function UnpackProjLine(line,names){
    const week = parseInt(line['Week'])
    const nflName = line['PlayerName']
    const actual = Math.round(parseFloat(line['PlayerScoreActual'])*100)/100
    const projected = parseFloat(line['PlayerScoreProj'])
    const team = names[parseInt(line['PlayerFantasyTeam'])]
    const pos = line['Position']
    const nflTeam = line['ProTeam']
    const slot = line['PlayerRosterSlot']
    return {'week':week,'nflName':nflName,'actual':actual,'projected':projected,'team':team,'pos':pos,'nflTeam':nflTeam,'slot':slot}
    // for (const line of proj){
    //     const {week,nflName,actual,projected,team,pos,nflTeam,slot} = UnpackProjLine(line,names)
}

export function SortNRank(onlyVals,vals,type){
    let sorted = [...onlyVals].sort((a,b)=>a-b)
    if(type!='min'){sorted = sorted.reverse()}
    for(const line of vals){
        line['rank'] = sorted.indexOf(line.value) + 1
    }
    return vals
}