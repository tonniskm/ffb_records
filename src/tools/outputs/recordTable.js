// import { useEffect, useRef } from "react";

import { useEffect, useRef, useState } from "react"
import SuggestionInput from "./misc/suggestionPicker"
import { NamePicker, NumberPicker } from "./misc/misc"
import { awardLists, awardTypes } from "../constants/constants"



export const RecordTable = (props)=>{
    const {allAwards,scrollRef,pickMacro,vars} = props
    const {allNFLNames,allNames,activeWeeks,activeYears,activeNames} = vars
    const stickyRef = useRef(null)
    const [focusNFL,setFocusNFL] = useState('All')
    const [numToShow,setNumToShow] = useState(3) 
    const [focusWeek,setFocusWeek] = useState('All')
    const [focusName,setFocusName] = useState('All')
    const [awardType,setAwardType] = useState('All')
    const [summaryYear,setSummaryYear] = useState('All')
    const rowRef = useRef(0)
    // // const tableRef = useRef(null);
    // const pickMacro = <NamePicker title={'What to Show: '} selecting={setMacroType} curval={macroType} options={macroTypes} key={'m'}></NamePicker>
    const pickSumYear = <NamePicker title={'Year: '} freezeScroll={true} scrollInfo={{scrollRef,stickyRef,'id':'data-row','rowRef':rowRef}} showAll={true} selecting={setSummaryYear} curval={summaryYear} options={activeYears} key={'st'}></NamePicker>
    const pickAward= <NamePicker title={'Filter Records: '} showAll={true} selecting={setAwardType} curval={awardType} options={awardTypes} key={'a'}></NamePicker>
    const pickName = <NamePicker title={'Filter By Name: '} freezeScroll={true} scrollInfo={{scrollRef,stickyRef,'id':'data-row','rowRef':rowRef}} showAll={true} selecting={setFocusName} curval={focusName} options={activeNames} key={'name'}></NamePicker>
    const pickWeek = <NamePicker title={'Week: '} showAll={true} freezeScroll={true} scrollInfo={{scrollRef,stickyRef,'id':'data-row','rowRef':rowRef}} selecting={setFocusWeek} curval={focusWeek} options={activeWeeks} key={'week'}></NamePicker>
    const pickNum =  <NumberPicker selecting={setNumToShow} curval={numToShow}></NumberPicker>
    let pickNFL = [SuggestionInput(allNFLNames,focusNFL,setFocusNFL)]
    if(focusNFL!=='All'){pickNFL.push(<button key={'reset'} onClick={()=>setFocusNFL('All')}>Unfilter by NFL Name</button>)}
    const relevantChoices=[pickMacro,pickAward,pickName,pickWeek,pickSumYear,pickNFL,pickNum]


    let shownRecords
    const awardList = awardLists
    if(awardType==='All'){shownRecords = allAwards }
        if(awardType==='Most Important'){shownRecords = allAwards.filter(x=>awardList.important.includes(x.title)) }
        if(awardType==='Group Effort'){shownRecords =allAwards.filter(x=>awardList.groupEffort.includes(x.title)) }
        if(awardType==='Drop/All Related'){shownRecords = allAwards.filter(x=>awardList.daRelated.includes(x.title)) }
        if(awardType==='Projection Related'){shownRecords = allAwards.filter(x=>awardList.projRelated.includes(x.title)) }
        if(awardType==='Best/Worst Players'){shownRecords = allAwards.filter(x=>awardList.playerRelated.includes(x.title)) }
        if(awardType==='Draft'){shownRecords = allAwards.filter(x=>awardList.draftRelated.includes(x.id)) }
    const focus = {'name':focusName,'week':focusWeek,'year':summaryYear,'NFLName':focusNFL}
    useEffect(()=>{
        const container = scrollRef.current;
        const stickyHeight = stickyRef.current?.offsetHeight || 0; // Sticky header height
        const row = container.querySelector(`[data-row="${rowRef.current}"]`);
        if (!row) return;
        const rect = row.getBoundingClientRect();
        const offset = rect.top + scrollRef.current.scrollTop; 
        container.scrollTop = offset - stickyHeight - 5
    },[focus])
        
    const awards = shownRecords
    let out = [<div className="tableRow" key={'trh'} data-row={0}>
                <div className="headerCell" key={'rrh'}><p className="txt">Record</p></div>
                <div className="headerCell" key={'drh'}><p className="txt">Description</p></div>
                <div className="headerCell" key={'wrh'}><p className="txt">1st Place</p></div>
                <div className="headerCell" key={'wnrh'}><p className="txt">Holder</p></div>
                <div className="headerCell" key={'crh'}><p className="txt">Selected Comparison</p></div>
    </div>]



    function GenerateOutputList(list,type,metas,count,d){
        // const count = list.length
        let out = []
        let outLine = []
        function GeTMetaExtras(metaType,type){
            let starter, ender
             starter = ''
             ender = ''
            if(metaType=='week'){
                starter='Week '
                ender = ' '
            }
            else if(metaType=='t1'||metaType=='s1'){
                ender = ' - '
                starter = '\n'
            }
            else if(metaType=='s2'){
                // ender = '\n'
            }
            else if(metaType=='name'){ender=' '}
            else if(metaType=='record'||metaType=='recordStarting'){starter='\n'}
            else{
                ender = ' '
            }
            // if(metaType=='t1')(console.log({1:starter,2:ender}))
            return {'starter':starter,'ender':ender}
        }
        for(const line of list){
            const val = Math.round(100*line['value'])/100
            let extra =''
            if(type=='selected'){
                extra = '\n ('+line.rank+' of '+count+')'
                outLine.push(val+'\n')
            }
                else{outLine.push('')}
            for(const metaType of metas){
                if(metaType=='meta'){
                    for(const metaSubType in line.meta){
                        let message = line[metaType][metaSubType]
                        if(metaSubType=='teams'){message = message.join(", ")}
                        else if(metaSubType=='record'||metaSubType=='recordStarting'){message = line[metaSubType][0]+'-'+line[metaSubType][1]+'-'+line[metaSubType][2]}
                        let {starter,ender} = GeTMetaExtras(metaSubType,type)
                        message = starter + message + ender 
                        if(message==undefined){console.log({1:line})}
                    // if(d=='The highest total score in a game'){console.log({1:outLine,2:message})}
                        outLine[outLine.length-1] +=message
                    }
                }
                else{
                    let message = line[metaType]
                    if(metaType=='teams'){message = message.join(", ")}
                    else if(metaType=='record'||metaType=='recordStarting'){message = line[metaType][0]+'-'+line[metaType][1]+'-'+line[metaType][2]}
                    let {starter,ender} = GeTMetaExtras(metaType,type)
                    message = starter + message + ender 
                    // if(d=='The highest total score in a game'){console.log({1:outLine,2:message})}
                    outLine[outLine.length-1] +=message
                }

                // if(d=='The highest total score in a game'){console.log(outLine)}
            }//end meta
            outLine[outLine.length-1] +=extra
            // outLine.at(-1).join('+ ')
        }
        if(type=='w'){out.push(outLine.join('\n'))}else{
            out.push(outLine.join('\n-------\n'))
        }
        return out
    }


    for(const [ind,award] of awards.entries()){
        if(award.title=='Flex comparison'){continue}
        const count = award.values.length
        // const vals = []
        let winners = []
        const sorted = award.values.sort((a,b)=>a.rank-b.rank)
        const winFilter = sorted.filter(x=>x.rank==1)
        winners = GenerateOutputList(winFilter,'w',award.meta,count,award.desc)
        const r1 = Math.round(100*sorted[0].value)/100
        let myRank = []
        let filtered = sorted
        if(award.meta.includes('name')||award.meta.includes('t1')||award.meta.includes('t2')){
            filtered = filtered.filter((x)=>![x.t1,x.t2,x.name].some(x=>allNames.includes(x))||[x.t1,x.t2,x.name].includes(focus['name'])||focus['name']=='All')}
            filtered = filtered.filter(x=>!allNFLNames.includes(x.name)||x.name===focus.NFLName||focus.NFLName==='All')
        if(award.meta.includes('week')){filtered = filtered.filter((x)=>x.week==focus['week']||focus['week']=='All')}
        if(award.meta.includes('year')){filtered = filtered.filter((x)=>x.year==focus['year']||focus['year']=='All')}
        filtered = filtered.filter(x=>x.rank!=1)
        filtered = filtered.slice(0,Math.max(1,numToShow))
        myRank = GenerateOutputList(filtered,'selected',award.meta,count,'hi')

  
        out.push(
            <div key={award.title} className="tableRow" data-row={ind+1}>
                <div className="tableCell recordTitle" key={award.title+'title'}><p className="txt">{award.title}{`\n`}{ind+1}</p></div>
                <div className="tableCell description" key={award.title+'d'}><p className="txt">{award.desc}</p></div>
                <div className="tableCell holder" key={award.title+'wv'}><p className="txt">{r1}</p></div>
                <div className="tableCell holder" key={award.title+'w'}><p className="txt">{winners}</p></div>
                <div className="tableCell myScores" key={award.title+'c'}><p className="txt">{myRank}</p></div>
            </div>
        ) 
    }

    return <div>
        <div className='topContainer' key={'topcont'} ref={stickyRef}>

                <div className='buttonsContainer' key={'butcont'}>
                {relevantChoices}
       
                </div>  
         
              </div>
    
    <div className='tableContainer' key={'tbc'}>{out}</div>
    </div>

}