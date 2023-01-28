import React from 'react';
import SetterContext from '../SetterContext';
import { useContext, useState } from 'react';
import Modal from "react-modal";
import './CSS/Login.css'
// import { useState } from 'react';

const Login = () => {
    const [modalOpen, setModalOpen] = useState(true);
    const[signup,setSignup] = useState(false);
    // const [shouldOpen, setShouldOpen] = useState(true)
    const loginInfo = useContext(SetterContext);

    const customStyles = {
        overlay: {
            backgroundColor: '#08080b97'
        },
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#181a24',
            height:'500px',
            width: '500px',
            borderRadius:'35px',
            padding:'0'
        }
    };

    const closeModal = () =>{
      setModalOpen(false)
      loginInfo.setLoginOpen(false)
      }  


    const login=()=>{
      return<div style={{display:'flex', justifyContent:'center', alignItems:'center',flexDirection:'column', width:'100%', height:'100%'}}>
          <label style={{marginRight:'125px'}}>Username/Email:</label>
          <input type="text" placeholder="Enter Username" name="username" required />
          <label style={{marginRight:'170px'}}>Password:</label>
          <input type="password" placeholder="Enter Password" name="password" required />
          <div style={{display:'inline-flex'}}> <button className='loginbutton'>Login</button> <button onClick={()=>{setSignup(true)}} className='loginbutton'>Sign Up</button></div>
      </div>
  }
    const signUpPage=()=>{
      return <div style={{display:'flex', justifyContent:'center', alignItems:'center',flexDirection:'column', width:'100%', height:'100%'}}>
                  <label style={{marginRight:'160px'}}>Your Email:</label>
                  <input type="text" placeholder="Enter Email" name="email" required />

                  <label style={{marginRight:'170px'}}>Username:</label>
                  <input type="text" placeholder="Enter Username" name="createusername" required />

                  <label style={{marginRight:'170px'}}>Password:</label>
                  <input type="password" placeholder="Enter Password" name="createpassword" required />

                  <label style={{marginRight:'110px'}}>Re-enter Password:</label>
                  <input type="password" placeholder="Re-enter Password" name="createrepassword" required />

                  <div style={{display:'inline-flex'}}> <button className='loginbutton' onClick={()=>{setSignup(false)}}>Back</button> 
                  <button className='loginbutton'>Confirm</button> </div>
            </div>
    }

  return (
    <Modal 
          isOpen={modalOpen}
          onRequestClose={() => closeModal()}
          style={customStyles} 
        >
           <div style={{height:'100%', width:'100%'}} >

            {signup?signUpPage():login()}
            
          </div>
        </Modal>
  )
}

export default Login