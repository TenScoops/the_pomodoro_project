import React, { useContext } from 'react';
import Modal from "react-modal";
import { useState } from 'react';
import SetterContext from './SetterContext';
import { UserAuth } from '../FirebaseAuth/AuthContext';
const Areyousure = () => {
  
  const [modalOpen, setModalOpen] = useState(true);
  const logout = useContext(SetterContext);

  const { logOut } = UserAuth();

  const cancelSession = () =>{
    logout.setShowParagraph(true)
    logout.setShowTimerPage(false);
    logout.setShowButtons(false);
    logout.setShowData(true);
    logout.setShowSetterPage(false);
    logout.setClicked(false);
    logout.setCancelTheSession(false);//reset button
    logout.blockNum = 1;//reset counter for block
    logout.setBlockNum(logout.blockNum);//reset counter for block
  }

  const handleSignOut = async () =>{
    try{
      await logOut()
    }catch(error){
      console.log(error)
    }
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
      height:'180px',
      width: '330px',
      borderColor:'gray',
      borderRadius:'20px',
    }
  };

  const closeModal = () =>{
    setModalOpen(false);
    logout.setLogout(false);
  }
  return (
    
      <Modal 
          isOpen={modalOpen}
          onRequestClose={() => closeModal()}
          style={customStyles} 
        >
          <div style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column'}}>
                <p style={{marginTop:'60px', fontSize:'15px', marginBottom:'45px'}}>
                    Are You sure you want to logout?
                </p>
            <div style={{display:'flex', justifyContent:'center', alignItems:'center'}}>

                <button style={{width:'40px', backgroundColor:'green', marginLeft:'25px', borderColor:'transparent'}} onClick={()=>{handleSignOut(); cancelSession(); closeModal()}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
          
                </button>

                <button style={{width:'40px',backgroundColor:'darkred',borderColor:'transparent'}} onClick={()=>{closeModal()}}>
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