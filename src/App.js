
import trophy from './tools/assets/trophy.png'
import './App.css';
import { useEffect, useRef, useState } from 'react';
import CallESPNFa from './tools/fetching/callESPNFa';
import GetRecords from './tools/calculations/getRecords';
import { NamePicker } from './tools/outputs/misc/misc';

import { RecordTable} from './tools/outputs/recordTable';
import { SummaryTable} from './tools/outputs/summaryTable';
import { YearlyAwardTable} from './tools/outputs/yearlyAwardTable';
import { MatchupTable} from './tools/outputs/matchupTable';
import { FantasyTeams } from './tools/outputs/fantasyTeams';
import { loadingScreen } from './tools/outputs/loadingScreen';
import { RecentUpdates } from './tools/outputs/recentUpdates';
import { callRaw } from './tools/fetching/callRaw2';
import { WeeklyReview } from './tools/outputs/weeklyReview';
import { PlayerTable } from './tools/outputs/playerTable';
import { DraftReview } from './tools/outputs/draftReview';
import PinchZoomDiv from './tools/outputs/misc/zoom copy';
import { callProj2 } from './tools/fetching/callProj3';
import { YearlyReview } from './tools/outputs/yearlyReview';
import { getPlayerIDInfo } from './tools/fetching/fetch_id_info';


  
// import { styleSheet } from './tools/styles/styles';   
const UPDATE_DRAFT_INFO = false
//update proj by copying from chrome calling api
function App() {
  const [raw,setRaw] = useState([{'Week':'init'}])
  const [proj,setProj] = useState([{'Week':'init'}])
  const [fa,setFa] = useState([{'Week':'init'}])
  // const [NFLstats,setNFLstats] = useState([])
  const [records,setRecords] = useState({})
  const [oldRecords,setOldRecords] = useState({})
  const [weekOldRecords,setWeekOldRecords] = useState({})

  const [macroType,setMacroType] = useState('Records')
  

  const [didMount,setDidMount] = useState(false) 

  const scrollRef  = useRef(null)
  // const stickyRef = useRef(null);
  

  const yearMin = 2012     
  const currentYear = new Date().getFullYear();
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
    if(Object.keys(raw).includes(i.toString())){
      activeYears.push(i)
      summaryYears.push(i)
    }
  }  
  let allNFLNames = []
  if('playerTracker' in records){allNFLNames=records.playerTracker.map(x=>x.name)}
  const macroTypes = ['Records','Summary','Yearly Awards','Matchups','Fantasy Teams','Players by Team','Recent Updates','Weekly Review','Yearly Review','Draft']
 
  let nameSelectMessage
  if(macroType=='Records'){nameSelectMessage='Filter Selected Comparison Column Name: '}
  else{nameSelectMessage='Filter by Name: '}
    
  const pickMacro = <NamePicker title={'What to Show: '} selecting={setMacroType} curval={macroType} options={macroTypes} key={'m'}></NamePicker>
  
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
    'allNames':allNames,
    'activeWeeks':activeWeeks,
    'activeYears':activeYears,
    'allNFLNames':allNFLNames,
    'activeNames':activeNames,
    // NFLstats:NFLstats,setNFLstats
  }

  let outTest = [] 
  
  let output = []
  let shownRecords = []
  let allAwards = []
  if(records.nameAwards!=undefined){allAwards=records.nameAwards.concat(records.gameAwards).concat(records.weekAwards).concat(records.yearAwards)
    .concat(records.projAwards).concat(records.playerStats).concat(records.nyAwards).concat(records.draftAwards).concat(records.teamAwards)}
      

  if(records.nameAwards!=undefined){
    if(macroType=='Records'){ 

        outTest = <RecordTable allAwards={allAwards} vars={vars}
          scrollRef={scrollRef}  pickMacro={pickMacro}></RecordTable>
      output =outTest
    }    
    else if (macroType=='Summary'){
          outTest=<SummaryTable records={records} pickMacro={pickMacro} vars={vars}></SummaryTable>
      output=outTest  
    }       
    else if(macroType=='Yearly Awards'){
      outTest=<YearlyAwardTable pickMacro={pickMacro} vars={vars} records={records}></YearlyAwardTable>
      output = outTest
    }
    else if(macroType=='Matchups'){
      output = <MatchupTable dict={records.matchupTable} pickMacro={pickMacro} vars={vars}></MatchupTable>
    }
    else if(macroType=='Fantasy Teams'){
      output = <FantasyTeams dict={records.fantasyTeams} pickMacro={pickMacro} vars={vars}></FantasyTeams>
    }
    else if(macroType=='Recent Updates'){
      // GetRecords(vars,currentYear,setRecords,raw,proj,fa)
      try{
        output = <RecentUpdates records={records} oldRecords={oldRecords} weekOldRecords={weekOldRecords} pickMacro={pickMacro} vars={vars}></RecentUpdates>  

      }catch(err){console.log(err)}
    }
    else if(macroType==='Weekly Review'){
        output = <WeeklyReview pickMacro={pickMacro} raw={raw} proj={proj} records={records} vars={vars} awards={allAwards}></WeeklyReview>
    } 
    else if (macroType==='Yearly Review'){output=<YearlyReview pickMacro={pickMacro} records={records} vars={vars}></YearlyReview>}
    else if(macroType==='Players by Team'){
      try{output=<PlayerTable  pickMacro={pickMacro} records={records} vars={vars}></PlayerTable>}catch(err){console.log(err);output=<p>error</p>}
    }
    else if (macroType==='Draft'){
      output = <DraftReview pickMacro={pickMacro} records={records} vars={vars}></DraftReview>
    }  
  }  //end if undefined 
  else{output=loadingScreen()}    
    // output = loadingScreen()    testing 
  useEffect(()=>{   
    if(raw['Week']!='init'){callRaw(vars,setRaw)}
    if(UPDATE_DRAFT_INFO){getPlayerIDInfo(vars)}
    // CallESPNProj(vars,setProj,loading,setLoading)   
  },[])    
  useEffect(()=>{     
    // CallESPNRaw(vars,setRaw,loading,setLoading)
    if(proj['Week']!='init'){callProj2(vars,setProj)}
  },[])        
 
  useEffect(()=>{    
      if(Object.keys(raw).includes((currentYear-1).toString())&&Object.keys(proj).includes((currentYear-1).toString())&&!didMount){
        const lastYear1 = Object.keys(raw).map(x=>parseInt(x))
        const lastYear = Math.max(...lastYear1)
        if(raw[lastYear].length > 2 && proj[lastYear].length > 2){
          setDidMount(true)
          GetRecords(vars,lastYear,setRecords,raw,proj,fa)
          GetRecords(vars,lastYear-1,setOldRecords,raw,proj,fa)
          let truncRaw = {...raw}
          let truncProj = {...proj}
          const lastWeek = raw[lastYear][raw[lastYear].length-1].Week
          truncRaw[lastYear] = truncRaw[lastYear].filter(x=>x.Week!=lastWeek)
          truncProj[lastYear] = truncProj[lastYear].filter(x=>x.Week<lastWeek)
          // console.log({truncRaw,truncProj})
          // truncRaw.append(0)
          if(lastWeek==1){GetRecords(vars,lastYear-1,setWeekOldRecords,raw,proj,fa)}
          else{GetRecords(vars,lastYear,setWeekOldRecords,truncRaw,truncProj,fa)}
        }
      }else{     
        // console.log('cll') 
        // CallESPNProj(vars,setProj,loading,setLoading)  
    }  
  },[raw,proj])


           
  console.log({records,raw,proj})
  // console.log(proj.filter(x=>x.Week==1&&x.PlayerFantasyTeam===14))
  // console.log(proj)
  
 
  function Test1(){
    // CallESPNFa(vars,setRaw)  
    // CallESPNRaw(vars,setRaw,loading,setLoading)
    // callRaw(vars,setRaw)
    callRaw(vars,setRaw)
    // callProj(vars,setProj)
  }    

  function Test4(){
    const lastYear1 = Object.keys(raw).map(x=>parseInt(x))
    const lastYear = Math.max(...lastYear1)

    GetRecords(vars,lastYear,setRecords,raw,proj,fa)
    GetRecords(vars,lastYear-1,setOldRecords,raw,proj,fa)
    let truncRaw = {...raw}
    let truncProj = {...proj}
    const lastWeek = raw[lastYear][raw[lastYear].length-1].Week
    truncRaw[lastYear] = truncRaw[lastYear].filter(x=>x.Week!=lastWeek)
    truncProj[lastYear] = truncProj[lastYear].filter(x=>x.Week<lastWeek)
    // console.log({truncRaw,truncProj})
    // truncRaw.append(0)
    if(lastWeek==1){GetRecords(vars,lastYear-1,setWeekOldRecords,raw,proj,fa)}
    else{GetRecords(vars,lastYear,setWeekOldRecords,truncRaw,truncProj,fa)}
  }                                 
//   console.log(proj)   
//  console.log(raw)  
  // console.log(predone.filter(x=>x.height))
  return (                               
    <div className="App" key={'app'}>         
      <header className="App-header" key={'head'}> 
        {/* <div>{loading['raw']}</div> */}
        {/* <Chart data={records?.nameAwards[0].values} name={'Kevin'} year={null}/> */}
        <PinchZoomDiv style={{ height: '100vh', }} key={'pinchzoomdiv'}>

        <div className='appContainer' key={'appcont'} ref={scrollRef}>
            {/* <button onClick={()=>Test4()}>testrecords</button>  */}
            <img key={'trophy'} src={trophy} className='logo' alt="logo" />
          {/* <div className='bannerContainer' > */}
          
          {/* <div className='tableWrapper'> */}
          {output}
          {/* </div> */} 
        {/* </div> */}
          </div>
        </PinchZoomDiv>
      </header>   
    </div> 
  );  
}     
 
export default App;
                           