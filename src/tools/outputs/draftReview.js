import { useEffect, useState } from 'react';
import { posColors, valueToColor } from '../../styles/colors';
import { GetPickNo } from '../calculations/other';
import ToggleButton from './misc/toggle';

export const DraftReview = (props) =>{
    const [draftCSV,setDraftCSV] = useState([])
    const [ranks,setRanks] = useState([])
    const [colorType,setColorType] = useState('Position')
    

    useEffect(()=>{ //load csv
        const loadCSV = async()=>{
            try{
                const res = await fetch(`/drafts/${props.year.toString()}.csv`)
                const text = await res.text()
                const lines = text.trim().split('\n');
                const headers = lines[0].split(',');
          
                const data = lines.slice(1).map(line => {
                  const values = line.split(',');
                  const row = {};
                  headers.forEach((header, i) => {
                    row[header.trim()] = values[i].trim();
                  });
                  return row;
                })
                const res2 = await fetch(`/drafts/rankings/${props.year.toString()}rank.csv`)
                const text2 = await res2.text()
                const lines2 = text2.trim().split('\n');
                const headers2 = lines2[0].split(',');
          
                const data2 = lines2.slice(1).map(line => {
                  const values = line.split(',');
                  const row = {};
                  headers2.forEach((header, i) => {
                    row[header.trim()] = values[i].trim();
                  });
                  return row;
                })
            if('<!DOCTYPE html>' in data[0]){setDraftCSV(['no data'])}
            else{setDraftCSV(data);setRanks(data2)}
            }catch(e){setDraftCSV(['no data'])}
            }

        loadCSV()
    },[props.year])
    console.log({draftCSV,ranks})
    let out
    if(draftCSV.length<=2){out=<div><p>No data for the selected year.</p></div>}
    else{
        let headerRow = []
        for(const name in draftCSV[0]){
            if(name===''){continue}
            headerRow.push(<div className='headerCell'><p className='txt'>{name}</p></div>)
        }
        headerRow = <div className='tableRow'>
            <div className='headerCell'><p className='txt'>Round</p></div>
            {headerRow}
            </div>
        let rows = []

            for(const [ind,line] of draftCSV.entries()){
                let round
                if(line[""]===''||line['""']==''){continue}
                if(draftCSV.length>30){round=ind/2+1}
                else{round = ind}
                let row = []
                const keys = Object.keys(line)
                for(let i=0;i<keys.length;i++){
                    const name = keys[i]
                    const NFLName = line[name].replaceAll('"','')
                    if (name===''){continue}
                    const rankLines = ranks.filter(x=>x.Name===NFLName)
                    let pos,rank
                    if(rankLines.length>0){pos=rankLines[0].Pos;rank=rankLines[0].Rank}else{pos='NA';rank=301}
                    const pickInd = keys.filter(x=>x!=='').indexOf(name)
                    const pickNo = GetPickNo(round,pickInd,keys.length-1)
                    const reachWeight = (pickNo-rank)/round
                    const reachColor = valueToColor(reachWeight)
                    const shownColor = colorType=='Position'?posColors[pos]:reachColor
                    row.push(<div className='tableCell' style={{backgroundColor:shownColor,borderColor:'black'}}><p className='txt' style={{color:"black"}}>{line[name]}</p></div>)
                }
                row = <div className='tableRow'>
                    <div className='headerCell'><p className='txt'>{round}</p></div>
                    {row}
                </div>
                rows.push(row)
            }

            out = <div className='tableContainer' key={'draft'}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'flex-start',paddingLeft:10}}><ToggleButton choiceA="Position"
                              choiceB="Reach Heat Map"
                              onToggle={(val) => setColorType(val)}></ToggleButton></div>
                {headerRow}{rows}</div>
        
    }

    return(out)
}