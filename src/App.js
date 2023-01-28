import './App.css';
import Setter from './Components/Setter';
import Navbar from './Components/Sidebarcontent/Navbar';
import Contents from './Components/Contents';
import { useState } from 'react';
import SetterContext from './Components/SetterContext';
import Timer from './Components/Timer';
import Finished from './Components/Finished';
import Sidebar from './Components/Sidebarcontent/Sidebar';
import Datadisplay from './Components/Sidebarcontent/Datadisplay';
import Synopsis from './Components/Sidebarcontent/Synopsis';
import Theme from './Components/Sidebarcontent/Theme';
import Login from './Components/Sidebarcontent/Login';
import Task from './Components/TaskList/Task';


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
  // const [clicked, setClicked] = useState(false);
  const[hasUserRated, setHasUserRated] = useState(false);
  const[cancelTheSession, setCancelTheSession] = useState(false);
  const [blockNum, setBlockNum] = useState(1);
  const[sessionComplete, setSessionComplete] = useState(false);
  const [openTask, setOpenTask] = useState(false);

  const [sideBar,setSideBar] = useState(true);
  const [hideButton, setHideButton] = useState(true);
  const [synopsis, setSynopsis] = useState(false);
  const [data, setData] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginDup, setLoginDup] = useState(false);
  const [openThemePage,setOpenThemePage] = useState(false);

  
  return (
    <div className="App">
      
      <div className='theApp'>
      
        <SetterContext.Provider value ={{
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
          // clicked,
          // setClicked,
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
          data, setData,
          loginOpen, 
          setLoginOpen,
          loginDup,
          setLoginDup,
          openThemePage,
          setOpenThemePage,
          openTask,
          setOpenTask
          
          
        }}>
          <Navbar/>
          { showParagraph? <Contents/>:null}
          { showSetterPage? <Setter/>: null}
          { showTimerPage ? <Timer/> : null}
          
          { sessionComplete?<Finished/>:null}
          
          { sideBar ? <Sidebar/>:null}
          { data ? <Datadisplay/>:null}
          { synopsis ? <Synopsis/>: null}
          { openThemePage ? <Theme/>: null}
          { loginOpen ? <Login/>: null}
    
          { openTask? <Task/>: null}
          
     
        </SetterContext.Provider>
      
     
      </div>
     
    </div>
  );
}

export default App;
