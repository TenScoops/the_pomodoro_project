import './CSS/Setter.css';
import React, { useContext,useState } from 'react';
import ReactSlider from 'react-slider';
import SetterContext from './SetterContext';
import {BsFileText,BsArrowRight,BsArrowLeft} from 'react-icons/bs';
import {AiOutlineCheck} from 'react-icons/ai';
// import Dropdown from 'react-dropdown';
// import 'react-dropdown/style.css';

const Setter = () => {
  const setterInfo = useContext(SetterContext);

  // const[clickedNext,hasClickedNext] = useState(false);
  const[ratingMethod, setRatingMethod] = useState(true);
  const [method, setMethod]= useState();

  const goForward = () =>{
    // setterInfo.setShowParagraph(false)
    setterInfo.setShowSetterPage(false)
    // setterInfo.setShowTimerPage(true);
    // setterInfo.setShowButtons(true);
    setterInfo.setShowData(false);
    setterInfo.setOpenMethod(true);
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

//   const taskButton = () =>{
//     return <button onClick={()=>{setterInfo.setOpenTask(true)}} className='clockbutton'>
//          <BsFileText style={{fontSize:'42px', paddingLeft:'3px'}}/>
//          </button>
//  }

 const reactSlider = () =>{
    return <div style={{display:'flex', alignItems:'center', 
    justifyContent:'center',flexDirection:'column'}}>
    
 </div>
 }
const Dropdown = () =>{
  return <div className='dropDown'>
    <ul>
      <p>block</p>
      <p>session</p>
    </ul>
  </div>
}

 //--------------------------------
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
            {/* {taskButton()} */}

            {/* <button
            style={{fontSize:'14px', fontFamily:'kalam', borderColor:'rgba(255, 255, 255, 0.5)', borderRadius:'10px', width:'200px'}}>I'll be rating by... session</button> */}

            {setterInfo.clicked?null:<button className='nextbutton' title ="Next" 
            onClick={() =>{ setterInfo.setClicked(true); {setterInfo.showTimerPage?setterInfo.setShowTimerPage(false):setterInfo.setShowTimerPage(true)}}}>
              <BsArrowRight style={{fontSize:'42px', marginLeft:'4px'}}/>
              </button>}  
              {/* {Dropdown()} */}
             
            {setterInfo.clicked?<button className='checkbutton' title ="Next"onClick={() => {goForward()}}>
              <BsArrowRight style={{fontSize:'42px', marginLeft:'4px'}}/>
              </button>:null}
          </div>
      </div>
    </div>
  )
} 

export default Setter