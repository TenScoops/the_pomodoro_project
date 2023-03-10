import React, { useContext } from 'react';
import Modal from "react-modal";
import { useState } from 'react';
import SetterContext from './SetterContext';

const Areyousure = () => {
    const [modalOpen, setModalOpen] = useState(true);
  // const [shouldOpen, setShouldOpen] = useState(true)
  const areYouSureInfo = useContext(SetterContext);

  const cancelSession = () =>{
    areYouSureInfo.setShowParagraph(true)
    areYouSureInfo.setShowTimerPage(false);
    areYouSureInfo.setShowButtons(false);
    areYouSureInfo.setShowData(true);
    areYouSureInfo.setShowSetterPage(false);
    areYouSureInfo.setCancelTheSession(false);//reset button
    areYouSureInfo.blockNum = 1;//reset counter for block
    areYouSureInfo.setBlockNum(areYouSureInfo.blockNum);//reset counter for block
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
      height:'200px',
      width: '430px',
      borderColor:'gray',
      borderRadius:'20px',
      
      // backgroundRepeat: 'no-repeat',
      // backgroundAttachment:'fixed',
      // backgroundImage: `url(${'/5996460.jpg'})` ,
      //  backgroundImage: "url(/images/background3.jpg)" 
    //   padding:'0'
      
    }
  };

  const closeModal = () =>{
    setModalOpen(false);
    areYouSureInfo.setCancelTheSession(false);
  }
  return (
    
      <Modal 
          isOpen={modalOpen}
          onRequestClose={() => closeModal()}
          style={customStyles} 
        >
          <div style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
                <p style={{marginTop:'60px', fontSize:'20px', marginBottom:'45px'}}>
                    Are You sure you want to cancel your session?
                </p>
            <div style={{display:'flex', justifyContent:'center', alignItems:'center'}}>

                <button style={{width:'50px', backgroundColor:'green', marginLeft:'25px'}} onClick={()=>{cancelSession()}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
          
                </button>

                <button style={{width:'50px',backgroundColor:'darkred'}} onClick={()=>{setModalOpen(false); areYouSureInfo.setCancelTheSession(false)}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
            </div>

          </div>
        </Modal>
        
    
  )
}

export default Areyousure