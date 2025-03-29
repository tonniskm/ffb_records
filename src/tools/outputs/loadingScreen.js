

export function loadingScreen(){
    let out = <div>
        <div><p>Retrieving ESPN data.  This usually takes about 20 seconds to 1 minute.  ESPN's API sucks.</p></div>
        <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        </div>
    return out
}