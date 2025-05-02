import { useState } from "react"
import { ChooseNames, Round, UnpackRawLine } from "../calculations/other"
import { expandProj, NamePicker } from "./misc/misc"
import '../../styles/weeklyReview.css'
import { poses } from "../constants/constants"



export const  WeeklyReview = ({pickMacro,raw,proj,records,vars,awards})=>{
    // pickMacro={pickMacro} raw={raw} proj={proj} records={records} vars={vars} awards={allAwards}></WeeklyReview>
    
    const [week,setWeek] = useState(vars.activeWeeks[vars.activeWeeks.length-1])
    const [year,setYear] = useState(vars.activeYears[vars.activeYears.length-1])
    const [focusName,setFocusName] = useState('All')

    function SummaryLine(mine,vals,minmax,valueKey='value'){
        let sorted = [...vals].sort((a,b)=>a[valueKey]-b[valueKey])
        if(minmax!=='min'){sorted=sorted.reverse()}
        const rank = sorted.findIndex(x=>x[valueKey]===mine) + 1
        const total = vals.length
        // if(total===5&&mine===1){console.log({mine,vals,minmax,rank})}
        const perc =  Math.round(10000-10000*rank/total)/100
        return([
            <p className="smallText" >{rank} of {total} ({perc}%)</p>
        ])
    }
try{ 

    const pickYear = <NamePicker title={'Year: '} showAll={false} selecting={setYear} curval={year} options={vars.activeYears} key={'wry'}></NamePicker>
    const pickWeek = <NamePicker title={'Week: '} showAll={false} selecting={setWeek} curval={week} options={vars.activeWeeks} key={'wrw'}></NamePicker>
    const pickName = <NamePicker title={'Filter By Name: '} showAll={true} selecting={setFocusName} curval={focusName} options={vars.activeNames} key={'1name'}></NamePicker>
    
    const names = ChooseNames(vars,year)
    // console.log(raw[2020].filter(x=>x.Week===10))
    const rawGames = raw[year].filter(x=>x.Week==week)
    let gamesOut = []
    const highScores = awards.filter(x=>x.id==='ga6')[0].values
    const beatdown = {'winner':awards.filter(x=>x.id==='ga3')[0].values, //big blowout
        'loser':awards.filter(x=>x.id==='ga3.1')[0].values }//big blowout loss
    const takedown = {'winner':awards.filter(x=>x.id==='ga4')[0].values, // beat high score
        'loser':awards.filter(x=>x.id==='ga4.1')[0].values} //loss with high score
    const lowWin = {'winner':awards.filter(x=>x.id==='ga5')[0].values, //low win
        'loser': awards.filter(x=>x.id==='ga5.1')[0].values} // lost to low
    const shootout=awards.filter(x=>x.id==='ga1')[0].values
    const bestWeek = awards.filter(x=>x.id==='wa1')[0].values
    const thisWeek = bestWeek.filter(x=>x.year===year.toString()&&x.week==week)
    let weekOverview = []
    if(thisWeek.length>0){
        weekOverview.push(<div key={'avg'}>Weekly Average Score: {Round(thisWeek[0].value)}</div>)
        weekOverview.push(<div key={'avg summary'}>{SummaryLine(thisWeek[0].value,bestWeek,'max','value')}</div>)
    }else{
        // weekOverview.push(<p>Weekly Average Scores Only Considered if everyone plays.</p>)
    }

    for(const [gameNo,game] of rawGames.entries()){
        let {week,t1,score1,t2,score2,winner,type} = UnpackRawLine(game,names)
        if(type==='lame'||t2==='BYE'){continue}
        let sWin,sLose,loser
        winner==t1?sWin=score1:sWin=score2
        winner==t1?sLose=score2:sLose=score1
        winner==t1?loser=t2:loser=t1
        let playerCards = []
        // let gameCard = []
        const teams = [t1,t2]
        const WLteams = [winner,loser]
        const WLscores = [sWin,sLose]
        const scores = [score1,score2]
        const dif = Math.max(score1-score2,score2-score1)
        let name,oppo
        if(!teams.includes(focusName)&&focusName!=='All'){continue}
        for(const [ind,item] of ['winner','loser'].entries()){
            let winStats = []
            // let topLineStats = []
            let score
            if(winner==='TIE'){name=teams[ind];score=scores[ind]}
            else{name=WLteams[ind];score=WLscores[ind]}
            oppo = teams.filter(x=>x!==name)[0]
            const oppoScore = scores.filter(x=>x!==score)[0]
            // console.log({name,score,winner,loser,ind})
            const topLineStats = [
            <p className="bigText" key={'tl'+name}>{name}</p>,
            <p className="bigText" key={'tl1'+name}>{score}</p>,
            <p className="titleText" key={'tl2'+name}>Score</p>,
            <div className="smallText" key={'tl3'+name}>vs all: {SummaryLine(score,highScores,'max','value')[0].props.children.join("")}</div>,
            <div className="smallText" key={'tl4'+name}>vs self: {SummaryLine(score,highScores.filter(x=>x.name===name),'max','value')[0].props.children.join("")}</div>,
            <div className="smallText" key={'tl5'+name}>oppo vs self: {SummaryLine(oppoScore,highScores.filter(x=>x.name===oppo),'max')[0].props.children.join("")}</div>
            ]
            if(winner!=='TIE'){
                const winnerStats = [
                    {'title':{'winner':'Biggest Blowout Win','loser':'Biggest Blowout Loss'},'award':beatdown,'val':dif,'MinMax':'max'},
                    {'title':{'winner':'Highest Score Defeated','loser':'Highest Score Lost With'},'award':takedown,'val':sLose,'MinMax':'max'},
                    {'title':{'winner':'Lowest Winning Score','loser':'Lowest Score Lost To'},'award':lowWin,'val':sWin,'MinMax':'min'}
                ]
                for(const [i,stat] of winnerStats.entries()){
                    winStats.push(<p className="titleText" key={'winstats'+i+stat}>{stat.title[item]}</p>)
                    // winStats.push(<p>{SummaryLine(stat.val,stat.award[item])}</p>)
                    winStats.push(<div className="smallText" key={'winstats2'+i+stat}>{SummaryLine(stat.val,stat.award[item].filter(x=>x.name===name),stat.MinMax,'value')}</div>)
                }
            }
            let flexStats = []
            for (const pos of poses){
                if(pos==='D/ST'){
                    winStats.push(<div className="titleText" key={'flex'}>FLEX</div>)
                    winStats=winStats.concat(flexStats)}
                const all = records.allProj.filter(x=>x.didStart)
                const allPos = all.filter(x=>x.pos===pos)
                const allMyPos = allPos.filter(x=>x.team===name)
                const allPosVsOppo = allPos.filter(x=>x.oppo===oppo)
                const myStart = allMyPos.filter(x=>x.week===week&&x.year==year).sort((a,b)=>a.actual > b.actual)
                winStats.push(<div className="titleText" key={pos}>{pos}</div>)
                for(const line of myStart){
                    if(line.slot==='FLEX'){
                        flexStats.push(<div className="midText" key={'flex1'}>{line.NFLName}, {line.actual}</div>)
                        flexStats.push(<div className="smallText" key={'flex2'}>{pos}s: {SummaryLine(line.actual,allPos,'max','actual')[0].props.children.join("")}</div>)
                        flexStats.push(<div className="smallText" key={'flex3'}>{name}'s {pos}s: {SummaryLine(line.actual,allMyPos,'max','actual')[0].props.children.join("")}</div>)
                        flexStats.push(<div className="smallText" key={'flex4'}>{pos}s vs {oppo}: {SummaryLine(line.actual,allPosVsOppo,'max','actual')[0].props.children.join("")}</div>)        
                    }else{
                        winStats.push(<div className="midText" key={line.NFLName+1}>{line.NFLName}, {line.actual}</div>)
                        winStats.push(<div className="smallText" key={line.NFLName+2}><p></p>{pos}s: {SummaryLine(line.actual,allPos,'max','actual')[0].props.children.join("")}</div>)
                        winStats.push(<div className="smallText" key={line.NFLName+3}>{name}'s {pos}s: {SummaryLine(line.actual,allMyPos,'max','actual')[0].props.children.join("")}</div>)
                        winStats.push(<div className="smallText" key={line.NFLName+4}>{pos}s vs {oppo}: {SummaryLine(line.actual,allPosVsOppo,'max','actual')[0].props.children.join("")}</div>)
                    }
                }
            }
        // console.log(topLineStats)
        playerCards.push(<div className="player" key={'pc'+ind}>{topLineStats.concat(winStats)}</div>)
        }//for winner, loser
        let gameCard = []
        if(winner!=='TIE'){gameCard=gameCard.concat([
            <p className="titleText">Margin of Victory: {Round(dif)}</p>,
            <div className="smallText">{SummaryLine(dif,beatdown.winner,'max')}</div>,
            <p className="titleText">High Score Defeated: {Round(sLose)}</p>,
            <div className="smallText">{SummaryLine(sLose,takedown.winner,'max')}</div>,
            <p className="titleText">Low Win Score: {Round(sWin)}</p>,
            <div className="smallText">{SummaryLine(sWin,lowWin.winner,'min')}</div>,
        ])}
        gameCard=gameCard.concat([
            <p className="titleText" key={'tt'+gameNo}>High Combined Score: {Round(sWin+sLose)}</p>,
            <div className="smallText" key={'tt1'+gameNo}>{SummaryLine(sWin+sLose,shootout,'max')}</div>,
            <p className="titleText" key={'mm'+gameNo}>Matchup Record: {oppo} vs {name}</p>,
            <p className="smallText" key={'mm1'+gameNo}>{records.matchupTable[oppo][name].join("-")}</p>
        ])
        gamesOut.push(
            <div className="game" key={winner}>
                <div className="players">{playerCards}</div>
                {gameCard}
            </div>
        )
    }
    gamesOut = <div className="container">
        {gamesOut}
    </div>
    return([<div className='topContainer' key={'topcontsum'}>
        <div className='buttonsContainer' key={'butcont'}>
        {pickMacro}
        {pickYear}
        {pickWeek}
        {pickName}
        </div>
        </div>,
        <div key={'div2'}>
        {weekOverview}
        {gamesOut}
        </div>]
        )
}catch(e){console.log(e)}

}