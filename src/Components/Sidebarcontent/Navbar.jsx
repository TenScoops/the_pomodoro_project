import React, { useState } from 'react'
import './Navbar.css';
import Sidebar from './Sidebar';
import SetterContext from '../SetterContext';
import Synopsis from './Synopsis';
import Datadisplay from './Datadisplay';

const Navbar = () => {
  const [sideBar,setSideBar] = useState(true);
  const [hideButton, setHideButton] = useState(false);
  const [synopsis, setSynopsis] = useState(false);
  const [data, setData] = useState(false);
  return (
    <div className='nav'>
      <div className='barsdiv'>
        
        {hideButton?null:<button onClick={()=>{(sideBar === false? setSideBar(true):setSideBar(true)); setHideButton(true)}} className='bars2'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
            <path fill-rule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
          </svg>
        </button>}
        
        <SetterContext.Provider value ={{
          sideBar,
          setSideBar,
          hideButton,
          setHideButton,
          synopsis,
          setSynopsis,
          data,
          setData
        }}>
          
           { sideBar ? <Sidebar/>:null}
           { data ? <Datadisplay/>:null}
           { synopsis ? <Synopsis/>: null}
           {}
           {}
        </SetterContext.Provider>
       

      </div>
    </div>
  )
}

export default Navbar