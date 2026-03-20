import '../../styles/loadingScreen.css'

export function loadingScreen(vars){
    let loser = null
    if(vars.leagueID === 'rajan'){
        loser = 'Nate'
    }
    else if (vars.leagueID === 'sfc'){
        loser = 'Matt'
    }
    else if (vars.leagueID === 'schulte'){loser = 'Alison'}
    else if (vars.leagueID === 'college'){loser = 'asdf'}
    let out = <div className='loadContainer'>
        <div>
            <p>Loading...</p>
            <p>Did you know?</p>
            <p>{loser} sucks at fantasy football.</p>
        </div>
        <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        </div>
    return out
}