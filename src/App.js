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

  
  
  return (
    <div className="App">
      
      <div className='theApp'>
      <AuthContextProvider>
        <SetterContext.Provider value ={{
          closeRatingModal,
          setCloseRatingModal,
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
          setLogout
          
          
        }}>
            <Navbar/>
            { showParagraph? <Contents/>:null}
            <div className='theTimer'>
              { showSetterPage? <Setter/>: null}
              { showTimerPage ? <Timer/> : null}
            </div>
            { sessionComplete?<Finished/>:null}
            
            { sideBar ? <Sidebar/>:null}
            { data ? <Chartdisplay/>:null}
            { synopsis ? <Synopsis/>: null}
            { openThemePage ? <Theme/>: null}
      
            { openTask? <Task/>: null}
            { logout? <Logout/>:null}
     
          </SetterContext.Provider>
        </AuthContextProvider>
     
      </div>
     
    </div>
  );
}

export default App;
