import React, { useContext } from 'react';
import SetterContext from './SetterContext';
import Startsession from './Buttons/Startsession';
import Synopsis from './Sidebarcontent/Synopsis';
import { UserAuth } from '../FirebaseAuth/AuthContext';


const Contents = () => {
  const setterInfo = useContext(SetterContext);

  const {user} = UserAuth();
  
  const questionMark =()=>{
    return <button title="The rating system" onClick={()=>{setterInfo.setSynopsis(true)}} style={{backgroundColor:'transparent', width:'38px', marginRight:'0'}}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    </button>
  }

  return (
    <div>
        <div className='Content'>
            <div className='text-div' style={{display:'flex', flexDirection:'column', letterSpacing:'1px'}}>

                {user?.displayName? <p style={{}} className='content-text'>{questionMark()}Hi {user?.displayName}!</p> 
                  :
                <p className='content-text' style={{ }}>
                  Do you find yourself struggling with productivity? {questionMark()}  
                </p>
                }
            </div>

            <div className='divsession'>
              <Startsession onClick={() => {setterInfo.setShowSetterPage(true); setterInfo.setShowParagraph(false)}}/>
            </div>
        </div>
    </div>
  )
}

export default Contents