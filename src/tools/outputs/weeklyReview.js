import { useState } from "react"
import { ChooseNames, Round, UnpackRawLine } from "../calculations/other"
import { NamePicker } from "./misc/misc"
import '../../styles/weeklyReview.css'



export const  WeeklyReview = ({pickMacro,raw,proj,records,vars,awards})=>{
    // pickMacro={pickMacro} raw={raw} proj={proj} records={records} vars={vars} awards={allAwards}></WeeklyReview>
    
    const [week,setWeek] = useState(vars.activeWeeks[vars.activeWeeks.length-1])
    const [year,setYear] = useState(vars.activeYears[vars.activeYears.length-1])
    function SummaryLine(mine,vals,minmax){
        let sorted = [...vals].sort((a,b)=>a.value-b.value)
        if(minmax!=='min'){sorted=sorted.reverse()}
        const rank = sorted.findIndex(x=>x.value===mine) + 1
        const total = vals.length
        if(total===5&&mine===1){console.log({mine,vals,minmax,rank})}
        const perc =  Math.round(10000-10000*rank/total)/100
        return([
            <p className="smallText" >{rank} of {total} ({perc}%)</p>
        ])
    }
try{ 

    const pickYear = <NamePicker title={'Year: '} showAll={false} selecting={setYear} curval={year} options={vars.activeYears} key={'wry'}></NamePicker>
    const pickWeek = <NamePicker title={'Week: '} showAll={false} selecting={setWeek} curval={week} options={vars.activeWeeks} key={'wrw'}></NamePicker>

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
        weekOverview.push(<div>Weekly Average Score: {Round(thisWeek[0].value)}</div>)
        weekOverview.push(<div>{SummaryLine(thisWeek[0].value,bestWeek,'max')}</div>)
    }else{
        // weekOverview.push(<p>Weekly Average Scores Only Considered if everyone plays.</p>)
    }

    for(const game of rawGames){
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
        for(const [ind,item] of ['winner','loser'].entries()){
            let winStats = []
            // let topLineStats = []
            let name,score
            if(winner==='TIE'){name=teams[ind];score=scores[ind]}
            else{name=WLteams[ind];score=WLscores[ind]}
            // console.log({name,score,winner,loser,ind})
            const topLineStats = [
            <p className="bigText">{name}</p>,
            <p >{score}</p>,
            <p className="titleText">Score</p>,
            SummaryLine(score,highScores,'max'),
            SummaryLine(score,highScores.filter(x=>x.name===name),'max')
            ]
            if(winner!=='TIE'){
                const winnerStats = [
                    {'title':{'winner':'Biggest Blowout Win','loser':'Biggest Blowout Loss'},'award':beatdown,'val':dif,'MinMax':'max'},
                    {'title':{'winner':'Highest Score Defeated','loser':'Highest Score Lost With'},'award':takedown,'val':sLose,'MinMax':'max'},
                    {'title':{'winner':'Lowest Winning Score','loser':'Lowest Score Lost To'},'award':lowWin,'val':sWin,'MinMax':'min'}
                ]
                for(const [i,stat] of winnerStats.entries()){
                    winStats.push(<p className="titleText">{stat.title[item]}</p>)
                    // winStats.push(<p>{SummaryLine(stat.val,stat.award[item])}</p>)
                    winStats.push(<div className="smallText">{SummaryLine(stat.val,stat.award[item].filter(x=>x.name===name),stat.MinMax)}</div>)
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
            <p className="titleText">High Combined Score: {Round(sWin+sLose)}</p>,
            <div className="smallText">{SummaryLine(sWin+sLose,shootout,'max')}</div>
        ])
        gamesOut.push(
            <div className="game">
                <div className="players">{playerCards}</div>
                {gameCard}
            </div>
        )
    }
    gamesOut = <div className="container">
        {gamesOut}
    </div>
    return(<div>
        {pickMacro}
        {pickYear}
        {pickWeek}
        {weekOverview}
        {gamesOut}
        </div>
        )
}catch(e){console.log(e)}

}