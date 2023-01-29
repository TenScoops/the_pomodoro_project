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
      height:'670px',
      width: '500px',
      borderRadius:'20px',
      
    }
  };

  let data = 0;//will hold block ratings

  const questionMark =()=>{
    return <button onClick={()=>{}} style={{backgroundColor:'transparent', width:'42px', marginRight:'0'}}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    </button>
  }

  const ratingOptions = ()=>{

    return <div className='scores'>
        <div className = 'scoreText' style={{justifyContent: 'center', display: 'flex', 
        flexDirection:'column', alignItems:'center', fontSize:'25px'}}>
          <p style={{display:'flex'}}>Rate your performance for block <p style={{marginLeft:'10px', fontSize:'35px', backgroundColor:'white', color:'black', borderRadius:'40px', marginBottom:'2px'}}> #{ratingInfo.blockNum}</p></p>
          <p style={{fontSize:'18px', marginBottom:'25px', marginBottom:'10px', display:'flex', justifyContent:'center'}}>How to rate your performance{questionMark()}</p>
          <hr style={{width:'400px', margin:'0'}}></hr>
          </div>
        <div className='score' id='score10' onClick={()=>{data=data+10; console.log(data); ratingInfo.setHasUserRated(true)}} >10 - Fantastic</div>
        <div className='score' id='score9' onClick={()=>{data=data+9; console.log(data); ratingInfo.setHasUserRated(true)}} >9 - Great</div>
        <div className='score' id='score8' onClick={()=>{data=data+8; console.log(data); ratingInfo.setHasUserRated(true)}} >8 - Good</div>
        <div className='score' id='score7' onClick={()=>{data=data+7; console.log(data); ratingInfo.setHasUserRated(true)}} >7 - Decent</div>
        <div className='score' id='score6' onClick={()=>{data=data+6; console.log(data); ratingInfo.setHasUserRated(true)}} >6 - Ok</div>
        <div className='score' id='score5' onClick={()=>{data=data+5; console.log(data); ratingInfo.setHasUserRated(true)}} >5 - Not good</div>
        <div className='score' id='score4' onClick={()=>{data=data+4; console.log(data); ratingInfo.setHasUserRated(true)}} >4 - Bad</div>
        <div className='score' id='score3' onClick={()=>{data=data+3; console.log(data); ratingInfo.setHasUserRated(true)}} >3 - Very bad</div>
        <div className='score' id='score2' onClick={()=>{data=data+2; console.log(data); ratingInfo.setHasUserRated(true)}} >2 - Really bad</div>
        <div className='score'id='score1' onClick={()=>{data=data+1; console.log(data); ratingInfo.setHasUserRated(true)}} >1 - Terrible</div>
      </div>
  }
  const thankYouPage=()=>{
    return <div className='thankyoupage' style={{display:'flex', justifyContent: 'center', alignItems:'center', height:'650px', flexDirection:"column"}}>

      <svg style={{width:'120px', color:'lightgreen', marginTop:'80px'}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
        <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
      </svg>
      <p style={{marginBottom:'80px', fontSize:'18.5px'}}>Performance Rated</p>
      <button style={{margin:'0', width:'100px'}} onClick={() => {setModalOpen(false)}}>Close</button>  
    </div>
  }

  return (
    <div className='rating'>
        {/* <div className='headerating'>
            <h1>Please rate performance for block #1</h1>
            <p><i>*Take into account distractions, losing focus, and general productivity. Decision cannot be undone.*</i></p>
        </div> */}
        <div className='ratingdiv'>
        
            <Modal
              // closeTimeoutMS={120}
              isOpen={modalOpen}
              onRequestClose={() => setModalOpen(false)}
              style={customStyles} 
              // closeTimeoutMS={5000}
              shouldCloseOnOverlayClick={false}
            > 
              {ratingInfo.hasUserRated?thankYouPage():ratingOptions()}
           </Modal>
            
        </div>
    </div>
  )
}

export default Rating