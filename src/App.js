
import trophy from './tools/assets/trophy.png'
import './App.css';
import { createRef, useEffect, useState } from 'react';
import CallESPNFa from './tools/fetching/callESPNFa';
import GetRecords from './tools/calculations/getRecords';
import { NamePicker, NumberPicker } from './tools/outputs/misc/misc';

import { recordTable } from './tools/outputs/recordTable';
import { summaryTable } from './tools/outputs/summaryTable';
import { yearlyAwardTable } from './tools/outputs/yearlyAwardTable';
import { matchupTable } from './tools/outputs/matchupTable';
import { fantasyTeams } from './tools/outputs/fantasyTeams';
import { loadingScreen } from './tools/outputs/loadingScreen';
import { CompareRecords } from './tools/calculations/compareRecords';
import { recentUpdates } from './tools/outputs/recentUpdates';
import { callProj } from './tools/fetching/callProj2';
import { callRaw } from './tools/fetching/callRaw2';
import { awardLists } from './tools/constants/constants';
import { WeeklyReview } from './tools/outputs/weeklyReview';
import { PlayerTable } from './tools/outputs/playerTable';
import SuggestionInput from './tools/outputs/misc/suggestionPicker';
import { DraftReview } from './tools/outputs/draftReview';
// import { styleSheet } from './tools/styles/styles';   

function App() {
  const [raw,setRaw] = useState([{'Week':'init'}])
  const [proj,setProj] = useState([{'Week':'init'}])
  const [fa,setFa] = useState([{'Week':'init'}])
  const [records,setRecords] = useState({})
  const [oldRecords,setOldRecords] = useState({})
  const [weekOldRecords,setWeekOldRecords] = useState({})

  const [macroType,setMacroType] = useState('Records')
  const [awardType,setAwardType] = useState('All')
  const [selectedYear,setSelectedYear] = useState(2024)
  const [weekYear,setWeekYear] = useState('Week')
  
  const [focusName,setFocusName] = useState('All')
  const [focusWeek,setFocusWeek] = useState('All')
  const [summaryYear,setSummaryYear] = useState('All')
  const [numToShow,setNumToShow] = useState(3) 
  const [focusNFL,setFocusNFL] = useState('All')

  const [loading,setLoading] = useState({'raw':false,'proj':false,'fa':true})
  const [didMount,setDidMount] = useState(false) 
  
  const yearMin = 2012    
  const currentYear = new Date().getFullYear() -1;
  const weekMax =18 
  const names2012 = ['t0', 'Andrew', 'Brian', 'Rick Melgard', 'Stephen', 'Andre Simonson', 'Kevin', 'Eric',
    'Nick', 'Jake Knapke', 'Brenna', 'Uncle Steve', 'Regan Crone', 'RJ', 'Claire', 'Lance', 'Adam', 'Nate']
  const names = ['t0', 'Andrew', 'Brian', 'Rick Melgard', 'Stephen', 'Andre Simonson', 'Uncle Steve', 'Eric',
    'Regan Crone', 'Jake Knapke', 'Brenna', 'RJ', 'Nick', 'Kevin', 'Claire', 'Lance', 'Adam', 'Nate']
  const names2022 = ['t0', 'Andrew', 'Joey', 'Rick Melgard', 'Stephen', 'Andre Simonson', 'Uncle Steve', 'Eric',
    'Regan Crone', 'Jake Knapke', 'Brenna', 'RJ', 'Nick', 'Kevin', 'Claire', 'Lance', 'Adam', 'Nate']
  const lameDucks = ['t0','Rick Melgard','Andre Simonson','Uncle Steve','Regan Crone','Jake Knapke']
  const teamnos = [1, 2, 4, 7, 10, 11, 12, 13, 14, 15, 16, 17]
  const defunct = [0, 3, 5, 6, 8, 9] 
  const allNames = [...new Set([...names,...names2012,...names2022])]
  const activeNames = allNames.filter(x=>!lameDucks.includes(x))
  const activeWeeks = []
  const activeYears = [] 
  let  summaryYears = ['All']
  for(let i=1;i<18;i++){activeWeeks.push(i)}
  for(let i=yearMin;i<=currentYear;i++){
    activeYears.push(i)
    summaryYears.push(i)
  }  
  let allNFLNames = []
  if('playerTracker' in records){allNFLNames=records.playerTracker.map(x=>x.name)}
  const macroTypes = ['Records','Summary','Yearly Awards','Matchups','Fantasy Teams','Players by Team','Recent Updates','Weekly Review','Draft']
 
  // const awardTypes = ['Name','Game','Week','Year','Proj','Player','NY']
  const awardTypes = ['Most Important','Group Effort','Drop/All Related','Projection Related','Best/Worst Players']
  let nameSelectMessage
  if(macroType=='Records'){nameSelectMessage='Filter Selected Comparison Column Name: '}
  else{nameSelectMessage='Filter by Name: '}
    
  const pickMacro = <NamePicker title={'What to Show: '} selecting={setMacroType} curval={macroType} options={macroTypes} key={'m'}></NamePicker>
  const pickSumYear = <NamePicker title={'Year: '} selecting={setSummaryYear} curval={summaryYear} options={summaryYears} key={'st'}></NamePicker>
  const pickAward= <NamePicker title={'Filter Records: '} showAll={true} selecting={setAwardType} curval={awardType} options={awardTypes} key={'a'}></NamePicker>
  const pickName = <NamePicker title={nameSelectMessage} showAll={true} selecting={setFocusName} curval={focusName} options={activeNames} key={'name'}></NamePicker>
  const pickWeek = <NamePicker title={'Week: '} showAll={true} selecting={setFocusWeek} curval={focusWeek} options={activeWeeks} key={'week'}></NamePicker>
  const pickYear = <NamePicker title={'Year: '} showAll={false} selecting={setSelectedYear} curval={selectedYear} options={activeYears} key={'yearp'}></NamePicker>
  const pickWY =   <NamePicker title={'Past week or year: '} showAll={false} selecting={setWeekYear} curval={weekYear} options={['Week','Year']} key={'wy'}></NamePicker>
  const pickNum =  <NumberPicker selecting={setNumToShow} curval={numToShow}></NumberPicker>
  let pickNFL = [SuggestionInput(allNFLNames,focusNFL,setFocusNFL)]
  if(focusNFL!=='All'){pickNFL.push(<button key={'reset'} onClick={()=>setFocusNFL('All')}>Unfilter by NFL Name</button>)}
  let relevantChoices = [pickMacro]
  if(records.nameAwards!=undefined){
    if (macroType=='Records'){relevantChoices=[pickMacro,pickAward,pickName,pickWeek,pickSumYear,pickNFL,pickNum]}
    else if(macroType=='Summary'){relevantChoices=[pickMacro,pickSumYear]}
    else if(macroType=='Yearly Awards'){relevantChoices=[pickMacro,pickYear]}
    else if (macroType=='Matchups'){relevantChoices=[pickMacro,pickName]}
    else if (macroType=='Fantasy Teams'){relevantChoices=[pickMacro,pickName]}
    else if (macroType=='Recent Updates'){relevantChoices=[pickMacro,pickWY]}
    else if (macroType==='Players by Team'){relevantChoices=[pickMacro,pickName,pickNFL,pickNum]}
    else if (macroType==='Draft'){relevantChoices=[pickMacro,pickYear]}
  }     
//  console.log(raw) 
    
  const vars = {'currentYear':currentYear,
    'names':names, 
    'names2012':names2012,
    'names2022':names2022,
    'lameDucks':lameDucks,
    'teamNos':teamnos,
    'defunct':defunct,
    'yearMin':yearMin,
    'weekMax':weekMax,
    'allNames':allNames
  }
  const allFocus = {
    'name':focusName,
    'week':focusWeek,
    'year':summaryYear,
    'NFLName':focusNFL
  }
  let outTest = []
  
  
  let output = []
  let shownRecords = []
  let allAwards = []
  if(records.nameAwards!=undefined){allAwards=records.nameAwards.concat(records.gameAwards).concat(records.weekAwards).concat(records.yearAwards)
    .concat(records.projAwards).concat(records.playerStats).concat(records.nyAwards)}
  
        
  if(records.nameAwards!=undefined){
    if(macroType=='Records'){
      if(awardType=='All'){shownRecords = allAwards }
      const awardList = awardLists
      if(awardType=='Most Important'){shownRecords = allAwards.filter(x=>awardList.important.includes(x.title)) }
      if(awardType=='Group Effort'){shownRecords =allAwards.filter(x=>awardList.groupEffort.includes(x.title)) }
      if(awardType=='Drop/All Related'){shownRecords = allAwards.filter(x=>awardList.daRelated.includes(x.title)) }
      if(awardType=='Projection Related'){shownRecords = allAwards.filter(x=>awardList.projRelated.includes(x.title)) }
      if(awardType=='Best/Worst Players'){shownRecords = allAwards.filter(x=>awardList.playerRelated.includes(x.title)) }
        outTest = recordTable(shownRecords,allFocus,numToShow,allNames,allNFLNames)
      output =<div className='tableContainer' key={'tbc'}>
        {outTest}</div>
    }  
    else if (macroType=='Summary'){
      let type
      if(summaryYear=='All'){
        type = 'overall'
        try{
          outTest=summaryTable(records[type])
        }catch(err){console.log(err)}
      }else{
        type=summaryYear
        outTest=summaryTable(records['year'][type])
      }
      output=outTest
    }
    else if(macroType=='Yearly Awards'){
      let type
      if(selectedYear=='overall'||selectedYear=='All'){type=2012}else{type=selectedYear}
      outTest=yearlyAwardTable(records.yearSum[type])
      output = outTest
    }
    else if(macroType=='Matchups'){
      output = matchupTable(records.matchupTable,focusName)
    }
    else if(macroType=='Fantasy Teams'){
      output = fantasyTeams(records.fantasyTeams,focusName)
    }
    else if(macroType=='Recent Updates'){
      // GetRecords(vars,currentYear,setRecords,raw,proj,fa)
      let list = []
      try{
          if(weekYear=='Year'){
            list = CompareRecords(records,oldRecords)
          }else{
            list = CompareRecords(records,weekOldRecords)
        }
      }catch(err){console.log(err)}
      try{
        output = recentUpdates(list)

      }catch(err){console.log(err)}
      
    }
    else if(macroType=='Weekly Review'){
        output = <WeeklyReview activeWeeks={activeWeeks} activeYears={activeYears} raw={raw} proj={proj} records={records} vars={vars} awards={allAwards}></WeeklyReview>
    } 
    else if(macroType==='Players by Team'){
      try{output=<PlayerTable records={records} vars={vars} focus={allFocus} showTop={numToShow} setShowTop={setNumToShow}></PlayerTable>}catch(err){console.log(err);output=<p>error</p>}
    }
    else if (macroType==='Draft'){
      output = <DraftReview year={selectedYear}></DraftReview>
    } 
  }  //end if undefined
  else{output=loadingScreen()}
       
            
  useEffect(()=>{ 
    if(raw['Week']!='init'){callRaw(vars,setRaw)}
    // CallESPNProj(vars,setProj,loading,setLoading)   
  },[]) 
  useEffect(()=>{ 
    // CallESPNRaw(vars,setRaw,loading,setLoading)
    if(proj['Week']!='init'){callProj(vars,setProj)}
  },[])    
    
  useEffect(()=>{ 
      if(Object.keys(raw).includes(currentYear.toString())&&Object.keys(proj).includes(currentYear.toString())&&!didMount){
        if(raw[currentYear].length > 2 && proj[currentYear].length > 2){
          setDidMount(true)
          GetRecords(vars,currentYear,setRecords,raw,proj,fa)
          GetRecords(vars,currentYear-1,setOldRecords,raw,proj,fa)
          let truncRaw = {...raw}
          let truncProj = {...proj}
          const lastWeek = raw[currentYear][raw[currentYear].length-1].Week
          truncRaw[currentYear] = truncRaw[currentYear].filter(x=>x.Week!=lastWeek)
          truncProj[currentYear] = truncProj[currentYear].filter(x=>x.Week<lastWeek)
          // console.log({truncRaw,truncProj})
          // truncRaw.append(0)
          if(lastWeek==1){GetRecords(vars,currentYear-1,setWeekOldRecords,raw,proj,fa)}
          else{GetRecords(vars,currentYear,setWeekOldRecords,truncRaw,truncProj,fa)}
        }
      }else{    
        // console.log('cll') 
        // CallESPNProj(vars,setProj,loading,setLoading)  
    }  
  },[raw,proj])
  
           
  console.log({records,oldRecords,weekOldRecords})
  // console.log(proj)
  
 
  function Test1(){
    // CallESPNFa(vars,setRaw)  
    // CallESPNRaw(vars,setRaw,loading,setLoading)
    // callRaw(vars,setRaw)
    callRaw(vars,setRaw)
    // callProj(vars,setProj)
  }    
  //  console.log(focusNFL)
  function Test4(){
    GetRecords(vars,currentYear,setRecords,raw,proj,fa)
    GetRecords(vars,currentYear-5,setOldRecords,raw,proj,fa)
    let truncRaw = {...raw}
    let truncProj = {...proj}
    const lastWeek = raw[currentYear][raw[currentYear].length-1].Week
    truncRaw[currentYear] = truncRaw[currentYear].filter(x=>x.Week!=lastWeek)
    truncProj[currentYear] = truncProj[currentYear].filter(x=>x.Week<lastWeek)
    // console.log({truncRaw,truncProj})
    // truncRaw.append(0)
    if(lastWeek==1){GetRecords(vars,currentYear-1,setWeekOldRecords,raw,proj,fa)}
    else{GetRecords(vars,currentYear,setWeekOldRecords,truncRaw,truncProj,fa)}
  }                                 
  // console.log(proj)   
  return (                               
    <div className="App" key={'app'}>         
      <header className="App-header" key={'head'}> 
        {/* <div>{loading['raw']}</div> */}
        <div className='appContainer' key={'appcont'}>
          <div className='bannerContainer'>
            <img key={'trophy'} src={trophy} className='logo' alt="logo" />
          </div>
          <div className='topContainer' key={'topcont'}>
{/* <button onClick={()=>Test1()}>testr123 </button> */}  
            <button onClick={()=>Test4()}>testrecords</button> 
            {/* {pickNFL} */}
            <div className='buttonsContainer' key={'butcont'}>
            {relevantChoices}
   
            </div>  
     
          </div>
          <div className='tableWrapper'>
          {output}
          </div>
        </div>
      </header>
    </div> 
  );
}   
 
export default App;
                     