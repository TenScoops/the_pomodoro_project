import React, { useContext} from 'react'
import './Navbar.css';
import SetterContext from '../SetterContext';

const Navbar = () => {
  const navbarInfo = useContext(SetterContext);
  return (
    <div className='nav'>
      <div className='barsdiv'>
        
        {navbarInfo.hideButton?null:<button onClick={()=>{(navbarInfo.sideBar === false? navbarInfo.setSideBar(true):navbarInfo.setSideBar(true)); navbarInfo.setHideButton(true)}} className='bars2'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
            <path fill-rule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
          </svg>
        </button>}
        
       
          
           
       

      </div>
    </div>
  )
}

export default Navbar