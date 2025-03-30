import { missingData } from "./missing2023w1";

export function callProj(vars,setProj){
    const yearMax = vars.currentYear
    // const url = 'http://localhost:5432/projrajan/'+yearMax.toString()+'/18'
    const url = 'https://mocktion-site.vercel.app/projrajan/'+yearMax.toString()+'/18'
    
    fetch(url).then(res=>res.json()).then(json=>{
        let out = {...json}
        let dataCopy = [...missingData]
        for(const line of dataCopy){
            line.PlayerScoreActual = parseFloat(line.PlayerScoreActual)
            line['PlayerScoreProj'] = parseFloat(line.PlayerScoreProjected)
            out[2023].push(line)
        }
        for(const year in out){
            out[year] = out[year].sort((a,b)=>a.Week-b.Week)
        }
        // console.log(out) 
        setProj(out)})
}