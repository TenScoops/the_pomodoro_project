import React from 'react';
import Modal from "react-modal";
import { useState, useContext } from 'react';
import SetterContext from '../SetterContext';
import './CSS/Synopsis.css';
Modal.setAppElement("div");
const Synopsis = () => {
  const synopInfo = useContext(SetterContext);
  const [modalOpen, setModalOpen] = useState(true);

  

  function modalWidth() {
    if (typeof window !== 'undefined') {
        // if()
        return window.innerWidth < 700;
    }
    return false;
  }
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
      height:'800px',
      width: modalWidth()? '450px' : '650px',
      borderRadius:'12px',
      padding:'0'
      
    }
  };

  const closeModal=()=>{
    setModalOpen(false)
    synopInfo.setSynopsis(false)
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
              
                  <h2>Be productive but do it the right way!</h2>
                  <h2>The Rating System</h2>

                  <p>You are more likely to do better if you hold yourself accountable to your bad performances.
                I created this rating system to give you the incentive to scrutinize your own performances
                  and in turn help you see growth in productivity and work ethic over time. I hope this helps you achieve your goals in life.</p>

                  <h2>How this works?</h2>
                  
                  <p>Pomodoro allows you to work in 25 minute intervals with breaks in between. But this app allows you to set your own 
                  session time, with however many breaks you want, and however many minutes per break as long as your total break time does 
                  not exceed your total work time for the sake of productivity. And at the end 
                      of every session you will have a session score, this will be based on your ratings.</p>

                  <p>You will complete your session in blocks and after each block you will be asked to rate your performance.
                  Every rating per block will be added to your data, it will be recorded in the section of days, months, and
                      years so you can see your own progress. You can check your progress in the "my data" section in the side bar. 
                  </p>
                      {/* <p>You dictate what is a 10/10 performance and you dictate what is a 5/10 performance.</p> */}
                  <h2>How is the performance score calculated?</h2>
                  <p>You will find your performance score in the "My Data" section. Your performance score will be calculated as ratings/number of blocks. 
                    Soon how many times you use the pause button as well as how long your session is paused will also affect your performance score.
                  </p>
                  <p style={{marginBottom:'0'}}>The more honest you are the better your results and the more you'll get out of this app!</p>
                      
                  <p style={{margin:'5px', fontSize:'15px'}}>*Not yet supported on mobile*</p>
            
                </div>
      
                    {/* <button onClick={() => setModalOpen(false)}>Close Modal</button> */}

            </div>

      </Modal>
    
  )
}

export default Synopsis