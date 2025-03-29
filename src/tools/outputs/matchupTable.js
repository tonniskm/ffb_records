

export function matchupTable(dict,focusName){
    let cols = []
    let col1 = []
    for(const name in dict){
        if(name=='t0'){continue}
        col1.push(<div className="headerCell"><p className="txt">{name}</p></div>)
    }
    cols.push(<div className="tableRow">
        <div className="headerCell">name</div>
        {col1}
    </div>)
    for(const name1 in dict){
        if(name1=='t0'){continue}
        let colbody =[]
        if(focusName!='All'&&name1!=focusName){continue}
        for(const name2 in dict[name1]){
            if(name2=='t0'){continue}
            const val = dict[name1][name2][0] +' - '+dict[name1][name2][1]+' - '+dict[name1][name2][2]
            colbody.push(<div className="tableCell recordCell"><p className="txt">{val}</p></div>)
        }
            cols.push(<div className="tableRow">
                        <div className="headerCell"><p className="txt">{name1}</p></div>
                        {colbody}
                    </div>)

    }
const out = <div className="tableContainer">
    {cols}
    {/* <p>helloworld</p> */}
</div>
// console.log(cols)
// const out = <p>hello world</p>
return out
}