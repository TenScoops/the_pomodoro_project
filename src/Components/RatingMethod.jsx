import React, { useContext, useState } from 'react';
import './CSS/RatingMethod.css'
import SetterContext from './SetterContext';
import {BsArrowRight,BsArrowLeft} from 'react-icons/bs';
import {AiOutlineCheck} from 'react-icons/ai';

const RatingMethod = ()=>{
    const setterInfo = useContext(SetterContext);
    
    const [chosen, setChosen] = useState(false);
    const goForward = () =>{
        // setterInfo.setShowParagraph(false)
        
        // setterInfo.setShowTimerPage(true);
       
        // setterInfo.setShowData(false);
        setterInfo.setShowSetterPage(false)
        setterInfo.setShowButtons(true);
        setterInfo.setShowClock(true);
        setterInfo.setOpenMethod(false);
      }
      const goBack = () =>{
        setterInfo.setShowSetterPage(true);
        setterInfo.setOpenMethod(false);
        setterInfo.setShowData(true);
        setChosen(false);
        // setterInfo.setShowTimerPage(false);
        // setterInfo.setShowParagraph(true);
        // setterInfo.setClicked(false);
        
      }
    return (
      <div className='theRatingMethodDiv'>
          <div className='theRatingMethod' style={{display:'flex', justifyContent:'center', 
          alignItems:'center', flexDirection:'column', height:'360px', width:'360px',backgroundColor:'#1e212d'}}>
            
              <h3 style={{marginTop:'60px', marginBottom:'20px'}}>How will you be rating your session?</h3>
            
              <label style={{marginBottom:'15px', fontSize:'18px', marginRight:'15px', cursor:'pointer'}}>
                  <input style={{cursor:'pointer'}} type='radio' name='option' value='block' onChange={e=>setterInfo.setOption(e.target.value)} onClick={()=>{setChosen(true)}}/>I'll be rating by block
              </label>
              
              <label style={{marginBottom:'15px', fontSize:'18px', marginLeft:'13px', marginBottom:'20px', marginRight:'15px', cursor:'pointer'}}
                      >
                  <input style={{cursor:'pointer'}} value='session' name='option' onChange={e=>setterInfo.setOption(e.target.value)} type='radio' onClick={()=>{setChosen(true)}}/>I'll be rating by session
              </label>
              
              {/* <p style={{fontSize:'13px', fontStyle:'italic'}}> "Please choose one to proceed"</p> */}
              {console.log(setterInfo.option)}

              <div className='nextbackbuttons'>
                  <button className='backbutton' title ="Back" onClick={() => {goBack()}}><BsArrowLeft style={{fontSize:'42px'}}/></button>
              

                  {setterInfo.clicked?null:<button className='nextbutton' title ="Next" 
                  onClick={() =>{ setterInfo.setClicked(true); {setterInfo.showTimerPage?setterInfo.setShowTimerPage(false):setterInfo.setShowTimerPage(true)}}}>
                  <BsArrowRight style={{fontSize:'42px', marginLeft:'4px'}}/>
                  </button>}  
                  {/* {Dropdown()} */}
                  
                  {chosen?<button className='checkbutton' title ="Start"onClick={() => {goForward()}}>
                  <AiOutlineCheck style={{fontSize:'42px', marginLeft:'4px'}}/>
                  </button>:<button className='checkbutton' style={{backgroundColor:'#1e212d'}}></button>}
                </div>
          </div>
        </div>

    )
}

export default RatingMethod;