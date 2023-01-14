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
     //#1e212d82
     //#1e212da3
     //#08080b97
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
      borderRadius:'32px',
      
      // borderColor:'transparent'
    }
  };

  let data = 0;//will hold block ratings

  const ratingOptions = ()=>{

    return <div className='scores'>
        <div className = 'scoreText' style={{justifyContent: 'center', display: 'flex', 
        flexDirection:'column', alignItems:'center', fontSize:'25px'}}>
          <p style={{display:'flex'}}>Rate your performance for block <p style={{marginLeft:'10px', fontSize:'35px', backgroundColor:'white', color:'black', borderRadius:'40px'}}> #{ratingInfo.blockNum}</p></p>
          <p style={{fontSize:'18px', marginBottom:'25px'}}>Be as honest as possible!!</p>
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

  // const finishedPage =()=>{
  //   return <div>
  //       Session Complete!
  //       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  //         <path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
  //       </svg>
  //   </div>
  // }

  return (
    <div className='rating'>
        {/* <div className='headerating'>
            <h1>Please rate performance for block #1</h1>
            <p><i>*Take into account distractions, losing focus, and general productivity. Decision cannot be undone.*</i></p>
        </div> */}
        <div className='ratingdiv'>
        
            <Modal
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