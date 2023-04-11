import React from 'react';
import Modal from "react-modal";
import { useState, useContext } from 'react';
import SetterContext from './SetterContext';
// Modal.setAppElement("div");

const Howtorate = () => {
  const howToRateInfo = useContext(SetterContext);
  const [modalOpen, setModalOpen] = useState(true);
  
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

                <div className='lorem + how-to-rate' >
                    <h2 style={{marginTop:'50px'}}>How to rate your performance</h2>
                    <hr style={{width:'200px', margin:'0'}}/>
                    

                    <h3>Rate by block</h3>
                    <p>You've selected the rate by block option at the create a session screen.</p>
              
                   <p> If you are working 45 minutes or more per block, you should base your ratings on
                    times distracted
                    how productive you were,
                    loss of focus
                    If you are working less than 45 minutes per block, Base your ratings on:
                    times distracted
                    loss of focus
                    </p>
                    <h3>Rate by session</h3>
                    <p>You've selected the rate by session option at the create a session screen.</p>
                    <p>base your rating on how distracted you were, 
                      how often you lost focus,
                      how productive you were during your session.
                      </p>
                    <h3>Pioneer</h3>
                    <p>You've selected either rate by block or rate by session</p>
                    <p>You make your own rules and you set your own standards: instead of following a blueprint, 
                      you decide to make your own. Maybe your standards for yourself are very high 
                      and the current blueprint doesn't suit you, and that's fine. This app is not meant 
                      to constrain you but it is ultimately a tool you use for self-improvement. 
                      </p>
                </div>
    

            </div>

      </Modal>
    
  )
}

export default Howtorate