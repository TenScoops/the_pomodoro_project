import './App.css';
import Setter from './Components/Setter';
import Navbar from './Components/Sidebarcontent/Navbar';
import Contents from './Components/Contents';
import { useState } from 'react';
import SetterContext from './Components/SetterContext';
import Timer from './Components/Timer';
import Finished from './Components/Finished';
// import setup from './Images/setup.jpeg';
// import './Images';
// import setup from'./Images/setup.jpeg';



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
  

  // let shows =()=>{
  //   if(showParagraph === true){
  //    return showSetterPage ? <Setter/> :  <Contents/>
  //   }else{
  //     return null;
  //   }
  // }
  
  return (
    <div className="App">

      <Navbar/>
      {/* <Data/>
      <Synopsis/> */}
      
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
          clicked,
          setClicked,
          hasUserRated,
          setHasUserRated,
          cancelTheSession, 
          setCancelTheSession,
          blockNum,
          setBlockNum,
          sessionComplete, 
          setSessionComplete
          
        }}>
          {/* {shows()} */}
          {showParagraph? <Contents/>:null}
          {showSetterPage? <Setter/>: null}
          {showTimerPage ? <Timer/> : null}
          
          {/* {sessionComplete?setShowTimerPage(false):null} */}
          {sessionComplete?<Finished/>:null}
          
          
            
        </SetterContext.Provider>
      
      </div>
     
    </div>
  );
}

export default App;
