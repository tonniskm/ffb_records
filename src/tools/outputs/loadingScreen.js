

export function loadingScreen(){
    let out = <div>
        <div><p>Retrieving ESPN data.  This usually takes about 20 seconds.</p></div>
        <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        </div>
    return out
}