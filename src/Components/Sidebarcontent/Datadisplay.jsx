import React, { useContext } from 'react';
import Modal from "react-modal";
import { useState } from 'react';
import './CSS/Datadisplay.css';
import SetterContext from '../SetterContext';
// import {Userdata} from './Userdata';
import BarChart from './BarChart';

const Data = () => {
  const [modalOpen, setModalOpen] = useState(true);
  const dataInfo = useContext(SetterContext);

  // Chart.register(CategoryScale);

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
      backgroundColor: 'rgba(255, 255, 255,0.95)',
      height:'800px',
      width: '800px',
      borderRadius:'10px',
      padding:'0'
      
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
           <div style={{height:'100%', width:'100%'}}  >

            {/* <button onClick={()=>{closeModal()}} className='close'>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
              </svg>
            </button> */}

            <BarChart/>
            
            
          </div>
        </Modal>
        
    
  )
}

export default Data