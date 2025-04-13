import { findMedian, StandardDeviation } from "../other"



export function getOverallStats(vars,input){
    const awards = input['yearSum']
    const stats = input['year']
    let overallAwards = []
    let overallStats = {}
    const statKeys = ['Years Played','games played','Playoffs','Semifinals','Finals','Championships','Dewey Does','Byes',
        'Reg Season Pts','Reg Season GP','Reg Season Pts/Gm','Reg Season Pts Allowed','Reg Season Pts Allowed/Gm',
        'High Score','Low Score','W','L','T','pct','Close W','Close L','L Over 100','W Under 80',
        'Low W','High L','Lowest Lost To',
        'Highest Win Against',
        'Weekly High Scores','Weekly Low Scores','Yearly High Scores','Yearly Low Scores',
        'Most Pts Awards','Fewest Pts Awards','Most Pts Allowed Awards','Fewest Pts Allowed Awards',
        'Best Record Awards','Worst Record Awards',
        'Biggest W','Biggest L','pts STD','Beat Low Score','Lost to High Score','Beat 2nd','Lost to 2nd Last',
        'Record vs Mid','Pct vs Mid','Lost as 2nd','Won as 2nd Last']
    const additiveKeys = ['Beat Low Score','Lost to High Score','Beat 2nd','Lost to 2nd Last','games played','Lost as 2nd','Won as 2nd Last']
    const setHigh = ['Low Score','Low W','Lowest Lost To']
    // initialize
    for(const key of statKeys){
        overallStats[key] = {}
        for (const name of vars.allNames){
            overallStats[key][name] = 0
        }
    }
    for (const key of setHigh){
        for (const name of vars.allNames){
            overallStats[key][name] = 999
        }
    }
    let pts = {}
    let ptsAllowed = {}
    let games = {}
    let std = {}
    for (const name of vars.allNames){
        overallStats['Record vs Mid'][name] = [0,0,0]
        pts[name] = 0
        ptsAllowed[name] = 0
        games[name] = 0
        std[name] = []
    }
    let gp = {}
    for (const year in awards){
        if (awards[year]['champ'][1] != 't0'){
            overallStats['Championships'][awards[year]['champ'][1]] += 1
            overallStats['Dewey Does'][awards[year]['dewey does'][1]] += 1
        }
        gp[year] = 99
        for (const team of vars.allNames){
            if (stats[year]['games played'][team] != 0&&stats[year]['games played'][team]!=undefined){
                gp[year] = Math.min(gp[year],stats[year]['games played'][team])
            }
        }
        if (awards[year]['champ'][1] != 't0'){gp[year] =gp[year] - 1}//idk what this is doing

        for(const team of vars.allNames){
            if(team=='t0'){continue}
            const ind = team
            let high=0;let bigW = 0;let bigL=0;let highL=0;let OhighL=0
            let low=999;let lowW=999;let OlowW=999
            if (stats[year]['high'][ind] !='none'&&stats[year]['high'][ind] !=undefined){
                high = stats[year]['high'][ind]
                low = stats[year]['low'][ind]
                bigW = stats[year]['biggest W'][ind]
                bigL = stats[year]['biggest L'][ind]
                lowW = stats[year]['low W'][ind]
                highL = stats[year]['high L'][ind]
                OhighL = stats[year]['oppo high L'][ind]
                OlowW = stats[year]['oppo low W'][ind]
            }else{continue}
            overallStats['High Score'][ind] = Math.max(high,overallStats['High Score'][ind])
            overallStats['Low Score'][ind] = Math.min(low, overallStats['Low Score'][ind])
            overallStats['Reg Season GP'][ind] += stats[year]['reg games played'][ind]
            if(stats[year]['reg games played'][ind]>0){overallStats['Years Played'][ind] += 1}
            // console.log({1:overallStats,2:stats[year]})
            for(const item of ['W','L','T']){overallStats[item][ind] += stats[year][item][ind]}
            overallStats['pct'][ind] = (overallStats['W'][ind]+overallStats['T'][ind]/2)
                        /Math.max((overallStats['W'][ind]+overallStats['T'][ind]+overallStats['L'][ind]),1)
            overallStats['Weekly High Scores'][ind] += stats[year]['high scores'][ind]
            overallStats['Weekly Low Scores'][ind] += stats[year]['low scores'][ind]
            overallStats['Biggest W'][ind] = Math.max(bigW,overallStats['Biggest W'][ind])
            overallStats['Biggest L'][ind] = Math.max(bigL,overallStats['Biggest L'][ind])
            overallStats['Close W'][ind] += stats[year]['close W'][ind]
            overallStats['Close L'][ind] += stats[year]['close L'][ind]
            overallStats['Low W'][ind] = Math.min(lowW,overallStats['Low W'][ind])
            overallStats['High L'][ind] = Math.max(highL,overallStats['High L'][ind])
            overallStats['Lowest Lost To'][ind] = Math.min(OlowW,overallStats['Lowest Lost To'][ind])
            overallStats['Highest Win Against'][ind] = Math.max(OhighL,overallStats['Highest Win Against'][ind])
            overallStats['L Over 100'][ind] += stats[year]['L over 100'][ind]
            overallStats['W Under 80'][ind] += stats[year]['W under 80'][ind]
            for (const key of additiveKeys){overallStats[key][ind] += stats[year][key][ind]}
            if(ind in stats[year]['Record vs Mid']){
                for (const item of [0,1,2]){overallStats['Record vs Mid'][ind][item] +=stats[year]['Record vs Mid'][ind][item]}
            }
            let rec = overallStats['Record vs Mid'][ind]
            overallStats['Pct vs Mid'][ind] = (rec[0] + rec[2]/2)/Math.max(rec[0]+rec[1]+rec[2],1)

            pts[ind] += stats[year]['reg total'][ind]
            ptsAllowed[ind] += stats[year]['oppo reg total'][ind]
            if (stats[year]['reg STD'][ind] != 'none'){std[ind].push(stats[year]['reg STD'][ind])}
            if (stats[year]['games played'][ind] > 0){games[ind] += gp[year]}

            const lastUntil = stats[year]['last until'][ind]
            if (lastUntil == 'P1' || lastUntil == 'P2' || lastUntil == 'P3' || lastUntil == 'P4'){overallStats['Playoffs'][ind] += 1}
            if (lastUntil == 'P2' || lastUntil == 'P3' || lastUntil == 'P4'){overallStats['Semifinals'][ind] += 1}
            if (lastUntil == 'P3' || lastUntil == 'P4'){overallStats['Finals'][ind] += 1}
            if (stats[year]['seed'][ind] == 1 || stats[year]['seed'][ind] == 2){overallStats['Byes'][ind] += 1}
            
        }//for name
        const tempList = [['high scores','Yearly High Scores'],['low scores','Yearly Low Scores'],['pts for','Most Pts Awards'],
        ['low pts for','Fewest Pts Awards'],['pts against','Most Pts Allowed Awards'],['low pts against','Fewest Pts Allowed Awards'],
        ['best record','Best Record Awards'],['worst record','Worst Record Awards']
        ]
        for(const item of tempList){
            for(const person of awards[year][item[0]][1]){
                overallStats[item[1]][person] += 1
            }
        }
    }//for year
    
    for(const name of vars.allNames){
        const ind = name
        overallStats['Reg Season Pts'][ind] = pts[ind]
        overallStats['Reg Season Pts/Gm'][ind] = pts[ind]/Math.max(1,games[ind])
        overallStats['Reg Season Pts Allowed'][ind] = ptsAllowed[ind]
        overallStats['Reg Season Pts Allowed/Gm'][ind] = ptsAllowed[ind]/Math.max(1,games[ind])
        if (std[ind].length>0){overallStats['pts STD'][ind] = std[ind].reduce((a,b)=>a+b)/std[ind].length}
        else{overallStats['pts STD'][ind] = 0}
    }
    //matchup table
    let matchupTable = {}
    for(const name of vars.allNames){
        matchupTable[name] = {}
        for(const name2 of vars.allNames){
            matchupTable[name][name2] = [0,0,0]
        }
    }
    for(const year in stats){
        for(const name1 in stats[year]['ind records']){
            for(const name2 in stats[year]['ind records'][name1]){
                for(let i=0;i<3;i++){
                    matchupTable[name1][name2][i] += stats[year]['ind records'][name1][name2][i]
                }
            }
        }
    }
                    

    //skipped because I think it is just an output, should be done in a different spot


    const misc = input['misc']
    let allPts = []
    for (const year in misc){
        const val = misc[year]['regPoints']
        allPts = allPts.concat(val)
    }
    const ptMean = allPts.reduce((a,b)=>a+b)/allPts.length
    const ptSTD = StandardDeviation(allPts)
    const ptMed = findMedian(allPts)
    overallStats['point stats'] = {'mean':ptMean,'median':ptMed,'stdev':ptSTD}

    return {'overallStats':overallStats,'matchupTable':matchupTable}


}