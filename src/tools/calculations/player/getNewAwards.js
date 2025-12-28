import { SortNRank } from "../other"


export function getNewAwards(vars,input){
    const allProj = input['allProj']
    let awards = []
    const poses = ['QB','RB','WR','TE','D/ST','K']
    const list = [
        {'id': 'na1', 'title': 'Placeholder', 
            'description': 'The lowest projection to be started', 
            'keyID': 'projected','pos':'Each','MinMax': 'min', 'meta': ['NFLName','actual','team','week','year'], 'agg': null},
        ]

        for (const item of list){
            const vals = []
            const onlyVals = []
            let valsEach = {}
            let onlyValsEach = {}
            for(const pos of poses){valsEach[pos]=[];onlyValsEach[pos]=[]}
            for (const line of allProj){
                if(!line.didStart){continue}
                const pos = line.pos
                const val = {'value':line[item.keyID],'actual':line.actual,'NFLName':line.NFLName,'team':line.team,'week':line.week,'year':line.year}
                vals.push(val)
                onlyVals.push(line[item.keyID])
                valsEach[pos].push(val)
                onlyValsEach[pos].push(line[item.keyID])
            }
            awards.push({'title':item.title,'desc':item.description,'values':SortNRank(onlyVals,vals,item.MinMax),'meta':item.meta,'id':item.id})
            if(item.pos=='Each'){
                for(const pos of poses){
                    awards.push({'title':item.title+' ('+pos+')','desc':item.description+' ('+pos+')','values':SortNRank(onlyValsEach[pos],valsEach[pos],item.MinMax),'meta':item.meta,'id':item.id+pos})
                }
            }
        }
    return awards
    }