import React, { useContext, useState } from 'react';
import './CSS/Sidebar.css';
import SetterContext from '../SetterContext'; 
import Modal from "react-modal";
import {AiOutlineStock} from 'react-icons/ai'
import {ImStatsBars} from 'react-icons/im';
import {BsDoorOpenFill, BsDoorOpen} from 'react-icons/bs';
import { UserAuth } from '../../FirebaseAuth/AuthContext';
import GoogleButton from 'react-google-button';
import {AiOutlineSetting} from 'react-icons/ai';
import {FcGoogle} from 'react-icons/fc';
import Tooltip from "@material-ui/core/Tooltip";
import {withStyles} from "@material-ui/core/styles";
import {IoIosArrowBack} from 'react-icons/io'

const Sidebar = () => {
  const { googleSignIn, user } = UserAuth();

  // const [user, logOut] = UserAuth();

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
    }catch(error){
      console.log(error);
    }
  }

 

  const [modalOpen, setModalOpen] = useState(true);

  const customStyles = {
    overlay: {
      backgroundColor: 'transparent'
    }};

  const barInfo = useContext(SetterContext);

  const modalClose = ()=>{
    barInfo.setHideButton(false)
    barInfo.setSideBar(false)
    setModalOpen(false)
    
  }

  const TheTooltip = withStyles({
    arrow:{
      "&::before": {
        backgroundColor: "black",
      }
    },
    tooltip: {
      display:'flex',
      justifyContent:'center',
      alignItems:'center',
      color: "white",
      backgroundColor: "rgb(18, 18, 18)",
      maxWidth:'150px',
      height:'23px',
      fontSize:'13px',
      fontWeight:'bolder',
      fontFamily:'kalam',
      // marginBottom:'10px',
      letterSpacing:'1px'
      // boxShadow: '7px 10px 5px 0px rgba(0,0,0,0.75)',

    }
  })(Tooltip);
  return (
    <div className='sidebar'>
      <div className='sidebarcontent'>
        <div className='sidebarbutton'>
          <button onClick={()=>{{barInfo.sideBar === false? barInfo.setSideBar(true):barInfo.setSideBar(false)}; barInfo.setHideButton(false)}} 
            className='bars1'>
            
          < IoIosArrowBack style={{fontSize:'20px'}}/>
            
          </button>
        </div>
        
        <TheTooltip 
        title="My Data" 
        placement="top"
        arrow
       >
          <h3 className='text' onClick={()=>{barInfo.setData(true)}}>
            <svg className='lesvg' style={{width:'60px', height:'35px',alignItems:'center', justifyContent:'center', display:'inline-flex', flexDirection:'row',paddingTop:'5px'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </h3>
        </TheTooltip>

        <TheTooltip 
        title="My Tasks" 
        placement="bottom"
        arrow
       >
          <h3 className='text' onClick={()=>{barInfo.setOpenTask(true)}}>
            <svg className='lesvg' style={{width:'60px', height:'35px',alignItems:'center', justifyContent:'center', display:'inline-flex', flexDirection:'row',paddingTop:'5px'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </h3>
        </TheTooltip>

        <TheTooltip 
        title="Theme" 
        placement="bottom"
        arrow
       >
          <h3 className='text' onClick={()=>{barInfo.setOpenThemePage(true)}}>
            <svg className='lesvg' style={{width:'60px', height:'35px',alignItems:'center', justifyContent:'center', display:'inline-flex', flexDirection:'row', paddingTop:'6px'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </h3>
        </TheTooltip>

        <TheTooltip 
        title="The Rating System" 
        placement="bottom"
        arrow
       >
          <h3 className='text'  onClick={()=>{barInfo.setSynopsis(true)}}>
            <svg className='lesvg' style={{width:'60px', height:'35px',alignItems:'center', justifyContent:'center', display:'inline-flex', flexDirection:'row', paddingTop:'5px'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
            </svg>
          </h3>
        </TheTooltip>

        {user?.displayName ? 
        <TheTooltip 
        title="Logout" 
        placement="top"
        arrow
       >
          <h3 className='text' onClick={()=>{barInfo.setLogout(true)}}>
            <BsDoorOpen style={{fontSize:'30px',}}/>
          </h3>
        </TheTooltip>
        :
        <TheTooltip 
        title="Sign in with Google" 
        placement="top"
        arrow
       >
          <button className='google-button' onClick={handleGoogleSignIn}><FcGoogle className='google-icon'/>
          <label className='google-label'>Sign in with Google</label></button>
        </TheTooltip>
        }
      </div>

      
  </div>
  )
}

export default Sidebar