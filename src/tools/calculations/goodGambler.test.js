/** @jest-environment node */
import { deserialize, serialize } from "v8"
import { getYearStatsProj } from "./raw2year/getYearStatsProj"
import { getOverallStatsProj } from "./sum2overall/getOverallStatsProj"
import { getAwardsProj } from "./sum2overall/getAwardsProj"
import { CompareRecords } from "./compareRecords"
import { awardLists } from "../constants/constants"

jest.mock("./getNames",()=>({
    getNames:()=>['t0','Alice','Bob','Idle']
}))

beforeAll(()=>{
    if(!global.structuredClone){
        global.structuredClone = value=>deserialize(serialize(value))
    }
})

const vars = {leagueID:'test',allNames:['t0','Alice','Bob','Idle'],lameDucks:['t0']}

function season(games,year=2026){
    const tables = {}
    for(const key of ['oppos','types','outcomes','scores','oppoScores']){
        tables[key] = {[year]:Object.fromEntries(vars.allNames.map(name=>[name,{}]))}
    }
    const proj = []
    games.forEach(([a,b,pa,pb,type='REG'],index)=>{
        const week = index+1
        for(const [name,opponent,score,opponentScore,projection,id] of [
            ['Alice','Bob',a,b,pa,1],['Bob','Alice',b,a,pb,2]
        ]){
            tables.oppos[year][name][week] = opponent
            tables.types[year][name][week] = type
            tables.outcomes[year][name][week] = score>opponentScore?'W':score<opponentScore?'L':'TIE'
            tables.scores[year][name][week] = score
            tables.oppoScores[year][name][week] = opponentScore
            if(projection!==undefined){
                proj.push({Week:week,PlayerName:name,PlayerFantasyTeam:id,PlayerScoreActual:score,
                    PlayerScoreProj:projection,PlayerRosterSlot:'QB',Position:'QB'})
                proj.push({Week:week,PlayerName:name+' bench',PlayerFantasyTeam:id,
                    PlayerScoreProj:1000,PlayerRosterSlot:'Bench',Position:'QB'})
                proj.push({Week:week,PlayerName:name+' IR',PlayerFantasyTeam:id,
                    PlayerScoreProj:1000,PlayerRosterSlot:'IR',Position:'QB'})
            }
        }
    })
    return getYearStatsProj(vars,{[year]:[{Week:games.length}]},{[year]:proj},{},year,tables)
}

test.each([
    [120,110,100,100,'W'],
    [110,100,120,100,'L'],
    [90,100,80,100,'W'],
    [90,100,100,100,'L'],
    [100,100,90,100,'W'],
    [110,100,110,100,'T'],
    [100.1,90,110.1,100,'T']
])('compares actual and projected margins for %s-%s versus %s-%s',(a,b,pa,pb,result)=>{
    const {scores} = season([[a,b,pa,pb]])
    const opposite = {W:'L',L:'W',T:'T'}
    for(const outcome of ['W','L','T']){
        expect(scores['Good Gambler '+outcome].Alice).toBe(outcome===result?1:0)
        expect(scores['Good Gambler '+outcome].Bob).toBe(outcome===opposite[result]?1:0)
    }
})

test('includes playoffs but skips lame games, byes, and missing projections',()=>{
    const {scores} = season([
        [120,100,100,100,'P1'],
        [120,100,100,100,'lame'],
        [120,100,100,100,'BYE'],
        [120,100,undefined,100],
        [120,100,100,undefined]
    ])
    expect(scores['Good Gambler W'].Alice).toBe(1)
    expect(scores['Good Gambler L'].Bob).toBe(1)
    expect(scores['Good Gambler T'].Alice).toBe(0)
})

test('aggregates W-L-T across seasons and emits a ranked, displayable projection award',()=>{
    const yearProj = {
        2025:season([[90,100,80,100],[110,100,120,100]],2025),
        2026:season([[110,100,110,100],[120,100,100,100]])
    }
    const overallProj = getOverallStatsProj(vars,{yearProj})
    expect(overallProj['Good Gambler'].Alice).toEqual({value:0.625,record:[2,1,1]})
    expect(overallProj['Good Gambler'].Bob).toEqual({value:0.375,record:[1,2,1]})
    const award = getAwardsProj(vars,{yearProj,overallProj}).find(item=>item.title==='Good Gambler')
    expect(award.meta).toEqual(['name'])
    expect(award.values).toEqual([
        expect.objectContaining({name:'Alice',value:0.625,rank:1}),
        expect.objectContaining({name:'Bob',value:0.375,rank:2})
    ])
    expect(award.values.every(line=>line.record===undefined)).toBe(true)
    expect(awardLists.projRelated).toContain('Good Gambler')
})

test('recent updates identifies a change of leader by person',()=>{
    function snapshot(games){
        const yearProj = {2026:season(games)}
        const overallProj = getOverallStatsProj(vars,{yearProj})
        const award = getAwardsProj(vars,{yearProj,overallProj}).find(item=>item.title==='Good Gambler')
        return {
            nameAwards:[],gameAwards:[],weekAwards:[],yearAwards:[],nyAwards:[],
            projAwards:[award],playerStats:[],draftAwards:[],teamAwards:[],fiddleAwards:[],
            overall:{},fantasyTeams:{}
        }
    }
    const old = snapshot([[120,100,100,100]])
    const current = snapshot([[120,100,100,100],[110,100,120,100],[90,100,100,100]])
    const changes = CompareRecords(current,old).records
    expect(changes).toHaveLength(1)
    expect(changes[0].was.winner).toEqual(['Alice'])
    expect(changes[0].now.winner).toEqual(['Bob'])
})
