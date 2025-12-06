import { getAllNames } from "./src/tools/calculations/getNames.js";
import { getPlayerIDInfo } from "./src/tools/fetching/fetch_id_info.js";

const currentYear = new Date().getFullYear();
let leagueID = 'rajan'

  const lameDucks = ['t0','Rick Melgard','Andre Simonson','Uncle Steve','Regan Crone','Jake Knapke']
  const teamnos = [1, 2, 4, 7, 10, 11, 12, 13, 14, 15, 16, 17]
  const defunct = [0, 3, 5, 6, 8, 9] 
  const allNames = getAllNames(leagueID)
  const vars = {allNames,currentYear}
getPlayerIDInfo(vars)