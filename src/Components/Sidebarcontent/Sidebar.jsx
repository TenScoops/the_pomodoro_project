import React, { useContext, useState } from 'react';
import './CSS/Sidebar.css';
import SetterContext from '../SetterContext'; 
import Modal from "react-modal";



const Sidebar = () => {
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
  return (
    <div className='sidebar'>
    {/* <Modal className='sidebar' 
    style={customStyles}
    isOpen={modalOpen}
    onRequestClose={()=>modalClose()}
    nested> */}
      {/* <div className='sidebarbutton'>
        <button onClick={()=>{(barInfo.sideBar === false? barInfo.setSideBar(true):barInfo.setSideBar(false)); barInfo.setHideButton(false)}} className='bars1'>
          
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
            <path fill-rule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
          </svg>
          
        </button>
      </div> */}
      <div className='sidebarcontent'>
        {/* <button className='home'>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
          <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
          <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
        </svg>

        </button> */}
        <h2 style={{marginTop:'150px', marginBottom:'0', marginLeft:'20px', padding:'0'}}>Honest</h2>
        <h1 className='h1-text' style={{marginTop:'0'}} >
          <svg style={{width:'60px', height:'38px',alignItems:'center', justifyContent:'center', display:'inline-flex', flexDirection:'row'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
            Pomodoro
        </h1> 
            <hr className='breakpoint' style={{width : "200px"}}/>
        
        <h3 className='text' onClick={()=>{barInfo.setData(true)}}>
          <svg style={{width:'60px', height:'38px',alignItems:'center', justifyContent:'center', display:'inline-flex', flexDirection:'row'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          My Data
        </h3>

        {/* <h3 className='text' onClick={()=>{barInfo.setOpenTask(true)}}>
        <svg style={{width:'60px', height:'38px',alignItems:'center', justifyContent:'center', display:'inline-flex', flexDirection:'row'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
           My Tasks  
        </h3> */}


        <h3 className='text'  onClick={()=>{barInfo.setSynopsis(true)}}>
          <svg style={{width:'60px', height:'38px',alignItems:'center', justifyContent:'center', display:'inline-flex', flexDirection:'row'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
          </svg>
          The Rating System
        </h3>

        <h3 className='text' onClick={()=>{barInfo.setOpenThemePage(true)}}>
          <svg style={{width:'60px', height:'38px',alignItems:'center', justifyContent:'center', display:'inline-flex', flexDirection:'row'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          Theme(Coming Soon)
        </h3>

        <h3 className='text' id='firebaseui-auth-container' onClick={()=>{barInfo.setLoginOpen(true)}}>
          <svg style={{width:'60px', height:'38px',alignItems:'center', justifyContent:'center', display:'inline-flex', flexDirection:'row'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
            Login
        </h3>

      </div>
  </div>
  )
}

export default Sidebar