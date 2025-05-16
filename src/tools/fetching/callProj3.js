import { missingData } from "./missing2023w1";
import { savedProj } from "./saved_jsons/proj/saved";

export function callProj2(vars,setProj){
    const yearMax = vars.currentYear
    let out = {...savedProj}
    let dataCopy = [...missingData]
    for(const line of dataCopy){
        line.PlayerScoreActual = parseFloat(line.PlayerScoreActual)
        line['PlayerScoreProj'] = parseFloat(line.PlayerScoreProjected)
        out[2023].push(line)
    }
    const lastSavedYear = Math.max(...Object.keys(savedProj).map(x=>parseInt(x)))
    const lastSavedWeek = Math.max(...savedProj[lastSavedYear].map(x=>x.Week))
    if(lastSavedYear==yearMax&&lastSavedWeek>=18){
        setProj(out)
    }
    else{

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
    }
    //     promises.push(fetch(url).then(res=>res.json()).then(json=>{
    //         out = json
    //         let dataCopy = [...missingData]
    //         for(const line of dataCopy){
    //             line.PlayerScoreActual = parseFloat(line.PlayerScoreActual)
    //             line['PlayerScoreProj'] = parseFloat(line.PlayerScoreProjected)
    //             out[2023].push(line)
    //         }
    //         for(const year in out){
    //             out[year] = out[year].sort((a,b)=>a.Week-b.Week)
    //             }
    //         setProj(out)})
                
    // // }))
    //         )
        
        // console.log(out) 
// }//week
// }//year
// Promise.all(promises).then(()=>{
//     // let out = {...json}
//     let dataCopy = [...missingData]
//     for(const line of dataCopy){
//         line.PlayerScoreActual = parseFloat(line.PlayerScoreActual)
//         line['PlayerScoreProj'] = parseFloat(line.PlayerScoreProjected)
//         out[2023].push(line)
//     }
//     for(const year in out){
//         out[year] = out[year].sort((a,b)=>a.Week-b.Week)
//         }
//     setProj(out)})
}