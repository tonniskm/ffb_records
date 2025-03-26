import { DictRanks } from "../other"



export function getNameAwards(vars,input){
    const overallStats = input.overall

    let awards = []
    //awardshow 
    //looks at totals
    //[name,desc,key,high/low]
    const list = [
        ['The Amazing Rajan','The Most Rings','Championships'],
        ['The Camel','The Most Last Place Finishes','Dewey Does'],
        ['Most Points','The Most Regular Season Points Scored','Reg Season Pts'],
        ['Most Average Points','The Most Points Per Game Played','Reg Season Pts/Gm'],
        ['Fewest Average Points','The Fewest Points Per Game Played','Reg Season Pts/Gm','min'],
        ['Swiss Cheese','The most points allowed per game','Reg Season Pts Allowed/Gm'],
        ['Stonewall Jackson','The fewest points allowed per game','Reg Season Pts Allowed/Gm','min'],
        ['High Score!','The most weekly high scores','Weekly High Scores'],
        ['I concede!','The most weekly low scores','Weekly Low Scores'],
        ['Peyton Manning','The best win rate','pct'],
        ['Bantha Fodder','The worst win rate','pct','min'],
        ['Perfectly Balanced','The most ties','T'],
        ['Super High Score!','The most yearly high scores','Yearly High Scores'],
        ['Pathetic','The most yearly low scores','Yearly Low Scores'],
        ['Scrapin By','The most wins by <6 points','Close W'],
        ['So Close!','The most losses by <6 points','Close L'],
        ['At Least You Tried','The most losses while scoring >100 points','L Over 100'],
        ['The Blind Squirrel','The most wins while scoring <80 points','W Under 80'],
        ['The Buffalo Bills','The most Super Bowl losses','na','sp1'],
        ['Always on Top','The most times having the most points in a season','Most Pts Awards'],
        ['Are you a Kluesener?','The most time having the fewest points in a season','Fewest Pts Awards'],
        ['Never Plays against Kevin','The most times having the fewest points allowed','Fewest Pts Allowed Awards'],
        ["Always in Kevin's Division",'The most times having the most points allowed','Most Pts Allowed Awards'],
        ['Friendship Speech abuser','The player with the most heart (wins games without scoring points)','na','sp2'],
        ['Consistent','The player with the most consistent scoring','pts STD','min'],
        ['Spray and Pray','The player with the most inconsistent scoring','pts STD'],
        ["Can't Break Through",'The worst high score','High Score','min'],
        ['Resilient','The best low score','Low Score'],
        ['Gentle Ben',"The most you've ever won by is the smallest",'Biggest W'],
        ['No pushover',"The most you've ever lost by is the smallest",'Biggest L','min'],
        ['Pick on Someone Your Own Size!','The player who has played vs low score for the week the most','Beat Low Score'],
        ['They Never Make it Easy','The player who has played vs low score for the week the least','Beat Low Score','min'],
        ['Gate Keeping','The player who has beaten the 2nd highest score the most','Beat 2nd'],
        ["Anyone Can Win",'The player who has lost to the 2nd worst score the most','Lost to 2nd Last'],
        ['Life is Unfair','The Player who has played vs the high score the most','Lost to High Score'],
        ['Life is Fair','The player who has played vs the high score the least','Lost to High Score','min'],
        ['Matchup Proof','The best record vs the median score','Pct vs Mid'],
        ['Needs a Good Matchup','The worst record vs the median score','Pct vs Mid','min']
    ]
    for(const item of list){
        let vals = {}
        for(const name of vars.allNames){
            const ind = name
            if(vars.lameDucks.includes(name)){continue}
            if(item[3]=='sp1'){//bills
                vals[name] = overallStats['Finals'][ind]-overallStats['Championships'][ind]
            }
            else if(item[3]=='sp2'){//friend
                vals[name] = overallStats['pct'][ind] * overallStats['Reg Season Pts'][ind] / Math.max(1,overallStats['Reg Season Pts Allowed'][ind])
            }else{
                vals[name] = overallStats[item[2]][name]
            }
        }
        awards.push({'title':item[0],'desc':item[1],'ranks':DictRanks(vals,item[3]),'values':vals})
    }
     
    return awards
}