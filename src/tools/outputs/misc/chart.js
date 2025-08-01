import { useState,useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Legend, Bar, Cell, ResponsiveContainer, Scatter, ScatterChart } from 'recharts';
import { NamePicker } from './misc';

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((val, i) => val === b[i]);
}

export const Chart = (props) =>{
    
            const dataIn = props.info.data
            const metaIn = props.info.meta
            let {title,desc} = props.info
            let name = props.focus.name
            let year =props.focus.year
            let week = props.focus.week
        
            const containerRef = useRef(null);
            const topRef = useRef(null)
            const [containerHeight, setContainerHeight] = useState(0);
            const [topHeight, setTopHeight] = useState(0);
            // let {name,year,week} = {name:props.focus.focusName,year:props.focus.focusYear,week:props.focus.focusWeek}
            let data = dataIn.filter(x=>true)
            let meta = metaIn.filter(x=>true)
            data.forEach(x=>{
                x.year = parseInt(x?.year||0)
            })
        
            if(arraysEqual(meta,['year', 'week', 't1', 't2', 's1', 's2'])){meta=['year','week']}
            if(arraysEqual(meta,['name', 'year', 'week', 't1', 't2', 's1', 's2'])){meta=['name','year','week']}
        
            const [xAxisPick,setXAxisPick] = useState(meta.includes('name')?'name':'year')
            let sortButton = null
            let xAxis,xAxisButton
            arraysEqual(meta,['name'])?xAxis='name':
            arraysEqual(meta,['year'])?xAxis='year':
            arraysEqual(meta,['year','week'])||arraysEqual(meta,['name','year'])||arraysEqual(meta,['name','year','week'])?xAxis=xAxisPick:
            xAxis='name'
        
            const [sortBy,setSortBy] = useState(xAxis==='name'?'Value':(xAxis==='week'?'Value':'Value'))
        
            const sortPick = <NamePicker title={'Sort By: '} showAll={false} selecting={setSortBy} curval={sortBy} options={['Value','Year']} key={'sb'}></NamePicker>
            const sortPick2 = <NamePicker title={'Sort By: '} showAll={false} selecting={setSortBy} curval={sortBy} options={['Value','Week']} key={'sb1'}></NamePicker>
            const sortPick3 = <NamePicker title={'Sort By: '} showAll={false} selecting={setSortBy} curval={sortBy} options={['Value','Alphabet']} key={'sb2'}></NamePicker>
            // const xAxisPicker = <NamePicker title={'xAxis: '} showAll={false} selecting={setXAxisPick} curval={xAxisPick} options={['name','year']} key={'xxs'}></NamePicker>
            useEffect(()=>{
                if(['Week','Year','Alphabet'].includes(sortBy)){
                    if(xAxisPick==='year'){setSortBy('Year')}
                    if(xAxisPick==='week'){setSortBy('Week')}
                    if(xAxisPick==='name'){setSortBy('Alphabet')}
                }
            },[xAxisPick])
        
              useEffect(() => {
            if (!containerRef.current) return;
        
            const observer = new ResizeObserver((entries) => {
              for (let entry of entries) {
                if (entry.contentRect) {
                  setContainerHeight(entry.contentRect.height);
                }
              }
            });
        
            observer.observe(containerRef.current);
            return () => observer.disconnect();
          }, []);
          useEffect(() => {
            if (!topRef.current) return;
        
            const observer = new ResizeObserver((entries) => {
              for (let entry of entries) {
                if (entry.contentRect) {
                  setTopHeight(entry.contentRect.height);
                }
              }
            });
        
            observer.observe(topRef.current);
            return () => observer.disconnect();
          }, []);
    try{
    
        // if(arraysEqual(meta,['name'])||arraysEqual(meta,['year'])||arraysEqual(meta,['year','week'])||arraysEqual(meta,['name','year'])||arraysEqual(meta,['name','record'])||arraysEqual(meta,['name','recordStarting'])||arraysEqual(meta,['name','teams'])||arraysEqual(meta,['name','year','week'])){ // name bar chart
    
            // if(arraysEqual(meta,['year','week'])){sortButton=xAxisPicker}
    
            if(arraysEqual(meta,['year','week'])){
                xAxisButton = <NamePicker title={'xAxis: '} showAll={false} selecting={setXAxisPick} curval={xAxisPick} options={['week','year']} key={'xxs'}></NamePicker>
            }
            if(arraysEqual(meta,['name','year'])){
                xAxisButton = <NamePicker title={'xAxis: '} showAll={false} selecting={setXAxisPick} curval={xAxisPick} options={['name','year']} key={'xxs'}></NamePicker>
            }
            if(arraysEqual(meta,['name','year','week'])){
                xAxisButton = <NamePicker title={'xAxis: '} showAll={false} selecting={setXAxisPick} curval={xAxisPick} options={['name','year','week']} key={'xxs'}></NamePicker>
            }
            
    
    
            if(xAxis==='year'){
                sortButton = sortPick
                if(sortBy==='Year'){data=data.sort((a,b)=>a.year-b.year)}else{data=dataIn}
            }
            if(xAxis==='week'){
                sortButton = sortPick2
                if(sortBy==='Week'){data=data.sort((a,b)=>a.week-b.week)}else{data=dataIn}
            }
            if(xAxis==='name'){
                sortButton= sortPick3
                if(sortBy==='Alphabet'){data=data.filter(x=>x.name).sort((a,b)=>a.name.localeCompare(b.name))}else(data=dataIn)
            }
            
            const uniqueX = [...new Set(data.map(item => item[xAxis]))];
            if (xAxis==='name'||xAxis==='year'||xAxis==='week'){
                data.forEach(d => {
                    d.xNum = uniqueX.indexOf(d[xAxis]);
                });
                // xAxis='xNum'
            }

            const getMinMax = (data) => {
                const min =  Math.min(...data.map(item => item.value));
                const max = Math.max(...data.map(item => item.value));
                return [min, max];
                };
            function generateTicks(min, max,domain, tickCount = 10) {
                const isIntegers = Number.isInteger(min)&&Number.isInteger(max)
                const range = max-min
                const step = Math.round((max - min) / (tickCount - 1));
                const init = isIntegers&&range>1&&min<10?0:null
                const ticks = [init]
                for (let i = 0; i < tickCount; i++) {
                    const tick = domain[0] + step * i
                    ticks.push(domain[0] + step * i);
                    if(domain[0]+step*i>domain[1]){break}
                }
                return ticks;
                }
            const minMax = getMinMax(data)
            const isIntegers = Number.isInteger(minMax[0])&&Number.isInteger(minMax[1])
            const domainMinMax = isIntegers?[(Math.floor(minMax[0]>0?Math.max(0,Math.min(minMax[0]*0.95)):1.05*minMax[0])), Math.ceil((1.05*minMax[1]))]
            :[(minMax[0]>0?Math.max(0,Math.min(minMax[0]*0.95)):1.05*minMax[0]), (1.05*minMax[1])]
            // const yticks = generateTicks(minMax[0],minMax[1],domainMinMax)
            // console.log(data,yticks,minMax[0],minMax[1])
            // console.log(uniqueX,data,xAxis,meta,sortBy)
            return (
                <div style={{width:'100%',height:'100%',flexDirection:'column'}} ref={containerRef}
                      >
                    <div style={{}} ref={topRef}>
                    <div style={{}}>{sortButton}
                    {xAxisButton}</div>
                    <div style={{gap:0}}><p style={{margin:5}}>{title}</p>
                    <p style={{margin:5}}>{desc}</p></div>
                    </div>
            <div style={{height:containerHeight?containerHeight-topHeight:0,width:'100%'}}>
            <ResponsiveContainer>
            <ScatterChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                dataKey={xAxis==='name'||xAxis==='year'||xAxis==='week'?'xNum':xAxis}
 
                    domain={([min,max])=>[min-1,max+1]}
                    type={'number'}
                    ticks={uniqueX.map((_, i) => i)}// e.g. [0, 1, 2]
                    tickFormatter={(i) => uniqueX[i]}
                     // maps 0 → A, 1 → B...
                // tickFormatter={(i) => uniqueX[i]}
                interval={0} // show **all** labels
                angle={-90}  // rotate labels -45 degrees
                textAnchor="end" // align text so it doesn't overlap
                height={80} // give space for long labels
                // ticks={['2018','2019']}
                tick={{
                    dx: -8,  // shift left or right as needed
                    dy: 0,   // push down so it's under the axis
                    fill:'white',
                }}
                tickLine={{stroke:'white'}}
                />
              <YAxis 
                label={{
                value: '',
                fill:'white',
                angle: -90,
                position: 'insideLeft', // or 'outsideLeft'
                offset: 0,              // adjust spacing from axis
                style: { textAnchor: 'middle' } // center the text vertically
                }}
                tick={{
                    fill:'white'
                }}
                tickLine={{stroke:'white'}}
                domain={domainMinMax}
                tickFormatter={(value) => isIntegers?value.toFixed(0):value.toFixed(2)}
                // ticks={yticks}
                // domain = {([min1,max1])=>[min1-5,max1+5]}
                // domain={['dataMin -5','dataMax +5']}
    
                />
              <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload;
                    const out = []
                    if(d.name){out.push(<p key={'a'}>{d.name}</p>)}
                    if(d.year>0){out.push(<p key={'b'}>Year: {d.year}</p>)}
                    if(d.week){out.push(<p key={'c'}>Week: {d.week}</p>)}
                    out.push(<p key={'d'}>{d.value}</p>)
    
    
                    return (
                        <div style={{ backgroundColor: '#282c34', padding: 10, border: '1px solid black' }}>
                            {out}
                        </div>
      );
    }} />
              {/* <Legend /> */}
              <Scatter dataKey="value">
                {data.map((entry, index) => (
                    <Cell
                    key={`cell-${index}`}
                    fill={
                        (entry.week==week&&entry.year!=year)?'blue':
                        (entry.week!=week&&entry.year==year)?'orange':
                        (entry.week == week && entry.year == year)? 'green':
                        (entry.name === name || entry.year == year || entry.week== week) ? 'blue' : 'red'
                    }
                    />
                ))}
            </Scatter>
            </ScatterChart>
            </ResponsiveContainer>
            </div>
                </div>
          );
    }//try
    catch(e){console.log(e);return(<div>
        <p>If you see this, tell Kevin it failed.</p>
        <p>{title}</p>
        <p>{sortBy}</p>
        <p>{xAxis}</p>
        <p>{e.message}</p></div>)}
    
}