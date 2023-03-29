import React from 'react';
import Modal from "react-modal";
import { useState, useContext } from 'react';
import SetterContext from './SetterContext';
// Modal.setAppElement("div");

const Howtorate = () => {
  const howToRateInfo = useContext(SetterContext);
  const [modalOpen, setModalOpen] = useState(true);

  

  // function width() {
  //   if (typeof window !== 'undefined') {
  //        if(window.innerWidth < 900 ){
  //          return '80vw';
  //         } 
  //   }
  //   return '40vw';
  // }
  // function height() {
   
  //   return ;
  // }

  const customStyles = {
    overlay: {
      backgroundColor: '#08080b97',
     //#1e212d82
     //#1e212da3
     //#08080b97
    //  backdrop:'static'
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#181a24',
      height:'65vh',
      width: '80vmin',
      // minWidth:'40vw',
      borderRadius:'12px',
      padding:'0',
      position:'relative'
      
    }
  };

  const closeModal=()=>{
    setModalOpen(false)
    howToRateInfo.setOpenHowTo(false)
  }

  return (
    
    <Modal
            isOpen={modalOpen}
            onRequestClose={() => closeModal()}
            style={customStyles} 
          >
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center'}} >
            
                <button onClick={()=>{closeModal()}} className='close'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                    <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
                </svg>
                </button>

                <div className='lorem' >
                    <h2 style={{marginTop:'50px'}}>How to rate your performance</h2>
                    <hr style={{width:'200px', margin:'0'}}/>
                    <p>If you are working 45 minutes per or more per block, you should base your ratings on times distracted, productivity, 
                        and how long you were</p>
                    <p>IF you are working less than 45 minutes per block, rate based on how often you were distracted</p>
                    <p>If you are working by session, then you should base it</p>
                </div>
    

            </div>

      </Modal>
    
  )
}

export default Howtorate