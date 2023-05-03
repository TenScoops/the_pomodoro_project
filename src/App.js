import './App.css';
import Setter from './Components/Setter';
import Navbar from './Components/Sidebarcontent/Navbar';
import Contents from './Components/Contents';
import { useState } from 'react';
import SetterContext from './Components/SetterContext';
import Timer from './Components/Timer';
import Finished from './Components/Finished';
import Sidebar from './Components/Sidebarcontent/Sidebar';
import Chartdisplay from './Components/Sidebarcontent/Chartdisplay';
import Synopsis from './Components/Sidebarcontent/Synopsis';
import Theme from './Components/Sidebarcontent/Theme';
import Task from './Components/TaskList/Task';
import Logout from './Components/Logout'
import { AuthContextProvider } from './FirebaseAuth/AuthContext';
import useLocalStorage from 'use-local-storage'
import $ from 'jquery'
import Howtorate from './Components/Howtorate'
import RatingMethod from './Components/RatingMethod'
import {BsFullscreen} from 'react-icons/bs'
import Tooltip from "@material-ui/core/Tooltip";
import {withStyles} from "@material-ui/core/styles";
import React, {useCallback} from 'react';
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import {ImStatsBars} from 'react-icons/im';
// const { JSDOM } = require( "jsdom" );
// const { window } = new JSDOM( "" );



function App() {

  const TheTooltip = withStyles({
    arrow:{
      "&::before": {
        backgroundColor: "black",
      }
    },
    tooltip: {
      display:'flex',
      justifyContent:'center',
      alignItems:'center',
      color: "white",
      backgroundColor: "rgb(18, 18, 18)",
      maxWidth:'120px',
      height:'23px',
      fontSize:'13px',
      fontFamily:'kalam',
      marginLeft:'7px',
      marginTop:'20px',
      letterSpacing:'1px'
      // boxShadow: '7px 10px 5px 0px rgba(0,0,0,0.75)',

    }
  })(Tooltip);
  
  // let elem = document.getElementById('theApp')

  // function openFullscreen() {
  //   if (elem.requestFullscreen) {
  //     elem.requestFullscreen();
  //   } else if (elem.webkitRequestFullscreen) { 
  //     elem.webkitRequestFullscreen();
  //   } else if (elem.msRequestFullscreen) { 
  //     elem.msRequestFullscreen();
  //   }
  // }

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

  const[theme, setTheme] = useLocalStorage("Theme","App + plains");
  
  const handle = useFullScreenHandle();
  return (
 
   <FullScreen handle={handle}>
    <div className={theme}>
     
      <div className='theApp'>
      <AuthContextProvider>
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
      
            { openTask&& <Task/>}
            { logout&& <Logout/>}

            
              <div className='fullscreen-button-div'>
                <TheTooltip title = 'Full screen' placement='top' arrow>
                  <button onClick={handle.enter} style={{ margin:'0', borderRadius:'5px', width:'4vmin', height:'4vmin', display:'flex', alignItems:'center',justifyContent:'center'}} 
                    className='fullscreen-button'>  <BsFullscreen style={{fontSize:'4vmin'}}/> </button>
              </TheTooltip>
              </div>
            
            
          </SetterContext.Provider>
        </AuthContextProvider>
     
      </div>
     
    </div>
    </FullScreen>
  
  );
}

export default App;
