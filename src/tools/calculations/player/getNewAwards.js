import { SortNRank } from "../other"


export function getNewAwards(vars,input){
    const allProj = input['allProj']
    let awards = []
    const poses = ['QB','RB','WR','TE','D/ST','K']
    const na1 = (line,item) =>{
        if(!line.didStart){return null}
        return {'value':line[item.keyID],'actual':line.actual,'NFLName':line.NFLName,'team':line.team,'week':line.week,'year':line.year}
    }
    const na2 = (line,item) =>{
        if((!line.didStart)||line.outcome!=='L'){return null}
        return {'value':line[item.keyID],'NFLName':line.NFLName,'team':line.team,'week':line.week,'year':line.year}
    }
    const list = [
        {'id': 'na1', 'title': 'A Bold Move', 
            'description': 'The lowest projection to be started', 'func':na1,
            'keyID': 'projected','pos':'Each','MinMax': 'min', 'meta': ['NFLName','actual','team','week','year'], 'agg': null},
        {'id': 'na2', 'title': 'I Did My Part', 
            'description': 'The highest individual score to be defeated', 'func':na2,
            'keyID': 'projected','pos':'Each','MinMax': 'max', 'meta': ['NFLName','team','week','year'], 'agg': null},
        ]

        for (const item of list){
            const vals = []
            const onlyVals = []
            let valsEach = {}
            let onlyValsEach = {}
            for(const pos of poses){valsEach[pos]=[];onlyValsEach[pos]=[]}
            for (const line of allProj){
                const pos = line.pos
                const val = item.func(line,item)
                if(val===null){continue}
                vals.push(val)
                onlyVals.push(val['value'])
                if(item.pos==='Each'){
                valsEach[pos].push(val)
                onlyValsEach[pos].push(val['value'])
                }
            }
            awards.push({'title':item.title,'desc':item.description,'values':SortNRank(onlyVals,vals,item.MinMax),'meta':item.meta,'id':item.id})
            if(item.pos==='Each'){
                for(const pos of poses){
                    awards.push({'title':item.title+' ('+pos+')','desc':item.description+' ('+pos+')','values':SortNRank(onlyValsEach[pos],valsEach[pos],item.MinMax),'meta':item.meta,'id':item.id+pos})
                }
            }
        }
    return awards
    }