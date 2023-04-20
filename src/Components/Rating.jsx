import React, { useContext } from 'react';
import Modal from "react-modal";
import { useState } from 'react';
import './CSS/Rating.css';
import SetterContext from './SetterContext';
// import Position from 'rsuite/esm/Overlay/Position';


const Rating = () => {
  const [modalOpen, setModalOpen] = useState(true);

  const ratingInfo = useContext(SetterContext);

  const customStyles = {
    overlay: {
      backgroundColor: '#08080b97',
     backdrop: 'static',
     keyboard: 'false'
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#181a24',
      width:'70vmin',
      height:'70vh',
      borderRadius:'20px',
      
    }
  };

 

  const questionMark =()=>{
    return <button onClick={()=>{ratingInfo.setOpenHowTo(true)}} style={{backgroundColor:'transparent', width:'42px', marginRight:'0', borderRadius:'20%'}}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    </button>
    
  }
  const checkMark =()=>{
    return <svg style={{width:'120px', color:'lightgreen', marginTop:'80px'}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
        <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
      </svg>
  }

  let data = 0;//will hold block ratings

  const ratingOptions = ()=>{

    return <div className='scores'>
        {/* {ratingInfo.setCloseRatingModal(false)} */}
        <div className = 'scoreText' >
          <div style={{display:'inline-flex', alignItems:'center', justifyContent:'center', marginTop:'20px'}}>
            <h3>
              Rate your performance for block 
            </h3>
            <p className='theBlockNum'> #{ratingInfo.blockNum}</p>
          </div>
          <p className='ratePerformance'>
            How to rate your performance{questionMark()}
          </p>
          <hr style={{width:'400px', margin:'0'}}></hr>
        </div>

        <div className='score' id='score10' onClick={()=>{data=data+10; console.log(data); ratingInfo.setHasUserRated(true); localStorage.setItem(ratingInfo.blockNum, data); console.log(localStorage.getItem(ratingInfo.blockNum)); }} >10 - Fantastic</div>
        <div className='score' id='score9' onClick={()=>{data=data+9; console.log(data); ratingInfo.setHasUserRated(true); localStorage.setItem(ratingInfo.blockNum, data); console.log(localStorage.getItem()); }} >9 - Great</div>
        <div className='score' id='score8' onClick={()=>{data=data+8; console.log(data); ratingInfo.setHasUserRated(true); localStorage.setItem(ratingInfo.blockNum, data); console.log(localStorage.getItem()); }} >8 - Good</div>
        <div className='score' id='score7' onClick={()=>{data=data+7; console.log(data); ratingInfo.setHasUserRated(true); localStorage.setItem(ratingInfo.blockNum, data); console.log(localStorage.getItem()); }} >7 - Decent</div>
        <div className='score' id='score6' onClick={()=>{data=data+6; console.log(data); ratingInfo.setHasUserRated(true); localStorage.setItem(ratingInfo.blockNum, data); console.log(localStorage.getItem()); }} >6 - Ok</div>
        <div className='score' id='score5' onClick={()=>{data=data+5; console.log(data); ratingInfo.setHasUserRated(true); localStorage.setItem(ratingInfo.blockNum, data); console.log(localStorage.getItem()); }} >5 - Not good</div>
        <div className='score' id='score4' onClick={()=>{data=data+4; console.log(data); ratingInfo.setHasUserRated(true); localStorage.setItem(ratingInfo.blockNum, data); console.log(localStorage.getItem()); }} >4 - Bad</div>
        <div className='score' id='score3' onClick={()=>{data=data+3; console.log(data); ratingInfo.setHasUserRated(true); localStorage.setItem(ratingInfo.blockNum, data); console.log(localStorage.getItem()); }} >3 - Very bad</div>
        <div className='score' id='score2' onClick={()=>{data=data+2; console.log(data); ratingInfo.setHasUserRated(true); localStorage.setItem(ratingInfo.blockNum, data); console.log(localStorage.getItem()); }} >2 - Really bad</div>
        <div className='score' id='score1' onClick={()=>{data=data+1; console.log(data); ratingInfo.setHasUserRated(true); localStorage.setItem(ratingInfo.blockNum, data); console.log(localStorage.getItem()); }} >1 - Terrible</div>
     
      </div>
      
  }
  const thankYouPage=()=>{
    return <div className='thankyoupage' style={{display:'flex', justifyContent: 'center', alignItems:'center', height:'650px', flexDirection:"column"}}>
      {/* {ratingInfo.setCloseRatingModal(true)} */}
      {checkMark()}
      <p style={{marginBottom:'80px', fontSize:'18.5px'}}>Performance Rated</p>
      <button style={{margin:'0', width:'100px'}} onClick={() => {  setModalOpen(false);}}>Close</button>  
    </div>
  }

  return (
    <div className='rating'>
     
        <div className='ratingdiv'>
        
            <Modal
          
              isOpen={modalOpen}
              onRequestClose={() => setModalOpen(false)}
              style={customStyles} 
            
              shouldCloseOnOverlayClick={false}
            > 
              {ratingInfo.hasUserRated?thankYouPage():ratingOptions()}
           </Modal>
            
        </div>
    </div>
  )
}

export default Rating