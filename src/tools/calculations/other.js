

export function GetOtherTables(vars,raw,proj){
    let oppos = {}
    let scores = {}
    let types = {}
    let oppoScore = {}
    let outcome = {}

    for(let year=vars.yearMin;year<=vars.currentYear;year++){
        if(!Object.keys(raw).includes(year.toString())){continue}
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
        if(t2=='BYE'){outcome[year][names[t1]][week]='BYE';types[year][names[t1]][week] = 'BYE'}
        else{types[year][names[t1]][week] = type}
        if(t2!='BYE'){types[year][names[parseInt(t2)]][week] = type}
    }
}//end year
//proj stuff
let myTeam = {}
for(let year=Math.max(vars.yearMin,2018);year<=vars.currentYear;year++){
    if(!Object.keys(raw).includes(year.toString())){continue}
    myTeam[year] = {}
    let names = ChooseNames(vars,year)
    for (const name of names){
        myTeam[year][name] = {} 
    }

    for (const line of proj[year]){
        const {week,NFLName,actual,projected,team,pos,nflTeam,slot} = UnpackProjLine(line,names)
        if(!(week in myTeam[year][team])){myTeam[year][team][week] = []}
        myTeam[year][team][week].push({week,NFLName,actual,projected,team,pos,nflTeam,slot})
        if(types[year][team][week]==undefined){types[year][team][week] = 'lame'}
    }
    
}
return {'oppos':oppos,'scores':scores,'types':types,'oppoScores':oppoScore,'outcomes':outcome,myTeam}
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

export function DictMax(dict,eligible=''){
    let maxValue = 0;
    for(const [key, value] of Object.entries(dict)) {
        if(eligible!=''&&!eligible.includes(key)){continue}
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

export function DictMin(dict,eligible=''){
    let minValue;
    for(const [key, value] of Object.entries(dict)) {
        if(eligible!=''&&!eligible.includes(key)){continue}
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
    let t2 = line.Team2
    const score2 = Math.round(parseFloat(line['Score2'])*100)/100
    let winner = line.winner
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
    const NFLName = NameFixer(line['PlayerName'])
    const actual = Math.round(parseFloat(line['PlayerScoreActual'])*100)/100
    const projected = parseFloat(line['PlayerScoreProj'])
    const team = names[parseInt(line['PlayerFantasyTeam'])]
    let pos = line['Position']
    const nflTeam = line['ProTeam']
    const slot = line['PlayerRosterSlot']
    if(['QB','WR','RB','TE','D/ST','K'].includes(slot)){pos=slot}//Taysom Hill is a terrorist
    return {'week':week,'NFLName':NFLName,'actual':actual,'projected':projected,'team':team,'pos':pos,'nflTeam':nflTeam,'slot':slot}
    // for (const line of proj){
    //     const {week,NFLName,actual,projected,team,pos,nflTeam,slot} = UnpackProjLine(line,names)
}

export function SortNRank(onlyVals,vals,type){
    let sorted = [...onlyVals].sort((a,b)=>a-b)
    if(type!='min'){sorted = sorted.reverse()}
    for(const line of vals){
        line['rank'] = sorted.indexOf(line.value) + 1
    }
    return vals
}

export function Round(val,digs=2){
    return Math.round(val*10**(digs))/(10**(digs))
}

export function RecordToFrac(record){
    return((record[0]+record[2]/2)/Math.max(1,record[0]+record[1]+record[2]))
}

export function GetPickNo(round,ind,leagueSize){
    if(round%2===1){//going right
        return (round-1)*leagueSize+ind+1
    }
    else{
        return round*leagueSize - ind
    }
}

export function NameFixer(name){
    let out = name
    if(name==='Jaguars D/ST'){out='Jacquarfs D/ST'}
    else if(name==="Ja'Marr Chase"){out = 'Chase Lay'}
    return out
}

export function expandProj(proj,tables,vars){
    const combinedArray = Object.entries(proj).flatMap(
        ([year, arr]) => arr.map(obj => ({ ...obj, year }))
      );
      let filtered = []
      for (const line of combinedArray){
          const year = line.year
          const names = ChooseNames(vars,year)
          const {week,NFLName,actual,projected,team,pos,nflTeam,slot} = UnpackProjLine(line,names)
          const type = tables.types[year][team][week]
          if(type==='lame'||type==='BYE'){continue}
          const oppo = tables.oppos[year][team][week]
          if(oppo==='BYE'){continue}
          const outcome = tables.outcomes[year][team][week]
          let didStart
          if(slot==='Bench'||slot==='IR'){didStart=false}else{didStart=true}

          filtered.push({year,week,NFLName,actual,projected,pos,team,nflTeam,slot,type,oppo,outcome,didStart})
      }
      
      return filtered
}

const replacements = [['Jaguars D/ST','Jacquarfs D/ST'],["Ja'Marr Chase",'Chase Lay'],['Hollywood Brown','Marquise Brown'],
['Chig Okonkwo','Chigoziem Okonkwo']]
export function CleanName(name){
    let cleanName = name
        for (const replacement of replacements){
        cleanName = cleanName.replace(replacement[1],replacement[0])
    }
        cleanName = FixJrs(cleanName)
    return cleanName
}
export function DirtyName(name){
    let out = name
    for (const replacement of replacements){
        out = out.replace(replacement[0],replacement[1])
    }
    return out
}
const JRS = [' Jr.',' Sr.',' II',' III',' IV']
export function FixJrs(name){
    let out = name
    for(const jr of JRS){
       out = out.replace(jr,'')
    }
    return out
}

export function SummaryLine(mine,vals,minmax){
        let sorted = [...vals].sort((a,b)=>a-b)
        if(minmax!=='min'){sorted=sorted.reverse()}
        const rank = sorted.findIndex(x=>x===mine) + 1
        const total = vals.length
        // if(total===5&&mine===1){console.log({mine,vals,minmax,rank})}
        const perc =  Math.round(10000-10000*(rank-1)/Math.max(1,(total-1)))/100
        return(
            `${rank} of ${total} (${perc}%)`
        )
    }