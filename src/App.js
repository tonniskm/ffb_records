
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
import { callProj } from './tools/fetching/callProj2';
import { callRaw } from './tools/fetching/callRaw2';
import { WeeklyReview } from './tools/outputs/weeklyReview';
import { PlayerTable } from './tools/outputs/playerTable';
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
  

  const [didMount,setDidMount] = useState(false) 

  const scrollRef  = useRef(null)
  // const stickyRef = useRef(null);
  

  const getOffsetRelativeToContainer = (child, container) => {
    let offset = 0;
    let el = child;
    while (el && el !== container) {
      offset += el.offsetTop;
      el = el.offsetParent;
    }
    return offset;
  };
  

// Function to track the topmost row relative to the container and sticky header
const trackTopRow = () => {
  const container = scrollRef.current;
  const stickyHeight = 0//stickyRef.current?.offsetHeight || 0; // Height of the sticky div
  const scrollTop = container.scrollTop;
  const allRows = container.querySelectorAll('[data-row]');
  
  let topRow = null;
  let minDistance = Infinity; // Track the closest row to the top of the container
  
  // Loop over each row to find the one closest to the top of the screen (below the sticky header)
  allRows.forEach(el => {
    const rect = el.getBoundingClientRect(); // Get bounding rect of the row relative to viewport
    const rowTop = rect.top + scrollTop;  // Actual top position relative to the container
    const rowBottom = rect.bottom + scrollTop;  // Bottom position of the row
    
    // Ensure the row is within the container's visible area (below sticky header)
    if (rowTop >= scrollTop + stickyHeight && rowTop <= scrollTop + container.offsetHeight) {
      const distance = Math.abs(rowTop - (scrollTop + stickyHeight)); // Distance from sticky header
      
      // Find the row whose top is closest to the sticky header
      if (distance < minDistance) {
        topRow = el;
        minDistance = distance;
      }
    }
  });
  
  // Set the top row ID and offset for later restoration
  if (topRow) {
    // topRowIdRef.current = topRow.getAttribute('data-row');
    // offsetFromTopRef.current = topRow.offsetTop - stickyHeight;
    // console.log('t'+topRowIdRef.current)
  }
};

// Function to restore the scroll position
const restoreScroll = (id) => {
  // console.log('r'+topRowIdRef.current)
  const container = scrollRef.current;
  const stickyHeight = 0//stickyRef.current?.offsetHeight || 0; // Sticky header height
  // if (!container || !topRowIdRef.current) return;

  const row = container.querySelector(`[data-row="${id}"]`);
  if (!row) return;

  const rect = row.getBoundingClientRect();
  const offset = rect.top + scrollRef.current.scrollTop;  // Get actual position of row

  // Adjust the scrollTop so that the row is positioned just below the sticky header
  container.scrollTop = offset - stickyHeight;
};

  
  
  // console.log(scrollRef.current.scrollTop)
  // console.log(topRowIdRef.current,getOffsetRelativeToContainer(scrollRef.current.querySelector(`[data-row="${128}"]`))," "+scrollRef.current.scrollTop)
  // const container = scrollRef.current;
  // const row = container.querySelector(`[data-row="${12}"]`);
  // const offset = getOffsetRelativeToContainer(row, container);
  // console.log(scrollRef.current.scrollTop,offset)
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
    'activeNames':activeNames
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
    else if(macroType=='Weekly Review'){
        output = <WeeklyReview pickMacro={pickMacro} raw={raw} proj={proj} records={records} vars={vars} awards={allAwards}></WeeklyReview>
    } 
    else if(macroType==='Players by Team'){
      try{output=<PlayerTable  pickMacro={pickMacro} records={records} vars={vars}></PlayerTable>}catch(err){console.log(err);output=<p>error</p>}
    }
    else if (macroType==='Draft'){
      output = <DraftReview pickMacro={pickMacro} records={records} vars={vars}></DraftReview>
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
        <div className='appContainer' key={'appcont'} ref={scrollRef}>
            <button onClick={()=>Test4()}>testrecords</button> 
            <img key={'trophy'} src={trophy} className='logo' alt="logo" />
          <div className='bannerContainer' >
          
          <div className='tableWrapper'>
          {output}
          </div>
        </div>
          </div>
      </header>
    </div> 
  );
}    
 
export default App;
                        