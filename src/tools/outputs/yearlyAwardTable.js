import { DictKeysWithValue } from "../calculations/other"
// import { styleSheet } from "../styles/styles"


export function yearlyAwardTable(dict){
    let out = []
    let rows = []
    
    for (const key in dict){
        if(key=='league reg pts'){continue}
        const value = Math.round(100*dict[key][0])/100
        let owner = dict[key][1]
        if(Array.isArray(owner)){owner=owner.join(', ')}
        rows.push(
            <div className="tableRow">
                <div className="headerCell"><p className="txt">{key}</p></div>
                <div className="tableCell"><p className="txt">{value}</p></div>
                <div className="tableCell"><p className="txt">{owner}</p></div>
            </div>

        )
    }
    // out.push(<div className="tableColumn">
    //     {cols}
    // </div>)
    // console.log({1:out,2:dict})
    out = <div className="tableContainer">
        {rows}
    </div>
    return out

}