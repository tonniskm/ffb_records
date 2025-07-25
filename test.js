require('@babel/register')({
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  // You can add babel config here if needed
});

import { predone } from "./src/tools/calculations/draft/predone.js";
// const {predone} = require('./src/tools/calculations/draft/predone')
const {getPlayerIDInfo} = require('./src/tools/fetching/fetch_id_info')
// import { getPlayerIDInfo } from "./src/tools/fetching/fetch_id_info";


// console.log(predone.filter(x=>true))
(async ()=>{

    const kevin = predone.filter(x=>x.name==='Kevin'&&x.age)
    console.log(kevin)
    let totage = 0
    for(let i=0;i<kevin.length;i++){
        const line = kevin[i]
        totage += line.age
    }
    const avg = totage/kevin.length
    const oldies = kevin.filter(x=>x.age>30)
    console.log(avg)
    console.log(oldies)
    const currentYear = new Date().getFullYear();
    const names2012 = ['t0', 'Andrew', 'Brian', 'Rick Melgard', 'Stephen', 'Andre Simonson', 'Kevin', 'Eric',
        'Nick', 'Jake Knapke', 'Brenna', 'Uncle Steve', 'Regan Crone', 'RJ', 'Claire', 'Lance', 'Adam', 'Nate']
      const names = ['t0', 'Andrew', 'Brian', 'Rick Melgard', 'Stephen', 'Andre Simonson', 'Uncle Steve', 'Eric',
        'Regan Crone', 'Jake Knapke', 'Brenna', 'RJ', 'Nick', 'Kevin', 'Claire', 'Lance', 'Adam', 'Nate']
      const names2022 = ['t0', 'Andrew', 'Joey', 'Rick Melgard', 'Stephen', 'Andre Simonson', 'Uncle Steve', 'Eric',
        'Regan Crone', 'Jake Knapke', 'Brenna', 'RJ', 'Nick', 'Kevin', 'Claire', 'Lance', 'Adam', 'Nate']
      const lameDucks = ['t0','Rick Melgard','Andre Simonson','Uncle Steve','Regan Crone','Jake Knapke']
      const teamnos = [1, 2, 4, 7, 10, 11, 12, 13, 14, 15, 16, 17]
      const defunct = [0, 3, 5, 6, 8, 9] 
      const allNames = [...new Set([...names,...names2012,...names2022])]
      const vars = {allNames,currentYear}
    await getPlayerIDInfo(vars)
})()