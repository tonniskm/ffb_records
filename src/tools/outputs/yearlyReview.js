import { useLayoutEffect, useRef, useState } from "react"
import { NamePicker } from "./misc/misc"
import { ChooseNames, Round, UnpackRawLine } from "../calculations/other"


export const YearlyReview = ({pickMacro,vars,records})=>{
    const [selectedYear,setSelectedYear] = useState(vars.activeYears[vars.activeYears.length-1])
    const [focusName,setFocusName] = useState('All')
    const stickyRef = useRef(null)
    const [stickyHeight,setStickyHeight] = useState(0)
    const pickName = <NamePicker title={'Filter By Name: '}  showAll={true} selecting={setFocusName} curval={focusName} options={vars.activeNames} key={'1name'}></NamePicker>
    const pickYear = <NamePicker title={'Year: '} showAll={false} selecting={setSelectedYear} curval={selectedYear} options={vars.activeYears} key={'yearp'}></NamePicker>
    const relevantChoices=[pickMacro,pickYear,pickName]
    useLayoutEffect(() => {
        if (stickyRef.current) {
            setStickyHeight(stickyRef.current.offsetHeight)
        }
    }, []) // empty dependency ensures this runs once after first layout
    let nyAwards = records.nyAwards
    const pAwards = records.playerStats
    let out 
    const regIsComplete = records.isComplete.reg || selectedYear != vars.activeYears[vars.activeYears.length-1]

    function SummaryLine(mine,vals,minmax,valueKey='value'){
        let sorted = [...vals].sort((a,b)=>a[valueKey]-b[valueKey])
        if(minmax!=='min'){sorted=sorted.reverse()}
        const rank = sorted.findIndex(x=>x[valueKey]===mine) + 1
        const total = vals.length
        // if(total===5&&mine===1){console.log({mine,vals,minmax,rank})}
        const perc =  Math.round(10000-10000*(rank-1)/Math.max(1,(total-1)))/100
        return(
            `${rank} of ${total} ${regIsComplete?'':' pace '}(${perc}%)`
        )
    }

    const allYearScores = records.yearAwards.filter(x=>x.id==='ya1')[0]['values']
    const chosenYearScore = allYearScores.filter(x=>x.year==selectedYear)[0]
    const yearComp = <div key={'yearComp'}>
            <p key={'yearComp1'}>{selectedYear}: {Round(chosenYearScore.value,2)} pts/game</p>
            <p key={'yearComp2'}>{SummaryLine(chosenYearScore.value,allYearScores,'max')}</p>
        </div>
    let checkAward = nyAwards[0].values.concat(records.incompleteAwards[0].values)
    const eligibleNames = [...new Set(checkAward.filter(x=>x.year==selectedYear).map(x=>x.name))]
    const names = ChooseNames(vars,selectedYear).filter(x=>eligibleNames.includes(x))
    let nameHeaders = []
    for (const name of names){
        if (!vars.activeNames.includes(name)){continue}
        if(focusName!=='All'&&name!==focusName){continue}
        nameHeaders.push(<div className="headerCell" key={'head'+name}><p key={'head1'+name}>{name}</p></div>)
    }
    const headerRow = <div className="tableRow headerRow" style={{top:stickyHeight,zIndex:4}} key={'headrow'}>
        <div className="headerCell headerRow" style={{top:stickyHeight,left:0,zIndex:4}} key={'headrow1'}><p key={'headrow2'}>Record</p></div>
        {nameHeaders}
    </div>
    let rows = []
    const items = [
        {name:'Pts/game',id:'nya7',table:nyAwards},
        {name:'Pts allowed/game',id:'nya9',table:nyAwards},
        {name:'Win Rate',id:'nya1',table:nyAwards},
        {name:'Unique Players Owned',id:'pa45',table:pAwards,players:true},
        {name:'Unique Players Started',id:'pa47',table:pAwards,players:true}
    ]
    for (const item of items){
        if (item.players&&parseInt(selectedYear)<2018){continue}
        let row = []
        let vals = item.table.filter(x=>x.id===item.id)[0]['values']
        if(records.incompleteAwards.map(x=>x.id).includes(item.id)&&!regIsComplete){vals = vals.concat(records.incompleteAwards.filter(x=>x.id===item.id)[0]['values'])}
        try{
            for (const name of names){
                if (!vars.activeNames.includes(name)){continue}
                if(focusName!=='All'&&name!==focusName){continue}
                const mine = vals.filter(x=>x.name===name&&x.year==selectedYear)[0].value
                const myVals = vals.filter(x=>x.name===name)
                const yearVals = vals.filter(x=>x.year==selectedYear)
                row.push(<div className="tableCell" key={'row'+item.id+name}>
                    <p className="txt" key={'row1'+item.id+name}>{Round(mine,2)}</p>
                    <p className="txt" key={'row2'+item.id+name}>All: {SummaryLine(mine,vals,'max')}</p>
                    <p className="txt" key={'row3'+item.id+name}>Me: {SummaryLine(mine,myVals,'max')}</p>
                    <p className="txt" key={'row4'+item.id+name}>Year: {SummaryLine(mine,yearVals,'max')}</p>
                    </div>)
            }
            rows.push(<div className="tableRow" key={'trow'+item.id}><div className="headerCell headerRow" style={{left:0,zIndex:3}} key={'trow1'+item.id}>
                <p className="txt" key={'trow2'+item.id}>{item.name}{(regIsComplete?"":' (pace)')}</p></div>{row}</div>)

        }catch(e){console.log(item,vals,records.incompleteAwards,e)}
    }



    const table = <div className="tableContainer" key={'tcont'}>
        {headerRow}
        {rows}
    </div>
    out = [<div className='topContainer' key={'topcontsum'} ref={stickyRef}>
        <div className='buttonsContainer' key={'butcont'}>
            {relevantChoices}
        </div>  
    </div>,
    <div key={'bottom'}>{yearComp}
        {table}
        </div>
        ]
    return(out)
}