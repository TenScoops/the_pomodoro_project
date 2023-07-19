import './CSS/Setter.css';
import React, { useContext } from 'react';
import ReactSlider from 'react-slider';
import SetterContext from './SetterContext';
import {BsArrowRight,BsArrowLeft} from 'react-icons/bs';


const Setter = () => {
  const setterInfo = useContext(SetterContext);

  const goForward = () =>{
    setterInfo.setShowSetterPage(false)
    setterInfo.setShowButtons(true);
    setterInfo.setShowClock(true);
    // setterInfo.setShowSetterPage(false)
    setterInfo.setShowData(false);
    // setterInfo.setOpenMethod(true);
  }
  const goBack = () =>{
    setterInfo.setShowSetterPage(false);
    setterInfo.setShowTimerPage(false);
    setterInfo.setShowParagraph(true);
    setterInfo.setClicked(false);
    
  }

  const breaks = setterInfo.numOfBreaks === 1? "break":"breaks";


 //----------------------------------------------------------------
  return (
    <div className='divsetter'>
       
      <div className='setter'>
        
          <h1 className='header'style={{}}>Create a session </h1>
          <p className='session-label'>{setterInfo.workMinutes} hour session</p>
        
          <ReactSlider 
            className={'slider'}
            thumbClassName={'thumb'}
            trackClassName={'track'}
            value={setterInfo.workMinutes}
            onChange={newValue => setterInfo.setWorkMinutes(newValue)}
            min={1}
            max={12}
          />

          <p className='session-label'>{setterInfo.numOfBreaks} {breaks}</p>
          <ReactSlider className={"slider"}
            thumbClassName={'thumb'}
            trackClassName={'track'}
            value={setterInfo.numOfBreaks}
            onChange={newValue => setterInfo.setNumOfBreaks(newValue)}
            min={0}
            max={20}
          />

          <p className='session-label'>{setterInfo.breakMinutes} Mins per break</p>
          <ReactSlider className={"slider"}
            thumbClassName={'thumb'}
            trackClassName={'track'}
            value={setterInfo.breakMinutes}
            onChange={newValue => setterInfo.setBreakMinutes(newValue)}
            min={1}
            max={60}
          />
          
          <div className='nextbackbuttons'>
            <button className='backbutton' title ="Back" onClick={() => {goBack()}}><BsArrowLeft style={{fontSize:'42px'}}/></button>

            {setterInfo.clicked?null:<button className='nextbutton' title ="Next" 
            onClick={() =>{ setterInfo.setClicked(true); {setterInfo.showTimerPage?setterInfo.setShowTimerPage(false):setterInfo.setShowTimerPage(true)}}}>
              <BsArrowRight style={{fontSize:'42px', marginLeft:'4px'}}/>
              </button>}  
             
            {setterInfo.clicked?<button className='checkbutton' title ="Next"onClick={() => {goForward()}}>
              <BsArrowRight style={{fontSize:'42px', marginLeft:'4px'}}/>
              </button>:null}
          </div>
      </div>
    </div>
  )
} 

export default Setter