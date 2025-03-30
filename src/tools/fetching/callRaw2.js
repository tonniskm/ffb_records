

export function callRaw(vars,setRaw){
    const yearMax = vars.currentYear
    // const url = 'http://localhost:5432/rawrajan/'+yearMax.toString()
    const url = 'https://mocktion-site.vercel.app/rawrajan/'+yearMax.toString()
    fetch(url,{
        // method:'GET',
        // mode:'cors'
    }).then(res=>res.json()).then(json=>{

        for(const year in json){
            json[year] = json[year].sort((a,b)=>a.Week-b.Week)
        }
        // console.log(json)
        setRaw(json) 
    })
}