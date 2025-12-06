
const namesDict = {
  rajan:{2012: ['t0', 'Andrew', 'Brian', 'Rick Melgard', 'Stephen', 'Andre Simonson', 'Kevin', 'Eric',
    'Nick', 'Jake Knapke', 'Brenna', 'Uncle Steve', 'Regan Crone', 'RJ', 'Claire', 'Lance', 'Adam', 'Nate'],
  2013: ['t0', 'Andrew', 'Brian', 'Rick Melgard', 'Stephen', 'Andre Simonson', 'Uncle Steve', 'Eric',
    'Regan Crone', 'Jake Knapke', 'Brenna', 'RJ', 'Nick', 'Kevin', 'Claire', 'Lance', 'Adam', 'Nate'],
  2022: ['t0', 'Andrew', 'Joey', 'Rick Melgard', 'Stephen', 'Andre Simonson', 'Uncle Steve', 'Eric',
    'Regan Crone', 'Jake Knapke', 'Brenna', 'RJ', 'Nick', 'Kevin', 'Claire', 'Lance', 'Adam', 'Nate']
  },
  'schulte':{
    2023:['t0','Carolyn','Alison','Sam','Noah','Michelle','Frank','Myles','Kevin T','Nate','Dave'],
    2024:['t0','Carolyn','Alison','Sam','Noah','Michelle','Frank','Myles','Kevin T','Brian','Dave','Nate'],
    2025:['t0','Carolyn','Alison','Sam','Noah','Michelle','Frank','Kevin C','Kevin T','Brian','Dave','Nate']
  },
  'sfc':{
    2025:['t0','Carolyn','Matt','Kristen','Kevin','Tim','Andy','Burns','JP','Daniel','Steve','Wagners','Fr. McCullough']
  }
}

const lameDucksDict = {
  rajan: ['t0','Rick Melgard','Andre Simonson','Uncle Steve','Regan Crone','Jake Knapke'],
  'schulte':['t0'],
  'sfc':['t0']
}
export const getNames = (leagueID, year) => {
  const namesList = namesDict[leagueID];
  if (!namesList) return [];
  
  // If the exact year exists, return it
  if (namesList[year]) {
    return namesList[year];
  }
  
  // Find the most recent year that is <= the requested year
  const availableYears = Object.keys(namesList).map(y => parseInt(y)).sort((a, b) => a - b);
  let mostRecentYear = availableYears[0]; // default to earliest year
  
  for (const availableYear of availableYears) {
    if (availableYear <= year) {
      mostRecentYear = availableYear;
    } else {
      break;
    }
  }
  
  return namesList[mostRecentYear];
}

export const getAllNames = (leagueID) => {
  const namesList = namesDict[leagueID];
  if (!namesList) return [];
  
  const allNames = new Set();
  Object.values(namesList).forEach(yearNames => {
    yearNames.forEach(name => allNames.add(name));
  });
  
  return Array.from(allNames);
}

export const getLameDucks = (leagueID) => {
  
    return lameDucksDict[leagueID] || [];

}