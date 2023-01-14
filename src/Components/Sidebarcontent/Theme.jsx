import React, { useContext } from 'react';
import Modal from "react-modal";
import { useState } from 'react';
import './Datadisplay.css';
import SetterContext from '../SetterContext';
// import './images/5996460.jpg';

const Theme = () => {
  const [modalOpen, setModalOpen] = useState(true);
  const themeInfo = useContext(SetterContext);

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
      width: '1200px',
      borderRadius:'50px',
      padding:'0'
      
    }
  };

  const closeModal = () =>{
    setModalOpen(false)
    themeInfo.setOpenThemePage(false)
  }
  return (
    
      <Modal 
          isOpen={modalOpen}
          onRequestClose={() => closeModal()}
          style={customStyles} 
        >
           <div style={{height:'100%', width:'100%', display:'flex', justifyContent:'center', alignItems:'center'}} className='modals' >
              <p style={{fontSize:'100px', margin:'0'}}>COMING SOON</p>
          </div>
        </Modal>
        
    
  )
}

export default Theme