import { missingData } from "./missing2023w1";
import { savedProj } from "./saved_jsons/proj/saved";

export function callProj2(vars,setProj){
    const yearMax = vars.currentYear
    let out = {...savedProj}
    // console.log(out[2023].filter(x=>x.Week==1))
    let dataCopy = [...missingData]
    // console.log(out[2023].filter(x=>x.Week).length>0,out[2023].filter(x=>x.Week).length)
    if(!out[2023].filter(x=>x.Week==1).length>0){
        for(const line of dataCopy){
            line.PlayerScoreActual = parseFloat(line.PlayerScoreActual)
            line['PlayerScoreProj'] = parseFloat(line.PlayerScoreProjected)
            out[2023].push(line)
        }
    }
        // console.log(out[2023].filter(x=>x.Week==1))
    const lastSavedYear = Math.max(...Object.keys(savedProj).map(x=>parseInt(x)))
    const lastSavedWeek = Math.max(...savedProj[lastSavedYear].map(x=>x.Week))
    if(lastSavedYear==yearMax&&lastSavedWeek>=18){
        setProj(out)
    }
    else{
        if(false){

            // setProj(out)
            // for(let year=2018;year<=yearMax;year++){
            //     out[year] = []
            //     for(let week=1;week<=18;week++){
            //         if(year==2023&&week==1){continue}
                    // if(year==2024&&week>1){continue}
                    // const url = 'http://localhost:5432/projrajan/'+year.toString()+'/'+week.toString()
                    // const url = 'https://mocktion-site.vercel.app/projrajan/'+year.toString()+'/'+week.toString()
            // const url = 'http://localhost:5432/test/'+lastSavedYear.toString()+'/'+lastSavedWeek.toString()
            const url = 'https://mocktion-site.vercel.app/test/'+lastSavedYear.toString()+'/'+lastSavedWeek.toString()
                    
            fetch(url).then(res=>res.json()).then(json=>{
                for (const year in json){
                    if(json[year].length<1){continue}
                    out[year] = json[year].sort((a,b)=>a.Week-b.Week)
                }
                setProj(out)
            })
        }//end espn
        else{//Sleeper
            setProj(out)
        }
        }
 
}