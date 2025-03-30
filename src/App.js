
import trophy from './tools/assets/trophy.png'
import './App.css';
import { createRef, useEffect, useState } from 'react';
import { CallESPNRaw } from './tools/fetching/callESPNRaw';
import { CallESPNProj } from './tools/fetching/callESPNProj';
import CallESPNFa from './tools/fetching/callESPNFa';
import GetRecords from './tools/calculations/getRecords';
import { NamePicker, NumberPicker } from './tools/outputs/misc';

import { recordTable } from './tools/outputs/recordTable';
import { summaryTable } from './tools/outputs/summaryTable';
import { yearlyAwardTable } from './tools/outputs/yearlyAwardTable';
import { matchupTable } from './tools/outputs/matchupTable';
import { fantasyTeams } from './tools/outputs/fantasyTeams';
import { loadingScreen } from './tools/outputs/loadingScreen';
import { CompareRecords } from './tools/calculations/compareRecords';
import { recentUpdates } from './tools/outputs/recentUpdates';
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
  const macroTypes = ['Records','Summary','Yearly Awards','Matchups','Fantasy Teams','Recent Updates']
 
  const awardTypes = ['Name','Game','Week','Year','Proj','Player','NY']
  let nameSelectMessage
  if(macroType=='Records'){nameSelectMessage='Filter Selected Comparison Column Name: '}
  else{nameSelectMessage='Filter by Name: '}
  
  const pickMacro = <NamePicker title={'What to Show: '} selecting={setMacroType} options={macroTypes} key={'m'}></NamePicker>
  const pickSumYear = <NamePicker title={'Year: '} selecting={setSummaryYear} options={summaryYears} key={'st'}></NamePicker>
  const pickAward= <NamePicker title={'Filter Records: '} showAll={true} selecting={setAwardType} options={awardTypes} key={'a'}></NamePicker>
  const pickName = <NamePicker title={nameSelectMessage} showAll={true} selecting={setFocusName} options={activeNames} key={'name'}></NamePicker>
  const pickWeek = <NamePicker title={'Week: '} showAll={true} selecting={setFocusWeek} options={activeWeeks} key={'week'}></NamePicker>
  const pickYear = <NamePicker title={'Year: '} showAll={false} selecting={setSelectedYear} options={activeYears} key={'yearp'}></NamePicker>
  const pickWY =   <NamePicker title={'Past week or year: '} showAll={false} selecting={setWeekYear} options={['Week','Year']} key={'wy'}></NamePicker>
  const pickNum =  <NumberPicker selecting={setNumToShow} curval={numToShow}></NumberPicker>

  let relevantChoices = []
  if(records.nameAwards!=undefined){
    if (macroType=='Records'){relevantChoices=[pickMacro,pickAward,pickName,pickWeek,pickSumYear,pickNum]}
    else if(macroType=='Summary'){relevantChoices=[pickMacro,pickSumYear]}
    else if(macroType=='Yearly Awards'){relevantChoices=[pickMacro,pickYear]}
    else if (macroType=='Matchups'){relevantChoices=[pickMacro,pickName]}
    else if (macroType=='Fantasy Teams'){relevantChoices=[pickMacro,pickName]}
    else if (macroType=='Recent Updates'){relevantChoices=[pickMacro,pickWY]}
  }


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
    'year':summaryYear 
  }
  let outTest = []
  
  
  let output = []
  let shownRecords = []
  let allAwards = []
  if(records.nameAwards!=undefined){allAwards=records.nameAwards.concat(records.gameAwards).concat(records.weekAwards).concat(records.yearAwards)
    .concat(records.projAwards).concat(records.playerStats).concat(records.nyAwards)}

    
  if(records.nameAwards!=undefined){
    if(macroType=='Records'){
      if(awardType=='Name'){shownRecords = records.nameAwards }
      if(awardType=='Game'){shownRecords = records.gameAwards }
      if(awardType=='Week'){shownRecords = records.weekAwards }
      if(awardType=='Year'){shownRecords = records.yearAwards }
      if(awardType=='Proj'){shownRecords = records.projAwards }
      if(awardType=='Player'){shownRecords = records.playerStats }
      if(awardType=='NY'){shownRecords = records.nyAwards }
      if(awardType=='All'){shownRecords = allAwards }
      outTest = recordTable(shownRecords,allFocus,numToShow)
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
      let list
      if(weekYear=='Year'){
        list = CompareRecords(records,oldRecords)
      }else{
        list = CompareRecords(records,weekOldRecords)
      }
      try{
        output = recentUpdates(list)

      }catch(err){console.log(err)}
      
    }
  }  //end if undefined
  else{output=loadingScreen()}
 
 

  useEffect(()=>{ 
    if(raw['Week']!='init'){CallESPNRaw(vars,setRaw,loading,setLoading)}
    // CallESPNProj(vars,setProj,loading,setLoading)   
  },[]) 
  useEffect(()=>{ 
    // CallESPNRaw(vars,setRaw,loading,setLoading)
    if(proj['Week']!='init'){CallESPNProj(vars,setProj,loading,setLoading)}
  },[]) 

  useEffect(()=>{ 
    // console.log({1:didMount,2:raw,3:proj,4:!didMount,5:Object.keys(raw).includes(currentYear.toString()),6:Object.keys(proj).includes(currentYear)})
      if(Object.keys(raw).includes(currentYear.toString())&&Object.keys(proj).includes(currentYear.toString())&&!didMount){
        if(raw[currentYear].length > 2 && proj[currentYear].length > 2){
          // console.log('doingit')
          setDidMount(true)
          GetRecords(vars,currentYear,setRecords,raw,proj,fa)
          GetRecords(vars,currentYear-1,setOldRecords,raw,proj,fa)
          // GetRecords(vars,currentYear-1,setOldR        GetRecords(vars,currentYear-1,setOldRecords,raw,proj,fa)
          let truncRaw = {...raw}
          let truncProj = {...proj}
          const lastWeek = raw[currentYear][raw[currentYear].length-1].Week
          truncRaw[currentYear] = truncRaw[currentYear].filter(x=>x.Week!=lastWeek)
          truncProj[currentYear] = truncProj[currentYear].filter(x=>x.Week<lastWeek)
          // console.log({truncRaw,truncProj})
          // truncRaw.append(0)
          GetRecords(vars,currentYear,setWeekOldRecords,truncRaw,truncProj,fa)
        }
      }else{
        // console.log('cll') 
        // CallESPNProj(vars,setProj,loading,setLoading)  
    } 
  },[raw,proj])
 
           
  // console.log(fa)  
  // const a = '12'
  // console.log(parseFloat(a)) 
  // const b = {}   
  // console.log('asdf'.includes('a'))                      
  // console.log({1:records,2:oldRecords})   
  // if(records.nameAwards!=undefined){
  //   try{
  //     CompareRecords(records,oldRecords)
  //   }catch(err){console.log(err)}
  // }  
  // console.log(raw)
  // console.log(numToShow) 
  // console.log(proj)    
  // console.log(['a'].includes('a'))       
  function Test4(){
    GetRecords(vars,currentYear,setRecords,raw,proj,fa)
    GetRecords(vars,currentYear-1,setOldRecords,raw,proj,fa)
    let truncRaw = {...raw}
    let truncProj = {...proj}
    const lastWeek = raw[currentYear][raw[currentYear].length-1].Week
    truncRaw[currentYear] = truncRaw[currentYear].filter(x=>x.Week!=lastWeek)
    truncProj[currentYear] = truncProj[currentYear].filter(x=>x.Week<lastWeek)
    // console.log({truncRaw,truncProj})
    // truncRaw.append(0)
    GetRecords(vars,currentYear,setWeekOldRecords,truncRaw,truncProj,fa)
  }                               
            
  return (                               
    <div className="App">         
      <header className="App-header"> 
        {/* <div>{loading['raw']}</div> */}
        <div className='appContainer'>
          <div className='topContainer'>
            <img src={trophy} className='logo' alt="logo" />

            {/* <button onClick={()=>Test4()}>testrecords</button> */}
            <div className='buttonsContainer'>
            {relevantChoices}

            </div> 

          </div>
          {output}
        </div>
      </header>
    </div>
  );
}   
 
export default App;
                     