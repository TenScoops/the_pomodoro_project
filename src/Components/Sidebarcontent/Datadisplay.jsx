import React, { useContext } from 'react';
import Modal from "react-modal";
import { useState } from 'react';
import './Data.css';
import SetterContext from '../SetterContext';
// import './images/5996460.jpg';

const Data = () => {
  const [modalOpen, setModalOpen] = useState(true);
  // const [shouldOpen, setShouldOpen] = useState(true)
  const dataInfo = useContext(SetterContext);

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
      width: '800px',
      borderRadius:'50px',
      // borderColor:'transparent'
      // backgroundRepeat: 'no-repeat',
      // backgroundAttachment:'fixed',
      // backgroundImage: `url(${'/5996460.jpg'})` ,
      //  backgroundImage: "url(/images/background3.jpg)" 
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
           <div style={{height:'100%', width:'100%'}} className='modals' >

           
          {/* <img style={{width:'500px', height:'500px'}}src="C:\Users\payre\Desktop\the_pomodoro_project\src\Images\pexels-fwstudio-129731.jpg" alt='images'/> */}

          {/* <p style={{width:'100px'}}className='lorem'>
            <p> Session Completion score:</p>
            <p> Sessions completed:</p>
            <p> Sessions not completed:</p>
            <p> Performance Score:</p>
          </p>  */}
          </div>
        </Modal>
        
    
  )
}

export default Data