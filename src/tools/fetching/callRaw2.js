

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
            if(json[year][0].Score1==0){delete json[year]}
        }
        // console.log(json)
        // json[2024] = json[2024].filter(x=>x.Week==1)
        setRaw(json) 
    })
}