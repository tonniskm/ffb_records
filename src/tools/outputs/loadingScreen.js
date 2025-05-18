import '../../styles/loadingScreen.css'

export function loadingScreen(){
    let out = <div className='loadContainer'>
        <div>
            <p>Loading...</p>
            <p>Did you know?</p>
            <p>Brenna sucks at fantasy football.</p>
        </div>
        <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        </div>
    return out
}