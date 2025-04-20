import { useEffect, useRef, useState } from "react"
import { findTopRow } from "./misc";

export default function SuggestionInput(suggestionsList,choice,setChoice,scrollInfo=null,freezeScroll=false) {
    const [input, setInput] = useState('');
    const [filtered, setFiltered] = useState([]);
    const containerRef = useRef(null);
  
    const handleChange = (e) => {
      const val = e.target.value;
      setInput(val);
      setFiltered(
        suggestionsList.filter((item) =>
          item.toLowerCase().includes(val.toLowerCase())
        )
      );
    };
  
    useEffect(()=>{
        if(choice==='All'){setInput('')}
    },[choice])
    // Optional: close suggestions when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
          setFiltered([]);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
  
    return (
        <div
        key={'suggest'}
        ref={containerRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginLeft: '20px',
          justifyContent:'center',
          paddingBottom:'10px'
        }}
      >
        <label style={{ color: 'white' }}>NFL Name:</label>
      
        <div style={{ position: 'relative', width: '200px' }}>
          <input
            type="text"
            value={input}
            onChange={handleChange}
            style={{ width: '100%' }}
          />
          {filtered.length > 0 && (
            <ul
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ccc',
                margin: 0,
                padding: 0,
                listStyle: 'none',
                zIndex: 10,
              }}
            >
              {filtered.slice(0, 5).map((item, i) => (
                <li
                  key={i}
                  onClick={() => {
                    if(freezeScroll){
                      const {scrollRef,stickyRef,id,rowRef} = scrollInfo
                      rowRef.current = findTopRow(scrollRef,stickyRef,id)
                    }
                    setInput(item);
                    setChoice(item);
                    setFiltered([]);
                  }}
                  style={{ padding: '8px', cursor: 'pointer', color: 'black' }}
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
    );
  }
  