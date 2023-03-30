import './CSS/Setter.css';
import React, { useContext,useState } from 'react';
import ReactSlider from 'react-slider';
import Backbutton from './Buttons/Backbutton';
import Nextbutton from './Buttons/Nextbutton';
import SetterContext from './SetterContext';
import Clock from './Buttons/Clock';
import {BsFileText,BsArrowRight,BsArrowLeft} from 'react-icons/bs';
import {AiOutlineCheck} from 'react-icons/ai';



const Setter = () => {
  const setterInfo = useContext(SetterContext);

  const[clickedNext,hasClickedNext] = useState(false);

  const goForward = () =>{
    // setterInfo.setShowParagraph(false)
    setterInfo.setShowSetterPage(false)
    setterInfo.setShowTimerPage(true);
    setterInfo.setShowButtons(true);
    setterInfo.setShowData(false);
  }
  const goBack = () =>{
    setterInfo.setShowSetterPage(false);
    setterInfo.setShowTimerPage(false);
    setterInfo.setShowParagraph(true);
    setterInfo.setClicked(false);
    
  }

  const hasClicked = () =>{
    setterInfo.setShowTimerPage(false)
  }
  const breaks = setterInfo.numOfBreaks === 1? "break":"breaks";

  const taskButton = () =>{
    return <button onClick={()=>{setterInfo.setOpenTask(true)}} className='clockbutton'>
         <BsFileText style={{fontSize:'42px', paddingLeft:'3px'}}/>
         </button>
 }

  return (
    <div className='divsetter'>
      <div className='setter'>
          <h1 className='header'>Create a session </h1>
            
          <p>{setterInfo.workMinutes} hour session</p>
          <ReactSlider 
            className={'slider'}
            thumbClassName={'thumb'}
            trackClassName={'track'}
            value={setterInfo.workMinutes}
            onChange={newValue => setterInfo.setWorkMinutes(newValue)}
            min={1}
            max={24}
          />

          <p>{setterInfo.numOfBreaks} {breaks}</p>
          <ReactSlider className={"slider"}
            thumbClassName={'thumb'}
            trackClassName={'track'}
            value={setterInfo.numOfBreaks}
            onChange={newValue => setterInfo.setNumOfBreaks(newValue)}
            min={0}
            max={30}
          />

          <p>{setterInfo.breakMinutes} Mins per break</p>
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
            {/* {taskButton()} */}
            {setterInfo.clicked?null:<button className='nextbutton' title ="Next" 
            onClick={() =>{ setterInfo.setClicked(true); {setterInfo.showTimerPage?setterInfo.setShowTimerPage(false):setterInfo.setShowTimerPage(true)}}}>
              <BsArrowRight style={{fontSize:'42px', marginLeft:'4px'}}/>
              </button>}

            {setterInfo.clicked?<button className='checkbutton' title ="Start"onClick={() => {goForward()}}>
              <AiOutlineCheck style={{fontSize:'42px', marginLeft:'4px'}}/>
              </button>:null}
          </div>
      </div>
    </div>
  )
} 

export default Setter