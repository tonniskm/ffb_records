import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { CallESPNRaw } from './tools/fetching/callESPNRaw';
import { CallESPNProj } from './tools/fetching/callESPNProj';
import CallESPNFa from './tools/fetching/callESPNFa';
import GetRecords from './tools/calculations/getRecords';

function App() {
  const [raw,setRaw] = useState([{'Week':'init'}])
  const [proj,setProj] = useState([{'Week':'init'}])
  const [fa,setFa] = useState([{'Week':'init'}])
  const [records,setRecords] = useState({})

  const yearMin = 2012 
  const currentYear = new Date().getFullYear() -1-1;
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
   
  let outTest = []    
  // for(let i=0;i<raw.length;i++){
  //   outTest.push(<div key={'test'+i} style={{backgroundColor:'red',width:'100%'}}>
  //     <div style={{width:40,float:'left',backgroundColor:'green'}}><p key={'test'+i} >{i}</p></div>
  //     <div style={{width:40,float:'left',backgroundColor:'red'}}><p key={'week'+i} >{raw[i].Week}</p></div>
  //     <div style={{width:40,float:'left',backgroundColor:'blue'}}><p key={'t1'+i} >{raw[i].Team1}</p></div>
  //     <div style={{width:40,float:'left',backgroundColor:'green'}}><p key={'t1s'+i} >{raw[i].Score1}</p></div>
  //     <div style={{width:40,float:'left',backgroundColor:'red'}}><p key={'t2'+i} >{raw[i].Team2}</p></div>
  //     <div style={{width:40,float:'left',backgroundColor:'blue'}}><p key={'t2s'+i} >{raw[i].Score2}</p></div>
  //     <div style={{width:40,float:'left',backgroundColor:'green'}}><p key={'w'+i} >{raw[i].winner}</p></div>
  //     <div style={{width:40,float:'left',backgroundColor:'red'}}><p key={'type'+i} >{raw[i].type}</p></div>
  //     <div style={{width:200,float:'left',backgroundColor:'blue'}}><p key={'wb'+i} >{raw[i].winBracket}</p></div>
  //     <div style={{width:200,float:'left',backgroundColor:'green'}}><p key={'lb'+i} >{raw[i].loseBracket}</p></div>
  //     </div>)
  // }   
  let outTest2 = []  
  // for(let i=0;i<proj.length;i++){
  //   outTest2.push(<div key={'test'+i} style={{backgroundColor:'red',width:'100%'}}>
  //     <div style={{width:40,float:'left',backgroundColor:'green'}}><p key={'test'+i} >{i}</p></div>
  //     <div style={{width:40,float:'left',backgroundColor:'red'}}><p key={'week'+i} >{proj[i].Week}</p></div>
  //     <div style={{width:40,float:'left',backgroundColor:'blue'}}><p key={'t1'+i} >{proj[i].PlayerName}</p></div>
  //     <div style={{width:40,float:'left',backgroundColor:'green'}}><p key={'t1s'+i} >{proj[i].PlayerScoreActual}</p></div>
  //     <div style={{width:40,float:'left',backgroundColor:'red'}}><p key={'t2'+i} >{proj[i].PlayerScoreProj}</p></div>
  //     <div style={{width:40,float:'left',backgroundColor:'blue'}}><p key={'t2s'+i} >{proj[i].PlayerRosterSlotId}</p></div>
  //     <div style={{width:40,float:'left',backgroundColor:'green'}}><p key={'t1s1'+i} >{proj[i].PlayerFantasyTeam}</p></div>
  //     <div style={{width:40,float:'left',backgroundColor:'red'}}><p key={'t21'+i} >{proj[i].Position}</p></div>
  //     <div style={{width:40,float:'left',backgroundColor:'blue'}}><p key={'t2s1'+i} >{proj[i].ProTeam}</p></div>
  //     <div style={{width:40,float:'left',backgroundColor:'green'}}><p key={'t1s12'+i} >{proj[i].PlayerRosterSlot}</p></div>
  // </div> )    
  // }        

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
  console.log(proj)   
  // const a =  []
  // console.log(a.concat([['a','b']])) 
  // const b = {1:10,2:20,3:5,4:2,5:10}     
  // const result = Object.entries(b).reduce((a, b) => a[1] > b[1] ? a : b)[0]   
  // console.log(result)                    
  // console.log(proj)                                                   
  return (                      
    <div className="App">         
      <header className="App-header"> 
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.asdf
        </p>
        <button onClick={()=>Test2()}>testproj</button>
        <button onClick={()=>Test3()}>testfa</button>
        <button onClick={()=>Test4()}>testrecords</button>
        {outTest2}
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
               