import './CSS/Setter.css';
import React, { useContext } from 'react';
import ReactSlider from 'react-slider';
import Backbutton from './Buttons/Backbutton';
import Nextbutton from './Buttons/Nextbutton';
import SetterContext from './SetterContext';
import Clock from './Buttons/Clock';

const Setter = () => {
  const setterInfo = useContext(SetterContext);

  const goForward = () =>{
    setterInfo.setShowParagraph(false)
    setterInfo.setShowTimerPage(true);
    setterInfo.setShowButtons(true);
    setterInfo.setShowData(false);
  }
  const goBack = () =>{
    setterInfo.setShowSetterPage(false);
    setterInfo.setShowTimerPage(false);
    
  }
  const breaks = setterInfo.numOfBreaks === 1? "break":"breaks";
  return (
    <div className='setter'>
        <h1 className='header'>My Session </h1>
          
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
          <Backbutton title ="Back" onClick={() => {goBack()}}/>
          <Clock  title ="Show clock" onClick={() =>{setterInfo.showTimerPage === false?setterInfo.setShowTimerPage(true):setterInfo.setShowTimerPage(false)}}/>
          <Nextbutton title ="Start"onClick={() => {goForward()}}/>
        </div>
    </div>
  )
} 

export default Setter