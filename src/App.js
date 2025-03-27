import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { CallESPNRaw } from './tools/fetching/callESPNRaw';
import { CallESPNProj } from './tools/fetching/callESPNProj';
import CallESPNFa from './tools/fetching/callESPNFa';
import GetRecords from './tools/calculations/getRecords';
import { winnerName } from './tools/outputs/winnerName';
import { NamePicker } from './tools/outputs/misc';
import { winnerWeek } from './tools/outputs/winnerWeek';
import { winnerGame } from './tools/outputs/winnerGame';
import { winnerYear } from './tools/outputs/winnerYear';
// import { styleSheet } from './tools/styles/styles'; 

function App() {
  const [raw,setRaw] = useState([{'Week':'init'}])
  const [proj,setProj] = useState([{'Week':'init'}])
  const [fa,setFa] = useState([{'Week':'init'}])
  const [records,setRecords] = useState({})
  const [awardType,setAwardType] = useState('Name')
  const [focusName,setFocusName] = useState('All')
  const [focusWeek,setFocusWeek] = useState('All')
  const [focusYear,setFocusYear] = useState('All')

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
  for(let i=1;i<18;i++){activeWeeks.push(i)}
  for(let i=yearMin;i<=currentYear;i++){activeYears.push(i)}
  const macroTypes = ['Records','Summary']
  const summaryTypes = ['']
  const awardTypes = ['Name','Game','Week','Year',]
 
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
    'year':focusYear
  }
  let outTest = []
  if(records.nameAwards!=undefined){
    if(awardType=='Name'){outTest = winnerName(records.nameAwards,focusName) }
    if(awardType=='Game'){outTest = winnerGame(records.gameAwards,allFocus,5)} 
    if(awardType=='Week'){outTest = winnerWeek(records.weekAwards,allFocus,5)} 
    if(awardType=='Year'){outTest = winnerYear(records.yearAwards,allFocus,5)} 

  }
  useEffect(()=>{ 
    CallESPNRaw(vars,setRaw,loading,setLoading)
    // CallESPNProj(vars,setProj,loading,setLoading) 
  },[]) 
  useEffect(()=>{ 
    // CallESPNRaw(vars,setRaw,loading,setLoading)
    CallESPNProj(vars,setProj,loading,setLoading) 
  },[]) 

  useEffect(()=>{ 
    // console.log({1:didMount,2:raw,3:proj,4:!didMount,5:Object.keys(raw).includes(currentYear.toString()),6:Object.keys(proj).includes(currentYear)})
      if(Object.keys(raw).includes(currentYear.toString())&&Object.keys(proj).includes(currentYear.toString())&&!didMount){
        if(raw[currentYear].length > 2 && proj[currentYear].length > 2){
          // console.log('doingit')
          setDidMount(true)
          GetRecords(vars,records,setRecords,raw,proj,fa)
        }
      }else{
        // console.log('cll') 
        // CallESPNProj(vars,setProj,loading,setLoading) 
    }
  },[raw,proj])

  function Test(){
    CallESPNRaw(vars,setRaw)
  }  
  function Test2(){  
    CallESPNProj(vars,setProj)   
  } 
  function Test3(){  
    CallESPNFa(vars,setFa) 
  }  
  function Test4(){ 
    GetRecords(vars,records,setRecords,raw,proj,fa)
  }               
  // console.log(fa) 
  // console.log(raw)  
  // console.log(proj)   
  // console.log(loading) 
  console.log(records)
  // console.log([1,2,3].slice(0,10))
  // console.log(a.concat([['a','b']]))  
  // const b = {1:10,2:20,3:5,4:2,5:10}     
  // const result = Object.entries(b).reduce((a, b) => a[1] > b[1] ? a : b)[0]   
  // console.log(result)                      
  // console.log(proj)                                                       
  return (                       
    <div className="App">         
      <header className="App-header"> 
        {/* <div>{loading['raw']}</div> */}
        <img src={logo} className="App-logo" alt="logo" />
        <NamePicker title={'Awards Type: '} selecting={setAwardType} options={awardTypes} key={'a'}></NamePicker>
        <NamePicker title={'Focus On Player: '} selecting={setFocusName} options={activeNames} key={'name'}></NamePicker>
        <NamePicker title={'Week: '} selecting={setFocusWeek} options={activeWeeks} key={'week'}></NamePicker>
        <NamePicker title={'Year: '} selecting={setFocusYear} options={activeYears} key={'year'}></NamePicker>
        <div className='tableContainer'>
          {outTest}
        </div>
        <button onClick={()=>Test2()}>testproj</button>
        <button onClick={()=>Test3()}>testfa</button>
        <button onClick={()=>Test4()}>testrecords</button>
        <button onClick={()=>Test()}>test</button>
        <a 
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        > 
          Learn React
        </a>
      </header>
    </div>
  );
}   
 
export default App;
               