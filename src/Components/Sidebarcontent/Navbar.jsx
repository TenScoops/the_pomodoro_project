import React, { useContext} from 'react'
import './CSS/Navbar.css';
import SetterContext from '../SetterContext';
import {IoIosArrowForward} from 'react-icons/io'


const Navbar = () => {
  const navbarInfo = useContext(SetterContext);
  return (
    <div className='nav'>
      <div className='barsdiv'>
        
        {navbarInfo.hideButton?null:
        <button onClick={()=>{(navbarInfo.sideBar === false? navbarInfo.setSideBar(true):navbarInfo.setSideBar(true)); navbarInfo.setHideButton(true)}} className='bars2'>
          <IoIosArrowForward style={{fontSize:'20px'}}/>
        </button>}

      </div>
    </div>
  )
}

export default Navbar