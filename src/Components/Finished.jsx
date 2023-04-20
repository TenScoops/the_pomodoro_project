import React, { useContext } from 'react'
import SetterContext from './SetterContext'
import './CSS/Finished.css'
import {ImStatsBars} from 'react-icons/im';

const Finished = () => {
    const finishedInfo = useContext(SetterContext);
    const startNewSession = () =>{
        // finishedInfo.setShowParagraph(false)
        finishedInfo.setShowButtons(false);//resetting to default
        finishedInfo.setShowData(true);//resetting to default
        finishedInfo.setShowSetterPage(true);
        finishedInfo.setSessionComplete(false);
        finishedInfo.setClicked(false);
        finishedInfo.setShowClock(false);
      
      }
      function statIcon(){
        return <svg style={{width:'25px', height:'18px',alignItems:'center', justifyContent:'center', display:'inline-flex', flexDirection:'row'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
      }
      function thumbsUp(){
        return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
        <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z" />
        </svg>
      }
  return (
    <div className='divfinished'>
      <div className='finished' >
          <div className='thumbsup' >
            {thumbsUp()}
          </div>
          <p style={{fontSize:'25px', marginTop:'0', marginBottom:'10px'}}>Session Complete!</p>
          {/* <p style={{fontSize:'18px',marginTop:'0', marginBottom:'10px', }}>Your Session Score Is: </p> */}
          {/* <div className='thescores' title='Your Productivity Score'>
            <p>9/10</p>
          </div> */}
          <div style={{display:'flex', justifyContent:'center', alignItems:'center',width:'220px'}}>
          <p style={{ marginBottom:'40px', fontSize:'13.5px', marginLeft:'13px'}}>
            Take a look at the "{statIcon()}My Data" section to view your progress. </p>
          </div>
          <button className='startNewSession' onClick={()=>{startNewSession()}}>Start a new session</button>
          
      </div>
    </div>
  )
}

export default Finished