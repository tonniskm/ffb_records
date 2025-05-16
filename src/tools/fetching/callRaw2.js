import { savedRaw } from "./saved_jsons/raw/saved"


export function callRaw(vars,setRaw){
    const yearMax = vars.currentYear
    const lastSavedYear = Math.max(...Object.keys(savedRaw).map(x=>parseInt(x)))
    let out = {...savedRaw}
    if(yearMax<=lastSavedYear){
        setRaw(out)
    }else{
        // const url = 'http://localhost:5432/rawrajan/'+yearMax.toString()
        const url = 'https://mocktion-site.vercel.app/rawrajan/'+yearMax.toString()
        fetch(url,{
            // method:'GET',
            // mode:'cors'
        }).then(res=>res.json()).then(json=>{
    
            for(const year in json){
                if(year<=lastSavedYear){continue}
                json[year] = json[year].sort((a,b)=>a.Week-b.Week)
                if(json[year][0].Score1==0){continue;delete json[year]}
                out[year] = json[year]
            }
            setRaw(out) 
        })
    }
}