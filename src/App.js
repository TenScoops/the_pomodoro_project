import React, { useState } from 'react';
import useLocalStorage from 'use-local-storage';
import './App.css';
import Contents from './Components/Contents';
import Finished from './Components/Finished';
import Howtorate from './Components/Howtorate';
import Logout from './Components/Logout';
import RatingMethod from './Components/RatingMethod';
import Setter from './Components/Setter';
import SetterContext from './Components/SetterContext';
import Chartdisplay from './Components/Sidebarcontent/Chart/Chartdisplay';
import Navbar from './Components/Sidebarcontent/Navbar';
import Sidebar from './Components/Sidebarcontent/Sidebar';
import Synopsis from './Components/Sidebarcontent/Synopsis';
import Theme from './Components/Sidebarcontent/Theme';

import Timer from './Components/Timer';
import Streets from "./imgs/pxfuel.webp";


function App() {

  const[showSetterPage, setShowSetterPage] = useState(false);
  const[showTimerPage, setShowTimerPage] = useState(false);
  const[workMinutes, setWorkMinutes] = useState(1);
  const[numOfBreaks, setNumOfBreaks] = useState(1);
  const[breakMinutes, setBreakMinutes] = useState(10);
  const[showParagraph, setShowParagraph] = useState(true);
  const[showButtons, setShowButtons] = useState(false);
  const[showData, setShowData] = useState(true);
  const[isWorkGreater,setIsWorkGreater] = useState(false);

  const [modalOpen, setModalOpen] = useState(true);
  const [clicked, setClicked] = useState(false);
  const[hasUserRated, setHasUserRated] = useState(false);
  const[cancelTheSession, setCancelTheSession] = useState(false);
  const [blockNum, setBlockNum] = useState(1);
  const[sessionComplete, setSessionComplete] = useState(false);
  const [openTask, setOpenTask] = useState(false);
  const[closeRatingModal, setCloseRatingModal] = useState(false);

  const [sideBar,setSideBar] = useState(true);
  const [hideButton, setHideButton] = useState(true);
  const [synopsis, setSynopsis] = useState(false);
  const [data, setData] = useState(false);
  const [logout, setLogout] = useState(false);
  const [openThemePage,setOpenThemePage] = useState(false);
  const [openHowTo, setOpenHowTo] = useState(false);
  const [openMethod, setOpenMethod] = useState(false);

  const[showClock, setShowClock] = useState(false);
  const [option, setOption] = useState();

  const[theme, setTheme] = useLocalStorage("Themes",Streets);
  
  return (
 

    <div className='App'
    style={{backgroundImage:`url(${theme})`}}>
     {localStorage.removeItem("Theme")}
      <div className='theApp'>
  
        <SetterContext.Provider value ={{
          closeRatingModal,setCloseRatingModal,
          workMinutes,
          breakMinutes,
          setWorkMinutes,
          setBreakMinutes,
          setShowSetterPage,
          setShowTimerPage,
          showTimerPage,
          numOfBreaks,
          setNumOfBreaks,
          setShowParagraph,
          setShowButtons,
          showButtons,
          showData,
          setShowData,
          isWorkGreater,
          setIsWorkGreater,
          modalOpen,
          setModalOpen,
          clicked,
          setClicked,
          hasUserRated,
          setHasUserRated,
          cancelTheSession, 
          setCancelTheSession,
          blockNum,
          setBlockNum,
          sessionComplete, 
          setSessionComplete,
          sideBar,
          setSideBar,
          hideButton, 
          setHideButton,
          synopsis, 
          setSynopsis,
          data, 
          setData,
          openThemePage,
          setOpenThemePage,
          openTask,
          setOpenTask,
          logout,
          setLogout,
          theme, 
          setTheme,
          openHowTo, 
          setOpenHowTo,
          openMethod,
          setOpenMethod,
          showClock, 
          setShowClock,
          option, 
          setOption
        }}>
            <Navbar/>
            { showParagraph&& <Contents/>}
            <div className='theTimerContents'>
              { openMethod&& <RatingMethod/>}
              { showSetterPage&& <Setter/>}
              { showTimerPage && <Timer/> }
              
            </div>
            { sessionComplete&&<Finished/>}
            
            { sideBar&& <Sidebar/>}
            { data&& <Chartdisplay/>}
            { synopsis && <Synopsis/>}
            { openThemePage && <Theme/>}
            { openHowTo&& <Howtorate/>}
    
            { logout&& <Logout/>} 
            
          </SetterContext.Provider>
     
      </div>
     
    </div>
  
  );
}

export default App;
