const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Sample API endpoint
app.get("/api/message", (req, res) => {
    const year = 2024
    // const league_id = 2127
    const league_id = 596787
    const swid = '056525DF-9B33-448C-A525-DF9B33848CDA'
    const espn_s2 = 'AECaBhX7MIZ8OjeGKzFCtpaEYbn%2FNM4OWPheCNdn7Kcg4Xh5kkhW8wplHrbrgol45tGsGPjKN%2BfhrYyADkLa%2Fqs4EVOmUuSMREa%2F%2BJT6EMxB82UY25q%2BjBSyG21rN70bI6RoWwWCUWC17j6QXTmYK10iBRzYSIUujn%2FE1eb%2F6yykZ9%2B8jhWRO8hu2VIgU7Kq3Pwnt62E2GQUS80zLaBGLvo%2FYnLnw3BD4eLYPSH9iN5Sl9Yb4m%2Bw%2BvCTG5tGLY4IbCu%2Bx25%2BHOOD9pQ83DVD0jzn'
    let url = 'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/'+ year.toString() + '/segments/0/leagues/' +league_id.toString() +'?view=mMatchup'
    const d = new Date();
    d.setTime(d.getTime() + (1*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    // let cook = ('SWID='+swid+';SameSite=None; Secure; Path=/; '+expires+"; espn_s2="+espn_s2+';SameSite=None; Secure; Path=/; '+expires+';').toString()
    let cook = ('SWID='+swid+'; Path=/; '+expires+"; espn_s2="+espn_s2+'; Path=/; '+expires+';').toString()
    console.log(cook)
    fetch(url,{
        method:'GET',
        credentials:'include',
        headers:{Cookie:cook}
    }).then(response=>{
        console.log(response.status)
        res.json({ 'message': response.status })
    }
    )
})
    
;

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
