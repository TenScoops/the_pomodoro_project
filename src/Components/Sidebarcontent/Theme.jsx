import React, { useContext } from 'react';
import Modal from "react-modal";
import { useState } from 'react';
import './CSS/Datadisplay.css';
import SetterContext from '../SetterContext';
// import './images/5996460.jpg';

const Theme = () => {
  const [modalOpen, setModalOpen] = useState(true);
  const themeInfo = useContext(SetterContext);

  function width() {
    if (typeof window !== 'undefined') {
         if(window.innerWidth < 700 ){
           return '450px';
          } 
    }
    return '650px';
  }
  function height() {
    if (typeof window !== 'undefined') {
         if(window.innerHeight < 700 ){
           return '500px';
          } 
    }
    return '800px';
  }

  const customStyles = {
    overlay: {
      backgroundColor: '#08080b97',
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#181a24',
      height:height(),
      width: width(),
      borderRadius:'10px',
      padding:'0'
      
    }
  };

  const closeButton = () =>{
    return <button onClick={()=>{closeModal()}} className='close'>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
      <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
    </svg>
  </button>
  }

  const closeModal = () =>{
    setModalOpen(false)
    themeInfo.setOpenThemePage(false)
  }
  return (
    
      <Modal 
          closeTimeoutMS={120}
          isOpen={modalOpen}
          onRequestClose={() => closeModal()}
          style={customStyles} 
        >
           <div style={{height:'100%', width:'100%', display:'flex', justifyContent:'center', alignItems:'center'}} >
              {closeButton()}
              {/* <p style={{fontSize:'50px', margin:'0'}}>COMING SOON</p> */}
          </div>
        </Modal>
        
    
  )
}

export default Theme