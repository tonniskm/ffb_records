import { DictRanks, SortNRank } from "../other"



export function getNameAwards(vars,input){
    const overallStats = input.overall

    let awards = []
    //awardshow 
    //looks at totals
    //[name,desc,key,high/low]
    const list = [
            {'id': 'na1', 'title': 'The Amazing Rajan', 'description': 'The Most Rings', 'keyID': 'Championships', 'MinMax': null},
            {'id': 'na2', 'title': 'The Camel', 'description': 'The Most Last Place Finishes', 'keyID': 'Dewey Does', 'MinMax': null},
            {'id': 'na3', 'title': 'Most Points', 'description': 'The Most Regular Season Points Scored', 'keyID': 'Reg Season Pts', 'MinMax': null},
            {'id': 'na4', 'title': 'Most Average Points', 'description': 'The Most Points Per Game Played', 'keyID': 'Reg Season Pts/Gm', 'MinMax': null},
            {'id': 'na5', 'title': 'Fewest Average Points', 'description': 'The Fewest Points Per Game Played', 'keyID': 'Reg Season Pts/Gm', 'MinMax': 'min'},
            {'id': 'na6', 'title': 'Swiss Cheese', 'description': 'The most points allowed per game', 'keyID': 'Reg Season Pts Allowed/Gm', 'MinMax': null},
            {'id': 'na7', 'title': 'Stonewall Jackson', 'description': 'The fewest points allowed per game', 'keyID': 'Reg Season Pts Allowed/Gm', 'MinMax': 'min'},
            {'id': 'na8', 'title': 'High Score!', 'description': 'The most weekly high scores', 'keyID': 'Weekly High Scores', 'MinMax': null},
            {'id': 'na9', 'title': 'I concede!', 'description': 'The most weekly low scores', 'keyID': 'Weekly Low Scores', 'MinMax': null},
            {'id': 'na10', 'title': 'Peyton Manning', 'description': 'The best win rate', 'keyID': 'pct', 'MinMax': null},
            {'id': 'na11', 'title': 'Bantha Fodder', 'description': 'The worst win rate', 'keyID': 'pct', 'MinMax': 'min'},
            {'id': 'na12', 'title': 'Perfectly Balanced', 'description': 'The most ties', 'keyID': 'T', 'MinMax': null},
            {'id': 'na13', 'title': 'Super High Score!', 'description': 'The most years with the most high scores', 'keyID': 'Most Weekly High Scores', 'MinMax': null},
            {'id': 'na14', 'title': 'Pathetic', 'description': 'The most years with the most low scores', 'keyID': 'Most Weekly Low Scores', 'MinMax': null},
            {'id': 'na13.1', 'title': 'Always High Score', 'description': 'The most years with the high score', 'keyID': 'Yearly High Scores', 'MinMax': null},
            {'id': 'na14.1', 'title': 'Always Pathetic', 'description': 'The most years with the low scores', 'keyID': 'Yearly Low Scores', 'MinMax': null},
            {'id': 'na15', 'title': 'Scrapin By', 'description': 'The most wins by <6 points', 'keyID': 'Close W', 'MinMax': null},
            {'id': 'na16', 'title': 'So Close!', 'description': 'The most losses by <6 points', 'keyID': 'Close L', 'MinMax': null},
            {'id': 'na17', 'title': 'At Least You Tried', 'description': 'The most losses while scoring >100 points', 'keyID': 'L Over 100', 'MinMax': null},
            {'id': 'na18', 'title': 'The Blind Squirrel', 'description': 'The most wins while scoring <80 points', 'keyID': 'W Under 80', 'MinMax': null},
            {'id': 'na19', 'title': 'The Buffalo Bills', 'description': 'The most Super Bowl losses', 'keyID': 'na', 'MinMax': null,'sp':'sp1'},
            {'id': 'na20', 'title': 'Always on Top', 'description': 'The most times having the most points in a season', 'keyID': 'Most Pts Awards', 'MinMax': null},
            {'id': 'na21', 'title': 'Are you a Kluesener?', 'description': 'The most time having the fewest points in a season', 'keyID': 'Fewest Pts Awards', 'MinMax': null},
            {'id': 'na22', 'title': 'Never Plays against Kevin', 'description': 'The most times having the fewest points allowed', 'keyID': 'Fewest Pts Allowed Awards', 'MinMax': null},
            {'id': 'na23', 'title': "Always in Kevin's Division", 'description': 'The most times having the most points allowed', 'keyID': 'Most Pts Allowed Awards', 'MinMax': null},
            {'id': 'na24', 'title': 'Friendship Speech abuser', 'description': 'The player with the most heart (wins games without scoring points)', 'keyID': 'na', 'MinMax': null,'sp':'sp2'},
            {'id': 'na25', 'title': 'Consistent', 'description': 'The player with the most consistent scoring', 'keyID': 'pts STD', 'MinMax': 'min'},
            {'id': 'na26', 'title': 'Spray and Pray', 'description': 'The player with the most inconsistent scoring', 'keyID': 'pts STD', 'MinMax': null},
            {'id': 'na27', 'title': "Can't Break Through", 'description': 'The worst high score', 'keyID': 'High Score', 'MinMax': 'min'},
            {'id': 'na28', 'title': 'Resilient', 'description': 'The best low score', 'keyID': 'Low Score', 'MinMax': null},
            {'id': 'na29', 'title': 'Gentle Ben', 'description': "The most you've ever won by is the smallest", 'keyID': 'Biggest W', 'MinMax': 'min'},
            {'id': 'na30', 'title': 'No pushover', 'description': "The most you've ever lost by is the smallest", 'keyID': 'Biggest L', 'MinMax': 'min'},
            {'id': 'na31', 'title': 'Pick on Someone Your Own Size!', 'description': 'The player who has played vs low score for the week the most', 'keyID': 'Beat Low Score', 'MinMax': null},
            {'id': 'na32', 'title': 'They Never Make it Easy', 'description': 'The player who has played vs low score for the week the least', 'keyID': 'Beat Low Score', 'MinMax': 'min'},
            {'id': 'na33', 'title': 'Gate Keeping', 'description': 'The player who has beaten the 2nd highest score the most', 'keyID': 'Beat 2nd', 'MinMax': null},
            {'id': 'na34', 'title': 'Anyone Can Win', 'description': 'The player who has lost to the 2nd worst score the most', 'keyID': 'Lost to 2nd Last', 'MinMax': null},
            {'id': 'na35', 'title': 'Life is Unfair', 'description': 'The Player who has played vs the high score the most', 'keyID': 'Lost to High Score', 'MinMax': null},
            {'id': 'na36', 'title': 'Life is Fair', 'description': 'The player who has played vs the high score the least', 'keyID': 'Lost to High Score', 'MinMax': 'min'},
            {'id': 'na37', 'title': 'Matchup Proof', 'description': 'The best record vs the median score', 'keyID': 'Pct vs Mid', 'MinMax': null},
            {'id': 'na38', 'title': 'Needs a Good Matchup', 'description': 'The worst record vs the median score', 'keyID': 'Pct vs Mid', 'MinMax': 'min'},
            {'id': 'na39', 'title': "If You're Not First You're Last", 'description': 'The player who has had the 2nd highest score and lost the most', 'keyID': 'Lost as 2nd', 'MinMax': null},
            {'id': 'na40', 'title': "If You're Not Last You're First", 'description': 'The player who has had the 2nd lowest score and won the most', 'keyID': 'Won as 2nd Last', 'MinMax': null},
        
    ]
    for(const item of list){
        let vals = []
        let onlyVals = []
        for(const name of vars.allNames){
            const ind = name
            if(vars.lameDucks.includes(name)){continue}
            let value,onlyValue
            if(item.sp=='sp1'){//bills
                // vals[name] = overallStats['Finals'][ind]-overallStats['Championships'][ind]
                onlyValue = overallStats['Finals'][ind]-overallStats['Championships'][ind]
            }
            else if(item.sp=='sp2'){//friend
                // vals[name] = overallStats['pct'][ind] * overallStats['Reg Season Pts'][ind] / Math.max(1,overallStats['Reg Season Pts Allowed'][ind])
                onlyValue = overallStats['pct'][ind] * overallStats['Reg Season Pts'][ind] / Math.max(1,overallStats['Reg Season Pts Allowed'][ind])
            }else{
                // vals[name] = overallStats[item[2]][name]
                onlyValue = overallStats[item.keyID][name]
            }
            onlyVals.push(onlyValue)
            vals.push({'value':onlyValue,'name':name})
        }
        awards.push({'id':item.id,'title':item.title,'desc':item.description,'values':SortNRank(onlyVals,vals,item.MinMax),'meta':['name']})
    }
     
    return awards
}