import React, { useContext } from 'react';
import Modal from "react-modal";
import { useState } from 'react';
import './CSS/Chartdisplay.css';
import SetterContext from '../SetterContext';
import BarChart from './BarChart';

const Data = () => {
  const [modalOpen, setModalOpen] = useState(true);
  const dataInfo = useContext(SetterContext);



  const customStyles = {
    overlay: {
      backgroundColor: 'transparent',
 
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(255, 255, 255)',
      height:'75vh',
      width: '83vmin',
      borderRadius:'20px',
      padding:'0',
      border:'solid 3px black'
      
    }
  };

  const closeModal = () =>{
    setModalOpen(false)
    dataInfo.setData(false)
  } 

  return (
    
      <Modal 
          isOpen={modalOpen}
          onRequestClose={() => closeModal()}
          style={customStyles} 
        >
          <button onClick={()=>{closeModal()}} className='Chart-close-button'>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
              </svg>
            </button>

            <BarChart/>
            
            
          {/* </div> */}
        </Modal>
        
    
  )
}

export default Data